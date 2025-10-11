import { JSX, useMemo, useState } from "react";
import { Exercise, TrainingSet } from "../../domain/training";
import SetsTable from "./SetsTable";
import ProgressPanel from "./ProgressPanel";
import { ProgressMatrix } from "../../usecases/training_session";
import { FaChartLine } from "react-icons/fa";

interface Props {
    exercise: Exercise;
    isOpen: boolean;
    onToggle: () => void;
    setsToday: { id: string; data: TrainingSet }[];
    onAddSet: (payload: TrainingSet) => Promise<void>;
    onUpdateSet: (setId: string, data: Partial<TrainingSet>) => Promise<void>;
    onDeleteSet: (setId: string) => Promise<void>;
    loadProgress: () => Promise<ProgressMatrix>;
    loadLastDefaults: () => Promise<
        | { mode: "bilateral"; weightKg: number; reps: number }
        | { mode: "unilateral"; weightLeftKg: number; weightRightKg: number; repsLeft: number; repsRight: number }
        | null
    >;
}

const ExerciseCard: React.FC<Props> = ({
  exercise, isOpen, onToggle, setsToday, onAddSet, onUpdateSet, onDeleteSet, loadProgress, loadLastDefaults
}: Props): JSX.Element => {
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
    <article className="rounded-2xl border border-white/10 overflow-hidden">
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
          title="Toggle progress"
          onClick={(e) => { e.stopPropagation(); setShowProgress(s => !s); }}>
          <FaChartLine />
        </button>
      </header>

      {isOpen && (
        <div className="p-4 flex flex-col gap-4">
          <SetsTable
            setsToday={setsToday}
            onUpdateSet={onUpdateSet}
            onDeleteSet={onDeleteSet}
            unilateral={exercise.isUnilateral}
            exerciseId={exercise.id}
            onAddSet={onAddSet}
            loadLastDefaults={loadLastDefaults}
          />
          {showProgress && (
            <ProgressPanel loadProgress={loadProgress} />
          )}
        </div>
      )}
    </article>
  );
}

export default ExerciseCard;
