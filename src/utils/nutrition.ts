import {DayData, NutritionGoals, WeekData} from "../components/types";

export enum NutritionColor {
    RED = "red",
    YELLOW = "yellow",
    GREEN = "green",
}

export interface Level {
    value: number;
    color: NutritionColor;
}

const colorHexMap: Record<NutritionColor, string> = {
  [NutritionColor.RED]: "#f85149",
  [NutritionColor.YELLOW]: "#facc15",
  [NutritionColor.GREEN]: "#3fb950",
};

export function getColorHex(color: NutritionColor): string {
  return colorHexMap[color];
}
export const getOptimalValue = (sortedLevels: Level[]): number => {
  const level = sortedLevels.findIndex(value => value.color == NutritionColor.GREEN)
  if (level === -1) {
    return 0;
  }
  const min = sortedLevels[level].value;
  if (sortedLevels.length - 1 === min) {
    return min;
  }
  const max = sortedLevels[level + 1].value;
  return (max - min) / 2 + min;
}

export const getCurrentLevel = (
  currentValue: number | null,
  sortedLevels: Level[],
): Level | undefined => {
  if (!currentValue || sortedLevels.length === 0) {
    return undefined;
  }
  let activeIndex = 0;
  for (let i = 0; i < sortedLevels.length; i++) {
    if (currentValue >= sortedLevels[i].value) activeIndex = i;
    else break;
  }
  return sortedLevels[activeIndex];
}

export const getDayColor = (day: DayData, nutritionGoals: NutritionGoals): NutritionColor | null => {
  const kcal = getCurrentLevel(day.kcal, nutritionGoals.kcalLevels)?.color;
  const protein = getCurrentLevel(day.protein, nutritionGoals.proteinLevels)?.color;
  const fat = getCurrentLevel(day.fat, nutritionGoals.fatLevels)?.color;
  if (!kcal || !protein || !fat) {
    return null;
  }
  if (kcal === NutritionColor.RED || protein === NutritionColor.RED) {
    return NutritionColor.RED;
  }
  if (kcal === NutritionColor.YELLOW || protein === NutritionColor.YELLOW) {
    return NutritionColor.YELLOW;
  }
  return fat !== NutritionColor.RED ? NutritionColor.GREEN : NutritionColor.YELLOW;
}
export const getDefaultNutritionGoal = (): NutritionGoals => {
  return {
    validFrom: '1970-01-01T00:00:00.000Z',
    kcalLevels: [
      {value: 1100, color: NutritionColor.RED},
      {value: 1400, color: NutritionColor.YELLOW},
      {value: 1800, color: NutritionColor.GREEN},
      {value: 2400, color: NutritionColor.YELLOW},
      {value: 3200, color: NutritionColor.RED},
      {value: 3500, color: NutritionColor.RED},
    ],
    proteinLevels: [
      {value: 80, color: NutritionColor.RED},
      {value: 110, color: NutritionColor.YELLOW},
      {value: 170, color: NutritionColor.GREEN},
      {value: 250, color: NutritionColor.GREEN},
    ],
    fatLevels: [
      {value: 30, color: NutritionColor.RED},
      {value: 40, color: NutritionColor.YELLOW},
      {value: 50, color: NutritionColor.GREEN},
      {value: 80, color: NutritionColor.YELLOW},
    ],
  };
};
export const findNutritionGoalsForWeek = (week: WeekData, goals: NutritionGoals[]): NutritionGoals => {
  const weekStartDate = new Date(week.days[0].date);

  for (const goal of goals.reverse()) {
    if (new Date(goal.validFrom) <= weekStartDate) {
      return goal;
    }
  }

  return getDefaultNutritionGoal();
};