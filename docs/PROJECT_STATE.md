# Project State

Updated: 2026-09-27
Last run: RC-018 — DONE

## Milestone M0

Prove a local Codeforces evidence pipeline for one student: authorized historical metadata, honest source availability, normalized local records, deterministic evidence summary, and a simple report. The extension is the collection entry point; the report is the first measurable outcome. The [run queue](BACKLOG.md) defines the slices.

## What works now

- The public repository contains project context and the autonomous runbook.
- RC-001 seeded agent instructions, state, decisions, backlog, and run log.
- RC-002 documented current Codeforces submission metadata, pagination/rate behavior, and own-account `includeSources` in [the access research](research/codeforces-data-access.md).
- RC-003 added the [version 1 evidence contract](evidence-contract-v1.md), a synthetic Codeforces fixture, and a standard-library fixture validator. No application integration or real data collection exists yet.
- RC-004 added a minimal TypeScript npm workspace with shared evidence types, a Codeforces package, one cross-package smoke test, and passing typechecks. No live collection exists yet.
- RC-005 maps one synthetic Codeforces `user.status` metadata page into contract v1 records, leaving source explicitly not collected. No live collection exists yet.
- RC-006 iterates bounded `user.status` metadata pages with injected requests, two-second spacing, bounded rate-limit retries, and duplicate protection. Fixture tests pass; no live collection exists yet.
- RC-007 added a buildable, zero-permission Chrome MV3 popup that saves a configured handle in browser local storage.
- RC-008 added account-isolated local evidence stores in the core package: IndexedDB for the extension and an in-memory implementation for deterministic tests. Upserts and source/provenance round trips pass against both.
- RC-009 parses an invented, user-prepared source export into account-scoped source evidence, rejecting mismatches and contradictory statuses. The [format](source-export-v1.md) does not capture live source.
- RC-010 connects the explicit popup action to a user-selected Codeforces `user.status` JSON page and optional matching source export. It validates before writing, merges source by account and submission ID, preserves separate metadata/source provenance, and stores locally in IndexedDB. The synthetic popup import and failure path pass; no live website request is made.
- RC-011 summarizes one account's stored evidence deterministically: attempt/acceptance counts, verdict, language and source coverage, ordered problem attempts, observed attempts before first acceptance, and difficulty/tag frequencies. These are observations over imported records, not weakness diagnoses; partial imports can omit earlier attempts.
- RC-012 adds a local extension report for the configured handle with observed repeated attempts, verdict and language counts, source coverage, and available difficulty/tag metadata. The synthetic popup-to-report check passes; the README documents a manual browser demo.
- RC-013 [reviewed M0 integration and coaching readiness](research/m0-readiness.md) at merged commit `1d660ed`: the synthetic import-to-report path, 13 tests, typechecks and evidence fixture pass. It records a narrowly testable boundary-comparator revision hypothesis for later comparison work; no diagnosis has been validated.
- RC-015 compares immediately adjacent observed failed and accepted attempts for one account and problem, ordered by time and submission ID. It exposes a contiguous changed-line block and both capture origins when both source texts exist, or an explicit unavailable comparison with the original source statuses. Synthetic tests pass; no diagnosis is emitted.
- RC-016 adds a [narrow possible loop-bound edit rule](research/recurring-boundary-rule.md) for two distinct GNU C++20 problems with available, originated source. It returns supporting submission references or an explicit insufficient-evidence reason. Synthetic counterexamples pass; this is not a validated explanation of either verdict.
- RC-017 maps that supported finding to one deterministic, self-contained array-index tracing exercise with a checkable finish. Unknown rules and insufficient evidence produce no action. The action is available in core; the extension report does not display it yet.
- RC-018 displays the candidate finding, supporting submission IDs and origins, inert local source text, and the one exercise in the existing report. It distinguishes insufficient evidence from no supported pattern; synthetic finding, missing-source, no-match, empty-account and untrusted-text checks pass.

## Known gaps and blockers

- Codeforces documents own-account API source inclusion, but the authenticated response shape and actual source coverage remain untested. Do not claim live source collection works.
- A real browser load and student import have not been checked; synthetic IndexedDB and fixture checks cover the report path and coaching states.
- The popup imports one selected JSON page, not live or full history. Account-scoped deletion and export controls are planned for RC-019 before a pilot. The recurring-edit rule remains a candidate, not a validated explanation. No synthetic integration repair was required in RC-013.
- No human-only blocker is active. Permanent license and later hosting choices are deferred.
- Completed checkpoints are recorded in Git history and the run log.

## Next

RC-019: add account-scoped local deletion and export controls before the pilot. RC-014 remains WAITING for one student's explicit permission and local live check; it is independent of fixture-based work. Stop after this bounded run.

## Planned next milestone: local coaching pilot

Follow [RC-013 through RC-020](BACKLOG.md#post-m0-pilot) to prepare one conservative recurring-mistake diagnosis and one practice action. RC-021 reviews real feedback when available. The owner can recruit five volunteers; individual consent and live validation are still required. This independent project has no supplied university evaluation requirement. RC-013 is RESEARCH_COMPLETE, RC-015 through RC-018 are DONE, RC-019 is READY, and RC-014 remains WAITING for authorization.
