# Open Questions

These questions are intentionally unresolved. They should be answered before major implementation choices are locked in.

1. **First measurable student outcome** — After the system has a student's history, what is the single most valuable result of version 1: mistake diagnosis, topic-gap detection, next-problem recommendations, structured learning plans, contest review, or something else?
2. **First supported platform** — Which platform should be supported end-to-end first? This determines the initial data-access and authentication design.
3. **Collection boundary** — Should version 1 collect only source code and submission metadata, or also problem statements, tags, contest context, verdict history, test feedback, and timestamps?
4. **Historical vs. future collection** — Must the first version import all historical submissions, or is collecting submissions from installation onward acceptable initially?
5. **Privacy and storage** — Should code remain entirely local by default, be uploaded only when the user opts in, or use another model?
6. **Identity linking** — How will one student prove/link their accounts across multiple competitive-programming platforms?
7. **Analysis engine** — What should be deterministic/static analysis versus LLM-assisted analysis?
8. **Evaluation** — How will the project demonstrate that its coaching is useful for the university project: user study, improvement in solve rate, reduced repeated mistakes, rating changes, or another metric?
9. **Open-source license** — Which license should be used? No license has been selected yet.
10. **Hosted product scope** — What features, if any, should differ between local open-source use and a Railway-hosted version?
