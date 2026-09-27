import type { BoundaryDiagnosis } from "./diagnosis.js";

export interface PracticeAction {
  ruleId: string;
  title: string;
  why: string;
  exercise: string;
  completion: string;
}

/** Return one exercise only for the supported, recurring source-edit finding. */
export function practiceForDiagnosis(diagnosis: BoundaryDiagnosis): PracticeAction | null {
  if (diagnosis.status !== "finding" ||
      diagnosis.finding.ruleId !== "cf-cpp20-boundary-comparator-v1" ||
      new Set(diagnosis.finding.support.map((pair) => pair.problemId)).size < 2) return null;

  return {
    ruleId: diagnosis.finding.ruleId,
    title: "Trace an exclusive loop bound",
    why: "On two distinct problems, observed sources changed <= to < before acceptance. That edit does not establish the cause of either verdict.",
    exercise: "For an invented array [4, 7, 9], list valid indices 0, 1, 2. Trace i from 0 through 3 with i <= 3, mark index 3 as out of range, then change the condition to i < 3.",
    completion: "You can show that the corrected loop visits 0, 1, 2 exactly once and never reads index 3.",
  };
}
