# M48: Advanced Fixture Patterns

## Learning Objectives

- Compose multiple fixtures to build authenticated and pre-seeded test contexts
- Understand the difference between test-scoped and worker-scoped fixtures and when each applies
- Implement teardown inside a fixture using the generator pattern (`use` + code after `yield`)
- Build a parameterized fixture that accepts configuration at the point of use

## Concept

Fixtures are Playwright's dependency injection system. You've used them since the first module — `{ page }` is a fixture. But the real power comes from building your own: fixtures that handle authentication, pre-seed database state, create test data via API, and clean up after themselves. Done right, every test body reads as a sequence of business-level actions on already-prepared context. Done wrong, fixtures accumulate shared state and make tests interdependent.

**The generator pattern.** A fixture is an async generator function that calls `use()` with the fixture value, then does teardown after `use()` returns. This is the key pattern:

```
async ({ browser }, use) => {
  const context = await browser.newContext({ storageState: 'auth.json' });
  const page = await context.newPage();
  await use(page);               // test runs here
  await context.close();         // teardown runs after test
}
```

Everything before `use()` is setup. Everything after `use()` is teardown. Playwright guarantees teardown runs even if the test fails — making fixtures safer than `beforeEach`/`afterEach` pairs, which can leave state if a hook itself throws.

**Test-scoped vs worker-scoped.** Every fixture has a scope: `'test'` (the default) creates a new instance per test, `'worker'` creates one instance per worker process shared across all tests running in that worker. Worker-scoped fixtures are appropriate for expensive setup that doesn't change between tests and produces no side effects — signing in once per worker instead of once per test is the classic example. The trade-off: worker-scoped fixtures cannot be reset between tests, so any state mutation in one test leaks to the next. Use test-scoped for anything that touches the database or makes API calls that modify state.

**Authenticated page fixture.** The most common advanced fixture is one that handles authentication. Rather than calling `page.goto('/login')` and filling credentials in every test, a fixture does it once, saves the browser storage state, and hands the test a page that's already logged in:

```
authenticatedPage: async ({ browser }, use) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  // ... login flow ...
  await context.storageState({ path: 'auth.json' });
  await use(page);
  await context.close();
}
```

Tests using this fixture start already authenticated — no login boilerplate per test.

**Pre-seeded data fixture.** For tests that depend on existing data (a task to drag, a document to edit), creating that data via API in a fixture is faster and more reliable than creating it through the UI. The fixture calls the application's REST API or runs a database query to insert the record, yields to the test, then deletes the record in teardown:

```
seededTask: async ({ request }, use) => {
  const response = await request.post('/api/tasks', { data: { title: 'Test task' } });
  const task = await response.json();
  await use(task);
  await request.delete(`/api/tasks/${task.id}`);
}
```

The test body receives the task object and can interact with it immediately — no need to create it through the UI.

**Fixture composition.** Fixtures can depend on other fixtures. An `authenticatedPage` fixture might depend on the `browser` fixture and also on a `userCredentials` fixture. Playwright resolves the dependency graph automatically. When a fixture you're building needs another fixture, declare it in its argument list the same way test bodies do.

**Parameterized fixtures.** Sometimes a fixture needs to accept runtime parameters — for example, a fixture that creates a user with a specified role. The `test.extend()` API supports parameterized fixtures through the `option` type. You define the fixture with a default value, and tests that need a different value override it:

```
test.extend({
  userRole: ['viewer', { option: true }],
  authenticatedPage: async ({ browser, userRole }, use) => { ... }
});
```

A test that needs admin access uses `test.use({ userRole: 'admin' })`. The mechanism is the same `test.use()` call you've used for `browserName` and `viewport`.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Complete each TODO in `exercise.spec.ts` in order.
These exercises are conceptual — they build fixture patterns incrementally:
```bash
npx playwright test tests/module-48-advanced-fixture-patterns
```

## Key Takeaways

1. The generator pattern (`setup → use() → teardown`) guarantees cleanup runs even when tests fail.
2. Worker-scoped fixtures are for expensive, stateless setup; test-scoped for anything that mutates state.
3. Authenticated page fixtures eliminate login boilerplate — each test body starts in an already-logged-in context.
4. Pre-seeded data fixtures create test prerequisites via API and clean up in teardown, keeping tests independent.
5. Fixture composition lets you build high-level fixtures from low-level ones — the dependency graph resolves automatically.

## Going Deeper

- [Playwright docs: Fixtures](https://playwright.dev/docs/test-fixtures)
- [Playwright docs: Test scopes](https://playwright.dev/docs/test-fixtures#fixture-scope)
- [Playwright docs: Parameterized fixtures](https://playwright.dev/docs/test-parameterize#parameterized-fixtures)
