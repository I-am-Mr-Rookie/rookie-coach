import { expect, test } from "vitest";
import page from "../../../fixtures/codeforces-user-status-page.json";
import { evidenceVersion, normalizeStatusPage } from "./index.js";

const account = { schemaVersion: 1, platform: "codeforces", namespace: "synthetic-student", handle: "fixture_learner" } as const;
const capturedAt = "2023-11-15T00:00:00Z";

test("adapter workspace resolves the shared evidence contract", () => {
  expect(evidenceVersion).toBe(1);
});

test("maps a synthetic user.status page into account-scoped metadata", () => {
  const [accepted, failed] = normalizeStatusPage(page, account, capturedAt);
  expect([accepted?.submissionId, failed?.submissionId]).toEqual(["900000002", "900000001"]);
  expect(accepted).toMatchObject({
    ...account,
    problem: { platform: "codeforces", problemId: "contest:999999/A", name: "Synthetic Sum", contestId: 999999, index: "A", difficulty: 800, tags: ["implementation"] },
    verdict: "OK", language: "GNU C++20", submittedAt: 1700001000,
    source: null, sourceStatus: "not-collected", captureMethod: "api",
    provenance: "codeforces:user.status", capturedAt,
  });
  expect(failed?.verdict).toBe("WRONG_ANSWER");
  expect(failed?.submittedAt).toBe(1700000000);
});

test("preserves missing optional fields and rejects unidentifiable or failed pages", () => {
  const minimal = { status: "OK", result: [{
    id: 7, creationTimeSeconds: 10, programmingLanguage: "Python 3",
    problem: { problemsetName: "acmsguru", index: "1", name: "Synthetic task" },
  }] };
  expect(normalizeStatusPage(minimal, account, capturedAt)).toMatchObject([{
    submissionId: "7", problem: { problemId: "problemset:acmsguru/1" },
    verdict: null, source: null, sourceStatus: "not-collected",
  }]);
  expect(normalizeStatusPage(minimal, account, capturedAt)[0]?.problem).not.toHaveProperty("difficulty");
  expect(() => normalizeStatusPage({ status: "FAILED", comment: "Call limit exceeded" }, account, capturedAt))
    .toThrow("Call limit exceeded");
  expect(() => normalizeStatusPage({ status: "OK", result: [{ ...minimal.result[0], problem: { index: "A", name: "No key" } }] }, account, capturedAt))
    .toThrow("stable problem identity");
});
