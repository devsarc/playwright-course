import { test, expect } from '../fixtures/fixtures';

// M29: Performance Testing & Measurement
//
// Playwright can measure performance via:
//   page.evaluate(() => performance.timing)   — Navigation Timing API
//   page.evaluate(() => performance.getEntriesByType('paint'))  — paint events
//   page.evaluate(() => performance.now())    — relative timestamps
//   CDP sessions via page.context().newCDPSession()  — Lighthouse-style metrics
//
// These are not replacements for dedicated tools like Lighthouse or k6,
// but they let you assert on performance budgets within your E2E suite.

test.describe('Page load performance', () => {
  test('landing page DOM content loaded under 3000ms', async ({ page }) => {
    // TODO 1: Navigate to / and measure DOMContentLoaded time using
    // the Navigation Timing API via page.evaluate().
    // performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
    // gives the DOMContentLoaded duration in ms.
    await page.goto('/');
    const dcl = await page.evaluate(/* TODO 1: () =>
      performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
    */);
    // TODO 2: Assert the DOMContentLoaded time is less than 3000ms.
    expect(dcl).toBeLessThan(/* TODO 2: 3000 */);
  });

  test('first contentful paint occurs within 2500ms', async ({ page }) => {
    await page.goto('/');

    // TODO 3: Use performance.getEntriesByName('first-contentful-paint') to get the FCP entry.
    // It is a PerformancePaintTiming entry — access .startTime for the timestamp.
    // FCP measures when the first text or image is rendered.
    const fcp = await page.evaluate(/* TODO 3: () => {
      const entries = performance.getEntriesByName('first-contentful-paint');
      return entries.length > 0 ? entries[0].startTime : -1;
    } */);

    // TODO 4: Assert FCP was recorded (not -1) and is under 2500ms.
    expect(fcp).toBeGreaterThan(/* TODO 4: 0 */);
    expect(fcp).toBeLessThan(/* TODO 4: 2500 */);
  });

  test('board page loads all three columns within 5000ms', async ({ page }) => {
    const start = Date.now();
    await page.goto('/projects/demo/board');

    // TODO 5: Wait for all three kanban columns to be visible, then measure
    // the elapsed time since navigation started. Assert it is under 5000ms.
    await Promise.all([
      page.getByTestId('kanban-column-todo').waitFor(),
      page.getByTestId('kanban-column-in-progress').waitFor(),
      page.getByTestId('kanban-column-done').waitFor(),
    ]);
    const elapsed = Date.now() - /* TODO 5: start */ 0;
    expect(elapsed).toBeLessThan(/* TODO 5: 5000 */);
  });
});

test.describe('Interaction performance', () => {
  test('card creation completes within 1000ms', async ({ page }) => {
    await page.goto('/projects/demo/board');

    // TODO 6: Measure the time from clicking "Add card" to the new card being visible.
    // Use Date.now() before the action and after the expect resolves.
    // This measures perceived interaction latency from the user's perspective.
    const start = Date.now();
    await page.getByTestId('add-card-button').click();
    await page.getByTestId('new-card-input').fill('Perf test card');
    await page.getByTestId('new-card-input').press('Enter');
    await page.getByTestId('kanban-card').filter({ hasText: 'Perf test card' }).waitFor();
    const duration = Date.now() - /* TODO 6: start */;

    expect(duration).toBeLessThan(/* TODO 6: 1000 */);
  });

  test('resource sizes are within budget', async ({ page }) => {
    const resourceSizes: number[] = [];

    // TODO 7: Listen to 'response' events and record the Content-Length header
    // for all JS responses. Assert no single JS file exceeds 500KB.
    // Why: large bundles block the main thread and delay interactivity.
    page.on('response', async (response) => {
      const contentType = response.headers()['content-type'] ?? '';
      if (contentType.includes('javascript')) {
        const body = await response.body().catch(() => Buffer.alloc(0));
        resourceSizes.push(/* TODO 7: body.length */);
      }
    });

    await page.goto('/');

    const MAX_JS_BUNDLE = 500 * 1024; // 500 KB
    for (const size of resourceSizes) {
      expect(size).toBeLessThan(/* TODO 7: MAX_JS_BUNDLE */);
    }
  });
});
