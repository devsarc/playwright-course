# M08 Hints

## TODO 1 — `MyFixtures` type

```typescript
type MyFixtures = {
  lumioHomePage: Page;
  loggedInPage: Page; // after TODO 5
};
```

## TODO 2 — `base.extend<MyFixtures>()`

The `test` export in `exercise.spec.ts` is already set up correctly:
```typescript
export const test = base.extend<MyFixtures>({ ... });
```

The fixture object maps fixture names to async functions with signature
`async ({ ...builtins }, use) => void`.

## TODO 3 — Navigate and yield

```typescript
lumioHomePage: async ({ page }, use) => {
  await page.goto('/');
  await use(page);
},
```

`use(value)` is what yields the fixture value to the test. Everything before
`await use(...)` is setup; everything after is teardown.

## TODO 4 — Assert the landing page URL

```typescript
await expect(lumioHomePage).toHaveURL('http://localhost:3000/');
```

`lumioHomePage` is a `Page` object — you can use all page assertions on it.

## TODO 5 — `loggedInPage` fixture

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

This pattern is the basis for authenticated testing in M16.
