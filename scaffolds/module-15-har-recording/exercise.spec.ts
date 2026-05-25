import { test, expect } from '../fixtures/fixtures';
import path from 'path';

// M15: HAR Recording & Network Analysis
//
// A HAR (HTTP Archive) file captures all network requests and responses
// during a browser session. Uses: debugging, performance analysis, and
// replay-based mocking (run tests without a live backend).

const HAR_PATH = path.join(__dirname, 'lumio-landing.har');

test.describe('HAR recording and replay', () => {
  test('record: capture landing page network traffic to HAR', async ({ page, context }) => {
    // TODO 1: Start recording a HAR file to HAR_PATH.
    // Use context.routeFromHAR() in record mode OR page.goto with recordHar option.
    // The simplest approach: pass recordHar to the browser context (done in playwright.config.ts
    // or per-test via test.use()). Here, record directly via context options.
    // Note: This requires creating the context with recordHar. Since we're using the
    // test-provided 'page', we instead use a manual approach: launch a new context.

    // For the exercise, use page.context() and show the concept:
    await context.routeFromHAR(HAR_PATH, {
      update: true, // record mode: update the HAR file
      url: /localhost:3000/,
    });

    // TODO 2: Navigate to the landing page.
    await page.goto(/* TODO 2: '/' */);

    // The HAR was recorded to HAR_PATH automatically
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('replay: serve landing page from HAR without a live server', async ({ page, context }) => {
    // TODO 3: Configure the context to replay requests from the recorded HAR file.
    // Use context.routeFromHAR() in replay mode (update: false).
    // Requests that match the HAR will be served from it; others pass through.
    await context.routeFromHAR(HAR_PATH, {
      update: false,
      // TODO 3: Set url pattern to match the landing page
      url: /* TODO 3: /localhost:3000/ */ /^$/ as any,
    });

    await page.goto('/');
    // The landing page should load from the HAR — even if the server is down
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
