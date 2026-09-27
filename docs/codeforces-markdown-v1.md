# Codeforces Markdown bundle, version 1

The extension writes one file, `codeforces-<handle>-<YYYY-MM-DD_HH-MM-SS>-UTC.md` (the collection time, so repeated runs never share a name), for an LLM, judge or other tool. It is Markdown so that source code and examples stay exactly as written (JSON would escape every newline, quote and backslash). The structure is fixed so a program can parse it.

## Rules

- Headings have fixed prefixes: `# Codeforces submissions for`, `## How to read this file`, `## Collection notes` (only when there is something to report), `## Student profile`, `## Problem`, `### <statement section>`, `### Example <n>`, `### Attempts`, `#### Submission <id>: <label>`.
- Metadata lines are `key: value`, one per line, directly under a heading. Missing data is written out (`not available`, `unrated`, `not collected (<reason>)`), never guessed.
- Code and example tests are fenced blocks. The fence is at least three backticks and always longer than any backtick run inside the block. Every block names its language: submission code uses the language Codeforces recorded (`cpp`, `c`, `python`, `java`, `kotlin`, `csharp`, `pascal`, `rust`, `go`, `haskell`, `d`, …); examples, code inside statements and unknown languages use `text`.
- Names, ranks and statements are requested in English (`lang=en` on API calls, `?locale=en` on problem pages).
- Problems are ordered by most recent attempt first. Attempts inside a problem are oldest first, so failed attempts come before the accepted one.
- No API key, secret, cookie, real name or city is written to the file.

## Several files

With the **All** option and more than 200 submissions, the export is a ZIP of files named `…-part-<i>-of-<n>.md`. Each holds at most 200 submissions; a problem's attempts are never split, so a file can hold fewer (and a problem with over 200 attempts gets its own file). Part 1 has the newest problems. Every part repeats the header and profile, and its counts cover that file only.

## File header

`format` (`rookie-coach-codeforces-md/1`), `part` (`<i> of <n>`, only in multi-file exports), `handle`, `signed_in_as`, `collected_at` (UTC), `requested`, `submissions`, `accepted`, `problems`, `source_method` (`submission-pages`, `api-includeSources` or `none`), `source_included` and `statements_included` (as `included/total`), `complete` (`yes`, or `no (missing …)`), and `approx_tokens` (characters / 4, rounded to 100; a rough size to compare with a model's context window).

## Student profile

From the official `user.info` and `user.rating` API methods: `url`, `profile` (`included` or the reason it is missing), `rating`, `rank`, `max_rating`, `max_rank`, `contribution`, `friend_of_count`, `registered_at`, `last_online_at`, `rated_contests`, then a table of up to 10 most recent rated contests: date, contest name and ID, place, rating change and new rating.

## Problem section

`problem_id` (for example `contest:1850/A`), `url`, `contest_id`, `index`, `rating`, `tags`, `time_limit`, `memory_limit`, `input_file`/`output_file` (only when not standard input/output), `statement` (`included` or a reason) and `attempts`.

Then the statement sections in page order, with titles taken from the page: `### Statement` (the legend), `### Input`, `### Output`, sometimes `### Interaction`, the examples and `### Note`. Formulas keep Codeforces' TeX as `$…$` (inline) and `$$…$$` (display). Images and links are absolute URLs.

Each `### Example <n>` has an `input:` block and an `expected_output:` block. These are the public examples from the statement, not the hidden judge tests.

## Attempt section

`#### Submission <id>: <label>`, where the label is `Accepted`, `Wrong answer on test 3`, `Compilation error` and so on. Then `url`, `submitted_at`, `language`, `verdict` (Codeforces API name; `OK` means accepted), `passed_tests`, `failed_on_test` (for verdicts that fail on a test), `testset`, `time_ms`, `memory_kb`, `source` (`included` or a reason), then the code block when included.
