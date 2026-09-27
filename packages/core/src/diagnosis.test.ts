import { expect, test } from "vitest";
import { diagnoseRecurringBoundaryEdit, type StudentAccount, type Submission } from "./index.js";

const account: StudentAccount = { schemaVersion: 1, platform: "codeforces", namespace: "local", handle: "invented" };
const before = "int main() {\nfor (int i = 0; i <= n; i++) {\n  sum += i;\n}\n}";
const after = "int main() {\nfor (int i = 0; i < n; i++) {\n  sum += i;\n}\n}";

function attempt(id: string, problemId: string, verdict: string, source: string | null, language = "GNU C++20"): Submission {
  return { ...account, submissionId: id, problem: { platform: "codeforces", problemId, name: problemId },
    verdict, submittedAt: Number(id), language, source, sourceStatus: source === null ? "not-collected" : "available",
    captureMethod: "api", provenance: "invented-metadata", capturedAt: "2026-09-27T00:00:00Z",
    ...(source === null ? {} : { sourceCaptureMethod: "user-export" as const,
      sourceProvenance: "invented-source", sourceCapturedAt: "2026-09-27T01:00:00Z" }),
  };
}

function pair(problemId: string, firstId: number, oldSource: string | null = before, newSource = after, language = "GNU C++20"): Submission[] {
  return [attempt(String(firstId), problemId, "WRONG_ANSWER", oldSource, language),
    attempt(String(firstId + 1), problemId, "OK", newSource, language)];
}

test("two distinct problems yield a possible pattern with stable evidence and origins", () => {
  const records = [...pair("B", 3), ...pair("A", 1)];
  const result = diagnoseRecurringBoundaryEdit(account, records);
  expect(diagnoseRecurringBoundaryEdit(account, [...records].reverse())).toEqual(result);
  expect(result).toMatchObject({ status: "finding", finding: {
    ruleId: "cf-cpp20-boundary-comparator-v1",
    support: [
      { problemId: "A", failed: { submissionId: "1", sourceProvenance: "invented-source" }, accepted: { submissionId: "2" } },
      { problemId: "B", failed: { submissionId: "3" }, accepted: { submissionId: "4" } },
    ],
  } });
  expect(JSON.stringify(result).toLowerCase()).toContain("possible");
  expect(JSON.stringify(result).toLowerCase()).toContain("does not establish the cause");
});

test("retries on one problem do not count as recurrence", () => {
  const records = [...pair("A", 1), ...pair("A", 3)];
  expect(diagnoseRecurringBoundaryEdit(account, records)).toMatchObject({
    status: "insufficient-evidence", reason: "only-one-problem",
  });
});

test("comment edits and another substantive edit cannot impersonate a loop-only revision", () => {
  const commentBefore = "// for (int i = 0; i <= n; i++) {";
  const commentAfter = "// for (int i = 0; i < n; i++) {";
  const changedBody = after.replace("sum += i", "sum += i + 1");
  const blockBefore = `/*\n${before}\n*/`;
  const blockAfter = `/*\n${after}\n*/`;
  const rawBefore = `auto example = R"(\n${before}\n)";`;
  const rawAfter = `auto example = R"(\n${after}\n)";`;
  for (const other of [pair("B", 3, commentBefore, commentAfter), pair("B", 3, before, changedBody),
    pair("B", 3, blockBefore, blockAfter), pair("B", 3, rawBefore, rawAfter)]) {
    expect(diagnoseRecurringBoundaryEdit(account, [...pair("A", 1), ...other])).toMatchObject({
      status: "insufficient-evidence", reason: "only-one-problem",
    });
  }
});

test("missing source or source origin abstains with coverage explanation", () => {
  expect(diagnoseRecurringBoundaryEdit(account, [...pair("A", 1), ...pair("B", 3, null, after)]))
    .toMatchObject({ status: "insufficient-evidence", reason: "missing-source" });
  const missingOrigin = pair("B", 3);
  delete missingOrigin[0]!.sourceProvenance;
  expect(diagnoseRecurringBoundaryEdit(account, [...pair("A", 1), ...missingOrigin]))
    .toMatchObject({ status: "insufficient-evidence", reason: "missing-source-origin" });
});

test("unsupported language abstains and account validation remains intact", () => {
  expect(diagnoseRecurringBoundaryEdit(account, [...pair("A", 1), ...pair("B", 3, before, after, "GNU C++17")]))
    .toMatchObject({ status: "insufficient-evidence", reason: "unsupported-language" });
  const otherAccount = pair("B", 3);
  otherAccount[0]!.handle = "elsewhere";
  expect(() => diagnoseRecurringBoundaryEdit(account, [...pair("A", 1), ...otherAccount])).toThrow("different account");
});
