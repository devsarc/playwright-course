import { test, expect } from '../fixtures/fixtures';
import path from 'path';

// M33: User Journey Simulation
//
// Journey tests cover the seams between features — the transitions that unit
// tests never exercise. Each step is a named helper so failures pinpoint the
// exact stage that broke, rather than leaving you hunting through 200 lines.
//
// Three patterns covered here:
//   1. Happy-path journey   — step helpers, sequential state, single user
//   2. Two-user collaboration — independent BrowserContexts, cross-user assertion
//   3. Resume journey        — storageState persists session; later tests skip signup

// ---------------------------------------------------------------------------
// Shared step helpers
// ---------------------------------------------------------------------------

// TODO 1: Define a JourneyHelpers factory that accepts a Page and returns
// step functions. Each step should encapsulate exactly one user action so that
// the test body reads as a narrative and stack traces pinpoint the broken step.
const makeJourneyHelpers = (page: import('@playwright/test').Page) => ({
  async signUp(email: string, password: string) {
    await page.goto('/signup');
    await page.getByTestId(/* TODO 1: 'signup-email' */).fill(email);
    await page.getByTestId(/* TODO 1: 'signup-password' */).fill(password);
    await page.getByTestId(/* TODO 1: 'signup-submit' */).click();
    // After signup the app redirects to the verify-email page
    await page.waitForURL(/verify-email/);
  },

  // TODO 2: verifyEmail navigates directly to the verify URL with a known test
  // token instead of reading a real inbox. This is acceptable in test environments
  // where the server accepts a seeded token; in CI a mail-catcher can supply it.
  async verifyEmail(token = 'test-token-123') {
    await page.goto(`/verify-email?token=${token}`);
    await expect(page.getByTestId(/* TODO 2: 'verify-email-status' */)).toBeVisible();
  },

  // TODO 3: createWorkspace fills the onboarding form and waits for the redirect
  // to /dashboard, confirming the workspace was accepted by the server.
  async createWorkspace(name: string) {
    await page.goto('/onboarding/workspace');
    await page.getByTestId(/* TODO 3: 'workspace-name-input' */).fill(name);
    await page.getByTestId(/* TODO 3: 'workspace-submit' */).click();
    await page.waitForURL(/dashboard/);
  },

  // TODO 4: createProject opens the project creation dialog and asserts the
  // resulting project card is visible. Asserting the card (not just the API
  // response) confirms the UI layer received and rendered the new data.
  async createProject(name: string) {
    await page.getByTestId(/* TODO 4: 'create-project-button' */).click();
    await page.getByTestId(/* TODO 4: 'project-name-input' */).fill(name);
    await page.getByTestId(/* TODO 4: 'project-submit' */).click();
    await expect(page.getByTestId('project-card').filter({ hasText: name })).toBeVisible();
  },

  // TODO 5: createTask opens the task panel inside the current project. The
  // task-card assertion confirms the optimistic UI update and server persistence.
  async createTask(title: string) {
    await page.getByTestId(/* TODO 5: 'add-task-button' */).click();
    await page.getByTestId(/* TODO 5: 'task-title-input' */).fill(title);
    await page.getByTestId(/* TODO 5: 'task-submit' */).press('Enter');
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
  // TODO 6: Create two independent BrowserContexts. Each context is a separate
  // browser profile with its own cookies and localStorage — essential for
  // simulating two different logged-in users in the same test run.
  const contextA = await browser.newContext(/* TODO 6: {
    storageState: 'tests/fixtures/auth/user-a.json',
  } */);
  const contextB = await browser.newContext(/* TODO 6: {
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

    // TODO 7: User A assigns the task to user B. Testing assignment via the UI
    // (not a direct API call) confirms the assignee-picker component works and
    // that the server persists the assignee relationship correctly.
    await pageA.getByTestId('task-card').filter({ hasText: taskTitle }).click();
    await pageA.getByTestId(/* TODO 7: 'task-assignee-select' */).click();
    await pageA.getByRole('option', { name: 'bob@lumio.test' }).click();
    await pageA.getByTestId('task-detail-close').click();

    // TODO 8: User B navigates to the dashboard and asserts the task-assignee
    // element shows their name. This cross-context assertion is the heart of
    // the journey: it proves the assignment was broadcast and rendered for the
    // assignee — something no single-user test can verify.
    await pageB.goto('/dashboard');
    const assignedCard = pageB.getByTestId('task-card').filter({ hasText: taskTitle });
    await expect(assignedCard).toBeVisible();
    await expect(assignedCard.getByTestId(/* TODO 8: 'task-assignee' */)).toContainText('bob@lumio.test');
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
// This pattern is how global setup (M09) pre-authenticates the entire suite.

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
  // TODO 9: Restore the session saved by the previous test. Using storageState
  // avoids repeating the expensive signup + email verification + onboarding
  // flow — the new context starts already logged in, exactly as a returning
  // user would experience the app.
  const restoredContext = await browser.newContext(/* TODO 9: {
    storageState: savedStatePath,
  } */);
  const page = await restoredContext.newPage();

  try {
    await page.goto('/dashboard');

    // TODO 10: Assert the dashboard heading is visible. If storageState was
    // applied correctly, the app treats this session as authenticated and
    // renders the dashboard rather than redirecting to /login.
    await expect(page.getByRole(/* TODO 10: 'heading', { name: /dashboard/i } */)).toBeVisible();
  } finally {
    await restoredContext.close();
  }
});
