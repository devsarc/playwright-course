# M84: Flakiness Root Cause Analysis

## Learning Objectives

- Categorize flaky Lumio tests into the four root-cause buckets: timing, data, environment, selector
- Use Trace Viewer and retry counts to isolate the root cause of each flaky test
- Distinguish between masking flakiness with retries and fixing the underlying cause
- Apply systematic prevention strategies for each flakiness category

## Concept

A flaky test is not "unreliable" — it has a specific, diagnosable root cause. Every flaky test falls into one of four categories. Identifying the category is 90% of the fix.

**Category 1: Timing flakiness.**

The test assumes a fixed duration that isn't always met. Symptoms: passes on a fast CI machine, fails on a slow one; passes when run alone, fails in parallel.

Root cause: `page.waitForTimeout()`, `sleep()`, or assertions without auto-wait.

Diagnosis: In Trace Viewer → action list, look for the failed action immediately following a hardcoded wait. The wait ended before the element was ready.

Fix: Replace `waitForTimeout` with a condition-based wait (`expect(el).toBeVisible()`, `waitForLoadState('networkidle')`, `waitForResponse()`).

**Category 2: Data flakiness.**

Test data bleeds between tests. Symptoms: passes when run in isolation, fails when run in the full suite; passes on even runs, fails on odd runs.

Root cause: Tests share mutable data (same task name, same user, same workspace slug). One test creates data that a parallel test also expects to create — causing a uniqueness conflict.

Diagnosis: In Trace Viewer → network tab, look for 409 Conflict or 422 Unprocessable Entity responses on API calls that create data.

Fix: Use unique data per test (`const taskName = 'Task ' + Date.now()`), or use `beforeEach` with API setup and `afterEach` with cleanup.

**Category 3: Environment flakiness.**

The test assumes an environment state that isn't guaranteed. Symptoms: passes in local dev, fails in CI; passes in Chrome, fails in Firefox.

Root cause: Network latency differences, font rendering differences, CI container memory limits, locale or timezone mismatch.

Diagnosis: Compare traces from a passing run and a failing run — look for timing differences in network requests, or rendering differences in screenshots.

Fix: Set explicit timeouts for slow environments (`test.setTimeout(60_000)`), use `page.emulateMedia()` for consistent rendering, run with explicit `locale` and `timezone` in context options.

**Category 4: Selector flakiness.**

The locator sometimes finds multiple elements, or finds the wrong one. Symptoms: fails with "strict mode violation" (multiple matches) or fails with a mismatch assertion (found the wrong element).

Root cause: CSS selector matches multiple elements; locator that relies on an index (`.nth(0)`) when order is not guaranteed; `getByText` matches a substring that appears in multiple places.

Diagnosis: In Trace Viewer → inspector tab, click the failed locator and see how many elements it matches.

Fix: Use more specific locators (`getByRole + name`), scope locators to a parent (`parentEl.getByRole(...)`), or use `getByTestId` for elements with no accessible role.

**Retry configuration: signal vs mask.**

```typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0, // retries in CI only
});
```

Retries are a safety net for legitimate transient failures (network hiccup, CI resource contention). They are not a fix for any of the four flakiness categories above. Watching retry counts in your HTML report tells you which tests are flaky — use that as a backlog to diagnose, not a dashboard to celebrate.

`test.info().retry` gives the current retry index inside a test — use it to take a diagnostic screenshot on retry:

```typescript
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.retry > 0) {
    await testInfo.attach('retry-screenshot', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
  }
});
```

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-84-flakiness-root-cause-analysis
```

## Key Takeaways

1. Every flaky test has a category: timing, data, environment, or selector — diagnose the category before writing the fix.
2. Trace Viewer → action list diagnoses timing flakes; network tab diagnoses data flakes (409/422 responses).
3. `waitForTimeout` always indicates timing flakiness — replace with a condition-based wait.
4. Unique test data (`Date.now()` suffix) prevents data conflicts in parallel test runs.
5. Retries mask flakiness; they don't fix it. Use retry count as a flakiness backlog signal.

## Going Deeper

- [Playwright docs: Retries](https://playwright.dev/docs/test-retries)
- [Playwright docs: test.info()](https://playwright.dev/docs/api/class-testinfo)
- [Trace Viewer documentation](https://playwright.dev/docs/trace-viewer)
- [Martin Fowler: Eradicating Non-Determinism in Tests](https://martinfowler.com/articles/nonDeterminism.html)
