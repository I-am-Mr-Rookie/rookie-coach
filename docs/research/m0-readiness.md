# M0 integration and coaching readiness

Reviewed: 2026-09-27 UTC (RC-013). Tested GitHub `main` commit: `1d660ed9c421d960c07f6ab35bb0472a4637d14f` (RC-012 merged). No student data or live Codeforces request was used.

## Synthetic integration result

From a clean clone, `npm ci --ignore-scripts --no-audit --no-fund` installed the locked dependencies. The documented README demo uses handle `fixture_learner` and `fixtures/codeforces-user-status-page.json`. The build's synthetic popup runner executes the actual bundled popup and report scripts against fake IndexedDB. It also locally changes the invented source fixture's namespace to `local-student` to match the popup; this is the README's optional source demo, not a repository fixture change.

| Command | Result |
| --- | --- |
| `timeout 120s npm run build:extension` | PASS: MV3 manifest and bundle checks; popup stores two synthetic records; report displays two observed attempts, one accepted, one repeated problem with one observed attempt before acceptance, `WRONG_ANSWER: 1`, and source coverage `available: 1`, `unavailable: 1`. The runner also verifies an invalid JSON import reports an error and re-enables the button. |
| `timeout 120s npm test` | PASS: 13 tests in four files (adapter/backfill, storage, summary, import). |
| `timeout 120s npm run typecheck` | PASS: core and Codeforces packages. Extension typecheck also passed inside `build:extension`. |
| `timeout 30s python3 scripts/check-evidence-fixture.py` | PASS: version 1 evidence fixture. |

The README's metadata-only demo has **two `not-collected` source entries**. The build runner instead adds the optional synthetic source export, giving one `available` and one explicitly `unavailable`. Both results are fixture expectations. No Chrome/Chromium executable was present, so the manual **Load unpacked**, file-picker, report-link, and browser persistence flow was not observed in a real browser.

## Capability and coverage inventory

| Path or control | Current evidence and limit |
| --- | --- |
| Metadata acquisition | `backfillStatus` has fixture-tested bounded pages, delays, retries and ID deduplication through an injected request. The popup has **no live request** and imports one user-selected `user.status` JSON page; it neither verifies the handle against the file nor demonstrates complete history. No real API call was made. |
| Source | Metadata imports default to `not-collected`. A user-prepared local export can attach `available` text or an explicitly observed `unavailable` entry by matching account and submission ID. The invented optional fixture covers one of each. Authenticated `includeSources` payload shape, access and live coverage remain untested; no website source capture exists. |
| Normalization and local report | Fixture-backed adapter, account-scoped IndexedDB, deterministic summary, and bundled report flow pass. The report says counts cover imported records; a one-page import can omit earlier attempts. Fake IndexedDB and VM DOM stand-ins do not establish browser compatibility or usability. |
| Data controls | The popup requires an explicit action, stores the last handle in extension `localStorage`, and stores imported metadata and optional source in extension IndexedDB. The manifest requests no permissions or host permissions; the popup/report make no outbound request. There is **no account-scoped deletion or local export UI yet** (RC-019). Browser-profile access and local backups are outside this check. |

No integration defect was reproduced in the synthetic path, so no repair prerequisite was added. Real-browser integration remains an unverified check, and RC-014 requires a student's explicit own-account permission. Neither is established by passing fixtures. RC-015 can proceed with synthetic comparisons while RC-014 waits for consent; the pilot must wait for the data controls in RC-019 and its other listed dependencies.

## Candidate pattern for later validation

**Possible repeated boundary-comparator revision**, restricted initially to GNU C++20: in one account, pair an observed `WRONG_ANSWER` attempt with a later `OK` on the **same problem** only when both sources are `available` with provenance and the source text is otherwise identical except for one `for`-loop condition changing `<=` to `<` against the same bound. Require at least two such pairs on **distinct problems** before emitting a possible recurring pattern; retain all supporting submission IDs and source provenance. RC-015 should first produce the deterministic pairs and explicit missing-source result; RC-016 should test this exact hypothesis against a benign comparator edit, another substantive edit, one problem only, absent sources, and an unsupported language. Abstain if any required evidence is missing or the narrowly matched change cannot be established.

Even that exact edit plus later acceptance does **not** prove the original wrong answer's cause, a general off-by-one weakness, or likely improvement from a practice action. The current fixture has only one problem and lacks source for its failed attempt, so it cannot demonstrate this candidate. Treat the wording as a hypothesis for the owner/student to inspect, not a diagnosis from current data.
