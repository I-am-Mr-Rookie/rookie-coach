# Rookie Coach

Rookie Coach is an independent project intended for open-source distribution. It aims to help competitive-programming students improve from their actual submission history rather than from generic advice alone.

## Current concept

The project is expected to begin with a browser extension that, with the student's explicit permission, collects their own competitive-programming submission history and source code where technically and legally permitted. Initial platform candidates include Codeforces, AtCoder, CodeChef, and LeetCode.

The collected history is intended to power a coaching system that can eventually identify recurring mistakes, weak or missing concepts, and patterns in a student's attempts, then turn those findings into actionable guidance and practice. The goal is broader than an LLM wrapper: the system should maintain a useful model of the student's competitive-programming development over time.

## Product direction

- Initial audience: university competitive-programming students, especially beginners.
- Early benchmark persona: students around the early Codeforces rating range (roughly 800-1000 was discussed as an example, not a hard scope decision).
- Distribution: open source, runnable locally by users.
- Hosted option: Railway is a candidate for a shared/deployed version.
- Monetization: possible future subscription/business model, undecided.

## Current status

The product is still in discovery. For the first local milestone, the [run system](docs/project-overview.html#run-system) uses Codeforces and a deterministic evidence report as reversible working defaults. Permanent architecture, license, hosted storage, and monetization remain undecided.

See the [detailed project overview and run system](docs/project-overview.html), [project state](docs/PROJECT_STATE.md), and [execution backlog](docs/BACKLOG.md) for the next bounded run. [`docs/HANDOFF.md`](docs/HANDOFF.md) preserves the early context; [`docs/OPEN_QUESTIONS.md`](docs/OPEN_QUESTIONS.md) records deferred product questions.

After RC-012, the [local coaching pilot plan](docs/BACKLOG.md#post-m0-pilot) defines RC-013 through RC-020 and the feedback-dependent RC-021. The owner can recruit five volunteers; the university is not involved. See [the recorded planning decisions](docs/DECISIONS.md#post-m0-owner-direction-2026-09-27).

## Install and use

1. Get `rookie-coach-extension.zip` (build it with `npm ci` then `npm run package:extension`; it is written to `release/`). Its files sit at the ZIP root, with no wrapper folder.
2. Open `chrome://extensions` and turn on **Developer mode**. Drag the ZIP onto the page, or unzip it and click **Load unpacked** on the unzipped folder (the one containing `manifest.json`).
3. Open `codeforces.com` in a tab and sign in.
4. Click the Rookie Coach icon. It shows the signed-in handle (or type one), lets you choose how many recent submissions to include (250 by default, or 100, 500, 1000 or all), and has one button: **Create Markdown file**.
5. Keep the tab open. A small panel on the page shows progress and has a **Stop and save what I have** button. When it finishes, the browser downloads `codeforces-<handle>-<YYYY-MM-DD_HH-MM-SS>-UTC.md`, and the panel says whether everything was collected.

The file holds everything a coach or judge needs in one place: the student's rating, rank, contribution and recent rated contests; and for each problem the link, limits, full statement, example tests and every attempt with its verdict, failing test, time, memory, language and code. The format is described in [`docs/codeforces-markdown-v1.md`](docs/codeforces-markdown-v1.md).

How it works and what it will not do:

- The extension asks only for `activeTab` and `scripting`: it can act only on the tab where you clicked it, and only when you click it. It does not run in the background.
- It reads the submission list, profile and contest history from the official Codeforces API, then opens the same problem and submission pages you could open yourself, one page every 2 seconds. Around 250 submissions take roughly 10–15 minutes.
- Code is collected only when the handle matches the account signed in on that tab. Other handles get problems, statements and verdicts only.
- Problem titles, ranks and statements are requested in English (`lang=en` for the API, `?locale=en` for problem pages). Opening a page with `?locale=en` can switch your Codeforces interface to English, just like clicking the English flag.
- If Codeforces shows a browser check or refuses requests, the extension pauses. You can complete the check yourself in a new Codeforces tab and press **Continue**, or stop and save what it has. It never tries to get around those checks. If pages time out, each one is retried once, and it stops after several failures in a row.
- The file header shows `complete: yes` or what is missing, and `approx_tokens` (characters / 4) so you can check it fits the model you paste it into. About 69 submissions come to roughly 28,000 tokens; 1,000 submissions can exceed a 200,000-token context window, so choose a smaller count for those models. With **All**, more than 200 submissions are saved as one ZIP of Markdown files of up to 200 submissions each (`…-part-1-of-N.md`, newest first); 200 or fewer stay a single `.md`.
- Nothing is stored: no database, cache or temporary files. The only output is the downloaded Markdown file. Keep it private; it contains your code.
- Backup: under **Backup: use an API key instead (experimental)** you can paste a Codeforces API key and secret. The extension then asks the official API for your code (`includeSources`). The key is used for that run only and is never saved or written to the file. This path is untested because Codeforces does not document the source field it returns.

## Build and check from source

`npm test` runs the unit tests, `npm run typecheck` checks all packages and the extension, and `npm run build:extension` bundles the extension and runs `scripts/check-extension.mjs`. That script loads the built popup and collector with fake Chrome APIs and synthetic Codeforces pages, checks the manifest permissions, and confirms that a full synthetic run produces one Markdown file while contacting only Codeforces. No real history, source or credentials belong in this repository.