# Lumio Context — M90: Full Regression Suite Organization

## What Lumio feature is under test

By M90, Lumio has 90+ tests organized across all four coverage tiers. This module exercises the tagging and CI trigger strategy that makes the full suite maintainable: smoke tests block merges, sanity tests validate PR integration, regression tests run nightly, and the full suite (including cross-browser and visual) runs before each release.

## Why this scenario is realistic

A suite of 90+ tests without tier organization becomes unmanageable. Developers start skipping CI when it takes 45 minutes, or the nightly job becomes so unreliable that nobody investigates failures. The four-tier model is the industry standard for managing this complexity — it trades some coverage latency (a regression might not be caught until the nightly run) for sustainable CI speed.

## Relevant app details

- Lumio's 90+ tests are tagged: 8 `@smoke`, 24 `@sanity`, 58+ `@regression`, 12 untagged (backlog).
- The CI workflow has three jobs: `smoke` (per push), `sanity` (per PR merge), `regression` (nightly 2am UTC).
- The `@slow` tag (visual regression, cross-browser, i18n exhaustive) is excluded from both smoke and sanity using `--grep-invert "@slow"`.
- Known bugs are tracked with `test.fixme()` rather than deleted — each includes a Linear issue reference in a comment.
- The quarterly suite review checks: tag distribution, tier duration trends, and untagged test count.
