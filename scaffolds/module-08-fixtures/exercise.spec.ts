import { test as base, expect, type Page } from '@playwright/test';

// M08: Fixtures & Dependency Injection
//
// Fixtures are how Playwright provides test dependencies.
// They're created before the test and cleaned up after, even on failure.
// The key insight: fixtures compose. A fixture can depend on other fixtures.

// TODO 1: Define a custom fixture type that extends Playwright's base fixtures.
// Add a 'lumioHomePage' fixture that navigates to '/' before the test body runs.
// The fixture should expose the page after navigation.

type MyFixtures = {
  lumioHomePage: Page;
  // TODO 5: Add 'loggedInPage' fixture type here (returns a Page logged in as test user)
};

// TODO 2: Create the extended test using base.extend<MyFixtures>().
// Inside the 'lumioHomePage' fixture:
//   1. Navigate to '/'
//   2. Yield the page (use({ page }) makes the fixture value available to the test)
//   3. No teardown needed — the page is closed automatically by Playwright

export const test = base.extend<MyFixtures>({
  lumioHomePage: async ({ page }, use) => {
    // TODO 3: Navigate page to '/' and then yield it.
    await page.goto(/* TODO 3: '/' */);
    await use(/* TODO 3: page */);
    // No explicit teardown — base page fixture handles cleanup
  },

  // TODO 5: Add the loggedInPage fixture here.
  // It should: fill email + password on /login, click Sign in, wait for /dashboard,
  // then yield the page. Teardown: nothing (session is scoped to the context which
  // Playwright already cleans up).
  // loggedInPage: async ({ page }, use) => { ... },
});

export { expect };
