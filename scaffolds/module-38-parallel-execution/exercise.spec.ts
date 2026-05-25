import { test, expect } from '../fixtures/fixtures';

// M38: Parallel Execution & Test Isolation
//
// These tests are explicitly designed to run in parallel safely.
// Each test creates its own unique workspace to avoid shared-state conflicts.
// Run with: npx playwright test tests/module-38-parallel-execution --workers 4

// TODO 1: Add test.describe.configure({ mode: 'parallel' }) here to enable
// intra-file parallelism for this describe block.
// Why? By default, tests within a file run sequentially even with fullyParallel: true.
// describe.configure({ mode: 'parallel' }) opts this specific describe block into
// full parallel execution within the file.
test.describe('M38 — Parallel Execution', () => {

  /* TODO 1: test.describe.configure({ mode: 'parallel' }); */

  // Helper: generate a unique workspace name to avoid conflicts between parallel tests
  function uniqueWorkspace(label: string): string {
    // TODO 2: Return a string that combines the label with Date.now() to guarantee uniqueness.
    // Why? If two parallel tests both try to create a workspace named 'test-workspace',
    // the second one will get a slug-uniqueness error. Unique names prevent this race condition.
    return /* TODO 2: `${label}-${Date.now()}` */;
  }

  test('parallel test A — creates and reads its own workspace', async ({ page }) => {
    const workspaceName = uniqueWorkspace('parallel-a');
    await page.goto('/onboarding/workspace');

    await page.getByTestId('workspace-name-input').fill(workspaceName);
    await page.getByTestId('workspace-submit-button').click();
    await expect(page).toHaveURL('/onboarding/invite');

    // Navigate to dashboard and assert the workspace name is shown
    await page.goto('/dashboard');
    // TODO 3: Assert the workspace name appears somewhere on the dashboard.
    await expect(page.getByText(/* TODO 3: workspaceName */)).toBeVisible();
  });

  test('parallel test B — creates and reads its own workspace', async ({ page }) => {
    const workspaceName = uniqueWorkspace('parallel-b');
    await page.goto('/onboarding/workspace');

    await page.getByTestId('workspace-name-input').fill(workspaceName);
    await page.getByTestId('workspace-submit-button').click();
    await expect(page).toHaveURL('/onboarding/invite');

    await page.goto('/dashboard');
    // TODO 4: Assert the workspace name appears on the dashboard (same pattern as test A).
    await expect(page.getByText(/* TODO 4: workspaceName */)).toBeVisible();
  });

  // This test intentionally demonstrates what happens when tests share state:
  // a shared counter that gets corrupted when two tests increment it simultaneously.
  // Read the code, complete the TODOs, and observe the race condition.
  test('demonstrates why shared mutable state breaks in parallel', async ({ page }) => {
    // Intentionally BAD pattern — shared state in test code
    // In a real parallel suite this would fail intermittently:
    // let sharedCounter = 0;
    // test A: sharedCounter++ (reads 0, writes 1)
    // test B: sharedCounter++ (also reads 0, writes 1 — lost update)

    // The CORRECT pattern: each test owns its own isolated state.
    // TODO 5: Declare a LOCAL counter variable (not shared) and assert it increments correctly.
    let localCounter = /* TODO 5: 0 */ 0;
    localCounter += 1;
    expect(localCounter).toBe(/* TODO 5: 1 */);

    // Navigate to dashboard to make this a real browser test
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/* TODO 6: '/dashboard' */);
  });

  // Demonstrates worker-scoped fixture concept (conceptual — actual implementation in M48)
  test('expensive setup should use worker-scoped fixtures, not per-test setup', async ({ page }) => {
    // TODO 7: Navigate to /dashboard and assert the page has loaded by checking for a heading.
    // The comment here is the lesson: if this test needed a database seed, running that seed
    // once per WORKER (not once per test) via a worker-scoped fixture would be ~4x faster
    // with 4 workers than running it once per test.
    await page.goto(/* TODO 7: '/dashboard' */);
    await expect(page.getByRole(/* TODO 7: 'main' */)).toBeVisible();
  });

});
