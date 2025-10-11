import {JSX, useEffect, useMemo, useState} from "react";
import {EXERCISES, ExerciseId, TrainingSet, Training, getExercise} from "../../domain";
import { useTrainingModal } from "../../hooks/useTrainingModal";
import ExerciseCard from "./ExerciseCard";
import RestTimerPill from "./RestTimerPill";
import {TrainingsRepository} from "../../repositories";

interface Props {
    userId: string;
    training: { id: string; data: any };
    onClose: () => void;
    repo: TrainingsRepository<Training>;
}

export default function TrainingModal({
                                          userId, training, onClose, repo,
                                      }: Props): JSX.Element | null {
    const trainingId = training.id;

    const { sets, end, remove, addBilateral, addUnilateral, updateSet, deleteSet, progressFor } =
        useTrainingModal(repo, userId, trainingId);

    const [openExerciseId, setOpenExerciseId] = useState<ExerciseId | null>(null);
    const [addedExerciseIds, setAddedExerciseIds] = useState<ExerciseId[]>([]);
    const [lastSaved, setLastSaved] = useState<{ exerciseId: ExerciseId; at: number } | null>(null);

    const setsByExercise = useMemo(() => {
        const map: Record<string, { id: string; data: TrainingSet }[]> = {};
        for (const s of sets) {
            (map[s.data.exerciseId] ??= []).push(s);
        }
        return map;
    }, [sets]);

    useEffect(() => {
        const existing = Object.keys(setsByExercise) as ExerciseId[];
        setAddedExerciseIds(prev => Array.from(new Set<ExerciseId>([...prev, ...existing])));
    }, [setsByExercise]);

    const handleAddSet = async (payload:
                                    | { mode: "bilateral"; exerciseId: ExerciseId; weightKg: number; reps: number; rpe?: number }
                                    | { mode: "unilateral"; exerciseId: ExerciseId; weightLeftKg: number; weightRightKg: number; repsLeft: number; repsRight: number; rpe?: number }
    ) => {
        if (payload.mode === "bilateral") {
            await addBilateral(payload);
            setLastSaved({ exerciseId: payload.exerciseId, at: Date.now() });
        } else {
            await addUnilateral(payload);
            setLastSaved({ exerciseId: payload.exerciseId, at: Date.now() });
        }
    };

    const handleEnd = async () => { await end(); onClose(); };
    const handleDelete = async () => { await remove(); onClose(); };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
            <div className="w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 bg-neutral-800 text-white border border-white/10">
                <header className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Training – {training?.data?.day ?? ""}</h3>
                    <div className="flex items-center gap-3">
                        {lastSaved?.exerciseId && (
                            <RestTimerPill
                                key={`${lastSaved.exerciseId}-${lastSaved.at}`}
                                seconds={30}
                            />
                        )}
                        <button className="px-3 py-2 rounded-xl bg-neutral-700 hover:bg-neutral-600" onClick={handleEnd}>End session</button>
                        <button className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500" onClick={handleDelete}>Delete session</button>
                    </div>
                </header>

                <div className="mb-4">
                    <label className="block text-sm mb-2">Add exercise</label>
                    <select
                        className="w-full bg-neutral-700 rounded-xl p-3"
                        onChange={(e) => {
                            const openExerciseId = e.target.value as ExerciseId;
                            setAddedExerciseIds(prev => prev.includes(openExerciseId) ? prev : [...prev, openExerciseId]);
                            setOpenExerciseId(openExerciseId);
                        }}
                        value={""}
                    >
                        <option value="" disabled>Select exercise…</option>
                        {EXERCISES.map(e => {
                            const disabled = addedExerciseIds.includes(e.id);
                            return (
                                <option key={e.id} value={e.id} disabled={disabled}>
                                    {e.name}{disabled ? " (added)" : ""}
                                </option>
                            );
                        })}
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
                                loadProgress={() => progressFor(ex.id, 5)}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
