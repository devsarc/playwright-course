# M75 Hints

## TODO 1 — Fill password from variable

```typescript
await page.getByLabel('Password').fill(password);
```

Pass the `password` variable, not a literal string. In production the monitor reads credentials from `process.env.MONITOR_PASSWORD`. The empty string default `''` fails the form validation or authenticates with a blank password (which fails), so the URL assertion on the next line fails.

## TODO 2 — not.toBeNull()

```typescript
expect(match).not.toBeNull();
```

`String.match()` returns `null` when the regex finds no match. If `pagination-status` doesn't contain "of \d+", the match is null and parsing `match![1]` would throw. The default `toBeNull()` asserts the match IS null, which always fails when the format is correct.

## TODO 3 — Total greater than 0

```typescript
expect(total).toBeGreaterThan(0);
```

`-1` means the assertion `total > -1` is always true (any non-negative number passes). Changing it to `0` makes the assertion meaningful: at least one user must exist. If the database was cleared, this check catches it before a user-facing feature breaks.

## TODO 4 — Navigate back to login

```typescript
await page.goto('/login');
```

`'/PLACEHOLDER'` navigates to a 404 page, so the second iteration of the loop fails at `getByLabel('Email')`. Navigating back to `'/login'` resets the session state for the next run. Alternatively, you could use `page.context().clearCookies()` and `page.goto('/login')` to reset auth state completely.

## TODO 5 — Health status 200

```typescript
expect(response.status()).toBe(200);
```

The default `0` always fails. If the health endpoint returns 503, the monitor should fire an alert — but the test correctly catches this because `503 !== 200`.

## TODO 6 — toHaveProperty('status')

```typescript
expect(body).toHaveProperty('status');
```

`toHaveProperty('PLACEHOLDER')` fails because `body` has no property named `'PLACEHOLDER'`. `toHaveProperty('status')` verifies the health response always includes a `status` field, even under degradation — a contract you want to enforce.

## TODO 7 — result.status 'ok'

```typescript
expect(result.status).toBe('ok');
```

`'PLACEHOLDER'` doesn't equal `'ok'`. If the try block catches an error, `result.status` becomes `'error'` and this assertion fails — correctly signaling that the monitor detected a problem.

## TODO 8 — Dashboard heading name

```typescript
await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
```

`'PLACEHOLDER'` finds no heading with that name, so Playwright times out. The dashboard heading confirms the user landed on the right page and the content rendered — the final gate before the monitor script exits with code 0.
