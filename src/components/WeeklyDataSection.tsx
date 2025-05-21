import React from "react";

import { WeeklyDataSectionProps } from "./types";
import WeekCard from "./WeekCard";

const WeeklyDataSection: React.FC<WeeklyDataSectionProps> = ({
  weeklyData,
  targetKcal,
  targetProtein,
}) => {
  if (!weeklyData || !targetKcal || !targetProtein) {
    return null;
  }

  return (
    <section className="flex flex-col gap-6">
      {weeklyData.map((week, index) => (
        <WeekCard
          key={index}
          week={week}
          targetKcal={targetKcal}
          targetProtein={targetProtein}
        />
      ))}
    </section>
  );
};

export default WeeklyDataSection;
