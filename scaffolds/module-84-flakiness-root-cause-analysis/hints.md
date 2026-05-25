# M84 Hints

## TODO 1 — waitForURL with regex

```typescript
await page.waitForURL(/dashboard/);
```

`/PLACEHOLDER/` won't match the dashboard URL. `waitForURL` waits until `page.url()` matches the pattern — it's condition-based, not time-based. Unlike `waitForTimeout(2000)`, it resolves the instant the URL changes, making it both faster and more reliable.

## TODO 2 — Unique task title

```typescript
const uniqueTitle = `Unique task ${Date.now()}`;
```

`Date.now()` returns the current timestamp in milliseconds — unique per call even in parallel runs. `'My task'` is the antipattern: if two parallel workers both try to create `'My task'`, the second will get a 409 Conflict response (if task titles must be unique) or create a duplicate (causing assertion ambiguity in `getByText`).

## TODO 3 — Accessible name locator

```typescript
const createBtn = page.getByRole('button', { name: 'New task' });
```

`'PLACEHOLDER'` finds no button. `nth(0)` is the antipattern: the first button in the DOM changes when a navigation button, a modal close button, or a dropdown is added above it. `getByRole('button', { name: 'New task' })` is stable — it matches by semantic meaning, not DOM position.

## TODO 4 — Test timeout 60000ms

```typescript
testInfo.setTimeout(60000);
```

`0` causes the test to time out immediately — any action fails. `testInfo.setTimeout()` overrides the per-test timeout for the current test only (without changing the config). Use this for tests that are legitimately slower (complex UI workflows, large data renders) without making every test wait longer.

## TODO 5 — Retry less than 2

```typescript
expect(testInfo.retry).toBeLessThan(2);
```

`0` always fails because `testInfo.retry >= 0` always. Changing it to `2` asserts the test did not need more than 1 retry — a signal that the occasional flake is within acceptable bounds. If this assertion fails (retry was 2 or more), the test is flakier than acceptable and needs root cause analysis.

## TODO 6 — Await responsePromise

```typescript
const response = await responsePromise;
```

`Promise.resolve(null)` resolves immediately with `null`, and `expect(null).not.toBeNull()` fails. `responsePromise` is the actual API response — awaiting it pauses the test until the task creation API call completes with status 201. This eliminates the need for `waitForTimeout(1000)` after clicking "Create task."
