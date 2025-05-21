import React from "react";

import { AddEntryFormProps } from "./types";

const AddEntryForm: React.FC<AddEntryFormProps> = ({
  newWeight,
  setNewWeight,
  newKcal,
  setNewKcal,
  newProtein,
  setNewProtein,
  addNewData,
}) => {
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    setNewWeight(value);
  };

  const handleKcalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    setNewKcal(value);
  };

  const handleProteinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    setNewProtein(value);
  };

  return (
    <div className="p-4 mb-6 rounded-xl bg-white bg-opacity-0">
      <div className="grid gap-4 mb-4 grid-cols-[repeat(3,1fr)]">
        <input
          type="number"
          placeholder="Weight (kg)"
          aria-label="Enter weight in kilograms"
          className="p-2 w-full text-white rounded-md border border-solid bg-neutral-900 border-white border-opacity-10"
          value={newWeight || ""}
          onChange={handleWeightChange}
        />
        <input
          type="number"
          placeholder="Calories"
          aria-label="Enter calories consumed"
          className="p-2 w-full text-white rounded-md border border-solid bg-neutral-900 border-white border-opacity-10"
          value={newKcal || ""}
          onChange={handleKcalChange}
        />
        <input
          type="number"
          placeholder="Protein (g)"
          aria-label="Enter protein in grams"
          className="p-2 w-full text-white rounded-md border border-solid bg-neutral-900 border-white border-opacity-10"
          value={newProtein || ""}
          onChange={handleProteinChange}
        />
      </div>
      <button
        className="px-4 py-2 w-full text-white rounded-md border border-solid cursor-pointer bg-zinc-800 border-white border-opacity-10 duration-[0.2s] transition-[background-color] hover:bg-zinc-700"
        onClick={() => addNewData()}
      >
        Save Entry
      </button>
    </div>
  );
};

export default AddEntryForm;
