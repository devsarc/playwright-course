# Lesson 03 Hints

## Part 1 — Authentication Patterns (formerly M16)

### TODO 1.1 — Fill email credential

```typescript
await page.getByLabel('Email address').fill(process.env.TEST_USER_EMAIL!);
```

The `!` asserts the env var is defined. If `TEST_USER_EMAIL` is not set in `.env.test`,
this throws a helpful error rather than filling in `undefined`.

### TODO 1.2 — `waitForURL` to dashboard

```typescript
await page.waitForURL(/dashboard/, { timeout: 10_000 });
```

### TODO 1.3 — Save `storageState`

```typescript
await page.context().storageState({ path: AUTH_FILE });
```

This writes the current context's cookies and localStorage to a JSON file.
The file includes the NextAuth session cookie, which allows subsequent tests
to reuse the session without logging in again.

### TODO 4 — `test.use({ storageState })`

```typescript
test.use({ storageState: AUTH_FILE });
```

Place this at the top level of the test file (not inside a `test.describe` block).
Every test in this file will start with the saved auth state loaded.

(TODO 4 above is in `exercise-part1-use.spec.ts`, not `exercise.spec.ts` — that
file is copied over from the original module unchanged, so its TODOs keep
their original numbers, per the same precedent Task 3 used for its own extra
file.)

### TODO 5 — Navigate to dashboard

```typescript
await page.goto('/dashboard');
```

Because the storageState contains the session cookie, the app recognizes the user
and doesn't redirect to `/login`.

### TODO 6 — Assert user text

```typescript
await expect(page.getByText(/Test User|test@lumio\.dev/)).toBeVisible();
```

The regex matches either the display name or email — whichever Lumio renders.

## Part 2 — OAuth & SSO Flows (formerly M17)

### TODO 2.1 — `context.waitForEvent('page')`

```typescript
const popupPromise = page.context().waitForEvent('page');
```

Create this promise BEFORE clicking the button that opens the popup.
If created after, the popup may have already opened and the event is missed.

### TODO 2.2 — `.click()` on GitHub button

```typescript
await page.getByRole('button', { name: /GitHub/i }).click();
```

### TODO 2.3 — Await the popup

```typescript
const popup = await popupPromise;
```

The popup is a new `Page` object. You can use all Playwright APIs on it.

### TODO 2.4 — `waitForURL` on popup

```typescript
await popup.waitForURL(/github\.com\/login\/oauth/, { timeout: 10_000 });
```

GitHub's OAuth authorize page has multiple redirects. `waitForURL` waits until
the final URL matches the pattern.

### TODO 2.5 — Mock the callback with a redirect

```typescript
await route.fulfill({
  status: 302,
  headers: { Location: '/dashboard' },
});
```

A 302 redirect tells the browser to navigate to `/dashboard`. NextAuth's callback
normally processes the OAuth code from GitHub, but our mock skips that and redirects
directly — simulating what a successful OAuth flow would do.

## Part 3 — Cookie, Storage & Session Management (formerly M18)

### TODO 3.1 — `localStorage.setItem` via `evaluate`

```typescript
await page.evaluate(() => localStorage.setItem('theme', 'dark'));
```

### TODO 3.2 — `page.reload()`

```typescript
await page.reload();
```

localStorage persists across page reloads (same origin). Reloading verifies the app
reads the stored value on startup.

### TODO 3.3 — Read from localStorage

```typescript
const theme = await page.evaluate(() => localStorage.getItem('theme'));
expect(theme).toBe('dark');
```

### TODO 3.4 — `context.addCookies()`

```typescript
await context.addCookies([{
  name: 'test-session',
  value: 'abc123',
  domain: 'localhost',
  path: '/',
}]);
```

All four fields (name, value, domain, path) are required. For `localhost`, use
`'localhost'` as the domain — not `'http://localhost:3000'`.

### TODO 3.5 — `context.cookies()`

```typescript
const cookies = await context.cookies();
```

`context.cookies()` returns all cookies for all domains in the context.
Pass a URL to filter: `context.cookies('http://localhost:3000')`.

### TODO 3.6 — `context.storageState()`

```typescript
const snapshot = await context.storageState();
```

Returns `{ cookies: Cookie[], origins: { origin: string, localStorage: [...] }[] }`.

### TODO 3.7 — `context.clearCookies()`

```typescript
await context.clearCookies();
```

### TODO 3.8 — `toHaveLength(0)`

```typescript
expect(cookies).toHaveLength(0);
```

## Part 4 — Security Workflow Testing (formerly M19)

### TODO 4.1 — Unauthenticated redirect to /login

```typescript
await expect(page).toHaveURL(/\/login/);
```

The app's middleware redirects unauthenticated requests for protected routes to `/login`.

### TODO 4.2 — Admin redirect to /login when unauthenticated

```typescript
await expect(page).toHaveURL(/\/login/);
```

Same pattern as TODO 4.1 — unauthenticated users can't access `/admin`.

### TODO 4.3 — 401 on /api/workspaces

```typescript
const res = await request.get('/api/workspaces');
expect(res.status()).toBe(401);
```

### TODO 4.4 — Member redirect from /admin to /dashboard

```typescript
await expect(page).toHaveURL(/\/dashboard/);
```

The app distinguishes between unauthenticated (→ /login) and unauthorized (→ /dashboard).
A logged-in member accessing `/admin` is redirected to `/dashboard`, not to `/login`.

### TODO 4.5 — 403 on admin API endpoint

```typescript
const res = await request.get('/api/admin/users');
expect(res.status()).toBe(403);
```

Note: The `request` fixture doesn't automatically inherit the page's session cookie.
The `await page.goto('/dashboard')` before this call is intentional — it ensures
the context has the auth cookies loaded. However, the `request` fixture is a separate
context. For authenticated `request` calls, use `page.request` instead:

```typescript
const res = await page.request.get('/api/admin/users');
```

`page.request` shares the same cookies as the page, so it uses the member's session.
