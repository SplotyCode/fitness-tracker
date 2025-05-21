import React, { useState, useEffect } from "react";

import { EditEntryFormProps } from "./types";

const EditEntryForm: React.FC<EditEntryFormProps> = ({
  entryData,
  onSave,
  onCancel,
}) => {
  const [currentKcal, setCurrentKcal] = useState<number | null>(null);
  const [currentProtein, setCurrentProtein] = useState<number | null>(null);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);

  useEffect(() => {
    if (entryData) {
      setCurrentKcal(entryData.kcal);
      setCurrentProtein(entryData.protein);
      setCurrentWeight(entryData.weight !== undefined ? entryData.weight : null);
    }
  }, [entryData]);

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
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

  const handleSave = () => {
    onSave({
        weight: currentWeight,
        kcal: currentKcal,
        protein: currentProtein
    });
  };

  return (
    <div className="p-4 rounded-xl bg-opacity-0">
      <h3 className="text-xl font-semibold mb-4 text-white">Edit Entry</h3>
      <div className="flex flex-col gap-4 mb-4">
        <input
          type="number"
          placeholder="Weight (kg)"
          aria-label="Enter weight in kilograms"
          className="p-2 w-full text-white rounded-md border border-solid bg-neutral-900 border-white border-opacity-10"
          value={currentWeight || ""}
          onChange={handleWeightChange}
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Calories"
            aria-label="Enter calories consumed"
            className="p-2 w-full text-white rounded-md border border-solid bg-neutral-900 border-white border-opacity-10"
            value={currentKcal || ""}
            onChange={handleKcalChange}
          />
          <input
            type="number"
            placeholder="Protein (g)"
            aria-label="Enter protein in grams"
            className="p-2 w-full text-white rounded-md border border-solid bg-neutral-900 border-white border-opacity-10"
            value={currentProtein || ""}
            onChange={handleProteinChange}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          className="px-4 py-1 flex-1 text-white rounded-md border border-solid cursor-pointer bg-green-600 border-white border-opacity-10 duration-[0.2s] transition-[background-color] hover:bg-green-500"
          onClick={handleSave}
        >
          Save Changes
        </button>
        <button
          className="px-4 py-1 flex-1 text-white rounded-md border border-solid cursor-pointer bg-zinc-700 border-white border-opacity-10 duration-[0.2s] transition-[background-color] hover:bg-zinc-600"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditEntryForm; 