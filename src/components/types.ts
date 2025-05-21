export interface DayData {
  date: string;
  kcal: number | null;
  protein: number | null;
  weight: number | null;
}

export interface WeekData {
  weekNum: number;
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
  reached: boolean;
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
  lastWeekAvgWeight: number | null;
}
