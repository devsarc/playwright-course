# M89: Smoke Suite for Lumio

## Learning Objectives

- Define what makes a test suitable for a smoke suite vs. regression
- Tag tests with `@smoke` and select them with `--grep` in CI
- Design a smoke suite that runs in under 60 seconds
- Understand the smoke suite as a merge gate: fail here → don't merge
- Write annotations that make smoke suite membership traceable in reports

## Concept

A smoke suite answers one question: *is the application fundamentally broken?* It does not verify every feature. It verifies that the critical paths — the ones that, if broken, make the app unusable for all users — still work. A smoke suite that takes more than 60 seconds is not a smoke suite; it is a partial regression suite that nobody runs.

**Selecting smoke tests.**

The selection criteria: if this test fails in production, every user is affected. That means:
- The marketing landing page loads and the brand is visible
- The login form works for a credential-based user
- A logged-in user can reach the dashboard
- A logged-in user can create a task (the core feature)
- The navigation between main sections works

What is NOT a smoke test:
- "The date picker shows the correct month" — affects a small subset of users in specific flows
- "The French locale shows the correct translation" — important, but not critical-path for all users
- "The admin panel paginates correctly" — affects only admin users

**Tagging and selecting.**

Add `@smoke` directly to the test title:

```typescript
test('login: credential user can sign in @smoke', async ({ page }) => { ... });
```

Then run only smoke tests:
```bash
npx playwright test --grep "@smoke"
```

In CI, configure a separate job that runs only `--grep "@smoke"` on every push, with a timeout budget:
```yaml
- name: Smoke tests
  run: npx playwright test --grep "@smoke" --timeout 15000
```

**Speed strategies.**

Reaching 60 seconds total for 8 tests on Chromium only:
- Use `storageState` to skip login for tests that don't test auth
- Assert the minimum: one heading, one URL, one visible element — not the full page state
- Skip `trace: 'on'` for smoke (only `on-first-retry`) — tracing adds latency
- Run smoke on Chromium only in CI; cross-browser runs on the nightly job

**Smoke as a merge gate.**

A smoke gate blocks PRs that break critical paths without running the full suite. The tradeoff: some regressions slip through (non-smoke features). The mitigation: nightly regression run catches them before the next release. The key insight: a fast gate that catches 80% of critical regressions is more valuable than a slow gate that catches 100% but is disabled because developers bypass it.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-89-smoke-suite-for-lumio --grep "@smoke"
```

## Key Takeaways

1. A smoke test covers paths where failure affects every user — not edge cases or admin flows.
2. `@smoke` in the test title makes it selectable with `--grep "@smoke"` without any config changes.
3. The smoke suite must run in under 60 seconds on CI — if it's slower, it won't be the merge gate.
4. Use `storageState` to skip login UI for non-auth smoke tests — browser-level auth reuse is the main speed lever.
5. Run smoke on one browser only per push; cross-browser is a nightly concern.

## Going Deeper

- [Playwright docs: Test tags](https://playwright.dev/docs/test-annotations#tag-tests)
- [Playwright docs: grep filtering](https://playwright.dev/docs/test-cli#reference)
- [Playwright docs: storageState](https://playwright.dev/docs/auth)
- [Google Testing Blog: Testing Pyramid](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html)
