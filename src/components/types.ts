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

export type DayUpdateData = {
  kcal: number | null;
  protein: number | null;
  weight: number | null;
};

export interface EditEntryFormProps {
  entryData: DayData;
  onSave: (updatedData: DayUpdateData) => void;
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
  onSaveDay: (date: string, updatedDayData: DayUpdateData) => void;
}

export interface WeekCardProps {
  week: WeekData;
  targetKcal: number;
  targetProtein: number;
  onSaveDay: (date: string, updatedDayData: DayUpdateData) => void;
  lastWeekAvgWeight: number | null;
}
