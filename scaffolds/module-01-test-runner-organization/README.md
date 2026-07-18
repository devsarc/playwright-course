# Lesson 01: Test Runner & Organization

*Combines former modules M06–M11.*

## Learning Objectives

### Part 1 — Test Runner Fundamentals (formerly M06)

- Organize tests with `test.describe` and lifecycle hooks (`beforeEach`, `afterEach`, `beforeAll`, `afterAll`)
- Conditionally skip tests with `test.skip(condition, reason)`
- Mark known failures with `test.fixme`
- Tag tests for filtered runs with `@tag` in the test name or `test.describe.configure`

### Part 2 — Configuration Deep Dive (formerly M07)

- Add browser projects to a Playwright config (chromium, firefox, webkit, mobile)
- Understand the `devices` map and what device presets configure
- Use `browserName` and `viewportSize()` to conditionally skip tests per project
- Add runtime annotations to test results

### Part 3 — Fixtures & Dependency Injection (formerly M08)

- Extend the base `test` object with custom fixtures using `test.extend()`
- Understand the `async ({ builtins }, use) => void` fixture signature
- Explain setup vs teardown in fixtures (everything before `use()` is setup, everything after is teardown)
- Compose fixtures (a fixture can declare other fixtures as dependencies)

### Part 4 — Global Setup & Teardown (formerly M09)

- Write a `globalSetup` function that runs once before all tests
- Pass shared state from `globalSetup` to tests via a JSON file
- Use `globalTeardown` to clean up resources after all tests
- Configure `globalSetup` in `playwright.config.ts`

### Part 5 — Watch Mode & Developer Workflow (formerly M10)

- Run tests in watch mode with `--watch` for instant feedback
- Use the Playwright UI mode (`--ui`) for visual debugging
- Understand which CLI flags are most useful day-to-day
- Know when to use `--headed`, `--debug`, and `--ui`

### Part 6 — Retries & Flakiness Management (formerly M11)

- Enable retries in the config and per-test
- Read `test.info().retry` to branch logic on retry attempts
- Design idempotent tests that produce the same result across retries
- Distinguish between "actually flaky" tests and "wrong assertion" tests

## Concept

### Part 1 — Test Runner Fundamentals (formerly M06)

Playwright's test runner is built around three concepts: organization, lifecycle, and control.

**Organization** — `test.describe` groups related tests. Describe blocks can be nested. Each block gets its own `beforeEach` / `afterEach` — hooks run from outermost to innermost before each test, and from innermost to outermost after.

**Lifecycle hooks:**
- `beforeAll` — runs once before all tests in the block. Use for expensive one-time setup (database seeding, browser context creation).
- `beforeEach` — runs before every test. Use for navigation, resetting state.
- `afterEach` — runs after every test, even on failure. Use for cleanup or logging.
- `afterAll` — runs once after all tests. Use for teardown.

Hooks are scoped to their `describe` block. A `beforeEach` in an outer describe runs before a `beforeEach` in an inner describe.

**Control modifiers:**

`test.skip(condition, reason)` — skip a test conditionally. Without a condition, `test.skip()` always skips. The reason appears in the test report.

```typescript
test.skip(browserName === 'webkit', 'Date input behavior differs in WebKit');
```

`test.fixme(true, reason)` — mark a test as expected-to-fail. The test is skipped and reported as "fixme". Use it to track known gaps or bugs without deleting the test and losing the intent.

`test.only('name', ...)` — run only this test. Useful during development; never commit `test.only` to CI.

**Tags and filtering:**

Adding `@smoke` to a test name allows filtering:
```bash
npx playwright test --grep @smoke
```

For block-level tagging, use `test.describe.configure({ tag: '@smoke' })` at the top of the describe block.

### Part 2 — Configuration Deep Dive (formerly M07)

> **Note:** `exercise.spec.ts` imports directly from `@playwright/test` rather than the shared
> `../fixtures/fixtures` used by most other modules. This is intentional — the module ships its own
> `playwright-part2-configuration.config.ts` that points to a different `baseURL`, so using the shared fixture
> (which bakes in the default config) would conflict. If you see this and wonder why it diverges
> from the course pattern, that's the reason.

Playwright's config file (`playwright.config.ts`) is the central control panel for your test suite. The most important section is `projects` — each project is an independent run configuration that can specify a browser, viewport, locale, or any other context option.

#### Adding browser projects

```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
]
```

When you add multiple projects, Playwright runs every test in every project. A suite with 10 tests and 3 projects produces 30 test results. The HTML report groups them by project.

#### Device presets

`devices['Pixel 5']` is a shorthand for a full set of context options:

```typescript
{
  viewport: { width: 393, height: 851 },
  userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5)...',
  deviceScaleFactor: 2.75,
  isMobile: true,
  hasTouch: true,
}
```

Using device presets means your tests run in conditions that match what real users experience — not just a resized desktop window.

#### The `webServer` option

`webServer` starts your app before tests run and stops it after. `reuseExistingServer: !process.env.CI` means:
- Local dev: if the server is already running, reuse it (faster iteration)
- CI: always start a fresh server (reproducible)

#### `test.info().annotations`

You can attach metadata to any test result at runtime:

```typescript
test.info().annotations.push({ type: 'browser', description: browserName });
```

Annotations appear in the HTML report. They're useful for debugging — you can see which browser or config produced a failure.

### Part 3 — Fixtures & Dependency Injection (formerly M08)

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

#### Why fixtures beat `beforeEach`

`beforeEach` runs setup code, but the setup result (the data it created, the page it navigated to) has to be stored in a variable declared outside the hook:

```typescript
let projectPage: Page;
test.beforeEach(async ({ page }) => {
  await page.goto('/dashboard');
  projectPage = page;
});
```

This is fragile — `projectPage` is shared mutable state. Fixtures are pure dependency injection: the test declares what it needs, Playwright creates it and hands it in.

#### Fixture composition

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

#### Fixture scope

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

#### Type safety

The TypeScript generic `base.extend<MyFixtures>()` gives the extended `test` object accurate types for your fixtures. Define your fixture interface explicitly:

```typescript
type MyFixtures = {
  lumioHomePage: Page;
  loggedInPage: Page;
};
const test = base.extend<MyFixtures>({ ... });
```

This means TypeScript will catch a typo in `lumioHmmPage` at compile time instead of silently passing `undefined` to your test. It also acts as documentation — anyone reading the fixture file knows exactly what the extended `test` provides.

### Part 4 — Global Setup & Teardown (formerly M09)

`globalSetup` runs once before any test worker starts. It's the right place for:

- Verifying the test environment (database seeded, services running)
- Creating shared resources (auth tokens, test fixtures that are expensive to create)
- Writing shared state (workspace IDs, feature flags) to a file that tests can read

`globalTeardown` runs once after all workers have finished. Use it for:

- Deleting test data created by `globalSetup`
- Closing connections opened in setup

#### Configuring global setup

In `playwright.config.ts`:

```typescript
export default defineConfig({
  globalSetup: './tests/module-01-test-runner-organization/globalSetup',
  globalTeardown: './tests/module-01-test-runner-organization/globalTeardown',
  // ...
});
```

The function receives a `FullConfig` object — the entire resolved Playwright config.
This lets you read `config.projects`, `config.use.baseURL`, etc. in your setup.

#### Sharing state from setup to tests

`globalSetup` runs in a separate Node.js process from the tests. You can't share
in-memory variables. The common patterns are:

1. **JSON file** — write data to a file, tests read it with `fs.readFileSync`. Simple and inspectable.
2. **Environment variables** — set `process.env.KEY = value` in setup. Works across processes.
3. **Shared module** — export a cached value that both setup and tests import.

The JSON file pattern is the most transparent — you can inspect `.test-state.json`
after a failed run to understand what the setup produced.

#### When to use `globalSetup` vs `beforeAll`

- `globalSetup` — for things that need to happen once for the entire suite, across all workers
- `beforeAll` — for things that need to happen once per test file or describe block

If you need to seed a database once before all tests, use `globalSetup`.
If you need to create a user once for a group of related tests, use `beforeAll`.

### Part 5 — Watch Mode & Developer Workflow (formerly M10)

The feedback loop is everything in TDD. Playwright gives you three modes for active development:

**Watch mode (`--watch`)** — re-runs tests automatically when any file changes. The terminal stays live. This is the mode to use when you're actively writing tests.

```bash
npx playwright test tests/module-01-test-runner-organization --watch
```

**UI mode (`--ui`)** — opens a GUI that shows your tests as a tree, lets you run individual tests with one click, shows a timeline of each step, and replays actions. The most useful mode for debugging a failing test.

```bash
npx playwright test --ui
```

**Headed mode (`--headed`)** — runs tests with the browser window visible. Slower than headless, but lets you see exactly what Playwright sees. Useful for writing new tests when you're not sure what's on the page.

```bash
npx playwright test tests/module-01-test-runner-organization --headed
```

**Debug mode (`--debug`)** — opens Playwright Inspector alongside the headed browser. You can step through each action, inspect locators, and see the full DOM. Use when a test is failing and you don't understand why.

```bash
npx playwright test tests/module-01-test-runner-organization --debug
```

#### The typical workflow

1. Start watch mode while writing the test
2. Write a failing assertion to confirm the test runs
3. Implement the TODO — the test re-runs on save
4. See it pass
5. Move to the next TODO

If a test fails and you don't understand why, switch to `--debug` or `--ui` for a visual walkthrough.

#### Useful CLI flags

| Flag | Purpose |
|------|---------|
| `--watch` | Re-run on file change |
| `--ui` | Visual test runner GUI |
| `--headed` | Show browser window |
| `--debug` | Step through actions |
| `--grep @smoke` | Run only tagged tests |
| `--retries=2` | Retry failing tests (CI) |
| `--workers=1` | Run sequentially (debug flakiness) |
| `--reporter=html` | Generate HTML report |

### Part 6 — Retries & Flakiness Management (formerly M11)

Flaky tests are tests that sometimes pass and sometimes fail with no code changes. They're the bane of any CI pipeline — they erode trust in the test suite and waste developer time investigating phantom failures.

Playwright's retry mechanism is a last resort, not a fix. A retry doesn't make a flaky test reliable — it just masks the flakiness. The right approach is to find and fix the root cause.

**Common causes of flakiness:**

1. **Time-based waits** — `waitForTimeout(2000)` is wrong. Wait for the event: `waitForURL`, `waitForResponse`, `toBeVisible()`.
2. **Non-idempotent setup** — a test that creates a user fails on retry because the user already exists.
3. **Shared state between tests** — two tests modify the same database record; one of them fails depending on order.
4. **Race conditions in the app itself** — a button is clickable before its handler is registered.

#### Enabling retries

In `playwright.config.ts`:
```typescript
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
});
```

The standard pattern: no retries locally (flakiness is visible immediately), 2 retries in CI (accounts for infrastructure noise).

Per-test:
```typescript
test('flaky test', { retries: 3 }, async ({ page }) => { ... });
```

#### `test.info().retry`

Inside a test, `test.info().retry` tells you which attempt this is:
- 0 = first attempt
- 1 = first retry
- 2 = second retry

Use this to skip expensive or destructive setup that may have already run:

```typescript
if (test.info().retry === 0) {
  // Create test data on first attempt only
  await api.createProject({ name: 'Test Project' });
}
// On retry, the project may already exist — skip creation
```

#### Designing for retries

A test is **idempotent** if running it N times has the same effect as running it once. For tests that create data, use unique identifiers:

```typescript
const uniqueEmail = `test-${Date.now()}@example.com`;
```

Or clean up before creating:

```typescript
await api.deleteUserIfExists(testEmail);
await api.createUser(testEmail);
```

## Lumio Context

See [lumio-context.md](./lumio-context.md).

## Step-by-Step Tasks

### Part 1 — Test Runner Fundamentals

Complete each TODO in `exercise.spec.ts`.
```bash
npx playwright test tests/module-01-test-runner-organization --headed
```

Validate this part only:
```bash
npx playwright test tests/module-01-test-runner-organization -g "Part 1 — Test Runner Fundamentals (formerly M06)"
```

### Part 2 — Configuration Deep Dive

1. Add the missing projects to `playwright-part2-configuration.config.ts` (TODOs 1–3).
2. Complete `exercise.spec.ts` (TODOs 2.4–2.6).
3. Run with the local config:

```bash
npx playwright test tests/module-01-test-runner-organization \
  --config=tests/module-01-test-runner-organization/playwright-part2-configuration.config.ts
```

Validate this part only:
```bash
npx playwright test tests/module-01-test-runner-organization -g "Part 2 — Configuration Deep Dive (formerly M07)"
```

### Part 3 — Fixtures & Dependency Injection

1. Complete TODOs 3.1–3.3 in `exercise.spec.ts` to define and implement `lumioHomePage`.
2. Run `exercise-part3-use.spec.ts` and complete TODO 4.
3. Implement TODO 3.5 to add the `loggedInPage` fixture.

```bash
npx playwright test tests/module-01-test-runner-organization --headed
```

Validate this part only:
```bash
npx playwright test tests/module-01-test-runner-organization -g "lumioHomePage: page is already at /"
```

### Part 4 — Global Setup & Teardown

1. Read `globalSetup.ts` and understand the TODOs.
2. Complete TODOs 4.4–4.5 in `exercise.spec.ts`.
3. Create `playwright-part4-global-setup.config.ts` with `globalSetup` pointing to this module's file.
4. Run:

```bash
npx playwright test tests/module-01-test-runner-organization \
  --config=tests/module-01-test-runner-organization/playwright-part4-global-setup.config.ts
```

Validate this part only:
```bash
npx playwright test tests/module-01-test-runner-organization -g "Part 4 — Global Setup & Teardown (formerly M09)"
```

### Part 5 — Watch Mode & Developer Workflow

Start watch mode, then complete each TODO:
```bash
npx playwright test tests/module-01-test-runner-organization --watch
```

Validate this part only:
```bash
npx playwright test tests/module-01-test-runner-organization -g "Login form validation"
```

### Part 6 — Retries & Flakiness Management

Complete each TODO, then run with retries:
```bash
npx playwright test tests/module-01-test-runner-organization --retries=2
```

Validate this part only:
```bash
npx playwright test tests/module-01-test-runner-organization -g "Signup form — potentially timing-sensitive"
```

## Validate (full lesson)

```bash
npx playwright test tests/module-01-test-runner-organization
```

## Key Takeaways

### Part 1 — Test Runner Fundamentals

1. `beforeEach` / `afterEach` run around every test — even on failure.
2. `test.skip(condition)` is for known environment incompatibilities; `test.fixme` is for known bugs.
3. Never commit `test.only` — it silently skips everything else in CI.
4. `@tag` in test names enables `--grep` filtering without any config changes.
5. Hooks are scoped: a `beforeEach` in an outer describe runs before one in an inner describe.

### Part 2 — Configuration Deep Dive

1. Each project in `playwright.config.ts` runs all tests independently — n projects = n × test count.
2. `devices['Pixel 5']` configures viewport, userAgent, touch, and deviceScaleFactor together.
3. `reuseExistingServer: !process.env.CI` is the standard pattern for local dev speed + CI correctness.
4. `test.info().annotations.push(...)` adds searchable metadata to the HTML report.
5. `browserName` fixture tells you which project is running — use it for conditional skips.

### Part 3 — Fixtures & Dependency Injection

1. Fixtures are dependency injection — declare what you need, Playwright creates it.
2. Everything before `await use(value)` is setup; everything after is teardown.
3. Teardown runs even if the test fails — safer than `afterEach` for cleanup.
4. Fixtures compose: declare other fixtures as parameters to build on them.
5. `loggedInPage` is the building block for all authenticated tests in this course.

### Part 4 — Global Setup & Teardown

1. `globalSetup` runs once before any test — use it for suite-wide environment checks.
2. Pass data from setup to tests via JSON files, not in-memory variables.
3. `globalTeardown` is optional but important for cleaning up long-lived resources.
4. `beforeAll` is scoped to a file; `globalSetup` is scoped to the entire suite.
5. A helpful error message in `globalSetup` saves hours of debugging seed issues.

### Part 5 — Watch Mode & Developer Workflow

1. `--watch` re-runs tests on save — the fastest feedback loop for writing tests.
2. `--ui` gives a visual step-by-step view — best for debugging failures.
3. `--debug` opens Playwright Inspector — use when you don't understand why a test fails.
4. `--workers=1` runs tests sequentially — helpful for isolating flakiness.
5. Use `--grep @smoke` to run a targeted subset quickly.

### Part 6 — Retries & Flakiness Management

1. Retries mask flakiness — fix the root cause instead of relying on retries.
2. Use event-based waits (`waitForURL`, `toBeVisible`) instead of `waitForTimeout`.
3. `test.info().retry` lets you branch logic — skip setup that already ran.
4. Tests must be idempotent: unique IDs or cleanup-before-create.
5. `retries: CI ? 2 : 0` is the standard config — local dev sees failures immediately.

## Going Deeper

### Part 1 — Test Runner Fundamentals

- [Playwright docs: Test annotations](https://playwright.dev/docs/test-annotations)
- [Playwright docs: Test configuration](https://playwright.dev/docs/test-configuration)

### Part 2 — Configuration Deep Dive

- [Playwright docs: Configuration](https://playwright.dev/docs/test-configuration)
- [Playwright docs: Projects](https://playwright.dev/docs/test-projects)

### Part 3 — Fixtures & Dependency Injection

- [Playwright docs: Fixtures](https://playwright.dev/docs/test-fixtures)
- [Playwright docs: Advanced fixtures (scope, auto, tuple syntax)](https://playwright.dev/docs/test-fixtures#fixture-timeout)

### Part 4 — Global Setup & Teardown

- [Playwright docs: Global setup and teardown](https://playwright.dev/docs/test-global-setup-teardown)

### Part 5 — Watch Mode & Developer Workflow

- [Playwright docs: Command line](https://playwright.dev/docs/test-cli)
- [Playwright docs: UI mode](https://playwright.dev/docs/test-ui-mode)

### Part 6 — Retries & Flakiness Management

- [Playwright docs: Retries](https://playwright.dev/docs/test-retries)
- [Playwright docs: Flaky tests](https://playwright.dev/docs/test-sharding)
