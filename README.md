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

## Local extension import

Run `npm ci && npm run build:extension`, then open `chrome://extensions`, enable Developer mode, and choose **Load unpacked** with the `extension/` directory. Enter your own Codeforces handle, select a JSON response from the official `user.status` method for that account, optionally select a [user-prepared source export](docs/source-export-v1.md) with the same handle and `local-student` namespace, then press **Start import**. The popup imports that one selected metadata page to browser-local IndexedDB. It makes no network request and does not verify ownership of the selected file; only import your own history with permission.

For a synthetic check, use handle `fixture_learner` and select `fixtures/codeforces-user-status-page.json`; the popup should report two stored submissions. Click **View local evidence report** to open the extension page. It should show two observed attempts, one accepted, one repeated problem with one observed attempt before acceptance, a `WRONG_ANSWER` count of one, and two `not-collected` source entries. The source fixture uses a different synthetic namespace for parser tests; change its `account.namespace` to `local-student` in a local copy if testing the optional source field manually. Reload the unpacked extension after rebuilding. No real history or source belongs in this repository.
