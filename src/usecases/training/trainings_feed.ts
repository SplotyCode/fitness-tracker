import type { SubscribeOptions } from "../types";
import type { Unsubscribe } from "../../repositories/types";
import {subscribeTrainings as subscribe} from "../../repositories/trainings";
import {Training} from "../../domain/training";

export const subscribeTrainings = (
  userId: string,
  onTrainings: (arr: { id: string; data: Training }[]) => void,
  options: SubscribeOptions
): Unsubscribe => {
  return subscribe(
    userId,
    (arr, hasPendingWrites) => {
      options.onPendingWrites("trainings", hasPendingWrites);
      onTrainings(arr);
    }
  );
};

export type TrainingsByDayDto = Record<string, { id: string; data: Training }[]>;

export const groupTrainingsByDay = (
  trainings: { id: string; data: Training }[]
): TrainingsByDayDto => {
  const byDay: TrainingsByDayDto = {};
  for (const t of trainings) {
    const key = t.data.day;
    if (!(key in byDay)) {
      byDay[key] = [];
    }
    byDay[key].push(t);
  }
  return byDay;
};
