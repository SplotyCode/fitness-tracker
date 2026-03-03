import {Timestamp} from "firebase/firestore";
import {
  ExerciseId, Training, TrainingSet, getExercise,
} from "../../domain/training";
import {deleteTraining, saveTraining, subscribeTrainingSets} from "../../repositories/trainings";

export interface ProgressCell {
    weight: number | null;
    reps: number | null;
    side?: "L" | "R";
    deltaReps?: number | null;
    deltaWeight?: number | null;
}

export interface ProgressMatrix {
    sessions: { trainingId: string; date: string }[];   // columns (most recent first)
    rows: { label: string; setIndex: number; side?: "L" | "R" }[]; // rows
    cells: (ProgressCell | null)[][]; // [row][col]
}

export async function endSession(
  {userId, trainingId}: { userId: string; trainingId: string }
): Promise<void> {
  await saveTraining(userId, trainingId, {endedAt: Timestamp.now()} as Partial<Training>);
}

export async function deleteSession(
  {userId, trainingId}: { userId: string; trainingId: string }
): Promise<void> {
  await deleteTraining(userId, trainingId);
}

export async function buildProgressMatrix(
  params: { userId: string; exerciseId: ExerciseId; trainingsLimit: number },
  preloadedTrainings: { id: string; data: Training }[]
): Promise<ProgressMatrix> {
  const {userId, exerciseId, trainingsLimit} = params;

  const allTrainings: { id: string; data: Training }[] = [...preloadedTrainings].sort((a,b) =>
    b.data.startedAt.toMillis() - a.data.startedAt.toMillis()
  );
  const perTrainingSets: { trainingId: string; date: string; sets: TrainingSet[] }[] = [];
  for (const training of allTrainings) {
    if (perTrainingSets.length >= trainingsLimit) break;
    let sets: { id: string; data: TrainingSet }[] = [];
    await new Promise<void>((resolve, reject) => {
      const unsub = subscribeTrainingSets(
        userId, training.id,
        (arr) => { sets = arr; unsub(); resolve(); },
        reject
      );
    });
    const exerciseSets = sets
      .map(s => s.data)
      .filter(s => s.exerciseId === exerciseId);
    if (exerciseSets.length === 0) continue;
    const dateIso = training.data.startedAt.toDate().toISOString()
    perTrainingSets.push({trainingId: training.id, date: dateIso, sets: exerciseSets});
  }

  const isUnilateral = getExercise(exerciseId).isUnilateral;
  const maxSets = Math.max(1, ...perTrainingSets.map(x =>
    x.sets.filter(s => s.exerciseId === exerciseId).length
  ));

  const rows: ProgressMatrix["rows"] = [];
  for (let i = 0; i < maxSets; i++) {
    if (isUnilateral) {
      rows.push({label: `Set ${i + 1} L`, setIndex: i, side: "L"});
      rows.push({label: `Set ${i + 1} R`, setIndex: i, side: "R"});
    } else {
      rows.push({label: `Set ${i + 1}`, setIndex: i});
    }
  }

  const sessions = perTrainingSets.map(t => ({trainingId: t.trainingId, date: t.date}));

  const cells: (ProgressCell | null)[][] = rows.map(() => Array.from({length: sessions.length}, () => null as ProgressCell | null));

  for (let col = 0; col < sessions.length; col++) {
    const {sets} = perTrainingSets[col];
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      const base = sets.find(s => s.setIndex === row.setIndex);
      if (!base) { cells[r][col] = null; continue; }

      if (isUnilateral && base.mode === "unilateral") {
        const weight = row.side === "L" ? base.weightLeftKg : base.weightRightKg;
        const reps   = row.side === "L" ? base.repsLeft     : base.repsRight;
        cells[r][col] = {weight, reps, side: row.side};
      } else if (!isUnilateral && base.mode === "bilateral") {
        cells[r][col] = {weight: base.weightKg, reps: base.reps};
      } else {
        cells[r][col] = null;
      }
    }
  }

  for (let col = 0; col < sessions.length - 1; col++) {
    for (let r = 0; r < rows.length; r++) {
      const cur = cells[r][col];
      const prev = cells[r][col + 1];
      if (cur && prev && cur.weight != null && prev.weight != null && cur.reps != null && prev.reps != null) {
        cur.deltaWeight = Number((cur.weight - prev.weight).toFixed(1));
        cur.deltaReps = cur.reps - prev.reps;
      }
    }
  }

  return {sessions, rows, cells};
}


export type LastDefaults =
  | { mode: "bilateral"; weightKg: number; reps: number }
  | { mode: "unilateral"; weightLeftKg: number; weightRightKg: number; repsLeft: number; repsRight: number };

export async function getLastExerciseDefaultsFromPreviousTraining(
  params: { userId: string; currentTrainingId: string; exerciseId: ExerciseId },
  preloadedTrainings: { id: string; data: Training }[]
): Promise<LastDefaults | null> {
  const {userId, currentTrainingId, exerciseId} = params;

  const allTrainings: { id: string; data: Training }[]= [...preloadedTrainings].sort(
    (a, b) => b.data.startedAt.toMillis() - a.data.startedAt.toMillis()
  );

  const idx = allTrainings.findIndex((t) => t.id === currentTrainingId);
  // Start from the session just before current, then older ones
  for (let i = idx >= 0 ? idx + 1 : 0; i < allTrainings.length; i++) {
    const t = allTrainings[i];
    let sets: { id: string; data: TrainingSet }[] = [];
    await new Promise<void>((resolve, reject) => {
      const unsub = subscribeTrainingSets(
        userId,
        t.id,
        (arr) => {
          sets = arr;
          unsub();
          resolve();
        },
        reject
      );
    });
    const exSets = sets
      .map((s) => s.data)
      .filter((s) => s.exerciseId === exerciseId);
    if (exSets.length === 0) continue;

    exSets.sort((a: TrainingSet, b: TrainingSet) => {
      const ai = a.setIndex;
      const bi = b.setIndex;
      if (ai !== bi) return ai - bi;
      const at = a.performedAt.toMillis();
      const bt = b.performedAt.toMillis();
      return at - bt;
    });
    const first = exSets[0];
    if (first.mode === "unilateral") {
      const u = first;
      return {
        mode: "unilateral",
        weightLeftKg: u.weightLeftKg,
        weightRightKg: u.weightRightKg,
        repsLeft: u.repsLeft,
        repsRight: u.repsRight,
      };
    } else {
      const b = first;
      return {mode: "bilateral", weightKg: b.weightKg, reps: b.reps};
    }
  }

  return null;
}
