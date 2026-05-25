import { test, expect } from '../fixtures/fixtures';

// M80: MCP Server & Agent Integration
// The Playwright MCP server exposes browser automation tools to AI agents.
// These exercises demonstrate the Playwright APIs that underpin the MCP tools,
// so you understand what the MCP server is doing when an agent calls its tools.

test.describe('M80 — MCP Server & Agent Integration', () => {

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

    // TODO 1: Assert snapshot is not null (the page has an accessible structure).
    expect(snapshot)./* TODO 1: not.toBeNull() */ toBeNull();
  });

  // Test 2: The snapshot tree contains a 'main' landmark — used by agents to scope their actions.
  test('snapshot contains a main landmark for agent navigation scoping', async ({ page }) => {
    await page.goto('/projects/test-project');
    await page.waitForLoadState('networkidle');

    const snapshot = await page.accessibility.snapshot();

    // Agents use landmarks (main, navigation, banner) to scope their tool calls.
    // The 'main' landmark scopes clicks/types to the content area.
    const mainLandmark = snapshot?.children?.find(n => n.role === 'main');

    // TODO 2: Assert mainLandmark is not undefined (the main landmark exists).
    expect(mainLandmark)./* TODO 2: not.toBeUndefined() */ toBeUndefined();
  });

  // Test 3: browser_navigate maps to page.goto().
  // An agent calls navigate with a URL — the Playwright equivalent is page.goto().
  test('MCP navigate tool equivalent: page.goto() resolves to the correct URL', async ({ page }) => {
    // An agent instruction: "navigate to the admin users page"
    await page.goto('/admin/users');

    // TODO 3: Assert the page URL ends with '/admin/users'.
    await expect(page).toHaveURL(/* TODO 3: /\/admin\/users$/ */ /PLACEHOLDER/);
  });

  // Test 4: browser_click maps to locator.click() — agents use the snapshot to find the selector.
  test('MCP click tool equivalent: click button identified from the snapshot', async ({ page }) => {
    await page.goto('/projects/test-project');

    // An agent would: 1) take snapshot, 2) find button with name 'New task', 3) click it.
    // This maps to: page.getByRole('button', { name: 'New task' }).click()
    // TODO 4: Click the 'New task' button using getByRole.
    await page.getByRole('button', { name: /* TODO 4: 'New task' */ 'PLACEHOLDER' }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
  });

  // Test 5: browser_evaluate maps to page.evaluate().
  // Agents call evaluate() to read data from the page's JavaScript context.
  test('MCP evaluate tool equivalent: read document title from the browser context', async ({ page }) => {
    await page.goto('/');

    // page.evaluate() is used by MCP's browser_evaluate tool.
    // TODO 5: Use page.evaluate() to return document.title.
    const title = await page.evaluate(/* TODO 5: () => document.title */ () => '');

    expect(title).toMatch(/Lumio/);
  });

  // Test 6: browser_type maps to locator.fill() — agents type text into inputs identified by label.
  test('MCP type tool equivalent: fill an input identified by its label', async ({ page }) => {
    await page.goto('/projects/test-project');
    await page.getByRole('button', { name: 'New task' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // An agent would: 1) snapshot, 2) find input labeled 'Task title', 3) type text.
    // This maps to: page.getByLabel('Task title').fill('Agent-created task')
    // TODO 6: Fill the 'Task title' input with 'Agent-created task'.
    await page.getByLabel(/* TODO 6: 'Task title' */ 'PLACEHOLDER').fill('Agent-created task');

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

    // TODO 7: Assert hasNewTaskButton is true (the button is discoverable from the snapshot).
    expect(hasNewTaskButton).toBe(/* TODO 7: true */ false);

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
