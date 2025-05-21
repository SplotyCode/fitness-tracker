import React from "react";

import { WeightProgressSectionProps } from "./types";
import AddEntryForm from "./AddEntryForm";
import WeightChart from "./WeightChart";

const WeightProgressSection: React.FC<WeightProgressSectionProps> = ({
  showInputForm,
  setShowInputForm,
  newWeight,
  setNewWeight,
  newKcal,
  setNewKcal,
  newProtein,
  setNewProtein,
  addNewData,
}) => {
  return (
    <section className="p-8 rounded-3xl border border-solid bg-white bg-opacity-10 border-white border-opacity-10">
      <header className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Weight Progress</h2>
        <button
          className="px-4 py-2 text-white rounded-md border border-solid cursor-pointer bg-zinc-800 border-white border-opacity-10 duration-[0.2s] transition-[background-color] hover:bg-zinc-700"
          onClick={() => setShowInputForm(!showInputForm)}
        >
          Add Entry
        </button>
      </header>

      {showInputForm && (
        <AddEntryForm
          newWeight={newWeight}
          setNewWeight={setNewWeight}
          newKcal={newKcal}
          setNewKcal={setNewKcal}
          newProtein={newProtein}
          setNewProtein={setNewProtein}
          addNewData={addNewData}
        />
      )}

      <WeightChart />
    </section>
  );
};

export default WeightProgressSection;
