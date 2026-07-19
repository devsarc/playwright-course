// Lesson 17: AI-Assisted Testing & MCP Integration
// Combines former modules: M77 (AI Test Planning), M78 (AI Test Code Generation), M79 (AI Test Healing), M80 (MCP Server & Agent Integration)
//
// Each Part below is the original module's test.describe block, unchanged
// except TODO numbers are prefixed with the Part number to stay unique in
// this file (a TODO originally numbered N in the M80 module becomes TODO
// 4.N here, matching Part 4's prefix).

import { test, expect } from '../fixtures/fixtures';

test.describe('Part 1 — AI Test Planning (formerly M77)', () => {

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

    // TODO 1.1: Assert the columns locator has count 3.
    // A plan missing a column is a plan missing an entire category of tests.
    await expect(columns).toHaveCount(/* TODO 1.1: 3 */ 0);
  });

  // Test 2: Inventory task cards — a planner identifies what data each card exposes.
  test('task cards expose title, assignee, and priority for assertions', async ({ page }) => {
    const firstCard = page.getByRole('article').first();

    await expect(firstCard).toBeVisible();
    // A planner documents: "each card has a title — generate an assertion for it."
    // TODO 1.2: Assert the first card contains a visible heading (the task title).
    await expect(firstCard.getByRole(/* TODO 1.2: 'heading' */ 'PLACEHOLDER')).toBeVisible();
  });

  // Test 3: Inventory interactive entry points — a planner finds all "create" triggers.
  test('"New task" button is the entry point for the create-task flow', async ({ page }) => {
    // Every interactive trigger the planner finds becomes a test flow in the plan.
    // TODO 1.3: Assert the 'New task' button is visible using getByRole('button', { name: 'New task' }).
    const newTaskBtn = page.getByRole('button', { name: /* TODO 1.3: 'New task' */ 'PLACEHOLDER' });
    await expect(newTaskBtn).toBeVisible();
  });

  // Test 4: Verify the drag handle exists — a planner identifies DnD as a testable flow.
  test('task cards have drag handles enabling the reorder flow', async ({ page }) => {
    // If the drag handle is present, the planner generates a "drag task to In Progress" flow.
    const firstCard = page.getByRole('article').first();
    // TODO 1.4: Assert the element with data-testid="drag-handle" inside the first card is visible.
    await expect(firstCard.locator(/* TODO 1.4: '[data-testid="drag-handle"]' */ '[data-testid="PLACEHOLDER"]')).toBeVisible();
  });

  // Test 5: Inventory filter controls — a planner identifies filter permutations to test.
  test('board has at least one filter control for generating filter flow tests', async ({ page }) => {
    // Filters multiply the number of test scenarios: each filter combination is a potential test case.
    const filterControls = page.getByRole('combobox');

    // TODO 1.5: Assert filterControls count is at least 1.
    const count = await filterControls.count();
    expect(count).toBeGreaterThanOrEqual(/* TODO 1.5: 1 */ 999);
  });

  // Test 6: Document empty state — a planner always includes "what happens when there's no data."
  test('Todo column shows an empty state when it has no tasks', async ({ page }) => {
    // The empty state is a critical test scenario that AI planners often miss.
    // Here we verify it exists on the page for a column with no tasks.
    // Navigate to a project with an empty Todo column.
    await page.goto('/projects/empty-project');
    await page.waitForLoadState('networkidle');

    const todoColumn = page.getByRole('region', { name: /todo/i });
    // TODO 1.6: Assert the todoColumn contains the text 'No tasks' (the empty state message).
    await expect(todoColumn).toContainText(/* TODO 1.6: 'No tasks' */ 'PLACEHOLDER');
  });

  // Test 7: Document task count per column — a key observable metric for drag-and-drop flows.
  test('task counts per column are visible and can be used in plan assertions', async ({ page }) => {
    // A good AI-generated assertion for drag-and-drop uses column counts:
    // "after dragging, Todo count decreases by 1 and In Progress count increases by 1."
    const todoColumn = page.getByRole('region', { name: /todo/i });
    const countBadge = todoColumn.getByTestId('column-task-count');

    // TODO 1.7: Assert countBadge text matches a regex for a number /^\d+$/.
    await expect(countBadge).toHaveText(/* TODO 1.7: /^\d+$/ */ /PLACEHOLDER/);
  });

});

test.describe('Part 2 — AI Test Code Generation (formerly M78)', () => {

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

    // TODO 2.1: Replace the brittle locator with getByRole('button', { name: 'New task' }).click().
    await page.getByRole('button', { name: /* TODO 2.1: 'New task' */ 'PLACEHOLDER' }).click();

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
    // TODO 2.2: Assert that the text 'Task with missing assertion' is visible on the page.
    await expect(page.getByText(/* TODO 2.2: 'Task with missing assertion' */ 'PLACEHOLDER')).toBeVisible();
  });

  // Test 3: Replace page.waitForTimeout with a proper auto-wait strategy.
  test('modal open — replace waitForTimeout with a semantic assertion wait', async ({ page }) => {
    await page.goto('/projects/test-project');
    await page.getByRole('button', { name: 'New task' }).click();

    // AI generator recorded a 2-second pause and emitted this:
    // await page.waitForTimeout(2000); // ← bad: timing-dependent

    // TODO 2.3: Replace the timeout with an assertion that the modal dialog is visible.
    // This makes the test deterministic — it waits exactly as long as the modal takes to appear.
    await expect(page.getByRole(/* TODO 2.3: 'dialog' */ 'PLACEHOLDER')).toBeVisible();

    // Clean up
    await page.keyboard.press('Escape');
  });

  // Test 4: Fix a test that depends on state from a previous test (not independent).
  test('edit task — make the test self-sufficient with its own test data', async ({ page }) => {
    await page.goto('/projects/test-project');

    // AI generator assumed a task named "Design mockups" exists from a previous test.
    // A self-sufficient test creates its own data or uses seeded data with a known name.
    // TODO 2.4: Use the seeded task title 'Design mockups' (from globalSetup seed data) — not a generated task.
    // The seeded data is stable; relying on a prior test's output would break in isolation.
    const taskTitle = /* TODO 2.4: 'Design mockups' */ 'PLACEHOLDER';

    await page.getByText(taskTitle).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
  });

  // Test 5: Fix a missing URL assertion after navigation (generator recorded navigation, forgot assertion).
  test('navigate to task detail — assert the URL changed to the task page', async ({ page }) => {
    await page.goto('/projects/test-project');
    await page.getByText('Design mockups').click();

    // The AI generator recorded the click but didn't assert the URL change.
    // TODO 2.5: Assert the URL matches the regex /tasks\// (task detail URL).
    await expect(page).toHaveURL(/* TODO 2.5: /tasks\// */ /PLACEHOLDER/);
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
    // TODO 2.6: Assert that board contains text 'Admin User' using toContainText.
    await expect(board).toContainText(/* TODO 2.6: 'Admin User' */ 'PLACEHOLDER');
  });

  // Test 7: Fix an assertion that checks the wrong element (generator confused siblings).
  test('task priority badge — assert the correct element text', async ({ page }) => {
    await page.goto('/projects/test-project');

    const firstCard = page.getByRole('article').first();
    // The generator incorrectly asserted the heading text instead of the priority badge.
    // Priority badge has data-testid="priority-badge".
    const priorityBadge = firstCard.getByTestId('priority-badge');

    // TODO 2.7: Assert the priorityBadge has text matching /High|Medium|Low|Critical/.
    await expect(priorityBadge).toHaveText(/* TODO 2.7: /High|Medium|Low|Critical/ */ /PLACEHOLDER/);
  });

});

test.describe('Part 3 — AI Test Healing (formerly M79)', () => {

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
    // TODO 3.1: Use getByRole('button', { name: 'New task' }) — the healed locator.
    const createBtn = page.getByRole('button', { name: /* TODO 3.1: 'New task' */ 'PLACEHOLDER' });
    await expect(createBtn).toBeVisible();
  });

  // Test 2: data-testid removed — healer replaces getByTestId with a semantic locator.
  test('task card title is found by heading role (not removed data-testid)', async ({ page }) => {
    // Original broken test used: page.getByTestId('task-card-title')
    // The data-testid was removed when the component was refactored.
    // Healer diagnosed: the title is a heading element inside each card.
    const firstCard = page.getByRole('article').first();
    // TODO 3.2: Use getByRole('heading') inside firstCard — the healed locator.
    const title = firstCard.getByRole(/* TODO 3.2: 'heading' */ 'PLACEHOLDER');
    await expect(title).toBeVisible();
  });

  // Test 3: Assertion text changed — healer updates literal string to current value.
  test('column heading shows the correct status label', async ({ page }) => {
    // Original broken test asserted: toHaveText('TO DO')
    // The column heading text was changed to 'Todo' in a copy update.
    // Healer diagnosed: the current text is 'Todo' (not 'TO DO').
    const todoHeading = page.getByRole('heading', { name: /todo/i }).first();
    // TODO 3.3: Assert todoHeading has text matching /^Todo$/ (the current heading text).
    await expect(todoHeading).toHaveText(/* TODO 3.3: /^Todo$/ */ /PLACEHOLDER/);
  });

  // Test 4: Replace waitForTimeout with a proper wait strategy.
  test('task creation modal appears without a hardcoded timeout', async ({ page }) => {
    await page.getByRole('button', { name: 'New task' }).click();

    // Original broken test used: await page.waitForTimeout(3000)
    // This became flaky when the server was under load and the modal took 3.5 seconds.
    // Healer diagnosed: wait for the dialog element itself — no hardcoded timing.
    // TODO 3.4: Assert the dialog role is visible — the correct wait strategy.
    await expect(page.getByRole(/* TODO 3.4: 'dialog' */ 'PLACEHOLDER')).toBeVisible();

    await page.keyboard.press('Escape');
  });

  // Test 5: Wrong URL after redirect — healer corrects the expected URL pattern.
  test('opening a task detail navigates to the correct URL', async ({ page }) => {
    // Original broken test asserted: toHaveURL('/task-detail')
    // The URL structure changed from /task-detail?id=X to /projects/{slug}/tasks/{id}.
    await page.getByText('Design mockups').click();

    // TODO 3.5: Assert the URL matches the regex /tasks\// (the current task detail URL pattern).
    await expect(page).toHaveURL(/* TODO 3.5: /tasks\// */ /PLACEHOLDER/);
  });

  // Test 6: Sibling element confusion — healer scopes the locator more precisely.
  test('priority badge is scoped to the correct card element', async ({ page }) => {
    // Original broken test used: page.getByTestId('priority')
    // This matched multiple priority badges across all cards — the assertion was ambiguous.
    // Healer diagnosed: scope the locator to the first card using role="article".
    const firstCard = page.getByRole('article').first();
    const priorityBadge = firstCard.getByTestId('priority-badge');

    // TODO 3.6: Assert priorityBadge has text matching /High|Medium|Low|Critical/.
    await expect(priorityBadge).toHaveText(/* TODO 3.6: /High|Medium|Low|Critical/ */ /PLACEHOLDER/);
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
    // TODO 3.7: Assert todoColumn contains text 'Healed test task'.
    await expect(todoColumn).toContainText(/* TODO 3.7: 'Healed test task' */ 'PLACEHOLDER');
  });

});

test.describe('Part 4 — MCP Server & Agent Integration (formerly M80)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  // Test 1: browser_snapshot maps to page.accessibility.snapshot().
  // An agent calls snapshot() to "see" the page before deciding what to click.
  test('accessibility snapshot returns a structured tree with expected roles', async ({ page }) => {
    await page.goto('/projects/test-project');
    await page.waitForLoadState('networkidle');

    // page.accessibility.snapshot() is the MCP browser_snapshot tool.
    const snapshot = await page.accessibility.snapshot();

    // TODO 4.1: Assert snapshot is not null (the page has an accessible structure).
    expect(snapshot)./* TODO 4.1: not.toBeNull() */ toBeNull();
  });

  // Test 2: The snapshot tree contains a 'main' landmark — used by agents to scope their actions.
  test('snapshot contains a main landmark for agent navigation scoping', async ({ page }) => {
    await page.goto('/projects/test-project');
    await page.waitForLoadState('networkidle');

    const snapshot = await page.accessibility.snapshot();

    // Agents use landmarks (main, navigation, banner) to scope their tool calls.
    // The 'main' landmark scopes clicks/types to the content area.
    const mainLandmark = snapshot?.children?.find(n => n.role === 'main');

    // TODO 4.2: Assert mainLandmark is not undefined (the main landmark exists).
    expect(mainLandmark)./* TODO 4.2: not.toBeUndefined() */ toBeUndefined();
  });

  // Test 3: browser_navigate maps to page.goto().
  // An agent calls navigate with a URL — the Playwright equivalent is page.goto().
  test('MCP navigate tool equivalent: page.goto() resolves to the correct URL', async ({ page }) => {
    // An agent instruction: "navigate to the admin users page"
    await page.goto('/admin/users');

    // TODO 4.3: Assert the page URL ends with '/admin/users'.
    await expect(page).toHaveURL(/* TODO 4.3: /\/admin\/users$/ */ /PLACEHOLDER/);
  });

  // Test 4: browser_click maps to locator.click() — agents use the snapshot to find the selector.
  test('MCP click tool equivalent: click button identified from the snapshot', async ({ page }) => {
    await page.goto('/projects/test-project');

    // An agent would: 1) take snapshot, 2) find button with name 'New task', 3) click it.
    // This maps to: page.getByRole('button', { name: 'New task' }).click()
    // TODO 4.4: Click the 'New task' button using getByRole.
    await page.getByRole('button', { name: /* TODO 4.4: 'New task' */ 'PLACEHOLDER' }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
  });

  // Test 5: browser_evaluate maps to page.evaluate().
  // Agents call evaluate() to read data from the page's JavaScript context.
  test('MCP evaluate tool equivalent: read document title from the browser context', async ({ page }) => {
    await page.goto('/');

    // page.evaluate() is used by MCP's browser_evaluate tool.
    // TODO 4.5: Use page.evaluate() to return document.title.
    const title = await page.evaluate(/* TODO 4.5: () => document.title */ () => '');

    expect(title).toMatch(/Lumio/);
  });

  // Test 6: browser_type maps to locator.fill() — agents type text into inputs identified by label.
  test('MCP type tool equivalent: fill an input identified by its label', async ({ page }) => {
    await page.goto('/projects/test-project');
    await page.getByRole('button', { name: 'New task' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // An agent would: 1) snapshot, 2) find input labeled 'Task title', 3) type text.
    // This maps to: page.getByLabel('Task title').fill('Agent-created task')
    // TODO 4.6: Fill the 'Task title' input with 'Agent-created task'.
    await page.getByLabel(/* TODO 4.6: 'Task title' */ 'PLACEHOLDER').fill('Agent-created task');

    await expect(page.getByLabel('Task title')).toHaveValue('Agent-created task');
    await page.keyboard.press('Escape');
  });

  // Test 7: An agent-driven flow combining multiple MCP tool calls.
  test('complete agent-driven flow: navigate → snapshot → click → type → verify', async ({ page }) => {
    // This test simulates what an AI agent would do when given the instruction:
    // "Create a new task called 'MCP integration test' in the test project."

    // Step 1: navigate (browser_navigate)
    await page.goto('/projects/test-project');

    // Step 2: snapshot to discover the "New task" button (browser_snapshot)
    const snapshot = await page.accessibility.snapshot();
    const hasNewTaskButton = JSON.stringify(snapshot).includes('New task');

    // TODO 4.7: Assert hasNewTaskButton is true (the button is discoverable from the snapshot).
    expect(hasNewTaskButton).toBe(/* TODO 4.7: true */ false);

    // Step 3: click (browser_click)
    await page.getByRole('button', { name: 'New task' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Step 4: type (browser_type)
    await page.getByLabel('Task title').fill('MCP integration test');
    await page.getByRole('button', { name: 'Create task' }).click();

    // Step 5: verify (browser_snapshot or browser_evaluate)
    await expect(page.getByText('MCP integration test')).toBeVisible();
  });

});
