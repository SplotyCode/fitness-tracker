import { JSX, useState } from "react";
import { TrainingSet } from "../../domain/training";

export default function SetsTable({
                                      setsToday, unilateral, onUpdateSet, onDeleteSet
                                  }: {
    setsToday: { id: string; data: TrainingSet }[];
    unilateral: boolean;
    onUpdateSet: (setId: string, data: Partial<TrainingSet>) => Promise<void>;
    onDeleteSet: (setId: string) => Promise<void>;
}): JSX.Element {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draft, setDraft] = useState<any>({});

    const startEdit = (s: { id: string; data: TrainingSet }) => {
        setEditingId(s.id);
        setDraft(s.data);
    };

    const save = async () => {
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
                                    <td>{isEditing ? <Num v={row.weightLeftKg} onChange={n => setDraft({ ...row, weightLeftKg: n })} /> : row.mode === "unilateral" ? row.weightLeftKg : "—"}</td>
                                    <td>{isEditing ? <Num v={row.repsLeft} onChange={n => setDraft({ ...row, repsLeft: n })} /> : row.mode === "unilateral" ? row.repsLeft : "—"}</td>
                                    <td>{isEditing ? <Num v={row.weightRightKg} onChange={n => setDraft({ ...row, weightRightKg: n })} /> : row.mode === "unilateral" ? row.weightRightKg : "—"}</td>
                                    <td>{isEditing ? <Num v={row.repsRight} onChange={n => setDraft({ ...row, repsRight: n })} /> : row.mode === "unilateral" ? row.repsRight : "—"}</td>
                                </>
                            ) : (
                                <>
                                    <td>{isEditing ? <Num v={(row as any).weightKg} onChange={n => setDraft({ ...row, weightKg: n })} /> : row.mode === "bilateral" ? (row as any).weightKg : "—"}</td>
                                    <td>{isEditing ? <Num v={(row as any).reps} onChange={n => setDraft({ ...row, reps: n })} /> : row.mode === "bilateral" ? (row as any).reps : "—"}</td>
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
}

function Num({ v, onChange }: { v: number; onChange: (n: number) => void }) {
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
