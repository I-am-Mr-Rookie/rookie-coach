import { fence, type ProblemStatement } from "./pages.js";

export const bundleFormat = "rookie-coach-codeforces-md/1";

export interface BundleSubmission {
  id: string;
  verdict: string | null;
  passedTestCount: number | null;
  testset: string | null;
  language: string;
  submittedAt: number;
  timeMs: number | null;
  memoryBytes: number | null;
  url: string | null;
  source: string | null;
  /** "included", or a plain reason the source is absent. */
  sourceNote: string;
}

export interface BundleProblem {
  problemId: string;
  name: string;
  contestId?: number;
  index: string;
  rating?: number;
  tags: string[];
  url: string | null;
  statement: ProblemStatement | null;
  /** "included", or a plain reason the statement is absent. */
  statementNote: string;
  /** Oldest first, so the path from failed attempts to acceptance reads top to bottom. */
  submissions: BundleSubmission[];
}

export interface ContestResult {
  contestId: number;
  contestName: string;
  rank: number;
  oldRating: number;
  newRating: number;
  /** Seconds since the epoch when the rating was updated. */
  at: number;
}

export interface StudentProfile {
  rating: number | null;
  rank: string | null;
  maxRating: number | null;
  maxRank: string | null;
  contribution: number | null;
  friendOfCount: number | null;
  registeredAt: number | null;
  lastOnlineAt: number | null;
  ratedContests: number | null;
  /** Newest first. */
  recentContests: ContestResult[];
}

export interface Bundle {
  handle: string;
  profile: StudentProfile | null;
  /** "included", or a plain reason the profile is absent or partial. */
  profileNote: string;
  signedInHandle: string | null;
  collectedAt: string;
  requested: number | "all";
  sourceMethod: "submission-pages" | "api-includeSources" | "none";
  /** Most recently attempted first. */
  problems: BundleProblem[];
  notes: string[];
  /** Set when the bundle is one file of several (see splitBundle). */
  part?: { index: number; total: number };
}

/** Submissions per file when "all" is exported, to keep each file within common context windows. */
export const partSize = 200;

/**
 * Split into files of at most `size` submissions. A problem's attempts never span two files, so a
 * file can hold fewer than `size`; a single problem with more than `size` attempts gets a file of its own.
 */
export function splitBundle(bundle: Bundle, size = partSize): Bundle[] {
  const groups: BundleProblem[][] = [];
  let count = 0;
  for (const problem of bundle.problems) {
    if (!groups.length || (count && count + problem.submissions.length > size)) { groups.push([]); count = 0; }
    groups.at(-1)!.push(problem);
    count += problem.submissions.length;
  }
  if (groups.length <= 1) return [bundle];
  return groups.map((problems, i) => ({ ...bundle, problems, part: { index: i + 1, total: groups.length } }));
}

const testVerdicts = new Set(["WRONG_ANSWER", "TIME_LIMIT_EXCEEDED", "MEMORY_LIMIT_EXCEEDED",
  "RUNTIME_ERROR", "IDLENESS_LIMIT_EXCEEDED", "PRESENTATION_ERROR"]);

export function failedOnTest(submission: Pick<BundleSubmission, "verdict" | "passedTestCount">): number | null {
  return submission.verdict && testVerdicts.has(submission.verdict) && submission.passedTestCount !== null
    ? submission.passedTestCount + 1 : null;
}

function verdictLabel(submission: BundleSubmission): string {
  if (submission.verdict === null) return "No verdict yet";
  if (submission.verdict === "OK") return "Accepted";
  const words = submission.verdict.toLowerCase().replace(/_/g, " ");
  const test = failedOnTest(submission);
  return `${words[0]!.toUpperCase()}${words.slice(1)}${test === null ? "" : ` on test ${test}`}`;
}

/** Code block language for a Codeforces language name; order matters (e.g. PascalABC.NET is Pascal, not C#). */
export function codeLanguage(language: string): string {
  const name = language.toLowerCase();
  const rules: [RegExp, string][] = [
    [/typescript/, "typescript"], [/javascript|node\.?js|\bv8\b/, "javascript"], [/kotlin/, "kotlin"],
    [/\bscala\b/, "scala"], [/\bjava\b|java ?\d/, "java"], [/pascal|delphi/, "pascal"], [/f#/, "fsharp"],
    [/q#/, "qsharp"], [/c#|\.net|mono/, "csharp"], [/c\+\+|g\+\+|clang\+\+|msvc/, "cpp"],
    [/python|pypy/, "python"], [/rust/, "rust"], [/\bgo\b|golang/, "go"], [/haskell|\bghc\b/, "haskell"],
    [/ruby/, "ruby"], [/php/, "php"], [/perl/, "perl"], [/ocaml/, "ocaml"], [/swift/, "swift"],
    [/julia/, "julia"], [/lisp|sbcl/, "lisp"], [/\bada\b|gnat/, "ada"], [/cobol/, "cobol"], [/\btcl\b/, "tcl"],
    [/\blua\b/, "lua"], [/\bzig\b/, "zig"], [/\bdart\b/, "dart"], [/elixir/, "elixir"], [/erlang/, "erlang"],
    [/brainf/, "brainfuck"], [/befunge/, "befunge"], [/\bpike\b/, "pike"], [/\bfactor\b/, "factor"],
    [/picat/, "picat"], [/\bd\b|\bdmd|\bldc/, "d"], [/\bc\d*\b|gnu c\b/, "c"],
  ];
  return rules.find(([pattern]) => pattern.test(name))?.[1] ?? "text";
}

/** Download name with the collection time to the second, so repeated runs never collide. */
export function bundleFileName(bundle: Pick<Bundle, "handle" | "collectedAt" | "part">, extension = "md"): string {
  const stamp = bundle.collectedAt.replace("T", "_").replace(/:/g, "-").replace(/Z$/, "-UTC");
  const part = bundle.part ? `-part-${bundle.part.index}-of-${bundle.part.total}` : "";
  return `codeforces-${bundle.handle}-${stamp}${part}.${extension}`;
}

/** Rough size for checking against a model's context window: about four characters per token. */
export function approximateTokens(text: string): number {
  return Math.round(text.length / 4 / 100) * 100;
}

function iso(seconds: number): string {
  return new Date(seconds * 1000).toISOString().replace(/\.\d{3}Z$/, "Z");
}

function problemLabel(problem: BundleProblem): string {
  return problem.contestId === undefined ? problem.problemId : `${problem.contestId}${problem.index}`;
}

/** One self-contained Markdown file: problems, statements, examples and every attempt with its code. */
export function bundleToMarkdown(bundle: Bundle): string {
  const submissions = bundle.problems.flatMap((problem) => problem.submissions);
  const out: string[] = [];
  const line = (...text: string[]) => out.push(...text);
  const withSource = submissions.filter((submission) => submission.source !== null).length;
  const withStatement = bundle.problems.filter((problem) => problem.statement).length;
  const gaps = [
    ...(withSource < submissions.length ? [`${submissions.length - withSource} of ${submissions.length} code blocks`] : []),
    ...(withStatement < bundle.problems.length ? [`${bundle.problems.length - withStatement} of ${bundle.problems.length} statements`] : []),
  ];

  line(`# Codeforces submissions for ${bundle.handle}`, "",
    `format: ${bundleFormat}`,
    ...(bundle.part ? [`part: ${bundle.part.index} of ${bundle.part.total}`] : []),
    `handle: ${bundle.handle}`,
    `signed_in_as: ${bundle.signedInHandle ?? "not signed in"}`,
    `collected_at: ${bundle.collectedAt}`,
    `requested: ${bundle.requested === "all" ? "all submissions" : `most recent ${bundle.requested} submissions`}`,
    `submissions: ${submissions.length}`,
    `accepted: ${submissions.filter((submission) => submission.verdict === "OK").length}`,
    `problems: ${bundle.problems.length}`,
    `source_method: ${bundle.sourceMethod}`,
    `source_included: ${withSource}/${submissions.length}`,
    `statements_included: ${withStatement}/${bundle.problems.length}`,
    `complete: ${gaps.length ? `no (missing ${gaps.join(" and ")}; each missing item says why)` : "yes"}`);
  const tokenLine = out.length;
  line("");

  line("## How to read this file", "",
    "- `## Student profile` is the student's current Codeforces standing and recent rated contests.",
    "- Each `## Problem` section is one problem: link, limits, statement, example tests, then every attempt with its code.",
    "- Problems are ordered by most recent attempt first. Attempts inside a problem are oldest first.",
    "- Lines shaped `key: value` are metadata. Missing data is stated as missing, never guessed.",
    "- `verdict` uses Codeforces API names (`OK` means accepted). `failed_on_test` is the first failing test.",
    "- Example tests are the public samples from the statement, not the hidden judge tests.",
    "- Every code block names its language. Submitted code uses the language Codeforces recorded; `text` means plain text.",
    "- `complete: no` means some statements or code are missing. `approx_tokens` is a rough size (characters / 4).",
    ...(bundle.part ? ["- This is one file of several. Counts cover this file only; part 1 holds the newest problems, and the profile is repeated in every part."] : []),
    "");

  if (bundle.notes.length) {
    line("## Collection notes", "", ...bundle.notes.map((note) => `- ${note}`), "");
  }

  const profile = bundle.profile;
  const value = (item: string | number | null, missing = "not available") => item === null ? missing : String(item);
  line("## Student profile", "",
    `url: https://codeforces.com/profile/${encodeURIComponent(bundle.handle)}`,
    `profile: ${bundle.profileNote}`);
  if (profile) {
    line(`rating: ${value(profile.rating, "unrated")}`,
      `rank: ${value(profile.rank, "unrated")}`,
      `max_rating: ${value(profile.maxRating, "unrated")}`,
      `max_rank: ${value(profile.maxRank, "unrated")}`,
      `contribution: ${value(profile.contribution)}`,
      `friend_of_count: ${value(profile.friendOfCount)}`,
      `registered_at: ${profile.registeredAt === null ? "not available" : iso(profile.registeredAt)}`,
      `last_online_at: ${profile.lastOnlineAt === null ? "not available" : iso(profile.lastOnlineAt)}`,
      `rated_contests: ${value(profile.ratedContests)}`);
    if (profile.recentContests.length) {
      const cell = (text: string) => text.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
      line("", `### Recent rated contests (newest ${profile.recentContests.length})`, "",
        "| Date | Contest | Place | Rating change | New rating |", "| --- | --- | --- | --- | --- |",
        ...profile.recentContests.map((contest) => {
          const change = contest.newRating - contest.oldRating;
          return `| ${iso(contest.at).slice(0, 10)} | ${cell(contest.contestName)} (${contest.contestId}) | ${contest.rank} | ${change >= 0 ? "+" : ""}${change} | ${contest.newRating} |`;
        }));
    }
  }
  line("");

  for (const problem of bundle.problems) {
    const statement = problem.statement;
    line(`## Problem ${problemLabel(problem)}: ${problem.name}`, "",
      `problem_id: ${problem.problemId}`,
      `url: ${problem.url ?? "not available"}`,
      ...(problem.contestId === undefined ? [] : [`contest_id: ${problem.contestId}`]),
      `index: ${problem.index}`,
      `rating: ${problem.rating ?? "unrated"}`,
      `tags: ${problem.tags.length ? problem.tags.join(", ") : "none"}`);
    if (statement?.timeLimit) line(`time_limit: ${statement.timeLimit}`);
    if (statement?.memoryLimit) line(`memory_limit: ${statement.memoryLimit}`);
    if (statement?.inputFile && statement.inputFile !== "standard input" && statement.inputFile !== "stdin") line(`input_file: ${statement.inputFile}`);
    if (statement?.outputFile && statement.outputFile !== "standard output" && statement.outputFile !== "stdout") line(`output_file: ${statement.outputFile}`);
    line(`statement: ${problem.statementNote}`, `attempts: ${problem.submissions.length}`, "");

    const sections = statement?.sections ?? [];
    const split = statement?.samplesAfterSection ?? sections.length;
    for (const section of sections.slice(0, split)) line(`### ${section.title}`, "", section.markdown, "");
    statement?.samples.forEach((sample, index) => {
      line(`### Example ${index + 1}`, "", "input:", "", fence(sample.input, "text"), "",
        "expected_output:", "", fence(sample.output, "text"), "");
    });
    for (const section of sections.slice(split)) line(`### ${section.title}`, "", section.markdown, "");

    line("### Attempts", "");
    for (const submission of problem.submissions) {
      const test = failedOnTest(submission);
      line(`#### Submission ${submission.id}: ${verdictLabel(submission)}`, "",
        `url: ${submission.url ?? "not available"}`,
        `submitted_at: ${iso(submission.submittedAt)}`,
        `language: ${submission.language}`,
        `verdict: ${submission.verdict ?? "none"}`,
        ...(submission.passedTestCount === null ? [] : [`passed_tests: ${submission.passedTestCount}`]),
        ...(test === null ? [] : [`failed_on_test: ${test}`]),
        ...(submission.testset === null ? [] : [`testset: ${submission.testset}`]),
        ...(submission.timeMs === null ? [] : [`time_ms: ${submission.timeMs}`]),
        ...(submission.memoryBytes === null ? [] : [`memory_kb: ${Math.round(submission.memoryBytes / 1024)}`]),
        `source: ${submission.sourceNote}`, "");
      if (submission.source !== null) line(fence(submission.source.replace(/\s+$/, ""), codeLanguage(submission.language)), "");
    }
  }
  // No blank-line collapsing here: it would alter blank lines inside source code.
  const body = `${out.join("\n").trimEnd()}\n`;
  out.splice(tokenLine, 0, `approx_tokens: ${approximateTokens(body)}`);
  return `${out.join("\n").trimEnd()}\n`;
}
