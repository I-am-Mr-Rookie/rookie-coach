import { expect, test } from "vitest";
import { diagnoseRecurringBoundaryEdit, practiceForDiagnosis, type BoundaryDiagnosis, type StudentAccount, type Submission } from "./index.js";

const account: StudentAccount = { schemaVersion: 1, platform: "codeforces", namespace: "local", handle: "invented" };

function attempt(id: number, problemId: string, verdict: string, comparator: string): Submission {
  return { ...account, submissionId: String(id), problem: { platform: "codeforces", problemId, name: problemId },
    verdict, submittedAt: id, language: "GNU C++20",
    source: `for (int i = 0; i ${comparator} n; i++) {\n  sum += i;\n}`,
    sourceStatus: "available", captureMethod: "api", provenance: "invented metadata",
    capturedAt: "2026-09-27T00:00:00Z", sourceCaptureMethod: "user-export",
    sourceProvenance: "invented source", sourceCapturedAt: "2026-09-27T00:00:01Z" };
}

const diagnosis = diagnoseRecurringBoundaryEdit(account, [
  attempt(1, "A", "WRONG_ANSWER", "<="), attempt(2, "A", "OK", "<"),
  attempt(3, "B", "WRONG_ANSWER", "<="), attempt(4, "B", "OK", "<"),
]);

test("supported finding gives one self-contained loop-bound exercise with a checkable finish", () => {
  expect(diagnosis.status).toBe("finding");
  const action = practiceForDiagnosis(diagnosis);
  expect(action).not.toBeNull();
  expect(Array.isArray(action)).toBe(false);
  expect(action).toMatchObject({
    ruleId: "cf-cpp20-boundary-comparator-v1",
    why: expect.stringMatching(/two distinct problems.*<=.*<.*not establish.*cause/i),
    exercise: expect.stringMatching(/\[4, 7, 9\].*0, 1, 2.*3.*<=.*</),
    completion: expect.stringMatching(/0, 1, 2.*never.*3/i),
  });
  expect(practiceForDiagnosis(diagnosis)).toEqual(action);
  expect(JSON.stringify(action)).not.toMatch(/https?:\/\//);
});

test("insufficient evidence and unknown rules have no personalized action", () => {
  expect(practiceForDiagnosis({ status: "insufficient-evidence", reason: "missing-source" })).toBeNull();
  if (diagnosis.status !== "finding") throw new Error("fixture must yield a finding");
  const unknown = { ...diagnosis, finding: { ...diagnosis.finding, ruleId: "future-rule" } } as unknown as BoundaryDiagnosis;
  expect(practiceForDiagnosis(unknown)).toBeNull();
  expect(practiceForDiagnosis({ ...diagnosis, finding: { ...diagnosis.finding, support: diagnosis.finding.support.slice(0, 1) } })).toBeNull();
});
