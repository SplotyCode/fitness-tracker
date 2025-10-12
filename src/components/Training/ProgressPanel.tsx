import {JSX, useEffect, useState} from "react";
import {ProgressMatrix} from "../../usecases/training/training_session";

const ProgressPanel = ({loadProgress}: { loadProgress: () => Promise<ProgressMatrix> }): JSX.Element => {
  const [mx, setMx] = useState<ProgressMatrix | null>(null);

  useEffect(() => {
    let alive = true;
    loadProgress().then(m => { if (alive) setMx(m); });
    return () => { alive = false; };
  }, [loadProgress]);

  if (!mx) return <div className="text-sm text-zinc-400">Loading progress…</div>;

  return (
    <div className="mt-2 p-3 rounded-xl bg-white/5">
      <div className="overflow-x-auto">
        <table className="text-sm">
          <thead className="text-zinc-400">
            <tr>
              <th className="text-left p-2">Set</th>
              {mx.sessions.map((s, i) => (
                <th key={i} className="text-left p-2">
                  {new Date(s.date).toLocaleDateString()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mx.rows.map((r, ri) => (
              <tr key={ri} className="border-t border-white/10">
                <td className="p-2">{r.label}</td>
                {mx.sessions.map((_, ci) => {
                  const cell = mx.cells[ri][ci];
                  return (
                    <td key={ci} className="p-2">
                      {cell
                        ? (
                          <div className="flex items-center gap-2">
                            <span>{cell.weight}×{cell.reps}</span>
                            {ci < mx.sessions.length - 1 && (cell.deltaReps || cell.deltaWeight)
                              ? <Delta w={cell.deltaWeight ?? 0} r={cell.deltaReps ?? 0} />
                              : null}
                          </div>
                        )
                        : <span className="text-zinc-500">—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const Delta = ({w, r}: { w: number; r: number }): JSX.Element => {
  const both = [];
  if (w !== 0) both.push(`${w > 0 ? "+" : ""}${w}kg`);
  if (r !== 0) both.push(`${r > 0 ? "+" : ""}${r}r`);
  const txt = both.join(" / ");
  const color = (w > 0 || r > 0) ? "bg-emerald-700" : (w < 0 || r < 0) ? "bg-amber-700" : "bg-neutral-700";
  return <span className={`text-xs px-2 py-0.5 rounded-full ${color}`}>{txt}</span>;
}


export default ProgressPanel;
