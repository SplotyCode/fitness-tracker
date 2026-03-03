import {WeekData, DayData} from "../domain/nutrition";
import {Training} from "../domain/training";

const toUtcDayStart = (value: string | Date): Date => {
  const date = new Date(value);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

export const calculateAverageForWeek = (
  week: WeekData,
  key: keyof Pick<DayData, "kcal" | "weight" | "protein" | "fat">
): number | null => {
  const validDays = week.days.filter(day => day[key] !== null);
  if (validDays.length === 0) {
    return null;
  }
  const total = validDays.reduce((sum, day) => sum + (day[key] ?? 0), 0);
  return total / validDays.length;
};

export interface TrainingStats {
  strength: number;
  cardio: number;
  cardioKcal: number;
  cardioMin: number;
}

export const calculateTrainingStatsForWeek = (
  week: WeekData,
  trainingsByDay: Partial<Record<string, { id: string; data: Training }[]>> = {}
): TrainingStats => {
  return week.days.reduce<TrainingStats>((acc, day) => {
    const key = day.date.split('T')[0];
    for (const training of trainingsByDay[key] ?? []) {
      const type = training.data.type;
      if (type === "cardio") {
        acc.cardio += 1;
        const kcal = training.data.kcalBurnt;
        if (kcal != null) {
          acc.cardioKcal += kcal;
        }
        const startedAt = training.data.startedAt;
        const endedAt = training.data.endedAt;
        if (endedAt) {
          const minutes = Math.max(0, Math.round((endedAt.toMillis() - startedAt.toMillis()) / 60000));
          acc.cardioMin += minutes;
        }
      } else {
        acc.strength += 1;
      }
    }
    return acc;
  }, {strength: 0, cardio: 0, cardioKcal: 0, cardioMin: 0});
};

const getMonday = (d: Date): Date => {
  const date = new Date(d);
  const day = (date.getUTCDay() + 6) % 7; // 0 (So)→6, 1 (Mo)→0, ...
  date.setUTCDate(date.getUTCDate() - day);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

const isSameDateTime = (a: Date, b: Date): boolean => a.getTime() === b.getTime();

export const fillAndGroupDays = (dayDocs: DayData[]): WeekData[] => {
  const today = toUtcDayStart(new Date());
  const sortedDays = dayDocs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let start: Date;
  if (dayDocs.length !== 0) {
    start = toUtcDayStart(sortedDays[0].date);
  } else {
    start = getMonday(today);
  }
  return generateWeeksFromRange(start, today, sortedDays);
};

export const filterWeeksFromDate = (weeks: WeekData[], startDateIso: string): WeekData[] => {
  const startDate = toUtcDayStart(startDateIso).getTime();
  return weeks.filter((week) => week.days.some((day) => toUtcDayStart(day.date).getTime() >= startDate));
};

const generateWeeksFromRange = (startDate: Date, endDate: Date, existingDays: DayData[]): WeekData[] => {
  const weeks: WeekData[] = [];
  const currentDay = new Date(startDate);

  while (currentDay <= endDate) {
    const isoDate = currentDay.toISOString();
    const monday = getMonday(currentDay);

    let week = weeks.at(-1);
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
    currentDay.setUTCDate(currentDay.getUTCDate() + 1);
    currentDay.setUTCHours(0, 0, 0, 0);
  }
  weeks.forEach(week => week.days.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  return weeks;
}
