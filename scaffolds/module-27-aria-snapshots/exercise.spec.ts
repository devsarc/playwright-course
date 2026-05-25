import { test, expect } from '../fixtures/fixtures';

// M27: ARIA Snapshot Testing
//
// toMatchAriaSnapshot() serialises the accessibility tree of a locator into
// YAML and compares it against an expected string you provide inline.
// Unlike toHaveScreenshot(), it has no external baseline files — the expected
// YAML lives right here in the test.
//
// Run once with --update-snapshots to let Playwright generate the initial
// YAML for you, then paste it back into the test and commit it.

test.describe('ARIA snapshots — kanban board', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('kanban board has expected heading and list structure', async ({ page }) => {
    // TODO 1: Get the kanban board container using getByTestId('kanban-board').
    // We scope the assertion to this element so unrelated page content does not
    // appear in the snapshot and cause false positives.
    const board = page.getByTestId(/* TODO 1: 'kanban-board' */);

    // TODO 2: Call toMatchAriaSnapshot() with an inline YAML string that
    // asserts the board contains a heading "Kanban Board" and a list of
    // listitems beneath it.
    // ARIA snapshots catch structural regressions — e.g. the heading being
    // demoted from h1 to h2, or the list being replaced with a div — that
    // pixel-level screenshots would never detect.
    await expect(board).toMatchAriaSnapshot(/* TODO 2: `
      - heading "Kanban Board" [level=1]
      - list:
        - listitem
        - listitem
        - listitem
    ` */);
  });

  test('each task card exposes role, name, and status to assistive technology', async ({ page }) => {
    // TODO 3: Locate the first kanban card with getByTestId('kanban-card').first().
    // Scoping to a single card keeps the snapshot small and focused — the goal
    // is to assert the semantic structure of one card, not the entire board.
    const firstCard = page.getByTestId(/* TODO 3: 'kanban-card' */).first();

    // TODO 4: Assert that the card's ARIA snapshot contains a listitem with a
    // heading (the task title) and at least one text node for status/priority.
    // If a developer accidentally removes the heading role from the task title,
    // this test will fail even though the card looks identical on screen.
    await expect(firstCard).toMatchAriaSnapshot(/* TODO 4: `
      - listitem:
        - heading
        - text: /todo|in.progress|done/i
    ` */);
  });
});

test.describe('ARIA snapshots — task creation modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    // Open the task creation modal before each test in this describe block.
    await page.getByRole('button', { name: 'Add task' }).click();
    // Wait for the dialog to be visible in the accessibility tree before asserting.
    await page.getByRole('dialog').waitFor({ state: 'visible' });
  });

  test('"Add task" button is present and named correctly in the ARIA tree', async ({ page }) => {
    // This test navigates before clicking, so we need a fresh page state.
    await page.goto('/dashboard');

    // TODO 5: Locate the "Add task" button using getByRole('button', { name: 'Add task' }).
    // Then assert its ARIA snapshot contains exactly one button named "Add task".
    // Role + name assertions like this confirm that the button is correctly
    // labelled for screen readers — a button with no accessible name is useless
    // to assistive technology even if it renders a visible icon or text.
    const addTaskBtn = page.getByRole(/* TODO 5: 'button', { name: 'Add task' } */);
    await expect(addTaskBtn).toMatchAriaSnapshot(/* TODO 5: `
      - button "Add task"
    ` */);
  });

  test('task creation dialog has the expected modal structure', async ({ page }) => {
    const dialog = page.getByRole('dialog');

    // TODO 6: Assert the dialog's ARIA snapshot. The modal should expose:
    //   - A dialog role at the root
    //   - A heading "New task" inside it
    //   - A textbox labelled "Task name"
    //   - A combobox or group labelled "Priority"
    //   - A button "Save task"
    // Modal structure in the accessibility tree is critical for screen reader
    // users: they rely on role="dialog" and aria-modal to know they are in a
    // focused context, and on labelled form controls to fill out the form.
    await expect(dialog).toMatchAriaSnapshot(/* TODO 6: `
      - dialog:
        - heading "New task" [level=2]
        - textbox "Task name"
        - combobox "Priority"
        - button "Save task"
    ` */);
  });

  test('closing the modal removes the dialog from the accessibility tree', async ({ page }) => {
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // TODO 7: Close the modal by pressing Escape (page.keyboard.press('Escape')).
    // Then assert the dialog is no longer in the accessibility tree using
    // expect(dialog).not.toBeVisible() or expect(dialog).toBeHidden().
    // Focus management and tree cleanup are accessibility requirements — a
    // dialog that disappears visually but remains in the a11y tree confuses
    // screen readers by leaving a ghost element they can still navigate to.
    await page.keyboard.press(/* TODO 7: 'Escape' */);
    await expect(dialog).toBeHidden(/* TODO 7 */);
  });
});

test.describe('Updating ARIA snapshots after intentional UI changes', () => {
  test('demonstrates the --update-snapshots workflow', async ({ page }) => {
    await page.goto('/dashboard');

    // TODO 8: This test intentionally shows the update workflow.
    // When you make a deliberate change to Lumio's UI (e.g. renaming the
    // "Add task" button to "Create task"), existing ARIA snapshots will fail.
    // To accept the new structure as the new truth, run:
    //
    //   npx playwright test module-27 --update-snapshots
    //
    // Playwright will rewrite every toMatchAriaSnapshot() call in this file
    // with the current accessibility tree. Review the diff in git before
    // committing — --update-snapshots should always be an intentional action,
    // never a reflex to silence a red test.
    //
    // For now, just assert the "Add task" button exists so the test is runnable.
    const addTaskBtn = page.getByRole('button', { name: 'Add task' });
    await expect(addTaskBtn).toMatchAriaSnapshot(/* TODO 8: `
      - button "Add task"
    ` */);
  });
});
