# Lumio Context — M89: Smoke Suite for Lumio

## What Lumio feature is under test

The Lumio smoke suite covers the 8 critical paths that, if broken, affect every user regardless of their role or workflow: landing page visibility, login success, dashboard access, core navigation, unauthorized redirect, API health, and logout.

## Why this scenario is realistic

As a SaaS product, Lumio's most costly incidents are those where users cannot log in, cannot see their data, or encounter a blank page. A smoke suite that catches these scenarios in under 60 seconds on every push is the highest-ROI test investment the team can make. Fine-grained feature tests are valuable, but they don't replace the need for a fast, always-running gate.

## Relevant app details

- Lumio's CI runs smoke tests (`--grep "@smoke"`) on every push to `main` and every PR merge.
- The smoke suite runs on Chromium only; Firefox and WebKit run only on the nightly job.
- Target time: under 60 seconds total for all 8 tests combined.
- The `/api/health` endpoint returns `{ status: 'ok' }` with HTTP 200 when the server and database are reachable.
- Smoke test failures block the PR merge via a required GitHub Actions status check.
- `trace: 'on-first-retry'` is set for the smoke job — not `'on'` — to keep runtime low.
