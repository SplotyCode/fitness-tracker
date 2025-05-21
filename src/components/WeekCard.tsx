import React from "react";

import { WeekCardProps } from "./types";
import DayCard from "./DayCard";

const WeekCard: React.FC<WeekCardProps> = ({
  week,
  targetKcal,
  targetProtein,
  onSaveDay,
}) => {
  return (
    <article className="p-6 rounded-3xl border border-solid bg-white bg-opacity-10 border-white border-opacity-10">
      <header className="flex justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold">Week {week.weekNum}</h3>
          <p className="text-zinc-400">Avg. {week.weeklyKcalAvg} kcal/day</p>
        </div>
        <div
          className="text-3xl font-semibold"
          style={{
            color:
              week.weightDiff < 0 ? "rgb(63, 185, 80)" : "rgb(248, 81, 73)",
          }}
        >
          {week.weightDiff > 0 && "+"}
          {week.weightDiff} kg
        </div>
      </header>
      <div className="grid gap-4 grid-cols-[repeat(7,1fr)]">
        {week.days?.map((day, index) => (
          <DayCard
            key={index}
            day={day}
            targetKcal={targetKcal}
            targetProtein={targetProtein}
            onSaveDay={onSaveDay}
          />
        ))}
      </div>
    </article>
  );
};

export default WeekCard;
