// Lesson 01: Test Runner & Organization
// Combines former modules: M06 (Test Runner Fundamentals), M07 (Configuration
// Deep Dive), M08 (Fixtures & Dependency Injection), M09 (Global Setup &
// Teardown), M10 (Watch Mode & Developer Workflow), M11 (Retries & Flakiness
// Management).
//
// Each Part below is the original module's test.describe block, unchanged
// except TODO numbers are prefixed with the Part number to stay unique in
// this file (a TODO originally numbered N in the M09 module becomes TODO
// 4.N here, matching Part 4's prefix).
//
// Merge-only adaptation: Parts 2 and 3 originally imported `test`/`expect`
// directly from '@playwright/test' instead of the shared '../fixtures/fixtures'
// used by Parts 1, 4, 5, 6 (Part 2 for a different baseURL config — see its
// Concept section in README.md; Part 3 because it exports its own extended
// test/expect for its companion file). Merging all six into one file means
// only one plain `test`/`expect` binding can exist at module scope, so Part 2
// shadows local `test`/`expect` consts bound to `pw.test`/`pw.expect` inside
// its own describe callback, and Part 3 exports its extended test/expect
// under the names `part3Test`/`part3Expect`. No test logic changed — see each
// Part below for details.

import { test, expect } from '../fixtures/fixtures';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as pw from '@playwright/test';

test.describe('Part 1 — Test Runner Fundamentals (formerly M06)', () => {
  // M06: Test Runner Fundamentals
  //
  // describe blocks, lifecycle hooks, and test modifiers give you precise control
  // over what runs, when, and under what conditions.

  test.describe('Landing page smoke tests', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    // TODO 1.1: Add a test.afterEach that logs 'test finished' to the console.
    // afterEach runs after every test in this describe block, even on failure.
    /* TODO 1.1: test.afterEach(async () => { console.log('test finished'); }); */

    test('page loads', async ({ page }) => {
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('has pricing section', async ({ page }) => {
      await expect(page.getByTestId('pricing-card-free')).toBeVisible();
    });

    // TODO 1.2: Skip this test only on WebKit using test.skip with a condition.
    // Condition: browserName === 'webkit'. Reason: 'Date input behavior differs in WebKit'.
    test('skip on webkit example', async ({ page, browserName }) => {
      test.skip(/* TODO 1.2: browserName === 'webkit', 'Date input behavior differs in WebKit' */);
      await expect(page).toHaveURL('http://localhost:3000/');
    });

    // TODO 1.3: Mark this test as fixme — it documents a known bug to fix later.
    test('footer has social links', async ({ page }) => {
      test.fixme(/* TODO 1.3: true, 'Social links not yet implemented in footer' */);
      await expect(page.getByRole('link', { name: 'Twitter' })).toBeVisible();
    });
  });

  test.describe('Login page', () => {
    // TODO 1.4: Add a custom annotation to this describe block.
    // Use test.describe.configure() to annotate all tests with { tag: '@smoke' }.
    // This allows filtering: npx playwright test --grep @smoke

    test('login page loads @smoke', async ({ page }) => {
      // The @smoke annotation in the test name also enables --grep @smoke filtering
      await page.goto('/login');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('signup page loads @smoke', async ({ page }) => {
      await page.goto('/signup');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
  });
});

test.describe('Part 2 — Configuration Deep Dive (formerly M07)', () => {
  // M07: Configuration Deep Dive
  //
  // Run this module's tests with the local config:
  // npx playwright test tests/module-01-test-runner-organization --config=tests/module-01-test-runner-organization/playwright-part2-configuration.config.ts

  // Merge note: this Part originally imported `test`/`expect` directly from
  // '@playwright/test' (see this lesson's README, Part 2 Concept, for why).
  // Shadowed locally here so it doesn't collide with the `test`/`expect`
  // imported from '../fixtures/fixtures' used by the other Parts in this file.
  const test = pw.test;
  const expect = pw.expect;

  test('landing page loads on all configured browsers', async ({ page, browserName }) => {
    await page.goto('/');
    // TODO 2.4: Assert the heading is visible.
    // When this test runs across multiple projects (chromium, firefox, webkit),
    // Playwright runs it once per project. The browserName fixture tells you which one.
    await expect(page.getByRole('heading', { level: 1 }))/* TODO 2.4: toBeVisible() */;

    // TODO 2.5: Add a custom annotation recording which browser this ran on.
    // Use test.info().annotations.push({ type: 'browser', description: browserName }).
    test.info()/* TODO 2.5: annotations.push({ type: 'browser', description: browserName }) */;
  });

  test('mobile viewport renders hamburger menu', async ({ page, browserName }) => {
    // This test only makes sense on the mobile-chrome project (Pixel 5 device preset)
    // TODO 2.6: Skip this test unless the browserName is 'chromium' (mobile-chrome uses chromium).
    // Actually, use page.viewportSize() to check — skip if viewport width > 768px.
    const viewport = page.viewportSize();
    test.skip(/* TODO 2.6: (viewport?.width ?? 1280) > 768, 'Only meaningful on mobile viewports' */);

    await page.goto('/');
    const mobileMenuButton = page.getByRole('button', { name: 'Open mobile menu' });
    await expect(mobileMenuButton).toBeVisible();
  });
});

// Part 3 — Fixtures & Dependency Injection (formerly M08)
//
// M08: Fixtures & Dependency Injection
//
// Fixtures are how Playwright provides test dependencies.
// They're created before the test and cleaned up after, even on failure.
// The key insight: fixtures compose. A fixture can depend on other fixtures.
//
// Merge note: this Part has no test.describe block — the source module's
// exercise.spec.ts only defines the fixture; the test that uses it lives in
// the companion file exercise-part3-use.spec.ts (formerly exercise-use.spec.ts
// in module-08-fixtures), copied alongside this file. That companion file
// originally did `import { test, expect } from './exercise.spec'`; since the
// plain names `test`/`expect` are already taken (by the other Parts' shared
// import from '../fixtures/fixtures'), this Part exports its extended
// test/expect as `part3Test`/`part3Expect` instead, and the companion file's
// single import line is adjusted to alias them back to `test`/`expect` so its
// own test body is unchanged.
const base = pw.test;
type Page = pw.Page;

// TODO 3.1: Define a custom fixture type that extends Playwright's base fixtures.
// Add a 'lumioHomePage' fixture that navigates to '/' before the test body runs.
// The fixture should expose the page after navigation.

type MyFixtures = {
  lumioHomePage: Page;
  // TODO 3.5: Add 'loggedInPage' fixture type here (returns a Page logged in as test user)
};

// TODO 3.2: Create the extended test using base.extend<MyFixtures>().
// Inside the 'lumioHomePage' fixture:
//   1. Navigate to '/'
//   2. Yield the page (use({ page }) makes the fixture value available to the test)
//   3. No teardown needed — the page is closed automatically by Playwright

export const part3Test = base.extend<MyFixtures>({
  lumioHomePage: async ({ page }, use) => {
    // TODO 3.3: Navigate page to '/' and then yield it.
    await page.goto(/* TODO 3.3: '/' */);
    await use(/* TODO 3.3: page */);
    // No explicit teardown — base page fixture handles cleanup
  },

  // TODO 3.5: Add the loggedInPage fixture here.
  // It should: fill email + password on /login, click Sign in, wait for /dashboard,
  // then yield the page. Teardown: nothing (session is scoped to the context which
  // Playwright already cleans up).
  // loggedInPage: async ({ page }, use) => { ... },
});

export const part3Expect = pw.expect;

test.describe('Part 4 — Global Setup & Teardown (formerly M09)', () => {
  // M09: Global Setup & Teardown
  //
  // Run with the M09-specific config that points globalSetup to this module's setup file:
  // npx playwright test tests/module-01-test-runner-organization --config=tests/module-01-test-runner-organization/playwright-part4-global-setup.config.ts

  test('global setup wrote test state file', () => {
    // TODO 4.4: Read the .test-state.json file written by globalSetup.
    // Parse it and assert it has a 'workspaceId' property that is a non-empty string.
    const stateFile = join(__dirname, '.test-state.json');
    const state = JSON.parse(readFileSync(/* TODO 4.4: stateFile */ stateFile, 'utf-8'));

    expect(state.workspaceId).toBeTruthy();
    expect(typeof state.workspaceId).toBe('string');
  });

  test('test database has seeded project', async ({ request }) => {
    // TODO 4.5: Use the request fixture to GET /api/projects?workspaceId={id}.
    // First, read the workspaceId from .test-state.json (same as TODO 4.4).
    const state = JSON.parse(readFileSync(join(__dirname, '.test-state.json'), 'utf-8'));

    const response = await request.get(
      /* TODO 4.5: `/api/projects?workspaceId=${state.workspaceId}` */
    );

    // The API returns 401 because this test doesn't have auth — that's expected at this
    // point in the lesson (Part 4, formerly M09).
    // (Auth-aware testing is Lesson 02 (formerly M14) and Lesson 03 (formerly M16).)
    expect(response.status()).toBe(401);
  });
});

test.describe('Part 5 — Watch Mode & Developer Workflow (formerly M10)', () => {
  // M10: Watch Mode & Developer Workflow
  //
  // Run this module in watch mode:
  // npx playwright test tests/module-01-test-runner-organization --watch
  //
  // Watch mode re-runs tests when files change. The key workflow:
  // 1. Start watch mode
  // 2. Open exercise.spec.ts
  // 3. Complete a TODO
  // 4. Save — watch re-runs automatically
  // 5. See tests pass progressively

  test.describe('Login form validation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
    });

    test('login form has email and password fields @smoke', async ({ page }) => {
      // TODO 5.1: Assert the email input is visible.
      await expect(page.getByLabel('Email address'))/* TODO 5.1: toBeVisible() */;

      // TODO 5.2: Assert the password input is visible.
      await expect(page.getByLabel('Password'))/* TODO 5.2: toBeVisible() */;
    });

    test('login form has submit button @smoke', async ({ page }) => {
      // TODO 5.3: Assert the "Sign in" submit button is visible and enabled.
      const submitButton = page.getByRole('button', { name: 'Sign in' });
      await expect(submitButton)/* TODO 5.3: toBeVisible() */;
      await expect(submitButton)/* TODO 5.3b: toBeEnabled() */;
    });

    test('login form shows error on invalid credentials', async ({ page }) => {
      await page.getByLabel('Email address').fill('wrong@example.com');
      await page.getByLabel('Password').fill('wrongpassword');
      await page.getByRole('button', { name: 'Sign in' }).click();

      // TODO 5.4: Assert an error message appears.
      // The login page renders a <div role="alert"> when credentials are invalid.
      const errorAlert = page.getByRole('alert');
      await expect(errorAlert)/* TODO 5.4: toBeVisible() */;
      await expect(errorAlert).toContainText('Invalid');
    });
  });
});

test.describe('Part 6 — Retries & Flakiness Management (formerly M11)', () => {
  // M11: Retries & Flakiness Management
  //
  // Run this module with retries enabled:
  // npx playwright test tests/module-01-test-runner-organization --retries=2
  //
  // A retry re-runs the entire test from the beginning — not from the failed step.
  // The test must be idempotent: running it multiple times must produce the same result.

  test.describe('Signup form — potentially timing-sensitive', () => {
    test('signup form has success toast after submission', async ({ page }) => {
      // This test simulates a success toast that appears briefly after an action.
      // Timing-sensitive tests like this are a common source of flakiness.

      // TODO 6.1: Navigate to /signup and fill the form.
      await page.goto('/signup');
      await page.getByLabel('Full name').fill('Retry Test User');
      await page.getByLabel('Email address').fill(`retry-${Date.now()}@test.com`);
      await page.getByLabel('Password').fill('TestPassword123!');

      // TODO 6.2: Submit the form by clicking the "Create account" button.
      await page.getByRole('button', { name: 'Create account' })/* TODO 6.2: click() */;

      // TODO 6.3: Assert that after submission, the page navigated to /verify-email.
      // Use waitForURL — signup redirects to /verify-email on success.
      await page./* TODO 6.3: waitForURL(/verify-email/, { timeout: 10_000 }) */ evaluate(() => void 0);

      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('retry metadata: check retry count inside the test', async ({ page }) => {
      const retryCount = test.info().retry;

      // TODO 6.4: Log the current retry count and skip setup steps if this is a retry.
      // Real use case: on first run, create test data; on retry, skip creation
      // because the data may already exist from the first run.
      console.log(`Running on attempt ${retryCount + 1}`);

      // TODO 6.5: Assert the retry count is a non-negative number.
      // This just verifies the API — in real tests you'd use this to branch logic.
      expect(retryCount)/* TODO 6.5: toBeGreaterThanOrEqual(0) */;
    });
  });
});
