# M50: Test Organization & Suite Architecture

## Learning Objectives

- Apply a consistent tagging strategy using `@smoke`, `@regression`, `@e2e`, `@accessibility`, and `@visual` tags
- Run a filtered subset of tests using `--grep` with tag patterns
- Use `test.fixme()` to mark known failures without deleting tests
- Understand the tradeoffs between organizing tests by feature vs. by type

## Concept

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

See `lumio-context.md`.

## Step-by-Step Tasks

Complete each TODO in `exercise.spec.ts` in order.
Test tag filtering:
```bash
npx playwright test tests/module-50-test-organization --grep @smoke
npx playwright test tests/module-50-test-organization --grep @regression
npx playwright test tests/module-50-test-organization --grep-invert @slow
```

## Key Takeaways

1. Tags are just `@word` substrings in test names — no registration needed, filtered with `--grep`.
2. Use `test.fixme()` for known failures: the test stays tracked in the suite without blocking CI.
3. Organize by feature, tag by type — files live near their feature, `--grep` selects by purpose.
4. A shared `fixtures.ts` is the single source of truth for shared setup — update once, applies everywhere.
5. `test.describe.configure()` sets mode, retries, and timeout at the describe-block level.

## Going Deeper

- [Playwright docs: Tagging tests](https://playwright.dev/docs/test-annotations#tag-tests)
- [Playwright docs: test.fixme()](https://playwright.dev/docs/api/class-test#test-fixme)
- [Playwright docs: test.describe.configure()](https://playwright.dev/docs/api/class-test#test-describe-configure)
