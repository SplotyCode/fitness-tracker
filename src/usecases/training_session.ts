import { Timestamp } from "firebase/firestore";
import {
    ExerciseId, Training, TrainingSet, BilateralSet, UnilateralSet, getExercise,
} from "../domain";
import { TrainingsRepository } from "../repositories";

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

export async function addBilateralSet(
    repo: TrainingsRepository<Training>,
    params: {
        userId: string;
        trainingId: string;
        exerciseId: ExerciseId;
        weightKg: number;
        reps: number;
        rpe?: number;
        performedAt?: Timestamp;
    }
) {
    const {
        userId, trainingId, exerciseId, weightKg, reps, rpe = 0,
        performedAt = Timestamp.now(),
    } = params;

    let currentSets: { id: string; data: TrainingSet }[] = [];
    await new Promise<void>((resolve, reject) => {
        const unsub = repo.subscribeTrainingSets(
            userId, trainingId,
            (arr) => { currentSets = arr; unsub(); resolve(); },
            reject
        );
    });
    const setIndex = currentSets.filter(s => s.data.exerciseId === exerciseId).length;

    const restSec = 30;
    const data: BilateralSet = {
        trainingId, exerciseId, mode: "bilateral",
        weightKg, reps,
        rpe,
        pauseSec: restSec,
        setIndex, performedAt,
    };
    return repo.addSet(userId, trainingId, data);
}

export async function addUnilateralSet(
    repo: TrainingsRepository<Training>,
    params: {
        userId: string;
        trainingId: string;
        exerciseId: ExerciseId;
        weightLeftKg: number; weightRightKg: number;
        repsLeft: number; repsRight: number;
        rpe?: number; performedAt?: Timestamp;
    }
) {
    const {
        userId, trainingId, exerciseId,
        weightLeftKg, weightRightKg, repsLeft, repsRight,
        rpe = 0, performedAt = Timestamp.now(),
    } = params;

    let currentSets: { id: string; data: TrainingSet }[] = [];
    await new Promise<void>((resolve, reject) => {
        const unsub = repo.subscribeTrainingSets(
            userId, trainingId,
            (arr) => { currentSets = arr; unsub(); resolve(); },
            reject
        );
    });
    const setIndex = currentSets.filter(s => s.data.exerciseId === exerciseId).length;

    const restSec = 30;
    const data: UnilateralSet = {
        trainingId, exerciseId, mode: "unilateral",
        weightLeftKg, weightRightKg, repsLeft, repsRight,
        rpe, pauseSec: restSec,
        setIndex, performedAt,
    };
    return repo.addSet(userId, trainingId, data);
}

export async function endSession(
    repo: TrainingsRepository<Training>,
    { userId, trainingId }: { userId: string; trainingId: string }
) {
    await repo.saveTraining(userId, trainingId, { endedAt: Timestamp.now() } as Partial<Training>);
}

export async function deleteSession(
    repo: TrainingsRepository<Training>,
    { userId, trainingId }: { userId: string; trainingId: string }
) {
    await repo.deleteTraining(userId, trainingId);
}

export async function buildProgressMatrix(
    repo: TrainingsRepository<Training>,
    params: { userId: string; exerciseId: ExerciseId; trainingsLimit: number }
): Promise<ProgressMatrix> {
    const { userId, exerciseId, trainingsLimit } = params;

    let allTrainings: { id: string; data: Training }[] = [];
    await new Promise<void>((resolve, reject) => {
        const unsub = repo.subscribeTrainings(
            userId,
            (arr) => { allTrainings = arr.sort((a,b) =>
                ((b.data.startedAt as any).toMillis?.() ?? 0) - ((a.data.startedAt as any).toMillis?.() ?? 0)
            ); unsub(); resolve(); },
            reject
        );
    });
    const picked = allTrainings.slice(0, trainingsLimit);

    const perTrainingSets: { trainingId: string; date: string; sets: TrainingSet[] }[] = [];
    for (const t of picked) {
        let sets: { id: string; data: TrainingSet }[] = [];
        await new Promise<void>((resolve, reject) => {
            const unsub = repo.subscribeTrainingSets(
                userId, t.id,
                (arr) => { sets = arr; unsub(); resolve(); },
                reject
            );
        });
        const exerciseSets = sets
            .map(s => s.data)
            .filter(s => s.exerciseId === exerciseId);
        const dateIso = (t.data.startedAt as any)?.toDate?.().toISOString?.() ?? new Date().toISOString();
        perTrainingSets.push({ trainingId: t.id, date: dateIso, sets: exerciseSets });
    }

    const isUnilateral = getExercise(exerciseId).isUnilateral;
    const maxSets = Math.max(1, ...perTrainingSets.map(x =>
        x.sets.filter(s => s.exerciseId === exerciseId).length
    ));

    const rows: ProgressMatrix["rows"] = [];
    for (let i = 0; i < maxSets; i++) {
        if (isUnilateral) {
            rows.push({ label: `Set ${i + 1} L`, setIndex: i, side: "L" });
            rows.push({ label: `Set ${i + 1} R`, setIndex: i, side: "R" });
        } else {
            rows.push({ label: `Set ${i + 1}`, setIndex: i });
        }
    }

    const sessions = perTrainingSets.map(t => ({ trainingId: t.trainingId, date: t.date }));

    const cells: (ProgressCell | null)[][] = rows.map(() => Array(sessions.length).fill(null));

    for (let col = 0; col < sessions.length; col++) {
        const { sets } = perTrainingSets[col];
        for (let r = 0; r < rows.length; r++) {
            const row = rows[r];
            const base = sets.find(s => s.setIndex === row.setIndex);
            if (!base) { cells[r][col] = null; continue; }

            if (isUnilateral && base.mode === "unilateral") {
                const weight = row.side === "L" ? base.weightLeftKg : base.weightRightKg;
                const reps   = row.side === "L" ? base.repsLeft     : base.repsRight;
                cells[r][col] = { weight, reps, side: row.side };
            } else if (!isUnilateral && base.mode === "bilateral") {
                cells[r][col] = { weight: base.weightKg, reps: base.reps };
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

    return { sessions, rows, cells };
}
