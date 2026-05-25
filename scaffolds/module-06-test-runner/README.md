# M06: Test Runner Fundamentals

## Learning Objectives

- Organize tests with `test.describe` and lifecycle hooks (`beforeEach`, `afterEach`, `beforeAll`, `afterAll`)
- Conditionally skip tests with `test.skip(condition, reason)`
- Mark known failures with `test.fixme`
- Tag tests for filtered runs with `@tag` in the test name or `test.describe.configure`

## Concept

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

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Complete each TODO in `exercise.spec.ts`.
```bash
npx playwright test tests/module-06-test-runner --headed
```

## Key Takeaways

1. `beforeEach` / `afterEach` run around every test — even on failure.
2. `test.skip(condition)` is for known environment incompatibilities; `test.fixme` is for known bugs.
3. Never commit `test.only` — it silently skips everything else in CI.
4. `@tag` in test names enables `--grep` filtering without any config changes.
5. Hooks are scoped: a `beforeEach` in an outer describe runs before one in an inner describe.

## Going Deeper

- [Playwright docs: Test annotations](https://playwright.dev/docs/test-annotations)
- [Playwright docs: Test configuration](https://playwright.dev/docs/test-configuration)
