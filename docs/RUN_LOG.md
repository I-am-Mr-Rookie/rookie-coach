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

## Run 2026-09-27 / RC-020
Status: DONE
Objective: Prepare a repeatable, consent-based five-volunteer local pilot guide and verify its synthetic rehearsal.
Started UTC: 2026-09-27T08:30:11Z (first local shell clock after initial GitHub tool checks).

Acceptance checks:
- Document local install, synthetic import/report/export/delete, purpose, limits, individual import permission and separate optional feedback sharing.
- Provide short questions on diagnosis accuracy, practice usefulness, understanding/attempt and an optional correction, including abstention/not-applicable choices without requesting raw submissions.
- Exercise the synthetic flow and state live import, source coverage, browser controls and consent gates honestly.

Changed:
- `docs/pilot-guide.md` — participant script, fixture rehearsal, feedback form and readiness table. Pilot remains not ready.
- `docs/PROJECT_STATE.md`, `docs/BACKLOG.md`, `docs/RUN_LOG.md` — close RC-020 while leaving RC-014 and RC-021 WAITING.

Verified:
- `timeout 240s npm ci --ignore-scripts --no-audit --no-fund` — PASS, 46 locked packages installed.
- `timeout 120s npm run build:extension` — PASS; TypeScript, both bundles and synthetic IndexedDB import/report, possible finding, abstention, account export, canceled and confirmed deletion/reopen checks.
- Manual Chrome/Chromium walkthrough — NOT RUN: no browser executable was found in this environment. The guide flags this as a gate.
- Guide links, feedback coverage and `git diff --check` — see final checkpoint verification below.

Assumptions / decisions:
- The one-page metadata fixture yields insufficient source evidence, not the two-problem finding; the build script uses separate invented source-complete records for that state.
- The guide requests feedback separately from local import permission and asks for no private exports or raw submissions. No volunteers were contacted or enrolled; synthetic results are not participant feedback.

Remaining / next:
- RC-014 is a distinct owner-deferred run requiring one student's explicit own-account permission and a bounded local check. Real source coverage and real-browser controls must also pass before pilot recruitment/use. RC-021 remains WAITING for permitted feedback; do not start it in this run.

Commit:
- This entry is committed with the RC-020 checkpoint; use the Git commit containing it as its hash.

## Run 2026-09-27 / RC-014
Status: PARTIAL_CHECKPOINT
Objective: Authorized local live import and source-coverage check for the owner's account.
Started UTC: approximately 2026-09-27T14:00Z (first tool step; exact clock was not captured until 14:04:56Z).

Acceptance checks (written outside the repository before edits):
1. Import one official `user.status` page with `from=1&count=10`; compare count and normalized aggregates with the local report.
2. Reimport the same page without duplicate growth; verify separate-account isolation.
3. Classify source only when observed through normal own-account access, and distinguish untested authenticated `includeSources`.

Changed:
- `docs/research/live-import-check.md` — non-identifying procedure, aggregate results, checklist and limits.
- `docs/PROJECT_STATE.md`, `docs/BACKLOG.md`, `docs/RUN_LOG.md` — honest partial checkpoint and next action.
- No application code changed; no private response, handle, submission ID, source, credential or screenshot was added to the repository.

Verified:
- Cloned/fetched latest `main` at `33c44309b07b6ca438104d0cc7c0ce2885e5b087`; `git status --short` was clean before editing.
- One official page in local Chrome returned `OK`. The private file outside the repository contained 10 records with 10 distinct IDs, 9 accepted and 1 wrong answer, 2 language labels, and no source-text fields.
- `npm ci --ignore-scripts --no-audit --no-fund` — PASS.
- `npm run build:extension` — PASS, including existing synthetic IndexedDB popup/report check.
- Unpacked extension enabled in the owner's local Chrome — PASS, confirmed by the Chrome extensions page.
- Computer-use URL-safety verification stopped the agent's browser action before import; this does not show a product defect. The owner then used the popup and saved a private account export outside the repository. Its 10 submission IDs, verdicts and language labels matched the API page; all 10 sources were `not-collected`. The intentionally entered account key was a full Codeforces profile URL, whose final handle segment matched the page's sole author handle. Owner clarification in the subsequent bounded RC-014 run established that this URL-shaped local key was acceptable, not a validation defect.
- The owner reported the import and repeat worked; the final export still has 10 records. The report UI and repeat sequence were not independently observed. Live account isolation and normal-access source check — NOT RUN.
- Authenticated `includeSources` — NOT TESTED; no keys, cookies or secrets were used.

Remaining / next:
- Superseded by the owner correction in the subsequent bounded RC-014 run: no bare-handle validation repair, reimport or deletion is required. Compare the existing report and, where possible, verify another already-present local account remains isolated. One page cannot establish full-history coverage. Leave unobserved source as `not-collected`.
- RC-021 remains WAITING; pilot readiness is not established. No synthetic regression beyond the existing build check was needed because application code did not change.

Commit:
- This entry is committed with the RC-014 partial checkpoint; use the Git commit containing it as its hash.

## Run 2026-09-27 / RC-014 (new bounded verification)
Status: PARTIAL_CHECKPOINT
Objective: Recheck the authorized local export and correct the prior RC-014 URL-key interpretation without changing extension behavior.
Started UTC: 2026-09-27T14:34:40Z.

Acceptance checks (written before edits):
1. Independently compare non-identifying counts and per-record ID, verdict and language equality between the saved official page and local export; check author alignment and source-status aggregates.
2. Remove the false bare-handle repair prerequisite while preserving unobserved browser, source and authenticated-response gates.
3. Inspect the public diff for private data and pass `git diff --check` before committing.

Changed:
- `docs/PROJECT_STATE.md`, `docs/BACKLOG.md`, `docs/research/live-import-check.md` — record the intentionally accepted URL-shaped local account key, verified metadata match and remaining live checks.
- This run log corrects the earlier run's input-validation interpretation; no application code, private records or identifiers were added.

Verified:
- `git status --short` — clean before editing; `git fetch origin --prune` — local `main` matched `origin/main` at `35a4a45532b8376988261cf78c55ec8b0585c0b2`.
- Local-only PowerShell `Get-Content -Raw | ConvertFrom-Json` aggregate comparison — official status `OK`; 10 distinct page IDs and 10 distinct exported IDs; all 10 IDs, verdicts and languages matched per record. The URL's final segment matched the page's sole author and all exported records used that local account key. All 10 exported source statuses were `not-collected`; no source-text field appeared in the metadata page. No second API page or network import was requested.
- The owner reports the explicit import and repeat worked. The saved export contains 10 records, but this run did not independently observe the repeat sequence or report UI.
- `git diff --check` — PASS. Public diff review found no private handle, submission ID, record, source, credential or screenshot.

Assumptions / decisions:
- The owner intentionally used and accepts the full profile URL as the exact-text local account key. Different future input strings may create distinct local buckets; this is not a failed attribution or a mandatory repair.
- No code changed, so no new synthetic regression was needed. One page does not prove full-history coverage or a coaching diagnosis.

Remaining / next:
- RC-014 remains open: in the owner's local Chrome, compare the existing report's aggregate counts with the export; if a second local account already exists, check isolation without collecting anyone else's history. Check own-submission source only through normal access; keep unobserved source `not-collected`. Authenticated `includeSources` remains untested. RC-021 remains WAITING.

Commit:
- This entry is committed with the RC-014 corrected partial checkpoint; use the Git commit containing it as its hash.

## Run 2026-09-27 / RC-014 closeout
Status: DONE
Objective: Close the bounded owner-authorized metadata import and source-availability check using the owner-provided report evidence and clarified scope.
Started UTC: 2026-09-27T14:44:34Z.

Acceptance checks (before edits):
1. Compare the screenshot's non-identifying report aggregates with the previously verified local export.
2. Distinguish owner-reported normal source visibility from source actually imported; record the owner's decision that live account isolation is unnecessary for this single-account RC-014 check.
3. Preserve the pilot's separate source-coverage and browser-control gates, review the public diff for private details, and pass `git diff --check`.

Changed:
- `docs/PROJECT_STATE.md`, `docs/BACKLOG.md`, `docs/research/live-import-check.md` — mark RC-014 DONE within its bounded scope and record the remaining limitations.
- `docs/pilot-guide.md` — update the metadata-import gate without claiming pilot readiness or live source coverage.
- No application code or private screenshot was added.

Verified:
- Owner-provided report screenshot in the private conversation shows 10 observed attempts, 9 accepted, 1 wrong answer, and 10 without imported source, matching the independently checked export. The screenshot was not committed.
- The owner reports that their own submitted code is normally viewable on Codeforces. This was not independently observed and does not change the 10 stored `not-collected` source statuses.
- The owner removed live account-isolation testing from RC-014's acceptance for this single-account check; live isolation remains untested rather than passed.
- `git diff --check` — PASS; private-identifier scan of the public diff found no match. Untracked files appeared under repository `tmp/` during review; they were left untouched and excluded from the commit.

Assumptions / decisions:
- The final export contains 10 records after the owner-reported repeat, but the repeat sequence was not independently observed. One page is truncated evidence, not full history.
- Authenticated `includeSources` and real-student source capture remain untested. RC-014 completion does not establish readiness for a source-dependent coaching pilot.

Remaining / next:
- RC-021 remains WAITING for real, individually permitted feedback. Before any real source-dependent coaching session, establish legitimate local source coverage and the intended browser data controls; do not interpret this metadata-only check as a working live diagnosis.

Commit:
- This entry is committed with the RC-014 closeout; use the Git commit containing it as its hash.

## Run 2026-09-27 / RC-021
Status: BLOCKED
Objective: Check whether the requested pilot feedback review can activate and leave a findings-free checkpoint when its evidence is unavailable.
Started UTC: approximately 2026-09-27T15:35:25Z; first captured shell clock 15:35:53Z.

Acceptance checks (recorded in scratch before edits):
1. Confirm current GitHub prerequisites and activation evidence; preserve RC-014's existing completion and never substitute fixtures for feedback.
2. Record the blocker and one precise resume condition consistently, without invented results or a speculative successor.
3. Validate documentation consistency and links, review the public diff for private material, and pass `git diff --check` before publishing the checkpoint.

Changed:
- `docs/PROJECT_STATE.md`, `docs/BACKLOG.md` — record RC-021 BLOCKED and its resume conditions.
- `docs/RUN_LOG.md` — record this activation check. No application code or feedback artifact was added.

Verified:
- Fresh GitHub connector reads and clone agree on the current control files; local base is `810046813bd5ad02fd2298aa5054bb4719953564`. `git status --short` was clean before editing. GitHub open-PR search returned no open PRs.
- Read AGENTS, the overview run system, state, backlog, decisions, recent run log and pilot guide. RC-014 and RC-020 are DONE; RC-021's actual-feedback and readiness activation conditions are not established. No READY task exists.
- Inline Python documentation check — PASS: RC-021 BLOCKED, RC-014/020 DONE, no READY tasks, relative file targets exist, readiness anchor exists.
- `git diff --check` — PASS. Diff review: only public operational documentation; no private records, identifiers, source, individual feedback or credentials.
- Application tests/build were not rerun because no application behavior changed. Pilot feedback counts and findings cannot be verified without the permitted input.

Assumptions / decisions:
- The user's deferral of run 14 is respected by leaving its newer GitHub closeout unchanged and performing no live import.
- The RC-021 fallback takes precedence over inventing a task: no participant feedback was provided in this session or identified in the current control files. This is not a claim that no feedback exists elsewhere.
- No volunteer was contacted or enrolled. No synthetic response was counted. No repair, new rule or further-evaluation task was ranked without actual observations.

Remaining / next:
- Resume RC-021 only when its activation evidence is available; do not start another run here.

Blocker:
- Owner must make actual feedback available privately with permission for evaluation and confirm the pilot guide's readiness gates. Public-aggregate permission is separate; without it, keep public checkpoints findings-free. Fewer than five responses are acceptable with the actual denominator and limitations.

Commit:
- This entry is committed with the RC-021 blocked checkpoint; use the Git commit containing it as its hash.
## Run 2026-09-27 / RC-022 one-click Markdown export
Status: DONE
Objective: Replace the file-import flow with a one-click export of one self-contained Markdown file, as directed by the owner.

Acceptance checks (before edits):
1. Popup detects or accepts a handle, defaults to 250 recent submissions, and starts collection with only `activeTab` and `scripting`.
2. The file contains profile standing, problem link, limits, statement, examples and every attempt with verdict and code; code only for the signed-in account; no key or secret in the file.
3. Requests are 2 seconds apart, browser checks stop the run with partial results kept, nothing is persisted, and tests, typechecks and the extension check pass.

Changed:
- `packages/codeforces/src/pages.ts`, `markdown.ts`, `collect.ts` (+ `collect.test.ts`, synthetic `fixtures/codeforces-problem-page.html` and `codeforces-submission-page.html`) � page reading, Markdown bundle, collection with profile, pacing, retries, stop rules and the API-key backup.
- `extension/popup.*`, `extension/collector.ts`, `extension/manifest.json`, `extension/chrome.d.ts` � one-click popup and an in-tab collector with a progress panel and stop button.
- Removed `extension/import.*`, `extension/report.*` and the IndexedDB store; dropped `fake-indexeddb`; added `linkedom` for DOM tests and `scripts/package-extension.mjs` for the ZIP.
- `README.md`, `docs/codeforces-markdown-v1.md`, `docs/DECISIONS.md`, `docs/BACKLOG.md` (RC-022, RC-023), `docs/how-it-works.html`.

Verified:
- `npm test` � 33 tests PASS. `npm run typecheck` � PASS (core, codeforces, extension).
- `npm run package:extension` � build and `scripts/check-extension.mjs` PASS; the ZIP extracts with Windows `Expand-Archive` and matches the build.
- Firecrawl CLI scrape of public pages: problem 4A (older example format) and 1850A (line-per-element example format) matched the parser's selectors; the page header uses absolute links, so handle detection matches `/profile/` anywhere in the link. A submission page returned "Please wait. Your browser is being checked", so the source selector is unconfirmed live. The API and some pages returned Cloudflare 504 during the session.

Not verified:
- Loading the extension in a real Chrome and a live run on a signed-in account (RC-023).
- The API-key backup's `includeSources` response.

Remaining / next:
- RC-023: owner runs one export of their own account and reports the result.

## Run 2026-09-27 / RC-023 first live export and repairs
Status: PARTIAL_CHECKPOINT
Objective: Fix the defects the owner found in the first live exports of their own account.

Owner findings (files kept outside the repository):
1. Chrome rejected the dropped ZIP ("Could not unzip extension for install") because every file was inside a `rookie-coach/` folder. A ZIP with the files at the root installed and worked.
2. Run 1 (limit 250): profile and all 69 submissions listed, but `source_included: 0/69`, `statements_included: 0/27`, with the note "browser check". The owner did not press Stop.
3. Run 2 (all), minutes later: `source_included: 69/69`, `statements_included: 27/27`. About 113,000 characters, roughly 28,400 tokens.
4. Problem titles and ranks came back in Russian.

Acceptance checks (before edits):
1. The ZIP has `manifest.json` at its root; a normal Codeforces page carrying Cloudflare's detection script is not treated as a browser check.
2. API calls use `lang=en` and problem pages `?locale=en`; every code block names a language.
3. The file name carries the time to the second; the header states `complete` and `approx_tokens`; tests, typechecks and the extension build pass.

Cause of run 1: a Firecrawl scrape of the raw HTML of problem 4A showed that ordinary pages can include `/cdn-cgi/challenge-platform/scripts/jsd/main.js` (Cloudflare's bot-detection script). `isBrowserCheck` matched `challenge-platform`, so the first problem page was treated as a check and the run stopped. The script is not on every response, which fits run 2 succeeding.

Changed:
- `packages/codeforces/src/pages.ts` � browser check matches only real challenge markers (`Your browser is being checked`, `_cf_chl_opt`, `cf-chl-`, `Just a moment` / `Attention Required` titles, HTTP 403/429); `englishPage`; statement `<pre>` blocks labelled `text`.
- `packages/codeforces/src/collect.ts` � `lang=en` on every API call (included in the API-key signature); English problem pages; the stop note names the URL and HTTP status once, items say "the collection stopped early"; optional `waitForCheck` pauses for the student to pass a real check and then requests the same page again.
- `packages/codeforces/src/markdown.ts` � wider language map (fixed PascalABC.NET, which matched Scala), `complete`, `approx_tokens`, `bundleFileName`.
- `extension/collector.ts` � Continue button during a check, timestamped file name, finish message warns when incomplete.
- `scripts/package-extension.mjs` � files at the ZIP root plus a `dist/` entry; it reads the ZIP back and asserts the layout.
- Tests and fixture: the synthetic problem page now carries the detection script; new tests for the pause, stop note, language map, file name and header lines.

Verified:
- `npm test` � 34 tests PASS. `npm run typecheck` � PASS. `npm run package:extension` � build, extension check and ZIP layout assertion PASS; `Expand-Archive` gives `manifest.json`, `popup.html`, `dist/popup.js`, `dist/collector.js` at the root.

Not verified:
- A live run with the repaired build, the Continue flow against a real Codeforces check, and whether `?locale=en` changes a Russian-interface user's saved language.

Follow-up (owner request, same day): with **All** and more than 200 submissions, the export is a ZIP of Markdown files of up to 200 submissions each (`splitBundle`, a stored-ZIP writer in `packages/codeforces/src/zip.ts`); other options unchanged. `npm test` 35 PASS, typecheck PASS, `npm run package:extension` PASS; a writer-made ZIP extracted with `Expand-Archive` with correct names, dates and UTF-8 text.

Remaining / next:
- Owner re-runs one export with the new ZIP and confirms English titles, `complete: yes` and the new file name.
