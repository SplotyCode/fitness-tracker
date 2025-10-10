import React, {useEffect, useMemo, useState} from "react";
import { Timestamp } from "firebase/firestore";
import { EXERCISES, ExerciseId, Training, TrainingSet, BilateralSet, UnilateralSet } from "../domain";
import { FaTimes, FaTrashAlt } from "react-icons/fa";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { FirestoreTrainingsRepository } from "../repositories/firestore";

interface TrainingModalProps {
  open: boolean;
  userId: string;
  training: { id: string; data: Training } | null;
  onClose: () => void;
  onSaved: (training: { id: string; data: Training }) => void;
  onDeleted: (trainingId: string) => void;
}

const TrainingModal: React.FC<TrainingModalProps> = ({ open, userId, training, onClose, onSaved, onDeleted }) => {
  const [startedAt, setStartedAt] = useState<string>(new Date().toISOString().slice(0, 16));
  const [day, setDay] = useState<string>(new Date().toISOString().slice(0, 10));
  const [sets, setSets] = useState<{ id: string; data: TrainingSet }[]>([]);
  const [createdDoc, setCreatedDoc] = useState<boolean>(false);
  const [editingSetId, setEditingSetId] = useState<string | null>(null);

  const trainingsRepo = useMemo(() => new FirestoreTrainingsRepository<Training>(), []);

  const [exerciseId, setExerciseId] = useState<ExerciseId | "">("");
  const [mode, setMode] = useState<"bilateral" | "unilateral">("bilateral");
  const [reps, setReps] = useState<number>(10);
  const [weightKg, setWeightKg] = useState<number>(30);
  const [repsLeft, setRepsLeft] = useState<number>(10);
  const [repsRight, setRepsRight] = useState<number>(10);
  const [weightLeftKg, setWeightLeftKg] = useState<number>(15);
  const [weightRightKg, setWeightRightKg] = useState<number>(15);
  const [rpe, setRpe] = useState<number>(7);
  const [pauseSec, setPauseSec] = useState<number>(90);
  const [pauseCountdown, setPauseCountdown] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [historyPoints, setHistoryPoints] = useState<{ date: string; weight: number }[]>([]);

  useEffect(() => {
    if (training) {
      setDay(training.data.day);
      setStartedAt(new Date(training.data.startedAt.toDate()).toISOString().slice(0, 16));
    } else {
      const now = new Date();
      setDay(now.toISOString().slice(0, 10));
      setStartedAt(now.toISOString().slice(0, 16));
    }
    const tId = training?.id;
    if (!tId) {
      setSets([]);
      return;
    }
    const unsubscribe = trainingsRepo.subscribeTrainingSets(userId, tId, (arr) => {
      setSets(arr);
    }, (e) => {
      console.error("Failed to subscribe sets:", e);
    });
    return () => unsubscribe();
  }, [training, userId, trainingsRepo]);

  const trainingId = useMemo(() => training?.id ?? trainingsRepo.newTrainingId(userId), [training, userId, trainingsRepo]);

  useEffect(() => {
    const ensureDoc = async (): Promise<void> => {
      if (training) return;
      if (createdDoc) return;
      try {
        const data: Training = {
          day,
          startedAt: Timestamp.fromDate(new Date(startedAt)),
          endedAt: null,
        } as Training;
        await trainingsRepo.saveTraining(userId, trainingId, data);
        setCreatedDoc(true);
      } catch (e) {
        console.error("Failed to create training:", e);
      }
    };
    void ensureDoc();
  }, [training, createdDoc, day, startedAt, trainingId, userId, trainingsRepo]);

  useEffect(() => {
    const saveDay = async (): Promise<void> => {
      try {
        await trainingsRepo.saveTraining(userId, trainingId, { day } as Partial<Training>);
      } catch (e) {
        console.error("Failed to update training day:", e);
      }
    };
    void saveDay();
  }, [day, trainingId, userId, trainingsRepo]);

  useEffect(() => {
    const loadHistory = async (): Promise<void> => {
      if (!exerciseId) {
        setHistoryPoints([]);
        return;
      }
      try {
        const points = await trainingsRepo.getRecentExerciseHistoryPoints(userId, exerciseId, 8);
        setHistoryPoints(points);
      } catch (e) {
        console.error("Failed to load exercise history:", e);
        setHistoryPoints([]);
      }
    };
    void loadHistory();
  }, [exerciseId, userId, trainingsRepo]);

  const handleClose = async (): Promise<void> => {
    try {
      await trainingsRepo.saveTraining(userId, trainingId, { endedAt: Timestamp.now() } as Partial<Training>);
    } catch (e) {
      console.error("Failed to finalize training:", e);
    }
    onClose();
  };

  const handleDelete = async (): Promise<void> => {
    if (!training) return;
    if (!confirm("Delete this training?")) return;
    await trainingsRepo.deleteTraining(userId, training.id);
    onDeleted(training.id);
    onClose();
  };

  const exerciseNameById = (id: ExerciseId): string => EXERCISES.find(e => e.id === id)?.name ?? id;

  const lastPerformedAt = (): Timestamp => {
    if (sets.length === 0) return Timestamp.fromDate(new Date(startedAt));
    return sets[sets.length - 1].data.performedAt;
  };

  const getEditingSet = (): { id: string; data: TrainingSet } | null => {
    if (!editingSetId) return null;
    return sets.find(s => s.id === editingSetId) ?? null;
  };

  const loadSetIntoForm = (set: TrainingSet): void => {
    setExerciseId(set.exerciseId);
    setMode(set.mode);
    setRpe(set.rpe);
    setPauseSec(set.pauseSec);
    if (set.mode === "bilateral") {
      setReps(set.reps);
      setWeightKg(set.weightKg);
    } else {
      setRepsLeft(set.repsLeft);
      setRepsRight(set.repsRight);
      setWeightLeftKg(set.weightLeftKg);
      setWeightRightKg(set.weightRightKg);
    }
  };

  const persistEditedSet = async (updated: Partial<TrainingSet>): Promise<void> => {
    const editing = getEditingSet();
    if (!editing) return;
    const current = editing.data;
    const isBilateral = (updated.mode ?? current.mode) === "bilateral";
    const next: TrainingSet = isBilateral
      ? {
          ...(current as BilateralSet),
          mode: "bilateral",
          trainingId: current.trainingId,
          day,
          exerciseId: (updated.exerciseId ?? current.exerciseId) as ExerciseId,
          pauseSec: updated.pauseSec ?? current.pauseSec,
          setIndex: current.setIndex,
          rpe: updated.rpe ?? current.rpe,
          performedAt: current.performedAt,
          reps: (updated as Partial<BilateralSet>).reps ?? (current as BilateralSet).reps,
          weightKg: (updated as Partial<BilateralSet>).weightKg ?? (current as BilateralSet).weightKg,
        }
      : {
          ...(current as UnilateralSet),
          mode: "unilateral",
          trainingId: current.trainingId,
          day,
          exerciseId: (updated.exerciseId ?? current.exerciseId) as ExerciseId,
          pauseSec: updated.pauseSec ?? current.pauseSec,
          setIndex: current.setIndex,
          rpe: updated.rpe ?? current.rpe,
          performedAt: current.performedAt,
          repsLeft: (updated as Partial<UnilateralSet>).repsLeft ?? (current as UnilateralSet).repsLeft,
          repsRight: (updated as Partial<UnilateralSet>).repsRight ?? (current as UnilateralSet).repsRight,
          weightLeftKg: (updated as Partial<UnilateralSet>).weightLeftKg ?? (current as UnilateralSet).weightLeftKg,
          weightRightKg: (updated as Partial<UnilateralSet>).weightRightKg ?? (current as UnilateralSet).weightRightKg,
        };
    await trainingsRepo.updateSet(userId, trainingId, editing.id, next);
    setSets(prev => prev.map(s => (s.id === editing.id ? { id: s.id, data: next } : s)));
  };

  const handleExerciseChange = async (value: ExerciseId | ""): Promise<void> => {
    setExerciseId(value);
    if (editingSetId && value) await persistEditedSet({ exerciseId: value as ExerciseId });
  };
  const handleModeToggle = async (checked: boolean): Promise<void> => {
    const newMode = checked ? "unilateral" : "bilateral";
    setMode(newMode);
    if (editingSetId) await persistEditedSet({ mode: newMode } as Partial<TrainingSet>);
  };
  const handleRpeChange = async (value: number): Promise<void> => {
    setRpe(value);
    if (editingSetId) await persistEditedSet({ rpe: value });
  };
  const handlePauseSecChange = async (value: number): Promise<void> => {
    setPauseSec(value);
    if (editingSetId) await persistEditedSet({ pauseSec: value });
  };
  const handleRepsChange = async (value: number): Promise<void> => {
    setReps(value);
    if (editingSetId) await persistEditedSet({ reps: value } as Partial<TrainingSet>);
  };
  const handleWeightKgChange = async (value: number): Promise<void> => {
    setWeightKg(value);
    if (editingSetId) await persistEditedSet({ weightKg: value } as Partial<TrainingSet>);
  };
  const handleRepsLeftChange = async (value: number): Promise<void> => {
    setRepsLeft(value);
    if (editingSetId) await persistEditedSet({ repsLeft: value } as Partial<TrainingSet>);
  };
  const handleRepsRightChange = async (value: number): Promise<void> => {
    setRepsRight(value);
    if (editingSetId) await persistEditedSet({ repsRight: value } as Partial<TrainingSet>);
  };
  const handleWeightLeftChange = async (value: number): Promise<void> => {
    setWeightLeftKg(value);
    if (editingSetId) await persistEditedSet({ weightLeftKg: value } as Partial<TrainingSet>);
  };
  const handleWeightRightChange = async (value: number): Promise<void> => {
    setWeightRightKg(value);
    if (editingSetId) await persistEditedSet({ weightRightKg: value } as Partial<TrainingSet>);
  };

  const handleAddSet = async (): Promise<void> => {
    if (!exerciseId) return;
    const tId = training?.id ?? trainingId;
    const index = sets.length + 1;
    const base = {
      trainingId: tId,
      exerciseId: exerciseId as ExerciseId,
      pauseSec,
      setIndex: index,
      rpe,
      performedAt: Timestamp.fromDate(new Date(lastPerformedAt().toDate().getTime() + pauseSec * 1000)),
    } as const;

    let data: TrainingSet;
    if (mode === "bilateral") {
      data = { ...base, mode: "bilateral", reps, weightKg } as BilateralSet;
    } else {
      data = { ...base, mode: "unilateral", repsLeft, repsRight, weightLeftKg, weightRightKg } as UnilateralSet;
    }

    const created = await trainingsRepo.addSet(userId, tId, data);
    setSets(prev => [...prev, created]);
    if (!training) {
      onSaved({ id: tId, data: { day, startedAt: Timestamp.fromDate(new Date(startedAt)), endedAt: null } });
    }
    setPauseCountdown(pauseSec);
    setIsTimerRunning(true);
  };

  const handleRemoveSet = async (setId: string): Promise<void> => {
    const tId = training?.id;
    if (!tId) return;
    await trainingsRepo.deleteSet(userId, tId, setId);
    setSets(prev => prev.filter(s => s.id !== setId));
  };

  useEffect(() => {
    if (!isTimerRunning) return;
    if (pauseCountdown <= 0) {
      setIsTimerRunning(false);
      return;
    }
    const id = setInterval(() => {
      setPauseCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [isTimerRunning, pauseCountdown]);

  if (!open) return null;

  const isAdding = !training;
  const containerClasses = isAdding
    ? "relative w-full min-h-full h-auto max-w-full overflow-x-hidden overflow-y-visible rounded-none bg-zinc-900 p-4 sm:max-h-[90vh] sm:h-auto sm:max-w-xl sm:overflow-y-auto sm:rounded-2xl sm:p-6 shadow-xl"
    : "relative max-h-[90vh] w-full max-w-xl overflow-y-auto overflow-x-hidden rounded-2xl bg-zinc-900 p-6 shadow-xl";
  const headerClasses = isAdding
    ? "mb-4 flex items-center justify-between sticky top-0 z-10 bg-zinc-900/95"
    : "mb-6 flex items-center justify-between";
  const overlayClasses = isAdding
    ? "fixed inset-0 z-50 flex items-stretch justify-center bg-black/60 overflow-x-hidden overflow-y-auto p-0 sm:items-center sm:p-4"
    : "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4";

  return (
    <div className={overlayClasses}>
      <div className={containerClasses}>
        <header className={headerClasses}>
          <h2 className="text-xl font-semibold">{training ? "Edit Training" : "Add Training"}</h2>
          <button onClick={handleClose} className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white">
            <FaTimes />
          </button>
        </header>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-medium">Day</label>
            <input
              type="date"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full max-w-full rounded-lg border border-zinc-600 bg-zinc-800/50 p-2 text-white focus:border-indigo-400 focus:outline-none"
            />
          </div>
          <section className="rounded-xl border border-white/10 p-4">
            <h3 className="mb-3 text-lg font-medium">Add Set</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-zinc-300">Exercise</label>
                <select
                  value={exerciseId}
                  onChange={(e) => void handleExerciseChange(e.target.value as ExerciseId | "")}
                  className="w-full max-w-full rounded-md border border-white/20 bg-zinc-800/50 p-2 focus:border-indigo-400 focus:outline-none"
                >
                  <option value="" disabled>Select exercise</option>
                  {EXERCISES.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={mode === "unilateral"}
                  onChange={(e) => void handleModeToggle(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-indigo-600 focus:ring-indigo-500"
                />
                Unilateral
              </label>
              {mode === "bilateral" ? (
                <>
                  <div>
                    <label className="mb-1 block text-sm text-zinc-300">Reps</label>
                    <input type="number" value={reps} onChange={(e) => void handleRepsChange(parseInt(e.target.value || "0"))} className="w-full max-w-full rounded-md border border-white/20 bg-zinc-800/50 p-2" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-zinc-300">Weight (kg)</label>
                    <input type="number" step="0.5" value={weightKg} onChange={(e) => void handleWeightKgChange(parseFloat(e.target.value || "0"))} className="w-full max-w-full rounded-md border border-white/20 bg-zinc-800/50 p-2" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="mb-1 block text-sm text-zinc-300">Reps Left</label>
                    <input type="number" value={repsLeft} onChange={(e) => void handleRepsLeftChange(parseInt(e.target.value || "0"))} className="w-full max-w-full rounded-md border border-white/20 bg-zinc-800/50 p-2" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-zinc-300">Reps Right</label>
                    <input type="number" value={repsRight} onChange={(e) => void handleRepsRightChange(parseInt(e.target.value || "0"))} className="w-full max-w-full rounded-md border border-white/20 bg-zinc-800/50 p-2" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-zinc-300">Weight Left (kg)</label>
                    <input type="number" step="0.5" value={weightLeftKg} onChange={(e) => void handleWeightLeftChange(parseFloat(e.target.value || "0"))} className="w-full max-w-full rounded-md border border-white/20 bg-zinc-800/50 p-2" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-zinc-300">Weight Right (kg)</label>
                    <input type="number" step="0.5" value={weightRightKg} onChange={(e) => void handleWeightRightChange(parseFloat(e.target.value || "0"))} className="w-full max-w-full rounded-md border border-white/20 bg-zinc-800/50 p-2" />
                  </div>
                </>
              )}
              <div>
                <label className="mb-1 block text-sm text-zinc-300">RPE</label>
                <input type="number" min="1" max="10" step="0.5" value={rpe} onChange={(e) => void handleRpeChange(parseFloat(e.target.value || "0"))} className="w-full max-w-full rounded-md border border-white/20 bg-zinc-800/50 p-2" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-300">Pause (sec)</label>
                <input type="number" value={pauseSec} onChange={(e) => void handlePauseSecChange(parseInt(e.target.value || "0"))} className="w-full max-w-full rounded-md border border-white/20 bg-zinc-800/50 p-2" />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <button onClick={handleAddSet} disabled={!exerciseId || !!editingSetId} className="rounded-lg bg-emerald-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-emerald-900/50 hover:bg-emerald-500">Add Set</button>
                {editingSetId && (
                  <button onClick={() => setEditingSetId(null)} className="rounded-lg border border-zinc-500 px-3 py-2 text-zinc-300 hover:bg-zinc-800">Done</button>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="rounded bg-zinc-800 px-2 py-1 font-mono">{String(Math.floor(pauseCountdown / 60)).padStart(2, "0")}:{String(pauseCountdown % 60).padStart(2, "0")}</span>
                <button onClick={() => { setPauseCountdown(pauseSec); setIsTimerRunning(true); }} className="rounded bg-zinc-700 px-2 py-1 hover:bg-zinc-600">Start</button>
                <button onClick={() => setIsTimerRunning(false)} className="rounded bg-zinc-700 px-2 py-1 hover:bg-zinc-600">Stop</button>
                <button onClick={() => setPauseCountdown(0)} className="rounded bg-zinc-700 px-2 py-1 hover:bg-zinc-600">Reset</button>
              </div>
            </div>
            {exerciseId && historyPoints.length > 0 && (
              <div className="mt-4 h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyPoints} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" hide={true} />
                    <YAxis hide={true} domain={["auto", "auto"]} />
                    <Tooltip formatter={(v: number) => [`${v}kg`, "Weight"]} labelFormatter={(l) => new Date(l as string).toLocaleDateString()} contentStyle={{ backgroundColor: "#18181b", borderRadius: "8px" }} />
                    <Line dataKey="weight" stroke="#22c55e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section className="mt-4">
            <h3 className="mb-3 text-lg font-medium">Sets</h3>
            {sets.length === 0 ? (
              <div className="rounded-lg bg-zinc-800/30 p-3 text-center text-zinc-400">No sets yet.</div>
            ) : (
              <div className="space-y-2">
                {sets.map(s => (
                  <div
                    key={s.id}
                    className={`flex min-w-0 items-center justify-between gap-3 rounded-lg p-3 text-sm ${editingSetId === s.id ? "bg-zinc-700/50 ring-1 ring-zinc-600" : "bg-zinc-800/40"}`}
                    onClick={() => { setEditingSetId(s.id); loadSetIntoForm(s.data); }}
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="font-medium break-words">{exerciseNameById(s.data.exerciseId)}</span>
                      <span className="text-zinc-400 break-words">
                        {s.data.mode === "bilateral"
                          ? `${s.data.reps} reps @ ${s.data.weightKg}kg`
                          : `${s.data.repsLeft}/${s.data.repsRight} reps @ ${s.data.weightLeftKg}/${s.data.weightRightKg}kg`}
                        , RPE {s.data.rpe}, pause {s.data.pauseSec}s
                      </span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); void handleRemoveSet(s.id); }} className="shrink-0 rounded-md bg-red-600/70 px-3 py-1 text-white hover:bg-red-600">
                      <FaTrashAlt />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <footer className="mt-8 flex justify-between">
          {training && (
            <button onClick={handleDelete} className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-500">
              <FaTrashAlt /> Delete
            </button>
          )}
          <div className="ml-auto">
            <button onClick={handleClose} className="rounded-lg border border-zinc-500 px-4 py-2 text-zinc-300 transition hover:bg-zinc-800 hover:text-white">Close</button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default TrainingModal;
