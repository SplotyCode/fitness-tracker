import { JSX, useState } from "react";
import { Exercise, ExerciseId } from "../../domain";

export default function QuickInputs({
                                        exercise,
                                        onAddSet,
                                    }: {
    exercise: Exercise;
    onAddSet: (payload:
                   | { mode: "bilateral"; exerciseId: ExerciseId; weightKg: number; reps: number; rpe?: number }
                   | { mode: "unilateral"; exerciseId: ExerciseId; weightLeftKg: number; weightRightKg: number; repsLeft: number; repsRight: number; rpe?: number }
    ) => Promise<void>;
}): JSX.Element {
    const [weightL, setWeightL] = useState(20);
    const [weightR, setWeightR] = useState(20);
    const [repsL, setRepsL] = useState(8);
    const [repsR, setRepsR] = useState(8);

    const step = (v: number, d: number) => Math.max(0, Number((v + d).toFixed(1)));

    const handleSave = async () => {
        if (exercise.id) {
            await onAddSet({
                mode: "unilateral",
                exerciseId: exercise.id as ExerciseId,
                weightLeftKg: weightL, weightRightKg: weightR,
                repsLeft: repsL, repsRight: repsR,
            });
            const prevLw = weightL, prevRw = weightR, prevLr = repsL, prevRr = repsR;
            setWeightL(prevRw); setWeightR(prevLw);
            setRepsL(prevRr); setRepsR(prevLr);
        } else {
            await onAddSet({
                mode: "bilateral",
                exerciseId: exercise.id as ExerciseId,
                weightKg: weightL,
                reps: repsL,
            });
        }
    };

    return (
        <div className="flex flex-wrap items-end gap-3">
            {exercise.isUnilateral ? (
                <>
                    <Input label="Weight L" value={weightL} onInc={() => setWeightL(step(weightL, +2.5))} onDec={() => setWeightL(step(weightL, -2.5))} />
                    <Input label="Reps L" value={repsL} onInc={() => setRepsL(repsL + 1)} onDec={() => setRepsL(Math.max(0, repsL - 1))} />
                    <Input label="Weight R" value={weightR} onInc={() => setWeightR(step(weightR, +2.5))} onDec={() => setWeightR(step(weightR, -2.5))} />
                    <Input label="Reps R" value={repsR} onInc={() => setRepsR(repsR + 1)} onDec={() => setRepsR(Math.max(0, repsR - 1))} />
                </>
            ) : (
                <>
                    <Input label="Weight" value={weightL} onInc={() => setWeightL(step(weightL, +2.5))} onDec={() => setWeightL(step(weightL, -2.5))} />
                    <Input label="Reps" value={repsL} onInc={() => setRepsL(repsL + 1)} onDec={() => setRepsL(Math.max(0, repsL - 1))} />
                </>
            )}
            <button className="ml-auto px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold" onClick={handleSave}>
                Save set
            </button>
        </div>
    );
}

function Input({ label, value, onInc, onDec }: { label: string; value: number; onInc: () => void; onDec: () => void }) {
    return (
        <div className="flex items-center gap-2 bg-white/5 rounded-xl p-2">
            <div className="text-sm text-zinc-300">{label}</div>
            <button className="px-2 py-1 rounded-lg bg-neutral-700" onClick={onDec}>−</button>
            <div className="w-12 text-center">{value}</div>
            <button className="px-2 py-1 rounded-lg bg-neutral-700" onClick={onInc}>+</button>
        </div>
    );
}
