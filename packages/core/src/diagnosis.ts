import type { StudentAccount, Submission } from "./index.js";
import { compareAttempts, type AttemptComparison } from "./comparison.js";

type Reason = "no-eligible-pairs" | "missing-source" | "missing-source-origin" |
  "unsupported-platform" | "unsupported-language" | "no-matching-edit" | "only-one-problem";

export type BoundaryDiagnosis =
  | { status: "finding"; finding: {
      ruleId: "cf-cpp20-boundary-comparator-v1";
      wording: string;
      support: Pick<AttemptComparison, "problemId" | "failed" | "accepted">[];
    } }
  | { status: "insufficient-evidence"; reason: Reason };

/** A deliberately small textual pattern, not a C++ parser or an explanation of the verdict. */
function isSingleLoopBoundEdit(comparison: AttemptComparison): boolean {
  if (comparison.sourceComparison.status !== "available") return false;
  const { before, after } = comparison.sourceComparison.changed;
  if (before.length !== 1 || after.length !== 1) return false;
  const oldLine = before[0]!;
  // Only a standalone, single-line for loop with a simple identifier bound is supported.
  if (!/^\s*for\s*\(\s*(?:int|long long)\s+([a-zA-Z_]\w*)\s*=\s*0\s*;\s*\1\s*<=\s*[a-zA-Z_]\w*\s*;\s*\1\+\+\s*\)\s*\{\s*$/.test(oldLine)) return false;
  return oldLine.replace("<=", "<") === after[0];
}

/** Report a possible repeated source edit only when two distinct problems support it. */
export function diagnoseRecurringBoundaryEdit(account: StudentAccount, records: Submission[]): BoundaryDiagnosis {
  const comparisons = compareAttempts(account, records);
  if (account.platform !== "codeforces") return { status: "insufficient-evidence", reason: "unsupported-platform" };
  const byId = new Map(records.map((record) => [record.submissionId, record]));
  const pairs = comparisons.filter(({ failed }) =>
    byId.get(failed.submissionId)?.verdict === "WRONG_ANSWER");
  const support = new Map<string, Pick<AttemptComparison, "problemId" | "failed" | "accepted">>();
  let reason: Reason = pairs.length ? "no-matching-edit" : "no-eligible-pairs";

  for (const pair of pairs) {
    const failed = byId.get(pair.failed.submissionId)!;
    const accepted = byId.get(pair.accepted.submissionId)!;
    if (failed.language !== "GNU C++20" || accepted.language !== "GNU C++20") {
      reason = "unsupported-language";
    } else if (pair.sourceComparison.status !== "available") {
      reason = "missing-source";
    } else if (![pair.failed, pair.accepted].every((ref) => ref.sourceCaptureMethod && ref.sourceProvenance && ref.sourceCapturedAt)) {
      reason = "missing-source-origin";
    } else if (![failed.source, accepted.source].some((source) =>
      /\/\*|\*\/|R"|\\\r?\n|^\s*#\s*(?:if|ifdef|ifndef|elif|else|endif|define)\b/m.test(source ?? "")) &&
      isSingleLoopBoundEdit(pair)) {
      support.set(pair.problemId, { problemId: pair.problemId, failed: pair.failed, accepted: pair.accepted });
    }
  }

  if (support.size >= 2) return { status: "finding", finding: {
    ruleId: "cf-cpp20-boundary-comparator-v1",
    wording: "Possible recurring <= to < loop-bound edit in observed wrong-answer to accepted attempts on distinct problems. The edit does not establish the cause of either verdict.",
    support: [...support.values()],
  } };
  return { status: "insufficient-evidence", reason: reason === "no-matching-edit" && support.size ? "only-one-problem" : reason };
}
