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
Status: DONE
Priority: P05
Timebox: one run, <= 30 min
Depends on: RC-004

Goal: Normalize one page of Codeforces submission metadata without claiming source-code access.

Acceptance: Using recorded/sanitized API fixtures from RC-002, implement a typed adapter that maps one official submission-history response/page into the normalized submission contract. Tests cover IDs, problem reference, verdict, language, timestamp, and explicit sourceStatus when source is absent.

Out of scope: No historical loop yet, no live source extraction, no extension UI.

## RC-006 Historical metadata backfill
Status: DONE
Priority: P06
Timebox: one run, <= 30 min
Depends on: RC-005

Goal: Build a bounded, testable iterator for a student's historical Codeforces metadata.

Acceptance: Implement pagination/backfill around the verified official API behavior from RC-002, with injectable network access and deterministic tests for multiple pages, empty completion, duplicate protection, and bounded retry/rate behavior. The live network is optional for tests; fixtures are mandatory.

Out of scope: No source capture, no arbitrary-handle mass collection, no background daemon.

## RC-007 Chrome MV3 extension shell
Status: DONE
Priority: P07
Timebox: one run, <= 30 min
Depends on: RC-006

Goal: Create the user-controlled collection entry point.

Acceptance: Add a loadable Manifest V3 extension skeleton with a minimal popup/options surface: configured Codeforces handle, a clear explanation that collection concerns the student's own history, and an explicit user action to start import. Use minimum permissions. Build/manifest validation succeeds. No secrets or cookies are stored in source control.

Out of scope: No polished design system, no multi-platform selector, no login service.

## RC-008 Local evidence storage
Status: DONE
Priority: P08
Timebox: one run, <= 30 min
Depends on: RC-007

Goal: Persist normalized records locally and isolate data by student/platform account.

Acceptance: Create a local storage abstraction suitable for the extension; prefer IndexedDB for potentially large histories. Include an in-memory/fake implementation for deterministic tests. Upsert by platform + account + submission ID; preserve source-status/provenance; demonstrate that two configured accounts cannot overwrite each other's records.

Out of scope: No remote sync, no hosted DB, no multi-user server.

## RC-009 Source-evidence prototype
Status: DONE
Priority: P09
Timebox: one run, <= 30 min
Depends on: RC-008

Goal: Prototype the source-code path using the legitimate method established by RC-002.

Acceptance: If RC-002 confirms a normal user-authorized browser route suitable for collection, create a narrow parser/capture adapter and test it against a sanitized saved fixture. If live automation is not clearly justified, implement the same interface against a user-export/saved-page fixture and mark live capture as deferred. In both cases, distinguish available/unavailable/not-collected source and never bypass access controls.

Out of scope: No CAPTCHA solving, no anti-bot bypass, no credential harvesting, no bulk scraping.

## RC-010 One-student import vertical slice
Status: DONE
Priority: P10
Timebox: one run, <= 30 min
Depends on: RC-009

Goal: Connect the extension action to Codeforces metadata import and local normalized storage.

Acceptance: From one configured handle, a user-triggered import can process fixture/mocked data end-to-end and store normalized submissions locally. Where an allowed source fixture is available, merge source evidence by submission ID. Provide progress/error states sufficient for debugging. Tests do not depend on a live website.

Out of scope: No scheduler, no continuous background scraping, no other platforms.

## RC-011 Deterministic evidence summary
Status: READY
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

## Post-M0 pilot

Planning update: 2026-09-27. These are future instructions, not completed runs. Finish M0 through RC-012 first. The owner selected recurring-mistake diagnosis plus one concrete practice action and can recruit five volunteers. No participant is enrolled or has consented by this statement. This is an independent project; no university evaluation requirement has been supplied. See [the decisions](DECISIONS.md#post-m0-owner-direction-2026-09-27).

### Shared execution rules

- Apply AGENTS.md and the existing run system to every task below: one objective per requested run; 30-minute hard stop; start checkpointing at minute 27; update state, backlog and run log; inspect the diff and commit/push coherent work. Planning this queue does not authorize executing all its runs in one session.
- Before coding, write 1-3 acceptance checks. If implementation plus verification will not fit, create smaller child tasks with explicit dependencies before coding. Do not call the parent DONE until every acceptance check passes.
- Promote a WAITING task to READY only after its dependencies and activation conditions are satisfied. RC-013 follows RC-012. RC-014 and RC-015 both follow RC-013; if the live check is blocked, fixture work in RC-015 onward may proceed in later runs.
- A blocker is not a satisfied dependency. Record human/external blockers once, with a precise next action; do not repeatedly request the same consent or invent work outside this milestone. Add any necessary repair task as an explicit dependency of affected successors.
- Continue with Codeforces, local storage, the existing TypeScript/Vitest stack, and deterministic rules. Reuse existing functions and native browser features; add no speculative framework. Hosting, another platform, billing and LLM services remain deferred.
- Keep real history, source, identifiers, credentials and individual feedback out of public GitHub. Student data stays on the student's device. Only synthetic fixtures and non-identifying technical findings belong in the repository. Consent to importing history is separate from permission to share evaluation feedback.
- A repeated verdict or tag does not establish a programming misconception. State observations, hypotheses and unavailable evidence honestly. A rule must abstain when its required evidence is missing. Do not treat passing fixtures as live validation or pilot ratings as proof of learning improvement.

## RC-013 M0 integration and coaching readiness review
Status: WAITING
Priority: P13
Timebox: one run, <= 30 min
Depends on: RC-012
Activation: RC-012 is DONE and its documented demo path is available.

Goal: Establish what the completed pipeline actually supports before implementing coaching.

Acceptance:
1. Add docs/research/m0-readiness.md with the tested commit, commands/results, fixture import-to-report result, and an explicit inventory of live versus mocked paths, source coverage, and data controls.
2. Record one narrowly testable candidate mistake pattern, the evidence and language it requires, and what the current pipeline cannot substantiate. This is a candidate to validate, not a claim about students.
3. Turn any blocking integration defect into a bounded repair task and attach it to affected successors. Update readiness statuses without marking unsupported capabilities as working.

Verification: Run the documented synthetic demo and the existing relevant tests/typecheck. Record exact commands and manual observations; use no real student data.

Fallback / checkpoint: If the demo cannot run, preserve the reproducer and create the smallest repair prerequisite. End PARTIAL_CHECKPOINT or BLOCKED as appropriate. A completed review with documented limitations may end RESEARCH_COMPLETE.

Out of scope: No new feature, broad refactor, live collection, diagnosis claim or university study.

## RC-014 Authorized live import and source coverage check
Status: WAITING
Priority: P14
Timebox: one run, <= 30 min
Depends on: RC-013
Activation: RC-013 review and relevant repairs are complete; one student explicitly permits a bounded import of their own history and can run the local check.

Goal: Verify the existing acquisition path on one consenting account and report actual source availability.

Acceptance:
1. Use the existing user-controlled local import or legitimate user-export path. Bound the sample, API requests and time; retain account details and records locally. Do not request passwords, cookies or API secrets in chat or GitHub.
2. Check imported account isolation, field normalization, duplicates, coverage/truncation and available/unavailable/not-collected source status against what the student can normally access.
3. Add docs/research/live-import-check.md with a non-identifying method, date, result and limitations. Clearly distinguish working live metadata, source evidence and any untested authenticated response. Add a narrow repair prerequisite if needed.

Verification: Record the local procedure and a pass/fail checklist without account identifiers, source or private screenshots. Re-run a targeted synthetic regression check only if code changes.

Fallback / checkpoint: Missing permission or local access means BLOCKED, with a single precise next action. Fixtures may support development but cannot satisfy this live check. Never bypass platform controls. RC-015 can proceed independently in another run.

Out of scope: No bulk collection, credentials in the repository, general crawler, enrollment of all five volunteers or automatic outreach.

## RC-015 Attempt comparison evidence
Status: WAITING
Priority: P15
Timebox: one run, <= 30 min
Depends on: RC-013
Activation: The M0 review and repairs needed for fixture-based comparison are complete. RC-014 is informative but not a prerequisite for synthetic work.

Goal: Produce a small deterministic comparison of related failed and accepted attempts.

Acceptance:
1. Reuse normalized records to group by account and problem and order attempts deterministically. Record the selected failed/accepted submission IDs and the pairing rule; never join different students or problems.
2. Expose the relevant source change when both sources are available, and an explicit unavailable comparison otherwise. Preserve provenance. A changed line is evidence of an edit, not proof of the original failure's cause.
3. Cover a positive pair plus missing source, no later acceptance, and cross-account/problem cases with synthetic fixtures and focused tests.

Verification: Run the targeted comparison tests and package typecheck; check deterministic output for the same fixture.

Fallback / checkpoint: Support one existing source representation only. If a parser or general diff engine would exceed the budget, split that work; do not invent a diagnosis from metadata to replace missing source.

Out of scope: No execution of student code, language-wide static analyzer, LLM, cloud service or live import.

## RC-016 One conservative recurring-mistake rule
Status: WAITING
Priority: P16
Timebox: one run, <= 30 min
Depends on: RC-015
Activation: The candidate rule has explicitly defined evidence requirements and synthetic examples.

Goal: Implement one narrow candidate diagnosis that can be inspected and challenged.

Acceptance:
1. Document one supported pattern/language, its matching conditions, limitations and counterexamples. Return supporting submission references and a stable rule ID. Choose the simplest defensible rule from the readiness review.
2. Define recurrence conservatively: require supporting occurrences on at least two distinct problems within one account as a reversible prototype threshold. Repeated retries on one problem are not independent evidence. Present uncertain interpretation as a possible pattern, never a confirmed cause.
3. Tests cover a matching recurring example, a similar benign counterexample, one isolated occurrence, missing required source and unsupported language. Unsupported or insufficient evidence returns no diagnosis with an explanatory coverage reason.

Verification: Run targeted positive/negative fixture tests and package typecheck. Inspect the rendered wording or serialized finding for unsupported causal claims.

Fallback / checkpoint: If no candidate can pass a meaningful counterexample test, record RESEARCH_COMPLETE with the rejected hypothesis and a bounded follow-up. Do not mark the implementation DONE or activate dependent diagnosis tasks. Do not silently add an LLM to compensate.

Out of scope: No broad weakness score, comprehensive bug detection, inferred topic mastery or personalized curriculum.

## RC-017 One practice action per supported diagnosis
Status: WAITING
Priority: P17
Timebox: one run, <= 30 min
Depends on: RC-016
Activation: RC-016 is DONE with a supported rule and its evidence contract.

Goal: Give a student one understandable next action tied to the supported pattern.

Acceptance:
1. Add a small deterministic mapping from the supported rule to one concrete exercise or debugging habit, explaining its connection to the evidence and what completion looks like.
2. Show exactly one action per finding. An unknown rule or insufficient evidence must not produce a fabricated personalized prescription.
3. Use a self-contained exercise by default. If linking an external problem, verify the reference and relevance; do not copy restricted problem content or claim a verified recommendation without checking it.

Verification: Run focused tests for the supported rule and unknown/insufficient-evidence cases, plus package typecheck.

Fallback / checkpoint: Keep the action self-contained if a suitable external problem cannot be verified. Split extra recommendation logic into future work instead of adding a ranking system.

Out of scope: No study schedule, problem recommender engine, mastery prediction or promised improvement.

## RC-018 Coaching report integration
Status: WAITING
Priority: P18
Timebox: one run, <= 30 min
Depends on: RC-017
Activation: Diagnosis and action outputs pass their focused tests.

Goal: Make the candidate diagnosis and practice action understandable in the existing local report.

Acceptance:
1. Extend the existing report with the possible recurring pattern, supporting attempts, one action and relevant coverage/uncertainty notes.
2. Provide clear insufficient-evidence and no-supported-pattern states. Preserve account isolation and existing evidence summaries; escape all imported text and display source as inert text.
3. Keep the existing simple UI and keyboard-accessible controls. Document a synthetic demo that shows both a finding and an abstention.

Verification: Run focused report transform/render tests, including untrusted source text and empty coverage; package typecheck; manually inspect the two demo states.

Fallback / checkpoint: Reuse the current report layout. Split a genuine report defect into a repair task rather than introducing a frontend framework.

Out of scope: No hosted dashboard, conversational coach, new design system or public launch.

## RC-019 Pilot local data controls
Status: WAITING
Priority: P19
Timebox: one run, <= 30 min
Depends on: RC-018
Activation: The coaching report works with synthetic records.

Goal: Ensure a participant can control the local evidence used in the pilot.

Acceptance:
1. Inspect and reuse existing controls. Explain what is imported, that it stays local, and how to stop/disconnect collection. Keep import an explicit user action.
2. Provide account-scoped deletion of imported evidence and derived report data, with a clear confirmation. Other accounts must remain intact; refresh/reopen must not restore deleted records.
3. Provide a user-triggered local export using the existing normalized format, excluding credentials and authentication state. Explain that an export may contain the student's source/history and should not be uploaded to public GitHub.

Verification: Use synthetic two-account records to test export content, account-scoped deletion and persistence after reopen; run relevant tests/typecheck and inspect the controls manually.

Fallback / checkpoint: If missing export and deletion cannot both fit, create ordered child tasks and leave RC-019 PARTIAL_CHECKPOINT until both are verified. No real data is needed for this work.

Out of scope: No hosted privacy system, remote telemetry, cross-device sync or broad storage rewrite.

## RC-020 Five-volunteer pilot preparation
Status: WAITING
Priority: P20
Timebox: one run, <= 30 min
Depends on: RC-019
Activation: The local coaching demo and data controls pass. Preparing materials can proceed while RC-014 is blocked; actual pilot readiness additionally requires a successful RC-014 check and data coverage suitable for the selected rule.

Goal: Prepare a small, repeatable pilot that the owner can introduce to five volunteers.

Acceptance:
1. Add docs/pilot-guide.md with current local installation/demo steps, purpose, limits, explicit individual consent, expected participant actions, local deletion/export and optional feedback sharing. The owner recruits; enrollment and consent must not be presumed.
2. Include a short feedback form: diagnosis accuracy, action usefulness, whether the suggested action was understood/tried, and an optional correction. Include not-enough-evidence/not-applicable options. Request no raw submissions or unnecessary identifying details.
3. Dry-run the guide with synthetic data. State readiness gates explicitly: live import checked, source coverage compatible with the rule, controls verified, and volunteer consent. If a gate fails, name its prerequisite and label the pilot not ready. A completed preparation document is not proof that the pilot has launched.

Verification: Follow the documented synthetic install-to-report-to-delete flow, check links and feedback questions, and record outcomes.

Fallback / checkpoint: If installation or the live coverage gate fails, preserve the guide and create a narrow repair prerequisite. Do not treat five fictional responses as pilot evidence.

Out of scope: No contacting students, collecting real feedback automatically, paid hosting, formal university study or permanent license selection.

## RC-021 Pilot feedback review
Status: WAITING
Priority: P21
Timebox: one run, <= 30 min
Depends on: RC-014, RC-020
Activation: Actual feedback is available with permission to use it for evaluation, and pilot readiness gates are satisfied. Target five volunteers; report the actual respondent count without inventing missing responses.

Goal: Decide the smallest next improvement from the pilot's real observations.

Acceptance:
1. Summarize diagnosis accuracy, action usefulness, abstentions and reported problems, with actual denominators and missing responses. Keep identifiable feedback private; publish only non-identifying aggregate findings explicitly permitted for public sharing, or a findings-free checkpoint if publication permission is absent.
2. Separate subjective usefulness from measured learning. Do not claim improved rating, causal error reduction or validated accuracy from this small informal pilot.
3. Rank actionable issues and add one highest-priority bounded next task with dependencies and acceptance checks. Choose repair, another rule or further evaluation from the evidence; do not automatically expand into hosting, other platforms or billing.

Verification: Cross-check counts against the permitted feedback in its private location, check for identifying content, and validate the next task's scope and links. No fictional or synthetic feedback may count as a participant response.

Fallback / checkpoint: With no authorized feedback, remain BLOCKED and record the needed feedback once. With fewer than five responses, report the actual sample and limitations. Do not wait for respondents inside a 30-minute run.

Out of scope: No formal efficacy claim, university approval claim, publication of raw feedback or speculative long-term roadmap.
