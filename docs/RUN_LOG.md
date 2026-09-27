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
