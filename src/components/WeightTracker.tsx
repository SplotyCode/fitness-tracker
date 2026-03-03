"use client";

import React, {useCallback, useEffect, useState} from "react";
import {FaSpinner} from "react-icons/fa";
import {Timestamp} from "firebase/firestore";

import {DayUpdateData, NutritionGoals, WeekData} from "../domain/nutrition";
import {ProfileSettings, defaultProfileSettings} from "../domain/profile";
import WeightChart from "./WeightChart";
import Login from "./Login";
import GoalsModal from "./GoalsModal";
import WeekList from "./Weekly/WeekList";
import Header from "./Header";
import useSyncStatus from "../hooks/useSyncStatus";
import {useAuth} from "../hooks/useAuth";
import TrainingModal from "./Training/TrainingModal";
import CardioModal from "./Training/CardioModal";
import {Training} from "../domain/training";
import {subscribeWeeklyData, saveDayData as ucSaveDayData} from "../usecases/weekly_data";
import {
  subscribeNutritionGoalsOrInit,
  saveNutritionGoals as ucSaveNutritionGoals,
  subscribeProfileSettingsOrInit,
  saveProfileSettings as ucSaveProfileSettings,
} from "../usecases/profile_subscriptions";
import {subscribeTrainings, groupTrainingsByDay} from "../usecases/training/trainings_feed";
import {newTrainingId, saveTraining} from "../repositories/trainings";
import {getCurrentNutritionGoal} from "../usecases/nutrition";
import {filterWeeksFromDate} from "../usecases/weekly_calculations";

const WeightTracker: React.FC = () => {
  const [weeklyData, setWeeklyData] = useState<WeekData[]>([]);
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals[]>([]);
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>(defaultProfileSettings);
  const [trainings, setTrainings] = useState<{ id: string; data: Training }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {syncStatus, registerPendingWrites, clearPendingWrites} = useSyncStatus();
  const {user, isLoading: authLoading, handleSignIn, handleSignOut} = useAuth();

  useEffect(() => {
    if (!user) {
      setWeeklyData([]);
      setNutritionGoals([]);
      setProfileSettings(defaultProfileSettings);
      setTrainings([]);
      return;
    }

    setIsLoading(true);
    clearPendingWrites();

    const unsubscribeDays = subscribeWeeklyData(user.uid, (weeks) => {
      setWeeklyData(weeks);
      setIsLoading(false);
    }, {onPendingWrites: registerPendingWrites});

    const unsubscribeGoals = subscribeNutritionGoalsOrInit(user.uid, (goals) => {
      setNutritionGoals(goals);
    }, {onPendingWrites: registerPendingWrites});

    const unsubscribeProfileSettings = subscribeProfileSettingsOrInit(user.uid, (settings) => {
      setProfileSettings(settings);
    }, {onPendingWrites: registerPendingWrites});

    const unsubscribeTrainings = subscribeTrainings(user.uid, (arr) => {
      console.log("Trainings updated", arr);
      const sorted = [...arr].sort((a, b) => (b.data.startedAt.toMillis() - a.data.startedAt.toMillis()));
      setTrainings(sorted);
    }, {onPendingWrites: registerPendingWrites});

    return () => {
      unsubscribeDays();
      unsubscribeGoals();
      unsubscribeProfileSettings();
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

  const handleSaveProfileSettings = useCallback(async (settings: ProfileSettings) => {
    if (!user) return;
    try {
      await ucSaveProfileSettings(user.uid, settings);
    } catch (err) {
      console.error("Error saving profile settings:", err);
    }
  }, [user]);

  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState<string | null>(null);
  const [editingCardio, setEditingCardio] = useState<{ id: string; data: Training } | true | null>(null);

  const handleOpenNewTraining = async (): Promise<void> => {
    if (!user) return;
    const id = newTrainingId(user.uid);
    const isoDay = new Date().toISOString().split("T")[0];
    const data = {
      day: isoDay,
      startedAt: Timestamp.now(),
      endedAt: null,
      type: "strength",
      kcalBurnt: null,
    } as Training;
    try {
      console.log("Creating training", id, data);
      setEditingTraining(id);
      await saveTraining(user.uid, id, data);
      console.log("Training created", id, data);
    } catch (e) {
      setEditingTraining(current => current === id ? null : current);
      console.error("Failed to create training", e);
    }
  };

  const trainingsByDay = React.useMemo(() => {
    return groupTrainingsByDay(trainings);
  }, [trainings]);

  const currentGoal = React.useMemo(() => getCurrentNutritionGoal(nutritionGoals), [nutritionGoals]);
  const overviewWeeks = React.useMemo(() => {
    if (!profileSettings.overview.limitToCurrentGoal) {
      return weeklyData;
    }

    return filterWeeksFromDate(weeklyData, currentGoal.validFrom);
  }, [currentGoal.validFrom, profileSettings.overview.limitToCurrentGoal, weeklyData]);

  const handleOpenTrainingById = (trainingId: string): void => {
    const found = trainings.find(t => t.id === trainingId);
    if (!found) return;
    if (found.data.type === "strength") {
      setEditingTraining(found.id);
    } else {
      setEditingCardio(found);
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
      <div className="flex flex-col gap-8 mx-auto my-0 max-w-screen-xl overflow-auto">
        <section className="p-4 rounded-3xl border border-solid bg-white bg-opacity-10 border-white border-opacity-10">
          <Header
            user={user}
            syncStatus={syncStatus}
            onShowGoals={() => setShowGoalsModal(true)}
            onAddTraining={handleOpenNewTraining}
            onAddCardio={() => setEditingCardio(true)}
            onSignOut={handleSignOut}
          />
          <WeightChart weeks={overviewWeeks} targetLossRates={[1, 2]}/>
        </section>
        <WeekList
          weeks={overviewWeeks}
          onSaveDay={handleSaveDayData}
          goals={nutritionGoals}
          trainingsByDay={trainingsByDay}
          onOpenTrainingById={handleOpenTrainingById}
        />
      </div>
      {showGoalsModal && (
        <GoalsModal
          onClose={() => setShowGoalsModal(false)}
          goals={nutritionGoals}
          limitOverviewToCurrentGoal={profileSettings.overview.limitToCurrentGoal}
          onChange={handleSaveNutritionGoals}
          onLimitOverviewToCurrentGoalChange={(nextValue) => {
            const nextSettings: ProfileSettings = {
              ...profileSettings,
              overview: {
                ...profileSettings.overview,
                limitToCurrentGoal: nextValue,
              },
            };
            setProfileSettings(nextSettings);
            void handleSaveProfileSettings(nextSettings);
          }}
        />
      )}
      {editingTraining && (
        <TrainingModal
          userId={user.uid}
          trainingId={editingTraining}
          onClose={() => setEditingTraining(null)}
          trainings={trainings}
        />
      )}
      {editingCardio && (
        <CardioModal
          userId={user.uid}
          training={editingCardio === true ? null : editingCardio}
          onClose={() => setEditingCardio(null)}
        />
      )}
    </main>
  );
};

export default WeightTracker;
