# M78: AI Test Code Generation (`playwright-test-generator`)

## Learning Objectives

- Understand how the `playwright-test-generator` agent translates a test plan into Playwright code
- Evaluate generated test code for robustness: locator quality, assertion coverage, and test independence
- Apply the critical evaluation skills needed to refine AI output before committing it to the codebase
- Recognize common AI code generation failure modes: brittle selectors, missing assertions, shared state

## Concept

AI test generators translate the structured plan from M77 into runnable Playwright code. They do this by replaying the recorded browser actions and generating locators and assertions for each step.

**Running the generator.**

```bash
npx playwright-test-generator --plan plan.json --output tests/generated/ --base-url http://localhost:3000
```

The generator reads `plan.json` (produced by the planner), opens a browser, navigates through each flow, and emits a `.spec.ts` file for each feature.

**What good generated code looks like.**

A generator produces code like this:

```typescript
test('creates a new task in the Todo column', async ({ page }) => {
  await page.goto('/projects/test-project');
  await page.getByRole('button', { name: 'New task' }).click();
  await page.getByLabel('Task title').fill('My generated task');
  await page.getByRole('button', { name: 'Create task' }).click();

  const todoColumn = page.getByRole('region', { name: /todo/i });
  await expect(todoColumn.getByText('My generated task')).toBeVisible();
});
```

This is good: semantic locators, a clear assertion on the correct element.

**Common failure modes in generated code.**

**1. Brittle CSS selectors.** The generator uses what it observes in the DOM, and sometimes that's a class name:

```typescript
// Generated — bad:
await page.locator('.btn-primary').click(); // breaks when CSS is refactored

// Should be:
await page.getByRole('button', { name: 'Create task' }).click();
```

**2. Missing assertions.** Generators focus on the action sequence and sometimes omit assertions:

```typescript
// Generated — missing assertion:
await page.getByRole('button', { name: 'Create task' }).click();
// No check that the task was actually created

// Should add:
await expect(page.getByText('My generated task')).toBeVisible();
```

**3. Shared state between tests.** The generator records one continuous session and may assume state from earlier tests:

```typescript
// Generated — bad: assumes the prior test created a task
test('edits existing task', async ({ page }) => {
  await page.getByText('Task from previous test').click(); // fails if run in isolation
});
```

Each test must navigate to and create its own test data.

**4. `page.waitForTimeout()` as a wait strategy.** Generators often record the tester pausing and emit a hardcoded wait:

```typescript
// Generated — bad:
await page.waitForTimeout(2000); // timing-dependent, flaky in slow environments

// Should be:
await page.waitForLoadState('networkidle');
// or:
await expect(modal).toBeVisible();
```

**The review checklist for AI-generated tests.**

Before committing generated tests, check each one for:

1. All locators use semantic selectors (`getByRole`, `getByLabel`, `getByText`) not CSS/XPath
2. Every action has a corresponding assertion
3. Each test starts from a known state (no dependency on previous test)
4. No `waitForTimeout` — replaced by auto-waiting assertions or load state waits
5. Test data is not shared between tests (use `beforeEach` or API setup)

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-78-ai-test-code-generation
```

## Key Takeaways

1. AI generators produce working but not production-quality tests — always review before committing.
2. The most common flaw is brittle CSS locators: replace with `getByRole`, `getByLabel`, `getByText`.
3. Missing assertions are invisible failures — a test that clicks but never checks learned nothing.
4. `waitForTimeout` in generated code is always a sign the generator observed a pause — replace with auto-wait.
5. Generated tests in a shared session need to be refactored to be independent before use in CI.

## Going Deeper

- [Playwright docs: Best practices — locators](https://playwright.dev/docs/best-practices#use-locators)
- [Playwright codegen](https://playwright.dev/docs/codegen)
- [Testing Trophy / Test isolation principles](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
