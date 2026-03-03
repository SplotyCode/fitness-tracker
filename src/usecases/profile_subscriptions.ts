import type {NutritionGoals} from "../domain/nutrition";
import type {ProfileSettings} from "../domain/profile";
import {defaultProfileSettings} from "../domain/profile";
import {
  subscribeNutritionGoals,
  saveNutritionGoals as save,
  subscribeProfileSettings,
  saveProfileSettings as saveSettings,
} from "../repositories/profile";
import type {Unsubscribe} from "../repositories/types";
import type {SubscribeOptions} from "./types";
import {getDefaultNutritionGoal} from "./nutrition";

export const subscribeNutritionGoalsOrInit = (
  userId: string,
  onGoals: (goals: NutritionGoals[]) => void,
  options: SubscribeOptions
): Unsubscribe => {
  return subscribeNutritionGoals(
    userId,
    async (goals: NutritionGoals[] | null, hasPendingWrites: boolean) => {
      options.onPendingWrites("profile", hasPendingWrites);
      if (goals && goals.length > 0) {
        onGoals(goals);
      } else {
        const defaults = [getDefaultNutritionGoal()];
        onGoals(defaults);
        try {
          await save(userId, defaults);
        } catch (err) {
          console.error("Failed to save default nutrition goals for user", userId, err);
        }
      }
    }
  );
};

export const saveNutritionGoals = async (
  userId: string,
  goals: NutritionGoals[]
): Promise<void> => {
  await save(userId, goals);
};

export const subscribeProfileSettingsOrInit = (
  userId: string,
  onSettings: (settings: ProfileSettings) => void,
  options: SubscribeOptions
): Unsubscribe => {
  return subscribeProfileSettings(
    userId,
    async (settings: ProfileSettings | null, hasPendingWrites: boolean) => {
      options.onPendingWrites("profile", hasPendingWrites);
      if (settings) {
        onSettings(settings);
      } else {
        onSettings(defaultProfileSettings);
        try {
          await saveSettings(userId, defaultProfileSettings);
        } catch (err) {
          console.error("Failed to save default profile settings for user", userId, err);
        }
      }
    }
  );
};

export const saveProfileSettings = async (
  userId: string,
  settings: ProfileSettings
): Promise<void> => {
  await saveSettings(userId, settings);
};
