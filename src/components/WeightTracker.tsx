"use client";

import React, {useCallback, useEffect, useRef, useState} from "react";
import {FaSpinner} from "react-icons/fa";
import { Timestamp } from "firebase/firestore";

import { DayUpdateData, NutritionGoals, WeekData } from "../domain";
import WeightChart from "./WeightChart";
import Login from "./Login";
import GoalsModal from "./GoalsModal";
import WeekList from "./Weekly/WeekList";
import Header from "./Header";
import useSyncStatus from "../hooks/useSyncStatus";
import {useAuth} from "../hooks/useAuth";
import TrainingModal from "./Training/TrainingModal";
import {Training} from "../domain";
import { FirestoreDaysRepository, FirestoreProfileRepository, FirestoreTrainingsRepository } from "../repositories/firestore";
import { subscribeWeeklyData, saveDayData as ucSaveDayData, subscribeNutritionGoalsOrInit, saveNutritionGoals as ucSaveNutritionGoals, subscribeTrainings, groupTrainingsByDay } from "../usecases";

const WeightTracker: React.FC = () => {
  const [weeklyData, setWeeklyData] = useState<WeekData[]>([]);
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const trainingsRef = useRef<{ id: string; data: Training }[]>([]);
  const [trainingsVersion, setTrainingsVersion] = useState(0);

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

    const daysRepo = new FirestoreDaysRepository();
    const profileRepo = new FirestoreProfileRepository();
    const trainingsRepo = new FirestoreTrainingsRepository<Training>();

    const unsubscribeDays = subscribeWeeklyData(user.uid, daysRepo, (weeks) => {
      setWeeklyData(weeks);
      setIsLoading(false);
    }, { onPendingWrites: registerPendingWrites });

    const unsubscribeGoals = subscribeNutritionGoalsOrInit(user.uid, profileRepo, (goals) => {
      setNutritionGoals(goals);
    }, { onPendingWrites: registerPendingWrites });

    const unsubscribeTrainings = subscribeTrainings<Training>(user.uid, trainingsRepo, (arr) => {
      console.log("Trainings updated", arr);
      const sorted = [...arr].sort((a, b) => (b.data.startedAt.toMillis() - a.data.startedAt.toMillis()));
      trainingsRef.current = sorted;
      setTrainingsVersion(v => v + 1);
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
      await ucSaveDayData(user.uid, new FirestoreDaysRepository(), date, updatedDay);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  }, [user]);

  const handleSaveNutritionGoals = useCallback(async (newGoals: NutritionGoals[]) => {
    if (!user) return;
    try {
      await ucSaveNutritionGoals(user.uid, new FirestoreProfileRepository(), newGoals);
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
    const repo = new FirestoreTrainingsRepository<Training>();
    const id = repo.newTrainingId(user.uid);
    const isoDay = new Date().toISOString().split("T")[0];
    const data = {
      day: isoDay,
      startedAt: Timestamp.now(),
      endedAt: Timestamp.now(),
    } as Training;
    try {
      await repo.saveTraining(user.uid, id, data);
      setEditingTraining({ id, data });
    } catch (e) {
      console.error("Failed to create training", e);
    }
  };

  const trainingsByDay = React.useMemo(() => {
    return groupTrainingsByDay(trainingsRef.current);
  }, [trainingsVersion]);

  const handleOpenTrainingById = (trainingId: string): void => {
    const found = trainingsRef.current.find(t => t.id === trainingId) || null;
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
                repo={new FirestoreTrainingsRepository<Training>()}
            />
        )}
    </main>
  );
};

export default WeightTracker;
