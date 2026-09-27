# Rookie Coach agent contract

Read [the full run system](docs/project-overview.html#run-system), [current state](docs/PROJECT_STATE.md), [backlog](docs/BACKLOG.md), [decisions](docs/DECISIONS.md), and the latest [run log](docs/RUN_LOG.md) before starting a task. These repository files are the handoff for a fresh chat or account.

## One bounded run

- Record a UTC start time at the first tool step. Hard stop at 30 minutes of wall-clock time. At minute 27, stop new implementation and checkpoint. Use timeouts for potentially slow commands; no watch modes or indefinite servers.
- Run `git status --short` before editing. Preserve any unknown changes; never reset or overwrite someone else's work.
- Select the highest-priority `READY` task with satisfied dependencies. Work on one objective only. If it will not fit, split it before coding. Write 1–3 acceptance checks before editing.
- Follow repository precedent, then choose the smallest reversible implementation. Do not ask routine questions, start the next numbered task in the same run, or turn deferred product ideas into permanent commitments.
- Verify the changed behavior with the smallest relevant check. Record exact commands and results. Never weaken validation to conceal a failure.
- At the end, update `PROJECT_STATE`, `BACKLOG`, and `RUN_LOG`, inspect `git diff` and `git status --short`, and commit/push coherent work when authorized. End with exactly one state: `DONE`, `PARTIAL_CHECKPOINT`, `BLOCKED`, or `RESEARCH_COMPLETE`. Stop at 30 minutes even if unfinished.

## Boundaries

- Do not commit credentials, tokens, cookies, private student submissions, or real user history. Real student data stays local during this milestone. Collect a student's own data only with explicit permission.
- Do not bypass platform authentication, CAPTCHAs, anti-bot controls, access controls, or platform rules. Verify external API capabilities from current authoritative evidence; use sanitized fixtures when a live collection path is unclear.
- Keep the current milestone to one student's Codeforces evidence pipeline and a deterministic local report. No other platform, cloud database, Railway deployment, billing, or LLM dependency in RC-001 through RC-012.
- Use TypeScript, Node.js 22+ conventions, npm workspaces, Vitest, and Chrome/Chromium Manifest V3 as reversible first-milestone defaults unless existing code establishes a compatible precedent. No framework solely for a simple report.
- Do not force-push, rewrite public history, change repository visibility, or add a permanent license without the owner's decision.
- Ask the owner only for a genuine human-only blocker: credentials/authorization, spending or paid infrastructure, destructive/irreversible action, legal acceptance, a material product-policy choice, or an inaccessible external resource. Record the blocker and a precise next action.

## Current verification

This repository is documentation only after RC-001. Check Markdown file presence, backlog IDs and dependencies, HTML section links, and `git diff --check`. For later runs, use targeted syntax/fixture tests, package typechecks and tests as applicable; record any unrun check.
