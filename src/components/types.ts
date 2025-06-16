import {Level} from "../utils/nutrition";

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
  validFrom: string;
  kcalLevels: Level[];
  proteinLevels: Level[];
  fatLevels: Level[];
}
