# Lesson 03: Authentication & Session Management

*Combines former modules M16–M19.*

## Learning Objectives

### Part 1 — Authentication Patterns (formerly M16)
- Save browser auth state with `page.context().storageState({ path })`
- Reuse saved auth state with `test.use({ storageState })`
- Explain why `storageState` is faster than logging in per test
- Understand the setup project pattern for auth in CI

### Part 2 — OAuth & SSO Flows (formerly M17)
- Interact with popup windows using `context.waitForEvent('page')`
- Explain why automating real OAuth flows is fragile
- Mock an OAuth provider by intercepting the callback URL
- Apply the same popup pattern to any external auth provider

### Part 3 — Cookie, Storage & Session Management (formerly M18)
- Read and write `localStorage` with `page.evaluate()`
- Add, read, and clear cookies with `context.addCookies()`, `context.cookies()`, `context.clearCookies()`
- Take a storage snapshot with `context.storageState()`
- Apply these APIs to test session expiry and theme persistence

### Part 4 — Security Workflow Testing (formerly M19)
- Test that unauthenticated users are redirected to the login page
- Test that authenticated members can't access admin routes
- Use `page.request` to make API calls that share the page's session cookies
- Explain why security tests are high-value regression tests

## Concept

### Part 1 — Authentication Patterns (formerly M16)

Authentication is the most common source of test suite slowness. If every test logs in through the UI, you're spending 500–2000ms per test just on login overhead — before the actual test even begins.

The `storageState` pattern solves this with two steps:

**Step 1: Save the auth state** (once per suite run)

```typescript
await page.goto('/login');
await page.getByLabel('Email address').fill(email);
await page.getByLabel('Password').fill(password);
await page.getByRole('button', { name: 'Sign in' }).click();
await page.waitForURL(/dashboard/);
await page.context().storageState({ path: './auth-state.json' });
```

`storageState()` saves cookies and localStorage to a JSON file. This file contains the session token that proves authentication.

**Step 2: Use the saved state** (in every authenticated test)

```typescript
test.use({ storageState: './auth-state.json' });

test('access dashboard', async ({ page }) => {
  await page.goto('/dashboard'); // No redirect to login
});
```

Playwright loads the saved cookies before the test runs. The app sees a valid session token and renders the authenticated content immediately.

### Setup project pattern

In a production test suite, auth setup runs as a separate "setup project" in `playwright.config.ts`:

```typescript
projects: [
  {
    name: 'setup',
    testMatch: '**/auth.setup.ts',
  },
  {
    name: 'authenticated tests',
    use: { storageState: '.auth/member.json' },
    dependencies: ['setup'],
  },
]
```

The setup project runs first, authenticated tests run after — they're guaranteed to have valid auth state.

### Multiple auth roles

A real app often needs multiple auth states: member, admin, guest. Create a separate setup file and auth state file per role:

```typescript
// member.setup.ts → .auth/member.json
// admin.setup.ts → .auth/admin.json
```

Then reference the appropriate file per test:

```typescript
test.use({ storageState: '.auth/admin.json' }); // admin tests
```

### When does auth state expire?

Saved auth state is only valid as long as the server-side session is alive. For NextAuth with a JWT strategy, sessions typically last 30 days — but test environments often use shorter durations. If your tests start failing with unexpected `/login` redirects, regenerate the auth state by re-running the setup file. In CI, treat the auth state file as ephemeral: regenerate it on every pipeline run rather than caching it between runs, where the session is more likely to have expired.

### Keeping auth state out of source control

Auth state JSON files contain your session token — committing them is a security risk. Add the pattern to `.gitignore`:

```
tests/**/.auth-state-*.json
```

The auth state is always regenerated from credentials in your environment variables, so it never needs to be in version control.

### Worker-scoped storageState in large suites

When a project has many test files, each file starts a fresh browser context and loads the storageState from disk. In a suite with 50 files, that's 50 disk reads — negligible, but consistent. If you're running thousands of tests per worker, consider making the `storageState` project configuration worker-scoped to share the loaded state across all tests in a worker process without re-reading the file.

### Part 2 — OAuth & SSO Flows (formerly M17)

OAuth flows are tricky to test because they redirect to an external domain (GitHub, Google, Microsoft) that you don't control. The browser opens a popup or redirects to the provider's login page, which then redirects back with an authorization code.

Two strategies exist for testing this:

**Strategy 1: Automate the real flow**
Navigate to the provider's login page, fill in credentials, click authorize. Works, but:
- Brittle — the provider's UI changes break your tests
- Slow — external network roundtrip
- Fragile — providers add CAPTCHA and bot detection
- Credential management — real OAuth credentials in CI

**Strategy 2: Mock the provider** (recommended)
Intercept the OAuth callback URL that the provider would redirect to, and return a mocked response that simulates a successful authentication. Fast, reliable, no external dependencies.

### Handling popups

Some OAuth implementations open in a popup window rather than the same tab. Playwright handles this with:

```typescript
// Create the promise BEFORE the action that opens the popup
const popupPromise = page.context().waitForEvent('page');

// Click the button that opens the popup
await page.getByRole('button', { name: /GitHub/i }).click();

// Await the popup page
const popup = await popupPromise;

// Interact with the popup like any other Page object
await popup.waitForURL(/github\.com/);
await expect(popup).toHaveURL(/github\.com/);
await popup.close();
```

### Mocking the OAuth callback

NextAuth's callback URL follows the pattern `/api/auth/callback/{provider}`. Intercepting it:

```typescript
await page.route('/api/auth/callback/github*', async (route) => {
  await route.fulfill({
    status: 302,
    headers: { Location: '/dashboard' },
  });
});
```

This simulates what NextAuth would do after a successful GitHub OAuth exchange — redirect the user to the dashboard.

### Part 3 — Cookie, Storage & Session Management (formerly M18)

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

`context.storageState()` returns the full state as an object. With a `path` argument, it saves to a file (this is what Part 1 of this lesson (formerly M16) uses for auth reuse). Without a path, it returns the state in memory:

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

### Part 4 — Security Workflow Testing (formerly M19)

Security tests verify your application's access control rules. They're among the highest-value tests you can write, because:

1. They're fast — a redirect or a 401 response is cheap to check
2. They catch regressions that could expose sensitive data or functionality
3. They document your access control policy as executable specifications

### Three categories of access control tests

**Unauthenticated access** — what happens when no one is logged in?
```typescript
test('protected route redirects to login', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
});
```

**Insufficient privileges** — what happens when a logged-in user doesn't have permission?
```typescript
test.use({ storageState: memberAuthFile });
test('member cannot access admin panel', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/dashboard/); // redirected, not to login
});
```

**API authorization** — are your API endpoints as protected as your UI routes?
```typescript
test('admin API returns 403 for members', async ({ page }) => {
  const res = await page.request.get('/api/admin/users');
  expect(res.status()).toBe(403);
});
```

### `page.request` vs `request` fixture

When you need authenticated API calls in a UI test, use `page.request` — it shares cookies with the page's browser context:

```typescript
// Authenticated — shares page's cookies
const res = await page.request.get('/api/admin/users');

// Separate context — no auth cookies unless explicitly provided
const res = await request.get('/api/admin/users');
```

For pure API tests (no page), use the `request` fixture and provide auth manually (as in Lesson 02 (formerly M14)).

### The 401 vs 403 distinction

- **401 Unauthorized** — no authentication at all. "Who are you?"
- **403 Forbidden** — authenticated but not authorized. "I know who you are, and you can't do this."

Your tests should verify the correct status code for each scenario. A 403 where a 401 was expected (or vice versa) can indicate a security misconfiguration.

### Defense in depth

Your application should enforce access control at multiple layers: middleware, server-side page logic, and API route handlers. Testing only the middleware is not enough. An API endpoint without its own auth check can be called directly — bypassing the browser, the middleware, and the UI entirely. Your test suite should verify each layer independently:

- Does the middleware redirect unauthenticated users? (UI test)
- Does the server-side page return nothing or redirect when called without a session? (server test)
- Does the API route return 401/403 when called with no auth or wrong role? (API test)

M19 covers all three layers for the Lumio app.

### Security tests as living documentation

A well-structured security test file is an executable specification of your access control policy. When a developer asks "can members see the admin panel?", the test file gives an authoritative, always-up-to-date answer. This is why security tests belong in version control alongside the features they protect — they document intent, not just behavior, and a failing test catches a regression that code review might miss.

### Running security tests in CI

Security tests should run on every pull request, not just before releases. A broken access control rule introduced by an otherwise-passing PR is easy to miss in manual review. A failing security test catches it automatically, before the code merges.

## Lumio Context

See [lumio-context.md](./lumio-context.md).

## Step-by-Step Tasks

### Part 1 — Authentication Patterns

1. Complete TODOs 1.1–1.3 in `exercise.spec.ts` (the setup/login step).
2. Run `exercise.spec.ts` to generate the auth state file.
3. Complete TODOs 4–6 in `exercise-part1-use.spec.ts`.
4. Run `exercise-part1-use.spec.ts` and verify it passes without a login step.

```bash
npx playwright test tests/module-03-auth-and-sessions
```

Validate this part only:
```bash
npx playwright test tests/module-03-auth-and-sessions -g "Part 1 — Authentication Patterns (formerly M16)"
```

### Part 2 — OAuth & SSO Flows

Complete each TODO in `exercise.spec.ts`.
```bash
npx playwright test tests/module-03-auth-and-sessions --headed
```

Note: the real OAuth test (TODOs 2.1–2.4) requires an internet connection and will open
a GitHub page. The mock test (TODO 2.5) works offline.

Validate this part only:
```bash
npx playwright test tests/module-03-auth-and-sessions -g "Part 2 — OAuth & SSO Flows (formerly M17)"
```

### Part 3 — Cookie, Storage & Session Management

Complete each TODO in `exercise.spec.ts`.
```bash
npx playwright test tests/module-03-auth-and-sessions --headed
```

Validate this part only:
```bash
npx playwright test tests/module-03-auth-and-sessions -g "Part 3 — Cookie, Storage & Session Management (formerly M18)"
```

### Part 4 — Security Workflow Testing

First, ensure Part 1 of this lesson (formerly M16)'s auth state file exists:
```bash
npx playwright test tests/module-03-auth-and-sessions/exercise.spec.ts
```

Then complete M19:
```bash
npx playwright test tests/module-03-auth-and-sessions
```

Validate this part only:
```bash
npx playwright test tests/module-03-auth-and-sessions -g "Part 4 — Security Workflow Testing (formerly M19)"
```

## Validate (full lesson)

```bash
npx playwright test tests/module-03-auth-and-sessions
```

## Key Takeaways

### Part 1 — Authentication Patterns

1. `storageState()` saves cookies + localStorage — the session token is preserved.
2. `test.use({ storageState })` loads the saved state before every test in the file.
3. This replaces login UI in every test — 1 login per suite run, not 1 per test.
4. Multiple auth roles = multiple setup files + multiple auth state files.
5. In CI, use a setup project with `dependencies` to guarantee order.

### Part 2 — OAuth & SSO Flows

1. Create `waitForEvent('page')` promise BEFORE the action that opens the popup.
2. A popup is just a `Page` object — all Playwright APIs work on it.
3. Mock OAuth by intercepting the callback URL, not by automating the provider's UI.
4. The callback mock returns a 302 redirect to simulate a successful auth.
5. Real OAuth automation is fragile — mock it in every test suite that uses OAuth.

### Part 3 — Cookie, Storage & Session Management

1. `page.evaluate()` executes code in the browser — use it to read/write localStorage.
2. `context.addCookies()` injects cookies before navigation — useful for auth testing.
3. `context.clearCookies()` simulates session expiry — tests redirect behavior cleanly.
4. `context.storageState()` snapshots cookies + localStorage — the foundation of Part 1 of this lesson (formerly M16).
5. localStorage persists across `page.reload()` — verifying persistence is a valid test.

### Part 4 — Security Workflow Testing

1. Test every protected route and API endpoint — both UI redirects and HTTP status codes.
2. Distinguish 401 (unauthenticated) from 403 (authenticated but unauthorized).
3. Use `page.request` for API calls that need the page's session cookies.
4. Security tests are cheap to write and expensive to miss — prioritize them.
5. M19 tests serve as a living specification of your access control policy.

## Going Deeper

### Part 1 — Authentication Patterns

- [Playwright docs: Authentication](https://playwright.dev/docs/auth)
- [Playwright docs: storageState API reference](https://playwright.dev/docs/api/class-browsercontext#browser-context-storage-state)

### Part 2 — OAuth & SSO Flows

- [Playwright docs: Dialogs and popups](https://playwright.dev/docs/dialogs)
- [Playwright docs: Authentication](https://playwright.dev/docs/auth)

### Part 3 — Cookie, Storage & Session Management

- [Playwright docs: Storage state](https://playwright.dev/docs/api/class-browsercontext#browser-context-storage-state)
- [Playwright docs: Cookies](https://playwright.dev/docs/api/class-browsercontext#browser-context-cookies)

### Part 4 — Security Workflow Testing

- [OWASP: Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
- [Playwright docs: API testing](https://playwright.dev/docs/api-testing)
