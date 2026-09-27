# Project Handoff

Last updated: 2026-09-27

## Why this repository exists

This file captures enough context to resume the project from another ChatGPT conversation, account, or development environment without relying on the original conversation history.

## Problem being explored

Competitive-programming beginners often accumulate many attempts and contest submissions without systematically learning from recurring mistakes, weak concepts, or patterns in how they approach problems.

The project aims to build a full coaching workflow around a student's own competitive-programming history. The browser extension is primarily a data-collection component, not the final product.

## Proposed data collection idea

A Chrome extension would be installed by the student. With explicit user permission, it would attempt to collect the student's own submissions and source code from supported competitive-programming platforms.

Platforms mentioned so far:

- Codeforces
- AtCoder
- CodeChef
- LeetCode
- Other platforms may be added later

Important: source-code access differs by platform and may not be available through official APIs. Do not assume an API exposes source code without verifying the current API, authentication model, website behavior, and terms for that platform. Browser-context collection may be technically possible in some cases, but privacy, security, platform rules, and user consent must be treated as first-class design constraints.

## Intended coaching direction

The system should eventually use the student's history to help with things such as:

- recurring implementation mistakes;
- topics the student has not learned or has not absorbed well;
- patterns across failed and accepted attempts;
- what the student should work on next;
- longer-term progress and weaknesses.

These are directions, not finalized feature commitments.

## Distribution direction

The user wants the project open sourced so anyone can download and run it locally. A hosted deployment on Railway is also being considered for broader use. A future subscription or other business model may be explored, but no monetization decision has been made.

## Constraints from the project owner

- Do not prematurely make product decisions while the owner is still describing the idea.
- Preserve decisions and project context in the repository so work can continue from a fresh chat or another account.
- Keep the repository public unless explicitly changed later.
- Use GitHub as the durable collaboration source of truth.

## Current phase

Discovery / requirements clarification. The next conversation should continue by resolving the highest-impact open questions rather than jumping directly to a large implementation.
