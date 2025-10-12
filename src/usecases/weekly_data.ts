import type {DayData, WeekData, DayUpdateData} from "../domain/nutrition";
import {saveDay, subscribeDays} from "../repositories/days";
import type {Unsubscribe} from "../repositories/types";
import type {SubscribeOptions} from "./types";
import {fillAndGroupDays} from "./weekly_calculations";

export const subscribeWeeklyData = (
  userId: string,
  onWeeks: (weeks: WeekData[]) => void,
  options: SubscribeOptions
): Unsubscribe => {
  return subscribeDays(
    userId,
    (days: DayData[], hasPendingWrites: boolean) => {
      options.onPendingWrites("days", hasPendingWrites);
      onWeeks(fillAndGroupDays(days));
    }
  );
};

export const saveDayData = async (
  userId: string,
  dateIso: string,
  data: DayUpdateData
): Promise<void> => {
  await saveDay(userId, dateIso, data);
};
