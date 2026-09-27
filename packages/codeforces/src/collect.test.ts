import { DOMParser } from "linkedom";
import { expect, test } from "vitest";
import problemHtml from "../../../fixtures/codeforces-problem-page.html?raw";
import submissionHtml from "../../../fixtures/codeforces-submission-page.html?raw";
import statusPage from "../../../fixtures/codeforces-user-status-page.json";
import {
  apiSource, bundleFileName, bundleToMarkdown, codeLanguage, collectBundle, extractSource, extractStatement, isBrowserCheck,
  signedInHandle, signedStatusUrl, splitBundle, zipFiles, type Bundle, type BundleProblem, type PageResponse,
} from "./index.js";

const parse = (html: string) => new DOMParser().parseFromString(html, "text/html") as unknown as Document;
const origin = "https://codeforces.com";
const listUrl = (from: number) => `${origin}/api/user.status?handle=fixture_learner&from=${from}&count=100&lang=en`;
const problemPage = `${origin}/contest/1999/problem/A?locale=en`;

const apiPage = JSON.stringify({
  ...statusPage,
  result: statusPage.result.map((item) => item.verdict === "OK"
    ? { ...item, passedTestCount: 12, testset: "TESTS", timeConsumedMillis: 46, memoryConsumedBytes: 102400 }
    : { ...item, passedTestCount: 2, testset: "TESTS", timeConsumedMillis: 15, memoryConsumedBytes: 0 }),
  // The shared fixture uses 999999, which Codeforces would treat as a gym contest.
}).replaceAll("999999", "1999");

function site(pages: Record<string, PageResponse | (() => PageResponse)>) {
  const requested: string[] = [];
  const sleeps: number[] = [];
  return {
    requested, sleeps,
    deps: {
      fetchPage: async (url: string) => {
        requested.push(url);
        const page = pages[url];
        if (!page) return { status: 404, url, text: "missing" };
        return typeof page === "function" ? page() : page;
      },
      parseHtml: parse,
      sleep: async (ms: number) => { sleeps.push(ms); },
      now: () => new Date("2026-09-27T12:00:00.000Z"),
      progress: () => {},
    },
  };
}

const ok = (url: string, text: string): PageResponse => ({ status: 200, url, text });
const infoUrl = `${origin}/api/user.info?handles=fixture_learner&lang=en`;
const ratingUrl = `${origin}/api/user.rating?handle=fixture_learner&lang=en`;
const userInfo = JSON.stringify({ status: "OK", result: [{
  handle: "fixture_learner", rating: 1234, rank: "pupil", maxRating: 1300, maxRank: "specialist",
  contribution: -2, friendOfCount: 3, registrationTimeSeconds: 1600000000, lastOnlineTimeSeconds: 1700002000,
  firstName: "Private", city: "Private",
}] });
const ratingHistory = JSON.stringify({ status: "OK", result: Array.from({ length: 12 }, (_, i) => ({
  contestId: 1000 + i, contestName: i === 11 ? "Synthetic Round | Div. 3" : `Synthetic Round ${i}`, handle: "fixture_learner",
  rank: 500 - i, ratingUpdateTimeSeconds: 1690000000 + i * 86400, oldRating: 1100 + i * 10, newRating: 1110 + i * 10 - (i === 11 ? 30 : 0),
})) });
const basePages = {
  [infoUrl]: ok(infoUrl, userInfo),
  [ratingUrl]: ok(ratingUrl, ratingHistory),
  [listUrl(1)]: ok(listUrl(1), apiPage),
  [listUrl(3)]: ok(listUrl(3), JSON.stringify({ status: "OK", result: [] })),
  [problemPage]: ok(problemPage, problemHtml),
  [`${origin}/contest/1999/submission/900000002`]: ok(`${origin}/contest/1999/submission/900000002`, submissionHtml),
  [`${origin}/contest/1999/submission/900000001`]: ok(`${origin}/contest/1999/submission/900000001`,
    submissionHtml.replace("i &lt; n", "i &lt;= n")),
};

test("reads the statement, limits and both example formats from a problem page", () => {
  const statement = extractStatement(parse(problemHtml), `${origin}/contest/1999/problem/A`)!;
  expect(statement).toMatchObject({ title: "A. Synthetic Sum", timeLimit: "1 second", memoryLimit: "256 megabytes" });
  expect(statement.sections.map((section) => section.title)).toEqual(["Statement", "Input", "Output", "Note"]);
  const legend = statement.sections[0]!.markdown;
  expect(legend).toContain("You are given $n$ integers $a_1, a_2, \\ldots, a_n$. Print their **sum** modulo $10^9+7$.");
  expect(legend).toContain("[the blog](https://codeforces.com/blog/entry/1)");
  expect(legend).toContain("![diagram](https://codeforces.com/predownloaded/aa/bb/synthetic.png)");
  expect(legend).toContain("- First rule with `YES`.");
  expect(legend).toContain("$$\\sum_{i=1}^{n} a_i$$");
  expect(statement.sections[1]!.markdown).toBe("The first line contains $t$ ($1 \\le t \\le 100$).");
  expect(statement.samples).toEqual([{ input: "2\n3\n1 2 3", output: "6" }, { input: "1\n5", output: "5" }]);
});

test("detects the signed-in handle, source code and browser checks", () => {
  expect(signedInHandle(parse(problemHtml))).toBe("fixture_learner");
  expect(signedInHandle(parse('<div class="lang-chooser"><a href="https://codeforces.com/enter?back=%2F">Enter</a></div>'))).toBeNull();
  expect(extractSource(parse(submissionHtml))).toContain('std::cout << s << "\\n"; // uses ``` inside a comment & more');
  expect(extractSource(parse("<html><body>no code</body></html>"))).toBeNull();
  expect(isBrowserCheck(200, "<p>Please wait. Your browser is being checked. It may take a few seconds...</p>")).toBe(true);
  expect(isBrowserCheck(200, "<title>Just a moment...</title><script>window._cf_chl_opt={}</script>")).toBe(true);
  expect(isBrowserCheck(504, "Gateway time-out")).toBe(false);
  // Normal pages carry Cloudflare's detection script; it is not a check.
  expect(problemHtml).toContain("/cdn-cgi/challenge-platform/scripts/jsd/main.js");
  expect(isBrowserCheck(200, problemHtml)).toBe(false);
});

test("collects one self-contained Markdown bundle for the signed-in account", async () => {
  const { deps, requested, sleeps } = site(basePages);
  const bundle = await collectBundle({ handle: "fixture_learner", limit: 250, signedInHandle: "Fixture_Learner" }, deps);
  expect(bundle.sourceMethod).toBe("submission-pages");
  expect(requested).toEqual([infoUrl, ratingUrl, listUrl(1), listUrl(3), problemPage,
    `${origin}/contest/1999/submission/900000001`, `${origin}/contest/1999/submission/900000002`]);
  expect(sleeps).toEqual([2000, 2000, 2000, 2000, 2000, 2000]);

  const markdown = bundleToMarkdown(bundle);
  expect(markdown).toContain("format: rookie-coach-codeforces-md/1\nhandle: fixture_learner\nsigned_in_as: Fixture_Learner");
  expect(markdown).toMatch(/source_included: 2\/2\nstatements_included: 1\/1\ncomplete: yes\napprox_tokens: \d+00\n/);
  expect(bundleFileName(bundle)).toBe("codeforces-fixture_learner-2026-09-27_12-00-00-UTC.md");
  expect(markdown).toContain("## Student profile\n\nurl: https://codeforces.com/profile/fixture_learner\nprofile: included\n" +
    "rating: 1234\nrank: pupil\nmax_rating: 1300\nmax_rank: specialist\ncontribution: -2\nfriend_of_count: 3\n" +
    "registered_at: 2020-09-13T12:26:40Z\nlast_online_at: 2023-11-14T22:46:40Z\nrated_contests: 12");
  expect(markdown).toContain("### Recent rated contests (newest 10)");
  expect(markdown).toContain("| 2023-08-02 | Synthetic Round \\| Div. 3 (1011) | 489 | -20 | 1190 |");
  expect(markdown).toContain("| 2023-07-24 | Synthetic Round 2 (1002) | 498 | +10 | 1130 |");
  expect(markdown).not.toContain("Synthetic Round 1 (1001)");
  expect(markdown).not.toContain("Private");
  expect(markdown).toContain("## Problem 1999A: Synthetic Sum\n\nproblem_id: contest:1999/A\nurl: https://codeforces.com/contest/1999/problem/A");
  expect(markdown).toContain("time_limit: 1 second\nmemory_limit: 256 megabytes\nstatement: included\nattempts: 2");
  expect(markdown).toContain("### Example 1\n\ninput:\n\n```text\n2\n3\n1 2 3\n```\n\nexpected_output:\n\n```text\n6\n```");
  expect(markdown.indexOf("### Output")).toBeLessThan(markdown.indexOf("### Example 1"));
  expect(markdown.indexOf("### Example 2")).toBeLessThan(markdown.indexOf("### Note"));
  const failed = markdown.indexOf("#### Submission 900000001: Wrong answer on test 3");
  const accepted = markdown.indexOf("#### Submission 900000002: Accepted");
  expect(failed).toBeGreaterThan(0);
  expect(accepted).toBeGreaterThan(failed);
  expect(markdown).toContain("verdict: WRONG_ANSWER\npassed_tests: 2\nfailed_on_test: 3\ntestset: TESTS\ntime_ms: 15\nmemory_kb: 0\nsource: included");
  expect(markdown).toContain("````cpp\n#include <bits/stdc++.h>\nint main() {\n    long long n, s = 0; std::cin >> n;\n\n    for (int i = 0; i <= n; i++)");
  expect(markdown).not.toMatch(/apiKey|secret/i);
});

test("collects statements but no code when the tab is not signed in to that account", async () => {
  const { deps, requested } = site(basePages);
  const bundle = await collectBundle({ handle: "fixture_learner", limit: 250, signedInHandle: null }, deps);
  expect(requested.some((url) => url.includes("/submission/"))).toBe(false);
  const markdown = bundleToMarkdown(bundle);
  expect(markdown).toContain("statements_included: 1/1");
  expect(markdown).toContain("Not signed in to Codeforces in this tab, so source code was not collected.");
  expect(markdown).toContain("source: not collected (not your signed-in account)");
});

test("stops at a browser check instead of getting around it, and keeps what it has", async () => {
  const check = { status: 200, url: `${origin}/contest/1999/submission/900000001`, text: "Please wait. Your browser is being checked." };
  const { deps, requested } = site({ ...basePages, [`${origin}/contest/1999/submission/900000001`]: check });
  const bundle = await collectBundle({ handle: "fixture_learner", limit: 250, signedInHandle: "fixture_learner" }, deps);
  expect(requested.at(-1)).toBe(`${origin}/contest/1999/submission/900000001`);
  const markdown = bundleToMarkdown(bundle);
  expect(markdown).toContain("statements_included: 1/1");
  expect(markdown).toContain("source_included: 0/2");
  expect(markdown).toContain("complete: no (missing 2 of 2 code blocks; each missing item says why)");
  expect(markdown).toContain("## Collection notes\n\n- Codeforces showed a browser check or refused the request (HTTP 200) at " +
    `${origin}/contest/1999/submission/900000001. The extension stopped there`);
  expect(markdown).toContain("source: not collected (the collection stopped early; see Collection notes)");
});

test("waits while the student passes a browser check, then requests the same page again", async () => {
  let checked = 0;
  const flaky = () => (++checked === 1
    ? { status: 403, url: problemPage, text: "<title>Just a moment...</title>" } : ok(problemPage, problemHtml));
  const { deps, requested } = site({ ...basePages, [problemPage]: flaky });
  const asked: string[] = [];
  const bundle = await collectBundle({ handle: "fixture_learner", limit: 250, signedInHandle: "fixture_learner" },
    { ...deps, waitForCheck: async (message) => { asked.push(message); return true; } });
  expect(asked).toEqual([`Codeforces showed a browser check or refused the request (HTTP 403) at ${problemPage}`]);
  expect(requested.filter((url) => url === problemPage)).toHaveLength(2);
  expect(bundleToMarkdown(bundle)).toContain("complete: yes");
});

test("retries a failed page once, then continues", async () => {
  let calls = 0;
  const flaky = () => (++calls === 1 ? { status: 504, url: "", text: "Gateway time-out" } : ok(problemPage, problemHtml));
  const { deps, sleeps } = site({ ...basePages, [problemPage]: flaky });
  const bundle = await collectBundle({ handle: "fixture_learner", limit: 250, signedInHandle: null }, deps);
  expect(calls).toBe(2);
  expect(sleeps).toContain(5000);
  expect(bundle.problems[0]!.statementNote).toBe("included");
});

test("keeps going with a clear note when the profile cannot be read", async () => {
  const { deps } = site({ ...basePages, [infoUrl]: { status: 504, url: infoUrl, text: "Gateway time-out" } });
  const bundle = await collectBundle({ handle: "fixture_learner", limit: 250, signedInHandle: null }, deps);
  const markdown = bundleToMarkdown(bundle);
  expect(markdown).toContain("profile: profile not collected (HTTP 504 instead of data)");
  expect(markdown).not.toContain("max_rating");
  expect(markdown).toContain("statements_included: 1/1");
});

test("reports a clear error when the submission list cannot be read", async () => {
  const { deps } = site({ [listUrl(1)]: { status: 504, url: listUrl(1), text: "<title>504</title>" } });
  await expect(collectBundle({ handle: "fixture_learner", limit: 250, signedInHandle: null }, deps))
    .rejects.toThrow(/HTTP 504 instead of data/);
  await expect(collectBundle({ handle: "bad handle!", limit: 250, signedInHandle: null }, deps)).rejects.toThrow(/handle/);
});

test("signs the API backup request and reads its source field", async () => {
  const api = { key: "k3y", secret: "s3cret" };
  const url = await signedStatusUrl(origin, "fixture_learner", 1, 100, api, 1700000000, "123456");
  const digest = await crypto.subtle.digest("SHA-512", new TextEncoder()
    .encode("123456/user.status?apiKey=k3y&count=100&from=1&handle=fixture_learner&includeSources=true&lang=en&time=1700000000#s3cret"));
  const expected = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  expect(url).toBe(`${origin}/api/user.status?apiKey=k3y&count=100&from=1&handle=fixture_learner&includeSources=true&lang=en&time=1700000000&apiSig=123456${expected}`);
  expect(apiSource({ id: 1, source: "int main() {}" })).toEqual({ text: "int main() {}", field: "source" });
  expect(apiSource({ id: 1, sourceCode: "x" })).toEqual({ text: "x", field: "sourceCode" });
  expect(apiSource({ id: 1 })).toBeNull();
});

test("splits an all-submissions export into files of at most 200 and zips them", async () => {
  const problem = (id: number, attempts: number): BundleProblem => ({
    problemId: `contest:${id}/A`, name: `P${id}`, index: "A", tags: [], url: null, statement: null, statementNote: "x",
    submissions: Array.from({ length: attempts }, (_, i) => ({ id: `${id}${i}`, verdict: "OK", passedTestCount: 1, testset: null,
      language: "GNU C11", submittedAt: 1, timeMs: null, memoryBytes: null, url: null, source: "x", sourceNote: "included" })),
  });
  const bundle: Bundle = { handle: "h", profile: null, profileNote: "x", signedInHandle: "h", collectedAt: "2026-09-27T15:42:42Z",
    requested: "all", sourceMethod: "submission-pages", notes: [], problems: [problem(1, 150), problem(2, 60), problem(3, 250), problem(4, 10), problem(5, 5)] };
  const parts = splitBundle(bundle);
  expect(parts.map((part) => part.problems.map((p) => p.submissions.length))).toEqual([[150], [60], [250], [10, 5]]);
  expect(bundleFileName(parts[1]!)).toBe("codeforces-h-2026-09-27_15-42-42-UTC-part-2-of-4.md");
  expect(bundleToMarkdown(parts[1]!)).toContain("format: rookie-coach-codeforces-md/1\npart: 2 of 4\nhandle: h");
  expect(bundleToMarkdown(parts[1]!)).toContain("submissions: 60\n");
  expect(splitBundle({ ...bundle, problems: [problem(1, 120), problem(2, 80)] })).toHaveLength(1);

  const files = [...parts.map((part) => ({ name: bundleFileName(part), text: bundleToMarkdown(part) })), { name: "check", text: "123456789" }];
  const zip = zipFiles(files, new Date(bundle.collectedAt));
  const view = new DataView(zip.buffer);
  const text = (from: number, length: number) => new TextDecoder().decode(zip.subarray(from, from + length));
  let at = view.getUint32(zip.length - 22 + 16, true);
  for (const file of files) {
    const nameLength = view.getUint16(at + 28, true);
    expect(text(at + 46, nameLength)).toBe(file.name);
    const local = view.getUint32(at + 42, true);
    expect(text(local + 30 + nameLength, view.getUint32(local + 18, true))).toBe(file.text);
    at += 46 + nameLength;
  }
  expect(view.getUint32(at - 46 - 5 + 16, true)).toBe(0xcbf43926); // standard CRC-32 check value of "123456789"
});

test("maps Codeforces language names to code block languages", () => {
  const names: Record<string, string> = {
    "GNU C++20 (64)": "cpp", "C++23 (GCC 14-64, msys2)": "cpp", "C++17 (GCC 7-32)": "cpp", "Clang++20 Diagnostics": "cpp",
    "MS C++ 2017": "cpp", "GNU C11": "c", "PyPy 3-64": "python", "Python 3.13": "python", "Java 21 64bit": "java",
    "JavaScript V8 4.8.0": "javascript", "Node.js 15.8.0 (64bit)": "javascript", "Kotlin 1.9": "kotlin",
    "C# 10, .NET SDK 6.0": "csharp", "C# Mono 6.8": "csharp", "PascalABC.NET 3.8.3": "pascal", "Free Pascal 3.2.2": "pascal",
    "Delphi 7": "pascal", "F# 4.0": "fsharp", "Rust 1.75.0 (2021)": "rust", "Go 1.22.2": "go", "Haskell GHC 9.2": "haskell",
    "D DMD32 v2.105.0": "d", "OCaml 4.02.1": "ocaml", "Scala 2.12.8": "scala", "Ruby 3.2.2": "ruby", "PHP 8.1.7": "php",
    "Perl 5.20.1": "perl", "Mysterious Language": "text",
  };
  expect(Object.fromEntries(Object.keys(names).map((name) => [name, codeLanguage(name)]))).toEqual(names);
  // Code blocks inside statements are labelled too.
  const withPre = extractStatement(parse('<div class="problem-statement"><div><pre>a b</pre></div></div>'), origin)!;
  expect(withPre.sections[0]!.markdown).toBe("```text\na b\n```");
});
