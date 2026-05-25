import { test, expect } from '../fixtures/fixtures';

// M39: Sharding for Large Suites
//
// This module is primarily configuration-focused. The spec below verifies
// that the CI-relevant Playwright features work: sharding, retries, and
// artifact collection. Understanding these features makes the .yml file
// in Step 5 meaningful rather than boilerplate.

test.describe('CI smoke — board critical path', () => {
  // These tests represent the "must-pass" subset run in every CI pipeline.
  // They are tagged with @smoke so they can be selected with --grep @smoke.
  // In CI: npx playwright test --grep @smoke --workers=4

  test('landing page loads @smoke', async ({ page }) => {
    // TODO 1: Navigate to / and assert the main heading is visible.
    // This is the simplest possible smoke test — if it fails, the server is down.
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 }))/* TODO 1: toBeVisible() */;
  });

  test('authenticated user reaches the board @smoke', async ({ page }) => {
    // TODO 2: Navigate to /projects/demo/board and assert all three kanban
    // columns are visible. This verifies auth, DB connection, and board rendering.
    await page.goto('/projects/demo/board');
    await expect(page.getByTestId('kanban-column-todo')).toBeVisible();
    await expect(page.getByTestId('kanban-column-in-progress'))/* TODO 2: toBeVisible() */;
    await expect(page.getByTestId('kanban-column-done'))/* TODO 2: toBeVisible() */;
  });
});

test.describe('Retry behaviour', () => {
  test('flaky test succeeds on retry', async ({ page }, testInfo) => {
    // TODO 3: Use testInfo.retry to assert this test passes on the second attempt.
    // testInfo.retry is 0 on the first run, 1 on the first retry, etc.
    // This test deliberately fails on attempt 0 to demonstrate the retry mechanism.
    // In playwright.config.ts set retries: 2 for CI.
    if (testInfo.retry === 0) {
      // First attempt: force a failure to demonstrate retry
      expect(testInfo.retry).toBe(/* TODO 3: 1 */ 99); // always fails on retry 0
    }
    // On retry 1+: passes normally
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

test.describe('Sharding awareness', () => {
  test('shard index is available via env @smoke', async ({}) => {
    // TODO 4: Read process.env.CI and assert it is defined when running in CI.
    // When running locally this test is skipped via test.skip.
    // In CI, PLAYWRIGHT_SHARD_INDEX is set by the --shard flag.
    test.skip(!process.env.CI, 'shard env vars only exist in CI');
    expect(process.env.CI).toBeDefined();
  });
});
