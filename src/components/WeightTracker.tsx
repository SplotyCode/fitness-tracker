"use client";

import React, {useCallback, useEffect, useRef, useState} from "react";
import {db} from "../repository/firebase";
import {doc, onSnapshot, setDoc, collection} from "firebase/firestore";
import {FaSpinner} from "react-icons/fa";

import {DayData, DayUpdateData, NutritionGoals, WeekData} from "./types";
import {fillAndGroupDays} from "../utils/weekly_calculations";
import WeightChart from "./WeightChart";
import Login from "./Login";
import {getDefaultNutritionGoal} from "../utils/nutrition";
import GoalsModal from "./GoalsModal";
import WeekList from "./Weekly/WeekList";
import Header from "./Header";
import useSyncStatus from "../hooks/useSyncStatus";
import {useAuth} from "../hooks/useAuth";
import TrainingModal from "./TrainingModal";
import {Training} from "../utils/exercises";

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

    console.log("User signed in:", user.uid);
    const daysCollectionRef = collection(db, "users", user.uid, "days");
    const unsubscribeDays = onSnapshot(daysCollectionRef, { includeMetadataChanges: true }, (querySnapshot) => {
      registerPendingWrites('days', querySnapshot.metadata.hasPendingWrites);
      const daysFromFirestore = querySnapshot.docs.map(doc => ({
        ...(doc.data() as Omit<DayData, 'date'>),
        date: new Date(doc.id).toISOString(),
      }));
      setWeeklyData(fillAndGroupDays(daysFromFirestore));
      console.log("Day data updated from Firestore snapshot.");
      setIsLoading(false);
    }, (error) => {
      console.error("Error listening to days collection:", error);
      setIsLoading(false);
    });

    const profileDocRef = doc(db, "users", user.uid, "profile", "userProfile");
    const unsubscribeGoals = onSnapshot(profileDocRef, { includeMetadataChanges: true }, (docSnap) => {
      registerPendingWrites('profile', docSnap.metadata.hasPendingWrites);
      if (docSnap.exists()) {
        const goals = docSnap.data().nutritionGoals as NutritionGoals[] | null;
        if (goals && goals.length > 0) {
          setNutritionGoals(goals);
        } else {
          const defaultGoals = [getDefaultNutritionGoal()];
          setNutritionGoals(defaultGoals);
          setDoc(profileDocRef, { nutritionGoals: defaultGoals }, { merge: true });
        }
      } else {
        console.log("No profile data, initializing with default goals.");
        const defaultGoals = [getDefaultNutritionGoal()];
        setNutritionGoals(defaultGoals);
        setDoc(profileDocRef, { nutritionGoals: defaultGoals });
      }
    }, (error) => {
      console.error("Error listening to profile document:", error);
    });

    const trainingsColRef = collection(db, "users", user.uid, "trainings");
    const unsubscribeTrainings = onSnapshot(trainingsColRef, { includeMetadataChanges: true }, (snap) => {
      registerPendingWrites('trainings', snap.metadata.hasPendingWrites);
      const arr = snap.docs.map(d => ({ id: d.id, data: d.data() as Training }));
      arr.sort((a, b) => (b.data.startedAt.toMillis() - a.data.startedAt.toMillis()));
      trainingsRef.current = arr;
      setTrainingsVersion(v => v + 1);
    }, (error) => {
      console.error("Error listening to trainings collection:", error);
    });

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

    const docId = new Date(date).toISOString().split('T')[0];
    const dayDocRef = doc(db, "users", user.uid, "days", docId);
    try {
      await setDoc(dayDocRef, updatedDay, { merge: true });
    } catch (error) {
      console.error("Error saving data to Firestore:", error);
    }
  }, [user]);

  const handleSaveNutritionGoals = useCallback(async (newGoals: NutritionGoals[]) => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid, "profile", "userProfile");
    try {
      await setDoc(userDocRef, { nutritionGoals: newGoals }, { merge: true });
    } catch (err) {
      console.error("Error saving nutrition goals:", err);
    }
  },
  [user]
  );
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState<{ id: string; data: Training } | null>(null);

  const handleOpenNewTraining = (): void => {
    setEditingTraining(null);
    setShowTrainingModal(true);
  };

  const handleTrainingSaved = (t: { id: string; data: Training }): void => {
    const existingIdx = trainingsRef.current.findIndex(x => x.id === t.id);
    if (existingIdx >= 0) {
      const next = [...trainingsRef.current];
      next[existingIdx] = t;
      trainingsRef.current = next;
    } else {
      trainingsRef.current = [t, ...trainingsRef.current].sort((a, b) => (b.data.startedAt.toMillis() - a.data.startedAt.toMillis()));
    }
    setTrainingsVersion(v => v + 1);
  };

  const handleTrainingDeleted = (id: string): void => {
    trainingsRef.current = trainingsRef.current.filter(t => t.id !== id);
    setTrainingsVersion(v => v + 1);
  };

  const trainingsByDay = React.useMemo(() => {
    const byDay: Record<string, { id: string; data: Training }[]> = {};
    for (const t of trainingsRef.current) {
      const key = t.data.day;
      if (!byDay[key]) byDay[key] = [];
      byDay[key].push(t);
    }
    return byDay;
  }, [trainingsVersion]);

  const handleOpenTrainingById = (trainingId: string): void => {
    const found = trainingsRef.current.find(t => t.id === trainingId) || null;
    if (found) {
      setEditingTraining(found);
      setShowTrainingModal(true);
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
      <TrainingModal
        open={showTrainingModal}
        userId={user.uid}
        training={editingTraining}
        onClose={() => setShowTrainingModal(false)}
        onSaved={handleTrainingSaved}
        onDeleted={handleTrainingDeleted}
      />
    </main>
  );
};

export default WeightTracker;
