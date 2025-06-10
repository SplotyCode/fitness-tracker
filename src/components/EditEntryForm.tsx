import React, { useState, useEffect } from "react";
import { FaWeight, FaFire, FaDrumstickBite, FaOilCan, FaSave, FaTimes } from "react-icons/fa";

import { EditEntryFormProps } from "./types";

const EditEntryForm: React.FC<EditEntryFormProps> = ({
  entryData,
  onSave,
  onCancel,
}) => {
  const [currentKcal, setCurrentKcal] = useState<number | null>(null);
  const [currentProtein, setCurrentProtein] = useState<number | null>(null);
  const [currentFat, setCurrentFat] = useState<number | null>(null);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);

  useEffect(() => {
    if (entryData) {
      setCurrentKcal(entryData.kcal);
      setCurrentProtein(entryData.protein);
      setCurrentFat(entryData.fat);
      setCurrentWeight(entryData.weight);
    }
  }, [entryData]);

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value.replace(',', '.')) : null;
    setCurrentWeight(value);
  };

  const handleKcalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    setCurrentKcal(value);
  };

  const handleProteinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    setCurrentProtein(value);
  };

  const handleFatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    setCurrentFat(value);
  };

  const handleSave = () => {
    onSave({
        weight: currentWeight,
        kcal: currentKcal,
        protein: currentProtein,
        fat: currentFat
    });
  };

  return (
    <div className="p-4 rounded-xl bg-opacity-0">
      <h3 className="text-xl font-semibold mb-4 text-white">Edit Entry</h3>
      <div className="flex flex-col gap-4 mb-4">
        <div className="relative">
          <FaWeight className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
          <input
            type="number"
            placeholder="Weight (kg)"
            aria-label="Enter weight in kilograms"
            className="p-2 pl-10 w-full text-white rounded-md border border-solid bg-neutral-900 border-white border-opacity-10"
            value={currentWeight || ""}
            onChange={handleWeightChange}
          />
        </div>
        <div className="relative">
          <FaFire className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500" />
          <input
              type="number"
              placeholder="Calories"
              aria-label="Enter calories consumed"
              className="p-2 pl-10 w-full text-white rounded-md border border-solid bg-neutral-900 border-white border-opacity-10"
              value={currentKcal || ""}
              onChange={handleKcalChange}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <FaDrumstickBite className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400" />
            <input
              type="number"
              placeholder="Protein (g)"
              aria-label="Enter protein in grams"
              className="p-2 pl-10 w-full text-white rounded-md border border-solid bg-neutral-900 border-white border-opacity-10"
              value={currentProtein || ""}
              onChange={handleProteinChange}
            />
          </div>
          <div className="relative">
            <FaOilCan className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400" />
            <input
                type="number"
                placeholder="Fat (g)"
                aria-label="Enter fat in grams"
                className="p-2 pl-10 w-full text-white rounded-md border border-solid bg-neutral-900 border-white border-opacity-10"
                value={currentFat || ""}
                onChange={handleFatChange}
            />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          className="px-4 py-1 flex-1 text-white rounded-md border border-solid cursor-pointer bg-green-600 border-white border-opacity-10 duration-[0.2s] transition-[background-color] hover:bg-green-500 flex items-center justify-center gap-2"
          onClick={handleSave}
        >
          <FaSave />
          Save
        </button>
        <button
          className="px-4 py-1 flex-1 text-white rounded-md border border-solid cursor-pointer bg-zinc-700 border-white border-opacity-10 duration-[0.2s] transition-[background-color] hover:bg-zinc-600 flex items-center justify-center gap-2"
          onClick={onCancel}
        >
          <FaTimes />
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditEntryForm; 