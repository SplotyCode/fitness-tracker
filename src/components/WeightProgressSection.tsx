import React from "react";

import { WeightProgressSectionProps } from "./types";
import WeightChart from "./WeightChart";

const WeightProgressSection: React.FC<WeightProgressSectionProps> = (
  {}
) => {
  return (
    <section className="p-8 rounded-3xl border border-solid bg-white bg-opacity-10 border-white border-opacity-10">
      <header className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Weight Progress</h2>
      </header>
      <WeightChart />
    </section>
  );
};

export default WeightProgressSection;
