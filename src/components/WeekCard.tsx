import React, { useState } from "react";
import { FaChevronDown, FaChevronUp, FaArrowDown, FaArrowUp } from "react-icons/fa";

import { WeekCardProps } from "./types";
import DayCard from "./DayCard";
import { calculateAverageForWeek } from "../utils/weekly_calculations";

const WeekCard: React.FC<WeekCardProps> = ({
  week,
  onSaveDay,
  lastWeekAvgWeight,
  initialIsOpen,
  nutritionGoals,
}) => {
  const [showDays, setShowDays] = useState(initialIsOpen);
  const weeklyKcalAvg = calculateAverageForWeek(week, "kcal");
  const weeklyProteinAvg = calculateAverageForWeek(week, "protein");
  const weeklyFatAvg = calculateAverageForWeek(week, "fat");
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
            Avg: {weeklyKcalAvg !== null ? Math.round(weeklyKcalAvg) : "-"} kcal / {" "}
            {weeklyProteinAvg !== null ? Math.round(weeklyProteinAvg) : "-"}g P / {" "}
            {weeklyFatAvg !== null ? Math.round(weeklyFatAvg) : "-"}g F
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {weightDiff !== null && (
              <>
                {weightDiff < 0 && <FaArrowDown className="text-green-500" />}
                {weightDiff > 0 && <FaArrowUp className="text-red-500" />}
              </>
            )}
            <div
              className="text-3xl font-semibold"
              style={{
                color:
                  weightDiff !== null
                    ? weightDiff < 0
                      ? "text-green-500"
                      : "text-red-500"
                    : "inherit",
              }}
            >
              {weightDiff !== null ? (
                <>
                  {Math.abs(weightDiff)} kg
                </>
              ) : (
                "— kg"
              )}
            </div>
          </div>
          <div className="flex items-center">
            {showDays ? (
              <FaChevronUp className="text-zinc-400 text-lg" />
            ) : (
              <FaChevronDown className="text-zinc-400 text-lg" />
            )}
          </div>
        </div>
      </header>
      {showDays && (
        <div className="overflow-x-auto">
          <div className="grid gap-4 grid-cols-[repeat(7,1fr)]">
            {week.days.map((day, index) => (
              <DayCard
                key={index}
                day={day}
                onSaveDay={onSaveDay}
                nutritionGoals={nutritionGoals}
              />
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

export default WeekCard;
