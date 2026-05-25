# Lumio Context — M87: Secrets & Security in Tests

## What Lumio feature is under test

Lumio's test suite includes login flows, REST API calls with API key authentication, admin panel operations, and database seeding scripts. Each of these handles credentials that must never appear in source code, CI logs, or uploaded HTML report artifacts.

## Why this scenario is realistic

Most production test suites accumulate credential leaks over time: a test engineer hardcodes `password123` to get a test passing, a CI workflow echoes env vars for debugging and forgets to remove the step, a trace file is uploaded to GitHub Actions artifacts and contains a real API key in an Authorization header. This module teaches the defensive habits that prevent all three.

## Relevant app details

- Lumio test accounts are seeded by `prisma/seed.ts` against the `lumio_test` database — never the production DB.
- The test API key (`TEST_API_KEY`) is a workspace-scoped read-write key that only exists in the test workspace.
- `.env.test` holds `TEST_EMAIL`, `TEST_PASSWORD`, `TEST_API_KEY`, and `DATABASE_URL` — all pointing at local or CI-isolated resources.
- The Lumio admin UI displays the workspace API key on the Settings > API page — this page must have screenshot masking applied when captured in tests.
