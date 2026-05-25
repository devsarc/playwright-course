import { test, expect } from '../fixtures/fixtures';
import { KanbanPage } from './pages/KanbanPage';

// M47: Page Object Model
//
// Good POMs: thin wrappers that hide selectors, not business-logic layers.
// They return Locators (not element handles) so callers still get auto-waiting.
// Keep assertion logic in the spec — not in the POM — so failures are readable.

const PROJECT_ID = 'demo'; // seed data project id

test.describe('KanbanPage POM', () => {
  let kanban: KanbanPage;

  test.beforeEach(async ({ page }) => {
    // TODO 7: Instantiate KanbanPage and call goto(PROJECT_ID).
    // POMs are just plain classes — they don't need special registration.
    /* TODO 7 */
  });

  test('displays three columns', async ({ page }) => {
    // TODO 8: Use the POM locators (kanban.todoColumn, etc.) to assert that
    // all three columns are visible.
    await expect(/* TODO 8: kanban.todoColumn */).toBeVisible();
    await expect(/* TODO 8 */).toBeVisible();
    await expect(/* TODO 8 */).toBeVisible();
  });

  test('addCard() creates a card in the To Do column', async ({ page }) => {
    const title = 'POM test card';
    // TODO 9: Call kanban.addCard(title) and assert the returned Locator
    // is visible inside kanban.todoColumn.
    // Hint: use kanban.todoColumn.locator(cardLocator) to scope the assertion.
    const card = await kanban.addCard(/* TODO 9: title */);
    await expect(/* TODO 9 */).toBeVisible();
  });

  test('cardCount() returns correct number for a column', async ({ page }) => {
    // TODO 10: Call kanban.cardCount(kanban.todoColumn) and assert it is
    // greater than or equal to 0. Then add a card and assert the count increases by 1.
    const before = await kanban.cardCount(/* TODO 10 */);
    await kanban.addCard('count test');
    const after = await kanban.cardCount(/* TODO 10 */);
    expect(after).toBe(/* TODO 10: before + 1 */);
  });
});
