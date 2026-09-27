# Project State

Updated: 2026-09-27
Last run: RC-006 — DONE

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

## Known gaps and blockers

- Codeforces documents own-account API source inclusion, but the authenticated response shape and actual source coverage remain untested. Do not claim live source collection works.
- No human-only blocker is active. Permanent license and later hosting choices are deferred.
- RC-003 through RC-005 are integrated on `main`; the earlier stacked draft PRs are closed.

## Next

RC-007: create a minimal user-controlled Chrome MV3 extension shell. Stop after that bounded run.
