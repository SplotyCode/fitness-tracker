"use client";

import React, {useCallback, useEffect, useState} from "react";
import {signInWithPopup, signOut, User} from "firebase/auth";
import {auth, db} from "../firebase";
import {doc, onSnapshot, setDoc, collection} from "firebase/firestore";
import {FaSpinner} from "react-icons/fa";

import {DayData, DayUpdateData, NutritionGoals, WeekData} from "./types";
import {fillAndGroupDays} from "../utils/weekly_calculations";
import WeightChart from "./WeightChart";
import Login from "./Login";
import {AuthProvider} from "@firebase/auth";
import {getDefaultNutritionGoal} from "../utils/nutrition";
import GoalsModal from "./GoalsModal";
import WeekList from "./Weekly/WeekList";
import Header from "./Header";
import useSyncStatus from "../storage/useSyncStatus";

const WeightTracker: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeekData[]>([]);
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { syncStatus, registerPendingWrites, clearPendingWrites } = useSyncStatus();

  useEffect(() => {
    let unsubscribeDays: (() => void) | null = null;
    let unsubscribeGoals: (() => void) | null = null;

    const authUnsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setIsLoading(true);
      setUser(currentUser);

      if (unsubscribeDays) unsubscribeDays();
      if (unsubscribeGoals) unsubscribeGoals();
      clearPendingWrites();

      if (currentUser) {
        console.log("User signed in:", currentUser.uid);
        const daysCollectionRef = collection(db, "users", currentUser.uid, "days");
        unsubscribeDays = onSnapshot(daysCollectionRef, { includeMetadataChanges: true }, (querySnapshot) => {
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

        const profileDocRef = doc(db, "users", currentUser.uid, "profile", "userProfile");
        unsubscribeGoals = onSnapshot(profileDocRef, { includeMetadataChanges: true }, (docSnap) => {
          registerPendingWrites('profile', docSnap.metadata.hasPendingWrites);
          if (docSnap.exists()) {
            const goals = docSnap.data()?.nutritionGoals;
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

      } else {
        console.log("User signed out");
        setWeeklyData([]);
        setNutritionGoals([]);
        setIsLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (unsubscribeDays) unsubscribeDays();
      if (unsubscribeGoals) unsubscribeGoals();
    };
  }, []);

  const handleSignIn = async (provider: AuthProvider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
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
