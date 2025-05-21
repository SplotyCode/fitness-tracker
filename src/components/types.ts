export interface DayData {
  date: string;
  kcal: number | null;
  protein: number | null;
  targetReached: boolean;
  weight: number | null;
}

export interface WeekData {
  weekNum: number;
  weeklyKcalAvg: number;
  weightDiff: number;
  days: DayData[];
}

export interface EditEntryFormProps {
  entryData: DayData;
  onSave: (updatedData: { kcal: number | null, protein: number | null, weight: number | null }) => void;
  onCancel: () => void;
}

export interface ProgressBarProps {
  current: number | null;
  target: number;
  isGoodWhenLower?: boolean;
}

export interface DayCardProps {
  day: DayData;
  targetKcal: number;
  targetProtein: number;
  onSaveDay: (date: string, updatedDayData: { kcal: number | null, protein: number | null, weight: number | null }) => void;
}

export interface WeekCardProps {
  week: WeekData;
  targetKcal: number;
  targetProtein: number;
  onSaveDay: (date: string, updatedDayData: { kcal: number | null, protein: number | null, weight: number | null }) => void;
}

export interface WeightProgressSectionProps {}

export interface WeeklyDataSectionProps {
  weeklyData: WeekData[] | null;
  targetKcal: number | null;
  targetProtein: number | null;
  onSaveDay: (date: string, updatedDayData: { kcal: number | null, protein: number | null, weight: number | null }) => void;
}
