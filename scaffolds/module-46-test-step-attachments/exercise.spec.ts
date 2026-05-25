import { test, expect } from '../fixtures/fixtures';

// M46: test.step() & Runtime Attachments
//
// Run with html reporter to see steps and attachments in the report:
//   npx playwright test tests/module-46-test-step-attachments --reporter=html
//   npx playwright show-report

test.describe('M46 — test.step() & Runtime Attachments', () => {

  // Test 1: Use test.step() to group a navigation phase
  // Steps appear as collapsible sections in the Trace Viewer and HTML report.
  test('test.step groups actions into named phases', async ({ page }) => {
    // TODO 1: Wrap the navigation in a test.step named 'Navigate to dashboard'.
    // Why? Named steps make the trace timeline readable — instead of seeing
    // 'goto /dashboard', you see the human-readable phase name.
    await test.step(/* TODO 1: 'Navigate to dashboard', */ async () => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL('/dashboard');
    });
  });

  // Test 2: Use nested test.step() for a multi-phase flow
  // Top-level steps describe phases; nested steps describe sub-actions.
  test('nested steps describe a task creation flow', async ({ page }) => {
    await test.step('Navigate to dashboard', async () => {
      await page.goto('/dashboard');
    });

    // TODO 2: Add a test.step named 'Open task creation dialog'.
    // Inside: click the 'Add task' button and assert the dialog is visible.
    // Why? Grouping the open-dialog actions separately from filling the form
    // makes the HTML report read like a test plan: each step is a distinct intent.
    await test.step(/* TODO 2: 'Open task creation dialog', */ async () => {
      await page.getByRole('button', { name: 'Add task' }).first().click();
      await expect(page.getByRole('dialog')).toBeVisible();
    });

    // TODO 3: Add a test.step named 'Fill and submit task form'.
    // Inside: fill the title input with 'Step test task' and click submit.
    await test.step(/* TODO 3: 'Fill and submit task form', */ async () => {
      await page.getByTestId('task-title-input').fill('Step test task');
      await page.getByTestId('task-submit').click();
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });

    // TODO 4: Add a test.step named 'Verify task on board'.
    // Inside: assert the task card with text 'Step test task' is visible.
    await test.step(/* TODO 4: 'Verify task on board', */ async () => {
      await expect(
        page.getByTestId('task-card').filter({ hasText: 'Step test task' })
      ).toBeVisible();
    });
  });

  // Test 3: Attach a screenshot to the HTML report
  // testInfo is the second argument to the test callback.
  test('testInfo.attach adds a screenshot to the report', async ({ page }, testInfo) => {
    await page.goto('/dashboard');

    // TODO 5: Capture a screenshot of the dashboard using page.screenshot().
    // Store it in a variable named 'screenshot'.
    // Why? Capturing a screenshot at a meaningful moment (after state change, before assertion)
    // gives report readers visual proof of what the test saw.
    const screenshot = await page/* TODO 5: .screenshot() */;

    // TODO 6: Attach the screenshot to the report using testInfo.attach().
    // Name it 'dashboard state' with contentType 'image/png'.
    // Why? The attachment appears inline in the HTML report — no need to dig through test-results/.
    await testInfo.attach(/* TODO 6: 'dashboard state', { body: screenshot, contentType: 'image/png' } */);

    await expect(page).toHaveURL('/dashboard');
  });

  // Test 4: Attach a text artifact (JSON data) to the report
  // Attaching JSON is useful when the test processes data — the report shows the exact data.
  test('testInfo.attach adds text content to the report', async ({ page }, testInfo) => {
    await page.goto('/dashboard');

    const testData = {
      taskTitle: 'Attachment test task',
      column: 'todo',
      timestamp: new Date().toISOString(),
    };

    // TODO 7: Attach testData as a JSON string to the report.
    // Name it 'test data', set contentType to 'application/json'.
    // Hint: use JSON.stringify(testData, null, 2) for readable formatting.
    await testInfo.attach(/* TODO 7: 'test data', {
      body: JSON.stringify(testData, null, 2),
      contentType: 'application/json',
    } */);

    expect(testData.taskTitle).toBe('Attachment test task');
  });

  // Test 5: Add annotations to link the test to an issue tracker
  // testInfo.annotations.push() adds metadata shown in the HTML report.
  test('testInfo.annotations links test to issue tracker', async ({ page }, testInfo) => {
    // TODO 8: Push an annotation with type 'issue' and description 'LUM-1234'.
    // Why? Linking a test to a ticket lets report readers understand why the test exists —
    // especially useful for regression tests that prevent specific bugs from returning.
    testInfo.annotations.push(/* TODO 8: { type: 'issue', description: 'LUM-1234' } */);

    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
  });

  // Test 6: Combine steps and attachments in a single test
  // This is the real-world pattern: steps structure the timeline, attachments document key states.
  test('steps and attachments together document a complete flow', async ({ page }, testInfo) => {
    await test.step('Navigate to dashboard', async () => {
      await page.goto('/dashboard');
    });

    await test.step('Create task', async () => {
      await page.getByRole('button', { name: 'Add task' }).first().click();
      await page.getByTestId('task-title-input').fill('Combined test task');
      await page.getByTestId('task-submit').click();
    });

    // TODO 9: Inside a test.step named 'Capture board state', take a screenshot
    // and attach it with testInfo.attach() named 'after task creation'.
    // Why? The attached screenshot captures the board state at the critical assertion point —
    // if the test fails tomorrow, the report shows exactly what the board looked like today.
    await test.step(/* TODO 9: 'Capture board state', */ async () => {
      const screenshot = await page.screenshot();
      await testInfo.attach('after task creation', {
        body: screenshot,
        contentType: 'image/png',
      });
      await expect(
        page.getByTestId('task-card').filter({ hasText: 'Combined test task' })
      ).toBeVisible();
    });
  });

});
