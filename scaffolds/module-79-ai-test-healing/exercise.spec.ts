import { test, expect } from '../fixtures/fixtures';

// M79: AI Test Healing
// Each test below is intentionally broken in a way that a healer would encounter.
// The TODO guides you to apply the "healed" fix — the robust replacement for the broken locator.

test.describe('M79 — AI Test Healing: Diagnose and Fix Broken Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);
    await page.goto('/projects/test-project');
    await page.waitForLoadState('networkidle');
  });

  // Test 1: CSS class renamed — healer replaces .btn-primary with a semantic locator.
  test('create task button is found by semantic locator (not CSS class)', async ({ page }) => {
    // Original broken test used: page.locator('.task-create-btn').click()
    // The CSS class was renamed in a UI refactor — the class no longer exists.
    // Healer diagnosed: the element is a button with accessible name "New task".
    // TODO 1: Use getByRole('button', { name: 'New task' }) — the healed locator.
    const createBtn = page.getByRole('button', { name: /* TODO 1: 'New task' */ 'PLACEHOLDER' });
    await expect(createBtn).toBeVisible();
  });

  // Test 2: data-testid removed — healer replaces getByTestId with a semantic locator.
  test('task card title is found by heading role (not removed data-testid)', async ({ page }) => {
    // Original broken test used: page.getByTestId('task-card-title')
    // The data-testid was removed when the component was refactored.
    // Healer diagnosed: the title is a heading element inside each card.
    const firstCard = page.getByRole('article').first();
    // TODO 2: Use getByRole('heading') inside firstCard — the healed locator.
    const title = firstCard.getByRole(/* TODO 2: 'heading' */ 'PLACEHOLDER');
    await expect(title).toBeVisible();
  });

  // Test 3: Assertion text changed — healer updates literal string to current value.
  test('column heading shows the correct status label', async ({ page }) => {
    // Original broken test asserted: toHaveText('TO DO')
    // The column heading text was changed to 'Todo' in a copy update.
    // Healer diagnosed: the current text is 'Todo' (not 'TO DO').
    const todoHeading = page.getByRole('heading', { name: /todo/i }).first();
    // TODO 3: Assert todoHeading has text matching /^Todo$/ (the current heading text).
    await expect(todoHeading).toHaveText(/* TODO 3: /^Todo$/ */ /PLACEHOLDER/);
  });

  // Test 4: Replace waitForTimeout with a proper wait strategy.
  test('task creation modal appears without a hardcoded timeout', async ({ page }) => {
    await page.getByRole('button', { name: 'New task' }).click();

    // Original broken test used: await page.waitForTimeout(3000)
    // This became flaky when the server was under load and the modal took 3.5 seconds.
    // Healer diagnosed: wait for the dialog element itself — no hardcoded timing.
    // TODO 4: Assert the dialog role is visible — the correct wait strategy.
    await expect(page.getByRole(/* TODO 4: 'dialog' */ 'PLACEHOLDER')).toBeVisible();

    await page.keyboard.press('Escape');
  });

  // Test 5: Wrong URL after redirect — healer corrects the expected URL pattern.
  test('opening a task detail navigates to the correct URL', async ({ page }) => {
    // Original broken test asserted: toHaveURL('/task-detail')
    // The URL structure changed from /task-detail?id=X to /projects/{slug}/tasks/{id}.
    await page.getByText('Design mockups').click();

    // TODO 5: Assert the URL matches the regex /tasks\// (the current task detail URL pattern).
    await expect(page).toHaveURL(/* TODO 5: /tasks\// */ /PLACEHOLDER/);
  });

  // Test 6: Sibling element confusion — healer scopes the locator more precisely.
  test('priority badge is scoped to the correct card element', async ({ page }) => {
    // Original broken test used: page.getByTestId('priority')
    // This matched multiple priority badges across all cards — the assertion was ambiguous.
    // Healer diagnosed: scope the locator to the first card using role="article".
    const firstCard = page.getByRole('article').first();
    const priorityBadge = firstCard.getByTestId('priority-badge');

    // TODO 6: Assert priorityBadge has text matching /High|Medium|Low|Critical/.
    await expect(priorityBadge).toHaveText(/* TODO 6: /High|Medium|Low|Critical/ */ /PLACEHOLDER/);
  });

  // Test 7: Missing assertion after state change — healer adds the outcome check.
  test('after creating a task, it appears in the Todo column', async ({ page }) => {
    await page.getByRole('button', { name: 'New task' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByLabel('Task title').fill('Healed test task');
    await page.getByRole('button', { name: 'Create task' }).click();

    // Original broken test had no assertion here — it just ran the actions.
    // Healer diagnosed: the test should verify the task appears after creation.
    const todoColumn = page.getByRole('region', { name: /todo/i });
    // TODO 7: Assert todoColumn contains text 'Healed test task'.
    await expect(todoColumn).toContainText(/* TODO 7: 'Healed test task' */ 'PLACEHOLDER');
  });

});
