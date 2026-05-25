# M11: Retries & Flakiness Management

## Learning Objectives

- Enable retries in the config and per-test
- Read `test.info().retry` to branch logic on retry attempts
- Design idempotent tests that produce the same result across retries
- Distinguish between "actually flaky" tests and "wrong assertion" tests

## Concept

Flaky tests are tests that sometimes pass and sometimes fail with no code changes. They're the bane of any CI pipeline — they erode trust in the test suite and waste developer time investigating phantom failures.

Playwright's retry mechanism is a last resort, not a fix. A retry doesn't make a flaky test reliable — it just masks the flakiness. The right approach is to find and fix the root cause.

**Common causes of flakiness:**

1. **Time-based waits** — `waitForTimeout(2000)` is wrong. Wait for the event: `waitForURL`, `waitForResponse`, `toBeVisible()`.
2. **Non-idempotent setup** — a test that creates a user fails on retry because the user already exists.
3. **Shared state between tests** — two tests modify the same database record; one of them fails depending on order.
4. **Race conditions in the app itself** — a button is clickable before its handler is registered.

### Enabling retries

In `playwright.config.ts`:
```typescript
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
});
```

The standard pattern: no retries locally (flakiness is visible immediately), 2 retries in CI (accounts for infrastructure noise).

Per-test:
```typescript
test('flaky test', { retries: 3 }, async ({ page }) => { ... });
```

### `test.info().retry`

Inside a test, `test.info().retry` tells you which attempt this is:
- 0 = first attempt
- 1 = first retry
- 2 = second retry

Use this to skip expensive or destructive setup that may have already run:

```typescript
if (test.info().retry === 0) {
  // Create test data on first attempt only
  await api.createProject({ name: 'Test Project' });
}
// On retry, the project may already exist — skip creation
```

### Designing for retries

A test is **idempotent** if running it N times has the same effect as running it once. For tests that create data, use unique identifiers:

```typescript
const uniqueEmail = `test-${Date.now()}@example.com`;
```

Or clean up before creating:

```typescript
await api.deleteUserIfExists(testEmail);
await api.createUser(testEmail);
```

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Complete each TODO, then run with retries:
```bash
npx playwright test tests/module-11-retries --retries=2
```

## Key Takeaways

1. Retries mask flakiness — fix the root cause instead of relying on retries.
2. Use event-based waits (`waitForURL`, `toBeVisible`) instead of `waitForTimeout`.
3. `test.info().retry` lets you branch logic — skip setup that already ran.
4. Tests must be idempotent: unique IDs or cleanup-before-create.
5. `retries: CI ? 2 : 0` is the standard config — local dev sees failures immediately.

## Going Deeper

- [Playwright docs: Retries](https://playwright.dev/docs/test-retries)
- [Playwright docs: Flaky tests](https://playwright.dev/docs/test-sharding)
