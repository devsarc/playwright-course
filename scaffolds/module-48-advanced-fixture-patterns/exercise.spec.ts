import { test as base, expect, Browser, BrowserContext, Page } from '@playwright/test';

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
    // TODO 1: Create a new browser context using browser.newContext().
    // Why? A fresh context has no cookies, storage, or auth state — guaranteeing isolation
    // even if another test in the same worker left state behind.
    const context = await browser.newContext(/* TODO 1: {} */);

    // TODO 2: Call use(context) to hand the context to the test.
    // Code after this line runs as teardown, after the test completes.
    await use(/* TODO 2: context */);

    // TODO 3: Close the context in teardown.
    // Why? Playwright guarantees this teardown runs even if the test fails —
    // unlike afterEach, which can be skipped when a hook itself throws.
    await context/* TODO 3: .close() */;
  },

  // Fixture 2: isolatedPage
  // Depends on isolatedContext — demonstrates fixture composition.
  // Playwright resolves the dependency automatically.
  isolatedPage: async ({ isolatedContext }, use) => {
    // TODO 4: Create a new page from isolatedContext.
    // Why? Composing isolatedPage from isolatedContext means changing context behavior
    // (e.g., adding storageState for auth) only requires updating isolatedContext —
    // isolatedPage automatically inherits the change.
    const page = await isolatedContext.newPage(/* TODO 4: */);
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

    // TODO 5: Call use(data) to provide the task data to the test.
    await use(/* TODO 5: data */);

    // Teardown: in a real fixture, delete the created record from the database here.
    // For this exercise, the data is in-memory only — no cleanup needed.
  },

});

// ─── Tests ───────────────────────────────────────────────────────────────────

test.describe('M48 — Advanced Fixture Patterns', () => {

  // Test 1: Use the isolatedContext fixture
  // Verifies the context was created fresh (no existing pages on creation).
  test('isolatedContext creates a clean browser context', async ({ isolatedContext }) => {
    // TODO 6: Assert that isolatedContext.pages() has length 0.
    // Why? A brand-new context has no pages yet — this confirms the fixture
    // created a fresh context rather than reusing an existing one.
    expect(isolatedContext.pages()).toHaveLength(/* TODO 6: 0 */);
  });

  // Test 2: Use the composed isolatedPage fixture
  // Tests can use isolatedPage directly without knowing it depends on isolatedContext.
  test('isolatedPage navigates to dashboard', async ({ isolatedPage }) => {
    // TODO 7: Navigate isolatedPage to '/dashboard' and assert the URL.
    // Why? This confirms the composed fixture produces a working page — fixture composition
    // is only useful if the resulting page behaves correctly.
    await isolatedPage.goto(/* TODO 7: '/dashboard' */);
    await expect(isolatedPage).toHaveURL('/dashboard');
  });

  // Test 3: Use the taskData fixture
  // Fixtures can provide plain objects, not just browser primitives.
  test('taskData fixture provides test data', async ({ taskData }) => {
    // TODO 8: Assert that taskData.title is a non-empty string.
    // Why? The fixture generates a unique title — confirming it's a string (not undefined)
    // is the basic health check for a data fixture.
    expect(typeof taskData.title).toBe(/* TODO 8: 'string' */);
    expect(taskData.title.length).toBeGreaterThan(0);
  });

  // Test 4: Combine isolatedPage and taskData in one test
  // Fixture composition in the test body — both fixtures initialize independently.
  test('use multiple fixtures together', async ({ isolatedPage, taskData }) => {
    await isolatedPage.goto('/dashboard');

    // TODO 9: Assert that taskData.column equals 'todo'.
    // Why? The fixture specifies which column the task belongs to —
    // confirming this value before using it in further UI interactions prevents
    // a silent bug where the task appears in the wrong column.
    expect(taskData.column).toBe(/* TODO 9: 'todo' */);

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

    // TODO 10: Assert that both arrays have length greater than 0.
    // Why? This confirms you've read the scope decision criteria above —
    // choosing the wrong scope is the most common advanced fixture mistake.
    expect(workerScopedUseCases.length).toBeGreaterThan(/* TODO 10: 0 */);
    expect(testScopedUseCases.length).toBeGreaterThan(0);
  });

});
