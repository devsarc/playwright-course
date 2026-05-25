# Hints — M86: CI/CD Pipeline Optimization

## TODO 1 — Extend timeout for slow CI runners

```typescript
testInfo.setTimeout(testInfo.timeout + 30_000);
```

**Why it works:** `testInfo.timeout` is the current test's configured timeout (e.g., 30 000 ms from `playwright.config.ts`). Adding 30 000 extends it by 30 seconds for this test only, without touching the global config. This is the right pattern when one test consistently needs more time in CI without making every test slower.

---

## TODO 2 — Assert retry count is less than 2

```typescript
expect(testInfo.retry).toBeLessThan(2);
```

**Why it works:** `testInfo.retry` is 0 on the first attempt and increments with each retry. Asserting it is less than 2 means the test is allowed at most one retry (index 1) before the assertion itself fails. A test that regularly needs two retries is too flaky to ship.

---

## TODO 3 — Assert workerIndex is non-negative

```typescript
expect(testInfo.workerIndex).toBeGreaterThanOrEqual(0);
```

**Why it works:** Worker indices are assigned sequentially starting at 0. Asserting `>= 0` confirms the property exists and carries a valid value. In real test data strategies you would use the index to construct unique email addresses (`worker${testInfo.workerIndex}@lumio.test`) to avoid cross-worker conflicts.

---

## TODO 4 — Assert project name matches browser pattern

```typescript
expect(testInfo.project.name).toMatch(/chromium|firefox|webkit/i);
```

**Why it works:** `testInfo.project.name` matches the `name` field of the project in `playwright.config.ts`. The regex covers all three standard browser projects. Matching against this lets you skip known browser-specific bugs (`test.skip(browserName === 'webkit', 'known bug')`) or apply conditional assertions per browser.

---

## TODO 5b — Assert outputDir contains 'test-results'

```typescript
expect(testInfo.outputDir).toContain('test-results');
```

**Why it works:** Playwright writes all per-test artifacts (traces, screenshots, attachments) to `testInfo.outputDir`, which is nested inside the configured `outputDir` (defaulting to `test-results/`). Asserting it contains `'test-results'` verifies the artifact pipeline is correctly configured before you rely on it for CI uploads.

---

## TODO 6 — Push a 'tag' annotation

```typescript
testInfo.annotations.push({
  type: 'tag',
  description: '@smoke',
});
```

**Why it works:** The `type: 'tag'` convention is recognized by the HTML reporter and custom dashboards. When you run `--grep "@smoke"`, Playwright matches on the test title string. Adding the annotation as well makes the tag queryable from the JSON reporter output — useful for flakiness tracking scripts that need to group results by tag.

---

## TODO 7 — Assert duration is non-negative

```typescript
expect(testInfo.duration).toBeGreaterThanOrEqual(0);
```

**Why it works:** `testInfo.duration` reflects elapsed milliseconds during the test body. It is always `>= 0` while the test is running and is finalized (total duration) after the test completes. The real use case is in `afterEach` hooks: compare `testInfo.duration` against a budget threshold to flag slow tests in the CI report.
