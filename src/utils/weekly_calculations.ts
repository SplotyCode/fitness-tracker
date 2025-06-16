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

export const toUtcMidnight = (d: Date): Date => new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));

export const isSameDateTime = (a: Date, b: Date): boolean => a.getTime() === b.getTime();

export const fillAndGroupDays = (dayDocs: DayData[]): WeekData[] => {
  const today = toUtcMidnight(new Date());
  const sortedDays = dayDocs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let start: Date;
  if (dayDocs.length !== 0) {
    start = toUtcMidnight(new Date(sortedDays[0].date));
  } else {
    start = toUtcMidnight(getMonday(today));
  }
  return generateWeeksFromRange(start, today, sortedDays);
};

const generateWeeksFromRange = (startDate: Date, endDate: Date, existingDays: DayData[]): WeekData[] => {
  const weeks: WeekData[] = [];
  const currentDay = new Date(startDate);

  while (currentDay <= endDate) {
    const isoDate = currentDay.toISOString();
    const monday = getMonday(currentDay);

    let week = weeks[weeks.length - 1];
    if (!week || !isSameDateTime(getMonday(new Date(week.days[0]?.date)), monday)) {
      const newWeek: WeekData = {
        weekNum: week ? week.weekNum + 1 : 1,
        days: []
      };
      weeks.push(newWeek);
      week = newWeek;
    }

    const existingDay = existingDays.find(d => d.date === isoDate);

    if (existingDay) {
      week.days.push(existingDay);
    } else {
      week.days.push({
        date: isoDate,
        kcal: null,
        protein: null,
        fat: null,
        weight: null,
      });
    }
    currentDay.setDate(currentDay.getDate() + 1);
  }
  weeks.forEach(week => week.days.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  return weeks;
}
