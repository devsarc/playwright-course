import { test, expect, devices } from '@playwright/test';

// M91: Production Incident Reproduction
// Incident: task status update does not persist after page reload on mobile WebKit (iPhone 14).
// Workflow: write a failing reproduction test → fix the bug → confirm the test passes.

// Note: This module imports directly from @playwright/test (not the shared fixtures)
// because it needs to configure device emulation per test using browser.newContext().

test.describe('M91 — Production Incident Reproduction', () => {

  // Test 1: Identify the affected environment — iPhone 14 on WebKit.
  // The first step in incident reproduction is confirming you can reach the affected environment.
  test('incident setup: iPhone 14 emulation uses the correct viewport and user agent', async ({ browser }) => {
    // The iPhone 14 device preset provides: viewport 390×844, touch events, WebKit user agent.
    // TODO 1: Replace {} with devices['iPhone 14'] to use the correct device preset.
    const context = await browser.newContext(/* TODO 1: devices['iPhone 14'] */ {});
    const page = await context.newPage();
    await page.goto('/');

    const viewport = page.viewportSize();
    // iPhone 14 has a 390px logical width. {} gives the default 1280px viewport.
    // TODO 1b: Replace 100 with 390 — the iPhone 14 logical viewport width.
    expect(viewport?.width).toBe(/* TODO 1b: 390 */ 100);
    await context.close();
  });

  // Test 2: Reproduce the incident — status change appears to succeed but doesn't persist.
  // This test must FAIL before the bug fix and PASS after.
  test('incident reproduction: task status persists across page reload on mobile WebKit @regression', async ({ browser }, testInfo) => {
    // Annotate with the incident ID for traceability.
    testInfo.annotations.push({
      type: 'issue',
      // TODO 2: Replace 'PLACEHOLDER' with 'LUM-INC-2024-11-15' — the production incident reference.
      description: /* TODO 2: 'LUM-INC-2024-11-15' */ 'PLACEHOLDER',
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

    // TODO 3: Replace 'Todo' with 'In Progress' — after the fix, the status should persist.
    // Before the fix: this assertion fails because the status reverts to 'Todo'.
    // After the fix: this assertion passes because the status is saved correctly.
    await expect(taskCard.getByText(/* TODO 3: 'In Progress' */ 'Todo')).toBeVisible();

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
    // TODO 4: Replace 'PLACEHOLDER' with 'In Progress' — on Chromium, status persists correctly.
    await expect(taskCard.getByText(/* TODO 4: 'In Progress' */ 'PLACEHOLDER')).toBeVisible();

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

    // TODO 5: Replace null with statusUpdateRequest — the PATCH request must be captured.
    // If null: the status update is not sending an API request (the bug is in the request layer).
    // If not null: the request fires but the server rejects it (the bug is in the server layer).
    expect(/* TODO 5: statusUpdateRequest */ null).not.toBeNull();

    await context.close();
  });

  // Test 5: Capture a trace on WebKit for Trace Viewer analysis.
  // The trace includes the network tab showing whether the PATCH request was sent and its response.
  test('incident diagnosis: trace is attached for WebKit post-mortem analysis', async ({ browser }, testInfo) => {
    const context = await browser.newContext(devices['iPhone 14']);

    // Start tracing before the interaction so the full request cycle is captured.
    // TODO 6: Replace false with true — tracing must be started to capture the network tab.
    await context.tracing.start({ screenshots: /* TODO 6: true */ false, snapshots: true });

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
    // TODO 7: Replace 'Todo' with 'In Progress' — the status must persist after reload post-fix.
    await expect(taskCard.getByText(/* TODO 7: 'In Progress' */ 'Todo')).toBeVisible();

    await context.close();
  });

});
