# Lumio Context: M09

## What global setup verifies

The `globalSetup.ts` file runs once before all tests in the suite. It checks that
the test database has the seed data the tests depend on:

- A test user at `TEST_USER_EMAIL`
- A workspace with slug `test-workspace`

If either is missing, the setup throws with a helpful message — better than 20
tests failing with confusing auth errors.

## The `.test-state.json` file

`globalSetup` writes the test workspace's database ID to `.test-state.json`.
Tests read this file to know which workspace to target in API calls.

This pattern is the simplest way to pass data from `globalSetup` to tests.
Alternatives include environment variables or a shared module, but a JSON file
is the most transparent — you can inspect it after a run.

## Running M09

M09 requires a separate config file (`playwright-m09.config.ts`) that sets:

```typescript
globalSetup: './tests/module-09-global-setup/globalSetup',
```

The main `playwright.config.ts` does not have a global setup pointing to M09's
file, so you must run M09 with its own config to see the setup behavior.

## Why 401 is the expected response

The test in `exercise.spec.ts` calls `/api/projects?workspaceId=...` without
authentication. The API correctly returns 401. This is intentional — M09 is
about global setup, not authenticated API testing. M14 and M16 cover auth.
