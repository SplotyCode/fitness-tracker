import React, { useState } from "react";
import { FaFire, FaDrumstickBite, FaOilCan, FaEdit } from "react-icons/fa";

import {DayCardProps, DayUpdateData} from "../types";
import ProgressBar from "../ProgressBar";
import EditEntryForm from "./EditEntryForm";
import {
  getOptimalValue,
  getDayColor, getColorHex
} from "../../utils/nutrition";

const DayCard: React.FC<DayCardProps> = ({
  day,
  onSaveDay,
  nutritionGoals
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

  const dailyLevel = getDayColor(day, nutritionGoals);

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
          (dailyLevel) ? getColorHex(dailyLevel) : "rgba(255, 255, 255, 0.1)"
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
            <div className="flex items-center gap-2">
              <FaFire className="text-orange-500" />
              <span className="text-lg font-semibold">{day.kcal ?? '-'} kcal</span>
            </div>
            <span className="text-sm text-zinc-400">{getOptimalValue(nutritionGoals.kcalLevels)}</span>
          </div>
          <ProgressBar
            current={day.kcal}
            levels={nutritionGoals.kcalLevels}
          />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <div className="flex items-center gap-2">
              <FaDrumstickBite className="text-red-400" />
              <span className="text-zinc-400">{day.protein ?? '- '}g protein</span>
            </div>
            <span className="text-sm text-zinc-400">{getOptimalValue(nutritionGoals.proteinLevels)}g</span>
          </div>
          <ProgressBar current={day.protein} levels={nutritionGoals.proteinLevels} />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <div className="flex items-center gap-2">
              <FaOilCan className="text-yellow-400" />
              <span className="text-zinc-400">{day.fat ?? '- '}g fat</span>
            </div>
            <span className="text-sm text-zinc-400">{getOptimalValue(nutritionGoals.fatLevels)}g</span>
          </div>
          <ProgressBar current={day.fat} levels={nutritionGoals.fatLevels}/>
        </div>
      </div>
      <button 
        className="mt-2 px-3 py-1 text-xs text-white rounded-md border border-solid cursor-pointer bg-zinc-700 border-white border-opacity-10 hover:bg-zinc-600 flex items-center justify-center gap-2"
        onClick={handleEdit}
      >
        <FaEdit />
        Edit
      </button>
    </div>
  );
};

export default DayCard;
