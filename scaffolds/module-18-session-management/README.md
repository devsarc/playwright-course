# M18: Cookie, Storage & Session Management

## Learning Objectives

- Read and write `localStorage` with `page.evaluate()`
- Add, read, and clear cookies with `context.addCookies()`, `context.cookies()`, `context.clearCookies()`
- Take a storage snapshot with `context.storageState()`
- Apply these APIs to test session expiry and theme persistence

## Concept

Browsers have several storage mechanisms. Playwright gives you direct access to all of them — not through the UI, but programmatically, which is faster and more reliable.

### localStorage

`localStorage` persists data across page reloads for the same origin. Access it via `page.evaluate()`:

```typescript
// Write
await page.evaluate(() => localStorage.setItem('theme', 'dark'));

// Read
const theme = await page.evaluate(() => localStorage.getItem('theme'));

// Clear
await page.evaluate(() => localStorage.clear());
```

### Cookies

Playwright's `BrowserContext` API gives you full cookie control:

```typescript
// Add a cookie
await context.addCookies([{
  name: 'session',
  value: 'token-value',
  domain: 'localhost',
  path: '/',
}]);

// Read all cookies
const cookies = await context.cookies();

// Read cookies for a specific URL
const cookies = await context.cookies('http://localhost:3000');

// Clear all cookies (simulates session expiry)
await context.clearCookies();
```

### `storageState()` — snapshot for reuse

`context.storageState()` returns the full state as an object. With a `path` argument, it saves to a file (this is what M16 uses for auth reuse). Without a path, it returns the state in memory:

```typescript
const state = await context.storageState(); // { cookies: [...], origins: [...] }
```

This is useful for snapshotting state before and after an operation to verify changes.

### Testing session expiry

Clearing cookies simulates session expiry. This is the cleanest way to test that protected routes redirect to login:

```typescript
// Load authenticated state
test.use({ storageState: '.auth/member.json' });

test('session expiry redirects to login', async ({ context, page }) => {
  await page.goto('/dashboard'); // succeeds with valid session
  await context.clearCookies(); // simulate expiry
  await page.goto('/dashboard'); // triggers redirect
  await expect(page).toHaveURL(/\/login/);
});
```

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Complete each TODO in `exercise.spec.ts`.
```bash
npx playwright test tests/module-18-session-management --headed
```

## Key Takeaways

1. `page.evaluate()` executes code in the browser — use it to read/write localStorage.
2. `context.addCookies()` injects cookies before navigation — useful for auth testing.
3. `context.clearCookies()` simulates session expiry — tests redirect behavior cleanly.
4. `context.storageState()` snapshots cookies + localStorage — the foundation of M16.
5. localStorage persists across `page.reload()` — verifying persistence is a valid test.

## Going Deeper

- [Playwright docs: Storage state](https://playwright.dev/docs/api/class-browsercontext#browser-context-storage-state)
- [Playwright docs: Cookies](https://playwright.dev/docs/api/class-browsercontext#browser-context-cookies)
