import { expect, test } from "vitest";
import page from "../../../fixtures/codeforces-user-status-page.json";
import sourceExport from "../../../fixtures/codeforces-user-source-export.json";
import { backfillStatus, evidenceVersion, normalizeStatusPage, parseUserSourceExport } from "./index.js";

const account = { schemaVersion: 1, platform: "codeforces", namespace: "synthetic-student", handle: "fixture_learner" } as const;
const capturedAt = "2023-11-15T00:00:00Z";

async function collect<T>(items: AsyncIterable<T>): Promise<T[]> {
  const result: T[] = [];
  for await (const item of items) result.push(item);
  return result;
}

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

test("parses explicit user source evidence without guessing from metadata", () => {
  const evidence = parseUserSourceExport(sourceExport, account, capturedAt);
  expect(evidence).toEqual([
    { ...account, submissionId: "900000002", source: "int main() { return 0; }\n",
      sourceStatus: "available", captureMethod: "user-export",
      provenance: "codeforces:user-provided-source-export", capturedAt },
    { ...account, submissionId: "900000001", source: null,
      sourceStatus: "unavailable", captureMethod: "user-export",
      provenance: "codeforces:user-provided-source-export", capturedAt },
  ]);
  expect(normalizeStatusPage(page, account, capturedAt).map(({ sourceStatus }) => sourceStatus))
    .toEqual(["not-collected", "not-collected"]);
  expect(parseUserSourceExport({ ...sourceExport, submissions: [] }, account, capturedAt)).toEqual([]);
});

test("rejects ambiguous or cross-account source exports", () => {
  expect(() => parseUserSourceExport(sourceExport, { ...account, namespace: "other" }, capturedAt))
    .toThrow("account mismatch");
  expect(() => parseUserSourceExport({ ...sourceExport, submissions: [sourceExport.submissions[0], sourceExport.submissions[0]] }, account, capturedAt))
    .toThrow("duplicate");
  expect(() => parseUserSourceExport({ ...sourceExport, submissions: [{ submissionId: "9", sourceStatus: "available", source: null }] }, account, capturedAt))
    .toThrow("Invalid source evidence");
  expect(() => parseUserSourceExport({ ...sourceExport, submissions: [{ submissionId: "9", sourceStatus: "unavailable", source: "hidden" }] }, account, capturedAt))
    .toThrow("Invalid source evidence");
  expect(() => parseUserSourceExport({ ...sourceExport, submissions: [{ submissionId: "9", sourceStatus: "not-collected", source: null }] }, account, capturedAt))
    .toThrow("Invalid source evidence");
});

test("backfills multiple pages through an empty page, skipping repeated submission IDs", async () => {
  const calls: number[] = [];
  const delays: number[] = [];
  const older = { ...page.result[1]!, id: 900000000 };
  const responses = [page, { status: "OK", result: [page.result[1], older] }, { status: "OK", result: [] }];
  const request = async (from: number, count: number): Promise<unknown> => {
    expect(count).toBe(2);
    calls.push(from);
    return responses[calls.length - 1];
  };
  const records = await collect(backfillStatus(account, capturedAt, request, {
    maxPages: 4, pageSize: 2, sleep: async (ms) => { delays.push(ms); },
  }));
  expect(calls).toEqual([1, 3, 5]);
  expect(delays).toEqual([2000, 2000]);
  expect(records.map((record) => record.submissionId)).toEqual(["900000002", "900000001", "900000000"]);
});

test("bounds page count and retries only rate-limit failures", async () => {
  const calls: number[] = [];
  const delays: number[] = [];
  const request = async (from: number): Promise<unknown> => {
    calls.push(from);
    return calls.length < 3 ? { status: "FAILED", comment: "Call limit exceeded" } : page;
  };
  const records = await collect(backfillStatus(account, capturedAt, request, {
    maxPages: 1, sleep: async (ms) => { delays.push(ms); },
  }));
  expect(calls).toEqual([1, 1, 1]);
  expect(delays).toEqual([2000, 2000]);
  expect(records).toHaveLength(2);

  let attempts = 0;
  await expect(collect(backfillStatus(account, capturedAt, async () => {
    attempts++;
    return { status: "FAILED", comment: "Call limit exceeded" };
  }, { maxPages: 1, sleep: async () => {} }))).rejects.toThrow("Call limit exceeded");
  expect(attempts).toBe(3);
  await expect(collect(backfillStatus(account, capturedAt, async () => {
    attempts++;
    return { status: "FAILED", comment: "Invalid handle" };
  }, { maxPages: 1 }))).rejects.toThrow("Invalid handle");
  expect(attempts).toBe(4);
});
