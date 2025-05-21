import React, { useState } from "react";

import { DayCardProps } from "./types";
import ProgressBar from "./ProgressBar";
import EditEntryForm from "./EditEntryForm";

const DayCard: React.FC<DayCardProps> = ({
  day,
  targetKcal,
  targetProtein,
  onSaveDay,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = (updatedData: { kcal: number | null, protein: number | null, weight: number | null }) => {
    const finalKcal = updatedData.kcal ?? day.kcal;
    const finalProtein = updatedData.protein ?? day.protein;
    
    onSaveDay(day.date, {
      kcal: finalKcal,
      protein: finalProtein,
      weight: updatedData.weight
    });
    setIsEditing(false);
  };

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
