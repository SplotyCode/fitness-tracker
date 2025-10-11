import { useEffect, useMemo, useState } from "react";
import { TrainingsRepository } from "../repositories";
import { Training, TrainingSet, ExerciseId } from "../domain";
import { addBilateralSet, addUnilateralSet, endSession, deleteSession, buildProgressMatrix } from "../usecases/training_session";

export function useTrainingModal(
    repo: TrainingsRepository<Training>,
    userId: string,
    trainingId?: string
) {
    const [training, setTraining] = useState<{ id: string; data: Training } | null>(null);
    const [sets, setSets] = useState<{ id: string; data: TrainingSet }[]>([]);
    const [hasPendingWrites, setHasPendingWrites] = useState(false);

    useEffect(() => {
        if (!userId || !trainingId) return;
        const unsubT = repo.subscribeTrainings(userId, (arr, pending) => {
            setHasPendingWrites(pending);
            const t = arr.find(x => x.id === trainingId) ?? null;
            setTraining(t);
        });
        const unsubS = repo.subscribeTrainingSets(userId, trainingId, (arr, pending) => {
            setHasPendingWrites(pending);
            setSets(arr);
        });
        return () => { unsubT(); unsubS(); };
    }, [userId, trainingId]);

    const actions = useMemo(() => ({
        addBilateral: (p: { exerciseId: ExerciseId; weightKg: number; reps: number; rpe?: number }) =>
            addBilateralSet(repo, { userId, trainingId: trainingId!, ...p }),
        addUnilateral: (p: { exerciseId: ExerciseId; weightLeftKg: number; weightRightKg: number; repsLeft: number; repsRight: number; rpe?: number }) =>
            addUnilateralSet(repo, { userId, trainingId: trainingId!, ...p }),
        updateSet: (setId: string, data: Partial<TrainingSet>) =>
            repo.updateSet(userId, trainingId!, setId, data),
        deleteSet: (setId: string) =>
            repo.deleteSet(userId, trainingId!, setId),
        end: () => endSession(repo, { userId, trainingId: trainingId! }),
        remove: () => deleteSession(repo, { userId, trainingId: trainingId! }),
        progressFor: (exerciseId: ExerciseId, trainingsLimit = 5) =>
            buildProgressMatrix(repo, { userId, exerciseId, trainingsLimit }),
    }), [userId, trainingId]);

    return { training, sets, hasPendingWrites, ...actions };
}
