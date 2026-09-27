# RC-014 local live-import check

Date: 2026-09-27 UTC. Result: **PARTIAL_CHECKPOINT**; the live import acceptance gate did not pass.

## Non-identifying procedure

With the account owner's permission, opened one official `user.status` page in local Chrome with `from=1&count=10` and saved its JSON outside the repository. Compared aggregate fields from the saved page locally. Built the existing unpacked extension and confirmed it was enabled in the same local Chrome profile. After browser control stopped, the owner performed the explicit file import and saved an account-scoped export outside the repository. Compared that export with the API page locally. No JSON, source, identifiers, or screenshots are in this repository.

## Aggregate results

- API status `OK`; 10 records and 10 distinct submission IDs in the one page.
- 9 accepted and 1 wrong-answer verdict; 2 programming-language labels.
- No source-text field appeared in these 10 metadata objects. Source for all 10 is **not-collected**, not observed unavailable.
- The local export has 10 records with exactly the same 10 submission IDs, verdicts and language labels as the API page, and 10 `not-collected` source statuses. The entered account value was a full Codeforces profile URL; its final handle segment **matched** the page's sole author handle. The extension accepted the URL as its account key instead of requiring a bare handle. This is an input-validation and account-labeling issue, not evidence that another person's history was imported.
- `npm ci --ignore-scripts --no-audit --no-fund` and `npm run build:extension` passed, including the existing synthetic popup/report check. This is not live-import evidence.

## Acceptance checklist

| Check | Result |
| --- | --- |
| One bounded official page, stored only locally | **PASS** |
| Unpacked extension built and enabled in local Chrome | **PASS** |
| Explicit file import matches page count, IDs, verdicts and languages | **PARTIAL PASS** — private export matched; account key was a profile URL, not a bare handle; report UI not independently checked |
| Repeated import does not duplicate records | **OWNER-REPORTED PASS** — final export has 10; repeat sequence not independently observed |
| Account isolation in the live browser store | **NOT RUN — acceptance not met** |
| Source availability through normal access to own submissions | **NOT RUN — retain not-collected** |
| Authenticated `includeSources` response shape | **NOT TESTED** |

## Limitations and next action

One page is a truncated sample, not complete history or a stable snapshot; its aggregate verdicts cannot establish a coaching diagnosis. The report UI, live account isolation and source access remain unverified. **Repair prerequisite:** accept only a bare Codeforces handle or explicitly normalize a profile URL before storing an account key; test a valid handle and profile-URL input. Then use the bare handle in Chrome, reimport the private page and remove the URL-keyed local copy with the extension's account-scoped controls. Compare the report and check account isolation. Inspect source only via normal access to the owner's submissions. Do not start RC-021 or claim pilot readiness from this checkpoint.
