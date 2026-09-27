import { schemaVersion, type StudentAccount, type Submission } from "@rookie-coach/core";

export const evidenceVersion = schemaVersion;

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

/** Convert one official user.status metadata page. This does not request or infer source access. */
export function normalizeStatusPage(response: unknown, account: StudentAccount, capturedAt: string): Submission[] {
  if (account.schemaVersion !== 1 || account.platform !== "codeforces" ||
      !account.namespace.trim() || !account.handle.trim()) throw new Error("Invalid Codeforces account");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(capturedAt) ||
      !Number.isFinite(Date.parse(capturedAt)) ||
      new Date(capturedAt).toISOString().replace(".000Z", "Z") !== capturedAt) throw new Error("Invalid capture time");

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
