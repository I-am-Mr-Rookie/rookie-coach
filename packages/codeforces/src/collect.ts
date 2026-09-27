import type { StudentAccount, Submission } from "@rookie-coach/core";
import { backfillStatus } from "./index.js";
import type { Bundle, BundleProblem, ContestResult, StudentProfile } from "./markdown.js";
import {
  codeforcesOrigin, englishPage, extractSource, extractStatement, isBrowserCheck, isSignInPage, problemUrl, submissionUrl,
} from "./pages.js";

export interface PageResponse {
  status: number;
  /** Final URL after redirects. */
  url: string;
  text: string;
}

export interface CollectOptions {
  handle: string;
  limit: number | "all";
  /** Handle shown in the signed-in page header, or null. Source pages are read only when it matches `handle`. */
  signedInHandle: string | null;
  /** Backup method: the official API with the user's own key. Never stored or written to the file. */
  api?: { key: string; secret: string };
  origin?: string;
}

export interface CollectDeps {
  fetchPage(url: string): Promise<PageResponse>;
  parseHtml(html: string): Document;
  sleep(milliseconds: number): Promise<void>;
  now(): Date;
  progress(message: string, done: number, total: number): void;
  /**
   * Called when Codeforces shows a browser check. Resolve true once the student has passed it
   * themselves in a normal tab (the same page is then requested again), or false to stop and save.
   */
  waitForCheck?(message: string): Promise<boolean>;
  signal?: AbortSignal;
  /** Six random digits for API signatures; injectable for tests. */
  random?(): string;
}

/** Codeforces allows one API call per two seconds; the same pace is used for pages. */
export const requestSpacingMs = 2000;
const retryDelayMs = 5000;
const maxConsecutiveFailures = 3;

async function sha512Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Build a signed user.status URL as described in the Codeforces API authorization rules. */
export async function signedStatusUrl(origin: string, handle: string, from: number, count: number,
  api: { key: string; secret: string }, timeSeconds: number, rand: string): Promise<string> {
  const params: [string, string][] = [
    ["apiKey", api.key], ["count", String(count)], ["from", String(from)], ["handle", handle],
    ["includeSources", "true"], ["lang", "en"], ["time", String(timeSeconds)],
  ];
  params.sort(([a, x], [b, y]) => a < b ? -1 : a > b ? 1 : x < y ? -1 : x > y ? 1 : 0);
  const query = params.map(([key, value]) => `${key}=${value}`).join("&");
  const signature = rand + await sha512Hex(`${rand}/user.status?${query}#${api.secret}`);
  const encoded = params.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join("&");
  return `${origin}/api/user.status?${encoded}&apiSig=${signature}`;
}

/** The API's source field is undocumented, so accept `source` or a single other source-like text field. */
export function apiSource(raw: Record<string, unknown>): { text: string; field: string } | null {
  if (typeof raw.source === "string" && raw.source.trim()) return { text: raw.source, field: "source" };
  const field = Object.keys(raw).find((key) => /source/i.test(key) && typeof raw[key] === "string" && (raw[key] as string).trim());
  return field ? { text: raw[field] as string, field } : null;
}

class Stop extends Error {}

function optionalInteger(value: unknown): number | null {
  return Number.isSafeInteger(value) && (value as number) >= 0 ? value as number : null;
}

/** Collect one account's recent history into a bundle. Nothing is persisted; the caller decides what to save. */
export async function collectBundle(options: CollectOptions, deps: CollectDeps): Promise<Bundle> {
  const origin = options.origin ?? codeforcesOrigin;
  const handle = options.handle.trim();
  if (!/^[A-Za-z0-9_.-]{1,64}$/.test(handle)) throw new Error("Enter a Codeforces handle (letters, digits, _ . -).");
  const limit = options.limit === "all" ? Infinity : options.limit;
  if (limit !== Infinity && (!Number.isSafeInteger(limit) || limit < 1)) throw new Error("Choose how many submissions to collect.");
  const collectedAt = deps.now().toISOString().replace(/\.\d{3}Z$/, "Z");
  const notes: string[] = [];
  const random = deps.random ?? (() => String(Math.floor(100000 + Math.random() * 900000)));

  let requested = false;
  async function paced(url: string): Promise<PageResponse> {
    if (deps.signal?.aborted) throw new Stop("You stopped the collection.");
    if (requested) await deps.sleep(requestSpacingMs);
    requested = true;
    return deps.fetchPage(url);
  }

  // 1. The student's current standing, from the same official data the profile page shows.
  async function apiResult(path: string): Promise<unknown> {
    const response = await paced(`${origin}/api/${path}`);
    if (isBrowserCheck(response.status, response.text)) throw new Error("Codeforces showed a browser check");
    let body: { status?: unknown; result?: unknown; comment?: unknown };
    try { body = JSON.parse(response.text); } catch { throw new Error(`HTTP ${response.status} instead of data`); }
    if (body.status !== "OK") throw new Error(String(body.comment ?? "request failed"));
    return body.result;
  }
  const text = (item: unknown) => typeof item === "string" && item.trim() ? item : null;
  const number = (item: unknown) => Number.isSafeInteger(item) ? item as number : null;
  let profile: StudentProfile | null = null;
  const profileProblems: string[] = [];
  deps.progress("Reading your profile…", 0, 0);
  try {
    const [user] = (await apiResult(`user.info?handles=${encodeURIComponent(handle)}&lang=en`)) as Record<string, unknown>[];
    if (!user) throw new Error("no profile returned");
    profile = {
      rating: number(user.rating), rank: text(user.rank), maxRating: number(user.maxRating), maxRank: text(user.maxRank),
      contribution: number(user.contribution), friendOfCount: number(user.friendOfCount),
      registeredAt: number(user.registrationTimeSeconds), lastOnlineAt: number(user.lastOnlineTimeSeconds),
      ratedContests: null, recentContests: [],
    };
  } catch (error) {
    if (error instanceof Stop) throw new Error("Stopped before the profile was read.");
    profileProblems.push(`profile not collected (${error instanceof Error ? error.message : String(error)})`);
  }
  if (profile) {
    try {
      const history = (await apiResult(`user.rating?handle=${encodeURIComponent(handle)}&lang=en`)) as Record<string, unknown>[];
      const contests = history.flatMap((item): ContestResult[] => {
        const contestId = number(item.contestId), rank = number(item.rank), oldRating = number(item.oldRating),
          newRating = number(item.newRating), at = number(item.ratingUpdateTimeSeconds);
        return contestId === null || rank === null || oldRating === null || newRating === null || at === null ? [] :
          [{ contestId, contestName: text(item.contestName) ?? `Contest ${contestId}`, rank, oldRating, newRating, at }];
      });
      profile.ratedContests = contests.length;
      profile.recentContests = contests.sort((a, b) => b.at - a.at).slice(0, 10);
    } catch (error) {
      if (error instanceof Stop) throw new Error("Stopped before the contest history was read.");
      profileProblems.push(`contest history not collected (${error instanceof Error ? error.message : String(error)})`);
    }
  }
  const profileNote = profileProblems.length ? profileProblems.join("; ") : "included";

  // 2. Submission metadata from the official API.
  const account: StudentAccount = { schemaVersion: 1, platform: "codeforces", namespace: "local-student", handle };
  const raw = new Map<string, Record<string, unknown>>();
  const records: Submission[] = [];
  const request = async (from: number, count: number): Promise<unknown> => {
    const url = options.api
      ? await signedStatusUrl(origin, handle, from, count, options.api, Math.floor(deps.now().getTime() / 1000), random())
      : `${origin}/api/user.status?handle=${encodeURIComponent(handle)}&from=${from}&count=${count}&lang=en`;
    deps.progress(`Reading submission list (from #${from})…`, 0, 0);
    const response = await paced(url);
    if (isBrowserCheck(response.status, response.text)) {
      throw new Error("Codeforces showed a browser check or refused the request. The extension does not get around this; open codeforces.com normally, wait a minute, and try again.");
    }
    let body: unknown;
    try { body = JSON.parse(response.text); } catch {
      throw new Error(`Codeforces returned HTTP ${response.status} instead of data. The site may be busy or down; try again later.`);
    }
    const result = (body as { result?: unknown }).result;
    if (Array.isArray(result)) for (const item of result) {
      if (item && typeof item === "object") raw.set(String((item as { id?: unknown }).id), item as Record<string, unknown>);
    }
    return body;
  };
  try {
    const maxPages = limit === Infinity ? 100000 : Math.ceil(limit / 100);
    for await (const record of backfillStatus(account, collectedAt, request, { maxPages, pageSize: 100, sleep: async () => {} })) {
      records.push(record);
      if (records.length >= limit) break;
    }
  } catch (error) {
    if (error instanceof Stop) throw new Error("Stopped before the submission list was read.");
    throw error;
  }
  if (!records.length) throw new Error(`Codeforces has no submissions for ${handle}.`);
  if (limit !== Infinity && records.length === limit) notes.push(`Only the most recent ${limit} submissions were requested; older history may exist.`);

  // 3. Decide how source code is obtained.
  const own = options.signedInHandle !== null && options.signedInHandle.toLowerCase() === handle.toLowerCase();
  const sourceMethod: Bundle["sourceMethod"] = options.api ? "api-includeSources" : own ? "submission-pages" : "none";
  if (sourceMethod === "none") {
    notes.push(options.signedInHandle === null
      ? "Not signed in to Codeforces in this tab, so source code was not collected."
      : `Signed in as ${options.signedInHandle}, not ${handle}. Source code is only collected for your own account.`);
  }
  if (options.api) notes.push("Source code came from the official API option includeSources (experimental: its source field is undocumented).");

  // 4. Group attempts by problem: problems by latest attempt, attempts oldest first.
  const byProblem = new Map<string, BundleProblem>();
  for (const record of records) {
    const item = raw.get(record.submissionId) ?? {};
    let problem = byProblem.get(record.problem.problemId);
    if (!problem) {
      const { contestId, index = "", difficulty, tags = [] } = record.problem;
      problem = {
        problemId: record.problem.problemId, name: record.problem.name, index, tags,
        ...(contestId === undefined ? {} : { contestId }), ...(difficulty === undefined ? {} : { rating: difficulty }),
        url: problemUrl(contestId, index, origin), statement: null, statementNote: "not collected", submissions: [],
      };
      byProblem.set(record.problem.problemId, problem);
    }
    let source: string | null = null;
    let sourceNote = sourceMethod === "none" ? "not collected (not your signed-in account)" : "not collected";
    if (options.api) {
      const found = apiSource(item);
      source = found?.text ?? null;
      sourceNote = found ? "included" : "not returned by the API";
    }
    const memory = optionalInteger(item.memoryConsumedBytes);
    problem.submissions.push({
      id: record.submissionId, verdict: record.verdict, language: record.language, submittedAt: record.submittedAt,
      passedTestCount: optionalInteger(item.passedTestCount),
      testset: typeof item.testset === "string" ? item.testset : null,
      timeMs: optionalInteger(item.timeConsumedMillis), memoryBytes: memory,
      url: submissionUrl(record.problem.contestId, record.submissionId, origin), source, sourceNote,
    });
  }
  const problems = [...byProblem.values()];
  for (const problem of problems) {
    problem.submissions.sort((a, b) => a.submittedAt - b.submittedAt || Number(a.id) - Number(b.id));
  }

  // 5. Read problem pages and, for the user's own account, submission pages.
  let stopped: string | null = null;
  let failures = 0;
  const pageTasks = problems.filter((problem) => problem.url).length +
    (sourceMethod === "submission-pages" ? problems.reduce((total, problem) => total + problem.submissions.filter((s) => s.url).length, 0) : 0);
  let done = 0;

  // Every item after a stop gets this short note; the full reason is written once in Collection notes.
  const stoppedEarly = "the collection stopped early; see Collection notes";
  async function page(url: string): Promise<Document | string> {
    if (stopped) return stoppedEarly;
    for (let attempt = 0; attempt < 2;) {
      let response: PageResponse | null = null;
      try { response = await paced(url); } catch (error) {
        if (error instanceof Stop) { stopped = error.message; return stoppedEarly; }
      }
      if (response && isBrowserCheck(response.status, response.text)) {
        const what = `Codeforces showed a browser check or refused the request (HTTP ${response.status}) at ${url}`;
        if (deps.waitForCheck && await deps.waitForCheck(what)) continue;
        stopped = `${what}. The extension stopped there instead of getting around it, so everything after that point is marked not collected. Run it again later.`;
        return stoppedEarly;
      }
      if (response && response.status === 200 && isSignInPage(response.url)) {
        stopped = `Codeforces asked to sign in at ${url}, so the remaining pages were skipped.`;
        return stoppedEarly;
      }
      if (response && response.status === 200) { failures = 0; return deps.parseHtml(response.text); }
      if (response && response.status === 404) { failures = 0; return "page not found"; }
      if (attempt++ === 0) await deps.sleep(retryDelayMs);
    }
    if (++failures >= maxConsecutiveFailures) stopped = `Codeforces stopped responding (${maxConsecutiveFailures} pages in a row failed, the last one ${url}), so the remaining pages were skipped.`;
    return "Codeforces did not return the page, even after a retry";
  }

  for (const problem of problems) {
    const label = problem.contestId === undefined ? problem.problemId : `${problem.contestId}${problem.index}`;
    if (problem.url) {
      deps.progress(`Problem ${label}: statement`, done, pageTasks);
      const doc = await page(englishPage(problem.url));
      done++;
      if (typeof doc === "string") problem.statementNote = `not collected (${doc})`;
      else {
        problem.statement = extractStatement(doc, problem.url);
        problem.statementNote = problem.statement ? "included" : "not on the page (it may be a PDF or need registration)";
      }
    } else problem.statementNote = "not available (no problem page link)";

    if (sourceMethod !== "submission-pages") continue;
    for (const submission of problem.submissions) {
      if (!submission.url) { submission.sourceNote = "not available (no submission page link)"; continue; }
      deps.progress(`Problem ${label}: code of submission ${submission.id}`, done, pageTasks);
      const doc = await page(submission.url);
      done++;
      if (typeof doc === "string") { submission.sourceNote = `not collected (${doc})`; continue; }
      submission.source = extractSource(doc);
      submission.sourceNote = submission.source === null ? "not visible on the submission page" : "included";
    }
  }
  if (stopped) notes.push(stopped);
  deps.progress("Writing the file…", pageTasks, pageTasks);

  return {
    handle, profile, profileNote, signedInHandle: options.signedInHandle, collectedAt,
    requested: options.limit, sourceMethod, problems, notes,
  };
}
