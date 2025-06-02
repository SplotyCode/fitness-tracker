import { WeekData, DayData } from "../components/types";

export const calculateAverageForWeek = (
  week: WeekData,
  key: keyof Pick<DayData, "kcal" | "weight" | "protein" | "fat">
): number | null => {
  const validDays = week.days.filter(day => day[key] !== null);
  if (validDays.length === 0) {
    return null;
  }
  const total = validDays.reduce((sum, day) => sum + (day[key] || 0), 0);
  return total / validDays.length;
};

export const getMonday = (d: Date): Date => {
  const date = new Date(d);
  const diff = (date.getDay() + 6) % 7; // 0 (Sun) → 6, 1 (Mon) → 0, ..., 6 (Sat) → 5
  date.setDate(date.getDate() - diff);
  date.setHours(0);
  return date;
};

export const toUtcMidnight = (d: Date): Date => new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))

export const isSameDateTime = (a: Date, b: Date): boolean => a.getTime() === b.getTime();
