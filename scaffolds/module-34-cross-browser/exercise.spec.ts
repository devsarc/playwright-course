import { test, expect } from '../fixtures/fixtures';

// M34: Cross-Browser Testing Strategy
//
// These tests run on Chromium, Firefox, and WebKit when all three projects
// are configured. Use `--project chromium` for speed during development.

test.describe('M34 — Cross-Browser Testing', () => {

  // Test 1: Basic cross-browser smoke test
  // This test should pass identically on all three browsers.
  test('Lumio landing page loads on all browsers', async ({ page, browserName }) => {
    // TODO 1: Navigate to the Lumio landing page.
    // Why check browserName? You can log or annotate which browser is running —
    // useful in CI to trace which browser produced a failure.
    await page.goto(/* TODO 1: '/' */);
    await test.info().annotations.push({ type: 'browser', description: /* TODO 1: browserName */ '' as any });

    // TODO 2: Assert the page title contains 'Lumio'.
    // This should pass on all three browsers — the title is not browser-dependent.
    await expect(page).toHaveTitle(/* TODO 2: /Lumio/ */);
  });

  // Test 2: Demonstrate browser-specific skip
  // page.pdf() is a Chromium-only API. This test should be skipped on Firefox and WebKit.
  test('PDF generation is Chromium-only', async ({ page, browserName }) => {
    // TODO 3: Skip this test on any browser that is not Chromium.
    // Use test.skip() with a condition and a human-readable reason.
    // Why skip here rather than wrapping in if()? test.skip() marks the test
    // as skipped in the report — an if() would silently pass without running the assertion.
    test.skip(/* TODO 3: browserName !== 'chromium', 'page.pdf() is Chromium-only' */);

    await page.goto('/dashboard');
    const pdfBuffer = await page.pdf();

    // TODO 4: Assert the PDF buffer is truthy (has content).
    expect(pdfBuffer)./* TODO 4: toBeTruthy() */;
    expect(pdfBuffer.length).toBeGreaterThan(/* TODO 4: 0 */);
  });

  // Test 3: Date input cross-browser compatibility
  // WebKit handles <input type="date"> differently from Chromium and Firefox.
  test('date input fills correctly across browsers', async ({ page, browserName }) => {
    await page.goto('/dashboard');

    // Lumio's task creation modal has a due-date date input.
    await page.getByRole('button', { name: 'Add task' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    const dueDateInput = page.getByTestId('task-due-date');

    // TODO 5: Fill the date input with '2025-06-15' using fill().
    // Why not type()? fill() sets the value atomically — for date inputs it
    // avoids partial-entry bugs where only part of the date is entered.
    await dueDateInput./* TODO 5: fill('2025-06-15') */;

    // TODO 6: Assert the input has the value '2025-06-15'.
    // Note: On WebKit, this may need to be verified differently — if this assertion
    // fails on WebKit, the hints.md explains the workaround.
    await expect(dueDateInput).toHaveValue(/* TODO 6: '2025-06-15' */);
  });

  // Test 4: Clipboard permission — WebKit requires explicit grant
  test('clipboard read requires permission on WebKit', async ({ page, context, browserName }) => {
    // TODO 7: Grant the clipboard-read permission before navigating.
    // Why grant permissions? Chromium grants clipboard-read implicitly in test
    // contexts, but WebKit follows the spec more strictly and requires explicit consent.
    await context.grantPermissions(/* TODO 7: ['clipboard-read', 'clipboard-write'] */);

    await page.goto('/dashboard');

    // Lumio has a "Copy share link" button on task cards.
    await page.getByRole('button', { name: 'Add task' }).click();
    await page.getByTestId('task-title-input').fill('Cross-browser task');
    await page.getByTestId('task-submit').click();

    const taskCard = page.getByTestId('task-card').first();
    await taskCard.getByRole('button', { name: 'Copy link' }).click();

    // TODO 8: Read the clipboard text and assert it contains 'lumio' or a task URL.
    // Use page.evaluate() to read navigator.clipboard.readText().
    const clipboardText = await page.evaluate(/* TODO 8: () => navigator.clipboard.readText() */);
    expect(clipboardText)./* TODO 8: toContain('task') */;
  });

});
