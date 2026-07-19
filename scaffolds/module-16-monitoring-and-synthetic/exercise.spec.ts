// Lesson 16: Synthetic Monitoring & Scheduled Bots
// Combines former modules: M74 (Synthetic Monitoring Fundamentals), M75 (Scheduled Bots & Cron Tasks), M76 (Uptime & Performance Monitoring)
//
// Each Part below is the original module's test.describe block, unchanged
// except TODO numbers are prefixed with the Part number to stay unique in
// this file (a TODO originally numbered N in the M76 module becomes TODO
// 3.N here, matching Part 3's prefix).

import { test, expect } from '../fixtures/fixtures';

test.describe('Part 1 — Synthetic Monitoring Fundamentals (formerly M74)', () => {

  // Test 1: Full login journey — the critical path monitor.
  // This is the canonical synthetic monitor: complete the journey and assert a time budget.
  test('login journey completes within the 5-second budget', async ({ page }) => {
    const start = Date.now();

    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    // TODO 1.1: Click the sign-in button using getByRole('button', { name: 'Sign in' }).
    await page.getByRole('button', { name: /* TODO 1.1: 'Sign in' */ 'PLACEHOLDER' }).click();

    await expect(page).toHaveURL(/dashboard/);

    const elapsed = Date.now() - start;
    // TODO 1.2: Assert elapsed is less than 5000ms (5-second journey budget).
    expect(elapsed).toBeLessThan(/* TODO 1.2: 5000 */ 0);
  });

  // Test 2: API health check — lightweight endpoint monitoring without a full page load.
  test('Lumio REST API health endpoint responds 200', async ({ request }) => {
    // Monitors can check API health without loading a browser page.
    // The request fixture is faster than page.goto() for pure HTTP checks.
    const response = await request.get('/api/health');

    // TODO 1.3: Assert the response status is 200.
    expect(response.status()).toBe(/* TODO 1.3: 200 */ 0);

    const body = await response.json();
    // TODO 1.4: Assert body.status equals 'ok'.
    expect(body.status).toBe(/* TODO 1.4: 'ok' */ 'PLACEHOLDER');
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

    // TODO 1.5: Assert ttfb is less than 800 (800ms TTFB budget for the dashboard).
    expect(ttfb).toBeLessThan(/* TODO 1.5: 800 */ 0);
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
      // TODO 1.6: Assert the URL matches /dashboard/ after login.
      await expect(page).toHaveURL(/* TODO 1.6: /dashboard/ */ /PLACEHOLDER/);
    });

    // TODO 1.7: Add a test.step named 'verify dashboard renders' that asserts
    //           the heading with name 'Dashboard' is visible.
    await test.step(/* TODO 1.7: 'verify dashboard renders' */ 'PLACEHOLDER', async () => {
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
    // TODO 1.8: Assert the element with role 'alert' (error message) is visible.
    await expect(page.getByRole(/* TODO 1.8: 'alert' */ 'PLACEHOLDER')).toBeVisible();
  });

  // Test 6: Task creation journey — second-tier monitor for core product functionality.
  test('task creation journey completes successfully', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);

    await page.getByRole('button', { name: 'New task' }).click();
    // TODO 1.9: Fill the 'Task title' label input with the string 'Monitor test task'.
    await page.getByLabel('Task title').fill(/* TODO 1.9: 'Monitor test task' */ '');
    await page.getByRole('button', { name: 'Create task' }).click();

    await expect(page.getByText('Monitor test task')).toBeVisible();
  });

});

test.describe('Part 2 — Scheduled Bots & Cron Tasks (formerly M75)', () => {

  // Test 1: Login health check — the core cron job payload.
  // This test represents what runs every 15 minutes in the monitoring workflow.
  test('login health check passes with valid credentials', async ({ page }) => {
    // In production monitoring, credentials come from environment variables.
    // Process.env falls back to the test fixture credentials in CI.
    const email = process.env.MONITOR_EMAIL ?? 'admin@lumio.test';
    const password = process.env.MONITOR_PASSWORD ?? 'password123';

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    // TODO 2.1: Fill the password field using the 'password' variable.
    await page.getByLabel('Password').fill(/* TODO 2.1: password */ '');

    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  // Test 2: Bot reads data from the page and emits structured output.
  // A data collection bot scrapes metrics and logs them as structured JSON.
  test('bot collects and emits user count from the admin panel', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Read the total user count from the pagination status element.
    const statusText = await page.getByTestId('pagination-status').textContent();
    // statusText format: "1–10 of 15 users" — parse the total from the text.
    const match = statusText?.match(/of (\d+)/);

    // TODO 2.2: Assert that match is not null (the pattern matched).
    expect(match)./* TODO 2.2: not.toBeNull() */ toBeNull();

    const total = parseInt(match![1], 10);
    // Emit structured output — in a real bot this would POST to a metrics endpoint.
    console.log(JSON.stringify({ metric: 'user_count', value: total, ts: Date.now() }));

    // TODO 2.3: Assert total is greater than 0 (at least one user exists).
    expect(total).toBeGreaterThan(/* TODO 2.3: 0 */ -1);
  });

  // Test 3: Cron job idempotency — running the same monitor twice does not create duplicate state.
  test('login monitor is idempotent — running it twice has no side effects', async ({ page }) => {
    // Monitors run on a schedule — they must not leave state that breaks the next run.
    // A monitor that creates data on every run eventually fills the database.
    for (let i = 0; i < 2; i++) {
      await page.goto('/login');
      await page.getByLabel('Email').fill('admin@lumio.test');
      await page.getByLabel('Password').fill('password123');
      await page.getByRole('button', { name: 'Sign in' }).click();
      await expect(page).toHaveURL(/dashboard/);

      // TODO 2.4: Navigate back to '/login' to reset the state for the next iteration.
      await page.goto(/* TODO 2.4: '/login' */ '/PLACEHOLDER');
      // Each iteration must start from the login page — no shared state.
    }

    // If we reach here without error, the monitor is idempotent.
    expect(true).toBe(true);
  });

  // Test 4: Bot handles missing data gracefully — monitors must not crash on partial data.
  test('monitor degrades gracefully when optional data is missing', async ({ page, request }) => {
    // Health checks must distinguish "completely broken" from "partially degraded."
    // Test that the API can report its own health even when the app has issues.
    const response = await request.get('/api/health');

    // TODO 2.5: Assert response status is 200.
    expect(response.status()).toBe(/* TODO 2.5: 200 */ 0);

    const body = await response.json();
    // The health endpoint must always return a 'status' field — even under degradation.
    // TODO 2.6: Assert that body has a 'status' property using expect(body).toHaveProperty().
    expect(body).toHaveProperty(/* TODO 2.6: 'status' */ 'PLACEHOLDER');
  });

  // Test 5: Structured failure output — the monitor's error message maps to a Slack alert.
  test('monitor emits a structured result for alerting integration', async ({ page }) => {
    const result: { status: string; step?: string; error?: string } = { status: 'ok' };

    try {
      await test.step('navigate to login', () => page.goto('/login'));
      await test.step('submit credentials', async () => {
        await page.getByLabel('Email').fill('admin@lumio.test');
        await page.getByLabel('Password').fill('password123');
        await page.getByRole('button', { name: 'Sign in' }).click();
        await expect(page).toHaveURL(/dashboard/);
      });
    } catch (e: any) {
      result.status = 'error';
      result.error = e.message;
    }

    // The result object would be sent to a metrics endpoint in a real monitor.
    // TODO 2.7: Assert result.status equals 'ok' (the journey completed without errors).
    expect(result.status).toBe(/* TODO 2.7: 'ok' */ 'PLACEHOLDER');
  });

  // Test 6: Cron schedule validation — verify the monitor can be triggered manually.
  // In production, workflow_dispatch enables on-demand runs during incident investigation.
  test('monitor script exits cleanly after a successful run', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);

    // The test passing with exit code 0 is the signal consumed by the cron workflow.
    // TODO 2.8: Assert the dashboard heading with name 'Dashboard' is visible.
    // This is the final confirmation step before the monitor exits cleanly.
    await expect(page.getByRole('heading', { name: /* TODO 2.8: 'Dashboard' */ 'PLACEHOLDER' })).toBeVisible();
  });

});

test.describe('Part 3 — Uptime & Performance Monitoring (formerly M76)', () => {

  // Helper: measure LCP via PerformanceObserver inside the browser context.
  async function measureLcp(page: any): Promise<number> {
    return page.evaluate(() =>
      new Promise<number>(resolve => {
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          resolve(entries[entries.length - 1].startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      })
    );
  }

  // Test 1: Landing page LCP stays under the 2500ms Web Vitals "Good" threshold.
  test('landing page LCP is within the 2500ms budget', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const lcp = await measureLcp(page);

    // TODO 3.1: Assert lcp is less than 2500 (2.5 seconds — the Web Vitals "Good" threshold).
    expect(lcp).toBeLessThan(/* TODO 3.1: 2500 */ 0);
  });

  // Test 2: Dashboard TTFB stays under 800ms.
  test('dashboard TTFB is within the 800ms budget', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);

    // Navigation Timing entries are available synchronously after the load event.
    const timing = await page.evaluate(() =>
      JSON.parse(JSON.stringify(window.performance.getEntriesByType('navigation')[0]))
    );
    // TODO 3.2: Calculate TTFB as timing.responseStart minus timing.fetchStart.
    const ttfb = /* TODO 3.2: timing.responseStart - timing.fetchStart */ 99999;

    expect(ttfb).toBeLessThan(800);
  });

  // Test 3: Full page load time stays under 5000ms.
  test('dashboard full load time is within the 5-second budget', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);

    const timing = await page.evaluate(() =>
      JSON.parse(JSON.stringify(window.performance.getEntriesByType('navigation')[0]))
    );
    // TODO 3.3: Calculate full load time as timing.loadEventEnd minus timing.fetchStart.
    const loadTime = /* TODO 3.3: timing.loadEventEnd - timing.fetchStart */ 99999;

    expect(loadTime).toBeLessThan(5000);
  });

  // Test 4: Before/after regression comparison — detect LCP regression after a change.
  test('landing page LCP does not exceed 120% of the established baseline', async ({ page }) => {
    // Baseline: the P50 LCP from the last 30 production runs (stored as a constant here;
    // in production this would be read from a metrics store or a committed JSON file).
    const baselineLcp = 1400; // ms

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const currentLcp = await measureLcp(page);

    // A 20% regression budget catches real degradations while tolerating measurement variance.
    // TODO 3.4: Assert currentLcp is less than baselineLcp multiplied by 1.2.
    expect(currentLcp).toBeLessThan(/* TODO 3.4: baselineLcp * 1.2 */ 0);
  });

  // Test 5: Measure and emit LCP for multiple runs (simulating a trending data point collection).
  test('landing page LCP is consistent across 3 measurements', async ({ page }) => {
    const measurements: number[] = [];

    for (let i = 0; i < 3; i++) {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const lcp = await measureLcp(page);
      measurements.push(lcp);
      // In a real monitoring bot, emit each measurement to Datadog/Prometheus here.
    }

    // All measurements must be under budget.
    // TODO 3.5: Assert that every value in measurements is less than 2500.
    expect(measurements.every(m => m < /* TODO 3.5: 2500 */ 0)).toBe(true);

    const max = Math.max(...measurements);
    const min = Math.min(...measurements);
    // High variance (>500ms spread) between consecutive runs signals environmental instability.
    expect(max - min).toBeLessThan(500);
  });

  // Test 6: API endpoint response time stays under 200ms for the health endpoint.
  test('health API endpoint responds within 200ms', async ({ request }) => {
    const start = Date.now();
    const response = await request.get('/api/health');
    const elapsed = Date.now() - start;

    // TODO 3.6: Assert response status is 200.
    expect(response.status()).toBe(/* TODO 3.6: 200 */ 0);

    // TODO 3.7: Assert elapsed is less than 200 (200ms budget for the health endpoint).
    expect(elapsed).toBeLessThan(/* TODO 3.7: 200 */ 0);
  });

});
