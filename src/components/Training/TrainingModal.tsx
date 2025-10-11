import {JSX, useEffect, useMemo, useState} from "react";
import {EXERCISES, ExerciseId, TrainingSet, Training} from "../../domain/training";
import { useTrainingModal } from "../../hooks/useTrainingModal";
import ExerciseCard from "./ExerciseCard";
import RestTimerPill from "./RestTimerPill";
import {Timestamp} from "firebase/firestore";
import {TrainingsRepository} from "../../repositories";

interface Props {
    open: boolean;
    userId: string;
    training?: { id: string; data: any } | null;
    onClose: () => void;
    onSaved?: () => void;
    onDeleted?: () => void;
    repo: TrainingsRepository<Training>;
}

export default function TrainingModal({
                                          open, userId, training, onClose, onSaved, onDeleted, repo,
                                      }: Props): JSX.Element | null {
    const [createdTrainingId, setCreatedTrainingId] = useState<string | undefined>(undefined);
    const ensuredTrainingId = training?.id ?? createdTrainingId;

    useEffect(() => {
        if (!open) return;
        if (training?.id) return;
        if (createdTrainingId) return;

        const createNow = async () => {
            const id = repo.newTrainingId(userId);
            const isoDay = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
            await repo.saveTraining(userId, id, {
                day: isoDay,
                startedAt: Timestamp.now(),
                endedAt: null,
            } as Partial<Training>);
            setCreatedTrainingId(id);
        };
        void createNow();
    }, [open, training?.id, createdTrainingId, repo, userId]);
    const { sets, end, remove, addBilateral, addUnilateral, updateSet, deleteSet, progressFor } =
        useTrainingModal(repo, userId, ensuredTrainingId);

    const [openExerciseId, setOpenExerciseId] = useState<ExerciseId | null>(null);
    const [lastSaved, setLastSaved] = useState<{ exerciseId: ExerciseId; at: number } | null>(null);

    const setsByExercise = useMemo(() => {
        const map: Record<string, { id: string; data: TrainingSet }[]> = {};
        for (const s of sets) {
            (map[s.data.exerciseId] ??= []).push(s);
        }
        return map;
    }, [sets]);

    if (!open) return null;

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
        onSaved?.();
    };

    const handleEnd = async () => { await end(); onSaved?.(); onClose(); };
    const handleDelete = async () => { await remove(); onDeleted?.(); onClose(); };

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
                        <button className="px-3 py-2 rounded-xl bg-neutral-700" onClick={onClose}>Close</button>
                    </div>
                </header>

                {/* Add exercise dropdown */}
                <div className="mb-4">
                    <label className="block text-sm mb-2">Add exercise</label>
                    <select
                        className="w-full bg-neutral-700 rounded-xl p-3"
                        onChange={(e) => setOpenExerciseId(e.target.value as ExerciseId)}
                        value={openExerciseId ?? ""}
                    >
                        <option value="" disabled>Select exercise…</option>
                        {EXERCISES.map(e => (
                            <option key={e.id} value={e.id}>{e.name}</option>
                        ))}
                    </select>
                </div>

                {/* Exercise cards */}
                <div className="flex flex-col gap-4">
                    {EXERCISES.map(ex => (
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
                    ))}
                </div>
            </div>
        </div>
    );
}
