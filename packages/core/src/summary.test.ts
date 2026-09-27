import { expect, test } from "vitest";
import type { StudentAccount, Submission } from "./index.js";
import { MemoryEvidenceStore } from "./storage.js";
import { summarizeEvidence } from "./summary.js";

const account: StudentAccount = { schemaVersion: 1, platform: "codeforces", namespace: "local-student", handle: "synthetic" };

function attempt(id: string, problemId: string, verdict: string | null, submittedAt: number, extras: Partial<Submission> = {}): Submission {
  return {
    ...account, submissionId: id,
    problem: { platform: "codeforces", problemId, name: problemId,
      ...(problemId === "A" ? { difficulty: 800, tags: ["implementation", "math"] } : {}) },
    verdict, language: "GNU C++20", submittedAt,
    source: null, sourceStatus: "not-collected", captureMethod: "api",
    provenance: "synthetic", capturedAt: "2026-09-27T00:00:00Z", ...extras,
  };
}

test("summarizes one account deterministically and reports only observed pre-acceptance attempts", async () => {
  const records = [
    attempt("3", "A", "OK", 30), attempt("1", "A", "WRONG_ANSWER", 10),
    attempt("2", "A", "TIME_LIMIT_EXCEEDED", 20, { language: "Python 3", sourceStatus: "unavailable" }),
    attempt("4", "B", null, 40), attempt("5", "B", "WRONG_ANSWER", 50),
    attempt("6", "C", "OK", 60, { problem: { platform: "codeforces", problemId: "C", name: "C", difficulty: 1200, tags: ["dp"] } }),
  ];
  const store = new MemoryEvidenceStore();
  for (const record of [...records].reverse()) await store.upsert(record);
  await store.upsert(attempt("1", "A", "OK", 10, { handle: "another" }));
  const summary = summarizeEvidence(account, await store.list(account));

  expect(summary).toEqual(summarizeEvidence(account, records));
  expect(summary.totalAttempts).toBe(6);
  expect(summary.acceptedCount).toBe(2);
  expect(summary.verdictDistribution).toEqual([
    { verdict: null, attempts: 1 }, { verdict: "OK", attempts: 2 },
    { verdict: "TIME_LIMIT_EXCEEDED", attempts: 1 }, { verdict: "WRONG_ANSWER", attempts: 2 },
  ]);
  expect(summary.languageDistribution).toEqual([
    { language: "GNU C++20", attempts: 5 }, { language: "Python 3", attempts: 1 },
  ]);
  expect(summary.sourceStatusDistribution).toEqual([
    { status: "not-collected", attempts: 5 }, { status: "unavailable", attempts: 1 },
  ]);
  expect(summary.problems).toEqual([
    { problemId: "A", name: "A", attempts: 3, submissionIds: ["1", "2", "3"], observedAttemptsBeforeFirstAcceptance: 2 },
    { problemId: "B", name: "B", attempts: 2, submissionIds: ["4", "5"], observedAttemptsBeforeFirstAcceptance: null },
    { problemId: "C", name: "C", attempts: 1, submissionIds: ["6"], observedAttemptsBeforeFirstAcceptance: 0 },
  ]);
  expect(summary.difficultyDistribution).toEqual([{ difficulty: 800, attempts: 3 }, { difficulty: 1200, attempts: 1 }]);
  expect(summary.tagDistribution).toEqual([
    { tag: "dp", attempts: 1 }, { tag: "implementation", attempts: 3 }, { tag: "math", attempts: 3 },
  ]);
});

test("empty, duplicate, and cross-account evidence remain explicit", () => {
  expect(summarizeEvidence(account, []).totalAttempts).toBe(0);
  const record = attempt("1", "A", "OK", 10);
  expect(() => summarizeEvidence(account, [record, record])).toThrow("duplicate submission");
  expect(() => summarizeEvidence(account, [{ ...record, namespace: "other" }])).toThrow("different account");
  expect(summarizeEvidence(account, [attempt("10", "A", "OK", 10), attempt("9", "A", "WRONG_ANSWER", 10)])
    .problems[0]).toMatchObject({ submissionIds: ["9", "10"], observedAttemptsBeforeFirstAcceptance: 1 });
});
