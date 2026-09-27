# Rookie Coach

Rookie Coach is an open-source university project aimed at helping competitive-programming students improve from their actual submission history rather than from generic advice alone.

## Current concept

The project is expected to begin with a browser extension that, with the student's explicit permission, collects their own competitive-programming submission history and source code where technically and legally permitted. Initial platform candidates include Codeforces, AtCoder, CodeChef, and LeetCode.

The collected history is intended to power a coaching system that can eventually identify recurring mistakes, weak or missing concepts, and patterns in a student's attempts, then turn those findings into actionable guidance and practice. The goal is broader than an LLM wrapper: the system should maintain a useful model of the student's competitive-programming development over time.

## Product direction

- Initial audience: university competitive-programming students, especially beginners.
- Early benchmark persona: students around the early Codeforces rating range (roughly 800-1000 was discussed as an example, not a hard scope decision).
- Distribution: open source, runnable locally by users.
- Hosted option: Railway is a candidate for a shared/deployed version.
- Monetization: possible future subscription/business model, undecided.

## Current status

The product is still in discovery. No final architecture, platform priority, storage model, or monetization model has been chosen yet.

See [`docs/HANDOFF.md`](docs/HANDOFF.md) for the current project context and [`docs/OPEN_QUESTIONS.md`](docs/OPEN_QUESTIONS.md) for the next decisions to make.
