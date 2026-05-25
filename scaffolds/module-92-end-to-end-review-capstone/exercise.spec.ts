import { test, expect } from '../fixtures/fixtures';
import { KanbanPage } from '../module-47-page-object-model/pages/KanbanPage';
import AxeBuilder from '@axe-core/playwright';

// M92: End-to-End Review & Capstone
//
// This module ties together the techniques from M20-M34 in a single realistic
// user journey: signup -> create project -> add and manage cards -> share board.
//
// Each test in this suite builds on the previous one using test.step() to
// document the sub-actions within a longer flow. The suite uses:
//   - POMs (M20)
//   - Accessibility checks (M23)
//   - File upload (M25)
//   - Real-time sync (M28)
//   - Performance budget (M33)

const NEW_USER = {
  name: 'Capstone User',
  email: `capstone-${Date.now()}@lumio.test`,
  password: 'Capstone123!',
};

test.describe('Capstone: Full user journey', () => {
  test('signup -> create project -> add cards -> verify board', async ({ page, context }) => {
    // STEP 1: Sign up as a new user
    await test.step('Sign up', async () => {
      // TODO 1: Navigate to /signup and fill the signup form.
      // Fields: name (data-testid="signup-name"), email (data-testid="signup-email"),
      //         password (data-testid="signup-password")
      // Submit: getByRole('button', { name: 'Create account' })
      await page.goto('/signup');
      await page.getByTestId('signup-name').fill(NEW_USER.name);
      await page.getByTestId('signup-email').fill(/* TODO 1: NEW_USER.email */);
      await page.getByTestId('signup-password').fill(/* TODO 1: NEW_USER.password */);
      await page.getByRole('button', { name: 'Create account' }).click();
      await expect(page).toHaveURL(/* TODO 1: /\/dashboard/ */);
    });

    // STEP 2: Create a new project
    await test.step('Create project', async () => {
      // TODO 2: Click "New project" and fill the project name.
      // data-testid="new-project-button", data-testid="project-name-input"
      await page.getByTestId('new-project-button').click();
      await page.getByTestId('project-name-input').fill('Capstone Project');
      await page.getByRole('button', { name: 'Create' }).click();
      await expect(page).toHaveURL(/* TODO 2: /\/projects\// */);
    });

    // STEP 3: Add three cards using the POM
    await test.step('Add cards to the board', async () => {
      // TODO 3: Navigate to the board URL and use KanbanPage POM to add 3 cards.
      // The board URL is the current page URL + /board.
      const boardUrl = page.url() + '/board';
      const kanban = new KanbanPage(page);
      await page.goto(boardUrl);

      // TODO 3: Add three cards using kanban.addCard()
      await kanban.addCard('Task 1: Research');
      await kanban.addCard('Task 2: Design');
      await kanban.addCard(/* TODO 3: 'Task 3: Implement' */);

      const count = await kanban.cardCount(kanban.todoColumn);
      expect(count).toBeGreaterThanOrEqual(3);
    });

    // STEP 4: Move a card to In Progress
    await test.step('Move card to In Progress', async () => {
      // TODO 4: Drag the first card to the In Progress column.
      const kanban = new KanbanPage(page);
      const firstCard = kanban.todoColumn.getByTestId('kanban-card').first();
      await firstCard.dragTo(/* TODO 4: kanban.inProgressColumn */);
      await expect(
        kanban.inProgressColumn.getByTestId('kanban-card')
      ).toHaveCount({ min: 1 } as any);
    });

    // STEP 5: Accessibility check on the board
    await test.step('Accessibility audit', async () => {
      // TODO 5: Run axe-core on the board and assert no WCAG 2.1 AA violations.
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(violations).toEqual(/* TODO 5: [] */);
    });

    // STEP 6: Performance budget check
    await test.step('Performance budget', async () => {
      // TODO 6: Assert the board loaded all columns within 5000ms since we
      // already navigated to it. Re-navigate and time it.
      const start = Date.now();
      await page.reload();
      await page.getByTestId('kanban-column-todo').waitFor();
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(/* TODO 6: 5000 */);
    });
  });

  test('two users collaborate: card appears in real-time', async ({ browser }) => {
    const ctxAuthor = await browser.newContext({
      storageState: 'tests/fixtures/auth/user-a.json',
    });
    const ctxViewer = await browser.newContext({
      storageState: 'tests/fixtures/auth/user-b.json',
    });

    const authorPage = await ctxAuthor.newPage();
    const viewerPage = await ctxViewer.newPage();

    // TODO 7: Navigate both users to the demo board.
    await authorPage.goto('/projects/demo/board');
    await viewerPage.goto(/* TODO 7: '/projects/demo/board' */);

    // TODO 8: Author adds a card with a unique title.
    const cardTitle = `capstone-collab-${Date.now()}`;
    await authorPage.getByTestId('add-card-button').click();
    await authorPage.getByTestId('new-card-input').fill(cardTitle);
    await authorPage.getByTestId('new-card-input').press('Enter');

    // TODO 9: Viewer asserts the card appears without reloading.
    await expect(
      viewerPage.getByTestId('kanban-card').filter({ hasText: cardTitle })
    )/* TODO 9: toBeVisible() */;

    await ctxAuthor.close();
    await ctxViewer.close();
  });
});
