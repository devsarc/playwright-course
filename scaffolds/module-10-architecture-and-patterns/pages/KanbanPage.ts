import { type Page, type Locator } from '@playwright/test';

// M47: Page Object Model
//
// A POM wraps the raw Playwright page API behind meaningful method names.
// Tests call page.addCard('title') instead of scattering locator strings
// across multiple spec files. When Lumio's markup changes, you fix one file.

export class KanbanPage {
  readonly page: Page;

  // TODO 1: Declare Locator properties for the three column containers.
  // Each column has data-testid="kanban-column-{status}" where status is
  // "todo", "in-progress", or "done". Store them as readonly Locator fields.
  // Why store locators as fields? They're evaluated lazily — no DOM lookup
  // happens until you perform an action, so storing them is free.
  readonly todoColumn: Locator;
  readonly inProgressColumn: Locator;
  readonly doneColumn: Locator;

  // TODO 2: Declare a Locator for the "Add card" button.
  // data-testid="add-card-button"
  readonly addCardButton: /* TODO 2: Locator */ Locator;

  constructor(page: Page) {
    this.page = page;
    // TODO 3: Initialize all locators using page.getByTestId() in the constructor.
    // Locators must be created inside the constructor so they are bound to the
    // correct page instance — never pass strings around and call getByTestId later.
    this.todoColumn = page.getByTestId(/* TODO 3: 'kanban-column-todo' */);
    this.inProgressColumn = /* TODO 3 */ page.getByTestId('PLACEHOLDER');
    this.doneColumn = /* TODO 3 */ page.getByTestId('PLACEHOLDER');
    this.addCardButton = /* TODO 3 */ page.getByTestId('PLACEHOLDER');
  }

  // TODO 4: Implement goto() — navigate to the kanban board.
  // Accept a projectId parameter and navigate to /projects/{projectId}/board.
  async goto(projectId: string): Promise<void> {
    /* TODO 4 */
  }

  // TODO 5: Implement addCard(title) — click the add-card button, fill the
  // title input (data-testid="new-card-input"), and press Enter to submit.
  // The method should return a Locator pointing to the new card so the caller
  // can assert on it. Locator: getByTestId('kanban-card').filter({ hasText: title })
  async addCard(title: string): Promise<Locator> {
    /* TODO 5 */
  }

  // TODO 6: Implement cardCount(columnLocator) — return the number of cards
  // in a given column. Use column.getByTestId('kanban-card').count().
  // Why a method instead of a raw .count() call? It centralises the card
  // selector — if 'kanban-card' is renamed, one edit fixes everything.
  async cardCount(column: Locator): Promise<number> {
    /* TODO 6 */
  }
}
