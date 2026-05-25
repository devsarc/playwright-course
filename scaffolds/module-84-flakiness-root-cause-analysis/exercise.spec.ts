import { test, expect } from '../fixtures/fixtures';

// M84: Flakiness Root Cause Analysis
// Each test demonstrates a pattern that PREVENTS a specific flakiness category.
// Understanding the prevention helps you recognize the antipattern when you see it.

test.describe('M84 — Flakiness Root Cause Analysis', () => {

  // Test 1: Timing flakiness prevention — replace waitForTimeout with condition-based wait.
  // Antipattern: await page.waitForTimeout(2000); // breaks on slow CI
  // Fix: wait for the element's state directly.
  test('timing fix: condition-based wait instead of hardcoded timeout', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Timing antipattern: await page.waitForTimeout(2000); // flaky!
    // Correct: wait for the navigation signal — deterministic, no timing assumption.
    // TODO 1: Wait for the URL to contain 'dashboard' using waitForURL.
    await page.waitForURL(/* TODO 1: /dashboard/ */ /PLACEHOLDER/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  // Test 2: Data flakiness prevention — use unique test data to avoid conflicts in parallel runs.
  // Antipattern: hardcoded task name — two parallel tests create the same task, causing a 409 conflict.
  // Fix: append a unique suffix to test data.
  test('data fix: unique test data prevents parallel test conflicts', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);

    await page.goto('/projects/test-project');
    await page.getByRole('button', { name: 'New task' }).click();

    // Data antipattern: 'My task' — two parallel tests both try to create 'My task', causing conflicts.
    // Correct: unique suffix ensures no two tests share the same task name.
    // TODO 2: Use a unique task name by appending Date.now() to the string 'Unique task '.
    const uniqueTitle = /* TODO 2: `Unique task ${Date.now()}` */ 'My task';
    await page.getByLabel('Task title').fill(uniqueTitle);
    await page.getByRole('button', { name: 'Create task' }).click();
    await expect(page.getByText(uniqueTitle)).toBeVisible();
  });

  // Test 3: Selector flakiness prevention — use a specific scoped locator instead of index-based.
  // Antipattern: page.getByRole('button').nth(0) — the first button changes when UI is reordered.
  // Fix: use accessible name to uniquely identify the element.
  test('selector fix: use accessible name instead of positional nth()', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);

    await page.goto('/projects/test-project');

    // Selector antipattern: page.getByRole('button').nth(0) — breaks when a new button is added.
    // Correct: use the accessible name — stable regardless of DOM order.
    // TODO 3: Use getByRole('button', { name: 'New task' }) instead of a positional nth() locator.
    const createBtn = page.getByRole('button', { name: /* TODO 3: 'New task' */ 'PLACEHOLDER' });
    await expect(createBtn).toBeVisible();
  });

  // Test 4: Environment flakiness prevention — set explicit timeout for slow CI environments.
  // Antipattern: relying on the default test timeout (which may be too short in slow CI).
  // Fix: set explicit timeouts for tests that are legitimately slow.
  test('environment fix: explicit timeout accommodates slow CI environments', async ({ page }, testInfo) => {
    // Environment-sensitive tests need explicit timeouts — CI runners are often 2-3× slower.
    // TODO 4: Set the test timeout to 60000ms using testInfo.setTimeout().
    testInfo.setTimeout(/* TODO 4: 60000 */ 0); // 0ms timeout causes immediate failure

    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  // Test 5: Retry detection — use testInfo.retry to attach diagnostics on flaky reruns.
  test('retry awareness: attach diagnostic screenshot when a test is retried', async ({ page }, testInfo) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);

    // testInfo.retry is 0 on first run, 1 on first retry, 2 on second retry.
    // On retry, attach a screenshot for post-mortem analysis.
    if (testInfo.retry > 0) {
      await testInfo.attach('retry-state-screenshot', {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
    }

    // TODO 5: Assert testInfo.retry is less than 2 (should not need more than 1 retry).
    expect(testInfo.retry).toBeLessThan(/* TODO 5: 2 */ 0);
  });

  // Test 6: Network-based wait — use waitForResponse instead of waitForTimeout after form submit.
  // Antipattern: submit form, then waitForTimeout(1000) hoping the API call completes.
  // Fix: intercept the specific API call and wait for its response.
  test('network wait: waitForResponse replaces timeout after task creation', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);

    await page.goto('/projects/test-project');
    await page.getByRole('button', { name: 'New task' }).click();
    await page.getByLabel('Task title').fill('Network wait task');

    // Set up the response waiter BEFORE triggering the action.
    const responsePromise = page.waitForResponse(resp =>
      resp.url().includes('/api/tasks') && resp.status() === 201
    );

    await page.getByRole('button', { name: 'Create task' }).click();

    // TODO 6: Await the responsePromise to wait for the API call to complete.
    const response = await /* TODO 6: responsePromise */ Promise.resolve(null);
    expect(response).not.toBeNull();
  });

});
