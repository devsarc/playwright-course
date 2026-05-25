# M74 Hints

## TODO 1 — Sign in button name

```typescript
await page.getByRole('button', { name: 'Sign in' }).click();
```

`'Sign in'` is the accessible name of the submit button. `'PLACEHOLDER'` finds no button with that label, so Playwright times out waiting.

## TODO 2 — Journey time budget

```typescript
expect(elapsed).toBeLessThan(5000);
```

5000ms (5 seconds) is the budget for the complete login journey — from `page.goto('/login')` to landing on `/dashboard`. The default `0` always fails because any real operation takes longer than 0ms. In production monitoring, adjust this threshold based on your baseline P95 measurement — don't set it so tight that network jitter triggers false alerts.

## TODO 3 — Health endpoint status 200

```typescript
expect(response.status()).toBe(200);
```

A health endpoint returning anything other than 200 means the server is degraded or down. The default `0` always fails since HTTP status codes start at 100.

## TODO 4 — Health body status 'ok'

```typescript
expect(body.status).toBe('ok');
```

Lumio's `/api/health` endpoint returns `{ "status": "ok", "db": "connected" }` when healthy. `'PLACEHOLDER'` won't equal `'ok'`. If `status` is `'degraded'` or `'error'`, the monitor fails and alerts the team.

## TODO 5 — TTFB budget

```typescript
expect(ttfb).toBeLessThan(800);
```

TTFB (Time to First Byte) measures server processing time: from when the browser sent the request to when the first byte of the response arrived. An 800ms budget on the dashboard is generous for a synthetic monitor; production targets are often 200–400ms. The default `0` always fails.

## TODO 6 — Dashboard URL assertion

```typescript
await expect(page).toHaveURL(/dashboard/);
```

`/dashboard/` is a regex matching any URL containing "dashboard". `/PLACEHOLDER/` won't match the actual dashboard URL, so the assertion fails.

## TODO 7 — Step name for structured output

```typescript
await test.step('verify dashboard renders', async () => {
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
```

The step name `'verify dashboard renders'` appears in the HTML report and in alerting systems that parse Playwright output. When this step fails, the alert reads "verify dashboard renders — heading not visible," which is immediately actionable. `'PLACEHOLDER'` makes the test fail immediately (step name mismatch with the string literal check).

## TODO 8 — Alert role for error message

```typescript
await expect(page.getByRole('alert')).toBeVisible();
```

Login error messages should use `role="alert"` so screen readers announce them immediately. Testing via `getByRole('alert')` both verifies the error is shown and validates the ARIA implementation. `'PLACEHOLDER'` finds no element, so Playwright times out.

## TODO 9 — Task title string

```typescript
await page.getByLabel('Task title').fill('Monitor test task');
```

`'Monitor test task'` is the specific string the test expects to find on the dashboard after creation. An empty string `''` clears the input, leaving the title blank — the form validation may reject it, or the task may be created with no title and the `getByText` assertion fails.
