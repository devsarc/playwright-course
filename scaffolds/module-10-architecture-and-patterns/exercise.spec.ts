// Lesson 10: Test Architecture & Design Patterns
// Combines former modules: M47 (Page Object Model), M48 (Advanced Fixture
// Patterns), M49 (Data-Driven Testing), M50 (Test Organization & Suite
// Architecture).
//
// Each Part below is the original module's test.describe block, unchanged
// except TODO numbers are prefixed with the Part number to stay unique in
// this file (a TODO originally numbered N in the M48 module becomes TODO
// 2.N here, matching Part 2's prefix).

import { test, expect } from '../fixtures/fixtures';
import { test as base, Browser, BrowserContext, Page } from '@playwright/test';
import { KanbanPage } from './pages/KanbanPage';

const PROJECT_ID = 'demo'; // seed data project id

test.describe('Part 1 — Page Object Model (formerly M47)', () => {
  // M47: Page Object Model
  //
  // Good POMs: thin wrappers that hide selectors, not business-logic layers.
  // They return Locators (not element handles) so callers still get auto-waiting.
  // Keep assertion logic in the spec — not in the POM — so failures are readable.

  let kanban: KanbanPage;

  test.beforeEach(async ({ page }) => {
    // TODO 1.7: Instantiate KanbanPage and call goto(PROJECT_ID).
    // POMs are just plain classes — they don't need special registration.
    /* TODO 1.7 */
  });

  test('displays three columns', async ({ page }) => {
    // TODO 1.8: Use the POM locators (kanban.todoColumn, etc.) to assert that
    // all three columns are visible.
    await expect(/* TODO 1.8: kanban.todoColumn */).toBeVisible();
    await expect(/* TODO 1.8 */).toBeVisible();
    await expect(/* TODO 1.8 */).toBeVisible();
  });

  test('addCard() creates a card in the To Do column', async ({ page }) => {
    const title = 'POM test card';
    // TODO 1.9: Call kanban.addCard(title) and assert the returned Locator
    // is visible inside kanban.todoColumn.
    // Hint: use kanban.todoColumn.locator(cardLocator) to scope the assertion.
    const card = await kanban.addCard(/* TODO 1.9: title */);
    await expect(/* TODO 1.9 */).toBeVisible();
  });

  test('cardCount() returns correct number for a column', async ({ page }) => {
    // TODO 1.10: Call kanban.cardCount(kanban.todoColumn) and assert it is
    // greater than or equal to 0. Then add a card and assert the count increases by 1.
    const before = await kanban.cardCount(/* TODO 1.10 */);
    await kanban.addCard('count test');
    const after = await kanban.cardCount(/* TODO 1.10 */);
    expect(after).toBe(/* TODO 1.10: before + 1 */);
  });
});

test.describe('Part 2 — Advanced Fixture Patterns (formerly M48)', () => {
  // M48: Advanced Fixture Patterns
  //
  // This module builds fixtures incrementally. Each test uses a progressively
  // more sophisticated fixture. Read each fixture definition before its test.

  // ─── Fixture type declarations ───────────────────────────────────────────────

  type Fixtures = {
    isolatedContext: BrowserContext;
    isolatedPage: Page;
    taskData: { title: string; column: string };
  };

  // ─── Extended test with custom fixtures ──────────────────────────────────────

  const test = base.extend<Fixtures>({

    // Fixture 1: isolatedContext
    // Creates a fresh browser context for the test, closes it after.
    // The generator pattern: setup → use() → teardown.
    isolatedContext: async ({ browser }, use) => {
      // TODO 2.1: Create a new browser context using browser.newContext().
      // Why? A fresh context has no cookies, storage, or auth state — guaranteeing isolation
      // even if another test in the same worker left state behind.
      const context = await browser.newContext(/* TODO 2.1: {} */);

      // TODO 2.2: Call use(context) to hand the context to the test.
      // Code after this line runs as teardown, after the test completes.
      await use(/* TODO 2.2: context */);

      // TODO 2.3: Close the context in teardown.
      // Why? Playwright guarantees this teardown runs even if the test fails —
      // unlike afterEach, which can be skipped when a hook itself throws.
      await context/* TODO 2.3: .close() */;
    },

    // Fixture 2: isolatedPage
    // Depends on isolatedContext — demonstrates fixture composition.
    // Playwright resolves the dependency automatically.
    isolatedPage: async ({ isolatedContext }, use) => {
      // TODO 2.4: Create a new page from isolatedContext.
      // Why? Composing isolatedPage from isolatedContext means changing context behavior
      // (e.g., adding storageState for auth) only requires updating isolatedContext —
      // isolatedPage automatically inherits the change.
      const page = await isolatedContext.newPage(/* TODO 2.4: */);
      await use(page);
      // No explicit close needed — isolatedContext teardown closes all its pages.
    },

    // Fixture 3: taskData
    // Provides test data as a plain object.
    // In a real project this would call an API to seed the database.
    taskData: async ({}, use) => {
      const data = {
        title: `Fixture task ${Date.now()}`,
        column: 'todo',
      };

      // TODO 2.5: Call use(data) to provide the task data to the test.
      await use(/* TODO 2.5: data */);

      // Teardown: in a real fixture, delete the created record from the database here.
      // For this exercise, the data is in-memory only — no cleanup needed.
    },

  });

  // ─── Tests ───────────────────────────────────────────────────────────────────

  // Test 1: Use the isolatedContext fixture
  // Verifies the context was created fresh (no existing pages on creation).
  test('isolatedContext creates a clean browser context', async ({ isolatedContext }) => {
    // TODO 2.6: Assert that isolatedContext.pages() has length 0.
    // Why? A brand-new context has no pages yet — this confirms the fixture
    // created a fresh context rather than reusing an existing one.
    expect(isolatedContext.pages()).toHaveLength(/* TODO 2.6: 0 */);
  });

  // Test 2: Use the composed isolatedPage fixture
  // Tests can use isolatedPage directly without knowing it depends on isolatedContext.
  test('isolatedPage navigates to dashboard', async ({ isolatedPage }) => {
    // TODO 2.7: Navigate isolatedPage to '/dashboard' and assert the URL.
    // Why? This confirms the composed fixture produces a working page — fixture composition
    // is only useful if the resulting page behaves correctly.
    await isolatedPage.goto(/* TODO 2.7: '/dashboard' */);
    await expect(isolatedPage).toHaveURL('/dashboard');
  });

  // Test 3: Use the taskData fixture
  // Fixtures can provide plain objects, not just browser primitives.
  test('taskData fixture provides test data', async ({ taskData }) => {
    // TODO 2.8: Assert that taskData.title is a non-empty string.
    // Why? The fixture generates a unique title — confirming it's a string (not undefined)
    // is the basic health check for a data fixture.
    expect(typeof taskData.title).toBe(/* TODO 2.8: 'string' */);
    expect(taskData.title.length).toBeGreaterThan(0);
  });

  // Test 4: Combine isolatedPage and taskData in one test
  // Fixture composition in the test body — both fixtures initialize independently.
  test('use multiple fixtures together', async ({ isolatedPage, taskData }) => {
    await isolatedPage.goto('/dashboard');

    // TODO 2.9: Assert that taskData.column equals 'todo'.
    // Why? The fixture specifies which column the task belongs to —
    // confirming this value before using it in further UI interactions prevents
    // a silent bug where the task appears in the wrong column.
    expect(taskData.column).toBe(/* TODO 2.9: 'todo' */);

    // The full pattern in a real test: use taskData.title to locate the pre-seeded task
    // card after the API fixture has created it, avoiding UI-based task creation.
    expect(isolatedPage.url()).toContain('/dashboard');
  });

  // Test 5: Understand fixture scope — reading config
  // This test is conceptual — it documents the scope decision via assertions on values.
  test('fixture scope determines when setup and teardown run', async ({}) => {
    // Worker-scoped fixture: one instance per worker, shared across tests.
    // Test-scoped fixture: one instance per test, reset between every test.

    const workerScopedUseCases = [
      'Shared authentication state (login once per worker)',
      'Expensive external service connections',
      'Read-only database snapshots',
    ];

    const testScopedUseCases = [
      'Anything that writes to the database',
      'Browser contexts with stored cookies',
      'Pre-seeded data that must be cleaned up',
    ];

    // TODO 2.10: Assert that both arrays have length greater than 0.
    // Why? This confirms you've read the scope decision criteria above —
    // choosing the wrong scope is the most common advanced fixture mistake.
    expect(workerScopedUseCases.length).toBeGreaterThan(/* TODO 2.10: 0 */);
    expect(testScopedUseCases.length).toBeGreaterThan(0);
  });

});

// ─── Inline data ──────────────────────────────────────────────────────────────

const validationCases = [
  { input: '',    errorExpected: true,  description: 'empty title' },
  { input: ' ',   errorExpected: true,  description: 'whitespace only title' },
  { input: 'A',   errorExpected: false, description: 'single character title' },
  { input: 'Buy groceries', errorExpected: false, description: 'normal title' },
];

// ─── External data ────────────────────────────────────────────────────────────

// TODO 3.1: Import the task-data.json file.
// Use a relative require() or import statement to load it as an array.
// Why? Keeping large datasets in JSON files decouples data from test logic —
// a QA engineer can add new test cases by editing JSON, not TypeScript.
const taskDataPath = require(/* TODO 3.1: './task-data.json' */);

test.describe('Part 3 — Data-Driven Testing (formerly M49)', () => {
  // M49: Data-Driven Testing
  //
  // This module demonstrates generating multiple test cases from a data array.
  // Each loop iteration produces one test with its own pass/fail result in the report.

  // Test group 1: Inline data loop — form validation cases
  // Each iteration generates one test. Failures identify the specific case.
  test.describe('form validation across input cases', () => {

    // TODO 3.2: Loop over validationCases and create one test per case.
    // Name each test using the case's description field:
    //   test(`validates: ${description}`, ...)
    // Why? Including the discriminating field in the test name means a failure report
    // says "validates: empty title" not just "validates" — instantly actionable.
    for (const { input, errorExpected, description } of validationCases) {
      test(`validates: ${/* TODO 3.2: description */ ''}`, async ({ page }) => {
        await page.goto('/dashboard');
        await page.getByRole('button', { name: 'Add task' }).first().click();
        await expect(page.getByRole('dialog')).toBeVisible();

        await page.getByTestId('task-title-input').fill(input);
        await page.getByTestId('task-submit').click();

        if (errorExpected) {
          // Invalid input: dialog should stay open (form rejected the submission).
          // TODO 3.3: Assert that the dialog is still visible.
          await expect(page.getByRole('dialog'))./* TODO 3.3: toBeVisible() */ toBeHidden();
        } else {
          // Valid input: dialog should close.
          // TODO 3.4: Assert that the dialog is not visible.
          await expect(page.getByRole('dialog'))./* TODO 3.4: not.toBeVisible() */ toBeVisible();
        }
      });
    }
  });

  // Test group 2: External JSON data — task creation cases
  // Loaded from task-data.json — demonstrates separating data from code.
  test.describe('task creation with external data', () => {

    // TODO 3.5: Loop over taskDataPath (the imported JSON array) and create one test per entry.
    // Name each test: `creates task: "${title}" (${priority} priority)`
    // Why? The title and priority together identify which combination failed —
    // "creates task: Fix login bug (high priority)" is far more useful than "creates task 3".
    for (const { title, priority } of taskDataPath /* TODO 3.5: */) {
      test(`creates task: "${/* TODO 3.5: title */'PLACEHOLDER'}" (${/* TODO 3.5: priority */'PLACEHOLDER'} priority)`, async ({ page }) => {
        await page.goto('/dashboard');

        // Open the task creation dialog.
        await page.getByRole('button', { name: 'Add task' }).first().click();
        await expect(page.getByRole('dialog')).toBeVisible();

        // Fill in the task title.
        // TODO 3.6: Fill the task title input with the 'title' variable from the loop.
        await page.getByTestId('task-title-input').fill(/* TODO 3.6: title */);

        // Submit the form.
        await page.getByTestId('task-submit').click();
        await expect(page.getByRole('dialog')).not.toBeVisible();

        // Verify the task card appeared on the board.
        // TODO 3.7: Assert that the task card with the loop's title text is visible.
        await expect(
          page.getByTestId('task-card').filter({ hasText: /* TODO 3.7: title */ 'PLACEHOLDER' })
        ).toBeVisible();
      });
    }
  });

  // Test group 3: Understanding when NOT to use data-driven tests
  test('data-driven is wrong when scenarios differ meaningfully', async ({}) => {
    // These three scenarios look like "login" cases but are actually different tests:
    // - Valid credentials → dashboard redirect
    // - Wrong password → error message shown
    // - Locked account → locked message shown
    //
    // A data loop would hide the fact that each scenario has a different expected outcome
    // and possibly different assertions. Each should be a separate named test.
    //
    // TODO 3.8: Set this to true once you understand the distinction.
    // Why? Knowing when NOT to use a pattern is as important as knowing how to use it.
    const understoodWhenToAvoidDataDriven = /* TODO 3.8: true */ false;
    expect(understoodWhenToAvoidDataDriven).toBe(true);
  });

  // Test group 4: Verify the external data file is valid
  // A meta-test that guards against corrupted or empty data files.
  test('task-data.json contains at least one entry', async ({}) => {
    // TODO 3.9: Assert that taskDataPath is an Array.
    expect(Array.isArray(/* TODO 3.9: taskDataPath */)).toBe(true);

    // TODO 3.10: Assert that taskDataPath has length greater than 0.
    // Why? If the JSON file is accidentally emptied, all generated tests silently disappear
    // instead of failing — this guard makes the gap visible.
    expect(taskDataPath.length).toBeGreaterThan(/* TODO 3.10: 0 */);
  });

});

test.describe('Part 4 — Test Organization & Suite Architecture (formerly M50)', () => {
  // M50: Test Organization & Suite Architecture
  //
  // This module demonstrates tagging, fixme, and suite configuration.
  // Run specific tags:
  //   npx playwright test tests/module-10-architecture-and-patterns --grep @smoke
  //   npx playwright test tests/module-10-architecture-and-patterns --grep @regression

  // ─── Smoke tests ────────────────────────────────────────────────────────────
  // @smoke tests must be fast (<5s each) and cover the critical path only.

  // TODO 4.1: Add '@smoke' to this test name so it can be filtered with --grep @smoke.
  // Why? Smoke tests run on every commit — they need to be identifiable separately
  // from the full regression suite. Tagging by name requires no configuration.
  test('dashboard loads @smoke', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
  });

  // TODO 4.2: Add '@smoke' to this test name.
  test('Add task button is present @smoke', async ({ page }) => {
    await page.goto('/dashboard');

    // TODO 4.2: Assert that the 'Add task' button is visible.
    await expect(page.getByRole('button', { name: 'Add task' }).first())./* TODO 4.2: toBeVisible() */ toBeAttached();
  });

  // ─── Regression tests ───────────────────────────────────────────────────────
  // @regression tests cover broader scenarios. Run before releases.

  // TODO 4.3: Add '@regression' to this test name.
  test('task creation dialog opens and closes @regression', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Add task' }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // TODO 4.3: Close the dialog — press Escape — and assert it is no longer visible.
    await page.keyboard.press(/* TODO 4.3: 'Escape' */);
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('task creation full flow @regression', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Add task' }).first().click();
    await page.getByTestId('task-title-input').fill('Organization test task');
    await page.getByTestId('task-submit').click();
    await expect(
      page.getByTestId('task-card').filter({ hasText: 'Organization test task' })
    ).toBeVisible();
  });

  // ─── Accessibility tests ─────────────────────────────────────────────────────
  // @accessibility tests verify the app is usable with assistive technology.

  // TODO 4.4: Add '@accessibility' to this test name.
  test('kanban board has accessible column headings @accessibility', async ({ page }) => {
    await page.goto('/dashboard');

    // TODO 4.4: Assert that the 'To Do' heading is visible using getByRole.
    const todoHeading = page.getByRole(/* TODO 4.4: 'heading', { name: 'To Do' } */);
    await expect(todoHeading).toBeVisible();
  });

  // ─── Using test.fixme() ──────────────────────────────────────────────────────
  // test.fixme() marks a known failure without deleting the test.
  // The test appears as skipped in reports with a reason — tracked, not forgotten.

  // TODO 4.5: Use test.fixme() to mark this test as a known failure.
  // Add a bug reference: test.fixme(true, 'LUM-9999: task drag-and-drop intermittently fails')
  // Why? Deleting the test loses the signal that the behavior is untested.
  // fixme() keeps the test visible in reports while the bug is open.
  test('task drag-and-drop @regression', async ({ page }) => {
    // TODO 4.5: Add test.fixme() call here with a bug reference.
    test.fixme(/* TODO 4.5: true, 'LUM-9999: task drag-and-drop intermittently fails' */);

    // This test body would normally test drag-and-drop behavior.
    // With fixme() active, it never executes.
    await page.goto('/dashboard');
  });

  // ─── Understanding test.skip() vs test.fixme() ──────────────────────────────

  test('distinguishes skip from fixme @smoke', async ({}) => {
    // test.skip() — "this test doesn't apply right now" (platform, feature flag, etc.)
    // test.fixme() — "this test is broken and we know it" (open bug, tracked)

    // TODO 4.6: Set the correct value for each variable.
    // Which one means "broken behavior tracked by a bug"?
    const brokenWithBug = /* TODO 4.6: 'fixme' */ '';
    // Which one means "not applicable in this environment"?
    const notApplicable = /* TODO 4.6: 'skip' */ '';

    expect(brokenWithBug).toBe('fixme');
    expect(notApplicable).toBe('skip');
  });

  // ─── Suite configuration ─────────────────────────────────────────────────────

  // test.describe.configure() sets mode/retries/timeout for a describe block.
  // This is better than duplicating config on individual tests.
  test.describe('slow integration suite', () => {
    // TODO 4.7: Call test.describe.configure() with timeout: 60_000.
    // Why? These tests call external services and need more time — setting the timeout
    // at the describe level applies it to all tests inside without repeating it.
    test.describe.configure(/* TODO 4.7: { timeout: 60_000 } */);

    test('slow test placeholder @regression', async ({ page }) => {
      await page.goto('/dashboard');
      // A real slow test would call an external API or wait for WebSocket messages.
      await expect(page).toHaveURL('/dashboard');
    });
  });

  // ─── Tag filtering awareness ──────────────────────────────────────────────────

  test('understands grep filtering @smoke', async ({}) => {
    // Run only smoke: npx playwright test --grep @smoke
    // Run only regression: npx playwright test --grep @regression
    // Combine: npx playwright test --grep "@smoke|@regression"
    // Exclude: npx playwright test --grep-invert @slow

    // TODO 4.8: Set to true once you've verified that --grep @smoke skips the @regression tests.
    // Why? Understanding tag filtering is what makes the tagging strategy actually useful —
    // if you can't filter by tag, the tags are just decorative text.
    const greppingUnderstood = /* TODO 4.8: true */ false;
    expect(greppingUnderstood).toBe(true);
  });

});
