# User-prepared Codeforces source export (prototype)

RC-009 accepts a local JSON file prepared by a student from source they can normally view for their own submissions. This is a Rookie Coach fixture format, **not** a Codeforces export format or a live capture feature. The checked-in [example](../fixtures/codeforces-user-source-export.json) is invented; never commit a real export or source history.

The root object contains exactly `schemaVersion: 1`, `account`, and `submissions`. `account` has the four version 1 StudentAccount fields and must exactly match the selected local account. Each submission contains exactly a positive decimal `submissionId`, `sourceStatus`, and `source`:

- `available` requires nonempty source text copied by the student from a normally accessible own submission.
- `unavailable` requires `source: null` and an actual observation that the student cannot access that source. An absent export entry says nothing about availability.
- `not-collected` is the status of metadata without a matching export entry; it is never asserted by this export parser.

Duplicate IDs, account mismatches, unknown fields, and contradictory source/status values are rejected. The parser returns account-scoped source evidence with `captureMethod: user-export`, a fixed provenance label, and the caller's UTC capture time. It does not create a full Submission or write storage. RC-010 will join evidence to existing metadata by account and submission ID, preserving metadata provenance separately. No browser extraction, credentials, API source response assumptions, or bulk collection are involved.

Live `user.status?includeSources` behavior and response shape still require a separate authorized local check. Keep real source on the student's device.
