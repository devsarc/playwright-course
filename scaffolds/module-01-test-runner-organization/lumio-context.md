# Lumio Context: Lesson 01

## Part 1 — Test Runner Fundamentals (formerly M06)

### Pages used in M06

- `/` — landing page (smoke tests, skip/fixme examples)
- `/login` — login page (tagged smoke test)
- `/signup` — signup page (tagged smoke test)

### What's being tested

M06 is about the test runner itself, not Lumio features. The landing page is used
as a stable target to demonstrate:

- `beforeEach` / `afterEach` lifecycle hooks
- `test.skip(condition, reason)` — conditional skip based on browser
- `test.fixme(true, reason)` — documenting a known missing feature
- `@smoke` tags in test names and via `test.describe.configure`

### The "footer has social links" fixme

Lumio's landing page footer doesn't yet have social links. Rather than deleting
the test (which would lose the intent), `test.fixme(true, 'reason')` marks it as
a known gap. When social links are added, remove the `test.fixme()` call and the
test will run normally.

## Part 2 — Configuration Deep Dive (formerly M07)

### What's tested

M07 tests the landing page (`/`) across multiple browser configurations.
The focus is on the config file, not Lumio features.

### Why multiple projects matter for Lumio

Lumio's navbar has responsive behavior:
- Desktop (> 768px viewport): full nav links are visible
- Mobile (≤ 768px viewport): nav links are hidden, a hamburger menu button appears

The `mobile-chrome` project using `devices['Pixel 5']` (393px wide) triggers
the mobile layout. Desktop Chrome (1280px) shows the full nav.

Testing both ensures the responsive behavior works across real device conditions,
not just CSS media query conditions in unit tests.

### Running with the M07 config

```bash
npx playwright test tests/module-01-test-runner-organization \
  --config=tests/module-01-test-runner-organization/playwright-part2-configuration.config.ts
```

This runs each test once per project (chromium, firefox, webkit, mobile-chrome)
after you've added the TODO projects. The HTML report shows each test × browser combination.

## Part 3 — Fixtures & Dependency Injection (formerly M08)

### Pages used in M08

- `/` — landing page (target for `lumioHomePage` fixture)
- `/login` — login page (used in `loggedInPage` fixture, TODO 3.5)
- `/dashboard` — destination after login (waitForURL target in `loggedInPage`)

### Why fixtures matter for Lumio tests

As the test suite grows, you'll notice that many tests start the same way:
navigate to `/`, log in, navigate to a workspace. Repeating this in every test
is noisy and slow. Fixtures let you extract that setup once and inject it.

The `loggedInPage` fixture (TODO 3.5) is the foundation for all authenticated tests
in M09 onward. Instead of writing a login sequence
in every test, you declare `{ loggedInPage }` in the test signature and get a page
that's already logged in.

### Fixture scopes

Fixtures have a scope: `'test'` (default) or `'worker'`.

- `'test'` — created fresh for each test, torn down after
- `'worker'` — shared across all tests in a worker, torn down when the worker finishes

`lumioHomePage` is test-scoped (default). `loggedInPage` using `storageState`
(as in Lesson 03, formerly M16) would be worker-scoped — you save the auth state once,
reuse it for all tests in the worker.

## Part 4 — Global Setup & Teardown (formerly M09)

### What global setup verifies

The `globalSetup.ts` file runs once before all tests in the suite. It checks that
the test database has the seed data the tests depend on:

- A test user at `TEST_USER_EMAIL`
- A workspace with slug `test-workspace`

If either is missing, the setup throws with a helpful message — better than 20
tests failing with confusing auth errors.

### The `.test-state.json` file

`globalSetup` writes the test workspace's database ID to `.test-state.json`.
Tests read this file to know which workspace to target in API calls.

This pattern is the simplest way to pass data from `globalSetup` to tests.
Alternatives include environment variables or a shared module, but a JSON file
is the most transparent — you can inspect it after a run.

### Running M09

M09 requires a separate config file (`playwright-part4-global-setup.config.ts`) that sets:

```typescript
globalSetup: './tests/module-01-test-runner-organization/globalSetup',
```

The main `playwright.config.ts` does not have a global setup pointing to M09's
file, so you must run M09 with its own config to see the setup behavior.

### Why 401 is the expected response

The test in `exercise.spec.ts` calls `/api/projects?workspaceId=...` without
authentication. The API correctly returns 401. This is intentional — M09 is
about global setup, not authenticated API testing. M14 and
M16 cover auth.

## Part 5 — Watch Mode & Developer Workflow (formerly M10)

### Page tested: `/login`

The login page (`lumio/app/(auth)/login/page.tsx`) has:
- `<label>Email address</label>` + `<input type="email">` pair
- `<label>Password</label>` + `<input type="password">` pair
- `<button type="submit">Sign in</button>`
- `<div role="alert">` rendered when NextAuth returns an error

### The `role="alert"` pattern

`role="alert"` is an ARIA live region — screen readers announce its content
immediately when it appears. Playwright's `getByRole('alert')` finds it.

When credentials are invalid, NextAuth calls back with `error=CredentialsSignin`
and the page renders the alert div with a human-readable message.

### Watch mode behavior

When watch mode is active (`--watch`), saving `exercise.spec.ts` re-runs all
tests in that file. The terminal stays alive and shows a pass/fail summary
after each re-run. This is the fastest feedback loop for TDD-style test writing.

## Part 6 — Retries & Flakiness Management (formerly M11)

### Page tested: `/signup`

The signup page (`lumio/app/(auth)/signup/page.tsx`) has:
- `<label>Full name</label>` + input
- `<label>Email address</label>` + input
- `<label>Password</label>` + input
- `<button type="submit">Create account</button>`
- On success: redirects to `/verify-email`

### Why signup is timing-sensitive

The signup flow calls NextAuth's registration endpoint, which:
1. Creates the user in the database
2. Sends a verification email (async)
3. Redirects to `/verify-email`

The redirect timing depends on database latency. On slow CI machines, the redirect
may take longer than expected — a common cause of flakiness.

Using `waitForURL(/verify-email/, { timeout: 10_000 })` instead of a hardcoded
`page.waitForTimeout(2000)` is the correct fix: wait for the event, not for time.

### Idempotency requirement for retried tests

The signup test uses `Date.now()` in the email address:
```typescript
await page.getByLabel('Email address').fill(`retry-${Date.now()}@test.com`);
```

This ensures each attempt uses a unique email — if the first attempt created the
user but failed afterward, the retry won't hit a "user already exists" error.
Making tests idempotent across retries is a critical design requirement.
