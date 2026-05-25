import { test, expect } from '../fixtures/fixtures';

// M23: Advanced Input & Interactions
//
// Playwright supports drag-and-drop via two APIs:
//   1. locator.dragTo(target) — high-level, works for mouse-event-based libraries
//   2. page.dragAndDrop(source, target) — CSS-selector-based shorthand
//   3. page.mouse API — for full manual control when high-level APIs fail
//
// Lumio's kanban uses @hello-pangea/dnd (react-beautiful-dnd fork).
// It listens to mouse events, not the HTML5 drag API, so locator.dragTo() works.

test.describe('Kanban drag-and-drop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects/demo/board');
  });

  test('drag card from To Do to In Progress', async ({ page }) => {
    // TODO 1: Get the first card in the "todo" column.
    // Column: data-testid="kanban-column-todo"
    // Card: data-testid="kanban-card" (first one, .first())
    const sourceCard = page
      .getByTestId(/* TODO 1: 'kanban-column-todo' */)
      .getByTestId(/* TODO 1: 'kanban-card' */)
      .first();

    // TODO 2: Get the "in-progress" column as the drop target.
    const targetColumn = page.getByTestId(/* TODO 2: 'kanban-column-in-progress' */);

    // TODO 3: Read the card title before dragging — the element moves DOM position,
    // so reading text afterward from the original locator may return stale data.
    const cardTitle = await sourceCard.textContent();

    // TODO 4: Drag the source card to the target column using locator.dragTo().
    // dragTo() fires mousedown -> mousemove -> mouseup, which is what the library needs.
    await sourceCard.dragTo(/* TODO 4: targetColumn */);

    // TODO 5: Assert the card now appears in the in-progress column.
    await expect(
      targetColumn.getByTestId('kanban-card').filter({ hasText: cardTitle! })
    )/* TODO 5: toBeVisible() */;
  });

  test('drag card from In Progress to Done', async ({ page }) => {
    // TODO 6: Move a card from in-progress to done.
    // Source: first card in kanban-column-in-progress
    // Target: kanban-column-done
    const sourceCard = page
      .getByTestId(/* TODO 6: 'kanban-column-in-progress' */)
      .getByTestId('kanban-card')
      .first();
    const targetColumn = page.getByTestId(/* TODO 6: 'kanban-column-done' */);
    const cardTitle = await sourceCard.textContent();
    await sourceCard.dragTo(targetColumn);
    await expect(
      targetColumn.getByTestId('kanban-card').filter({ hasText: cardTitle! })
    ).toBeVisible();
  });

  test('drag card back to To Do (revert flow)', async ({ page }) => {
    // TODO 7: Move a card from done back to todo to verify bidirectional DnD.
    // This catches a common bug where the library only supports forward drops.
    /* TODO 7 */
  });

  test('drag with steps option for slow-motion libraries', async ({ page }) => {
    // TODO 8: Pass { steps: 20 } to dragTo().
    // steps: N inserts N intermediate mousemove events — some DnD libraries
    // need these intermediate events to trigger their drag detection logic.
    const sourceCard = page
      .getByTestId('kanban-column-todo')
      .getByTestId('kanban-card')
      .first();
    const targetColumn = page.getByTestId('kanban-column-in-progress');
    await sourceCard.dragTo(targetColumn, /* TODO 8: { steps: 20 } */);
    const cardTitle = await targetColumn.getByTestId('kanban-card').first().textContent();
    expect(cardTitle).toBeTruthy();
  });
});
