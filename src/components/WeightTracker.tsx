"use client";

import React, { useState, useCallback } from "react";

import { WeekData } from "./types";
import WeightProgressSection from "./WeightProgressSection";
import WeeklyDataSection from "./WeeklyDataSection";

const initialWeeklyData: WeekData[] = [
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
        weight: null
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
        weight: null
      })),
  },
];

const WeightTracker: React.FC = () => {
  const [weeklyData, setWeeklyData] = useState<WeekData[] | null>(
    initialWeeklyData,
  );
  const handleSaveDayData = useCallback((date: string, updatedDay: { kcal: number | null, protein: number | null, weight: number | null }) => {
    setWeeklyData(prevData => {
      if (!prevData) return null;
      return prevData.map(week => ({
        ...week,
        days: week.days.map(day =>
          day.date === date
            ? { 
                ...day, 
                kcal: updatedDay.kcal,
                protein: updatedDay.protein,
              }
            : day
        ),
      }));
    });
    console.log("Day data saved:", date, updatedDay);
  }, []);
  

  return (
    <main className="p-8 min-h-screen text-white bg-neutral-900">
      <div className="flex flex-col gap-8 mx-auto my-0 max-w-screen-xl">
        <WeightProgressSection/>
        <WeeklyDataSection
          weeklyData={weeklyData}
          targetKcal={2200}
          targetProtein={140}
          onSaveDay={handleSaveDayData}
        />
      </div>
    </main>
  );
};

export default WeightTracker;
