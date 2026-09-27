# RC-016: possible recurring loop-bound edit

Rule ID: `cf-cpp20-boundary-comparator-v1`. This is a fixture-tested candidate, not a validated diagnosis of a student mistake.

## Evidence requirements

- One local Codeforces account (other platforms abstain); the existing comparator pairs an immediately preceding judged `WRONG_ANSWER` with a later `OK` on the same problem in observed order. Pending verdicts and other failed verdicts do not support this rule.
- Both attempts say exactly `GNU C++20`; both source texts are available and carry source capture method, origin and timestamp. Metadata provenance and submission IDs remain attached to each supporting reference.
- Apart from a **single entire line**, the source texts match. That line must be a standalone `for` loop with a simple `int` or `long long` counter initialized to zero, compared to a simple identifier bound with `<=`, and incremented by `++`. The accepted text differs **only** by changing that `<=` to `<`. Block comments, raw strings, preprocessor conditionals/macros and continued lines anywhere in either source abstain to avoid mistaking inactive or commented text for a loop. The rule recognizes this small textual form, not arbitrary C++ syntax.
- At least two **distinct problem IDs** must each have a qualifying pair. Retries of one problem count once. The result is ordered by problem ID and carries each selected failed/accepted submission reference and its provenance.

The output says **possible recurring loop-bound edit** and explicitly says the edit does not establish the cause of either verdict. It does not say the earlier code was wrong because of an off-by-one error, infer a general weakness, or prescribe an action. A successful later submission might also differ in circumstances the local records do not show.

## Counterexamples and abstention

A line comment, block comment, raw string, inactive `#if 0` block, or continued line containing the same `for` text, an additional body edit, a single qualifying problem, unavailable or uncollected source, missing source origin, another language, or another platform cannot produce a two-problem finding. The returned `insufficient-evidence` reason identifies an observed obstacle; it is not a complete assessment of all history. A partial one-page import may omit attempts or problems; no real source coverage or student accuracy has been checked. This rule is a conservative pattern over an invented fixture, and RC-014's authorized live check remains separate.
