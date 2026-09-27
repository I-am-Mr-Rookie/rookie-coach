# Project State

Updated: 2026-09-27
Last run: RC-014 — PARTIAL_CHECKPOINT

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
- RC-017 maps that supported finding to one deterministic, self-contained array-index tracing exercise with a checkable finish. Unknown rules and insufficient evidence produce no action.
- RC-018 displays the candidate finding, supporting submission IDs and origins, inert local source text, and the one exercise in the existing report. It distinguishes insufficient evidence from no supported pattern; synthetic finding, missing-source, no-match, empty-account and untrusted-text checks pass.
- RC-019 adds a per-account version 1 JSON evidence download and confirmed local deletion. The selected account's records remain gone after reopening IndexedDB; other accounts stay intact. Clearing its saved handle refreshes an open report. Import remains an explicit local file action with no background collection.
- RC-020 adds a [synthetic pilot guide](pilot-guide.md) with local rehearsal, individual import and feedback permission, a short feedback form, and explicit live/source/browser readiness gates. The synthetic build flow passed; no real pilot has launched.

## Known gaps and blockers

- Codeforces documents own-account API source inclusion, but the authenticated response shape and actual source coverage remain untested. Do not claim live source collection works.
- RC-014 loaded the unpacked extension in the owner's local Chrome and checked one authorized official 10-record metadata page. The explicit file import, live report, repeated import, account isolation, and own-submission source access were not completed. See [the non-identifying checkpoint](research/live-import-check.md). Synthetic IndexedDB and fixture checks still cover the report path, coaching states and local data controls. The pilot is not ready until the live gate, suitable source coverage, browser controls and individual consent are checked.
- The popup imports one selected JSON page, not live or full history. Exported JSON can include private source/history; deletion cannot remove original files or prior downloads. The recurring-edit rule remains a candidate, not a validated explanation. No synthetic integration repair was required in RC-013.
- RC-014 has the owner's permission and a partial local check; it awaits completion of the explicit file import and report comparison. Permanent license and later hosting choices are deferred.
- Completed checkpoints are recorded in Git history and the run log.

## Next

Resume RC-014's authorized local import from its [partial checkpoint](research/live-import-check.md); do not mistake the API page or synthetic build for an imported report. RC-021 remains WAITING for RC-014, pilot readiness and actual permitted feedback. No further run is activated here.

## Planned next milestone: local coaching pilot

RC-013 is RESEARCH_COMPLETE; RC-015 through RC-020 are DONE. The [pilot guide](pilot-guide.md) prepares a local five-volunteer exercise, but the owner has not recruited or enrolled anyone. RC-014 has an authorized PARTIAL_CHECKPOINT and remains WAITING for its live import acceptance gate; RC-021 is WAITING for real, permitted feedback. This independent project has no supplied university evaluation requirement.
