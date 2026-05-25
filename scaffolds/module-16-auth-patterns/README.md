# M16: Authentication Patterns

## Learning Objectives

- Save browser auth state with `page.context().storageState({ path })`
- Reuse saved auth state with `test.use({ storageState })`
- Explain why `storageState` is faster than logging in per test
- Understand the setup project pattern for auth in CI

## Concept

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

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

1. Complete TODOs 1–3 in `exercise.spec.ts` (the setup/login step).
2. Run `exercise.spec.ts` to generate the auth state file.
3. Complete TODOs 4–6 in `exercise-use.spec.ts`.
4. Run `exercise-use.spec.ts` and verify it passes without a login step.

```bash
npx playwright test tests/module-16-auth-patterns
```

## Key Takeaways

1. `storageState()` saves cookies + localStorage — the session token is preserved.
2. `test.use({ storageState })` loads the saved state before every test in the file.
3. This replaces login UI in every test — 1 login per suite run, not 1 per test.
4. Multiple auth roles = multiple setup files + multiple auth state files.
5. In CI, use a setup project with `dependencies` to guarantee order.

## Going Deeper

- [Playwright docs: Authentication](https://playwright.dev/docs/auth)
- [Playwright docs: storageState API reference](https://playwright.dev/docs/api/class-browsercontext#browser-context-storage-state)
