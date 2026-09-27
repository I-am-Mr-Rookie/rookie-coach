# RC-014 local live-import check

Date: 2026-09-27 UTC. Result: **DONE for RC-014's bounded check**; this is not pilot readiness or source-collection validation.

## Non-identifying procedure

With the account owner's permission, opened one official `user.status` page in local Chrome with `from=1&count=10` and saved its JSON outside the repository. Compared aggregate fields from the saved page locally. Built the existing unpacked extension and confirmed it was enabled in the same local Chrome profile. After browser control stopped, the owner performed the explicit file import and saved an account-scoped export outside the repository. Compared that export with the API page locally. No JSON, source, identifiers, or screenshots are in this repository.

The owner later provided a report screenshot in the private conversation. Its aggregate counts matched the export. The owner reported that their own submitted source is normally viewable on Codeforces and explicitly waived live account-isolation testing for this single-account check. Neither source-page access nor a repeat-import sequence was independently observed.

## Aggregate results

- API status `OK`; 10 records and 10 distinct submission IDs in the one page.
- 9 accepted and 1 wrong-answer verdict; 2 programming-language labels.
- No source-text field appeared in these 10 metadata objects. Source for all 10 is **not-collected**, not observed unavailable.
- An independent local recheck found that the export has 10 records with exactly the same 10 submission IDs, verdicts and language labels as the API page, and 10 `not-collected` source statuses. The intentionally entered account value was a full Codeforces profile URL; its final handle segment **matched** the page's sole author handle. The URL-shaped local key is acceptable for this check, not an attribution or validation defect. A different input string can create a separate local bucket; this is a product limitation, not a failure of this import.
- `npm ci --ignore-scripts --no-audit --no-fund` and `npm run build:extension` passed, including the existing synthetic popup/report check. This is not live-import evidence.

## Acceptance checklist

| Check | Result |
| --- | --- |
| One bounded official page, stored only locally | **PASS** |
| Unpacked extension built and enabled in local Chrome | **PASS** |
| Explicit file import matches page count, IDs, verdicts and languages | **PASS** — private export matched independently |
| Repeated import does not duplicate records | **OWNER-REPORTED PASS** — final export has 10; repeat sequence not independently observed |
| Local report displays imported aggregates | **PASS** — owner-provided screenshot shows 10 attempts, 9 accepted, 1 wrong answer and 10 without imported source |
| Account isolation in the live browser store | **NOT RUN — owner waived for this single-account RC-014 check; not a live isolation claim** |
| Source availability through normal access to own submissions | **OWNER-REPORTED VIEWABLE** — no source was imported; all 10 local statuses remain `not-collected` |
| Authenticated `includeSources` response shape | **NOT TESTED** |

## Limitations and next action

One page is a truncated sample, not complete history or a stable snapshot; its aggregate verdicts cannot establish a coaching diagnosis. The screenshot confirms report display, not source capture or a full browser-control walkthrough. No bare-handle validation, reimport or deletion of the URL-keyed account is required. The owner's ability to view their own source on Codeforces does not change the local `not-collected` statuses. Live account isolation was waived for RC-014 and remains untested; authenticated `includeSources` also remains untested, with no credentials requested. The source-dependent coaching rule still lacks live source evidence. RC-021 and a real pilot require separate readiness and individual feedback permission.
