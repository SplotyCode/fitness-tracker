"use client";

import React, {useCallback, useEffect, useState} from "react";
import {signInWithPopup, signOut, User} from "firebase/auth";
import {auth, db} from "../firebase";
import {doc, DocumentReference, onSnapshot, setDoc} from "firebase/firestore";
import {FaSpinner} from "react-icons/fa";

import {DayUpdateData, NutritionGoals, WeekData} from "./types";
import {getMonday, isSameDateTime, toUtcMidnight} from "../utils/weekly_calculations";
import WeightChart from "./WeightChart";
import Login from "./Login";
import {AuthProvider} from "@firebase/auth";
import {getDefaultNutritionGoal} from "../utils/nutrition";
import GoalsModal from "./GoalsModal";
import useSyncStatus from "../storage/useSyncStatus";
import WeekList from "./Weekly/WeekList";
import Header from "./Header";

const fillMissingDaysAndWeeks = (existingData: WeekData[] | null): WeekData[] => {
  const today = toUtcMidnight(new Date())
  const data = existingData ? structuredClone(existingData) : [];

  const lastFilledActual = getLastFilledDate(data);
  let date: Date;
  if (lastFilledActual) {
    date = new Date(lastFilledActual);
    date.setDate(date.getDate() + 1);
  } else {
    date = getMonday(today);
  }

  while (date <= today) {
    const isoDate = date.toISOString();
    const monday = getMonday(date);
    let week = data[data.length - 1];

    if (!week || !isSameDateTime(getMonday(new Date(week.days[0]?.date)), monday)) {
      const newWeek: WeekData = {
        weekNum: week ? week.weekNum + 1 : 1,
        days: []
      };
      data.push(newWeek);
      week = newWeek;
    }
    if (!week.days.some(d => d.date === isoDate)) {
      week.days.push({
        date: isoDate,
        kcal: null,
        protein: null,
        fat: null,
        weight: null,
      });
      week.days.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    date.setDate(date.getDate() + 1);
  }

  return data;
};

const getLastFilledDate = (data: WeekData[]): Date | null => {
  const lastWeek = data[data.length - 1];
  if (!lastWeek || lastWeek.days.length === 0) return null;
  const lastDay = new Date(lastWeek.days[lastWeek.days.length - 1].date);
  return toUtcMidnight(lastDay);
};

const WeightTracker: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeekData[]>([]);
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userDocRef: DocumentReference | null = React.useMemo(
      () =>
          user
              ? doc(db, 'users', user.uid, 'weeklyData', 'data')
              : null,
      [user]
  );
  const syncStatus = useSyncStatus(userDocRef, db);

  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;

    const authUnsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setIsLoading(true);
      setUser(currentUser);

      if (unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = null;
      }

      if (currentUser) {
        console.log("User signed in:", currentUser.uid);
        const userDocRef = doc(db, "users", currentUser.uid, "weeklyData", "data");

        unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const dataFromFirestore = docSnap.data();
            const validData = Array.isArray(dataFromFirestore?.weeks) ? dataFromFirestore.weeks : null;
            setWeeklyData(fillMissingDaysAndWeeks(validData));

            const goals = dataFromFirestore?.nutritionGoals;
            if (goals && goals.length > 0) {
              setNutritionGoals(goals);
            } else {
              const defaultGoals = [getDefaultNutritionGoal()];
              setNutritionGoals(defaultGoals);
              setDoc(userDocRef, { nutritionGoals: defaultGoals }, { merge: true });
            }
            console.log("Data updated from Firestore snapshot");
          } else {
            console.log("No data in Firestore for this user, initializing.");
            const defaultGoals = [getDefaultNutritionGoal()];
            const filledWeeks = fillMissingDaysAndWeeks(null);
            setWeeklyData(filledWeeks);
            setNutritionGoals(defaultGoals);
            setDoc(userDocRef, { weeks: filledWeeks, nutritionGoals: defaultGoals });
          }
        }, (error) => {
          console.error("Error listening to Firestore snapshots:", error);
        });
      } else {
        console.log("User signed out");
        setWeeklyData([]);
        setNutritionGoals([]);
      }
      setIsLoading(false);
    });

    return () => {
      authUnsubscribe();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  const handleSignIn = async (provider: AuthProvider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error: any) {
      console.error("Sign-in error:", error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleSaveDayData = useCallback(async (date: string, updatedDay: DayUpdateData) => {
    if (!user) {
      console.error("Cannot save data: no user logged in.");
      return;
    }

    const updatedWeeklyData = weeklyData.map(week => ({
      ...week,
      days: week.days.map(day =>
        day.date === date
          ? {
            ...day,
            ...updatedDay
          }
          : day
      ),
    }));
    setWeeklyData(updatedWeeklyData);

    const userDocRef = doc(db, "users", user.uid, "weeklyData", "data");
    try {
      await setDoc(userDocRef, { weeks: updatedWeeklyData, nutritionGoals });
    } catch (error) {
      console.error("Error saving data to Firestore:", error);
    }
  }, [user, weeklyData, nutritionGoals]);

  const handleSaveNutritionGoals = useCallback(async (newGoals: NutritionGoals[]) => {
        if (!user) return;
        setNutritionGoals(newGoals);
        const userDocRef = doc(db, "users", user.uid, "weeklyData", "data");
        try {
          await setDoc(userDocRef, { nutritionGoals: newGoals }, { merge: true });
        } catch (err) {
          console.error("Error saving nutrition goals:", err);
        }
      },
      [user]
  );
  const [showGoalsModal, setShowGoalsModal] = useState(false);

  if (isLoading) {
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
              onSignOut={handleSignOut}
          />
          <WeightChart weeks={weeklyData} targetLossRates={[1, 2]}/>
        </section>
        <WeekList weeks={weeklyData} onSaveDay={handleSaveDayData} goals={nutritionGoals} />
      </div>
      <GoalsModal
          open={showGoalsModal}
          onClose={() => setShowGoalsModal(false)}
          goals={nutritionGoals}
          onChange={handleSaveNutritionGoals}
      />
    </main>
  );
};

export default WeightTracker;
