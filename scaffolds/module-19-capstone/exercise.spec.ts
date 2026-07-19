// Lesson 19: Capstone: Full Suite Organization & Review
// Combines former modules: M89 (Smoke Suite for Lumio), M90 (Full Regression
// Suite Organization), M91 (Production Incident Reproduction), M92
// (End-to-End Review & Capstone)
//
// Each Part below is the original module's test.describe block, unchanged
// except TODO numbers are prefixed with the Part number to stay unique in
// this file (a TODO originally numbered N in the M90 module becomes TODO
// 2.N here, matching Part 2's prefix).

import { test, expect, devices } from '../fixtures/fixtures';
import { KanbanPage } from '../module-47-page-object-model/pages/KanbanPage';
import AxeBuilder from '@axe-core/playwright';

test.describe('Part 1 — Smoke Suite for Lumio (formerly M89)', () => {

  // Smoke test 1: Landing page loads and brand is visible.
  // If this fails, marketing and SEO are broken for all visitors.
  test('landing: Lumio landing page loads with correct title @smoke', async ({ page }, testInfo) => {
    // TODO 1.1: Push an annotation with type 'tag' and description '@smoke'.
    // This makes the smoke membership explicit in the JSON reporter output and HTML report.
    testInfo.annotations.push({
      type: /* TODO 1.1: 'tag' */ 'PLACEHOLDER',
      description: '@smoke',
    });
    await page.goto('/');
    // TODO 1.1b: Replace /PLACEHOLDER/ with /Lumio/ — the page title must contain the brand name.
    await expect(page).toHaveTitle(/* TODO 1.1b: /Lumio/ */ /PLACEHOLDER/);
  });

  // Smoke test 2: Login page is reachable and shows the sign-in form.
  // If this fails, no credential-based user can log in.
  test('auth: login page is reachable and shows sign-in form @smoke', async ({ page }) => {
    await page.goto('/login');
    // TODO 1.2: Replace 'PLACEHOLDER' with 'Sign in' — the login form heading text.
    await expect(page.getByRole('heading', { name: /* TODO 1.2: 'Sign in' */ 'PLACEHOLDER' })).toBeVisible();
  });

  // Smoke test 3: Credential login succeeds and redirects to dashboard.
  // If this fails, no credential-based user can access any protected feature.
  test('auth: credential login succeeds and redirects to dashboard @smoke', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    // TODO 1.3: Replace /PLACEHOLDER/ with /dashboard/ — successful login lands on the dashboard.
    await expect(page).toHaveURL(/* TODO 1.3: /dashboard/ */ /PLACEHOLDER/);
  });

  // Smoke test 4: Dashboard loads for a logged-in user.
  // If this fails, users can log in but cannot see their work.
  test('dashboard: dashboard page loads after login @smoke', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(/dashboard/);
    // TODO 1.4: Replace 'PLACEHOLDER' with 'main' — the main content region should be visible on the dashboard.
    await expect(page.getByRole(/* TODO 1.4: 'main' */ 'PLACEHOLDER' as Parameters<typeof page.getByRole>[0])).toBeVisible();
  });

  // Smoke test 5: Navigation to the projects (kanban) section works.
  // If this fails, users cannot access the core feature of Lumio.
  test('navigation: logged-in user can reach the projects section @smoke', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(/dashboard/);
    await page.getByRole('link', { name: 'Projects' }).click();
    // TODO 1.5: Replace /PLACEHOLDER/ with /projects/ — the URL must contain 'projects'.
    await expect(page).toHaveURL(/* TODO 1.5: /projects/ */ /PLACEHOLDER/);
  });

  // Smoke test 6: Unauthenticated access to a protected route redirects to login.
  // If this fails, protected data is exposed to unauthenticated visitors.
  test('security: unauthenticated access to dashboard redirects to login @smoke', async ({ page }) => {
    await page.goto('/dashboard');
    // TODO 1.6: Replace /PLACEHOLDER/ with /login/ — unauthorized access must redirect to login.
    await expect(page).toHaveURL(/* TODO 1.6: /login/ */ /PLACEHOLDER/);
  });

  // Smoke test 7: API health endpoint returns 200.
  // If this fails, the backend is down and all API-dependent features are broken.
  test('api: health endpoint responds with status 200 @smoke', async ({ request }) => {
    const response = await request.get('/api/health');
    // TODO 1.7: Replace 999 with 200 — the health endpoint must return HTTP 200.
    expect(response.status()).toBe(/* TODO 1.7: 200 */ 999);
  });

  // Smoke test 8: Logout works and redirects to the landing page.
  // If this fails, session management is broken and users are stuck logged in.
  test('auth: logout redirects to landing page @smoke', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(/dashboard/);
    await page.getByRole('button', { name: 'Sign out' }).click();
    // TODO 1.8: Replace /PLACEHOLDER/ with /\/$|\/login/ — logout lands on the root or login page.
    await expect(page).toHaveURL(/* TODO 1.8: /\/$|\/login/ */ /PLACEHOLDER/);
  });

});

test.describe('Part 2 — Full Regression Suite Organization (formerly M90)', () => {

  // Test 1: Smoke tier — critical path, runs on every push, < 60 s total.
  // Tagging in both title and annotation ensures grep + dashboard both work.
  test('tier: login is tagged @smoke for per-push CI @smoke', async ({ page }, testInfo) => {
    // TODO 2.1: Push an annotation with type 'tag' and description '@smoke'.
    // The title already contains @smoke — this annotation adds it to the JSON reporter output.
    testInfo.annotations.push({
      type: 'tag',
      description: /* TODO 2.1: '@smoke' */ 'PLACEHOLDER',
    });
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    const smokeTag = testInfo.annotations.find(a => a.description === '@smoke');
    expect(smokeTag?.type).toBe('tag');
  });

  // Test 2: Sanity tier — feature-level check, runs on every PR merge.
  // Sanity tests are fast but not critical enough to block every push.
  test('tier: task creation is tagged @sanity for per-PR CI @sanity', async ({ page }, testInfo) => {
    // TODO 2.2: Replace 'PLACEHOLDER' with '@sanity' — the tier description for this annotation.
    testInfo.annotations.push({
      type: 'tag',
      description: /* TODO 2.2: '@sanity' */ 'PLACEHOLDER',
    });
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);
    const sanityTag = testInfo.annotations.find(a => a.description === '@sanity');
    expect(sanityTag?.type).toBe('tag');
  });

  // Test 3: Multi-tier tagging — a test can belong to both smoke and sanity tiers.
  // Running 'npx playwright test --grep "@smoke|@sanity"' includes this test.
  test('tier: login is in both @smoke and @sanity tiers @smoke @sanity', async ({ page }, testInfo) => {
    // Push both tier annotations so the JSON reporter captures both memberships.
    // TODO 2.3: Add BOTH annotations — push '@smoke' and '@sanity' tags.
    testInfo.annotations.push({ type: 'tag', description: '@smoke' });
    // TODO 2.3: Replace 'PLACEHOLDER' with '@sanity' to complete the multi-tier annotation.
    testInfo.annotations.push({ type: 'tag', description: /* TODO 2.3: '@sanity' */ 'PLACEHOLDER' });
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    const tags = testInfo.annotations.filter(a => a.type === 'tag').map(a => a.description);
    expect(tags).toContain('@smoke');
    expect(tags).toContain('@sanity');
  });

  // Test 4: test.fixme() for a known bug — preserves regression intent without failing CI.
  // 'fixme' appears in the report as an expected failure, not a surprise red.
  // This test is fixme'd because the date picker returns the wrong month in WebKit (LUM-789).
  test.fixme('tier: @regression date picker shows correct month in WebKit @regression', async ({ page }) => {
    // This test is intentionally marked fixme — it represents a known, tracked bug.
    // When LUM-789 is resolved, remove test.fixme() and the test will be re-enabled.
    // TODO 2.4: The body is intentionally empty — test.fixme() prevents it from running.
    // No implementation needed here; the purpose is to understand fixme semantics.
    await page.goto('/dashboard');
    expect(true).toBe(false); // Would fail if fixme were removed prematurely.
  });

  // Test 5: Regression tier annotation — identifies a test as belonging to the nightly run.
  // Regression tests don't need to be fast — they need to be thorough.
  test('tier: i18n French locale is tagged @regression for nightly CI @regression', async ({ page }, testInfo) => {
    testInfo.annotations.push({
      type: 'tag',
      // TODO 2.5: Replace 'PLACEHOLDER' with '@regression' — this test belongs to the nightly regression tier.
      description: /* TODO 2.5: '@regression' */ 'PLACEHOLDER',
    });
    await page.goto('/');
    await expect(page).toHaveTitle(/Lumio/);
    const regressionTag = testInfo.annotations.find(a => a.description === '@regression');
    expect(regressionTag?.type).toBe('tag');
  });

  // Test 6: Suite owner annotation — identifies which squad maintains this test.
  // The JSON reporter output includes annotations — a health script can alert the right team.
  test('documentation: test has an owner annotation for escalation routing', async ({ page }, testInfo) => {
    testInfo.annotations.push({
      // TODO 2.6: Replace 'PLACEHOLDER' with 'owner' — the annotation type for team ownership metadata.
      type: /* TODO 2.6: 'owner' */ 'PLACEHOLDER',
      description: 'platform-team',
    });
    await page.goto('/');
    await expect(page).toHaveTitle(/Lumio/);
    const ownerAnnotation = testInfo.annotations.find(a => a.type === 'owner');
    expect(ownerAnnotation?.description).toBe('platform-team');
  });

  // Test 7: --grep-invert excludes slow tests from per-push checks.
  // A test tagged @slow is excluded from per-push CI with: --grep-invert "@slow"
  test('tier: visual regression is tagged @slow to exclude from fast CI @slow', async ({ page }, testInfo) => {
    testInfo.annotations.push({
      type: 'tag',
      // TODO 2.7: Replace 'PLACEHOLDER' with '@slow' — the tag that --grep-invert "@slow" will exclude.
      description: /* TODO 2.7: '@slow' */ 'PLACEHOLDER',
    });
    await page.goto('/');
    await expect(page).toHaveTitle(/Lumio/);
    const slowTag = testInfo.annotations.find(a => a.description === '@slow');
    expect(slowTag?.type).toBe('tag');
  });

});

test.describe('Part 3 — Production Incident Reproduction (formerly M91)', () => {
  // Incident: task status update does not persist after page reload on mobile WebKit (iPhone 14).
  // Workflow: write a failing reproduction test → fix the bug → confirm the test passes.
  //
  // Note: this Part configures device emulation per test with browser.newContext()
  // rather than relying on the default page/context fixtures, so it can pass
  // devices['iPhone 14'] explicitly into each new browser context.

  // Test 1: Identify the affected environment — iPhone 14 on WebKit.
  // The first step in incident reproduction is confirming you can reach the affected environment.
  test('incident setup: iPhone 14 emulation uses the correct viewport and user agent', async ({ browser }) => {
    // The iPhone 14 device preset provides: viewport 390×844, touch events, WebKit user agent.
    // TODO 3.1: Replace {} with devices['iPhone 14'] to use the correct device preset.
    const context = await browser.newContext(/* TODO 3.1: devices['iPhone 14'] */ {});
    const page = await context.newPage();
    await page.goto('/');

    const viewport = page.viewportSize();
    // iPhone 14 has a 390px logical width. {} gives the default 1280px viewport.
    // TODO 3.1b: Replace 100 with 390 — the iPhone 14 logical viewport width.
    expect(viewport?.width).toBe(/* TODO 3.1b: 390 */ 100);
    await context.close();
  });

  // Test 2: Reproduce the incident — status change appears to succeed but doesn't persist.
  // This test must FAIL before the bug fix and PASS after.
  test('incident reproduction: task status persists across page reload on mobile WebKit @regression', async ({ browser }, testInfo) => {
    // Annotate with the incident ID for traceability.
    testInfo.annotations.push({
      type: 'issue',
      // TODO 3.2: Replace 'PLACEHOLDER' with 'LUM-INC-2024-11-15' — the production incident reference.
      description: /* TODO 3.2: 'LUM-INC-2024-11-15' */ 'PLACEHOLDER',
    });
    testInfo.annotations.push({ type: 'tag', description: '@regression' });

    const context = await browser.newContext(devices['iPhone 14']);
    const page = await context.newPage();

    // Log in
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(/dashboard/);

    // Navigate to the kanban board and find a task.
    await page.getByRole('link', { name: 'Projects' }).click();
    await page.waitForURL(/projects/);
    await page.getByRole('link', { name: 'Test Project' }).click();

    // Change task status from 'Todo' to 'In Progress'.
    const taskCard = page.getByTestId('task-card').first();
    await taskCard.getByRole('button', { name: 'Status' }).tap();
    await page.getByRole('option', { name: 'In Progress' }).tap();

    // Verify the UI shows the update.
    await expect(taskCard.getByText('In Progress')).toBeVisible();

    // Reload and verify persistence — this is where the bug manifests.
    await page.reload();

    // TODO 3.3: Replace 'Todo' with 'In Progress' — after the fix, the status should persist.
    // Before the fix: this assertion fails because the status reverts to 'Todo'.
    // After the fix: this assertion passes because the status is saved correctly.
    await expect(taskCard.getByText(/* TODO 3.3: 'In Progress' */ 'Todo')).toBeVisible();

    await context.close();
  });

  // Test 3: Confirm the bug does NOT manifest on Chromium (it's platform-specific).
  // A platform-specific bug that passes on the control browser helps isolate the root cause.
  test('incident scope: status persistence works correctly on Chromium (control)', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(/dashboard/);

    await page.getByRole('link', { name: 'Projects' }).click();
    await page.waitForURL(/projects/);
    await page.getByRole('link', { name: 'Test Project' }).click();

    const taskCard = page.getByTestId('task-card').first();
    await taskCard.getByRole('button', { name: 'Status' }).click();
    await page.getByRole('option', { name: 'In Progress' }).click();
    await expect(taskCard.getByText('In Progress')).toBeVisible();

    await page.reload();
    // TODO 3.4: Replace 'PLACEHOLDER' with 'In Progress' — on Chromium, status persists correctly.
    await expect(taskCard.getByText(/* TODO 3.4: 'In Progress' */ 'PLACEHOLDER')).toBeVisible();

    await context.close();
  });

  // Test 4: Verify the network request carries the correct payload.
  // A status update that silently fails sends no request, or sends an incorrect one.
  test('incident diagnosis: status update sends a PATCH request to the tasks API', async ({ browser }) => {
    const context = await browser.newContext(devices['iPhone 14']);
    const page = await context.newPage();

    let statusUpdateRequest: { method: string; url: string } | null = null;

    // Monitor outgoing requests to detect if the save API call is made.
    await page.route('/api/tasks/**', async route => {
      if (route.request().method() === 'PATCH') {
        statusUpdateRequest = {
          method: route.request().method(),
          url: route.request().url(),
        };
      }
      await route.continue();
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(/dashboard/);

    await page.getByRole('link', { name: 'Projects' }).click();
    await page.waitForURL(/projects/);
    await page.getByRole('link', { name: 'Test Project' }).click();

    const taskCard = page.getByTestId('task-card').first();
    await taskCard.getByRole('button', { name: 'Status' }).tap();
    await page.getByRole('option', { name: 'In Progress' }).tap();

    // Wait briefly for the network request.
    await page.waitForTimeout(500);

    // TODO 3.5: Replace null with statusUpdateRequest — the PATCH request must be captured.
    // If null: the status update is not sending an API request (the bug is in the request layer).
    // If not null: the request fires but the server rejects it (the bug is in the server layer).
    expect(/* TODO 3.5: statusUpdateRequest */ null).not.toBeNull();

    await context.close();
  });

  // Test 5: Capture a trace on WebKit for Trace Viewer analysis.
  // The trace includes the network tab showing whether the PATCH request was sent and its response.
  test('incident diagnosis: trace is attached for WebKit post-mortem analysis', async ({ browser }, testInfo) => {
    const context = await browser.newContext(devices['iPhone 14']);

    // Start tracing before the interaction so the full request cycle is captured.
    // TODO 3.6: Replace false with true — tracing must be started to capture the network tab.
    await context.tracing.start({ screenshots: /* TODO 3.6: true */ false, snapshots: true });

    const page = await context.newPage();
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(/dashboard/);

    const tracePath = testInfo.outputPath('webkit-incident-trace.zip');
    await context.tracing.stop({ path: tracePath });

    await testInfo.attach('webkit-incident-trace', {
      path: tracePath,
      contentType: 'application/zip',
    });

    expect(testInfo.attachments).toHaveLength(1);
    expect(testInfo.attachments[0].name).toBe('webkit-incident-trace');
    await context.close();
  });

  // Test 6: Post-fix regression guard — this test permanently lives in the regression suite.
  // After the fix, it passes. If someone reintroduces the bug, this test fails in CI.
  test('regression guard: status persists on mobile WebKit after fix @regression', async ({ browser }, testInfo) => {
    testInfo.annotations.push({
      type: 'issue',
      description: 'LUM-INC-2024-11-15',
    });
    testInfo.annotations.push({ type: 'tag', description: '@regression' });
    testInfo.annotations.push({ type: 'owner', description: 'board-team' });

    const context = await browser.newContext(devices['iPhone 14']);
    const page = await context.newPage();

    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(/dashboard/);

    await page.getByRole('link', { name: 'Projects' }).click();
    await page.waitForURL(/projects/);
    await page.getByRole('link', { name: 'Test Project' }).click();

    const taskCard = page.getByTestId('task-card').first();
    await taskCard.getByRole('button', { name: 'Status' }).tap();
    await page.getByRole('option', { name: 'In Progress' }).tap();
    await expect(taskCard.getByText('In Progress')).toBeVisible();

    await page.reload();
    // This assertion is the regression guard — it passes only when the bug is fixed.
    // TODO 3.7: Replace 'Todo' with 'In Progress' — the status must persist after reload post-fix.
    await expect(taskCard.getByText(/* TODO 3.7: 'In Progress' */ 'Todo')).toBeVisible();

    await context.close();
  });

});

const NEW_USER = {
  name: 'Capstone User',
  email: `capstone-${Date.now()}@lumio.test`,
  password: 'Capstone123!',
};

test.describe('Part 4 — End-to-End Review & Capstone (formerly M92)', () => {
  // This Part ties together the techniques from M20-M34 in a single realistic
  // user journey: signup -> create project -> add and manage cards -> share board.
  //
  // Each test in this suite builds on the previous one using test.step() to
  // document the sub-actions within a longer flow. The suite uses:
  //   - POMs (M20)
  //   - Accessibility checks (M23)
  //   - File upload (M25)
  //   - Real-time sync (M28)
  //   - Performance budget (M33)

  test('signup -> create project -> add cards -> verify board', async ({ page, context }) => {
    // STEP 1: Sign up as a new user
    await test.step('Sign up', async () => {
      // TODO 4.1: Navigate to /signup and fill the signup form.
      // Fields: name (data-testid="signup-name"), email (data-testid="signup-email"),
      //         password (data-testid="signup-password")
      // Submit: getByRole('button', { name: 'Create account' })
      await page.goto('/signup');
      await page.getByTestId('signup-name').fill(NEW_USER.name);
      await page.getByTestId('signup-email').fill(/* TODO 4.1: NEW_USER.email */);
      await page.getByTestId('signup-password').fill(/* TODO 4.1: NEW_USER.password */);
      await page.getByRole('button', { name: 'Create account' }).click();
      await expect(page).toHaveURL(/* TODO 4.1: /\/dashboard/ */);
    });

    // STEP 2: Create a new project
    await test.step('Create project', async () => {
      // TODO 4.2: Click "New project" and fill the project name.
      // data-testid="new-project-button", data-testid="project-name-input"
      await page.getByTestId('new-project-button').click();
      await page.getByTestId('project-name-input').fill('Capstone Project');
      await page.getByRole('button', { name: 'Create' }).click();
      await expect(page).toHaveURL(/* TODO 4.2: /\/projects\// */);
    });

    // STEP 3: Add three cards using the POM
    await test.step('Add cards to the board', async () => {
      // TODO 4.3: Navigate to the board URL and use KanbanPage POM to add 3 cards.
      // The board URL is the current page URL + /board.
      const boardUrl = page.url() + '/board';
      const kanban = new KanbanPage(page);
      await page.goto(boardUrl);

      // TODO 4.3: Add three cards using kanban.addCard()
      await kanban.addCard('Task 1: Research');
      await kanban.addCard('Task 2: Design');
      await kanban.addCard(/* TODO 4.3: 'Task 3: Implement' */);

      const count = await kanban.cardCount(kanban.todoColumn);
      expect(count).toBeGreaterThanOrEqual(3);
    });

    // STEP 4: Move a card to In Progress
    await test.step('Move card to In Progress', async () => {
      // TODO 4.4: Drag the first card to the In Progress column.
      const kanban = new KanbanPage(page);
      const firstCard = kanban.todoColumn.getByTestId('kanban-card').first();
      await firstCard.dragTo(/* TODO 4.4: kanban.inProgressColumn */);
      await expect(
        kanban.inProgressColumn.getByTestId('kanban-card')
      ).toHaveCount({ min: 1 } as any);
    });

    // STEP 5: Accessibility check on the board
    await test.step('Accessibility audit', async () => {
      // TODO 4.5: Run axe-core on the board and assert no WCAG 2.1 AA violations.
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(violations).toEqual(/* TODO 4.5: [] */);
    });

    // STEP 6: Performance budget check
    await test.step('Performance budget', async () => {
      // TODO 4.6: Assert the board loaded all columns within 5000ms since we
      // already navigated to it. Re-navigate and time it.
      const start = Date.now();
      await page.reload();
      await page.getByTestId('kanban-column-todo').waitFor();
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(/* TODO 4.6: 5000 */);
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

    // TODO 4.7: Navigate both users to the demo board.
    await authorPage.goto('/projects/demo/board');
    await viewerPage.goto(/* TODO 4.7: '/projects/demo/board' */);

    // TODO 4.8: Author adds a card with a unique title.
    const cardTitle = `capstone-collab-${Date.now()}`;
    await authorPage.getByTestId('add-card-button').click();
    await authorPage.getByTestId('new-card-input').fill(cardTitle);
    await authorPage.getByTestId('new-card-input').press('Enter');

    // TODO 4.9: Viewer asserts the card appears without reloading.
    await expect(
      viewerPage.getByTestId('kanban-card').filter({ hasText: cardTitle })
    )/* TODO 4.9: toBeVisible() */;

    await ctxAuthor.close();
    await ctxViewer.close();
  });
});
