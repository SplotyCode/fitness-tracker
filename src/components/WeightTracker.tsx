"use client";

import React, {useCallback, useEffect, useState} from "react";
import {FaSpinner} from "react-icons/fa";
import { Timestamp } from "firebase/firestore";

import { DayUpdateData, NutritionGoals, WeekData } from "../domain/nutrition";
import WeightChart from "./WeightChart";
import Login from "./Login";
import GoalsModal from "./GoalsModal";
import WeekList from "./Weekly/WeekList";
import Header from "./Header";
import useSyncStatus from "../hooks/useSyncStatus";
import {useAuth} from "../hooks/useAuth";
import TrainingModal from "./Training/TrainingModal";
import {Training} from "../domain/training";
import { subscribeWeeklyData, saveDayData as ucSaveDayData } from "../usecases/weekly_data";
import { subscribeNutritionGoalsOrInit, saveNutritionGoals as ucSaveNutritionGoals } from "../usecases/profile_subscriptions";
import { subscribeTrainings, groupTrainingsByDay } from "../usecases/trainings_feed";
import {newTrainingId, saveTraining} from "../repositories/trainings";

const WeightTracker: React.FC = () => {
  const [weeklyData, setWeeklyData] = useState<WeekData[]>([]);
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals[]>([]);
  const [trainings, setTrainings] = useState<{ id: string; data: Training }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { syncStatus, registerPendingWrites, clearPendingWrites } = useSyncStatus();
  const {user, isLoading: authLoading, handleSignIn, handleSignOut} = useAuth();

  useEffect(() => {
    if (!user) {
      setWeeklyData([]);
      setNutritionGoals([]);
      return;
    }

    setIsLoading(true);
    clearPendingWrites();

    const unsubscribeDays = subscribeWeeklyData(user.uid, (weeks) => {
      setWeeklyData(weeks);
      setIsLoading(false);
    }, { onPendingWrites: registerPendingWrites });

    const unsubscribeGoals = subscribeNutritionGoalsOrInit(user.uid, (goals) => {
      setNutritionGoals(goals);
    }, { onPendingWrites: registerPendingWrites });

    const unsubscribeTrainings = subscribeTrainings(user.uid, (arr) => {
      console.log("Trainings updated", arr);
      const sorted = [...arr].sort((a, b) => (b.data.startedAt.toMillis() - a.data.startedAt.toMillis()));
      setTrainings(sorted);
    }, { onPendingWrites: registerPendingWrites });

    return () => {
      unsubscribeDays();
      unsubscribeGoals();
      unsubscribeTrainings();
    };
  }, [user, clearPendingWrites, registerPendingWrites]);

  const handleSaveDayData = useCallback(async (date: string, updatedDay: DayUpdateData) => {
    if (!user) {
      console.error("Cannot save data: no user logged in.");
      return;
    }
    try {
      await ucSaveDayData(user.uid, date, updatedDay);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  }, [user]);

  const handleSaveNutritionGoals = useCallback(async (newGoals: NutritionGoals[]) => {
    if (!user) return;
    try {
      await ucSaveNutritionGoals(user.uid, newGoals);
    } catch (err) {
      console.error("Error saving nutrition goals:", err);
    }
  },
  [user]
  );
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState<{ id: string; data: Training } | null>(null);

  const handleOpenNewTraining = async (): Promise<void> => {
    if (!user) return;
    const id = newTrainingId(user.uid);
    const isoDay = new Date().toISOString().split("T")[0];
    const data = {
      day: isoDay,
      startedAt: Timestamp.now(),
      endedAt: Timestamp.now(),
    } as Training;
    try {
        console.log("Creating training", id, data);
      await saveTraining(user.uid, id, data);
      console.log("Training created", id, data);
      setEditingTraining({ id, data });
    } catch (e) {
      console.error("Failed to create training", e);
    }
  };

  const trainingsByDay = React.useMemo(() => {
    return groupTrainingsByDay(trainings);
  }, [trainings]);

  const handleOpenTrainingById = (trainingId: string): void => {
    const found = trainings.find(t => t.id === trainingId) || null;
    if (found) {
      setEditingTraining(found);
    }
  };

  if (authLoading || isLoading) {
    return (
      <main className="p-8 min-h-screen text-white bg-neutral-900 flex justify-center items-center">
        <div className="flex items-center gap-3">
          <FaSpinner className="text-2xl animate-spin" />
          <p className="text-xl">Loading...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return <Login onSignIn={handleSignIn} />;
  }

  return (
    <main className="p-8 min-h-screen text-white bg-neutral-900">
      <div className="flex flex-col gap-8 mx-auto my-0 max-w-screen-xl">
        <section className="p-4 rounded-3xl border border-solid bg-white bg-opacity-10 border-white border-opacity-10">
          <Header
            user={user}
            syncStatus={syncStatus}
            onShowGoals={() => setShowGoalsModal(true)}
            onAddTraining={handleOpenNewTraining}
            onSignOut={handleSignOut}
          />
          <WeightChart weeks={weeklyData} targetLossRates={[1, 2]}/>
        </section>
        <WeekList
          weeks={weeklyData}
          onSaveDay={handleSaveDayData}
          goals={nutritionGoals}
          trainingsByDay={trainingsByDay}
          onOpenTrainingById={handleOpenTrainingById}
        />
      </div>
      <GoalsModal
        open={showGoalsModal}
        onClose={() => setShowGoalsModal(false)}
        goals={nutritionGoals}
        onChange={handleSaveNutritionGoals}
      />
        {editingTraining && (
            <TrainingModal
                userId={user.uid}
                training={editingTraining}
                onClose={() => setEditingTraining(null)}
                trainings={trainings}
            />
        )}
    </main>
  );
};

export default WeightTracker;
