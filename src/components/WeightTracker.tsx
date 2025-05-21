"use client";

import React, { useState, useCallback } from "react";

import { WeekData } from "./types";
import WeightProgressSection from "./WeightProgressSection";
import WeeklyDataSection from "./WeeklyDataSection";

// Sample data for demonstration
const sampleWeeklyData: WeekData[] = [
  {
    weekNum: 1,
    weeklyKcalAvg: 2100,
    weightDiff: -0.8,
    days: Array(7)
      .fill(null)
      .map((_, i) => ({
        date: new Date(2023, 0, i + 1).toISOString(),
        kcal: 2000 + Math.floor(Math.random() * 400),
        protein: 120 + Math.floor(Math.random() * 40),
        targetReached: Math.random() > 0.3,
      })),
  },
  {
    weekNum: 2,
    weeklyKcalAvg: 2050,
    weightDiff: -1.2,
    days: Array(7)
      .fill(null)
      .map((_, i) => ({
        date: new Date(2023, 0, i + 8).toISOString(),
        kcal: 1900 + Math.floor(Math.random() * 400),
        protein: 130 + Math.floor(Math.random() * 40),
        targetReached: Math.random() > 0.3,
      })),
  },
];

const WeightTracker: React.FC = () => {
  const [showInputForm, setShowInputForm] = useState<boolean>(false);
  const [newWeight, setNewWeight] = useState<number | null>(null);
  const [newKcal, setNewKcal] = useState<number | null>(null);
  const [newProtein, setNewProtein] = useState<number | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeekData[] | null>(
    sampleWeeklyData,
  );
  const [targetKcal, setTargetKcal] = useState<number | null>(2200);
  const [targetProtein, setTargetProtein] = useState<number | null>(140);

  const addNewData = useCallback(() => {
    if (newWeight && newKcal && newProtein) {
      // In a real application, this would add the new data to the database
      // For this demo, we'll just log it and reset the form
      console.log("New entry:", {
        weight: newWeight,
        kcal: newKcal,
        protein: newProtein,
      });

      // Reset form
      setNewWeight(null);
      setNewKcal(null);
      setNewProtein(null);
      setShowInputForm(false);

      // In a real app, we would update the weekly data here
    }
  }, [newWeight, newKcal, newProtein]);

  return (
    <main className="p-8 min-h-screen text-white bg-neutral-900">
      <div className="flex flex-col gap-8 mx-auto my-0 max-w-screen-xl">
        <WeightProgressSection
          showInputForm={showInputForm}
          setShowInputForm={setShowInputForm}
          newWeight={newWeight}
          setNewWeight={setNewWeight}
          newKcal={newKcal}
          setNewKcal={setNewKcal}
          newProtein={newProtein}
          setNewProtein={setNewProtein}
          addNewData={addNewData}
        />

        <WeeklyDataSection
          weeklyData={weeklyData}
          targetKcal={targetKcal}
          targetProtein={targetProtein}
        />
      </div>
    </main>
  );
};

export default WeightTracker;
