# Lumio Context — M86: CI/CD Pipeline Optimization

## What Lumio feature is under test

The Lumio CI pipeline runs on GitHub Actions across three browser projects (Chromium, Firefox, WebKit) with two retry attempts on failure. The pipeline must complete within a 10-minute budget per push and a 30-minute budget for the nightly regression run.

## Why this scenario is realistic

Every production SaaS has a CI pipeline that evolves from "run everything" to a multi-tier strategy as the test suite grows. Lumio's suite has 90+ tests — running all of them sequentially on every push is not viable. This module teaches the `testInfo` primitives that enable adaptive behavior, selective execution, and artifact management at scale.

## Relevant app details

- Lumio's GitHub Actions workflow runs the `@smoke` suite on every push and the full suite nightly.
- `retries: 2` is set for CI only (`process.env.CI ? 2 : 0`).
- Per-test timeouts are raised by 30 seconds in CI to account for runner latency.
- Test artifacts (traces, screenshots) are uploaded to GitHub Actions on failure.
- Worker count is set to the number of available CPUs (`os.cpus().length`) in CI.
