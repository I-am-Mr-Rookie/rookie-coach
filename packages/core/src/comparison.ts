import type { StudentAccount, Submission } from "./index.js";
import { summarizeEvidence } from "./summary.js";

type EvidenceRef = Pick<Submission, "submissionId" | "sourceStatus" | "captureMethod" | "provenance" |
  "capturedAt" | "sourceCaptureMethod" | "sourceProvenance" | "sourceCapturedAt">;

export interface AttemptComparison {
  problemId: string;
  failed: EvidenceRef;
  accepted: EvidenceRef;
  sourceComparison:
    | { status: "available"; changed: { before: string[]; after: string[] } }
    | { status: "unavailable"; reason: "failed-source-not-available" | "accepted-source-not-available" | "both-sources-not-available" };
}

function reference(record: Submission): EvidenceRef {
  const { submissionId, sourceStatus, captureMethod, provenance, capturedAt,
    sourceCaptureMethod, sourceProvenance, sourceCapturedAt } = record;
  return { submissionId, sourceStatus, captureMethod, provenance, capturedAt,
    sourceCaptureMethod, sourceProvenance, sourceCapturedAt };
}

function sourceComparison(failed: Submission, accepted: Submission): AttemptComparison["sourceComparison"] {
  const hasFailed = failed.sourceStatus === "available" && failed.source !== null;
  const hasAccepted = accepted.sourceStatus === "available" && accepted.source !== null;
  if (!hasFailed || !hasAccepted) return {
    status: "unavailable",
    reason: !hasFailed && !hasAccepted ? "both-sources-not-available" :
      !hasFailed ? "failed-source-not-available" : "accepted-source-not-available",
  };

  const before = failed.source!.split("\n");
  const after = accepted.source!.split("\n");
  let start = 0;
  while (start < before.length && start < after.length && before[start] === after[start]) start++;
  let beforeEnd = before.length;
  let afterEnd = after.length;
  while (beforeEnd > start && afterEnd > start && before[beforeEnd - 1] === after[afterEnd - 1]) {
    beforeEnd--;
    afterEnd--;
  }
  return { status: "available", changed: { before: before.slice(start, beforeEnd), after: after.slice(start, afterEnd) } };
}

/** Compare adjacent observed failure/acceptance on the same account and problem; no causal claim. */
export function compareAttempts(account: StudentAccount, records: Submission[]): AttemptComparison[] {
  const summary = summarizeEvidence(account, records);
  const byId = new Map(records.map((record) => [record.submissionId, record]));
  const comparisons: AttemptComparison[] = [];
  for (const problem of summary.problems) {
    const ordered = problem.submissionIds.map((id) => byId.get(id)!);
    for (let i = 1; i < ordered.length; i++) {
      const failed = ordered[i - 1]!;
      const accepted = ordered[i]!;
      if (failed.verdict === null || failed.verdict === "OK" || accepted.verdict !== "OK") continue;
      comparisons.push({ problemId: problem.problemId, failed: reference(failed),
        accepted: reference(accepted), sourceComparison: sourceComparison(failed, accepted) });
    }
  }
  return comparisons;
}
