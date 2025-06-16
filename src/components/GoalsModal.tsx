import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaPlus, FaSave, FaTrashAlt } from "react-icons/fa";
import { NutritionGoals } from "./types";
import {Level, NutritionColor} from "../utils/nutrition";
import ProgressBar from "./ProgressBar"; // adjust path!

interface GoalsModalProps {
    open: boolean;
    onClose: () => void;
    goals: NutritionGoals[];
    onChange: (goals: NutritionGoals[]) => void;
}

type ViewMode = "list" | "edit";

const emptyLevel: Level = { value: 0, color: NutritionColor.GREEN };
const sortGoals = (a: NutritionGoals[], asc = true) =>
  [...a].sort((x, y) =>
    asc
      ? new Date(x.validFrom).getTime() - new Date(y.validFrom).getTime()
      : new Date(y.validFrom).getTime() - new Date(x.validFrom).getTime()
  );

const GoalsModal: React.FC<GoalsModalProps> = ({ open, onClose, goals, onChange }) => {
  const [mode, setMode] = useState<ViewMode>("list");
  const [editing, setEditing] = useState<NutritionGoals | null>(null);

  const [validFrom, setValidFrom] = useState<string>("");
  const [kcalLevels, setKcalLevels] = useState<Level[]>([]);
  const [proteinLevels, setProteinLevels] = useState<Level[]>([]);
  const [fatLevels, setFatLevels] = useState<Level[]>([]);

  useEffect(() => {
    if (mode === "edit") {
      setValidFrom(editing?.validFrom ?? new Date().toISOString().slice(0, 16));
      setKcalLevels(editing?.kcalLevels ?? [{ ...emptyLevel }]);
      setProteinLevels(editing?.proteinLevels ?? [{ ...emptyLevel }]);
      setFatLevels(editing?.fatLevels ?? [{ ...emptyLevel }]);
    }
  }, [mode, editing]);

    type MacroKey = "kcalLevels" | "proteinLevels" | "fatLevels";
    const getSetter = (k: MacroKey) =>
      k === "kcalLevels" ? setKcalLevels : k === "proteinLevels" ? setProteinLevels : setFatLevels;

    const updateLevel = (macro: MacroKey, idx: number, part: Partial<Level>) => {
      getSetter(macro)((prev) => prev.map((l, i) => (i === idx ? { ...l, ...part } : l)));
    };
    const addLevel = (macro: MacroKey) => {
      getSetter(macro)((prev) => [...prev, { ...emptyLevel }]);
    };
    const removeLevel = (macro: MacroKey, idx: number) => {
      getSetter(macro)((prev) => prev.filter((_, i) => i !== idx));
    };

    const saveGoalSet = () => {
      const newGoals: NutritionGoals = {
        validFrom,
        kcalLevels: [...kcalLevels].sort((a, b) => a.value - b.value),
        proteinLevels: [...proteinLevels].sort((a, b) => a.value - b.value),
        fatLevels: [...fatLevels].sort((a, b) => a.value - b.value),
      };

      const next = [...goals];
      if (editing) {
        const idx = next.findIndex((g) => g === editing);
        next[idx] = newGoals;
      } else {
        next.push(newGoals);
      }
      onChange(sortGoals(next));
      setMode("list");
      setEditing(null);
    };

    const deleteGoal = (goal: NutritionGoals) => {
      if (confirm("Delete this goal set?")) {
        onChange(goals.filter((g) => g !== goal));
      }
    };

    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-zinc-900 p-6 shadow-xl">
          <header className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {mode === "edit" && (
                <button
                  onClick={() => {
                    setMode("list");
                    setEditing(null);
                  }}
                  className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                >
                  <FaArrowLeft />
                </button>
              )}
              <h2 className="text-xl font-semibold">
                {mode === "list" ? "Manage Nutrition Goals" : editing ? "Edit Goals" : "Add Goals"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
            >
                        ✕
            </button>
          </header>

          {mode === "list" ? (
            <>
              <div className="space-y-4">
                {sortGoals(goals).map((g, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-zinc-800/40 p-4 text-sm"
                  >
                    <div>
                      <p className="font-medium text-base">
                        {new Date(g.validFrom).toLocaleString()}
                      </p>
                      <p className="text-zinc-400">
                                            kcal: {g.kcalLevels.map((l) => l.value).join(", ")} | prot: {g.proteinLevels
                          .map((l) => l.value)
                          .join(", ")} | fat: {g.fatLevels.map((l) => l.value).join(", ")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditing(g);
                          setMode("edit");
                        }}
                        className="rounded-md bg-indigo-600/70 px-3 py-1 text-white transition hover:bg-indigo-600"
                      >
                                            Edit
                      </button>
                      <button
                        onClick={() => deleteGoal(g)}
                        className="rounded-md bg-red-600/70 px-3 py-1 text-white transition hover:bg-red-600"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                ))}
                {goals.length === 0 && (
                  <div className="rounded-lg bg-zinc-800/30 p-4 text-center text-zinc-400">
                                    No goals yet.
                  </div>
                )}
              </div>
              <footer className="mt-6 flex justify-between">
                <button
                  onClick={() => {
                    setEditing(null);
                    setMode("edit");
                  }}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-500"
                >
                  <FaPlus /> Add Goals Set
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg border border-zinc-500 px-4 py-2 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                >
                                Done
                </button>
              </footer>
            </>
          ) : (
            <>
              <div className="mb-6">
                <label className="mb-2 block font-medium">Valid From</label>
                <input
                  type="datetime-local"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-800/50 p-2 text-white focus:border-indigo-400 focus:outline-none"
                />
              </div>

              <LevelsSection
                title="Calories (kcal)"
                levels={kcalLevels}
                macroKey="kcalLevels"
                onAdd={() => addLevel("kcalLevels")}
                onRemove={(i) => removeLevel("kcalLevels", i)}
                onChange={updateLevel}
              />
              <LevelsSection
                title="Protein (g)"
                levels={proteinLevels}
                macroKey="proteinLevels"
                onAdd={() => addLevel("proteinLevels")}
                onRemove={(i) => removeLevel("proteinLevels", i)}
                onChange={updateLevel}
              />
              <LevelsSection
                title="Fat (g)"
                levels={fatLevels}
                macroKey="fatLevels"
                onAdd={() => addLevel("fatLevels")}
                onRemove={(i) => removeLevel("fatLevels", i)}
                onChange={updateLevel}
              />

              <footer className="mt-8 flex justify-end gap-4">
                <button
                  onClick={() => {
                    setMode("list");
                    setEditing(null);
                  }}
                  className="rounded-lg border border-zinc-500 px-4 py-2 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                >
                                Cancel
                </button>
                <button
                  onClick={saveGoalSet}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-900/50"
                  disabled={kcalLevels.length === 0 || proteinLevels.length === 0 || fatLevels.length === 0}
                >
                  <FaSave /> Save
                </button>
              </footer>
            </>
          )}
        </div>
      </div>
    );
};

interface LevelsSectionProps {
    title: string;
    levels: Level[];
    macroKey: MacroKey;
    onAdd: () => void;
    onRemove: (index: number) => void;
    onChange: (macroKey: MacroKey, index: number, partial: Partial<Level>) => void;
}

type MacroKey = "kcalLevels" | "proteinLevels" | "fatLevels";

const LevelsSection: React.FC<LevelsSectionProps> = ({ title, levels, macroKey, onAdd, onRemove, onChange }) => (
  <section className="mb-6">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-lg font-medium">{title}</h3>
      <button
        onClick={onAdd}
        className="rounded-md bg-zinc-800/40 px-3 py-1 text-sm text-zinc-200 transition hover:bg-zinc-700/60"
      >
                + Add Level
      </button>
    </div>
    <div className="space-y-3 mb-4">
      {levels.map((lvl, idx) => (
        <div key={idx} className="grid grid-cols-[1fr_1fr_auto] items-center gap-3 rounded-xl bg-white/5 p-3 text-sm">
          <input
            type="number"
            value={lvl.value}
            onChange={(e) => onChange(macroKey, idx, { value: parseFloat(e.target.value) })}
            className="w-full rounded-md border border-white/20 bg-zinc-800/50 p-2 text-right focus:border-indigo-400 focus:outline-none"
          />
          <select
            value={lvl.color}
            onChange={(e) => onChange(macroKey, idx, { color: e.target.value as NutritionColor })}
            className="rounded-md border border-white/20 bg-zinc-800/50 p-2 focus:border-indigo-400 focus:outline-none"
          >
            {Object.values(NutritionColor).map((col) => (
              <option key={col} value={col}>
                {col.charAt(0) + col.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <button
            onClick={() => onRemove(idx)}
            className="rounded-md bg-red-600 px-3 py-1.5 text-xs text-white transition hover:bg-red-700"
          >
                        Remove
          </button>
        </div>
      ))}
    </div>
    <ProgressBar current={null} levels={levels} />
  </section>
);

export default GoalsModal;
