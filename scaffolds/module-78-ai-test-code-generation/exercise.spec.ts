import { test, expect } from '../fixtures/fixtures';

// M78: AI Test Code Generation
// Each test below contains a quality issue that an AI generator might produce.
// The TODOs guide you to fix the issue and make the test robust.

test.describe('M78 — Evaluating & Refining AI-Generated Test Code', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  // Test 1: Fix a brittle CSS selector (most common AI generator failure).
  test('create task — fix brittle CSS selector to semantic locator', async ({ page }) => {
    await page.goto('/projects/test-project');

    // AI generated this brittle locator — it breaks when CSS is refactored:
    // await page.locator('.btn-primary').click(); // ← bad: CSS class

    // TODO 1: Replace the brittle locator with getByRole('button', { name: 'New task' }).click().
    await page.getByRole('button', { name: /* TODO 1: 'New task' */ 'PLACEHOLDER' }).click();

    await page.getByLabel('Task title').fill('Generated task fix');
    await page.getByRole('button', { name: 'Create task' }).click();
    await expect(page.getByText('Generated task fix')).toBeVisible();
  });

  // Test 2: Add the missing assertion that the AI generator omitted.
  test('task creation — add the missing assertion after the action', async ({ page }) => {
    await page.goto('/projects/test-project');
    await page.getByRole('button', { name: 'New task' }).click();
    await page.getByLabel('Task title').fill('Task with missing assertion');
    await page.getByRole('button', { name: 'Create task' }).click();

    // The AI generator emitted no assertion here — it recorded the clicks but forgot to verify.
    // TODO 2: Assert that the text 'Task with missing assertion' is visible on the page.
    await expect(page.getByText(/* TODO 2: 'Task with missing assertion' */ 'PLACEHOLDER')).toBeVisible();
  });

  // Test 3: Replace page.waitForTimeout with a proper auto-wait strategy.
  test('modal open — replace waitForTimeout with a semantic assertion wait', async ({ page }) => {
    await page.goto('/projects/test-project');
    await page.getByRole('button', { name: 'New task' }).click();

    // AI generator recorded a 2-second pause and emitted this:
    // await page.waitForTimeout(2000); // ← bad: timing-dependent

    // TODO 3: Replace the timeout with an assertion that the modal dialog is visible.
    // This makes the test deterministic — it waits exactly as long as the modal takes to appear.
    await expect(page.getByRole(/* TODO 3: 'dialog' */ 'PLACEHOLDER')).toBeVisible();

    // Clean up
    await page.keyboard.press('Escape');
  });

  // Test 4: Fix a test that depends on state from a previous test (not independent).
  test('edit task — make the test self-sufficient with its own test data', async ({ page }) => {
    await page.goto('/projects/test-project');

    // AI generator assumed a task named "Design mockups" exists from a previous test.
    // A self-sufficient test creates its own data or uses seeded data with a known name.
    // TODO 4: Use the seeded task title 'Design mockups' (from globalSetup seed data) — not a generated task.
    // The seeded data is stable; relying on a prior test's output would break in isolation.
    const taskTitle = /* TODO 4: 'Design mockups' */ 'PLACEHOLDER';

    await page.getByText(taskTitle).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
  });

  // Test 5: Fix a missing URL assertion after navigation (generator recorded navigation, forgot assertion).
  test('navigate to task detail — assert the URL changed to the task page', async ({ page }) => {
    await page.goto('/projects/test-project');
    await page.getByText('Design mockups').click();

    // The AI generator recorded the click but didn't assert the URL change.
    // TODO 5: Assert the URL matches the regex /tasks\// (task detail URL).
    await expect(page).toHaveURL(/* TODO 5: /tasks\// */ /PLACEHOLDER/);
  });

  // Test 6: Fix an overly broad assertion (generator asserted the whole page, not the specific element).
  test('filter by assignee — scope assertion to the correct column', async ({ page }) => {
    await page.goto('/projects/test-project');

    const assigneeFilter = page.getByRole('combobox', { name: /assignee/i });
    await assigneeFilter.selectOption({ label: 'Admin User' });
    await page.waitForLoadState('networkidle');

    // AI generated: await expect(page).toContainText('Admin User'); // ← bad: matches anywhere on page
    // Better: scope the assertion to the task cards in the board.
    const board = page.getByRole('main');
    // TODO 6: Assert that board contains text 'Admin User' using toContainText.
    await expect(board).toContainText(/* TODO 6: 'Admin User' */ 'PLACEHOLDER');
  });

  // Test 7: Fix an assertion that checks the wrong element (generator confused siblings).
  test('task priority badge — assert the correct element text', async ({ page }) => {
    await page.goto('/projects/test-project');

    const firstCard = page.getByRole('article').first();
    // The generator incorrectly asserted the heading text instead of the priority badge.
    // Priority badge has data-testid="priority-badge".
    const priorityBadge = firstCard.getByTestId('priority-badge');

    // TODO 7: Assert the priorityBadge has text matching /High|Medium|Low|Critical/.
    await expect(priorityBadge).toHaveText(/* TODO 7: /High|Medium|Low|Critical/ */ /PLACEHOLDER/);
  });

});
