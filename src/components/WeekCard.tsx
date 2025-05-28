import React, { useState } from "react";

import { WeekCardProps } from "./types";
import DayCard from "./DayCard";
import { calculateAverageForWeek } from "../utils/weekly_calculations";

const WeekCard: React.FC<WeekCardProps> = ({
  week,
  onSaveDay,
  lastWeekAvgWeight,
  initialIsOpen,
}) => {
  const [showDays, setShowDays] = useState(initialIsOpen);
  const weeklyKcalAvg = calculateAverageForWeek(week, "kcal");
  const currentWeekAvgWeight = calculateAverageForWeek(week, "weight");

  const weightDiff =
    currentWeekAvgWeight !== null && lastWeekAvgWeight !== null
      ? parseFloat((currentWeekAvgWeight - lastWeekAvgWeight).toFixed(1))
      : null;

  const handleToggle = () => {
    setShowDays(!showDays);
  };

  return (
    <article className="p-6 rounded-3xl border border-solid bg-white bg-opacity-10 border-white border-opacity-10">
      <header
        className="flex justify-between items-center mb-6 cursor-pointer"
        onClick={handleToggle}
      >
        <div>
          <h3 className="text-xl font-semibold">Week {week.weekNum}</h3>
          <p className="text-zinc-400">
            Avg. {weeklyKcalAvg !== null ? Math.round(weeklyKcalAvg) : "-"} kcal/day
          </p>
        </div>
        <div className="flex items-center">
          <div
            className="text-3xl font-semibold mr-4"
            style={{
              color:
                weightDiff !== null
                  ? weightDiff < 0
                    ? "rgb(63, 185, 80)"
                    : "rgb(248, 81, 73)"
                  : "inherit",
            }}
          >
            {weightDiff !== null ? (
              <>
                {weightDiff > 0 && "+"}
                {weightDiff} kg
              </>
            ) : (
              "— kg"
            )}
          </div>
          <span>{showDays ? "▲" : "▼"}</span>
        </div>
      </header>
      {showDays && (
        <div className="overflow-x-auto">
          <div className="grid gap-4 grid-cols-[repeat(7,1fr)]">
            {week.days.map((day, index) => (
              <DayCard
                key={index}
                day={day}
                targetKcal={2200}
                targetProtein={140}
                targetFat={50}
                onSaveDay={onSaveDay}
              />
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

export default WeekCard;
