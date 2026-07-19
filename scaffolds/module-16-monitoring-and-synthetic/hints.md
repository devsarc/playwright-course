# Lesson 16 Hints

## Part 1 — Synthetic Monitoring Fundamentals (formerly M74)

## TODO 1.1 — Sign in button name

```typescript
await page.getByRole('button', { name: 'Sign in' }).click();
```

`'Sign in'` is the accessible name of the submit button. `'PLACEHOLDER'` finds no button with that label, so Playwright times out waiting.

## TODO 1.2 — Journey time budget

```typescript
expect(elapsed).toBeLessThan(5000);
```

5000ms (5 seconds) is the budget for the complete login journey — from `page.goto('/login')` to landing on `/dashboard`. The default `0` always fails because any real operation takes longer than 0ms. In production monitoring, adjust this threshold based on your baseline P95 measurement — don't set it so tight that network jitter triggers false alerts.

## TODO 1.3 — Health endpoint status 200

```typescript
expect(response.status()).toBe(200);
```

A health endpoint returning anything other than 200 means the server is degraded or down. The default `0` always fails since HTTP status codes start at 100.

## TODO 1.4 — Health body status 'ok'

```typescript
expect(body.status).toBe('ok');
```

Lumio's `/api/health` endpoint returns `{ "status": "ok", "db": "connected" }` when healthy. `'PLACEHOLDER'` won't equal `'ok'`. If `status` is `'degraded'` or `'error'`, the monitor fails and alerts the team.

## TODO 1.5 — TTFB budget

```typescript
expect(ttfb).toBeLessThan(800);
```

TTFB (Time to First Byte) measures server processing time: from when the browser sent the request to when the first byte of the response arrived. An 800ms budget on the dashboard is generous for a synthetic monitor; production targets are often 200–400ms. The default `0` always fails.

## TODO 1.6 — Dashboard URL assertion

```typescript
await expect(page).toHaveURL(/dashboard/);
```

`/dashboard/` is a regex matching any URL containing "dashboard". `/PLACEHOLDER/` won't match the actual dashboard URL, so the assertion fails.

## TODO 1.7 — Step name for structured output

```typescript
await test.step('verify dashboard renders', async () => {
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
```

The step name `'verify dashboard renders'` appears in the HTML report and in alerting systems that parse Playwright output. When this step fails, the alert reads "verify dashboard renders — heading not visible," which is immediately actionable. `'PLACEHOLDER'` makes the test fail immediately (step name mismatch with the string literal check).

## TODO 1.8 — Alert role for error message

```typescript
await expect(page.getByRole('alert')).toBeVisible();
```

Login error messages should use `role="alert"` so screen readers announce them immediately. Testing via `getByRole('alert')` both verifies the error is shown and validates the ARIA implementation. `'PLACEHOLDER'` finds no element, so Playwright times out.

## TODO 1.9 — Task title string

```typescript
await page.getByLabel('Task title').fill('Monitor test task');
```

`'Monitor test task'` is the specific string the test expects to find on the dashboard after creation. An empty string `''` clears the input, leaving the title blank — the form validation may reject it, or the task may be created with no title and the `getByText` assertion fails.

## Part 2 — Scheduled Bots & Cron Tasks (formerly M75)

## TODO 2.1 — Fill password from variable

```typescript
await page.getByLabel('Password').fill(password);
```

Pass the `password` variable, not a literal string. In production the monitor reads credentials from `process.env.MONITOR_PASSWORD`. The empty string default `''` fails the form validation or authenticates with a blank password (which fails), so the URL assertion on the next line fails.

## TODO 2.2 — not.toBeNull()

```typescript
expect(match).not.toBeNull();
```

`String.match()` returns `null` when the regex finds no match. If `pagination-status` doesn't contain "of \d+", the match is null and parsing `match![1]` would throw. The default `toBeNull()` asserts the match IS null, which always fails when the format is correct.

## TODO 2.3 — Total greater than 0

```typescript
expect(total).toBeGreaterThan(0);
```

`-1` means the assertion `total > -1` is always true (any non-negative number passes). Changing it to `0` makes the assertion meaningful: at least one user must exist. If the database was cleared, this check catches it before a user-facing feature breaks.

## TODO 2.4 — Navigate back to login

```typescript
await page.goto('/login');
```

`'/PLACEHOLDER'` navigates to a 404 page, so the second iteration of the loop fails at `getByLabel('Email')`. Navigating back to `'/login'` resets the session state for the next run. Alternatively, you could use `page.context().clearCookies()` and `page.goto('/login')` to reset auth state completely.

## TODO 2.5 — Health status 200

```typescript
expect(response.status()).toBe(200);
```

The default `0` always fails. If the health endpoint returns 503, the monitor should fire an alert — but the test correctly catches this because `503 !== 200`.

## TODO 2.6 — toHaveProperty('status')

```typescript
expect(body).toHaveProperty('status');
```

`toHaveProperty('PLACEHOLDER')` fails because `body` has no property named `'PLACEHOLDER'`. `toHaveProperty('status')` verifies the health response always includes a `status` field, even under degradation — a contract you want to enforce.

## TODO 2.7 — result.status 'ok'

```typescript
expect(result.status).toBe('ok');
```

`'PLACEHOLDER'` doesn't equal `'ok'`. If the try block catches an error, `result.status` becomes `'error'` and this assertion fails — correctly signaling that the monitor detected a problem.

## TODO 2.8 — Dashboard heading name

```typescript
await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
```

`'PLACEHOLDER'` finds no heading with that name, so Playwright times out. The dashboard heading confirms the user landed on the right page and the content rendered — the final gate before the monitor script exits with code 0.

## Part 3 — Uptime & Performance Monitoring (formerly M76)

## TODO 3.1 — LCP budget assertion

```typescript
expect(lcp).toBeLessThan(2500);
```

2500ms is the Web Vitals "Good" threshold for LCP. Values 2500–4000ms are "Needs Improvement" and above 4000ms is "Poor." The default `0` always fails because LCP is always a positive number greater than 0.

## TODO 3.2 — TTFB calculation

```typescript
const ttfb = timing.responseStart - timing.fetchStart;
```

TTFB is the time from when the browser started fetching the resource (`fetchStart`) to when it received the first byte of the response (`responseStart`). This measures server processing time, CDN latency, and network round-trip time. The default `99999` makes `toBeLessThan(800)` fail (99999 > 800) — change it to the actual subtraction to use the real measured value.

## TODO 3.3 — Full load time calculation

```typescript
const loadTime = timing.loadEventEnd - timing.fetchStart;
```

`loadEventEnd` is when the browser's `load` event handler finished executing. Subtracting `fetchStart` gives the total wall-clock time from navigation start to fully loaded. The default `99999` makes `toBeLessThan(5000)` fail — change it to the actual calculated value.

## TODO 3.4 — Regression budget assertion

```typescript
expect(currentLcp).toBeLessThan(baselineLcp * 1.2);
```

`baselineLcp * 1.2` is 1400 × 1.2 = 1680ms — the maximum acceptable LCP including a 20% regression budget. The default `0` always fails because LCP is always > 0. A 20% budget is a common starting point: tight enough to catch real regressions, loose enough to tolerate measurement variance.

## TODO 3.5 — Per-measurement budget

```typescript
expect(measurements.every(m => m < 2500)).toBe(true);
```

`Array.every()` returns true only if all elements satisfy the predicate. With the default `0`, `m < 0` is never true, so `every()` returns false and the assertion fails. The assertion is intentionally per-measurement (not just the average) — any single over-budget run means the user experienced a slow page.

## TODO 3.6 — Health endpoint status

```typescript
expect(response.status()).toBe(200);
```

The default `0` always fails. If the health endpoint returns 503, the test correctly fails — signaling the service is degraded.

## TODO 3.7 — Health endpoint latency

```typescript
expect(elapsed).toBeLessThan(200);
```

200ms is the budget for a health check endpoint — it should be a fast database ping with no complex logic. The default `0` always fails because the HTTP round-trip takes longer than 0ms. If this assertion fails in production, it usually means the database is slow, not the Node.js process.
