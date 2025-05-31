"use client";

import React, { useState, useCallback, useEffect } from "react";
import { GithubAuthProvider, signInWithPopup, signOut, User } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

import { WeekData, DayUpdateData } from "./types";
import WeekCard from "./WeekCard";
import { calculateAverageForWeek, getMonday, isSameDateTime } from "../utils/weekly_calculations";
import WeightChart from "./WeightChart";

const fillMissingDaysAndWeeks = (existingData: WeekData[] | null): WeekData[] => {
  const today = new Date();
  today.setHours(0)
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
  lastDay.setHours(0, 0, 0, 0);
  return lastDay;
};

const WeightTracker: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeekData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
            const dataFromFirestore = docSnap.data()?.weeks as WeekData[];
            const validData = Array.isArray(dataFromFirestore) ? dataFromFirestore : null;
            setWeeklyData(fillMissingDaysAndWeeks(validData));
            console.log("Data updated from Firestore snapshot");
          } else {
            console.log("No data in Firestore for this user, initializing.");
            setWeeklyData(fillMissingDaysAndWeeks(null));
          }
        }, (error) => {
          console.error("Error listening to Firestore snapshots:", error);
        });
      } else {
        console.log("User signed out");
        setWeeklyData([]);
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

  const handleGitHubSignIn = async () => {
    const provider = new GithubAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error: any) {
      console.error("GitHub sign-in error:", error);
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
      await setDoc(userDocRef, { weeks: updatedWeeklyData });
    } catch (error) {
      console.error("Error saving data to Firestore:", error);
    }
  }, [user, weeklyData]);

  if (isLoading) {
    return (
      <main className="p-8 min-h-screen text-white bg-neutral-900 flex justify-center items-center">
        <p className="text-xl">Loading...</p>
      </main>
    );
  }

  return (
    <main className="p-8 min-h-screen text-white bg-neutral-900">
      <div className="flex flex-col gap-8 mx-auto my-0 max-w-screen-xl">
        <section className="p-4 rounded-3xl border border-solid bg-white bg-opacity-10 border-white border-opacity-10">
          <header className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Weight Progress</h2>
            <div>
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm">Welcome, {user.displayName || user.email}</span>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGitHubSignIn}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Sign in with GitHub
                </button>
              )}
            </div>
          </header>
          {user ? (
            <>
              <WeightChart weeks={weeklyData}/>
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-xl mb-4">Please sign in to track your progress.</p>
            </div>
          )}
        </section>
        {user && (
          <section className="flex flex-col gap-6">
            {[...weeklyData].reverse().map((week, index) => {
              const originalIndex = weeklyData.length - 1 - index;
              const lastWeekAvgWeight = originalIndex > 0 ? calculateAverageForWeek(weeklyData[originalIndex - 1], "weight") : null;
              return (
                <WeekCard
                  key={week.weekNum}
                  week={week}
                  onSaveDay={handleSaveDayData}
                  lastWeekAvgWeight={lastWeekAvgWeight}
                  initialIsOpen={index === 0}
                />
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
};

export default WeightTracker;
