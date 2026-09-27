# Decisions and deferred choices

This log separates the owner's stated direction from reversible first-milestone defaults. See [the project overview](project-overview.html#run-system) for the full context. A working default is authorized for RC-001 through RC-012 and is not a permanent product promise.

| Area | Current decision | Basis |
| --- | --- | --- |
| Audience | Competitive-programming students at the owner's university, with beginners first; a Codeforces rating of 800–1000 is an example, not an eligibility rule. | Owner-stated |
| Product | The extension collects authorized evidence; the product is a persistent coach grounded in actual attempts and recurring mistakes. | Owner-stated |
| Data subject | One student's own history with that student's permission; keep accounts isolated. | Owner-stated |
| Historical depth | Historical backfill is the target where the platform legitimately exposes the data. | Owner-stated |
| Distribution | Public, locally runnable open-source project; GitHub is the durable source of truth. | Owner-stated |
| Hosting and business | Railway hosting and monetization are future options, outside the first milestone. | Owner-stated direction |
| First platform | Codeforces only until the local vertical slice is demonstrably working. | Reversible working decision |
| First outcome | One student's local deterministic evidence report: repeat attempts, verdict/failure patterns, defensible signals, and coverage notes. | Reversible working default |
| Data scope | Normalize account, submission ID, problem, verdict, language, time, available metadata, source status, provenance and capture time. Represent source as available, unavailable, or not yet collected. | Working default; honest source status required |
| Collection | Use official APIs only for verified fields. Investigate normal user-authorized source access before automation; use sanitized fixtures/user exports if live access is unclear. Never bypass platform controls. | Working safety default |
| Storage | Local-first; real student history remains on the user's device for this milestone. | Reversible working default |
| Browser and stack | Chrome/Chromium Manifest V3, TypeScript, Node.js 22+, npm workspaces, Vitest; follow existing compatible precedent if it emerges. | Reversible working default |
| Analysis | Deterministic normalization and evidence before any LLM-assisted coaching. | Reversible working default |

## Deferred, non-blocking

- **Permanent license:** owner has not selected one; add no license autonomously. Public visibility does not itself grant reuse permission.
- **Other platforms, cross-platform identity proof, cloud retention, hosted account model, billing, and LLM provider:** revisit after the Codeforces local slice; do not ask during RC-001 through RC-012.
- **Exact curriculum and formal evaluation protocol:** record candidate metrics without claiming causal weaknesses; settle before evaluation or public product commitments.

## RC-002 research update (2026-09-27)

The current Codeforces `user.status` documentation advertises `includeSources` for one's own account. This supersedes the earlier uncertainty about whether the official API has any source option; it does not establish the authenticated payload shape or reliable source coverage. Keep fixture/user-export parsing as the RC-009 prototype path until an authorized local API test confirms those details. See [the access research](research/codeforces-data-access.md). This is a reversible implementation order, not a new product commitment.

## Post-M0 owner direction (2026-09-27)

The owner requested that the post-RC-012 plan be recorded for future workers. This section extends the first-milestone defaults for the local coaching pilot; it does not mark any future task complete.

| Area | Decision / working default | Basis |
| --- | --- | --- |
| Next outcome | One narrow recurring-mistake diagnosis grounded in actual attempts, plus one concrete practice action. Abstain when the evidence cannot support it. | Owner accepted the recommendation in the planning interview |
| Pilot access | The owner says they can recruit five students when ready. They have not yet been enrolled or given consent. | Owner-stated |
| Project context | This is an independent personal project. The university is not involved or aware of it; there is no supplied university rubric or evaluation requirement. No personal deadline was specified. | Owner clarification |
| Pilot evaluation | Ask whether diagnoses seem accurate and actions useful; record actual responses, abstentions and limitations. This is informal product feedback, not proof of learning improvement. | Reversible recommendation adopted for this plan |
| Technical choices | Workers choose the smallest reversible implementation using repository precedent, standard/native capabilities and existing dependencies (Ponytail). Ask only for a genuine owner-only blocker. | Owner delegation |
| Pilot data boundary | Keep real histories and source on each student's device. Each participant must separately consent to collection and any feedback sharing. Recruitment ability is not collection authorization. | Existing consent boundary continued as a working default |
| Delivery scope | RC-013 through RC-020 prepare the local pilot; RC-021 reviews actual permitted feedback. The 30-minute rule and one requested run at a time still apply. | Owner requested repository instructions |
| Later decisions | Permanent license, paid spending, remote student-data processing, hosting, other platforms and billing remain deferred until a concrete need arises. | Existing boundaries retained |

The [post-M0 backlog](BACKLOG.md#post-m0-pilot) is the operational specification. Five volunteers is a recruitment target, not a completion claim. Synthetic tests establish implementation behavior only; live validation and pilot feedback are separate gates.

## One-click Markdown export (owner direction, 2026-09-27)

The owner found the file-import flow too complicated and replaced it. This supersedes the RC-007 to RC-019 extension flow (file import, IndexedDB store, in-extension report, export/delete controls); the core summary, comparison and diagnosis code remains as a library but is no longer used by the extension.

| Area | Decision | Basis |
| --- | --- | --- |
| User flow | Install the unzipped extension, sign in to Codeforces, open the extension, confirm or type the handle, click once. The extension does the rest and downloads one file. | Owner-stated |
| Output | One Markdown file with a fixed, parseable structure ([format](codeforces-markdown-v1.md)); chosen over JSON because code and examples stay unescaped and cost fewer tokens. It must be self-contained for an LLM or judge: profile standing, problem link, statement, examples, verdicts and code. | Owner chose Markdown; content owner-stated |
| Student status | Include current rating, rank, max rating/rank, contribution and recent rated contests. Taken from the official `user.info` and `user.rating` API (the same data as the profile page) instead of parsing profile HTML; no real name or city. | Owner-stated; API source is a working default |
| Source code | Default: read the user's own submission pages in their signed-in tab, one request per 2 seconds, only when the typed handle matches the signed-in handle. Backup: the official API `includeSources` with the user's own key and secret, used once and never stored. Stop on any browser check or refusal; never work around it. | Owner chose page reading plus API backup; pacing and stop rules are safety defaults |
| History size | Most recent 250 submissions by default; 100, 500, 1000 or all are selectable. | Owner-stated |
| Storage | No database, report page or temporary files. Everything is held in memory until the one download. | Owner-stated |
| Permissions | `activeTab` and `scripting` only; no host permissions or background script. | Working default (smallest permission set) |
| Distribution | A ZIP of the built extension loaded with Developer mode, Load unpacked. Chrome Web Store publishing (a paid developer account) remains an owner decision. | Working default |
