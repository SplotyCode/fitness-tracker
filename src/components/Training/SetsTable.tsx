import { JSX, useState } from "react";
import { TrainingSet } from "../../domain/training";

const SetsTable = ({
  setsToday, unilateral, onUpdateSet, onDeleteSet
}: {
    setsToday: { id: string; data: TrainingSet }[];
    unilateral: boolean;
    onUpdateSet: (setId: string, data: Partial<TrainingSet>) => Promise<void>;
    onDeleteSet: (setId: string) => Promise<void>;
}): JSX.Element => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TrainingSet>({} as TrainingSet);

  const startEdit = (s: { id: string; data: TrainingSet }): void => {
    setEditingId(s.id);
    setDraft(s.data);
  };

  const save = async (): Promise<void> => {
    if (!editingId) return;
    await onUpdateSet(editingId, draft);
    setEditingId(null);
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
          {setsToday.map((s, idx) => {
            const isEditing = editingId === s.id;
            const row = isEditing ? draft : s.data;

            return (
              <tr key={s.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="py-2">{idx + 1}</td>
                {unilateral ? (
                  <>
                    {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
                    <td>{isEditing ? <Num v={row.weightLeftKg} onChange={n => setDraft({ ...row, weightLeftKg: n })} /> : row.mode === "unilateral" ? row.weightLeftKg : "—"}</td>
                    {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
                    <td>{isEditing ? <Num v={row.repsLeft} onChange={n => setDraft({ ...row, repsLeft: n })} /> : row.mode === "unilateral" ? row.repsLeft : "—"}</td>
                    {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
                    <td>{isEditing ? <Num v={row.weightRightKg} onChange={n => setDraft({ ...row, weightRightKg: n })} /> : row.mode === "unilateral" ? row.weightRightKg : "—"}</td>
                    {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
                    <td>{isEditing ? <Num v={row.repsRight} onChange={n => setDraft({ ...row, repsRight: n })} /> : row.mode === "unilateral" ? row.repsRight : "—"}</td>
                  </>
                ) : (
                  <>
                    {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
                    <td>{isEditing ? <Num v={(row).weightKg} onChange={n => setDraft({ ...row, weightKg: n })} /> : row.mode === "bilateral" ? row.weightKg : "—"}</td>
                    {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
                    <td>{isEditing ? <Num v={(row).reps} onChange={n => setDraft({ ...row, reps: n })} /> : row.mode === "bilateral" ? row.reps : "—"}</td>
                  </>
                )}
                <td className="text-right">
                  {isEditing ? (
                    <div className="flex gap-2 justify-end">
                      <button className="px-2 py-1 rounded bg-emerald-600" onClick={save}>Save</button>
                      <button className="px-2 py-1 rounded bg-neutral-600" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  ) : (
                    <div className="flex gap-2 justify-end">
                      <button className="px-2 py-1 rounded bg-neutral-700" onClick={() => startEdit(s)}>Edit</button>
                      <button className="px-2 py-1 rounded bg-red-600" onClick={() => onDeleteSet(s.id)}>Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SetsTable;

const Num = ({ v, onChange }: { v: number; onChange: (n: number) => void }): JSX.Element => {
  return (
    <input
      type="number"
      className="w-20 bg-neutral-700 rounded-lg px-2 py-1"
      value={v}
      onChange={(e) => onChange(Number(e.target.value))}
      step="0.5"
    />
  );
}
