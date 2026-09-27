# Evidence contract v1

RC-003 defines records for one student's local evidence. This is a strict, versioned contract; the synthetic [fixture](../fixtures/codeforces-evidence-v1.json) exercises it. JSON field names are case-sensitive. Records use UTF-8 JSON, reject unknown fields, and use `schemaVersion: 1`. Identifiers are strings even when a platform uses numeric IDs, so later platforms can share the shape. Missing optional fields are omitted, not set to `null`, except where explicitly stated.

## StudentAccount

| Field | Type | Meaning |
| --- | --- | --- |
| `schemaVersion` | integer, exactly `1` | Contract version. |
| `platform` | nonempty string | Platform ID; `codeforces` for this fixture. |
| `namespace` | nonempty string | Local student namespace, chosen by the importing student; storage keys include this and platform. |
| `handle` | nonempty string | Configured platform handle. It is an identifier, not proof of account ownership. |

The local account identity is `(platform, namespace, handle)`. A later handle change needs an explicit migration; never silently merge histories by display name.

## ProblemRef

| Field | Type | Meaning |
| --- | --- | --- |
| `platform` | nonempty string | Same platform as its submission. |
| `problemId` | nonempty string | Stable platform-scoped key, e.g. Codeforces `contest:1234/A`; for gym/problemset variants choose an unambiguous platform key. |
| `name` | nonempty string | Display name, not an identity key. |
| `contestId` | positive integer, optional | Platform contest ID when supplied. |
| `index` | nonempty string, optional | Platform problem index when supplied. |
| `difficulty` | nonnegative integer, optional | Platform rating/difficulty when supplied; absence is unknown. |
| `tags` | array of distinct nonempty strings, optional | Platform tags when supplied; empty array means supplied with no tags. |

## Submission

| Field | Type | Meaning |
| --- | --- | --- |
| `schemaVersion` | integer, exactly `1` | Contract version. |
| `platform`, `namespace`, `handle` | nonempty strings | Must match the StudentAccount. |
| `submissionId` | nonempty string | Platform submission ID; unique within an account. |
| `problem` | ProblemRef | The attempted problem. |
| `verdict` | nonempty string or `null` | Platform verdict as received; `null` means not supplied/pending, never inferred as failure. |
| `language` | nonempty string | Platform language label. |
| `submittedAt` | integer >= 0 | Submission time, UTC Unix seconds. |
| `source` | nonempty string or `null` | Source text only when legitimately obtained. |
| `sourceStatus` | `available`, `unavailable`, or `not-collected` | `available` requires nonempty `source`; either other status requires `source: null`. `unavailable` requires an actual access/absence observation; metadata-only imports use `not-collected`. |
| `captureMethod` | `api`, `saved-page`, or `user-export` | How this evidence was captured. |
| `provenance` | nonempty string | Specific origin such as `codeforces:user.status` or a user-provided export label; no credentials or private URLs. |
| `capturedAt` | UTC ISO 8601 string `YYYY-MM-DDTHH:MM:SSZ` | Capture time, separate from submission time. |
| `sourceCaptureMethod`, `sourceProvenance`, `sourceCapturedAt` | optional source origin fields | When a source export is merged with API metadata, these hold its method, origin and UTC capture time while the main capture fields continue to describe the metadata. |

When source is merged, retain the metadata capture fields and set the separate source origin fields. Do not claim source availability from a metadata response.

## Fixture envelope

The fixture has exactly `schemaVersion`, `account`, and `submissions`. Its version is `1`; `account` is a StudentAccount and `submissions` is an array of Submissions matching that account. The fixture is invented test data, not a Codeforces API response or a student's history. Run `python3 scripts/check-evidence-fixture.py` to validate its JSON and contract invariants without network access or dependencies.
