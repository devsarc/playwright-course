import { test, expect } from '../fixtures/fixtures';

// M43: Tracing & Trace Viewer
//
// The Playwright Trace Viewer records every test action, network request,
// console log, and snapshot. It is invaluable for debugging CI failures
// where you cannot run tests interactively.
//
// Key APIs:
//   context.tracing.start()   — begin recording
//   context.tracing.stop()    — save the trace to a zip file
//   page.pause()              — pause execution and open the Inspector (dev only)
//   --headed / --debug flags  — run tests visually in your terminal

// NOTE: This module focuses on *understanding* trace output.
// The exercises use manual tracing start/stop to show you how tracing works
// under the hood — normally you configure this in playwright.config.ts.

test.describe('Manual tracing', () => {
  test('record a trace for a board interaction', async ({ context, page }) => {
    // TODO 1: Start tracing on the context before navigation.
    // Pass { screenshots: true, snapshots: true } to capture DOM and screenshots.
    // screenshots: captures a PNG at each action
    // snapshots: captures DOM state for the "before/after" diff view
    await context.tracing.start(/* TODO 1: { screenshots: true, snapshots: true } */);

    await page.goto('/projects/demo/board');
    await page.getByTestId('add-card-button').click();
    await page.getByTestId('new-card-input').fill('Traced card');
    await page.getByTestId('new-card-input').press('Escape');

    // TODO 2: Stop the trace and save it to a file.
    // The path is relative to the project root.
    await context.tracing.stop(/* TODO 2: { path: 'test-results/traces/board-interaction.zip' } */);

    // The trace file is now viewable with:
    // npx playwright show-trace test-results/traces/board-interaction.zip
  });
});

test.describe('Debugging techniques', () => {
  test('console logs are captured in test output', async ({ page }) => {
    // TODO 3: Listen for 'console' events and push them to a messages array.
    // page.on('console', msg => messages.push(msg.text())) captures all console.log() calls.
    // This is the correct way to assert on JS console output — not by reading the terminal.
    const messages: string[] = [];
    page.on(/* TODO 3: 'console', msg => messages.push(msg.text()) */);

    await page.goto('/projects/demo/board');

    // TODO 4: Evaluate JavaScript in the page that calls console.log().
    // Then assert the messages array contains the logged text.
    await page.evaluate(/* TODO 4: () => console.log('debug-marker-12345') */);
    expect(messages.some(m => m.includes(/* TODO 4: 'debug-marker-12345' */))).toBe(true);
  });

  test('page errors are captured', async ({ page }) => {
    // TODO 5: Listen for 'pageerror' events and collect them.
    // 'pageerror' fires when an uncaught JS exception occurs in the page.
    // Asserting no page errors fires is a useful defensive check for any navigation.
    const errors: Error[] = [];
    page.on(/* TODO 5: 'pageerror', err => errors.push(err) */);

    await page.goto('/');

    // TODO 6: Assert no page errors occurred during the landing page load.
    expect(errors).toHaveLength(/* TODO 6: 0 */);
  });

  test('screenshot on failure pattern', async ({ page }) => {
    // TODO 7: Take a screenshot and save it when an assertion is about to fail.
    // Use a try/catch around the assertion, take a screenshot in the catch, then re-throw.
    // This is the manual pattern — Playwright auto-screenshot on failure is configured
    // via use: { screenshot: 'only-on-failure' } in playwright.config.ts.
    await page.goto('/projects/demo/board');
    try {
      await expect(page.getByTestId('non-existent-element')).toBeVisible({ timeout: 1000 });
    } catch (err) {
      await page.screenshot(/* TODO 7: { path: 'test-results/screenshots/failure-screenshot.png' } */);
      throw err;
    }
  });
});
