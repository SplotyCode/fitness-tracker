import {Timestamp} from "firebase/firestore";

export type Equipment = "machine" | "dumbbell" | "loaded" | "cable";

export interface Exercise {
  id: string;
  name: string;
  equipment: Equipment;
  restSec: number;
  isUnilateral: boolean;
}

export const EXERCISES: readonly Exercise[] = [
  {id: "chest_press", name: "Chest Press", equipment: "machine", restSec: 3 * 60, isUnilateral: false},
  {id: "triceps_press", name: "Triceps Press", equipment: "machine", restSec: 2.5 * 60, isUnilateral: false},
  {id: "lat_pulldown_machine", name: "Lat pulldown machine", equipment: "machine", restSec: 3 * 60, isUnilateral: false},
  {id: "bicep_machine", name: "Bicep machine", equipment: "machine", restSec: 2.5 * 60, isUnilateral: false},
  {id: "reverse_butterfly_machine", name: "Reverse Butterfly", equipment: "machine", restSec: 2.5 * 60, isUnilateral: false},
  {id: "close_grip_rows_machine", name: "Close grip rows", equipment: "machine", restSec: 3 * 60, isUnilateral: false},
  {id: "t_row_machine", name: "T-row machine", equipment: "machine", restSec: 3 * 60, isUnilateral: false},
  {id: "shoulder_press", name: "Shoulder Press", equipment: "machine", restSec: 3 * 60, isUnilateral: false},
  {id: "katana_pull", name: "Katana Pull", equipment: "cable", restSec: 3 * 60, isUnilateral: false},
  {id: "flies_machine", name: "Flies", equipment: "machine", restSec: 3 * 60, isUnilateral: false},
  {id: "leg_extension_machine", name: "Leg extension machine", equipment: "machine", restSec: 3 * 60, isUnilateral: false},
  {id: "leg_curl_machine", name: "Leg curl machine", equipment: "machine", restSec: 3 * 60, isUnilateral: false},
  {id: "lateral_raises_machine", name: "Lateral raises machine", equipment: "machine", restSec: 2.5 * 60, isUnilateral: false},
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
