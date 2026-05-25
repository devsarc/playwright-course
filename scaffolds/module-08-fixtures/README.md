# M08: Fixtures & Dependency Injection

## Learning Objectives

- Extend the base `test` object with custom fixtures using `test.extend()`
- Understand the `async ({ builtins }, use) => void` fixture signature
- Explain setup vs teardown in fixtures (everything before `use()` is setup, everything after is teardown)
- Compose fixtures (a fixture can declare other fixtures as dependencies)

## Concept

Playwright's built-in fixtures (`page`, `context`, `browser`, `request`) are created and torn down automatically for each test. You can create your own fixtures that work the same way — they're declared, injected into tests that ask for them, and cleaned up after use.

The core API is `test.extend()`:

```typescript
const test = base.extend<MyFixtures>({
  myFixture: async ({ page }, use) => {
    // Setup: runs before the test body
    await page.goto('/');
    const widget = await page.locator('.my-widget');

    // Yield to the test: the test body runs here
    await use(widget);

    // Teardown: runs after the test body, even on failure
    await widget.locator('.close-button').click();
  },
});
```

The function signature `async ({ page }, use)` destructures any built-in fixtures the fixture depends on. `use(value)` yields the fixture value to the test. Everything after `await use(...)` is teardown — it runs even if the test fails, making fixtures a safe place for cleanup logic.

### Why fixtures beat `beforeEach`

`beforeEach` runs setup code, but the setup result (the data it created, the page it navigated to) has to be stored in a variable declared outside the hook:

```typescript
let projectPage: Page;
test.beforeEach(async ({ page }) => {
  await page.goto('/dashboard');
  projectPage = page;
});
```

This is fragile — `projectPage` is shared mutable state. Fixtures are pure dependency injection: the test declares what it needs, Playwright creates it and hands it in.

### Fixture composition

Fixtures can depend on other fixtures:

```typescript
const test = base.extend({
  loggedInPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.getByLabel('Email address').fill(process.env.TEST_USER_EMAIL!);
    // ...login steps...
    await use(page);
  },
  dashboardPage: async ({ loggedInPage }, use) => {
    // loggedInPage is already logged in and available here
    await loggedInPage.goto('/dashboard');
    await use(loggedInPage);
  },
});
```

Playwright handles the dependency graph and ensures each fixture is created in the right order.

### Fixture scope

By default, each fixture runs once per test — a fresh instance every time. For expensive resources that are safe to share, you can widen the scope:

```typescript
const test = base.extend({
  dbConnection: [async ({}, use) => {
    const db = await openTestDatabase();
    await use(db);
    await db.close();
  }, { scope: 'worker' }],
});
```

`'worker'`-scoped fixtures are created once per parallel worker process and shared across all tests that run in that worker. Use this for slow-to-start resources — a database connection, a spawned server process — that are safe to reuse as long as each test leaves them in a clean state. `'test'`-scoped (the default) is the right choice for anything that carries per-test state, like a logged-in page or a seeded database row.

### Type safety

The TypeScript generic `base.extend<MyFixtures>()` gives the extended `test` object accurate types for your fixtures. Define your fixture interface explicitly:

```typescript
type MyFixtures = {
  lumioHomePage: Page;
  loggedInPage: Page;
};
const test = base.extend<MyFixtures>({ ... });
```

This means TypeScript will catch a typo in `lumioHmmPage` at compile time instead of silently passing `undefined` to your test. It also acts as documentation — anyone reading the fixture file knows exactly what the extended `test` provides.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

1. Complete TODOs 1–3 in `exercise.spec.ts` to define and implement `lumioHomePage`.
2. Run `exercise-use.spec.ts` and complete TODO 4.
3. Implement TODO 5 to add the `loggedInPage` fixture.

```bash
npx playwright test tests/module-08-fixtures --headed
```

## Key Takeaways

1. Fixtures are dependency injection — declare what you need, Playwright creates it.
2. Everything before `await use(value)` is setup; everything after is teardown.
3. Teardown runs even if the test fails — safer than `afterEach` for cleanup.
4. Fixtures compose: declare other fixtures as parameters to build on them.
5. `loggedInPage` is the building block for all authenticated tests in this course.

## Going Deeper

- [Playwright docs: Fixtures](https://playwright.dev/docs/test-fixtures)
- [Playwright docs: Advanced fixtures (scope, auto, tuple syntax)](https://playwright.dev/docs/test-fixtures#fixture-timeout)
