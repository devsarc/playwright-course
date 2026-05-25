import { test, expect } from '../fixtures/fixtures';

// M77: AI Test Planning
// This exercise simulates what an AI test planner does in its navigation phase:
// systematic exploration of the kanban board to inventory testable features.
// Understanding the manual version makes you a better evaluator of AI-generated plans.

test.describe('M77 — AI Test Planning: Kanban Board Feature Inventory', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard after login (simulating the planner starting from the main app view).
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);
    await page.goto('/projects/test-project');
    await page.waitForLoadState('networkidle');
  });

  // Test 1: Inventory the board columns — a planner documents all swimlanes.
  test('kanban board has the expected three status columns', async ({ page }) => {
    // A test planner first maps the visible structure: what columns exist?
    const columns = page.getByRole('region', { name: /todo|in progress|done/i });

    // TODO 1: Assert the columns locator has count 3.
    // A plan missing a column is a plan missing an entire category of tests.
    await expect(columns).toHaveCount(/* TODO 1: 3 */ 0);
  });

  // Test 2: Inventory task cards — a planner identifies what data each card exposes.
  test('task cards expose title, assignee, and priority for assertions', async ({ page }) => {
    const firstCard = page.getByRole('article').first();

    await expect(firstCard).toBeVisible();
    // A planner documents: "each card has a title — generate an assertion for it."
    // TODO 2: Assert the first card contains a visible heading (the task title).
    await expect(firstCard.getByRole(/* TODO 2: 'heading' */ 'PLACEHOLDER')).toBeVisible();
  });

  // Test 3: Inventory interactive entry points — a planner finds all "create" triggers.
  test('"New task" button is the entry point for the create-task flow', async ({ page }) => {
    // Every interactive trigger the planner finds becomes a test flow in the plan.
    // TODO 3: Assert the 'New task' button is visible using getByRole('button', { name: 'New task' }).
    const newTaskBtn = page.getByRole('button', { name: /* TODO 3: 'New task' */ 'PLACEHOLDER' });
    await expect(newTaskBtn).toBeVisible();
  });

  // Test 4: Verify the drag handle exists — a planner identifies DnD as a testable flow.
  test('task cards have drag handles enabling the reorder flow', async ({ page }) => {
    // If the drag handle is present, the planner generates a "drag task to In Progress" flow.
    const firstCard = page.getByRole('article').first();
    // TODO 4: Assert the element with data-testid="drag-handle" inside the first card is visible.
    await expect(firstCard.locator(/* TODO 4: '[data-testid="drag-handle"]' */ '[data-testid="PLACEHOLDER"]')).toBeVisible();
  });

  // Test 5: Inventory filter controls — a planner identifies filter permutations to test.
  test('board has at least one filter control for generating filter flow tests', async ({ page }) => {
    // Filters multiply the number of test scenarios: each filter combination is a potential test case.
    const filterControls = page.getByRole('combobox');

    // TODO 5: Assert filterControls count is at least 1.
    const count = await filterControls.count();
    expect(count).toBeGreaterThanOrEqual(/* TODO 5: 1 */ 999);
  });

  // Test 6: Document empty state — a planner always includes "what happens when there's no data."
  test('Todo column shows an empty state when it has no tasks', async ({ page }) => {
    // The empty state is a critical test scenario that AI planners often miss.
    // Here we verify it exists on the page for a column with no tasks.
    // Navigate to a project with an empty Todo column.
    await page.goto('/projects/empty-project');
    await page.waitForLoadState('networkidle');

    const todoColumn = page.getByRole('region', { name: /todo/i });
    // TODO 6: Assert the todoColumn contains the text 'No tasks' (the empty state message).
    await expect(todoColumn).toContainText(/* TODO 6: 'No tasks' */ 'PLACEHOLDER');
  });

  // Test 7: Document task count per column — a key observable metric for drag-and-drop flows.
  test('task counts per column are visible and can be used in plan assertions', async ({ page }) => {
    // A good AI-generated assertion for drag-and-drop uses column counts:
    // "after dragging, Todo count decreases by 1 and In Progress count increases by 1."
    const todoColumn = page.getByRole('region', { name: /todo/i });
    const countBadge = todoColumn.getByTestId('column-task-count');

    // TODO 7: Assert countBadge text matches a regex for a number /^\d+$/.
    await expect(countBadge).toHaveText(/* TODO 7: /^\d+$/ */ /PLACEHOLDER/);
  });

});
