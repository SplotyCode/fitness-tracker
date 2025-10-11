import { useEffect, useMemo, useState } from "react";
import {deleteSet, subscribeTrainingSets, updateSet} from "../repositories/trainings";
import { Training, TrainingSet, ExerciseId } from "../domain/training";
import { addBilateralSet, addUnilateralSet, endSession, deleteSession, buildProgressMatrix, getLastExerciseDefaultsFromPreviousTraining } from "../usecases/training_session";

export function useTrainingModal(
    userId: string,
    trainingId: string,
    trainings: { id: string; data: Training }[]
) {
    const [sets, setSets] = useState<{ id: string; data: TrainingSet }[]>([]);
    const [hasPendingWrites, setHasPendingWrites] = useState(false);

    useEffect(() => {
        const unsubS = subscribeTrainingSets(userId, trainingId, (arr, pending) => {
            setHasPendingWrites(pending);
            setSets(arr);
        });
        return () => { unsubS(); };
    }, [userId, trainingId]);

    const actions = useMemo(() => ({
        addBilateral: (p: { exerciseId: ExerciseId; weightKg: number; reps: number; rpe?: number }) =>
            addBilateralSet({ userId, trainingId: trainingId, ...p }),
        addUnilateral: (p: { exerciseId: ExerciseId; weightLeftKg: number; weightRightKg: number; repsLeft: number; repsRight: number; rpe?: number }) =>
            addUnilateralSet({ userId, trainingId: trainingId, ...p }),
        updateSet: (setId: string, data: Partial<TrainingSet>) =>
            updateSet(userId, trainingId, setId, data),
        deleteSet: (setId: string) => deleteSet(userId, trainingId, setId),
        end: () => endSession({ userId, trainingId: trainingId }),
        remove: () => deleteSession({ userId, trainingId: trainingId }),
        progressFor: (exerciseId: ExerciseId, trainingsLimit = 5) =>
            buildProgressMatrix({ userId, exerciseId, trainingsLimit }, trainings),
        lastDefaultsFromPrev: (exerciseId: ExerciseId) =>
            getLastExerciseDefaultsFromPreviousTraining({ userId, currentTrainingId: trainingId, exerciseId }, trainings),
    }), [userId, trainingId, trainings]);

    return { sets, hasPendingWrites, ...actions };
}
