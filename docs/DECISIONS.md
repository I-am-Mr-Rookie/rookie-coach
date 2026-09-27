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
