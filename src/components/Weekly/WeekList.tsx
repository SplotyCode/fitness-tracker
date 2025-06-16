import {calculateAverageForWeek} from "../../utils/weekly_calculations";
import {findNutritionGoalsForWeek} from "../../utils/nutrition";
import WeekCard from "./WeekCard";
import {DayUpdateData, NutritionGoals, WeekData} from "../types";
import {JSX} from "react";

interface Props {
  weeks: WeekData[];
  onSaveDay: (date: string, data: DayUpdateData) => void;
  goals: NutritionGoals[];
}

const WeekList = ({weeks, onSaveDay, goals}: Props): JSX.Element  => {
  return (
    <section className="flex flex-col gap-6">
      {[...weeks].reverse().map((week, index) => {
        const originalIndex = weeks.length - 1 - index;
        const lastWeekAvgWeight = originalIndex > 0 ? calculateAverageForWeek(weeks[originalIndex - 1], "weight") : null;
        const goalsForWeek = findNutritionGoalsForWeek(week, goals);
        return (
          <WeekCard
            key={week.weekNum}
            week={week}
            onSaveDay={onSaveDay}
            lastWeekAvgWeight={lastWeekAvgWeight}
            initialIsOpen={index === 0}
            nutritionGoals={goalsForWeek}
          />
        );
      })}
    </section>
  )
}

export default WeekList;