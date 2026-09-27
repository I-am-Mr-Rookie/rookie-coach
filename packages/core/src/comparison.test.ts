import { expect, test } from "vitest";
import { compareAttempts, type StudentAccount, type Submission } from "./index.js";

const account: StudentAccount = { schemaVersion: 1, platform: "codeforces", namespace: "local", handle: "synthetic" };

function attempt(id: string, problemId: string, verdict: string | null, time: number, extras: Partial<Submission> = {}): Submission {
  return {
    ...account, submissionId: id, problem: { platform: "codeforces", problemId, name: problemId },
    verdict, submittedAt: time, language: "GNU C++20", source: null, sourceStatus: "not-collected",
    captureMethod: "api", provenance: "synthetic-metadata", capturedAt: "2026-09-27T00:00:00Z", ...extras,
  };
}

const source = (text: string): Partial<Submission> => ({
  source: text, sourceStatus: "available", sourceCaptureMethod: "user-export",
  sourceProvenance: "synthetic-export", sourceCapturedAt: "2026-09-27T01:00:00Z",
});

test("pairs the immediately preceding failed attempt with acceptance in deterministic problem/time/ID order", () => {
  const records = [
    attempt("4", "A", "OK", 20, source("int a;\nfor (int i = 0; i < n; i++) {}\nreturn 0;")),
    attempt("2", "A", "WRONG_ANSWER", 10, source("int a;\nfor (int i = 0; i <= n; i++) {}\nreturn 0;")),
    attempt("3", "A", "TIME_LIMIT_EXCEEDED", 15, source("int a;\nfor (int i = 0; i <= n; i++) {}\nreturn 0;")),
    attempt("1", "B", "WRONG_ANSWER", 10, source("a")),
    attempt("5", "B", "OK", 20, source("a")),
  ];
  const expected = compareAttempts(account, records);
  expect(compareAttempts(account, [...records].reverse())).toEqual(expected);
  expect(expected.map(({ problemId, failed, accepted }) => [problemId, failed.submissionId, accepted.submissionId]))
    .toEqual([["A", "3", "4"], ["B", "1", "5"]]);
  expect(expected[0]).toMatchObject({
    sourceComparison: {
      status: "available", changed: {
        before: ["for (int i = 0; i <= n; i++) {}"],
        after: ["for (int i = 0; i < n; i++) {}"],
      },
    },
    failed: { provenance: "synthetic-metadata", sourceProvenance: "synthetic-export", sourceCaptureMethod: "user-export", sourceCapturedAt: "2026-09-27T01:00:00Z" },
  });
  expect(expected[1]?.sourceComparison).toEqual({ status: "available", changed: { before: [], after: [] } });
});

test("missing source yields explicit comparison coverage and retains each status and origin", () => {
  const records = [
    attempt("10", "A", "WRONG_ANSWER", 1, { sourceStatus: "unavailable", sourceCaptureMethod: "user-export", sourceProvenance: "observed-absence", sourceCapturedAt: "2026-09-27T01:00:00Z" }),
    attempt("11", "A", "OK", 2, source("int main() {}")),
    attempt("12", "A", "WRONG_ANSWER", 3),
    attempt("13", "A", "OK", 4),
  ];
  const [first, second] = compareAttempts(account, records);
  expect(first?.sourceComparison).toEqual({ status: "unavailable", reason: "failed-source-not-available" });
  expect(first?.failed).toMatchObject({ sourceStatus: "unavailable", sourceProvenance: "observed-absence" });
  expect(first?.accepted).toMatchObject({ sourceStatus: "available", sourceProvenance: "synthetic-export" });
  expect(second?.sourceComparison).toEqual({ status: "unavailable", reason: "both-sources-not-available" });
  expect(second?.failed.sourceStatus).toBe("not-collected");
});

test("never crosses accounts or problems, and does not invent a later acceptance or failed verdict", () => {
  const records = [
    attempt("1", "A", "WRONG_ANSWER", 10),
    attempt("2", "B", "OK", 20),
    attempt("3", "A", null, 30),
    attempt("4", "A", "OK", 40),
    attempt("5", "A", "WRONG_ANSWER", 50),
  ];
  expect(compareAttempts(account, records)).toEqual([]);
  expect(() => compareAttempts(account, [attempt("1", "A", "WRONG_ANSWER", 10), attempt("2", "A", "OK", 20, { handle: "another" })]))
    .toThrow("different account");
});

test("pending or ambiguous Codeforces verdicts cannot become failed attempts", () => {
  for (const verdict of ["TESTING", "SUBMITTED", "SKIPPED", "FAILED", "UNKNOWN"]) {
    expect(compareAttempts(account, [attempt("1", "A", verdict, 10), attempt("2", "A", "OK", 20)]))
      .toEqual([]);
  }
  expect(compareAttempts(account, [attempt("1", "A", "WRONG_ANSWER", 10), attempt("2", "A", "OK", 20)]))
    .toHaveLength(1);
});
