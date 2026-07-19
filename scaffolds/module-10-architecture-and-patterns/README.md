# Lesson 10: Test Architecture & Design Patterns

*Combines former modules M47–M50.*

## Learning Objectives

### Part 1 — Page Object Model (formerly M47)

- Encapsulate page selectors and repeated actions in a POM class
- Expose typed methods that return `Locator` objects (not resolved elements)
- Keep assertions in specs, not in the POM
- Explain when a POM adds value and when it adds unnecessary indirection
- Build component objects (sub-POMs) for reusable UI fragments like a modal or a nav bar
- Combine POMs with fixtures so tests receive a fully-navigated page object, not a raw page

### Part 2 — Advanced Fixture Patterns (formerly M48)

- Compose multiple fixtures to build authenticated and pre-seeded test contexts
- Understand the difference between test-scoped and worker-scoped fixtures and when each applies
- Implement teardown inside a fixture using the generator pattern (`use` + code after `yield`)
- Build a parameterized fixture that accepts configuration at the point of use

### Part 3 — Data-Driven Testing (formerly M49)

- Use `test.describe()` with a data array loop to generate multiple parametrized test cases from a single test body
- Load test data from an external JSON file instead of embedding it inline
- Name parametrized tests clearly so failures identify which data combination caused the problem
- Recognize when data-driven tests add value and when they obscure intent

### Part 4 — Test Organization & Suite Architecture (formerly M50)

- Apply a consistent tagging strategy using `@smoke`, `@regression`, `@e2e`, `@accessibility`, and `@visual` tags
- Run a filtered subset of tests using `--grep` with tag patterns
- Use `test.fixme()` to mark known failures without deleting tests
- Understand the tradeoffs between organizing tests by feature vs. by type

## Concept

### Part 1 — Page Object Model (formerly M47)

A Page Object Model wraps `page.*` calls behind a meaningful API:

```typescript
// Without POM
await page.getByTestId('add-card-button').click();
await page.getByTestId('new-card-input').fill('My task');
await page.getByTestId('new-card-input').press('Enter');

// With POM
await kanban.addCard('My task');
```

The POM hides the selector strings. When the implementation changes, only
the POM changes — not every spec file.

**Rules for good POMs:**
1. Return `Locator` from query methods — let callers assert.
2. Store locators as constructor-initialized fields (lazy, re-evaluated).
3. Never put `expect()` inside a POM.
4. One POM per logical page/component, not one per test.

### Part 2 — Advanced Fixture Patterns (formerly M48)

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

### Part 3 — Data-Driven Testing (formerly M49)

Some tests exist to verify a behavior across multiple inputs. A form validation test might need to confirm that ten different invalid inputs each produce the correct error message. A task creation test might need to verify that tasks with different priorities, labels, and column assignments all render correctly. Writing ten copies of the same test body is tedious and creates maintenance overhead. Data-driven testing solves this by separating the test logic from the test data.

**The `test.describe()` loop pattern.** The most direct approach: call `test.describe()` once per data case inside a loop, or call `test()` directly in a loop. Playwright generates one test per iteration, each with its own pass/fail result:

```
const cases = [
  { input: 'a', expected: 'error: too short' },
  { input: '', expected: 'error: required' },
];

for (const { input, expected } of cases) {
  test(`validates input: "${input}"`, async ({ page }) => {
    // ...
  });
}
```

Each generated test appears as a separate row in the HTML report. If two pass and one fails, the report shows exactly which case failed. This is the core value: individual failure identification.

**Naming matters.** The test name is the only thing visible in a failure report outside the stack trace. A test named `test('validates form', ...)` in a loop produces `validates form`, `validates form`, `validates form` — indistinguishable from each other. A test named with the discriminating data values — `test('validates input: "${input}"', ...)` — produces immediately actionable failure messages.

**External data files.** When test cases grow large or are shared with non-engineers (product, QA, content teams who write test scenarios in spreadsheets), moving data to an external JSON file decouples the data from the code. The test file imports the JSON, iterates over it, and generates test cases. Updating the data doesn't require changing any TypeScript. The JSON lives in the same directory as the spec or in a dedicated `fixtures/data/` folder.

**When data-driven tests add value.** Data-driven tests make sense when: the behavior is identical across all cases (same actions, same assertion shape), the discriminating factor is the input data, there are enough cases that writing them individually would be repetitive, and different team members might contribute new cases over time by editing the JSON. They are not appropriate when: each "case" actually tests a meaningfully different scenario (use separate named tests instead), when the data drives not just inputs but the shape of the test logic, or when having one test is just a disguise for skipping thinking about what each case is actually verifying.

**The `test.describe()` approach vs. flat `test()` loop.** Wrapping each case in `test.describe()` adds a nesting level in the report — useful for large test suites where you want to group cases under a label. For smaller datasets, a flat `test()` loop is simpler. Both approaches produce the same behavior; the difference is organizational.

**Parametrized fixtures vs. data-driven loops.** These are different tools for different problems. Parametrized fixtures change the setup context for a test (e.g., run with different user roles). Data-driven loops change the inputs and expected outputs within a test body. Use fixtures when the variation is in the environment; use loops when the variation is in the data.

### Part 4 — Test Organization & Suite Architecture (formerly M50)

A test suite of 50 tests is manageable. A test suite of 500 tests needs architecture. Without organization, every CI run executes every test regardless of urgency, failed tests get deleted rather than tracked, and new engineers can't find the test for a given feature. This module covers the structural decisions that make large suites maintainable.

**Tags.** Playwright tests are tagged by adding `@tag` strings to the test name or `test.describe()` name. The `--grep` CLI option filters which tests run:

```
npx playwright test --grep @smoke
```

This runs every test whose name contains `@smoke`. Tags are just name substrings — no registration or configuration required. Common tags:

- `@smoke` — critical path tests that must pass for the app to be deployable. Run on every commit, takes under 2 minutes.
- `@regression` — broader coverage tests. Run before releases. May take 10–30 minutes.
- `@e2e` — full end-to-end flows that touch multiple systems. Slow, high-value.
- `@accessibility` — tests using `expect().toMatchAriaSnapshot()` or `checkA11y`. Can be run separately by accessibility-focused team members.
- `@visual` — tests using `toHaveScreenshot()`. Only meaningful after a baseline is established; skip on first run.

Tags compose: `--grep "@smoke|@regression"` runs tests matching either tag. `--grep-invert "@slow"` excludes tests matching `@slow`.

**`test.skip()` vs `test.fixme()`.** Both mark a test as non-running, but they communicate different things. `test.skip()` says "this test doesn't apply right now" — it might be platform-specific or dependent on a feature that's not enabled. `test.fixme()` says "this test is broken and we know it" — there's an open bug, the test should pass, and we're intentionally deferring the fix. Using `fixme` keeps the test in the suite (it appears in reports as skipped-with-reason) and prevents the broken assertion from blocking CI while the underlying bug is tracked.

The canonical `fixme` workflow: a test starts failing, you open a bug ticket, you add `test.fixme(true, 'LUM-1234: task cards flicker on re-render')`. The test stays in the suite. When the bug is fixed, the `fixme` is removed. If you deleted the test instead, you'd need to remember to re-add it — and you wouldn't.

**Feature vs. type organization.** There are two primary organizing principles for test files: by feature (all dashboard tests in `tests/dashboard/`) or by type (all smoke tests in `tests/smoke/`). The tradeoff:

Feature organization keeps all tests for a given surface area together — a dashboard engineer immediately finds the relevant tests. It works well when tests are written and maintained by feature owners.

Type organization groups tests by their purpose — all smoke tests together, all accessibility tests together. It works well when different teams run different test types: the release team runs smoke, the accessibility team runs accessibility, and so on.

The pragmatic answer for most teams: organize by feature, tag by type. Files live near the features they test; tags select subsets at runtime without moving files.

**Shared `fixtures.ts`.** As the suite grows, fixtures shared across test files belong in a single location — the existing `tests/fixtures/fixtures.ts` pattern. When a fixture changes (e.g., the login flow changes), it changes in one place. Test files import from `../fixtures/fixtures` and don't contain any fixture setup code.

**`test.describe.configure()`.** When a describe block needs specific settings — parallel mode, retries, or a timeout — use `test.describe.configure()` at the top of the block rather than duplicating config across individual tests. This makes the behavioral intent explicit and co-located with the affected tests.

## Lumio Context

See [lumio-context.md](./lumio-context.md).

## Step-by-Step Tasks

### Part 1 — Page Object Model

Validate this part only:
```bash
npx playwright test tests/module-10-architecture-and-patterns -g "Part 1 — Page Object Model (formerly M47)"
```

### Part 2 — Advanced Fixture Patterns

Complete each TODO in `exercise.spec.ts` in order.
These exercises are conceptual — they build fixture patterns incrementally:
```bash
npx playwright test tests/module-10-architecture-and-patterns
```

Validate this part only:
```bash
npx playwright test tests/module-10-architecture-and-patterns -g "Part 2 — Advanced Fixture Patterns (formerly M48)"
```

### Part 3 — Data-Driven Testing

Complete each TODO in `exercise.spec.ts` in order.
```bash
npx playwright test tests/module-10-architecture-and-patterns
```

Validate this part only:
```bash
npx playwright test tests/module-10-architecture-and-patterns -g "Part 3 — Data-Driven Testing (formerly M49)"
```

### Part 4 — Test Organization & Suite Architecture

Complete each TODO in `exercise.spec.ts` in order.
Test tag filtering:
```bash
npx playwright test tests/module-10-architecture-and-patterns --grep @smoke
npx playwright test tests/module-10-architecture-and-patterns --grep @regression
npx playwright test tests/module-10-architecture-and-patterns --grep-invert @slow
```

Validate this part only:
```bash
npx playwright test tests/module-10-architecture-and-patterns -g "Part 4 — Test Organization & Suite Architecture (formerly M50)"
```

## Validate (full lesson)

```bash
npx playwright test tests/module-10-architecture-and-patterns
```

## Key Takeaways

### Part 1 — Page Object Model

1. POMs centralize selectors — one change fixes all tests.
2. Methods should return `Locator`, not `ElementHandle` or booleans.
3. The POM pattern is optional — use it when you have 3+ tests sharing the same selectors.
4. Nested POMs (e.g., `KanbanCard` inside `KanbanColumn`) are valid for complex UIs.

### Part 2 — Advanced Fixture Patterns

1. The generator pattern (`setup → use() → teardown`) guarantees cleanup runs even when tests fail.
2. Worker-scoped fixtures are for expensive, stateless setup; test-scoped for anything that mutates state.
3. Authenticated page fixtures eliminate login boilerplate — each test body starts in an already-logged-in context.
4. Pre-seeded data fixtures create test prerequisites via API and clean up in teardown, keeping tests independent.
5. Fixture composition lets you build high-level fixtures from low-level ones — the dependency graph resolves automatically.

### Part 3 — Data-Driven Testing

1. Loop over a data array inside `test.describe()` or at the top level to generate one test per case.
2. Include the discriminating data in the test name so failures are immediately identifiable.
3. Move large or shared datasets to external JSON files — decouple data from code.
4. Data-driven tests add value when behavior is identical across cases; separate tests add value when scenarios differ meaningfully.
5. Prefer descriptive case names over generic indices — `"priority: high"` beats `"case 3"`.

### Part 4 — Test Organization & Suite Architecture

1. Tags are just `@word` substrings in test names — no registration needed, filtered with `--grep`.
2. Use `test.fixme()` for known failures: the test stays tracked in the suite without blocking CI.
3. Organize by feature, tag by type — files live near their feature, `--grep` selects by purpose.
4. A shared `fixtures.ts` is the single source of truth for shared setup — update once, applies everywhere.
5. `test.describe.configure()` sets mode, retries, and timeout at the describe-block level.

## Going Deeper

### Part 1 — Page Object Model

- [Playwright docs: Page Object Models](https://playwright.dev/docs/pom)

### Part 2 — Advanced Fixture Patterns

- [Playwright docs: Fixtures](https://playwright.dev/docs/test-fixtures)
- [Playwright docs: Test scopes](https://playwright.dev/docs/test-fixtures#fixture-scope)
- [Playwright docs: Parameterized fixtures](https://playwright.dev/docs/test-parameterize#parameterized-fixtures)

### Part 3 — Data-Driven Testing

- [Playwright docs: Parametrize tests](https://playwright.dev/docs/test-parameterize)
- [Playwright docs: test.describe()](https://playwright.dev/docs/api/class-test#test-describe)
- [Playwright docs: Projects for parametrization](https://playwright.dev/docs/test-projects)

### Part 4 — Test Organization & Suite Architecture

- [Playwright docs: Tagging tests](https://playwright.dev/docs/test-annotations#tag-tests)
- [Playwright docs: test.fixme()](https://playwright.dev/docs/api/class-test#test-fixme)
- [Playwright docs: test.describe.configure()](https://playwright.dev/docs/api/class-test#test-describe-configure)
