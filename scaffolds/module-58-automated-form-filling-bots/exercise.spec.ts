import { test, expect } from '../fixtures/fixtures';

// M58: Automated Form Filling & Bots

// Inline data simulating a CSV import.
// In a real bot: const tasks = parse(readFileSync('tasks.csv'), { columns: true });
const taskRows = [
  { title: 'Bot task 1', priority: 'high' },
  { title: 'Bot task 2', priority: 'medium' },
  { title: 'Bot task 3', priority: 'low' },
];

test.describe('M58 — Automated Form Filling & Bots', () => {

  // Test 1: Submit a single form from data
  test('fill and submit one form row', async ({ page }) => {
    const task = taskRows[0];
    await page.goto('/dashboard');

    await page.getByRole('button', { name: 'Add task' }).first().click();

    // TODO 1: Fill the task title input with task.title.
    await page.getByTestId('task-title-input').fill(/* TODO 1: task.title */);

    await page.getByTestId('task-submit').click();

    // TODO 2: Assert that the dialog is no longer visible after submission.
    await expect(page.getByRole('dialog'))./* TODO 2: not.toBeVisible() */ toBeAttached();
  });

  // Test 2: Iterate over all rows — data-driven bot loop
  test('submit all task rows in a loop', async ({ page }) => {
    const submitted: string[] = [];

    for (const task of taskRows) {
      await page.goto('/dashboard');
      await page.getByRole('button', { name: 'Add task' }).first().click();
      await page.getByTestId('task-title-input').fill(task.title);
      await page.getByTestId('task-submit').click();
      await expect(page.getByRole('dialog')).not.toBeVisible();
      submitted.push(task.title);
    }

    // TODO 3: Assert that submitted has the same length as taskRows.
    // Why? Every row should produce one successful submission — if lengths differ,
    // a submission silently failed.
    expect(submitted).toHaveLength(/* TODO 3: taskRows.length */);
  });

  // Test 3: Dynamic fields — check visibility before interacting
  test('conditional field interaction', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Add task' }).first().click();

    // TODO 4: Check if a 'due-date-input' test ID is visible before filling it.
    // Pattern: if (await locator.isVisible()) { await locator.fill(...); }
    // Why? Dynamic fields that aren't present crash with locator.fill() —
    // isVisible() makes the interaction conditional and safe.
    const dueDateInput = page.getByTestId('due-date-input');
    if (await dueDateInput/* TODO 4: .isVisible() */) {
      await dueDateInput.fill('2024-12-31');
    }

    // The dialog is still open (no required fields filled or conditional field absent).
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
  });

  // Test 4: Error handling — continue on per-row failure
  test('bot continues when one row fails', async ({ page }) => {
    const errors: string[] = [];
    const succeeded: string[] = [];

    const rowsWithBadRow = [
      { title: 'Good task 1', shouldFail: false },
      { title: '',            shouldFail: true  }, // empty title will be rejected
      { title: 'Good task 2', shouldFail: false },
    ];

    for (const row of rowsWithBadRow) {
      try {
        await page.goto('/dashboard');
        await page.getByRole('button', { name: 'Add task' }).first().click();
        await page.getByTestId('task-title-input').fill(row.title);
        await page.getByTestId('task-submit').click();

        // For bad rows, dialog stays open — treat persistence as "failure".
        const dialogStillOpen = await page.getByRole('dialog').isVisible();
        if (dialogStillOpen) {
          throw new Error(`Submission rejected for title: "${row.title}"`);
        }
        succeeded.push(row.title);
      } catch (err) {
        errors.push(String(err));
        // Close dialog before next row.
        await page.keyboard.press('Escape').catch(() => {});
      }
    }

    // TODO 5: Assert that errors has length 1 (only the empty-title row failed).
    expect(errors.length).toBe(/* TODO 5: 1 */);

    // TODO 6: Assert that succeeded has length 2.
    expect(succeeded.length).toBe(/* TODO 6: 2 */);
  });

  // Test 5: Rate limiting between submissions
  test('understands rate limiting in bots', async ({}) => {
    // Rate limiting in bots: add a delay between submissions.
    // In a real bot:
    //   await page.waitForTimeout(300 + Math.random() * 200);

    // TODO 7: What is the minimum recommended delay (in ms) between form submissions?
    // Set to 300 — a reasonable baseline that avoids triggering most rate limiters.
    const minDelayMs = /* TODO 7: 300 */ 0;
    expect(minDelayMs).toBeGreaterThan(0);
  });

});
