import {JSX, useState} from "react";
import {FaFire, FaDrumstickBite, FaOilCan, FaEdit} from "react-icons/fa";

import {DayData, DayUpdateData, NutritionGoals} from "../../domain/nutrition";
import {Training} from "../../domain/training";
import ProgressBar from "../ProgressBar";
import EditEntryForm from "./EditEntryForm";
import {
  getOptimalValue,
  getDayColor, getColorHex
} from "../../usecases/nutrition";

interface DayCardProps {
  day: DayData;
  onSaveDay: (date: string, updatedDayData: DayUpdateData) => void;
  nutritionGoals: NutritionGoals;
  trainings: { id: string; data: Training }[];
  onOpenTrainingById: (trainingId: string) => void;
}

const DayCard = ({
  day,
  onSaveDay,
  nutritionGoals,
  trainings = [],
  onOpenTrainingById
}: DayCardProps): JSX.Element => {
  const [isEditing, setIsEditing] = useState(false);
  const [showTrainingMenu, setShowTrainingMenu] = useState(false);

  const handleEdit = (): void => {
    setIsEditing(true);
  };

  const handleCancelEdit = (): void => {
    setIsEditing(false);
  };

  const handleSaveEdit = (updatedData: DayUpdateData): void => {
    onSaveDay(day.date, updatedData);
    setIsEditing(false);
  };

  const dailyLevel = getDayColor(day, nutritionGoals);

  const hasTrainings = trainings.length > 0;

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
      className="relative flex flex-col gap-2 p-4 rounded-xl bg-white bg-opacity-0"
      onClick={() => setShowTrainingMenu(false)}
      style={{
        border: `1px solid ${
          (dailyLevel) ? getColorHex(dailyLevel) : "rgba(255, 255, 255, 0.1)"
        }`,
      }}
    >
      {hasTrainings && (
        <button
          className="absolute right-2 top-2 h-3 w-3 rounded-full bg-emerald-500 shadow ring-2 ring-emerald-300/40"
          title="View training"
          onClick={(e) => {
            e.stopPropagation();
            if (trainings.length === 1) {
              onOpenTrainingById(trainings[0].id);
            } else {
              setShowTrainingMenu((v) => !v);
            }
          }}
        />
      )}
      {showTrainingMenu && trainings.length > 1 && (
        <div className="absolute right-2 top-6 z-20 w-48 rounded-md border border-white/10 bg-zinc-900 p-1 shadow-lg">
          <div className="px-2 py-1 text-xs uppercase tracking-wide text-zinc-400">Trainings</div>
          <div className="max-h-60 overflow-y-auto">
            {trainings
              .slice()
              .sort((a, b) => a.data.startedAt.toMillis() - b.data.startedAt.toMillis())
              .map((t) => (
                <button
                  key={t.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTrainingMenu(false);
                    onOpenTrainingById(t.id);
                  }}
                  className="flex w-full items-center justify-between rounded px-2 py-1 text-sm text-zinc-200 hover:bg-zinc-800"
                  >
                  <span>
                    {t.data.type.charAt(0).toUpperCase() + t.data.type.slice(1)}
                    : {new Date(t.data.startedAt.toDate()).toLocaleTimeString()}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}
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
