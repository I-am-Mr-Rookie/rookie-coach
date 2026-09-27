# Project State

Updated: 2026-09-27
Last run: RC-010 — DONE

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

## Known gaps and blockers

- Codeforces documents own-account API source inclusion, but the authenticated response shape and actual source coverage remain untested. Do not claim live source collection works.
- No human-only blocker is active. Permanent license and later hosting choices are deferred.
- RC-003 through RC-005 are integrated on `main`; the earlier stacked draft PRs are closed.

## Next

RC-011: compute the deterministic evidence summary from locally stored submissions. Stop after that bounded run.

## Planned next milestone: local coaching pilot

After RC-012, follow [RC-013 through RC-020](BACKLOG.md#post-m0-pilot) to prepare one conservative recurring-mistake diagnosis and one practice action. RC-021 reviews real feedback when available. The owner can recruit five volunteers; individual consent and live validation are still required. This independent project has no supplied university evaluation requirement. These future tasks are WAITING and do not change the current M0 queue.
