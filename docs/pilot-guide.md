# Five-volunteer local pilot guide (preparation only)

**Status: not ready to recruit or import real history.** This is an informal product-feedback pilot for up to five volunteers, not a university study or evidence of learning improvement. The owner handles recruitment. No one is enrolled or has consented yet. Complete the [readiness gates](#readiness-gates) before inviting a participant to use their own data.

## What to tell a prospective volunteer

Rookie Coach imports a selected Codeforces `user.status` JSON page and, optionally, a user-prepared source export for the same account into a local Chrome/Chromium extension. It shows observed counts and may show a **possible** repeated GNU C++20 loop-bound edit with one index-tracing exercise. A selected page may omit history; the edit does not establish why a verdict occurred. The current popup does not contact Codeforces or verify file ownership. Importing is an explicit file action, with no background collection or server upload.

Ask each person separately, before handling their files: **“Do you agree to import your own Codeforces submission history, and optionally source you can normally access, into Rookie Coach on your own device for this local feedback exercise? You can stop importing at any time, export your evidence, or delete the selected account's local evidence.”** A refusal ends their participation. Do not ask for their password, cookies, API secrets, files, submission IDs, screenshots of source, or a copy of the export. Consent to import does not imply consent to share feedback or publish findings.

## Synthetic rehearsal before any invitation

1. In a fresh local checkout with Node.js 22+, run `npm ci` and `npm run build:extension`. The build runs the synthetic popup-to-report check, including the two-problem possible finding, an insufficient-evidence state, export, cancellation and confirmed account deletion. It uses invented records and fake IndexedDB, not a real browser or live API.
2. For a browser walkthrough, open `chrome://extensions`, enable Developer mode, select **Load unpacked**, and choose the repository's `extension/` directory. In the popup enter `fixture_learner`, select [`../fixtures/codeforces-user-status-page.json`](../fixtures/codeforces-user-status-page.json) as metadata, leave source export empty, and press **Start import**. Expect two stored submissions. Open **View local evidence report**: expect two attempts, one accepted, one repeated problem, `WRONG_ANSWER: 1`, two `not-collected` source entries, and insufficient evidence for the coaching rule. This fixture cannot produce the possible finding; the build check demonstrates that state with separate invented records.
3. Back in the popup for `fixture_learner`, choose **Export this handle's evidence**. Inspect the download locally for a version 1 envelope with only that account's two normalized submissions; treat any later real export as private because it can contain source and history. Choose **Delete this handle's local evidence**, cancel once to check preservation, then confirm. Expect the saved handle to clear and a reopened report to show no selected account; an already open report refreshes when the handle is removed. Deletion does not remove input files or earlier downloads. Remove the synthetic download yourself if it is no longer needed.

The [README walkthrough](../README.md#local-extension-import) and [source-export format](source-export-v1.md) give the exact inputs. If the browser walkthrough has not been performed on the participant's browser, mark that check unverified; the automated build is only a synthetic rehearsal.

## Participant session, after every gate passes

1. Explain the purpose and limits above and obtain that person's explicit import permission. They use their own local browser profile and select only their own normally accessible files. A source export is optional; missing source means the rule should abstain. The owner should not receive the files.
2. Have them follow the local [installation and import steps](../README.md#local-extension-import) on their device, inspect the report's observed counts and coverage, and, if shown, the possible edit and practice action. An insufficient-evidence or no-supported-pattern result is a valid outcome. Invite them to try the self-contained exercise only if they wish.
3. Show **Export this handle's evidence** and **Delete this handle's local evidence**. They may stop by choosing not to import more files. Deletion clears the selected account's stored evidence and saved handle, while original files and prior downloads remain their responsibility. Do not collect a private export for the pilot.
4. Ask for feedback only with separate permission. A participant may answer verbally or privately without sending source, exact handles, submission IDs, or identifying details. Ask whether they also permit a non-identifying aggregate summary in the public repository; if they do not, keep their feedback private and do not quote or publish it. Record actual respondent and abstention counts; never fill in missing responses.

### Short feedback form (optional)

For the result **you actually saw**:

1. **Diagnosis accuracy (possible edit only):** Does the described edit match what you remember changing? `Accurate / Partly accurate / Inaccurate / Not enough evidence shown / No finding or not applicable / Prefer not to answer`. This asks about the edit, not the cause of a failed verdict.
2. **Practice action usefulness:** Was the suggested index-tracing exercise useful to you? `Useful / Somewhat useful / Not useful / No action or not applicable / Prefer not to answer`.
3. **Understanding and attempt:** Did you understand the exercise? `Yes / No / No action or not applicable`. Did you try it? `Yes / No / No action or not applicable`.
4. **Optional correction:** In your own words, what should the description or exercise change? Please omit code, submission identifiers, handles, and personal details.

Feedback permission: `Private feedback only / Permit a non-identifying aggregate summary / No feedback`. These choices are separate from import permission. Do not interpret subjective usefulness as measured learning improvement.

## Readiness gates

| Gate | Current evidence | Prerequisite before a real session |
| --- | --- | --- |
| Authorized live import | Not checked; RC-014 is WAITING. The popup imports a selected file, not a live API response by itself. | Complete RC-014 with one student's explicit own-account permission and a bounded local check; resolve any discovered import repair. |
| Source coverage for this rule | Unknown on real history. The rule needs available, originated GNU C++20 source for adjacent failed/accepted attempts on two distinct problems. | RC-014 must establish a legitimate usable source path and enough coverage for this specific rule, or keep the pilot on synthetic demonstration and do not solicit real diagnosis accuracy. |
| Data controls and browser flow | RC-019's synthetic export/delete persistence checks pass; real Chrome/Chromium walkthrough has not been verified in this environment. | Perform the browser install, import, report, export, canceled/confirmed delete and reopen checks on the intended setup; repair failures before use. |
| Individual consent | None recorded. Recruitment ability is not permission. | Obtain each volunteer's explicit import consent before their own local action, and separate permission for feedback and any public aggregate. |

**Pilot readiness: NO.** RC-020 prepares instructions only. RC-014 and the real-browser/source checks remain prerequisites; RC-021 waits for real, permitted feedback and must report the actual denominator. Do not count this synthetic rehearsal as a volunteer response or publish private data.
