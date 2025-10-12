import {TrainingSet} from "../../domain/training";
import {estimate1RM} from "./one_rep_max";

export interface HeaderSummary {
  topLoad: number | null;
  e1rm: number | null;
}

export function calculateHeaderSummary(sets: TrainingSet[]): HeaderSummary {
  if (sets.length === 0) {
    return {topLoad: null, e1rm: null};
  }

  let topLoad = 0;
  let e1rm = 0;

  for (const s of sets) {
    if (s.mode === "bilateral") {
      topLoad = Math.max(topLoad, s.weightKg);
      e1rm = Math.max(e1rm, estimate1RM(s.weightKg, s.reps));
    } else {
      topLoad = Math.max(topLoad, s.weightLeftKg, s.weightRightKg);
      const leftE1rm = estimate1RM(s.weightLeftKg, s.repsLeft);
      const rightE1rm = estimate1RM(s.weightRightKg, s.repsRight);
      e1rm = Math.max(e1rm, leftE1rm, rightE1rm);
    }
  }

  const roundedTop = Number(topLoad.toFixed(1));
  const roundedE1 = Math.round(e1rm);
  return {topLoad: roundedTop, e1rm: roundedE1};
}
