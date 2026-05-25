import { test, expect } from '../fixtures/fixtures';

// M42: Playwright Inspector & Codegen
//
// This module is primarily a TOOLING exercise. The tests here are designed to be run
// with --headed or PWDEBUG=1 so you can observe the Inspector in action.
//
// Primary task: run `npx playwright codegen http://localhost:3000` BEFORE starting these
// exercises. Record a task creation flow and copy the generated code into a text editor.
// You will evaluate and refine that output as part of this module.

test.describe('M42 — Inspector & Codegen', () => {

  // Test 1: Demonstrate page.pause() — the Inspector entry point
  test('page.pause() opens the Inspector mid-test', async ({ page }) => {
    await page.goto('/dashboard');

    // TODO 1: Add a page.pause() call here to open the Inspector.
    // Why? page.pause() is the fastest way to inspect the page state mid-test
    // without adding console.log statements or modifying assertions.
    // Run this test with --headed to see the Inspector open.
    // IMPORTANT: Remove page.pause() before committing — it will hang in CI.
    // TODO 1: await page.pause();

    // After pausing (and then pressing "Resume" in the Inspector), the test continues.
    await expect(page).toHaveURL(/* TODO 1: '/dashboard' */);
  });

  // Test 2: Evaluate a codegen-generated locator
  // After running codegen, you likely got a selector like '#kanban-column-header-todo'
  // or a CSS selector. This test shows how to validate a locator with getByRole instead.
  test('kanban column header — replace fragile codegen selector with getByRole', async ({ page }) => {
    await page.goto('/dashboard');

    // Codegen might have generated: page.locator('[data-column="todo"] h2')
    // The correct, resilient version uses getByRole:
    // TODO 2: Find the "To Do" column heading using getByRole.
    // Use role 'heading' with the name 'To Do'.
    // Why getByRole over the CSS selector codegen produced? The CSS path breaks when
    // the markup restructures; the role + name stays valid as long as the heading is there.
    const todoHeading = page.getByRole(/* TODO 2: 'heading', { name: 'To Do' } */);
    await expect(todoHeading).toBeVisible();
  });

  // Test 3: Use the locator count to verify uniqueness
  // The Inspector shows match counts — this test exercises the same concept in code.
  test('verify a locator matches exactly one element', async ({ page }) => {
    await page.goto('/dashboard');

    // After running the Inspector's locator picker, you get a locator string.
    // Before using it in a real test, always verify it matches exactly one element.
    const addTaskButton = page.getByRole('button', { name: 'Add task' });

    // TODO 3: Assert that exactly one 'Add task' button is visible.
    // locator.count() returns the number of matching elements.
    // Why? A locator that matches multiple elements will cause failures in strict mode
    // and may click the wrong element even when strict mode is off.
    const count = await addTaskButton.count();
    expect(count).toBe(/* TODO 3: 1 */);
  });

  // Test 4: Evaluate assertion generation from the Inspector
  // The Inspector's "Assertions" panel generates assertions like toHaveText, toBeVisible.
  // This test exercises a complete interaction flow that you would record with codegen.
  test('task creation flow — complete the scaffold from codegen output', async ({ page }) => {
    await page.goto('/dashboard');

    // This is what codegen would generate for a task creation flow.
    // Complete the TODOs with the correct locators (improve on what codegen would produce).

    // TODO 4: Click the 'Add task' button using getByRole.
    await page.getByRole(/* TODO 4: 'button', { name: 'Add task' } */).click();

    // TODO 5: Assert that the task creation dialog is visible.
    await expect(page.getByRole(/* TODO 5: 'dialog' */)).toBeVisible();

    // TODO 6: Fill the task title input using getByTestId.
    await page.getByTestId(/* TODO 6: 'task-title-input' */).fill('Codegen test task');

    // TODO 7: Click the submit button and assert the dialog closes.
    await page.getByTestId(/* TODO 7: 'task-submit' */).click();
    await expect(page.getByRole(/* TODO 7: 'dialog' */)).not.toBeVisible();

    // TODO 8: Assert the new task card is visible on the board.
    // Codegen would not generate this — you must add assertions manually.
    await expect(page.getByTestId('task-card').filter({ hasText: /* TODO 8: 'Codegen test task' */ '' })).toBeVisible();
  });

});
