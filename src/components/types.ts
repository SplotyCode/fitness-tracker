export interface DayData {
  date: string;
  kcal: number;
  protein: number;
  targetReached: boolean;
}

export interface WeekData {
  weekNum: number;
  weeklyKcalAvg: number;
  weightDiff: number;
  days: DayData[];
}

export interface AddEntryFormProps {
  newWeight: number | null;
  setNewWeight: (value: number | null) => void;
  newKcal: number | null;
  setNewKcal: (value: number | null) => void;
  newProtein: number | null;
  setNewProtein: (value: number | null) => void;
  addNewData: () => void;
}

export interface ProgressBarProps {
  current: number;
  target: number;
  isGoodWhenLower?: boolean;
}

export interface DayCardProps {
  day: DayData;
  targetKcal: number;
  targetProtein: number;
}

export interface WeekCardProps {
  week: WeekData;
  targetKcal: number;
  targetProtein: number;
}

export interface WeightProgressSectionProps {
  showInputForm: boolean;
  setShowInputForm: (value: boolean) => void;
  newWeight: number | null;
  setNewWeight: (value: number | null) => void;
  newKcal: number | null;
  setNewKcal: (value: number | null) => void;
  newProtein: number | null;
  setNewProtein: (value: number | null) => void;
  addNewData: () => void;
}

export interface WeeklyDataSectionProps {
  weeklyData: WeekData[] | null;
  targetKcal: number | null;
  targetProtein: number | null;
}
