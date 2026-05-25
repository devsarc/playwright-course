import { test, expect, type BrowserContext } from '../fixtures/fixtures';

// M31: Multi-Tab & Popup Management
//
// Multi-tab: open a second page in the SAME BrowserContext.
//   Both pages share cookies and localStorage — same user, two tabs.
//   Use: context.newPage()
//
// Multi-user: create a SECOND BrowserContext with its own auth state.
//   Each context is a separate browser profile — different user sessions.
//   Use: browser.newContext()

test.describe('Multi-tab — same user, two tabs', () => {
  test('card created in tab A appears in tab B', async ({ context }) => {
    // TODO 1: Open two pages in the same context.
    // context.newPage() creates a second tab that shares the session.
    const pageA = await context.newPage();
    const pageB = await context.newPage();

    // TODO 2: Navigate both tabs to the same board.
    await pageA.goto('/projects/demo/board');
    await pageB.goto(/* TODO 2: '/projects/demo/board' */);

    // TODO 3: Add a card in pageA.
    const title = `multi-tab-${Date.now()}`;
    await pageA.getByTestId('add-card-button').click();
    await pageA.getByTestId('new-card-input').fill(title);
    await pageA.getByTestId('new-card-input').press('Enter');

    // TODO 4: Assert the card is visible in pageB without reloading.
    // The board uses real-time sync — the card should appear via WebSocket.
    // If it does not appear within the default timeout, the real-time feature is broken.
    await expect(
      pageB.getByTestId('kanban-card').filter({ hasText: title })
    )/* TODO 4: toBeVisible() */;
  });
});

test.describe('Multi-user — two independent sessions', () => {
  test('user B sees card created by user A', async ({ browser }) => {
    // TODO 5: Create two independent BrowserContexts (two separate user sessions).
    // Use browser.newContext() for each — they do NOT share cookies.
    // Authenticate each context differently (e.g., pass storageState for different users).
    const contextA = await browser.newContext(/* TODO 5: {
      storageState: 'tests/fixtures/auth/user-a.json',
    } */);
    const contextB = await browser.newContext(/* TODO 5: {
      storageState: 'tests/fixtures/auth/user-b.json',
    } */);

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    // TODO 6: Navigate both users to the same shared board.
    await pageA.goto('/projects/demo/board');
    await pageB.goto('/projects/demo/board');

    // TODO 7: User A adds a card with a unique title.
    const cardTitle = `collab-${Date.now()}`;
    await pageA.getByTestId('add-card-button').click();
    await pageA.getByTestId('new-card-input').fill(cardTitle);
    await pageA.getByTestId('new-card-input').press('Enter');

    // TODO 8: Assert User B sees the card in their view (real-time sync).
    await expect(
      pageB.getByTestId('kanban-card').filter({ hasText: cardTitle })
    ).toBeVisible();

    // TODO 9: Clean up both contexts to free browser resources.
    await contextA.close();
    await contextB.close();
  });

  test('user A presence avatar appears in user B view', async ({ browser }) => {
    const contextA = await browser.newContext({
      storageState: 'tests/fixtures/auth/user-a.json',
    });
    const contextB = await browser.newContext({
      storageState: 'tests/fixtures/auth/user-b.json',
    });

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    // TODO 10: Navigate User A to the board first, then User B.
    // Assert User B's view shows a presence avatar for User A.
    // data-testid="presence-avatar" (one per online user)
    await pageA.goto('/projects/demo/board');
    await pageB.goto(/* TODO 10: '/projects/demo/board' */);
    await expect(pageB.getByTestId(/* TODO 10: 'presence-avatar' */)).toBeVisible();

    await contextA.close();
    await contextB.close();
  });
});
