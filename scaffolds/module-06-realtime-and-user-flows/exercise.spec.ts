// Lesson 06: Realtime & User Flows
// Combines former modules: M31 (Multi-Tab & Popup Management), M32 (WebSocket & SSE
// Testing), M33 (User Journey Simulation)
//
// Each Part below is the original module's test.describe block, unchanged
// except TODO numbers are prefixed with the Part number to stay unique in
// this file (a TODO originally numbered N in the M33 module becomes TODO
// 3.N here, matching Part 3's prefix).

import { test, expect, type BrowserContext } from '../fixtures/fixtures';
import path from 'path';

// Multi-tab: open a second page in the SAME BrowserContext.
//   Both pages share cookies and localStorage — same user, two tabs.
//   Use: context.newPage()
//
// Multi-user: create a SECOND BrowserContext with its own auth state.
//   Each context is a separate browser profile — different user sessions.
//   Use: browser.newContext()
test.describe('Part 1 — Multi-Tab & Popup Management (formerly M31)', () => {
  test.describe('Multi-tab — same user, two tabs', () => {
    test('card created in tab A appears in tab B', async ({ context }) => {
      // TODO 1.1: Open two pages in the same context.
      // context.newPage() creates a second tab that shares the session.
      const pageA = await context.newPage();
      const pageB = await context.newPage();

      // TODO 1.2: Navigate both tabs to the same board.
      await pageA.goto('/projects/demo/board');
      await pageB.goto(/* TODO 1.2: '/projects/demo/board' */);

      // TODO 1.3: Add a card in pageA.
      const title = `multi-tab-${Date.now()}`;
      await pageA.getByTestId('add-card-button').click();
      await pageA.getByTestId('new-card-input').fill(title);
      await pageA.getByTestId('new-card-input').press('Enter');

      // TODO 1.4: Assert the card is visible in pageB without reloading.
      // The board uses real-time sync — the card should appear via WebSocket.
      // If it does not appear within the default timeout, the real-time feature is broken.
      await expect(
        pageB.getByTestId('kanban-card').filter({ hasText: title })
      )/* TODO 1.4: toBeVisible() */;
    });
  });

  test.describe('Multi-user — two independent sessions', () => {
    test('user B sees card created by user A', async ({ browser }) => {
      // TODO 1.5: Create two independent BrowserContexts (two separate user sessions).
      // Use browser.newContext() for each — they do NOT share cookies.
      // Authenticate each context differently (e.g., pass storageState for different users).
      const contextA = await browser.newContext(/* TODO 1.5: {
        storageState: 'tests/fixtures/auth/user-a.json',
      } */);
      const contextB = await browser.newContext(/* TODO 1.5: {
        storageState: 'tests/fixtures/auth/user-b.json',
      } */);

      const pageA = await contextA.newPage();
      const pageB = await contextB.newPage();

      // TODO 1.6: Navigate both users to the same shared board.
      await pageA.goto('/projects/demo/board');
      await pageB.goto('/projects/demo/board');

      // TODO 1.7: User A adds a card with a unique title.
      const cardTitle = `collab-${Date.now()}`;
      await pageA.getByTestId('add-card-button').click();
      await pageA.getByTestId('new-card-input').fill(cardTitle);
      await pageA.getByTestId('new-card-input').press('Enter');

      // TODO 1.8: Assert User B sees the card in their view (real-time sync).
      await expect(
        pageB.getByTestId('kanban-card').filter({ hasText: cardTitle })
      ).toBeVisible();

      // TODO 1.9: Clean up both contexts to free browser resources.
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

      // TODO 1.10: Navigate User A to the board first, then User B.
      // Assert User B's view shows a presence avatar for User A.
      // data-testid="presence-avatar" (one per online user)
      await pageA.goto('/projects/demo/board');
      await pageB.goto(/* TODO 1.10: '/projects/demo/board' */);
      await expect(pageB.getByTestId(/* TODO 1.10: 'presence-avatar' */)).toBeVisible();

      await contextA.close();
      await contextB.close();
    });
  });
});

// ⚠️  Lumio does not implement a /presence WebSocket endpoint on the board route.
// The "real connection" tests (test.describe 1) are illustrative — they will fail
// unless you add a presence WS to Lumio. The "mocked server" tests (test.describe 2)
// use page.routeWebSocket() and do not require a real WS server.
//
// Two strategies:
//   Real WS: page.waitForEvent('websocket') + ws.waitForEvent('framereceived')
//     — tests the full stack; requires a running WS server
//   Mocked WS: page.routeWebSocket(pattern, handler)
//     — intercepts before reaching the server; fast, isolated
test.describe('Part 2 — WebSocket & SSE Testing (formerly M32)', () => {
  test.describe('WebSocket — real connection', () => {
    test('presence indicator appears when WS connects', async ({ page }) => {
      // TODO 2.1: Use Promise.all to start navigation and wait for the WS simultaneously.
      // This prevents a race condition where the WS opens before waitForEvent is called.
      const [, ws] = await Promise.all([
        page.goto('/projects/demo/board'),
        page.waitForEvent(/* TODO 2.1: 'websocket' */),
      ]);

      // TODO 2.2: Assert the WS URL contains 'presence'.
      expect(ws.url()).toContain(/* TODO 2.2: 'presence' */);

      // TODO 2.3: Assert the presence indicator is visible.
      await expect(page.getByTestId(/* TODO 2.3: 'presence-indicator' */)).toBeVisible();
    });

    test('receives a frame from the server', async ({ page }) => {
      const [, ws] = await Promise.all([
        page.goto('/projects/demo/board'),
        page.waitForEvent('websocket'),
      ]);

      // TODO 2.4: Wait for one incoming frame using ws.waitForEvent('framereceived').
      // The event resolves with { payload: string | Buffer }.
      const frame = await ws.waitForEvent(/* TODO 2.4: 'framereceived' */);

      // TODO 2.5: Parse the JSON payload and assert it has a 'type' property.
      const message = JSON.parse(frame.payload as string);
      expect(message).toHaveProperty(/* TODO 2.5: 'type' */);
    });
  });

  test.describe('WebSocket — mocked server', () => {
    test('inject a user_joined event via routeWebSocket', async ({ page }) => {
      // TODO 2.6: Use page.routeWebSocket() to intercept the presence WS and
      // immediately send a fake user_joined message on open.
      // routeWebSocket(urlPattern, handler) — handler receives a WebSocketRoute.
      await page.routeWebSocket(/presence/, (ws) => {
        ws.onopen = () => {
          ws.send(/* TODO 2.6: JSON.stringify({ type: 'user_joined', userId: 'u999', name: 'Alice' }) */);
        };
      });

      await page.goto('/projects/demo/board');

      // TODO 2.7: Assert a presence-avatar appears (rendered when user_joined is received).
      await expect(page.getByTestId(/* TODO 2.7: 'presence-avatar' */)).toBeVisible();
    });

    test('simulate connection close and verify reconnect UI', async ({ page }) => {
      // TODO 2.8: Route the WS to close immediately on open, then assert the
      // reconnect banner (data-testid="ws-reconnect-banner") appears.
      // Why test reconnect? WS connections drop in production; the UI must degrade gracefully.
      await page.routeWebSocket(/presence/, (ws) => {
        ws.onopen = () => ws.close();
      });

      await page.goto('/projects/demo/board');
      await expect(page.getByTestId(/* TODO 2.8: 'ws-reconnect-banner' */)).toBeVisible();
    });
  });
});

// Journey tests cover the seams between features — the transitions that unit
// tests never exercise. Each step is a named helper so failures pinpoint the
// exact stage that broke, rather than leaving you hunting through 200 lines.
//
// Three patterns covered here:
//   1. Happy-path journey   — step helpers, sequential state, single user
//   2. Two-user collaboration — independent BrowserContexts, cross-user assertion
//   3. Resume journey        — storageState persists session; later tests skip signup
test.describe('Part 3 — User Journey Simulation (formerly M33)', () => {
  // ---------------------------------------------------------------------------
  // Shared step helpers
  // ---------------------------------------------------------------------------

  // TODO 3.1: Define a JourneyHelpers factory that accepts a Page and returns
  // step functions. Each step should encapsulate exactly one user action so that
  // the test body reads as a narrative and stack traces pinpoint the broken step.
  const makeJourneyHelpers = (page: import('@playwright/test').Page) => ({
    async signUp(email: string, password: string) {
      await page.goto('/signup');
      await page.getByTestId(/* TODO 3.1: 'signup-email' */).fill(email);
      await page.getByTestId(/* TODO 3.1: 'signup-password' */).fill(password);
      await page.getByTestId(/* TODO 3.1: 'signup-submit' */).click();
      // After signup the app redirects to the verify-email page
      await page.waitForURL(/verify-email/);
    },

    // TODO 3.2: verifyEmail navigates directly to the verify URL with a known test
    // token instead of reading a real inbox. This is acceptable in test environments
    // where the server accepts a seeded token; in CI a mail-catcher can supply it.
    async verifyEmail(token = 'test-token-123') {
      await page.goto(`/verify-email?token=${token}`);
      await expect(page.getByTestId(/* TODO 3.2: 'verify-email-status' */)).toBeVisible();
    },

    // TODO 3.3: createWorkspace fills the onboarding form and waits for the redirect
    // to /dashboard, confirming the workspace was accepted by the server.
    async createWorkspace(name: string) {
      await page.goto('/onboarding/workspace');
      await page.getByTestId(/* TODO 3.3: 'workspace-name-input' */).fill(name);
      await page.getByTestId(/* TODO 3.3: 'workspace-submit' */).click();
      await page.waitForURL(/dashboard/);
    },

    // TODO 3.4: createProject opens the project creation dialog and asserts the
    // resulting project card is visible. Asserting the card (not just the API
    // response) confirms the UI layer received and rendered the new data.
    async createProject(name: string) {
      await page.getByTestId(/* TODO 3.4: 'create-project-button' */).click();
      await page.getByTestId(/* TODO 3.4: 'project-name-input' */).fill(name);
      await page.getByTestId(/* TODO 3.4: 'project-submit' */).click();
      await expect(page.getByTestId('project-card').filter({ hasText: name })).toBeVisible();
    },

    // TODO 3.5: createTask opens the task panel inside the current project. The
    // task-card assertion confirms the optimistic UI update and server persistence.
    async createTask(title: string) {
      await page.getByTestId(/* TODO 3.5: 'add-task-button' */).click();
      await page.getByTestId(/* TODO 3.5: 'task-title-input' */).fill(title);
      await page.getByTestId(/* TODO 3.5: 'task-submit' */).press('Enter');
      await expect(page.getByTestId('task-card').filter({ hasText: title })).toBeVisible();
    },
  });

  // ---------------------------------------------------------------------------
  // Test 1: Happy-path journey — signup through first task
  // ---------------------------------------------------------------------------

  test('happy-path journey: signup → verify → workspace → project → task', async ({ page }) => {
    const ts = Date.now();
    const email = `journey-${ts}@lumio.test`;
    const password = 'TestPassword1!';

    const steps = makeJourneyHelpers(page);

    // Each step function asserts its own terminal state before returning.
    // If any step fails, the test name and step function name together identify
    // exactly which feature boundary is broken.
    await steps.signUp(email, password);
    await steps.verifyEmail();
    await steps.createWorkspace(`workspace-${ts}`);
    await steps.createProject(`project-${ts}`);
    await steps.createTask(`task-${ts}`);

    // Final end-state assertion: we are on the dashboard and the task card exists.
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByTestId('task-card').filter({ hasText: `task-${ts}` })).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // Test 2: Two-user collaboration — user A assigns task; user B sees it
  // ---------------------------------------------------------------------------

  test('two-user collaboration: user A assigns task; user B sees the assignment', async ({ browser }) => {
    // TODO 3.6: Create two independent BrowserContexts. Each context is a separate
    // browser profile with its own cookies and localStorage — essential for
    // simulating two different logged-in users in the same test run.
    const contextA = await browser.newContext(/* TODO 3.6: {
      storageState: 'tests/fixtures/auth/user-a.json',
    } */);
    const contextB = await browser.newContext(/* TODO 3.6: {
      storageState: 'tests/fixtures/auth/user-b.json',
    } */);

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    try {
      const taskTitle = `assign-${Date.now()}`;

      // User A: navigate to the dashboard and create a task
      await pageA.goto('/dashboard');
      await pageA.getByTestId('add-task-button').click();
      await pageA.getByTestId('task-title-input').fill(taskTitle);
      await pageA.getByTestId('task-submit').press('Enter');
      await expect(pageA.getByTestId('task-card').filter({ hasText: taskTitle })).toBeVisible();

      // TODO 3.7: User A assigns the task to user B. Testing assignment via the UI
      // (not a direct API call) confirms the assignee-picker component works and
      // that the server persists the assignee relationship correctly.
      await pageA.getByTestId('task-card').filter({ hasText: taskTitle }).click();
      await pageA.getByTestId(/* TODO 3.7: 'task-assignee-select' */).click();
      await pageA.getByRole('option', { name: 'bob@lumio.test' }).click();
      await pageA.getByTestId('task-detail-close').click();

      // TODO 3.8: User B navigates to the dashboard and asserts the task-assignee
      // element shows their name. This cross-context assertion is the heart of
      // the journey: it proves the assignment was broadcast and rendered for the
      // assignee — something no single-user test can verify.
      await pageB.goto('/dashboard');
      const assignedCard = pageB.getByTestId('task-card').filter({ hasText: taskTitle });
      await expect(assignedCard).toBeVisible();
      await expect(assignedCard.getByTestId(/* TODO 3.8: 'task-assignee' */)).toContainText('bob@lumio.test');
    } finally {
      // Always close manually created contexts — Playwright does not auto-close them.
      await contextA.close();
      await contextB.close();
    }
  });

  // ---------------------------------------------------------------------------
  // Test 3: Resume journey — restore session from storageState
  // ---------------------------------------------------------------------------

  // storageState captures cookies + localStorage so a later test can start
  // already authenticated, skipping the full signup/verify/onboarding flow.
  // This pattern is how global setup (Lesson 01 (formerly M09)) pre-authenticates the entire suite.

  const savedStatePath = path.join('tests', 'fixtures', 'auth', 'journey-user.json');

  test('first run: complete signup and save session state', async ({ page, context }) => {
    const ts = Date.now();
    const steps = makeJourneyHelpers(page);

    await steps.signUp(`resume-${ts}@lumio.test`, 'TestPassword1!');
    await steps.verifyEmail();
    await steps.createWorkspace(`ws-resume-${ts}`);

    // Persist the authenticated session so the next test can reuse it.
    // storageState serializes all cookies and localStorage for this context.
    await context.storageState({ path: savedStatePath });

    await expect(page).toHaveURL(/dashboard/);
  });

  test('resume run: restore session without repeating signup', async ({ browser }) => {
    // TODO 3.9: Restore the session saved by the previous test. Using storageState
    // avoids repeating the expensive signup + email verification + onboarding
    // flow — the new context starts already logged in, exactly as a returning
    // user would experience the app.
    const restoredContext = await browser.newContext(/* TODO 3.9: {
      storageState: savedStatePath,
    } */);
    const page = await restoredContext.newPage();

    try {
      await page.goto('/dashboard');

      // TODO 3.10: Assert the dashboard heading is visible. If storageState was
      // applied correctly, the app treats this session as authenticated and
      // renders the dashboard rather than redirecting to /login.
      await expect(page.getByRole(/* TODO 3.10: 'heading', { name: /dashboard/i } */)).toBeVisible();
    } finally {
      await restoredContext.close();
    }
  });
});
