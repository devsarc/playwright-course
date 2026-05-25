# M16 Hints

## TODO 1 — Fill email credential

```typescript
await page.getByLabel('Email address').fill(process.env.TEST_USER_EMAIL!);
```

The `!` asserts the env var is defined. If `TEST_USER_EMAIL` is not set in `.env.test`,
this throws a helpful error rather than filling in `undefined`.

## TODO 2 — `waitForURL` to dashboard

```typescript
await page.waitForURL(/dashboard/, { timeout: 10_000 });
```

## TODO 3 — Save `storageState`

```typescript
await page.context().storageState({ path: AUTH_FILE });
```

This writes the current context's cookies and localStorage to a JSON file.
The file includes the NextAuth session cookie, which allows subsequent tests
to reuse the session without logging in again.

## TODO 4 — `test.use({ storageState })`

```typescript
test.use({ storageState: AUTH_FILE });
```

Place this at the top level of the test file (not inside a `test.describe` block).
Every test in this file will start with the saved auth state loaded.

## TODO 5 — Navigate to dashboard

```typescript
await page.goto('/dashboard');
```

Because the storageState contains the session cookie, the app recognizes the user
and doesn't redirect to `/login`.

## TODO 6 — Assert user text

```typescript
await expect(page.getByText(/Test User|test@lumio\.dev/)).toBeVisible();
```

The regex matches either the display name or email — whichever Lumio renders.
