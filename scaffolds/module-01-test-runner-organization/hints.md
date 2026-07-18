# Lesson 01 Hints

## Part 1 — Test Runner Fundamentals (formerly M06)

### TODO 1.1 — `test.afterEach`

```typescript
test.afterEach(async () => {
  console.log('test finished');
});
```

Place it inside the `test.describe` block, before or after the `test()` calls.

### TODO 1.2 — `test.skip` with condition

```typescript
test.skip(browserName === 'webkit', 'Date input behavior differs in WebKit');
```

`test.skip(condition, reason)` skips the test only when the condition is true.
Without a condition, `test.skip()` always skips.

### TODO 1.3 — `test.fixme`

```typescript
test.fixme(true, 'Social links not yet implemented in footer');
```

`test.fixme(true, reason)` marks the test as expected-to-fail.
The test is skipped and reported as "fixme" — it won't fail your suite.
Use it to track known gaps without deleting the test.

### TODO 1.4 — `test.describe.configure` with tags

```typescript
test.describe.configure({ tag: '@smoke' });
```

Place this at the top of the `test.describe('Login page', ...)` block.
Then run tagged tests with: `npx playwright test --grep @smoke`

## Part 2 — Configuration Deep Dive (formerly M07)

### TODO 1 — Add firefox project

```typescript
{
  name: 'firefox',
  use: { ...devices['Desktop Firefox'] },
},
```

### TODO 2 — Add webkit project

```typescript
{
  name: 'webkit',
  use: { ...devices['Desktop Safari'] },
},
```

### TODO 3 — Add mobile-chrome project

```typescript
{
  name: 'mobile-chrome',
  use: { ...devices['Pixel 5'] },
},
```

`devices['Pixel 5']` sets viewport to 393×851, userAgent to a mobile Chrome UA,
and `isMobile: true`. This triggers the responsive CSS breakpoints in Lumio's navbar.

(TODOs 1–3 above are in `playwright-part2-configuration.config.ts`, not
`exercise.spec.ts` — that file is copied over from the original module unchanged,
so its TODOs keep their original numbers.)

### TODO 2.4 — `toBeVisible()`

```typescript
await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
```

### TODO 2.5 — `test.info().annotations.push`

```typescript
test.info().annotations.push({ type: 'browser', description: browserName });
```

Annotations appear in the HTML report. Useful for adding runtime metadata to test results.

### TODO 2.6 — `test.skip` by viewport width

```typescript
test.skip((viewport?.width ?? 1280) > 768, 'Only meaningful on mobile viewports');
```

The Pixel 5 device has a viewport width of 393px — below 768px, so this test runs.
On Desktop Chrome (1280px), the condition is true and the test is skipped.

## Part 3 — Fixtures & Dependency Injection (formerly M08)

### TODO 3.1 — `MyFixtures` type

```typescript
type MyFixtures = {
  lumioHomePage: Page;
  loggedInPage: Page; // after TODO 3.5
};
```

### TODO 3.2 — `base.extend<MyFixtures>()`

The `part3Test` export in `exercise.spec.ts` is already set up correctly:
```typescript
export const part3Test = base.extend<MyFixtures>({ ... });
```

The fixture object maps fixture names to async functions with signature
`async ({ ...builtins }, use) => void`.

### TODO 3.3 — Navigate and yield

```typescript
lumioHomePage: async ({ page }, use) => {
  await page.goto('/');
  await use(page);
},
```

`use(value)` is what yields the fixture value to the test. Everything before
`await use(...)` is setup; everything after is teardown.

### TODO 4 — Assert the landing page URL

```typescript
await expect(lumioHomePage).toHaveURL('http://localhost:3000/');
```

`lumioHomePage` is a `Page` object — you can use all page assertions on it.

(TODO 4 above is in `exercise-part3-use.spec.ts`, not `exercise.spec.ts` — that
file is copied over from the original module unchanged, so its TODO keeps its
original number.)

### TODO 3.5 — `loggedInPage` fixture

```typescript
loggedInPage: async ({ page }, use) => {
  await page.goto('/login');
  await page.getByLabel('Email address').fill(process.env.TEST_USER_EMAIL!);
  await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/dashboard/, { timeout: 10_000 });
  await use(page);
  // No teardown needed — context is closed by Playwright after the test
},
```

This pattern is the basis for authenticated testing in Lesson 03 (formerly M16).

## Part 4 — Global Setup & Teardown (formerly M09)

### TODO 1 — Verify test user exists

```typescript
const testUser = await prisma.user.findUnique({
  where: { email: process.env.TEST_USER_EMAIL! },
});

if (!testUser) {
  throw new Error(
    `Test user ${process.env.TEST_USER_EMAIL} not found. ` +
    'Run: npm run db:seed --prefix lumio'
  );
}
```

### TODO 2 — Verify test workspace exists

```typescript
const workspace = await prisma.workspace.findUnique({
  where: { slug: 'test-workspace' },
});

if (!workspace) {
  throw new Error('Test workspace not found. Run: npm run db:seed --prefix lumio');
}
```

### TODO 3 — Write test state JSON

```typescript
const { writeFileSync } = await import('fs');
const { join } = await import('path');
writeFileSync(
  join(__dirname, '.test-state.json'),
  JSON.stringify({ workspaceId: workspace.id }),
);
```

(TODOs 1–3 above are in `globalSetup.ts`, not `exercise.spec.ts` — that file is
copied over from the original module unchanged, so its TODOs keep their
original numbers.)

### TODO 4.4 — Read the state file in a test

```typescript
const stateFile = join(__dirname, '.test-state.json');
const state = JSON.parse(readFileSync(stateFile, 'utf-8'));
```

### TODO 4.5 — API call with workspaceId

```typescript
const response = await request.get(`/api/projects?workspaceId=${state.workspaceId}`);
```

The response is 401 because this test has no auth cookie. That's intentional —
Lesson 02 (formerly M14) and Lesson 03 (formerly M16) cover authenticated API calls.

## Part 5 — Watch Mode & Developer Workflow (formerly M10)

### TODO 5.1 — Assert email input visible

```typescript
await expect(page.getByLabel('Email address')).toBeVisible();
```

### TODO 5.2 — Assert password input visible

```typescript
await expect(page.getByLabel('Password')).toBeVisible();
```

### TODO 5.3 — Assert submit button visible and enabled

```typescript
await expect(submitButton).toBeVisible();
await expect(submitButton).toBeEnabled();
```

`toBeEnabled()` checks the button doesn't have the `disabled` attribute.

### TODO 5.4 — Assert error alert visible

```typescript
await expect(errorAlert).toBeVisible();
```

The login page renders `<div role="alert">` after a failed submission.
The `role="alert"` makes it accessible and lets `getByRole('alert')` find it.

## Part 6 — Retries & Flakiness Management (formerly M11)

### TODO 6.2 — `.click()` on the submit button

```typescript
await page.getByRole('button', { name: 'Create account' }).click();
```

### TODO 6.3 — `waitForURL` after form submission

```typescript
await page.waitForURL(/verify-email/, { timeout: 10_000 });
```

Signup redirects to `/verify-email` on success. The 10-second timeout is generous
to account for email verification being triggered asynchronously.

### TODO 6.4 — Log retry count

```typescript
console.log(`Running on attempt ${retryCount + 1}`);
```

`test.info().retry` is 0 on the first attempt, 1 on the first retry, etc.
Use `if (retryCount > 0)` to skip expensive setup on retries when the setup
may have partially succeeded on a previous attempt.

### TODO 6.5 — Assert retry count is non-negative

```typescript
expect(retryCount).toBeGreaterThanOrEqual(0);
```

When running without `--retries`, `retryCount` is always 0.
When running with `--retries=2`, it can be 0, 1, or 2.
