import React from "react";

import { DayCardProps } from "./types";
import ProgressBar from "./ProgressBar";

const DayCard: React.FC<DayCardProps> = ({
  day,
  targetKcal,
  targetProtein,
}) => {
  return (
    <div
      className="flex flex-col gap-2 p-4 rounded-xl bg-white bg-opacity-0"
      style={{
        border: `1px solid ${
          day.targetReached ? "rgb(63, 185, 80)" : "rgba(255, 255, 255, 0.1)"
        }`,
      }}
    >
      <time className="text-sm text-zinc-400">
        {new Date(day.date).toLocaleDateString("en-US", {
          weekday: "short",
        })}
      </time>
      <div className="flex flex-col gap-3">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-lg font-semibold">{day.kcal} kcal</span>
            <span className="text-sm text-zinc-400">{targetKcal}</span>
          </div>
          <ProgressBar
            current={day.kcal}
            target={targetKcal}
            isGoodWhenLower={true}
          />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-zinc-400">{day.protein}g protein</span>
            <span className="text-sm text-zinc-400">{targetProtein}g</span>
          </div>
          <ProgressBar current={day.protein} target={targetProtein} />
        </div>
      </div>
    </div>
  );
};

export default DayCard;
