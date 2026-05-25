import { test, expect } from '../fixtures/fixtures';

// M50: Test Organization & Suite Architecture
//
// This module demonstrates tagging, fixme, and suite configuration.
// Run specific tags:
//   npx playwright test tests/module-50-test-organization --grep @smoke
//   npx playwright test tests/module-50-test-organization --grep @regression

test.describe('M50 — Test Organization & Suite Architecture', () => {

  // ─── Smoke tests ────────────────────────────────────────────────────────────
  // @smoke tests must be fast (<5s each) and cover the critical path only.

  // TODO 1: Add '@smoke' to this test name so it can be filtered with --grep @smoke.
  // Why? Smoke tests run on every commit — they need to be identifiable separately
  // from the full regression suite. Tagging by name requires no configuration.
  test('dashboard loads @smoke', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
  });

  // TODO 2: Add '@smoke' to this test name.
  test('Add task button is present @smoke', async ({ page }) => {
    await page.goto('/dashboard');

    // TODO 2: Assert that the 'Add task' button is visible.
    await expect(page.getByRole('button', { name: 'Add task' }).first())./* TODO 2: toBeVisible() */ toBeAttached();
  });

  // ─── Regression tests ───────────────────────────────────────────────────────
  // @regression tests cover broader scenarios. Run before releases.

  // TODO 3: Add '@regression' to this test name.
  test('task creation dialog opens and closes @regression', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Add task' }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // TODO 3: Close the dialog — press Escape — and assert it is no longer visible.
    await page.keyboard.press(/* TODO 3: 'Escape' */);
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('task creation full flow @regression', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Add task' }).first().click();
    await page.getByTestId('task-title-input').fill('Organization test task');
    await page.getByTestId('task-submit').click();
    await expect(
      page.getByTestId('task-card').filter({ hasText: 'Organization test task' })
    ).toBeVisible();
  });

  // ─── Accessibility tests ─────────────────────────────────────────────────────
  // @accessibility tests verify the app is usable with assistive technology.

  // TODO 4: Add '@accessibility' to this test name.
  test('kanban board has accessible column headings @accessibility', async ({ page }) => {
    await page.goto('/dashboard');

    // TODO 4: Assert that the 'To Do' heading is visible using getByRole.
    const todoHeading = page.getByRole(/* TODO 4: 'heading', { name: 'To Do' } */);
    await expect(todoHeading).toBeVisible();
  });

  // ─── Using test.fixme() ──────────────────────────────────────────────────────
  // test.fixme() marks a known failure without deleting the test.
  // The test appears as skipped in reports with a reason — tracked, not forgotten.

  // TODO 5: Use test.fixme() to mark this test as a known failure.
  // Add a bug reference: test.fixme(true, 'LUM-9999: task drag-and-drop intermittently fails')
  // Why? Deleting the test loses the signal that the behavior is untested.
  // fixme() keeps the test visible in reports while the bug is open.
  test('task drag-and-drop @regression', async ({ page }) => {
    // TODO 5: Add test.fixme() call here with a bug reference.
    test.fixme(/* TODO 5: true, 'LUM-9999: task drag-and-drop intermittently fails' */);

    // This test body would normally test drag-and-drop behavior.
    // With fixme() active, it never executes.
    await page.goto('/dashboard');
  });

  // ─── Understanding test.skip() vs test.fixme() ──────────────────────────────

  test('distinguishes skip from fixme @smoke', async ({}) => {
    // test.skip() — "this test doesn't apply right now" (platform, feature flag, etc.)
    // test.fixme() — "this test is broken and we know it" (open bug, tracked)

    // TODO 6: Set the correct value for each variable.
    // Which one means "broken behavior tracked by a bug"?
    const brokenWithBug = /* TODO 6: 'fixme' */ '';
    // Which one means "not applicable in this environment"?
    const notApplicable = /* TODO 6: 'skip' */ '';

    expect(brokenWithBug).toBe('fixme');
    expect(notApplicable).toBe('skip');
  });

  // ─── Suite configuration ─────────────────────────────────────────────────────

  // test.describe.configure() sets mode/retries/timeout for a describe block.
  // This is better than duplicating config on individual tests.
  test.describe('slow integration suite', () => {
    // TODO 7: Call test.describe.configure() with timeout: 60_000.
    // Why? These tests call external services and need more time — setting the timeout
    // at the describe level applies it to all tests inside without repeating it.
    test.describe.configure(/* TODO 7: { timeout: 60_000 } */);

    test('slow test placeholder @regression', async ({ page }) => {
      await page.goto('/dashboard');
      // A real slow test would call an external API or wait for WebSocket messages.
      await expect(page).toHaveURL('/dashboard');
    });
  });

  // ─── Tag filtering awareness ──────────────────────────────────────────────────

  test('understands grep filtering @smoke', async ({}) => {
    // Run only smoke: npx playwright test --grep @smoke
    // Run only regression: npx playwright test --grep @regression
    // Combine: npx playwright test --grep "@smoke|@regression"
    // Exclude: npx playwright test --grep-invert @slow

    // TODO 8: Set to true once you've verified that --grep @smoke skips the @regression tests.
    // Why? Understanding tag filtering is what makes the tagging strategy actually useful —
    // if you can't filter by tag, the tags are just decorative text.
    const greppingUnderstood = /* TODO 8: true */ false;
    expect(greppingUnderstood).toBe(true);
  });

});
