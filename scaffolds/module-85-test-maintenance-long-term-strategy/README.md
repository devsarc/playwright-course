# M85: Test Maintenance & Long-term Strategy

## Learning Objectives

- Recognize the four maintenance smells: brittle selectors, dead tests, overcoupled assertions, and scope leaks
- Apply the selector resilience hierarchy: role > label > text > testId > CSS
- Use `testInfo.annotations` to document tests with issue links and coverage tags
- Collect all assertion failures per test run using `expect.soft()`

## Concept

Tests are not write-once artifacts. A test suite that isn't maintained becomes a liability: slow to run, hard to debug, and actively misleading when it gives false confidence. Maintenance debt accumulates silently until a single UI change breaks thirty tests that have nothing to do with the change.

The goal of a maintainable test suite is **low breakage rate** when the application's behavior hasn't changed. If a CSS rename causes test failures, the tests weren't testing behavior — they were testing implementation. That's the core diagnostic question: *what specifically would have to change in the app for this test to break?*

**Smell 1: Brittle selectors.**

CSS class selectors and index-based locators break when:
- A developer renames a class during a CSS refactor
- A new button is added above an existing one, shifting nth(0) to nth(1)
- A placeholder text string is updated in a copy edit

The fix follows the selector resilience hierarchy:
1. `getByRole()` — backed by ARIA semantics, survives HTML restructuring
2. `getByLabel()` — backed by form label, survives placeholder and class changes
3. `getByText()` — tied to visible copy, breaks on copy edits but rarely on structural changes
4. `getByTestId()` — explicit contract, requires coordination with developers
5. `locator('.css')` — last resort; breaks on any CSS refactor

**Smell 2: Dead tests (tautological assertions).**

A dead test always passes regardless of application behavior. Common patterns:
- `expect(true).toBeTruthy()` — asserts nothing
- `expect(await locator.count()).toBeGreaterThan(-1)` — always true (count is never negative)
- `expect(someString).toBeDefined()` — always true if the variable was declared

Dead tests are worse than no tests: they give false confidence, consume CI time, and make reviewers think coverage exists where it doesn't. Identifying a dead test requires asking: *would this test fail if the feature were completely removed?*

**Smell 3: Overcoupled assertions.**

An overcoupled test checks implementation details instead of observable behavior. Examples:
- Asserting a CSS class name like `aria-pressed="true"` instead of `toBeChecked()`
- Asserting DOM structure (number of `<li>` elements) instead of user-visible count
- Asserting the value of a React state variable via `window.__state`

The fix: assert what a user would observe (visible text, enabled state, URL), not how the component achieves it internally.

**Smell 4: Scope leaks (ambiguous locators).**

An unscoped locator like `page.getByRole('heading', { name: 'Settings' })` fails with a "strict mode violation" if both the sidebar and the page content contain a heading named "Settings". Scoping to a parent locator (`page.getByRole('main').getByRole('heading', ...)`) eliminates ambiguity without needing a test ID.

**Documenting tests: `testInfo.annotations`.**

Playwright's `testInfo.annotations` array allows attaching metadata to a test at runtime. The HTML report renders these as visible annotations, and CI tooling can read them from the JSON reporter output:

```typescript
testInfo.annotations.push({
  type: 'issue',
  description: 'https://linear.app/lumio/issue/LUM-123'
});
```

Common annotation types used by Lumio's team:
- `'issue'` — links a test to the bug report it was written to prevent regressions for
- `'tag'` — marks coverage tier (`@smoke`, `@sanity`, `@regression`)
- `'owner'` — the squad responsible for maintaining this test

**Collecting all failures: `expect.soft()`.**

By default, the first failed assertion terminates the test. `expect.soft()` continues execution after a failure, collecting all assertion errors into `testInfo.errors`. This is useful for maintenance-oriented tests that audit multiple properties at once: rather than fixing one assertion, rerunning, and discovering the next failure, all issues surface in a single run.

```typescript
await expect.soft(page).toHaveTitle(/Lumio/);
await expect.soft(page.getByRole('main')).toBeVisible();
// Both failures reported even if the first fails
```

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-85-test-maintenance-long-term-strategy
```

## Key Takeaways

1. A test that breaks on a CSS rename was testing implementation, not behavior — fix the selector, not the CSS.
2. The selector hierarchy: role > label > text > testId > CSS. Prefer higher entries.
3. Scope locators to a parent to prevent strict mode violations from unrelated matching elements.
4. `testInfo.annotations` links tests to issue trackers and coverage tiers — use it so reports are self-documenting.
5. `expect.soft()` collects all failures per run — useful for maintenance audits where you want a complete picture.

## Going Deeper

- [Playwright docs: Locator best practices](https://playwright.dev/docs/locators)
- [Playwright docs: Test annotations](https://playwright.dev/docs/test-annotations)
- [Playwright docs: expect.soft()](https://playwright.dev/docs/test-assertions#soft-assertions)
- [Martin Fowler: Page Objects](https://martinfowler.com/bliki/PageObject.html)
