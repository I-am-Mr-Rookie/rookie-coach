# Execution Backlog

One task per run, with a 30-minute hard limit. The full run definitions and product defaults live in [the project overview](project-overview.html#run-system). Do not start the next task in the same run.

## RC-001 Bootstrap agent control plane
Status: DONE
Priority: P01
Timebox: one run, <= 30 min
Depends on: none

Goal: Create the durable run-control files so future models need no conversation history.

Acceptance: AGENTS.md , docs/PROJECT_STATE.md , docs/BACKLOG.md , docs/DECISIONS.md , and docs/RUN_LOG.md exist. PROJECT_STATE sets milestone M0 to “prove a local Codeforces evidence pipeline for one student.” BACKLOG contains RC-002 through RC-012 from this table. DECISIONS distinguishes owner-stated decisions from working defaults. RUN_LOG records RC-001. Validate paths/content, inspect git diff/status, commit if authorized.

Out of scope: No application code, no API integration, no architecture debate, no questions to the owner.

## RC-002 Codeforces access research
Status: RESEARCH_COMPLETE
Priority: P02
Timebox: one run, <= 30 min
Depends on: RC-001

Goal: Establish what can currently be obtained legitimately for one user's history.

Acceptance: Create docs/research/codeforces-data-access.md . Verify, from authoritative current evidence, official API submission-history capabilities/fields, pagination/rate constraints, whether source text is exposed by the API, and how a logged-in user normally views their own source. Separate confirmed facts from assumptions; date sources/findings; record a safe acquisition plan. If live source automation is not clearly permitted/available, choose fixture/user-export parsing as the prototype path rather than bypassing controls.

Out of scope: No scraping bypass, no credentials, no broad multi-platform research, no production crawler.

## RC-003 Normalized evidence contract
Status: DONE
Priority: P03
Timebox: one run, <= 30 min
Depends on: RC-002

Goal: Define a platform-neutral representation before writing adapters.

Acceptance: Add versioned JSON schemas (or equivalently strict documented contracts) for StudentAccount , ProblemRef , and Submission , plus at least one sanitized Codeforces example fixture. Required concepts include platform, student namespace/handle, submission ID, problem, verdict, language, timestamp, optional contest/difficulty/tags, nullable source, explicit source-status, capture method/provenance, and captured-at timestamp. Validate JSON deterministically.

Out of scope: No LLM schema, no recommendation engine, no cloud database.

## RC-004 Minimal TypeScript workspace
Status: DONE
Priority: P04
Timebox: one run, <= 30 min
Depends on: RC-003

Goal: Create the smallest maintainable code/test scaffold for the vertical slice.

Acceptance: Initialize npm workspaces with a small shared/core package and Codeforces adapter package; TypeScript configuration; Vitest; scripts for test and typecheck . Do not introduce a frontend framework. A trivial smoke test and typecheck must pass. Preserve any pre-existing repository conventions instead if they already exist.

Out of scope: No backend, no Railway, no UI framework, no database server.

## RC-005 Codeforces metadata adapter
Status: READY
Priority: P05
Timebox: one run, <= 30 min
Depends on: RC-004

Goal: Normalize one page of Codeforces submission metadata without claiming source-code access.

Acceptance: Using recorded/sanitized API fixtures from RC-002, implement a typed adapter that maps one official submission-history response/page into the normalized submission contract. Tests cover IDs, problem reference, verdict, language, timestamp, and explicit sourceStatus when source is absent.

Out of scope: No historical loop yet, no live source extraction, no extension UI.

## RC-006 Historical metadata backfill
Status: WAITING
Priority: P06
Timebox: one run, <= 30 min
Depends on: RC-005

Goal: Build a bounded, testable iterator for a student's historical Codeforces metadata.

Acceptance: Implement pagination/backfill around the verified official API behavior from RC-002, with injectable network access and deterministic tests for multiple pages, empty completion, duplicate protection, and bounded retry/rate behavior. The live network is optional for tests; fixtures are mandatory.

Out of scope: No source capture, no arbitrary-handle mass collection, no background daemon.

## RC-007 Chrome MV3 extension shell
Status: WAITING
Priority: P07
Timebox: one run, <= 30 min
Depends on: RC-006

Goal: Create the user-controlled collection entry point.

Acceptance: Add a loadable Manifest V3 extension skeleton with a minimal popup/options surface: configured Codeforces handle, a clear explanation that collection concerns the student's own history, and an explicit user action to start import. Use minimum permissions. Build/manifest validation succeeds. No secrets or cookies are stored in source control.

Out of scope: No polished design system, no multi-platform selector, no login service.

## RC-008 Local evidence storage
Status: WAITING
Priority: P08
Timebox: one run, <= 30 min
Depends on: RC-007

Goal: Persist normalized records locally and isolate data by student/platform account.

Acceptance: Create a local storage abstraction suitable for the extension; prefer IndexedDB for potentially large histories. Include an in-memory/fake implementation for deterministic tests. Upsert by platform + account + submission ID; preserve source-status/provenance; demonstrate that two configured accounts cannot overwrite each other's records.

Out of scope: No remote sync, no hosted DB, no multi-user server.

## RC-009 Source-evidence prototype
Status: WAITING
Priority: P09
Timebox: one run, <= 30 min
Depends on: RC-008

Goal: Prototype the source-code path using the legitimate method established by RC-002.

Acceptance: If RC-002 confirms a normal user-authorized browser route suitable for collection, create a narrow parser/capture adapter and test it against a sanitized saved fixture. If live automation is not clearly justified, implement the same interface against a user-export/saved-page fixture and mark live capture as deferred. In both cases, distinguish available/unavailable/not-collected source and never bypass access controls.

Out of scope: No CAPTCHA solving, no anti-bot bypass, no credential harvesting, no bulk scraping.

## RC-010 One-student import vertical slice
Status: WAITING
Priority: P10
Timebox: one run, <= 30 min
Depends on: RC-009

Goal: Connect the extension action to Codeforces metadata import and local normalized storage.

Acceptance: From one configured handle, a user-triggered import can process fixture/mocked data end-to-end and store normalized submissions locally. Where an allowed source fixture is available, merge source evidence by submission ID. Provide progress/error states sufficient for debugging. Tests do not depend on a live website.

Out of scope: No scheduler, no continuous background scraping, no other platforms.

## RC-011 Deterministic evidence summary
Status: WAITING
Priority: P11
Timebox: one run, <= 30 min
Depends on: RC-010

Goal: Turn normalized history into the first coaching evidence without an LLM.

Acceptance: Compute and test at least: total attempts, accepted count, verdict distribution, problems with repeated attempts, attempts-before-acceptance where inferable, language distribution, and difficulty/tag summaries when metadata exists. Keep claims evidence-based: do not call a topic “weak” merely because it appears once.

Out of scope: No personalized curriculum generator, no embeddings, no LLM calls.

## RC-012 Local first report
Status: WAITING
Priority: P12
Timebox: one run, <= 30 min
Depends on: RC-011

Goal: Make the first milestone visible to a student.

Acceptance: Add a simple local extension page/report showing the RC-011 evidence for the configured student, including repeated-attempt/failure patterns and data-coverage notes such as how many submissions lack source. The report must be understandable without an LLM and must not imply causal weaknesses that the evidence does not support. Test rendering/transform logic where practical and document a manual demo path.

Out of scope: No production hosting, no monetization, no second platform, no elaborate UI.
