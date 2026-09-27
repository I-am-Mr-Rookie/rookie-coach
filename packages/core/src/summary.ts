import type { StudentAccount, Submission } from "./index.js";

export interface EvidenceSummary {
  account: StudentAccount;
  totalAttempts: number;
  acceptedCount: number;
  verdictDistribution: { verdict: string | null; attempts: number }[];
  languageDistribution: { language: string; attempts: number }[];
  sourceStatusDistribution: { status: Submission["sourceStatus"]; attempts: number }[];
  problems: {
    problemId: string;
    name: string;
    attempts: number;
    submissionIds: string[];
    /** Earlier observed submissions only; a partial import may omit earlier history. */
    observedAttemptsBeforeFirstAcceptance: number | null;
  }[];
  /** Counts submissions with known metadata, not distinct problems or inferred strengths. */
  difficultyDistribution: { difficulty: number; attempts: number }[];
  tagDistribution: { tag: string; attempts: number }[];
}

const compare = (a: string, b: string): number => a < b ? -1 : a > b ? 1 : 0;
const compareIds = (a: string, b: string): number => /^\d+$/.test(a) && /^\d+$/.test(b)
  ? (BigInt(a) < BigInt(b) ? -1 : BigInt(a) > BigInt(b) ? 1 : compare(a, b)) : compare(a, b);

function counts<T extends string | number | null>(values: T[]): { value: T; attempts: number }[] {
  const totals = new Map<T, number>();
  for (const value of values) totals.set(value, (totals.get(value) ?? 0) + 1);
  return [...totals].sort(([a], [b]) => a === null ? -1 : b === null ? 1 :
    typeof a === "number" && typeof b === "number" ? a - b : compare(String(a), String(b)))
    .map(([value, attempts]) => ({ value, attempts }));
}

/** Summarize observed records for exactly one account, independent of store order. */
export function summarizeEvidence(account: StudentAccount, records: Submission[]): EvidenceSummary {
  const seen = new Set<string>();
  const problems = new Map<string, Submission[]>();
  for (const record of records) {
    if (record.schemaVersion !== account.schemaVersion || record.platform !== account.platform ||
        record.namespace !== account.namespace || record.handle !== account.handle ||
        record.problem.platform !== account.platform || seen.has(record.submissionId)) {
      throw new Error("Evidence summary contains a different account or duplicate submission");
    }
    seen.add(record.submissionId);
    const group = problems.get(record.problem.problemId) ?? [];
    group.push(record);
    problems.set(record.problem.problemId, group);
  }

  return {
    account: { ...account },
    totalAttempts: records.length,
    acceptedCount: records.filter((record) => record.verdict === "OK").length,
    verdictDistribution: counts(records.map((record) => record.verdict))
      .map(({ value: verdict, attempts }) => ({ verdict, attempts })),
    languageDistribution: counts(records.map((record) => record.language))
      .map(({ value: language, attempts }) => ({ language, attempts })),
    sourceStatusDistribution: counts(records.map((record) => record.sourceStatus))
      .map(({ value: status, attempts }) => ({ status, attempts })),
    problems: [...problems].sort(([a], [b]) => compare(a, b)).map(([problemId, group]) => {
      const ordered = group.sort((a, b) => a.submittedAt - b.submittedAt || compareIds(a.submissionId, b.submissionId));
      const firstAccepted = ordered.findIndex((record) => record.verdict === "OK");
      return {
        problemId, name: ordered[0]!.problem.name, attempts: ordered.length,
        submissionIds: ordered.map((record) => record.submissionId),
        observedAttemptsBeforeFirstAcceptance: firstAccepted < 0 ? null : firstAccepted,
      };
    }),
    difficultyDistribution: counts(records.flatMap((record) => record.problem.difficulty === undefined ? [] : [record.problem.difficulty]))
      .map(({ value: difficulty, attempts }) => ({ difficulty, attempts })),
    tagDistribution: counts(records.flatMap((record) => record.problem.tags ?? []))
      .map(({ value: tag, attempts }) => ({ tag, attempts })),
  };
}
