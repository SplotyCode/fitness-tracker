import { JSX, useEffect, useState } from "react";
import { ExerciseId, TrainingSet } from "../../domain/training";
import {FaEdit, FaSave, FaTrashAlt, FaTimes} from "react-icons/fa";
import QuickInputs from "./QuickInputs";

const SetsTable = ({
  setsToday, unilateral, onUpdateSet, onDeleteSet, exerciseId, onAddSet, loadLastDefaults
}: {
    setsToday: { id: string; data: TrainingSet }[];
    unilateral: boolean;
    onUpdateSet: (setId: string, data: Partial<TrainingSet>) => Promise<void>;
    onDeleteSet: (setId: string) => Promise<void>;
    exerciseId: ExerciseId;
    onAddSet: (
      payload:
        | { mode: "bilateral"; exerciseId: ExerciseId; weightKg: number; reps: number; rpe?: number }
        | { mode: "unilateral"; exerciseId: ExerciseId; weightLeftKg: number; weightRightKg: number; repsLeft: number; repsRight: number; rpe?: number }
    ) => Promise<void>;
    loadLastDefaults: () => Promise<
      | { mode: "bilateral"; weightKg: number; reps: number }
      | { mode: "unilateral"; weightLeftKg: number; weightRightKg: number; repsLeft: number; repsRight: number }
      | null
    >;
}): JSX.Element => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TrainingSet>({} as TrainingSet);

  const startEdit = (set: { id: string; data: TrainingSet }): void => {
    setEditingId(set.id);
    setDraft(set.data);
  };

  const save = async (): Promise<void> => {
    if (!editingId) return;
    await onUpdateSet(editingId, draft);
    setEditingId(null);
  };

  const [newBilat, setNewBilat] = useState<{ weightKg: number; reps: number }>({ weightKg: 20, reps: 8 });
  const [newUni, setNewUni] = useState<{ weightLeftKg: number; weightRightKg: number; repsLeft: number; repsRight: number }>({ weightLeftKg: 20, weightRightKg: 20, repsLeft: 8, repsRight: 8 });

  useEffect(() => {
    let cancelled = false;
    const load = async (): Promise<void> => {
      try {
        const last = await loadLastDefaults();
        if (cancelled || !last) return;
        if (!unilateral && last.mode === "bilateral") {
          setNewBilat({ weightKg: last.weightKg, reps: last.reps });
        } else if (unilateral && last.mode === "unilateral") {
          setNewUni({
            weightLeftKg: last.weightLeftKg,
            weightRightKg: last.weightRightKg,
            repsLeft: last.repsLeft,
            repsRight: last.repsRight,
          });
        }
      } catch (e) {
        console.error("Failed to load last defaults", e);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [loadLastDefaults, unilateral]);

  const saveNew = async (): Promise<void> => {
    if (unilateral) {
      await onAddSet({
        mode: "unilateral",
        exerciseId,
        weightLeftKg: newUni.weightLeftKg,
        weightRightKg: newUni.weightRightKg,
        repsLeft: newUni.repsLeft,
        repsRight: newUni.repsRight,
      });
    } else {
      await onAddSet({
        mode: "bilateral",
        exerciseId,
        weightKg: newBilat.weightKg,
        reps: newBilat.reps,
      });
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-zinc-400">
          <tr>
            <th className="text-left py-2">#</th>
            {unilateral ? (
              <>
                <th className="text-left">W-L</th><th className="text-left">R-L</th>
                <th className="text-left">W-R</th><th className="text-left">R-R</th>
              </>
            ) : (
              <>
                <th className="text-left">Weight</th><th className="text-left">Reps</th>
              </>
            )}
            <th />
          </tr>
        </thead>
        <tbody>
          {setsToday.map((set, idx) => {
            const isEditing = editingId === set.id;
            const row = isEditing ? draft : set.data;

            return (
              <tr key={set.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="py-2">{idx + 1}</td>
                {unilateral ? (
                  <>
                    {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
                    <td>{isEditing ? <QuickInputs value={row.weightLeftKg} onChange={n => setDraft({ ...row, weightLeftKg: n })} /> : row.mode === "unilateral" ? row.weightLeftKg : "—"}</td>
                    {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
                    <td>{isEditing ? <QuickInputs value={row.repsLeft} onChange={n => setDraft({ ...row, repsLeft: n })} /> : row.mode === "unilateral" ? row.repsLeft : "—"}</td>
                    {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
                    <td>{isEditing ? <QuickInputs value={row.weightRightKg} onChange={n => setDraft({ ...row, weightRightKg: n })} /> : row.mode === "unilateral" ? row.weightRightKg : "—"}</td>
                    {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
                    <td>{isEditing ? <QuickInputs value={row.repsRight} onChange={n => setDraft({ ...row, repsRight: n })} /> : row.mode === "unilateral" ? row.repsRight : "—"}</td>
                  </>
                ) : (
                  <>
                    {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
                    <td>{isEditing ? <QuickInputs value={(row).weightKg} onChange={n => setDraft({ ...row, weightKg: n })} /> : row.mode === "bilateral" ? row.weightKg : "—"}</td>
                    {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
                    <td>{isEditing ? <QuickInputs value={(row).reps} onChange={n => setDraft({ ...row, reps: n })} /> : row.mode === "bilateral" ? row.reps : "—"}</td>
                  </>
                )}
                <td className="text-right">
                  {isEditing ? (
                    <div className="flex gap-2 justify-end">
                      <button className="p-2 rounded bg-emerald-600 text-white" onClick={save} aria-label="Save" title="Save">
                        <FaSave />
                      </button>
                      <button className="p-2 rounded bg-neutral-600 text-white" onClick={() => setEditingId(null)} aria-label="Cancel" title="Cancel">
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 justify-end">
                      <button className="p-2 rounded bg-neutral-700 text-white" onClick={() => startEdit(set)} aria-label="Edit" title="Edit">
                        <FaEdit />
                      </button>
                      <button className="p-2 rounded bg-red-600 text-white" onClick={() => onDeleteSet(set.id)} aria-label="Delete" title="Delete">
                        <FaTrashAlt />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
          {/* Virtual new set row for adding at the bottom */}
          <tr className="border-t border-white/10 bg-white/5">
            <td className="py-2">{setsToday.length + 1}</td>
            {unilateral ? (
              <>
                <td>
                  <QuickInputs value={newUni.weightLeftKg} onChange={(n) => setNewUni({ ...newUni, weightLeftKg: Math.max(0, Number(n.toFixed(1))) })} />
                </td>
                <td>
                  <QuickInputs value={newUni.repsLeft} onChange={(n) => setNewUni({ ...newUni, repsLeft: Math.max(0, Math.round(n)) })} />
                </td>
                <td>
                  <QuickInputs value={newUni.weightRightKg} onChange={(n) => setNewUni({ ...newUni, weightRightKg: Math.max(0, Number(n.toFixed(1))) })} />
                </td>
                <td>
                  <QuickInputs value={newUni.repsRight} onChange={(n) => setNewUni({ ...newUni, repsRight: Math.max(0, Math.round(n)) })} />
                </td>
              </>
            ) : (
              <>
                <td>
                  <QuickInputs value={newBilat.weightKg} onChange={(n) => setNewBilat({ ...newBilat, weightKg: Math.max(0, Number(n.toFixed(1))) })} />
                </td>
                <td>
                  <QuickInputs value={newBilat.reps} onChange={(n) => setNewBilat({ ...newBilat, reps: Math.max(0, Math.round(n)) })} />
                </td>
              </>
            )}
            <td className="text-right">
              <div className="flex gap-2 justify-end">
                <button className="p-2 rounded bg-emerald-600 text-white" onClick={saveNew} aria-label="Save new set" title="Save new set">
                  <FaSave />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SetsTable;
