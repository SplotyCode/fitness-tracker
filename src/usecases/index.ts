import type { DayData, WeekData, DayUpdateData, NutritionGoals } from "../domain";
import { getDefaultNutritionGoal } from "../utils/nutrition";
import { fillAndGroupDays } from "../utils/weekly_calculations";
import type { DaysRepository, ProfileRepository, TrainingsRepository, Unsubscribe } from "../repositories";

export interface SubscribeOptions {
  onPendingWrites?: (key: string, hasPendingWrites: boolean) => void;
}

export const subscribeWeeklyData = (
  userId: string,
  daysRepo: DaysRepository,
  onWeeks: (weeks: WeekData[]) => void,
  options?: SubscribeOptions
): Unsubscribe => {
  return daysRepo.subscribeDays(
    userId,
    (days: DayData[], hasPendingWrites: boolean) => {
      options?.onPendingWrites?.("days", hasPendingWrites);
      onWeeks(fillAndGroupDays(days));
    }
  );
};

export const saveDayData = async (
  userId: string,
  repo: DaysRepository,
  dateIso: string,
  data: DayUpdateData
): Promise<void> => {
  await repo.saveDay(userId, dateIso, data);
};

export const subscribeNutritionGoalsOrInit = (
  userId: string,
  repo: ProfileRepository,
  onGoals: (goals: NutritionGoals[]) => void,
  options?: SubscribeOptions
): Unsubscribe => {
  return repo.subscribeNutritionGoals(
    userId,
    async (goals: NutritionGoals[] | null, hasPendingWrites: boolean) => {
      options?.onPendingWrites?.("profile", hasPendingWrites);
      if (goals && goals.length > 0) {
        onGoals(goals);
      } else {
        const defaults = [getDefaultNutritionGoal()];
        onGoals(defaults);
        try {
            await repo.saveNutritionGoals(userId, defaults);
        } catch (err) {
          // Log the error to avoid silently swallowing initialization failures
          console.error("Failed to save default nutrition goals for user", userId, err);
        }
      }
    }
  );
};

export const saveNutritionGoals = async (
  userId: string,
  repo: ProfileRepository,
  goals: NutritionGoals[]
): Promise<void> => {
  await repo.saveNutritionGoals(userId, goals);
};

export const subscribeTrainings = <TTraining,>(
  userId: string,
  repo: TrainingsRepository<TTraining>,
  onTrainings: (arr: { id: string; data: TTraining }[]) => void,
  options?: SubscribeOptions
): Unsubscribe => {
  return repo.subscribeTrainings(
    userId,
    (arr, hasPendingWrites) => {
      options?.onPendingWrites?.("trainings", hasPendingWrites);
      onTrainings(arr);
    }
  );
};

export const groupTrainingsByDay = <TTraining extends { day: string }>(
  trainings: { id: string; data: TTraining }[]
): Record<string, { id: string; data: TTraining }[]> => {
  const byDay: Record<string, { id: string; data: TTraining }[]> = {};
  for (const t of trainings) {
    const key = t.data.day;
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(t);
  }
  return byDay;
};
