import {JSX, useEffect, useMemo, useState} from "react";
import {
  EXERCISES,
  EXERCISE_MOVEMENT_LABELS,
  ExerciseId,
  Exercise,
  ExerciseMovement,
  MuscleGroup,
  MUSCLE_GROUP_LABELS,
  TrainingSet,
  Training,
  getExercise,
} from "../../domain/training";
import {subscribeTrainingSets, updateSet as repoUpdateSet, deleteSet as repoDeleteSet, addSet as repoAddSet} from "../../repositories/trainings";
import {endSession, deleteSession, buildProgressMatrix, getLastExerciseDefaultsFromPreviousTraining} from "../../usecases/training/training_session";
import ExerciseCard from "./ExerciseCard";
import RestTimerPill from "./RestTimerPill";
import {FaFlagCheckered, FaTrashAlt} from "react-icons/fa";

interface Props {
    userId: string;
    trainingId: string;
    onClose: () => void;
    trainings: { id: string; data: Training }[];
}

const TrainingModal = ({
  userId, trainingId, onClose, trainings,
}: Props): JSX.Element | null => {
  interface TrainingSetEntry { id: string; data: TrainingSet }

  const [sets, setSets] = useState<TrainingSetEntry[]>([]);

  useEffect(() => {
    const unsub = subscribeTrainingSets(userId, trainingId, (arr) => {
      setSets(arr);
    });
    return () => { unsub(); };
  }, [userId, trainingId]);

  const actions = useMemo(() => ({
    add: (set: TrainingSet) =>
      repoAddSet(userId, trainingId, set),
    updateSet: (setId: string, data: Partial<TrainingSet>) =>
      repoUpdateSet(userId, trainingId, setId, data),
    deleteSet: (setId: string) => repoDeleteSet(userId, trainingId, setId),
    end: () => endSession({userId, trainingId}),
    remove: () => deleteSession({userId, trainingId}),
    progressFor: (exerciseId: ExerciseId, trainingsLimit?: number) =>
      buildProgressMatrix({userId, exerciseId, trainingsLimit}, trainings),
    lastDefaultsFromPrev: (exerciseId: ExerciseId) =>
      getLastExerciseDefaultsFromPreviousTraining({userId, currentTrainingId: trainingId, exerciseId}, trainings),
  }), [userId, trainingId, trainings]);

  const {add, updateSet, deleteSet, end, remove, progressFor, lastDefaultsFromPrev} = actions;

  const [openExerciseId, setOpenExerciseId] = useState<ExerciseId | null>(null);
  const [addedExerciseIds, setAddedExerciseIds] = useState<ExerciseId[]>([]);
  const [lastSaved, setLastSaved] = useState<{ exerciseId: ExerciseId; at: number } | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const setsByExercise = useMemo(() => {
    const map: Record<string, { id: string; data: TrainingSet }[]> = {};
    for (const s of sets) {
      (map[s.data.exerciseId] ??= []).push(s);
    }
    return map;
  }, [sets]);

  const exerciseGroups = useMemo(() => {
    const currentMovements = new Set(
      addedExerciseIds.map((exerciseId) => getExercise(exerciseId).movement)
    );
    const groups = new Map<string, { movement: ExerciseMovement; muscleGroup: MuscleGroup; exercises: Exercise[] }>();
    for (const exercise of EXERCISES) {
      const label = `${EXERCISE_MOVEMENT_LABELS[exercise.movement]} - ${MUSCLE_GROUP_LABELS[exercise.muscleGroup]}`;
      const existing = groups.get(label);
      if (existing) {
        existing.exercises.push(exercise);
      } else {
        groups.set(label, {movement: exercise.movement, muscleGroup: exercise.muscleGroup, exercises: [exercise]});
      }
    }
    return Array.from(groups.entries())
      .sort(([, a], [, b]) => {
        const movementPriorityDiff = Number(currentMovements.has(b.movement)) - Number(currentMovements.has(a.movement));
        if (movementPriorityDiff !== 0) return movementPriorityDiff;

        const movementDiff = EXERCISE_MOVEMENT_LABELS[a.movement].localeCompare(EXERCISE_MOVEMENT_LABELS[b.movement]);
        if (movementDiff !== 0) return movementDiff;

        return MUSCLE_GROUP_LABELS[a.muscleGroup].localeCompare(MUSCLE_GROUP_LABELS[b.muscleGroup]);
      })
      .map(([label, group]) => ({
        label,
        exercises: [...group.exercises].sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [addedExerciseIds]);

  useEffect(() => {
    const existing = Object.keys(setsByExercise);
    setAddedExerciseIds(prev => Array.from(new Set<ExerciseId>([...prev, ...existing])));
  }, [setsByExercise]);

  const handleAddSet = async <T extends TrainingSet>(
    payload: Omit<T, "pauseSec" | "trainingId">
  ): Promise<void> => {
    const now = Date.now();
    const pauseSec = lastSaved && lastSaved.exerciseId === payload.exerciseId
      ? Math.max(0, Math.round((now - lastSaved.at) / 1000))
      : 0;
    const set = {...payload, pauseSec} as T;
    await add(set);
    setLastSaved({exerciseId: payload.exerciseId, at: now});
  };

  const handleEnd = async (): Promise<void> => {
    onClose();
    try {
      await end();
    } catch (error) {
      console.error("Failed to end training", error);
    }
  };
  const handleDelete = async (): Promise<void> => {
    onClose();
    try {
      await remove();
    } catch (error) {
      console.error("Failed to delete training", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 bg-neutral-800 text-white border border-white/10">
        <header className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Training</h3>
          <div className="flex items-center gap-3">
            {lastSaved && (
              <RestTimerPill
                seconds={getExercise(lastSaved.exerciseId).restSec}
                at={lastSaved.at}
              />
            )}
            <button className="h-11 px-4 rounded-2xl bg-neutral-700 hover:bg-neutral-600 flex items-center justify-center" onClick={handleEnd} aria-label="End session" title="End session">
              <FaFlagCheckered />
            </button>
            {confirmingDelete ? (
              <>
                <button
                  className="h-11 px-4 rounded-2xl bg-neutral-700 hover:bg-neutral-600 text-sm"
                  onClick={() => setConfirmingDelete(false)}
                >
                  Cancel
                </button>
                <button
                  className="h-11 px-4 rounded-2xl bg-red-600 hover:bg-red-500 flex items-center justify-center gap-2"
                  onClick={handleDelete}
                  aria-label="Confirm delete session"
                  title="Confirm delete session"
                >
                  <FaTrashAlt />
                  <span className="text-sm">Delete?</span>
                </button>
              </>
            ) : (
              <button
                className="h-11 px-4 rounded-2xl bg-red-600 hover:bg-red-500 flex items-center justify-center"
                onClick={() => setConfirmingDelete(true)}
                aria-label="Delete session"
                title="Delete session"
              >
                <FaTrashAlt />
              </button>
            )}
          </div>
        </header>

        <div className="mb-4">
          <label className="block text-sm mb-2">Add exercise</label>
          <select
            className="w-full bg-neutral-700 rounded-xl p-3"
            onChange={(e) => {
              const openExerciseId = e.target.value;
              setAddedExerciseIds(prev => prev.includes(openExerciseId) ? prev : [...prev, openExerciseId]);
              setOpenExerciseId(openExerciseId);
            }}
            value={""}
          >
            <option value="" disabled={true}>Select exercise…</option>
            {exerciseGroups.map(group => (
              <optgroup key={group.label} label={group.label}>
                {group.exercises.map(e => {
                  const disabled = addedExerciseIds.includes(e.id);
                  return (
                    <option key={e.id} value={e.id} disabled={disabled}>
                      {e.name}{disabled ? " (✓)" : ""}
                    </option>
                  );
                })}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-4">
          {addedExerciseIds.map(exId => {
            const ex = getExercise(exId);
            return (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                isOpen={openExerciseId === ex.id}
                onToggle={() => setOpenExerciseId(openExerciseId === ex.id ? null : ex.id)}
                setsToday={setsByExercise[ex.id] ?? []}
                onAddSet={handleAddSet}
                onUpdateSet={(setId, data) => updateSet(setId, data)}
                onDeleteSet={(setId) => deleteSet(setId)}
                loadProgress={(trainingsLimit) => progressFor(ex.id, trainingsLimit)}
                loadLastDefaults={() => lastDefaultsFromPrev(ex.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TrainingModal;
