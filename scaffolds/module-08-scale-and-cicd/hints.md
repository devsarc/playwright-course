# Lesson 08 Hints

## Part 1 — Parallel Execution & Test Isolation (formerly M38)

### TODO 1.1 — Enable intra-file parallelism

```typescript
test.describe.configure({ mode: 'parallel' });
```

Place this as the FIRST statement inside `test.describe()`, before any `test()` calls. Without it, tests within the same describe block run sequentially even if `fullyParallel: true` is set in `playwright.config.ts`.

### TODO 1.2 — Generate unique workspace name

```typescript
return `${label}-${Date.now()}`;
```

`Date.now()` returns milliseconds since epoch — unique enough for test isolation. For even stronger guarantees, add a random suffix: `${label}-${Date.now()}-${Math.random().toString(36).slice(2)}`. In a real suite you might use a UUID library, but `Date.now()` is sufficient for parallel tests that start at different milliseconds.

### TODO 1.3 — Assert workspace name on dashboard

```typescript
await expect(page.getByText(workspaceName)).toBeVisible();
```

`getByText` performs a substring search by default — it matches any element containing `workspaceName`. If you want an exact match: `page.getByText(workspaceName, { exact: true })`.

### TODO 1.4 — Same pattern as test A

```typescript
await expect(page.getByText(workspaceName)).toBeVisible();
```

Note that `workspaceName` in test B is a different value from `workspaceName` in test A (different `Date.now()` timestamp). Both tests can run simultaneously and each asserts only on the workspace it created.

### TODO 1.5 — Local counter

```typescript
let localCounter = 0;
localCounter += 1;
expect(localCounter).toBe(1);
```

The key insight: `localCounter` lives inside the test function's closure. It is not shared with any other test. Each test that runs creates its own `localCounter` starting at 0.

### TODO 1.6 — Assert URL

```typescript
await expect(page).toHaveURL('/dashboard');
```

### TODO 1.7 — Navigate and assert main

```typescript
await page.goto('/dashboard');
await expect(page.getByRole('main')).toBeVisible();
```

The `main` landmark role is the `<main>` element in Lumio's layout. It is always present on authenticated pages.

## Part 2 — Sharding for Large Suites (formerly M39)

### TODO 2.1 — landing page heading

```typescript
await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
```

### TODO 2.2 — all three columns

```typescript
await expect(page.getByTestId('kanban-column-in-progress')).toBeVisible();
await expect(page.getByTestId('kanban-column-done')).toBeVisible();
```

### TODO 2.3 — retry-aware test

```typescript
if (testInfo.retry === 0) {
  expect(testInfo.retry).toBe(99); // fails deliberately on first attempt
}
```

### TODO 2.4 — CI env check

```typescript
test.skip(!process.env.CI, 'shard env vars only exist in CI');
expect(process.env.CI).toBeDefined();
```

### Selecting @smoke tests

```bash
npx playwright test --grep "@smoke"
```

### Sharding syntax

```bash
# Run shard 1 of 4
npx playwright test --shard=1/4

# Merge reports from all shards
npx playwright merge-reports ./all-blob-reports --reporter html
```

## Part 3 — CI/CD Pipeline Setup (formerly M40)

### TODO 3.1 — Assert config exists

```typescript
expect(existsSync(configPath)).toBe(true);
```

`process.cwd()` in Playwright tests returns the repo root (the directory containing `playwright.config.ts`). `join(process.cwd(), 'playwright.config.ts')` gives you the absolute path.

### TODO 3.2 — Assert forbidOnly

```typescript
expect(configContent).toContain('forbidOnly');
```

In `playwright.config.ts`, the pattern is:
```typescript
forbidOnly: !!process.env.CI,
```
The double-negation (`!!`) coerces the environment variable string to a boolean. When `CI=true` is set (as GitHub Actions does automatically), `forbidOnly` is `true` and any committed `test.only()` causes the run to fail immediately.

### TODO 3.3 — Assert retries

```typescript
expect(configContent).toContain('retries');
```

The recommended CI pattern:
```typescript
retries: process.env.CI ? 2 : 0,
```
Local development gets 0 retries (fail fast, fix fast). CI gets 2 retries to absorb transient infrastructure flakiness.

### TODO 3.4 — Assert workflow exists

```typescript
expect(existsSync(workflowPath)).toBe(true);
```

The workflow file at `.github/workflows/module-check.yml` was created in Part 1 (M00's infrastructure setup). This assertion confirms it was not accidentally deleted.

### TODO 3.5 — Assert artifact upload

```typescript
expect(workflowContent).toContain('upload-artifact');
```

The workflow should include:
```yaml
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 7
```
The `if: always()` condition ensures artifacts are uploaded even when tests fail — which is exactly when you need them most.

### TODO 3.6 — Assert browser install

```typescript
expect(workflowContent).toContain('playwright install');
```

The install command in the workflow:
```yaml
- run: npx playwright install --with-deps chromium
```
`--with-deps` installs system-level dependencies (fonts, libraries) that Chromium needs on Ubuntu. Omitting it causes cryptic startup failures on Linux CI runners.

### TODO 3.7 — Assert github reporter

```typescript
expect(configContent).toContain('github');
```

In `playwright.config.ts`, the CI reporter configuration:
```typescript
reporter: process.env.CI
  ? [['github'], ['html', { open: 'never' }]]
  : [['html', { open: 'never' }], ['list']],
```
The `github` reporter posts inline PR annotations. `open: 'never'` prevents the HTML report from auto-opening in CI (which would hang the job).

### TODO 3.8 — Assert process.env.CI usage

```typescript
expect(configContent).toContain('process.env.CI');
```

A correctly structured `playwright.config.ts` uses `process.env.CI` in at least three places: `forbidOnly`, `retries`, and `workers`. The presence of this string confirms the config handles CI and local environments differently.

## Part 4 — WebServer Config & Test Environment (formerly M41)

### TODO 4.1 — Assert webServer key

```typescript
expect(configContent).toContain('webServer');
```

### TODO 4.2 — Assert Lumio command

```typescript
expect(configContent).toContain('lumio');
```

The full command in `playwright.config.ts` is `'npm run dev --prefix lumio'`. The string `'lumio'` is a substring match that's resilient to minor formatting changes.

### TODO 4.3 — Assert reuseExistingServer

```typescript
expect(configContent).toContain('reuseExistingServer');
```

The correct production value in `playwright.config.ts`:
```typescript
webServer: {
  command: 'npm run dev --prefix lumio',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
  timeout: 120_000,
}
```

### TODO 4.4 — Assert .env.test.example exists

```typescript
expect(existsSync(examplePath)).toBe(true);
```

### TODO 4.5 — Assert DATABASE_URL documented

```typescript
expect(exampleContent).toContain('DATABASE_URL');
```

The `.env.test.example` should include:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lumio_test
```

### TODO 4.6 — Assert BASE_URL documented

```typescript
expect(exampleContent).toContain('BASE_URL');
```

The `.env.test.example` should include:
```
BASE_URL=http://localhost:3000
```

### TODO 4.7 — Navigate and assert title

```typescript
await page.goto('/');
await expect(page).toHaveTitle(/Lumio/);
```

`page.goto('/')` uses the `baseURL` from `playwright.config.ts`, which reads `process.env.BASE_URL ?? 'http://localhost:3000'`. Changing `BASE_URL` in `.env.test` changes where all tests point without modifying any test code.

### TODO 4.8 — Assert timeout value

```typescript
const hasTimeout = configContent.includes('120_000') || configContent.includes('120000');
expect(hasTimeout).toBe(true);
```

Both `120_000` (with numeric separator) and `120000` are valid JavaScript. The underscore is a readability convention — it does not affect the value.
