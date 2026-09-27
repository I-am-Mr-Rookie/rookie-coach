# Codeforces data access for one student

Researched: 2026-09-27 UTC. Scope: RC-002, one student who explicitly permits collection of their own history. This is documentation research, not a live account or API-key test.

## Acceptance checks

1. Identify official submission-history fields, paging and request limits with current Codeforces sources.
2. Distinguish documented own-account source access from the unverified response shape and browser collection behavior.
3. Leave a safe, executable fixture-first path for the next runs.

## Confirmed from Codeforces

| Finding | Evidence |
| --- | --- |
| `GET https://codeforces.com/api/user.status?handle=<handle>&from=1&count=100` returns a user's submissions. `handle` is required; `from` is a 1-based index; `count` is the number requested; results are in descending submission-ID order. | [API methods, user.status](https://codeforces.com/apiHelp/methods#user.status) |
| The API uses `status: OK` with `result`, or `status: FAILED` with `comment`. Anonymous requests can access public data; private data requires a signed request using the account's API key and secret. | [API introduction and authorization](https://codeforces.com/apiHelp/) |
| At most one API request per two seconds is documented; faster calls receive `FAILED` / `Call limit exceeded`. The `user.status` documentation does **not** state a maximum `count` or promise a complete-history snapshot. | [API introduction](https://codeforces.com/apiHelp/), [user.status](https://codeforces.com/apiHelp/methods#user.status) |
| A `Submission` has `id`, `creationTimeSeconds`, `problem`, `author`, `programmingLanguage`, testset, test counts, time and memory. `contestId`, `verdict`, and `points` can be absent. `Problem` has `index`, `name`, `type`, `tags`, and optional contest ID, problemset name, points and rating. | [API return objects](https://codeforces.com/apiHelp/objects#Submission), [Problem](https://codeforces.com/apiHelp/objects#Problem) |
| `user.status` now documents `includeSources`, available only for requests for one's own account. The documented `Submission` object does not name a source-text field, so the exact payload shape and coverage remain unverified here. `contest.status` has a separate manager-only `includeSources` rule; it is not a shortcut for this project. | [API methods, user.status and contest.status](https://codeforces.com/apiHelp/methods#user.status), [Submission object](https://codeforces.com/apiHelp/objects#Submission) |
| A user can open their profile's **Submissions** page, then click a submission ID to view source in the normal website flow. Codeforces says own solutions can be viewed during a contest; access to others' source varies with contest state and settings. | [Codeforces usage guide](https://codeforces.com/blog/entry/99660), [source-viewing announcement](https://codeforces.com/blog/entry/211) |

## Unknowns and inferences

- **Authentication for source:** The own-account restriction plus the API's signed-request rules suggest that an authenticated request is needed for `includeSources`. The method page does not spell out how it establishes account ownership for this option. Do not treat a browser cookie or an arbitrary handle as proof of access. No student's key, cookie, or private source was used in this run.
- **Source payload:** The API method advertises source inclusion, but the return-object reference omits its field name, nullability, size, and coverage. An authorized, local one-record test is needed before designing a live source adapter. Do not infer source availability from a successful metadata response.
- **Pagination edge cases:** The docs specify offset and sort order, but no maximum page size, consistency guarantee while new submissions arrive, or retry schedule. A bounded page size of 100 and a delay of at least two seconds between requests are conservative implementation choices, not documented caps. Deduplicate by account and submission ID; stop on an empty page. If a page is short, confirm completion rather than assuming a universal server limit.
- **Website automation:** Normal viewing is documented. Permission and reliable mechanics for bulk automated extraction from the website were not established. Some source may be inaccessible in particular contests; never work around that restriction.

## Safe acquisition plan

1. RC-003: define account-scoped evidence with nullable source and explicit `available` / `unavailable` / `not-collected` status. Include capture method and time. Add a synthetic, sanitized Codeforces JSON fixture using the documented metadata fields; do not check in a student's history.
2. RC-005/006: parse public `user.status` metadata from fixtures, then implement bounded offset pagination with injected network access, a two-second minimum request interval, explicit `FAILED` handling and deduplication. A live collection needs the student's explicit permission and remains local.
3. RC-009: start with a student-provided saved page or export fixture and a narrow parser. The newly documented own-account `includeSources` is the preferred candidate for later live source access, but first verify it locally with the student's authorization and API credentials kept off GitHub, inspect one response's actual source field, and respect any error or access denial. Do not automate browser extraction or assert live source support from this research alone.

Conclusion: Metadata history and paging are documented with high confidence. Own-account source inclusion is documented, but its authenticated behavior and response schema have not been tested. The prototype can proceed on sanitized fixtures without source or secrets.
