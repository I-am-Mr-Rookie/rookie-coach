import { schemaVersion, type StudentAccount, type Submission } from "@rookie-coach/core";

export const evidenceVersion = schemaVersion;

export type SourceEvidence = Pick<Submission,
  "schemaVersion" | "platform" | "namespace" | "handle" | "submissionId" |
  "source" | "sourceStatus" | "captureMethod" | "provenance" | "capturedAt">;

function object(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid Codeforces response: expected object");
  }
  return value as Record<string, unknown>;
}

function nonempty(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) throw new Error("Invalid Codeforces response: expected text");
  return value;
}

function integer(value: unknown, minimum: number): number {
  if (!Number.isSafeInteger(value) || (value as number) < minimum) {
    throw new Error("Invalid Codeforces response: expected integer");
  }
  return value as number;
}

function validateContext(account: StudentAccount, capturedAt: string): void {
  if (account.schemaVersion !== 1 || account.platform !== "codeforces" ||
      !account.namespace.trim() || !account.handle.trim()) throw new Error("Invalid Codeforces account");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(capturedAt) ||
      !Number.isFinite(Date.parse(capturedAt)) ||
      new Date(capturedAt).toISOString().replace(".000Z", "Z") !== capturedAt) throw new Error("Invalid capture time");
}

/** Parse a student's manually prepared source export, not a Codeforces API response. */
export function parseUserSourceExport(input: unknown, account: StudentAccount, capturedAt: string): SourceEvidence[] {
  validateContext(account, capturedAt);
  const exportData = object(input);
  const exportedAccount = object(exportData.account);
  if (exportData.schemaVersion !== 1 || !Array.isArray(exportData.submissions) ||
      Object.keys(exportData).sort().join() !== "account,schemaVersion,submissions" ||
      Object.keys(exportedAccount).sort().join() !== "handle,namespace,platform,schemaVersion" ||
      Object.keys(account).some((key) => exportedAccount[key] !== account[key as keyof StudentAccount])) {
    throw new Error("Invalid source export or account mismatch");
  }

  const seen = new Set<string>();
  return exportData.submissions.map((raw: unknown): SourceEvidence => {
    const entry = object(raw);
    const submissionId = nonempty(entry.submissionId);
    if (!/^[1-9]\d*$/.test(submissionId) || seen.has(submissionId)) throw new Error("Invalid or duplicate source submission ID");
    seen.add(submissionId);
    if (Object.keys(entry).sort().join() !== "source,sourceStatus,submissionId" ||
        (entry.sourceStatus !== "available" && entry.sourceStatus !== "unavailable") ||
        (entry.sourceStatus === "available" ? typeof entry.source !== "string" || !entry.source.trim() : entry.source !== null)) {
      throw new Error(`Invalid source evidence for submission ${submissionId}`);
    }
    return {
      ...account, submissionId, source: entry.source as string | null,
      sourceStatus: entry.sourceStatus, captureMethod: "user-export",
      provenance: "codeforces:user-provided-source-export", capturedAt,
    };
  });
}

/** Convert one official user.status metadata page. This does not request or infer source access. */
export function normalizeStatusPage(response: unknown, account: StudentAccount, capturedAt: string): Submission[] {
  validateContext(account, capturedAt);

  const page = object(response);
  if (page.status === "FAILED") throw new Error(`Codeforces API failed: ${String(page.comment ?? "unknown error")}`);
  if (page.status !== "OK" || !Array.isArray(page.result)) throw new Error("Invalid Codeforces status page");

  return page.result.map((raw: unknown): Submission => {
    const submission = object(raw);
    const problem = object(submission.problem);
    const id = integer(submission.id, 1);
    const index = nonempty(problem.index);
    const contestId = problem.contestId === undefined
      ? (submission.contestId === undefined ? undefined : integer(submission.contestId, 1))
      : integer(problem.contestId, 1);
    const problemsetName = problem.problemsetName === undefined ? undefined : nonempty(problem.problemsetName);
    if (contestId === undefined && problemsetName === undefined) {
      throw new Error(`Codeforces submission ${id} has no stable problem identity`);
    }
    const rating = problem.rating === undefined ? undefined : integer(problem.rating, 0);
    const tags = problem.tags;
    if (tags !== undefined && (!Array.isArray(tags) ||
        tags.some((tag: unknown) => typeof tag !== "string" || !tag.trim()) ||
        new Set(tags).size !== tags.length)) throw new Error("Invalid Codeforces problem tags");

    return {
      schemaVersion,
      platform: account.platform,
      namespace: account.namespace,
      handle: account.handle,
      submissionId: String(id),
      problem: {
        platform: "codeforces",
        problemId: contestId === undefined ? `problemset:${problemsetName}/${index}` : `contest:${contestId}/${index}`,
        name: nonempty(problem.name),
        ...(contestId === undefined ? {} : { contestId }),
        index,
        ...(rating === undefined ? {} : { difficulty: rating }),
        ...(tags === undefined ? {} : { tags: tags as string[] }),
      },
      verdict: submission.verdict === undefined ? null : nonempty(submission.verdict),
      language: nonempty(submission.programmingLanguage),
      submittedAt: integer(submission.creationTimeSeconds, 0),
      source: null,
      sourceStatus: "not-collected",
      captureMethod: "api",
      provenance: "codeforces:user.status",
      capturedAt,
    };
  });
}

export interface BackfillOptions {
  /** Hard cap on requests to distinct offsets; a short page does not imply completion. */
  maxPages: number;
  pageSize?: number;
  /** Defaults to a real two-second timer; inject for deterministic tests. */
  sleep?: (milliseconds: number) => Promise<void>;
}

/** Paginate one student's metadata. The caller supplies authorized network access. */
export async function* backfillStatus(
  account: StudentAccount,
  capturedAt: string,
  request: (from: number, count: number) => Promise<unknown>,
  options: BackfillOptions,
): AsyncGenerator<Submission> {
  const maxPages = integer(options.maxPages, 1);
  const pageSize = integer(options.pageSize ?? 100, 1);
  if (pageSize > 100) throw new Error("Codeforces page size must be at most 100");
  normalizeStatusPage({ status: "OK", result: [] }, account, capturedAt);
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const seen = new Set<string>();
  let from = 1;
  let requested = false;

  for (let pageNumber = 0; pageNumber < maxPages; pageNumber++) {
    let response: unknown;
    for (let retry = 0; ; retry++) {
      if (requested) await sleep(2000); // Codeforces permits at most one API call per two seconds.
      requested = true;
      response = await request(from, pageSize);
      const body = object(response);
      if (body.status !== "FAILED" || body.comment !== "Call limit exceeded" || retry === 2) break;
    }

    const records = normalizeStatusPage(response, account, capturedAt);
    if (records.length === 0) return;
    for (const record of records) {
      if (seen.has(record.submissionId)) continue;
      seen.add(record.submissionId);
      yield record;
    }
    from += records.length;
  }
}

export * from "./pages.js";
export * from "./markdown.js";
export * from "./collect.js";
export * from "./zip.js";