import React, { useState } from "react";

import {DayCardProps, DayUpdateData} from "./types";
import ProgressBar from "./ProgressBar";
import EditEntryForm from "./EditEntryForm";
import {
  getKcalLevels,
  getProteinLevels,
  getFatLevels,
  getOptimalValue,
  getDayColor
} from "../utils/nutrition";

const DayCard: React.FC<DayCardProps> = ({
  day,
  onSaveDay,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = (updatedData: DayUpdateData) => {
    onSaveDay(day.date, updatedData);
    setIsEditing(false);
  };

  const dailyLevel = getDayColor(day);

  if (isEditing) {
    return (
      <div className="p-4 rounded-xl bg-neutral-800 border border-solid border-sky-500">
        <EditEntryForm
          entryData={day}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-2 p-4 rounded-xl bg-white bg-opacity-0"
      style={{
        border: `1px solid ${
          (dailyLevel) ? dailyLevel : "rgba(255, 255, 255, 0.1)"
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
            <span className="text-lg font-semibold">{day.kcal ?? '-'} kcal</span>
            <span className="text-sm text-zinc-400">{getOptimalValue(getKcalLevels())}</span>
          </div>
          <ProgressBar
            current={day.kcal}
            levels={getKcalLevels()}
          />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-zinc-400">{day.protein ?? '- '}g protein</span>
            <span className="text-sm text-zinc-400">{getOptimalValue(getProteinLevels())}g</span>
          </div>
          <ProgressBar current={day.protein} levels={getProteinLevels()} />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-zinc-400">{day.fat ?? '- '}g fat</span>
            <span className="text-sm text-zinc-400">{getOptimalValue(getFatLevels())}g</span>
          </div>
          <ProgressBar current={day.fat} levels={getFatLevels()}/>
        </div>
      </div>
      <button 
        className="mt-2 px-3 py-1 text-xs text-white rounded-md border border-solid cursor-pointer bg-zinc-700 border-white border-opacity-10 hover:bg-zinc-600"
        onClick={handleEdit}
      >
        Edit
      </button>
    </div>
  );
};

export default DayCard;
