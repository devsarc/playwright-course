import { test, expect } from '../fixtures/fixtures';

// M74: Synthetic Monitoring Fundamentals
// A monitor is a Playwright test deployed to run on a schedule against production.
// The script is structurally identical to a test — only its operational context differs.

test.describe('M74 — Synthetic Monitoring Fundamentals', () => {

  // Test 1: Full login journey — the critical path monitor.
  // This is the canonical synthetic monitor: complete the journey and assert a time budget.
  test('login journey completes within the 5-second budget', async ({ page }) => {
    const start = Date.now();

    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    // TODO 1: Click the sign-in button using getByRole('button', { name: 'Sign in' }).
    await page.getByRole('button', { name: /* TODO 1: 'Sign in' */ 'PLACEHOLDER' }).click();

    await expect(page).toHaveURL(/dashboard/);

    const elapsed = Date.now() - start;
    // TODO 2: Assert elapsed is less than 5000ms (5-second journey budget).
    expect(elapsed).toBeLessThan(/* TODO 2: 5000 */ 0);
  });

  // Test 2: API health check — lightweight endpoint monitoring without a full page load.
  test('Lumio REST API health endpoint responds 200', async ({ request }) => {
    // Monitors can check API health without loading a browser page.
    // The request fixture is faster than page.goto() for pure HTTP checks.
    const response = await request.get('/api/health');

    // TODO 3: Assert the response status is 200.
    expect(response.status()).toBe(/* TODO 3: 200 */ 0);

    const body = await response.json();
    // TODO 4: Assert body.status equals 'ok'.
    expect(body.status).toBe(/* TODO 4: 'ok' */ 'PLACEHOLDER');
  });

  // Test 3: Performance budget via Navigation Timing API.
  test('dashboard TTFB stays within the 800ms budget', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);

    // Navigation Timing API gives precise server response timing.
    const timing = await page.evaluate(() =>
      JSON.parse(JSON.stringify(window.performance.getEntriesByType('navigation')[0]))
    );
    const ttfb = timing.responseStart - timing.fetchStart;

    // TODO 5: Assert ttfb is less than 800 (800ms TTFB budget for the dashboard).
    expect(ttfb).toBeLessThan(/* TODO 5: 800 */ 0);
  });

  // Test 4: Structured steps for interpretable alert messages.
  test('login journey with named steps for monitoring output', async ({ page }) => {
    // test.step() creates named checkpoints visible in reports and alerting platforms.
    // When a monitor fails, the step name becomes the alert message.
    await test.step('navigate to login page', () => page.goto('/login'));

    await test.step('fill credentials', async () => {
      await page.getByLabel('Email').fill('admin@lumio.test');
      await page.getByLabel('Password').fill('password123');
    });

    await test.step('submit login form', async () => {
      await page.getByRole('button', { name: 'Sign in' }).click();
      // TODO 6: Assert the URL matches /dashboard/ after login.
      await expect(page).toHaveURL(/* TODO 6: /dashboard/ */ /PLACEHOLDER/);
    });

    // TODO 7: Add a test.step named 'verify dashboard renders' that asserts
    //         the heading with name 'Dashboard' is visible.
    await test.step(/* TODO 7: 'verify dashboard renders' */ 'PLACEHOLDER', async () => {
      await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    });
  });

  // Test 5: Monitor detects auth failure — the monitor must distinguish failure types.
  test('login with wrong credentials shows an error message', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    // Intentionally wrong password to verify error handling is working.
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // A monitor that logs in with a wrong password and gets no error means auth is broken.
    // TODO 8: Assert the element with role 'alert' (error message) is visible.
    await expect(page.getByRole(/* TODO 8: 'alert' */ 'PLACEHOLDER')).toBeVisible();
  });

  // Test 6: Task creation journey — second-tier monitor for core product functionality.
  test('task creation journey completes successfully', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);

    await page.getByRole('button', { name: 'New task' }).click();
    // TODO 9: Fill the 'Task title' label input with the string 'Monitor test task'.
    await page.getByLabel('Task title').fill(/* TODO 9: 'Monitor test task' */ '');
    await page.getByRole('button', { name: 'Create task' }).click();

    await expect(page.getByText('Monitor test task')).toBeVisible();
  });

});
