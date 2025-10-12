import { TrainingSet } from "../../domain/training";

export interface HeaderSummary {
  topLoad: number;
  e1rm: number;
}

export function calculateHeaderSummary(sets: TrainingSet[]): HeaderSummary {
  let topLoad = 0;
  let e1rm = 0;

  for (const s of sets) {
    if (s.mode === "bilateral") {
      topLoad = Math.max(topLoad, s.weightKg);
      e1rm = Math.max(e1rm, s.weightKg * (1 + s.reps / 30));
    } else {
      topLoad = Math.max(topLoad, s.weightLeftKg, s.weightRightKg);
      const leftE1rm = s.weightLeftKg * (1 + s.repsLeft / 30);
      const rightE1rm = s.weightRightKg * (1 + s.repsRight / 30);
      e1rm = Math.max(e1rm, leftE1rm, rightE1rm);
    }
  }

  const roundedTop = Number(topLoad.toFixed(1));
  const roundedE1 = Math.round(e1rm);
  return { topLoad: roundedTop, e1rm: roundedE1 };
}
