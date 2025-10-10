import type { DayData, DayUpdateData, NutritionGoals } from "../domain";
import type { TrainingSet, ExerciseId } from "../domain";

export type Unsubscribe = () => void;

export interface DaysRepository {
  subscribeDays(userId: string, cb: (days: DayData[], hasPendingWrites: boolean) => void, onError?: (e: unknown) => void): Unsubscribe;
  saveDay(userId: string, dateIso: string, data: DayUpdateData): Promise<void>;
}

export interface ProfileRepository {
  subscribeNutritionGoals(
    userId: string,
    cb: (goals: NutritionGoals[] | null, hasPendingWrites: boolean) => void,
    onError?: (e: unknown) => void
  ): Unsubscribe;
  saveNutritionGoals(userId: string, goals: NutritionGoals[]): Promise<void>;
}

export interface TrainingsRepository<TTraining> {
  subscribeTrainings(
    userId: string,
    cb: (trainings: { id: string; data: TTraining }[], hasPendingWrites: boolean) => void,
    onError?: (e: unknown) => void
  ): Unsubscribe;

  newTrainingId(userId: string): string;
  saveTraining(userId: string, trainingId: string, data: Partial<TTraining>): Promise<void>;
  deleteTraining(userId: string, trainingId: string): Promise<void>;

  subscribeTrainingSets(
    userId: string,
    trainingId: string,
    cb: (sets: { id: string; data: TrainingSet }[], hasPendingWrites: boolean) => void,
    onError?: (e: unknown) => void
  ): Unsubscribe;
  addSet(userId: string, trainingId: string, data: TrainingSet): Promise<{ id: string; data: TrainingSet }>;
  updateSet(userId: string, trainingId: string, setId: string, data: Partial<TrainingSet>): Promise<void>;
  deleteSet(userId: string, trainingId: string, setId: string): Promise<void>;

  getRecentExerciseHistoryPoints(
    userId: string,
    exerciseId: ExerciseId,
    trainingsLimit: number
  ): Promise<{ date: string; weight: number }[]>;
}
