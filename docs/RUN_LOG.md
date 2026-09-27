# Run Log

Append one compact entry per run. Never replace earlier entries. The terminal state must be `DONE`, `PARTIAL_CHECKPOINT`, `BLOCKED`, or `RESEARCH_COMPLETE`.

## Run 2026-09-27 / RC-001
Status: DONE
Objective: Bootstrap the repository control plane and replace the older overview with the runbook version.

Changed:
- `docs/project-overview.html` — replaced the earlier overview in place with the attached autonomous runbook.
- `AGENTS.md` — durable run rules and repository safety boundaries.
- `docs/PROJECT_STATE.md` — milestone M0, current status, and RC-002 handoff.
- `docs/BACKLOG.md` — RC-001 through RC-012, statuses, dependencies, acceptance and scope.
- `docs/DECISIONS.md` — owner direction, reversible defaults and deferred choices.
- `docs/RUN_LOG.md` — this checkpoint.
- `README.md`, `docs/HANDOFF.md`, `docs/OPEN_QUESTIONS.md` — point to the updated run system and clarify that earlier open questions are deferred rather than Run 1 blockers.

Verified:
- `python` (one-shot stdlib validator) — PASS: five control files, exact replacement overview bytes, 15 HTML navigation anchors, RC-001 through RC-012 with expected statuses/dependencies, milestone M0, and local Markdown link targets.
- `git diff --check` — PASS: no whitespace errors.
- `git status --short` and `git diff --stat` — PASS: expected Run 1 files only; no pre-existing changes in the clean clone.

Assumptions / decisions:
- The new attachment replaces `docs/project-overview.html` at the same path so the existing README link remains valid. The older version remains only in Git history.
- RC-001 is setup only; RC-002 begins in a later run.

Remaining / next:
- RC-002 — verify Codeforces data-access paths and record authoritative evidence.

Commit:
- `681ed4914aed6a00388cebd294d07d29d043804a` — primary RC-001 checkpoint; this log update is a follow-up commit.

## Run 2026-09-27 / RC-002
Status: RESEARCH_COMPLETE
Objective: Establish current legitimate Codeforces history and own-source access for one student.

Changed:
- `docs/research/codeforces-data-access.md` — dated official findings, limits, uncertainties, and fixture-first acquisition plan.
- `docs/PROJECT_STATE.md`, `docs/BACKLOG.md`, `docs/DECISIONS.md` — mark research complete, activate RC-003, and record the newly documented own-account API source option without claiming a live integration.
- `docs/RUN_LOG.md` — this handoff.

Verified:
- Codeforces API introduction, methods, and return-object references plus Codeforces source-viewing guidance — reviewed 2026-09-27; `user.status` has 1-based paging, one request per two seconds, and own-account `includeSources`, while the documented `Submission` object omits source payload details.
- `python3` targeted document/link/status checks — PASS (see local verification in this run).
- `git diff --check` — PASS.
- `git status --short` and `git diff --stat` — expected documentation files only.

Assumptions / decisions:
- A 100-record page size and two-second minimum delay are conservative prototype choices. Signed-request behavior and source response shape need an authorized local check; no student data or credentials were used.

Remaining / next:
- RC-003 — versioned normalized evidence contracts and synthetic sanitized Codeforces fixture.

Commit:
- This entry is committed with the RC-002 research checkpoint; use the Git commit containing this entry as its hash.

## Run 2026-09-27 / RC-003
Status: DONE
Objective: Define versioned, account-scoped evidence records and a synthetic Codeforces example before adapters.

Changed:
- `docs/evidence-contract-v1.md` — strict StudentAccount, ProblemRef, Submission, and fixture-envelope field contracts, including nullable source/status and capture provenance.
- `fixtures/codeforces-evidence-v1.json` — invented two-attempt metadata example; no student history or credentials.
- `scripts/check-evidence-fixture.py` — dependency-free deterministic shape and invariant validation.
- `docs/PROJECT_STATE.md`, `docs/BACKLOG.md`, `docs/RUN_LOG.md` — record completion and activate RC-004.

Verified:
- `python3 scripts/check-evidence-fixture.py` — PASS: fixture conforms to contract v1.
- `python3 -m json.tool fixtures/codeforces-evidence-v1.json` — PASS: JSON parses.
- Targeted negative mutation check — PASS: source/status mismatch rejected.
- `git diff --cached --check` and `git status --short` — PASS: expected files only, no whitespace errors.

Assumptions / decisions:
- Strict documented contracts are the versioned representation for this run; RC-004 can add TypeScript types without a JSON Schema validator dependency.
- `not-collected` means metadata alone makes no source availability claim. Fixture IDs and handle are synthetic.

Remaining / next:
- RC-004 — minimal TypeScript workspace, shared/core and Codeforces packages, smoke test and typecheck.

Commit:
- This entry is committed with the RC-003 checkpoint; use the Git commit containing this entry as its hash.

## Run 2026-09-27 / RC-004
Status: DONE
Objective: Create the smallest TypeScript npm workspace for shared evidence types and the Codeforces adapter.

Changed:
- `package.json`, `package-lock.json`, `tsconfig.json` — npm workspaces, pinned TypeScript/Vitest, test and typecheck scripts.
- `packages/core` — version 1 record types aligned with the documented contract.
- `packages/codeforces` — package linkage and a cross-workspace smoke test; no metadata adapter yet.
- `docs/PROJECT_STATE.md`, `docs/BACKLOG.md`, `docs/RUN_LOG.md` — mark RC-004 complete and activate RC-005.

Verified:
- `npm run typecheck` — PASS for both packages.
- `npm test` — PASS, one smoke test.
- `python3 scripts/check-evidence-fixture.py` — PASS for the RC-003 synthetic fixture.
- `git diff --check` — PASS; final staged diff/status inspected before commit.

Assumptions / decisions:
- Package exports point to TypeScript source for this private, unbuilt workspace; a distributable build is outside RC-004.
- RC-003 remains on draft PR #1, so RC-004 is based on its branch and should be integrated afterward.

Remaining / next:
- RC-005 — map one sanitized official Codeforces response page into the normalized submission contract.

Commit:
- This entry is committed with the RC-004 checkpoint; use the Git commit containing this entry as its hash.

## Run 2026-09-27 / RC-005
Status: DONE
Objective: Normalize one Codeforces `user.status` metadata page into version 1 evidence records.

Changed:
- `packages/codeforces/src/index.ts` — validates the relevant API shape, maps account and problem fields, and records source as `not-collected`.
- `fixtures/codeforces-user-status-page.json` — invented metadata matching documented `user.status` fields; no student history or source.
- `packages/codeforces/src/index.test.ts` — checks IDs, problem, verdict, language, time, absent fields, and failed responses.
- `docs/PROJECT_STATE.md`, `docs/BACKLOG.md`, `docs/RUN_LOG.md` — record completion and activate RC-006.

Verified:
- `npm run typecheck` — PASS for both packages.
- `npm test` — PASS, three tests.
- `python3 scripts/check-evidence-fixture.py` — PASS.
- `python3 -m json.tool fixtures/codeforces-user-status-page.json` — PASS.
- `git diff --check` — PASS.

Assumptions / decisions:
- An API metadata page cannot establish source availability; even if extra source fields appear, this adapter leaves source null and status `not-collected`.
- A problem without a contest ID uses its documented problemset name; without either stable key, the adapter rejects the page rather than conflating problems.

Remaining / next:
- RC-006 — bounded historical metadata paging with injectable network access and deterministic fixtures.

Commit:
- This entry is committed with the RC-005 checkpoint; use the Git commit containing this entry as its hash.

## Run 2026-09-27 / RC-006
Status: DONE
Objective: Iterate a bounded history of one student's Codeforces submission metadata with injectable network access.

Changed:
- `packages/codeforces/src/index.ts` — async page iterator using 1-based offsets, a configurable 100-record maximum page size, required page cap, two-second request spacing, at most two rate-limit retries, and submission-ID deduplication.
- `packages/codeforces/src/index.test.ts` — synthetic fixture checks for multiple pages, empty completion, duplicate protection, page cap, spacing, retry exhaustion, and immediate non-rate failure.
- `docs/PROJECT_STATE.md`, `docs/BACKLOG.md`, `docs/RUN_LOG.md` — record RC-006 and activate RC-007.

Verified:
- `npm run typecheck` — PASS for both packages.
- `npm test` — PASS, five tests.
- `python3 scripts/check-evidence-fixture.py` — PASS.
- `git diff --check` — PASS.

Assumptions / decisions:
- A 100-record maximum and two-second interval are conservative implementation bounds from RC-002, not a documented Codeforces page-size maximum. Short pages continue until empty or the caller's page cap.
- The caller provides an authorized request function; no live network or student history was used. Rate-limit failures alone retry; other failures propagate.

Remaining / next:
- RC-007 — user-controlled MV3 extension shell with explicit import action and minimum permissions.

Commit:
- This entry is committed with the RC-006 checkpoint; use the Git commit containing this entry as its hash.

## Run 2026-09-27 / RC-007
Status: DONE
Objective: Add a user-controlled Chrome MV3 extension shell for one Codeforces handle.

Changed:
- `extension/` — zero-permission manifest, popup with own-history explanation and Start import action, TypeScript build output ignored by Git.
- `scripts/check-extension.mjs`, `package.json` — validate the manifest, built popup script, handle restoration, and explicit action with a synthetic handle.
- `README.md` — local build and Load unpacked instructions.
- `docs/PROJECT_STATE.md`, `docs/BACKLOG.md`, `docs/RUN_LOG.md` — record completion and activate RC-008.

Verified:
- `npm run build:extension` — PASS: TypeScript build, MV3 manifest and popup action checks.
- `npm run typecheck` — PASS for core and Codeforces packages.
- `npm test` — PASS, five existing tests.
- `git diff --check` — PASS.
- Chrome manual load — not run; no Chrome/Chromium executable in this environment. The generated script and manifest paths were checked.

Assumptions / decisions:
- The shell uses extension-origin `localStorage` for only the handle and requests no extension permissions. RC-008 will add account-isolated evidence storage.
- Start import saves configuration and explicitly states that no history was collected; the end-to-end import belongs to RC-010.

Remaining / next:
- RC-008 — local, account-isolated evidence storage with a deterministic fake.

Commit:
- This entry is committed with the RC-007 checkpoint; use the Git commit containing this entry as its hash.

## Planning checkpoint 2026-09-27 / PLAN-POST-M0
Status: DONE
Objective: Record the owner-requested post-RC-012 run briefs and pilot decisions for future workers.
Started UTC: 2026-09-27T05:34:25.906Z

Changed:
- docs/BACKLOG.md — detailed WAITING briefs RC-013 through RC-020 plus feedback-gated RC-021, with activation conditions, dependencies, acceptance, verification, fallbacks and 30-minute checkpoints.
- docs/DECISIONS.md and docs/OPEN_QUESTIONS.md — accepted outcome, five prospective volunteers, independent project context, delegated implementation choices and genuine future owner gates.
- docs/PROJECT_STATE.md, docs/project-overview.html and README.md — discoverable links to the future plan and corrected university involvement.
- docs/RUN_LOG.md — this planning checkpoint; no numbered implementation run was executed.

Verified:
- `python3 ../check-future-plan.py` — PASS: future task fields/statuses, dependency graph, preservation of RC-001 through RC-012 and existing run log, current next task, and changed-document local link targets.
- `git diff --check` — PASS: no whitespace errors.
- `git diff --stat`, `git diff` and `git status --short` — reviewed the seven intended documentation files.
- Application tests not run: no application code changed.

Assumptions / decisions:
- User explicitly requested publishing these future instructions while another worker handles the current queue. The planning snapshot starts from main at 7fde748a7f42c53f4224b5ff55ca58ef5094bd51; the update was reapplied onto bfc77c68797a6ab2c914068459f3532e38dfc790 to preserve the concurrent worker's changes. Publication must still recheck main.
- The five volunteers are a future recruitment target, not enrolled participants or consent to collect data.
- RC-014 requires an authorized local live check; RC-015 can use synthetic fixtures independently. RC-021 requires actual permitted feedback.
- RC-019 must be split into children if missing data controls exceed one run. Hosting, paid services, LLMs, other platforms and the permanent license remain deferred.

Remaining / next:
- Continue the current M0 task named in PROJECT_STATE; after refreshing the snapshot RC-008 is READY.
- After RC-012 completes, activate RC-013 using the new backlog conditions. No future run is marked complete by this update.

Commit:
- This entry is committed with the planning update; use the Git commit containing it as its hash.

## Run 2026-09-27 / RC-008
Status: DONE
Objective: Store version 1 submissions locally by platform, namespace, handle, and submission ID.

Acceptance checks:
- IndexedDB and deterministic in-memory stores upsert by the full account/submission key.
- Two handles and namespaces cannot overwrite each other's records.
- Source status, source text, and provenance survive writes and reads.

Changed:
- `packages/core/src/storage.ts` — small evidence-store interface, browser IndexedDB store with a compound key and account index, and an in-memory store.
- `packages/core/src/storage.test.ts` — synthetic account isolation, replacement, source/provenance round-trip, copy isolation, and fake IndexedDB reopening checks.
- `packages/core/src/index.ts`, `package.json`, `package-lock.json` — export storage and pin the test-only IndexedDB fake.
- `docs/PROJECT_STATE.md`, `docs/BACKLOG.md`, `docs/RUN_LOG.md` — record completion and activate RC-009.

Verified:
- `npm run typecheck` — PASS, both packages.
- `npm test` — PASS, seven tests (two storage, five Codeforces).
- `npm run build:extension` — PASS, MV3 popup validation.
- `git diff --check` — PASS.

Assumptions / decisions:
- Account identity follows contract v1 `(platform, namespace, handle)`; a handle change remains a separate account without silent migration.
- Upsert replaces one submission record with the supplied record. RC-010 must deliberately merge source evidence when importing metadata again.
- The extension has no database access wired into its popup yet; RC-010 owns that connection. No real student data was used.

Remaining / next:
- RC-009 — source-evidence prototype using a sanitized saved-page or user-export fixture under the RC-002 access findings.

Commit:
- This entry is committed with the RC-008 checkpoint; use the Git commit containing this entry as its hash.

## Run 2026-09-27 / RC-009
Status: DONE
Objective: Parse user-provided Codeforces source evidence from a synthetic local export.
Started UTC: 2026-09-27T05:46:17Z

Acceptance checks:
- A sanitized export yields account-scoped available and explicitly unavailable source evidence with capture provenance.
- Missing export entries leave metadata at not-collected; invalid or cross-account entries are rejected.
- Targeted tests and package typechecks pass without a live Codeforces request.

Changed:
- `packages/codeforces/src/index.ts` — narrow source export parser returning source evidence without claiming an API response shape.
- `fixtures/codeforces-user-source-export.json`, `packages/codeforces/src/index.test.ts` — invented source/status example and positive/negative checks.
- `docs/source-export-v1.md` — local format, observation requirements and live-capture limit.
- `docs/PROJECT_STATE.md`, `docs/BACKLOG.md`, `docs/RUN_LOG.md` — complete RC-009 and activate RC-010.

Verified:
- `npm run typecheck` — PASS, core and Codeforces packages.
- `npm test` — PASS, nine tests across two files.
- `python3 -m json.tool fixtures/codeforces-user-source-export.json` — PASS.
- `git diff --check` — PASS.

Assumptions / decisions:
- This JSON is a Rookie Coach user-prepared format, not an official Codeforces export. Only an observed access denial or absence may be marked unavailable; missing entries retain not-collected metadata status.
- Live own-account `includeSources` payload and website automation remain unverified. No real student data, credentials, or network collection were used.

Remaining / next:
- RC-010 — fixture-backed explicit extension import and account-ID source merge, with separate metadata provenance.

Commit:
- This entry is committed with the RC-009 checkpoint; use the Git commit containing this entry as its hash.

## Run 2026-09-27 / RC-010
Status: DONE
Objective: Connect explicit popup import of user-supplied Codeforces metadata JSON and optional source export to local account-scoped storage.
Started UTC: 2026-09-27T06:01:05Z

Acceptance checks:
- Configured handle and explicit action import a synthetic status page through the adapter into IndexedDB; progress and errors are visible.
- Matching source evidence merges by account and submission ID, retaining metadata provenance and existing source on repeated metadata imports; mismatches fail safely.
- Fixture tests, typechecks, and extension build pass without live network or extra browser permissions.

Changed:
- `extension/popup.ts`, `extension/import.ts`, `extension/popup.html` — explicit local file import, validation, progress/errors, and IndexedDB storage with source merge.
- `packages/core/src/index.ts`, `packages/core/src/storage.ts`, `docs/evidence-contract-v1.md`, `scripts/check-evidence-fixture.py` — optional source origin fields alongside unchanged metadata provenance, with compatible storage validation.
- `extension/import.test.ts`, `scripts/check-extension.mjs` — synthetic merge/isolation/reimport tests and bundled popup-to-IndexedDB check, including an error state.
- `package.json`, `package-lock.json`, `extension/tsconfig.json` — bundle the popup with the already installed esbuild dependency; no browser permission added.
- `README.md`, `docs/PROJECT_STATE.md`, `docs/BACKLOG.md`, `docs/RUN_LOG.md` — document the local demo, complete RC-010, activate RC-011.

Verified:
- `npm test` — PASS, 11 tests in three files.
- `npm run typecheck` — PASS, core and Codeforces packages.
- `npm run build:extension` — PASS, typecheck, browser bundle, MV3 manifest, synthetic popup import to IndexedDB and error state.
- `python3 scripts/check-evidence-fixture.py` — PASS, version 1 fixture.
- `git diff --check` — PASS.

Assumptions / decisions:
- The user selects one own-account `user.status` JSON page; the popup makes no live request, requires no host permission, and cannot authenticate the file's claimed handle. A source export must match the configured local account and every source ID must exist in that page.
- The local namespace is `local-student`; source stays on the device. Reimporting metadata retains previously merged source. Existing source records without separate origin fields remain accepted for compatibility.

Remaining / next:
- RC-011 — summarize stored evidence deterministically. Historical multi-page import and live source acquisition remain unverified/deferred beyond this fixture-backed slice.

Commit:
- This entry is committed with the RC-010 checkpoint; use the Git commit containing it as its hash.

## Run 2026-09-27 / RC-011
Status: DONE
Objective: Summarize one account's locally stored submissions into deterministic, evidence-only metrics.
Started UTC: approximately 2026-09-27T06:17Z (first tool step; exact timestamp was not captured).

Acceptance checks:
- Account-scoped records yield stable total/accepted, verdict, language, source-status, difficulty and tag attempt counts, with per-problem ordered submissions and repeated-attempt counts.
- Count only observed submissions before the first observed acceptance; use null when no acceptance appears. Do not infer topic weakness or unseen history.
- Synthetic storage/summary tests and package typechecks pass.

Changed:
- `packages/core/src/summary.ts`, `packages/core/src/index.ts` — pure account-scoped summary and exported result type.
- `packages/core/src/summary.test.ts` — shuffled store order, cross-account isolation, missing metadata, unaccepted/accepted problems, empty and invalid input.
- `docs/PROJECT_STATE.md`, `docs/BACKLOG.md`, `docs/RUN_LOG.md` — RC-011 checkpoint and RC-012 handoff.

Verified:
- `npm test` — PASS, 13 tests in four files.
- `npm run typecheck` — PASS, core and Codeforces packages.
- `git diff --check` — PASS.
- Live import and browser report — not run; outside RC-011.

Assumptions / decisions:
- Difficulty and tag counts are counts of submissions with that metadata, not unique problems or claims of weakness.
- Time and submission ID break attempt-order ties. Counts before acceptance describe observed records only; a one-page import may omit earlier attempts.
- RC-010 is an unmerged draft PR #4 because direct main publication was rejected by automatic approval review. This run builds on its branch and must not bypass that review boundary.

Remaining / next:
- Integrate the draft chain when approved; RC-012 then renders a local report using this summary. No next run started here.

Commit:
- This entry is committed with the RC-011 checkpoint; use the Git commit containing it as its hash.

## Run 2026-09-27 / RC-012
Status: DONE
Objective: Render one configured student's locally stored evidence in a simple extension report.
Started UTC: 2026-09-27T06:34Z (first tool step; exact second not captured).

Acceptance checks:
- Display account-scoped observed counts, repeated problems, verdict patterns, and source coverage locally.
- Label partial history and missing source without inferring causes or weaknesses.
- Pass a synthetic import-to-report check and document a manual browser demo.

Changed:
- `extension/report.html`, `extension/report.ts`, `extension/popup.html` — local report page and popup link using the RC-011 summary.
- `package.json`, `extension/tsconfig.json`, `scripts/check-extension.mjs` — build both extension pages and verify a synthetic import-to-report flow in fake IndexedDB.
- `README.md` — manual load and fixture demo path.
- `docs/PROJECT_STATE.md`, `docs/BACKLOG.md`, `docs/RUN_LOG.md` — complete RC-012 and activate RC-013.

Verified:
- `npm run build:extension` — PASS, TypeScript, both browser bundles, synthetic popup import and report rendering.
- `npm run typecheck` — PASS, core and Codeforces packages.
- `npm test` — PASS, 13 tests in four files.
- `python3 scripts/check-evidence-fixture.py` — PASS.
- `git diff --check` — PASS.
- Manual Chrome load — not run; Chrome/Chromium unavailable in this environment.

Assumptions / decisions:
- The popup opens an extension-local page for the last saved handle. It reads only that account's IndexedDB records and never sends them to a server.
- A selected metadata page may omit earlier attempts; all report counts are observed imported records. Missing source is separated into not-collected and unavailable evidence.

Remaining / next:
- RC-013 — M0 integration and coaching readiness review. Live collection and authenticated source behavior remain unverified.

Commit:
- This entry is committed with the RC-012 checkpoint; use the Git commit containing it as its hash.

## Run 2026-09-27 / RC-013
Status: RESEARCH_COMPLETE
Objective: Review the merged M0 import-to-report integration and define a defensible coaching candidate without shipping a diagnosis.
Started UTC: first recorded clock reading 2026-09-27T06:51:29Z (the initial tool step preceded this reading).

Acceptance checks:
- Record the tested commit, exact synthetic commands/results, and honest live/source/data-control inventory.
- Define one narrow pattern with explicit source/language needs and abstention limits.
- Add a bounded repair prerequisite only if the synthetic integration reveals a blocking defect.

Changed:
- `docs/research/m0-readiness.md` — review results, coverage limits and a testable GNU C++20 comparator-revision candidate.
- `docs/PROJECT_STATE.md`, `docs/BACKLOG.md`, `docs/RUN_LOG.md` — close RC-013, leave consent-gated RC-014 waiting, and activate independent fixture-based RC-015.

Verified:
- `timeout 240s npm ci --ignore-scripts --no-audit --no-fund` — PASS, locked dependencies installed.
- `timeout 120s npm run build:extension` — PASS, bundled popup stores two synthetic records in fake IndexedDB and report shows the expected counts and one available/one unavailable source; malformed JSON reports an error.
- `timeout 120s npm test` — PASS, 13 tests across four files.
- `timeout 120s npm run typecheck` — PASS, core and Codeforces packages.
- `timeout 30s python3 scripts/check-evidence-fixture.py` — PASS, evidence contract fixture.
- Manual Chrome/Chromium load — NOT RUN: no browser executable in this environment; no live student/API access or identity proof attempted.

Assumptions / decisions:
- No blocking defect was found in the synthetic path. The README metadata-only demo has two `not-collected` sources; the build runner exercises the optional invented export and therefore reports one `available` and one `unavailable`.
- The comparator hypothesis is possible evidence of a revision, not proof of a mistake's cause. Current fixture cannot support it. No live collection, deletion/export control or pilot result is claimed.

Remaining / next:
- RC-015 — fixture-based paired-attempt comparison and missing-evidence handling. RC-014 waits separately for explicit permission from one student for their own local live check.

Commit:
- This entry is committed with the RC-013 checkpoint; use the Git commit containing it as its hash.

## Run 2026-09-27 / RC-015
Status: DONE
Objective: Compare related observed failed and accepted submissions using local normalized evidence.
Started UTC: first recorded clock reading 2026-09-27T07:13:18Z (the initial repository checks preceded this reading).

Acceptance checks:
- Pair by the same account and problem in deterministic submitted-time/submission-ID order, retaining both IDs.
- Show changed source lines when both texts exist; otherwise explain missing comparison and retain each source status and capture origin.
- Cover a positive pair, missing source, no later acceptance, and cross-account/problem cases with synthetic tests.

Changed:
- `packages/core/src/comparison.ts`, `packages/core/src/index.ts` — compare an immediately preceding non-null, non-OK verdict with an OK verdict on the same problem. Use the existing summary's account validation and order; expose the smallest contiguous changed-line block, or an unavailable result.
- `packages/core/src/comparison.test.ts` — invented sources, shuffled input, source statuses/origins, and non-pairing/isolation cases.
- `docs/PROJECT_STATE.md`, `docs/BACKLOG.md`, `docs/RUN_LOG.md` — complete RC-015 and activate RC-016; RC-014 remains consent-gated.

Verified:
- `timeout 120s npx vitest run packages/core/src/comparison.test.ts` — PASS, three tests (after a RED run with missing export).
- `timeout 120s npm test` — PASS, 16 tests across five files.
- `timeout 120s npm run typecheck` — PASS, core and Codeforces packages.
- `git diff --check` — PASS.

Assumptions / decisions:
- Only immediately adjacent observed failed/accepted records pair. Null verdicts do not count as failures; a partial import can omit intervening attempts.
- A changed block is an edit observation, not a cause or diagnosis. It strips shared leading/trailing lines and preserves the original line contents. No student code was executed or real data collected.
- An unavailable comparison retains separate `not-collected` versus observed `unavailable` source statuses and both metadata/source origins.

Remaining / next:
- RC-016 — conservative recurring-mistake rule and counterexamples on synthetic data. RC-014 remains WAITING for explicit student permission and local live validation.

Commit:
- This entry is committed with the RC-015 checkpoint; use the Git commit containing it as its hash.

## PR #7 review checkpoint 2026-09-27
Status: DONE
Objective: Review RC-015 before the owner-authorized merge.

Review found that a non-null Codeforces `TESTING` or `SUBMITTED` verdict was misclassified as a failed attempt. The comparison now pairs only clear unsuccessful judged verdicts with a later adjacent `OK`; pending, skipped, ambiguous and unknown verdicts do not produce evidence pairs. No RC-014 work was performed.

Verified:
- `timeout 120s npx vitest run packages/core/src/comparison.test.ts` — PASS, four tests; the new pending-verdict test failed before the fix.
- `timeout 120s npm test` — PASS, 17 tests across five files.
- `timeout 120s npm run typecheck` — PASS.
- `timeout 120s npm run build:extension` — PASS, including synthetic import and report.
- `git diff --check` — PASS.

Next: Merge PR #7 after rechecking its head and base. RC-016 remains the next implementation run; RC-014 remains WAITING for consent.

## Run 2026-09-27 / RC-016
Status: DONE
Objective: Test one conservative recurring loop-bound edit pattern on synthetic Codeforces evidence.
Started UTC: 2026-09-27T07:41:55Z (first recorded shell step).

Acceptance checks:
- Two distinct qualifying GNU C++20 problems yield one possible-pattern finding with a stable rule ID, supporting submission IDs and capture origins.
- Benign comments/raw strings, another source edit, one problem, missing source/origin and unsupported language abstain with a coverage reason.
- The serialized finding does not assert a failure's cause; typechecks and the existing test/build path pass.

Changed:
- `packages/core/src/diagnosis.ts`, `packages/core/src/index.ts` — deterministic two-problem rule using existing account-validated adjacent comparisons and a tightly scoped textual loop edit. No parser, source execution or added dependency.
- `packages/core/src/diagnosis.test.ts` — synthetic positive case and abstentions; observed RED for missing implementation, block-comment/raw-string false positives, and review-found inactive-code/unsupported-platform false positives before narrowing the rule.
- `docs/research/recurring-boundary-rule.md` — match contract, counterexamples, limitations and wording.
- `docs/PROJECT_STATE.md`, `docs/BACKLOG.md`, `docs/RUN_LOG.md` — close RC-016 and ready RC-017; RC-014 remains consent-gated.

Verified:
- `timeout 120s npx vitest run packages/core/src/diagnosis.test.ts` — PASS, six tests after the RED checks.
- `timeout 120s npm test` — PASS, 23 tests across six files.
- `timeout 120s npm run typecheck` — PASS, core and Codeforces packages.
- `timeout 120s npm run build:extension` — PASS, TypeScript, bundle, MV3 and synthetic popup-to-report flow.
- `git diff --check` — PASS.
- Live collection and real-browser manual load — not run; outside RC-016.

Assumptions / decisions:
- The supported form is intentionally narrower than arbitrary C++: simple single-line loop and identifier bound; block comments, raw strings, preprocessor conditions/macros and continued lines abstain. Other platforms abstain. The returned reason names one coverage obstacle, not exhaustive history.
- The finding is a possible repeated source edit, not proof of the original wrong-answer causes. At least two distinct problems are required; no real student data was used.

Remaining / next:
- RC-017 — one self-contained practice action for the supported rule. RC-014 remains WAITING for explicit own-account permission and a local live check.

Commit:
- This entry is committed with the RC-016 checkpoint; use the Git commit containing it as its hash.

## Run 2026-09-27 / RC-017
Status: DONE
Objective: Give the supported loop-bound edit finding one concrete, deterministic practice action.
Started UTC: first recorded clock reading 2026-09-27T07:57:12Z (initial repository checks preceded this reading).

Acceptance checks:
- A supported finding from two distinct problems yields one self-contained exercise tied to the observed edit, with an explicit completion check and no causal claim.
- Insufficient evidence, an unknown rule, or a finding with only one supported problem yields no action.
- Focused tests, package typechecks and the existing full test/build path pass.

Changed:
- `packages/core/src/practice.ts`, `packages/core/src/index.ts` — one action for the supported rule; no action for unknown or insufficient evidence.
- `packages/core/src/practice.test.ts` — synthetic end-to-end diagnosis-to-action example and abstention cases; tests first failed because the export did not exist.
- `docs/PROJECT_STATE.md`, `docs/BACKLOG.md`, `docs/RUN_LOG.md` — close RC-017 and activate RC-018.

Verified:
- `timeout 120s npx vitest run packages/core/src/practice.test.ts` — PASS, two tests after the expected RED run.
- `timeout 120s npm run typecheck` — PASS, core and Codeforces packages.
- `timeout 120s npm test` — PASS, 25 tests across seven files.
- `timeout 120s npm run build:extension` — PASS, extension typecheck, bundle and synthetic import-to-report check.
- `git diff --check` — PASS.

Assumptions / decisions:
- The exercise uses an invented three-element array to practice tracing valid indices; it does not claim the observed source edits caused either verdict. No external problem link, ranking system or new dependency was needed.
- The core action is not displayed in the extension report until RC-018. No real student data or live platform access was used.

Remaining / next:
- RC-018 — show the finding, its one action and abstention/coverage states locally. RC-014 remains WAITING for explicit own-account permission.

Commit:
- This entry is committed with the RC-017 checkpoint; use the Git commit containing it as its hash.

## Run 2026-09-27 / RC-018
Status: DONE
Objective: Show the candidate recurring source-edit finding and its one practice action in the existing local report.
Started UTC: first recorded clock reading 2026-09-27T08:04:13Z (initial tool steps preceded this reading).

Acceptance checks:
- A synthetic two-problem finding displays its possible wording, supporting attempt IDs/origins, inert source text and one checkable exercise without a causal claim.
- Missing evidence, no supported pattern and empty accounts show distinct honest states while retaining account isolation and evidence counts; imported HTML-looking text remains inert.
- The build's synthetic finding/abstention demonstration, complete tests and typechecks pass; document the reproducible demo.

Changed:
- `extension/report.ts`, `extension/report.html` — reuse core diagnosis/action functions, present source and references with text nodes, and distinguish abstentions in the local report.
- `scripts/check-extension.mjs` — exercise synthetic finding, missing source, no supported pattern, empty account and untrusted text through bundled report and IndexedDB.
- `README.md` — explain the fixture-backed coaching demo and its limits.
- `docs/PROJECT_STATE.md`, `docs/BACKLOG.md`, `docs/RUN_LOG.md` — close RC-018 and activate RC-019.

Verified:
- `timeout 120s npm run build:extension` — PASS after expected RED on missing coaching and source fields; TypeScript, both bundles, and synthetic import/report finding and abstention states.
- `timeout 120s npm test` — PASS, 25 tests across seven files.
- `timeout 120s npm run typecheck` — PASS, core and Codeforces packages.
- `git diff --check` — PASS.
- Manually inspected the synthetic finding and abstention strings printed by the build runner. A real Chrome/Chromium extension load — NOT RUN; no browser executable verified in this environment.

Assumptions / decisions:
- Source is shown only in an explicitly opened native `details` panel, assigned via `textContent`. This stays local to the selected account. Imported origins and problem names are also rendered via text nodes.
- The rule's finding is a possible edit pattern; a partial one-page import and synthetic fixtures cannot validate a causal diagnosis or live student coverage. RC-014 still needs individual consent.

Remaining / next:
- RC-019 — local account-scoped deletion/export controls. RC-014 remains WAITING for an authorized local live check.

Commit:
- This entry is committed with the RC-018 checkpoint; use the Git commit containing it as its hash.

## Run 2026-09-27 / RC-019
Status: DONE
Objective: Give the selected local account export and confirmed deletion controls before a pilot.
Started UTC: first recorded shell clock 2026-09-27T08:17:27Z (skill and GitHub checks preceded this reading).

Acceptance checks:
- An explicit file import remains the only collection action; the popup explains the local boundary, stopping, and private export handling.
- A confirmed delete removes only the selected account's submissions, disconnects its saved handle, and a reopened store/report cannot restore them; other accounts remain.
- A user-triggered export contains only that account's version 1 normalized evidence envelope, including available source, without browser authentication state.

Changed:
- `packages/core/src/storage.ts`, `packages/core/src/storage.test.ts` — atomic IndexedDB account-index deletion and matching in-memory behavior, with two-account persistence checks.
- `extension/popup.ts`, `extension/popup.html`, `extension/report.ts` — local JSON download, confirmation and deletion, saved-handle disconnect and open-report refresh, plus plain-language controls.
- `scripts/check-extension.mjs` — synthetic account-scoped export, canceled/confirmed deletion, reopened persistence, and report invalidation.
- `README.md`, `docs/PROJECT_STATE.md`, `docs/BACKLOG.md`, `docs/RUN_LOG.md` — usage and checkpoint.

Verified:
- `timeout 120s npx vitest run packages/core/src/storage.test.ts` — PASS, three tests after RED for missing delete method.
- `timeout 120s npm run build:extension` — PASS, TypeScript, bundle and synthetic popup/report flow after RED for missing export controls and report refresh.
- `timeout 120s npm test` — PASS, 26 tests across seven files.
- `timeout 120s npm run typecheck` — PASS, core and Codeforces packages.
- `git diff --check` — PASS.
- Manual Chrome/Chromium load — NOT RUN: no browser executable found here. Inspected popup HTML controls and script wiring; synthetic browser APIs exercised the flow.

Assumptions / decisions:
- Export uses the existing version 1 fixture envelope and the current `local-student` account, with a generic filename. It includes source/history if present and never reads the popup's localStorage or credentials.
- Deletion leaves original input files and prior downloads untouched; importing again is an explicit new action. Report data is computed from IndexedDB and an open report reloads when the saved handle is removed.
- RC-014 remains WAITING for one student's explicit permission and local live validation; no real student data was used.

Remaining / next:
- RC-020 — synthetic pilot guide and readiness gates. Do not start it in this run.

Commit:
- This entry is committed with the RC-019 checkpoint; use the Git commit containing it as its hash.
