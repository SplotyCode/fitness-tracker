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

export interface EditEntryFormProps {
  entryData: DayData;
  onSave: (updatedData: DayUpdateData) => void;
  onCancel: () => void;
}

export interface DayCardProps {
  day: DayData;
  onSaveDay: (date: string, updatedDayData: DayUpdateData) => void;
  nutritionGoals: NutritionGoals;
}

export interface WeekCardProps {
  week: WeekData;
  onSaveDay: (date: string, updatedDayData: DayUpdateData) => void;
  lastWeekAvgWeight: number | null;
  initialIsOpen: boolean;
  nutritionGoals: NutritionGoals;
}
