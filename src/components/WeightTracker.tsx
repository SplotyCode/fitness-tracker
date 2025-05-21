"use client";

import React, { useState, useCallback, useEffect } from "react";

import { WeekData } from "./types";
import WeightProgressSection from "./WeightProgressSection";
import WeekCard from "./WeekCard";
import { calculateAverageForWeek, getMonday, isSameDay } from "../utils/weekly_calculations";

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
    date = getMonday(new Date());
  }

  while (date <= today) {
    const isoDate = date.toISOString();
    const monday = getMonday(date);
    let week = data[data.length - 1];

    if (!week || !isSameDay(getMonday(new Date(week.days[0]?.date)), monday)) {
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


const SESSION_STORAGE_KEY = "fitnessTrackerData";

const WeightTracker: React.FC = () => {
  const [weeklyData, setWeeklyData] = useState<WeekData[]>(() => {
    let dataFromStorage: WeekData[] | null = null;
    const storedData = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (storedData) {
      try {
        dataFromStorage = JSON.parse(storedData) as WeekData[];
      } catch (error) {
        console.error("Error parsing data from session storage:", error);
      }
    }
    return fillMissingDaysAndWeeks(dataFromStorage);
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(weeklyData));
    } catch (error) {
      console.error("Error saving data to session storage:", error);
    }
  }, [weeklyData]);

  const handleSaveDayData = useCallback((date: string, updatedDay: { kcal: number | null, protein: number | null, weight: number | null }) => {
    setWeeklyData(prevData => {
      return prevData.map(week => ({
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
    });
    console.log("Day data saved:", date, updatedDay);
  }, []);

  return (
    <main className="p-8 min-h-screen text-white bg-neutral-900">
      <div className="flex flex-col gap-8 mx-auto my-0 max-w-screen-xl">
        <WeightProgressSection />
        <section className="flex flex-col gap-6">
          {weeklyData.map((week, index) => {
            const lastWeekAvgWeight = index > 0 ? calculateAverageForWeek(weeklyData[index - 1], "weight") : null;
            return (
              <WeekCard
                key={index}
                week={week}
                targetKcal={2200}
                targetProtein={140}
                onSaveDay={handleSaveDayData}
                lastWeekAvgWeight={lastWeekAvgWeight}
              />
            );
          })}
        </section>
      </div>
    </main>
  );
};

export default WeightTracker;
