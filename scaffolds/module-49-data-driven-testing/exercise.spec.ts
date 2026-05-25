import { test, expect } from '../fixtures/fixtures';

// M49: Data-Driven Testing
//
// This module demonstrates generating multiple test cases from a data array.
// Each loop iteration produces one test with its own pass/fail result in the report.

// ─── Inline data ──────────────────────────────────────────────────────────────

const validationCases = [
  { input: '',    errorExpected: true,  description: 'empty title' },
  { input: ' ',   errorExpected: true,  description: 'whitespace only title' },
  { input: 'A',   errorExpected: false, description: 'single character title' },
  { input: 'Buy groceries', errorExpected: false, description: 'normal title' },
];

// ─── External data ────────────────────────────────────────────────────────────

// TODO 1: Import the task-data.json file.
// Use a relative require() or import statement to load it as an array.
// Why? Keeping large datasets in JSON files decouples data from test logic —
// a QA engineer can add new test cases by editing JSON, not TypeScript.
const taskDataPath = require(/* TODO 1: './task-data.json' */);

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('M49 — Data-Driven Testing', () => {

  // Test group 1: Inline data loop — form validation cases
  // Each iteration generates one test. Failures identify the specific case.
  test.describe('form validation across input cases', () => {

    // TODO 2: Loop over validationCases and create one test per case.
    // Name each test using the case's description field:
    //   test(`validates: ${description}`, ...)
    // Why? Including the discriminating field in the test name means a failure report
    // says "validates: empty title" not just "validates" — instantly actionable.
    for (const { input, errorExpected, description } of validationCases) {
      test(`validates: ${/* TODO 2: description */ ''}`, async ({ page }) => {
        await page.goto('/dashboard');
        await page.getByRole('button', { name: 'Add task' }).first().click();
        await expect(page.getByRole('dialog')).toBeVisible();

        await page.getByTestId('task-title-input').fill(input);
        await page.getByTestId('task-submit').click();

        if (errorExpected) {
          // Invalid input: dialog should stay open (form rejected the submission).
          // TODO 3: Assert that the dialog is still visible.
          await expect(page.getByRole('dialog'))./* TODO 3: toBeVisible() */;
        } else {
          // Valid input: dialog should close.
          // TODO 4: Assert that the dialog is not visible.
          await expect(page.getByRole('dialog'))./* TODO 4: not.toBeVisible() */;
        }
      });
    }
  });

  // Test group 2: External JSON data — task creation cases
  // Loaded from task-data.json — demonstrates separating data from code.
  test.describe('task creation with external data', () => {

    // TODO 5: Loop over taskDataPath (the imported JSON array) and create one test per entry.
    // Name each test: `creates task: "${title}" (${priority} priority)`
    // Why? The title and priority together identify which combination failed —
    // "creates task: Fix login bug (high priority)" is far more useful than "creates task 3".
    for (const { title, priority } of taskDataPath /* TODO 5: */) {
      test(`creates task: "${/* TODO 5: title */}" (${/* TODO 5: priority */} priority)`, async ({ page }) => {
        await page.goto('/dashboard');

        // Open the task creation dialog.
        await page.getByRole('button', { name: 'Add task' }).first().click();
        await expect(page.getByRole('dialog')).toBeVisible();

        // Fill in the task title.
        // TODO 6: Fill the task title input with the 'title' variable from the loop.
        await page.getByTestId('task-title-input').fill(/* TODO 6: title */);

        // Submit the form.
        await page.getByTestId('task-submit').click();
        await expect(page.getByRole('dialog')).not.toBeVisible();

        // Verify the task card appeared on the board.
        // TODO 7: Assert that the task card with the loop's title text is visible.
        await expect(
          page.getByTestId('task-card').filter({ hasText: /* TODO 7: title */ })
        ).toBeVisible();
      });
    }
  });

  // Test group 3: Understanding when NOT to use data-driven tests
  test('data-driven is wrong when scenarios differ meaningfully', async ({}) => {
    // These three scenarios look like "login" cases but are actually different tests:
    // - Valid credentials → dashboard redirect
    // - Wrong password → error message shown
    // - Locked account → locked message shown
    //
    // A data loop would hide the fact that each scenario has a different expected outcome
    // and possibly different assertions. Each should be a separate named test.
    //
    // TODO 8: Set this to true once you understand the distinction.
    // Why? Knowing when NOT to use a pattern is as important as knowing how to use it.
    const understoodWhenToAvoidDataDriven = /* TODO 8: true */ false;
    expect(understoodWhenToAvoidDataDriven).toBe(true);
  });

  // Test group 4: Verify the external data file is valid
  // A meta-test that guards against corrupted or empty data files.
  test('task-data.json contains at least one entry', async ({}) => {
    // TODO 9: Assert that taskDataPath is an Array.
    expect(Array.isArray(/* TODO 9: taskDataPath */)).toBe(true);

    // TODO 10: Assert that taskDataPath has length greater than 0.
    // Why? If the JSON file is accidentally emptied, all generated tests silently disappear
    // instead of failing — this guard makes the gap visible.
    expect(taskDataPath.length).toBeGreaterThan(/* TODO 10: 0 */);
  });

});
