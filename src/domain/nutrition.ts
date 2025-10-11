export enum NutritionColor {
  RED = "red",
  YELLOW = "yellow",
  GREEN = "green",
}

export interface Level {
  value: number;
  color: NutritionColor;
}

export interface DayData {
  date: string;
  kcal: number | null;
  protein: number | null;
  fat: number | null;
  weight: number | null;
}

export interface WeekData {
  weekNum: number;
  days: DayData[];
}

export interface DayUpdateData {
  kcal: number | null;
  protein: number | null;
  fat: number | null;
  weight: number | null;
}

export interface NutritionGoals {
  validFrom: string; // ISO date string
  kcalLevels: Level[];
  proteinLevels: Level[];
  fatLevels: Level[];
}
