import { JSX, useMemo, useState } from "react";
import { Exercise, ExerciseId, TrainingSet } from "../../domain";
import QuickInputs from "./QuickInputs";
import SetsTable from "./SetsTable";
import ProgressPanel from "./ProgressPanel";

interface Props {
    exercise: Exercise;
    isOpen: boolean;
    onToggle: () => void;
    setsToday: { id: string; data: TrainingSet }[];
    onAddSet: (payload:
                   | { mode: "bilateral"; exerciseId: ExerciseId; weightKg: number; reps: number; rpe?: number }
                   | { mode: "unilateral"; exerciseId: ExerciseId; weightLeftKg: number; weightRightKg: number; repsLeft: number; repsRight: number; rpe?: number }
    ) => Promise<void>;
    onUpdateSet: (setId: string, data: Partial<TrainingSet>) => Promise<void>;
    onDeleteSet: (setId: string) => Promise<void>;
    loadProgress: () => Promise<any>;
}

export default function ExerciseCard({
                                         exercise, isOpen, onToggle, setsToday, onAddSet, onUpdateSet, onDeleteSet, loadProgress
                                     }: Props): JSX.Element {
    const [showProgress, setShowProgress] = useState(false);

    const headerSummary = useMemo(() => {
        let topLoad = 0, e1rm = 0;
        for (const s of setsToday) {
            if (s.data.mode === "bilateral") {
                topLoad = Math.max(topLoad, s.data.weightKg);
                e1rm = Math.max(e1rm, s.data.weightKg * (1 + s.data.reps / 30));
            } else {
                const avgW = (s.data.weightLeftKg + s.data.weightRightKg) / 2;
                const avgR = (s.data.repsLeft + s.data.repsRight) / 2;
                topLoad = Math.max(topLoad, avgW);
                e1rm = Math.max(e1rm, avgW * (1 + Math.round(avgR) / 30));
            }
        }
        return { topLoad, e1rm: Math.round(e1rm) };
    }, [setsToday]);

    return (
        <article className="rounded-2xl border border-white/10">
            <header className="p-4 flex items-center justify-between bg-white/5 cursor-pointer" onClick={onToggle}>
                <div className="flex items-center gap-3">
                    <h4 className="text-lg font-semibold">{exercise.name}</h4>
                    {exercise.isUnilateral && (
                        <span className="text-xs px-2 py-1 rounded-full bg-neutral-700">Unilateral</span>
                    )}
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-700">e1RM {headerSummary.e1rm}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-sky-700">Top {headerSummary.topLoad} kg</span>
                </div>
                <button
                    className="text-sm px-3 py-1 rounded-xl bg-neutral-700 hover:bg-neutral-600"
                    onClick={(e) => { e.stopPropagation(); setShowProgress(s => !s); }}>
                    {showProgress ? "Hide progress" : "Show progress"}
                </button>
            </header>

            {isOpen && (
                <div className="p-4 flex flex-col gap-4">
                    <QuickInputs exercise={exercise} onAddSet={onAddSet} />
                    <SetsTable setsToday={setsToday} onUpdateSet={onUpdateSet} onDeleteSet={onDeleteSet} unilateral={exercise.isUnilateral} />
                    {showProgress && (
                        <ProgressPanel loadProgress={loadProgress} />
                    )}
                </div>
            )}
        </article>
    );
}
