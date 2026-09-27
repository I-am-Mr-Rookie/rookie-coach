# Project State

Updated: 2026-09-27
Last run: RC-003 — DONE

## Milestone M0

Prove a local Codeforces evidence pipeline for one student: authorized historical metadata, honest source availability, normalized local records, deterministic evidence summary, and a simple report. The extension is the collection entry point; the report is the first measurable outcome. The [run queue](BACKLOG.md) defines the slices.

## What works now

- The public repository contains project context and the autonomous runbook.
- RC-001 seeded agent instructions, state, decisions, backlog, and run log.
- RC-002 documented current Codeforces submission metadata, pagination/rate behavior, and own-account `includeSources` in [the access research](research/codeforces-data-access.md).
- RC-003 added the [version 1 evidence contract](evidence-contract-v1.md), a synthetic Codeforces fixture, and a standard-library fixture validator. No application integration or real data collection exists yet.

## Known gaps and blockers

- Codeforces documents own-account API source inclusion, but the authenticated response shape and actual source coverage remain untested. Do not claim live source collection works.
- No human-only blocker is active. Permanent license and later hosting choices are deferred.

## Next

RC-004: create the minimal TypeScript workspace and smoke checks around the version 1 contract. Stop after that bounded run.
