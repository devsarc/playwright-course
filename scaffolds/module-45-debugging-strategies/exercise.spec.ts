import { test, expect } from '../fixtures/fixtures';

// M45: Debugging Strategies
//
// These tests demonstrate the three primary debugging tools:
// Trace Viewer (post-mortem), page.on('console') (runtime), locator.highlight() (visual).
//
// Run with --headed to see highlight() in action:
//   npx playwright test tests/module-45-debugging-strategies --headed

test.describe('M45 — Debugging Strategies', () => {

  // Test 1: Capture browser console messages with page.on('console')
  // Console messages from the app's JavaScript runtime are invisible by default.
  // Attaching a listener makes them visible in the terminal during the test run.
  test('page.on console listener captures app messages', async ({ page }) => {
    const messages: string[] = [];

    // TODO 1: Attach a console listener that pushes msg.text() into the messages array.
    // Why? React component errors, network failures, and debug logs all appear in the
    // browser console — without a listener, they are invisible during test execution.
    page.on(/* TODO 1: 'console', msg => messages.push(msg.text()) */);

    await page.goto('/dashboard');

    // The Lumio dashboard may log initialization messages.
    // We don't assert on specific content — just that the listener was wired correctly.
    // TODO 2: Assert that messages is an Array.
    // Why? Confirms the listener was attached correctly — it collected whatever the app logged.
    expect(Array.isArray(/* TODO 2: messages */)).toBe(true);
  });

  // Test 2: Filter console messages by type
  // Filtering by type reduces noise — most tests only care about errors.
  test('filter console messages by type', async ({ page }) => {
    const errors: string[] = [];

    // TODO 3: Attach a console listener that pushes msg.text() into errors
    // only when msg.type() === 'error'.
    // Why? Filtering to 'error' type lets you assert "the app logged no JS errors"
    // without being drowned in 'log' and 'info' messages.
    page.on('console', msg => {
      if (msg.type() === /* TODO 3: 'error' */ '') {
        errors.push(msg.text());
      }
    });

    await page.goto('/dashboard');

    // A healthy page should log no errors during initialization.
    // TODO 4: Assert that the errors array has length 0.
    // Why? Zero console errors is a baseline quality signal — fail the test if the
    // app throws JS errors during a normal navigation.
    expect(errors).toHaveLength(/* TODO 4: 0 */);
  });

  // Test 3: Use locator.highlight() to visually confirm a locator
  // highlight() draws a bounding box around every matching element.
  // This is a development-only tool — remove before committing.
  test('locator.highlight() confirms selector targets the right element', async ({ page }) => {
    await page.goto('/dashboard');

    const addTaskButton = page.getByRole('button', { name: 'Add task' });

    // TODO 5: Call highlight() on addTaskButton.
    // Run this test with --headed to see the bounding box appear in the browser.
    // Why? highlight() lets you visually verify the locator before adding an assertion —
    // it's faster than reading HTML source and more precise than guessing.
    await addTaskButton/* TODO 5: .highlight() */;

    // After visual confirmation, proceed with the real assertion.
    await expect(addTaskButton).toBeVisible();
  });

  // Test 4: Use locator.count() to diagnose over-matching
  // A locator that matches multiple elements will fail in strict mode and
  // may act on the wrong element in non-strict mode.
  test('locator.count() identifies how many elements a locator matches', async ({ page }) => {
    await page.goto('/dashboard');

    // The board has three columns, each with an 'Add task' button.
    // A broad locator matches all three; a scoped locator matches one.
    const allAddButtons = page.getByRole('button', { name: 'Add task' });
    const todoColumnButton = page
      .getByTestId('kanban-column-todo')
      .getByRole('button', { name: 'Add task' });

    // TODO 6: Assert that allAddButtons.count() equals 3.
    // Why? This confirms the board has three columns — and shows why broad locators
    // are dangerous: clicking allAddButtons.first() is a silent bug.
    const allCount = await allAddButtons.count();
    expect(allCount).toBe(/* TODO 6: 3 */);

    // TODO 7: Assert that todoColumnButton.count() equals 1.
    // Why? The scoped locator is the correct one — exactly one match, no ambiguity.
    const scopedCount = await todoColumnButton.count();
    expect(scopedCount).toBe(/* TODO 7: 1 */);
  });

  // Test 5: Trace Viewer — configure and produce a trace
  // Traces are the primary artifact for diagnosing CI failures.
  test('trace configuration is understood', async ({ page }) => {
    // This test navigates the dashboard and records a trace (when trace: 'on' is set).
    // After the run:
    //   npx playwright show-trace test-results/*/trace.zip
    //
    // In the Trace Viewer:
    //   - Timeline (top): one bar per action
    //   - Snapshot (center): DOM state before/after the selected action
    //   - Network (bottom): requests in-flight during the action
    //   - Console: browser log messages captured at test time
    await page.goto('/dashboard');

    // TODO 8: Assert the page URL contains '/dashboard'.
    // Why? This is the action that will appear in the trace timeline — you'll see
    // the goto action, the DOM snapshot, and the navigation request in the network panel.
    await expect(page).toHaveURL(/* TODO 8: /\/dashboard/ */);
  });

  // Test 6: Reproduce an intermittent failure using console + count
  // Combines both diagnostic tools to understand a selector + state problem.
  test('combine console listener and count to debug a missing element', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Add task' }).first().click();

    const dialog = page.getByRole('dialog');

    // TODO 9: Assert that dialog.count() equals 1.
    // Why? Before asserting visibility, count() confirms the dialog exists in the DOM
    // at all — if count() is 0, it's a timing or selector issue, not a visibility issue.
    const dialogCount = await dialog.count();
    expect(dialogCount).toBe(/* TODO 9: 1 */);

    await expect(dialog).toBeVisible();

    // TODO 10: Assert that no console errors occurred during the interaction.
    // Why? A dialog that appears but throws JS errors internally is a bug —
    // catching it here prevents a silent regression.
    expect(errors).toHaveLength(/* TODO 10: 0 */);
  });

});
