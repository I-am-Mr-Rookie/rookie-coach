# Project State

Updated: 2026-09-27
Last run: RC-014 — DONE

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
- RC-014 checked one authorized official 10-record metadata page in local Chrome. An independent local recheck matched the owner's export by ID, verdict and language; the intentionally entered profile URL's final handle segment matched the page's sole author. An owner-provided report screenshot showed the expected aggregate counts. The owner reports the repeat import worked and that their own submitted source is viewable normally on Codeforces; neither action was independently observed. No source was imported, so all 10 local records correctly remain `not-collected`. Live account-isolation testing was explicitly waived for this single-account RC-014 check, not verified. See [the non-identifying result](research/live-import-check.md). This completes RC-014's bounded check, not the real-student coaching or pilot readiness gates.
- The popup imports one selected JSON page, not live or full history. Exported JSON can include private source/history; deletion cannot remove original files or prior downloads. The recurring-edit rule remains a candidate, not a validated explanation. No synthetic integration repair was required in RC-013.
- No bare-handle repair or reimport is required for the accepted URL-shaped account key. Exact-text account keys can create separate local buckets if a different string is entered later. Permanent license and later hosting choices are deferred.
- Completed checkpoints are recorded in Git history and the run log.

## Next

RC-014 is complete for its bounded metadata import and source-availability check. The live sample contains no imported source, so the source-dependent coaching rule cannot be validated from it. Pilot readiness still requires suitable source coverage, real-browser data-control checks and individual consent. RC-021 remains WAITING for actual permitted feedback; no further run is activated here.

## Planned next milestone: local coaching pilot

RC-013 is RESEARCH_COMPLETE; RC-014 through RC-020 are DONE. The [pilot guide](pilot-guide.md) prepares a local five-volunteer exercise, but the owner has not recruited or enrolled anyone. RC-014's one-page metadata check is complete; source-dependent live coaching and pilot controls remain unverified. RC-021 is WAITING for real, permitted feedback. This independent project has no supplied university evaluation requirement.
