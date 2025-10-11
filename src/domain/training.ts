import { Timestamp } from "firebase/firestore";

export type Equipment = "machine" | "dumbbell" | "loaded" | "cable";

export interface Exercise {
  id: string;
  name: string;
  equipment: Equipment;
  restSec: number;
  isUnilateral: boolean;
}

export const EXERCISES: readonly Exercise[] = [
  { id: "chest_press", name: "Chest Press", equipment: "machine", restSec: 90, isUnilateral: false },
  { id: "triceps_press", name: "Triceps Press", equipment: "machine", restSec: 90, isUnilateral: false },
] as const;

export type ExerciseId = (typeof EXERCISES)[number]["id"];
const EXERCISE_BY_ID: Record<ExerciseId, (typeof EXERCISES)[number]> =
    Object.fromEntries(EXERCISES.map(e => [e.id, e])) as Record<ExerciseId, (typeof EXERCISES)[number]>;
export const getExercise = (id: ExerciseId): Exercise => EXERCISE_BY_ID[id];

export interface Training {
  day: string; // ISO date (YYYY-MM-DD)
  startedAt: Timestamp;
  endedAt?: Timestamp | null;
}

interface TrainingSetBase {
  trainingId: string;
  exerciseId: ExerciseId;
  performedAt: Timestamp;
  pauseSec: number;
  setIndex: number;
  rpe: number;
}

export interface BilateralSet extends TrainingSetBase {
  mode: "bilateral";
  reps: number;
  weightKg: number;
}

export interface UnilateralSet extends TrainingSetBase {
  mode: "unilateral";
  repsLeft: number;
  repsRight: number;
  weightLeftKg: number;
  weightRightKg: number;
}

export type TrainingSet = BilateralSet | UnilateralSet;
