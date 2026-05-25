import { test, expect } from '../fixtures/fixtures';

// M82: Playwright vs Cypress
// Each test demonstrates a scenario where Playwright and Cypress diverge.
// The Playwright solution is the correct approach — the comment explains the Cypress limitation.

test.describe('M82 — Playwright vs Cypress: SPA Dashboard Scenario', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  // Test 1: Multi-tab — Cypress cannot access a second browser tab at all.
  // Playwright: context.waitForEvent('page') captures the new tab.
  test('multi-tab: open task in new tab and assert its title', async ({ page, context }) => {
    await page.goto('/projects/test-project');

    const [newTab] = await Promise.all([
      // TODO 1: Use context.waitForEvent('page') to capture the new tab.
      // In Cypress, this test cannot be written — there is no multi-tab API.
      context.waitForEvent(/* TODO 1: 'page' */ 'request'),
      page.getByText('Design mockups').click({ modifiers: ['Meta'] }), // Ctrl+click opens new tab
    ]);

    await newTab.waitForLoadState();
    await expect(newTab.getByRole('heading', { name: /Design mockups/ })).toBeVisible();
    await newTab.close();
  });

  // Test 2: Cross-origin navigation — Cypress blocks by default; Playwright has no restriction.
  // This test navigates from the Lumio app to the Lumio docs (same origin, but simulates multi-origin).
  test('cross-origin navigation: navigate between the app and public docs', async ({ page }) => {
    // In Cypress (with default settings), navigating to a different origin in the same test fails.
    // In Playwright, page.goto() can navigate to any URL at any time.
    await page.goto('/docs'); // public docs

    // TODO 2: Assert the docs page title contains 'Documentation'.
    await expect(page).toHaveTitle(/* TODO 2: /Documentation/ */ /PLACEHOLDER/);

    // Navigate back to the app — no cross-origin restriction.
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard/);
  });

  // Test 3: WebKit testing — Cypress doesn't support WebKit; Playwright does.
  // This test uses browserName to demonstrate browser-specific testing.
  test('browser-specific assertion: browserName is available for conditional logic', async ({ page, browserName }) => {
    await page.goto('/projects/test-project');

    // In Playwright, browserName gives you the current engine.
    // In Cypress, there's no WebKit support — this scenario is untestable on Safari.
    // TODO 3: Assert browserName matches /chromium|firefox|webkit/.
    expect(browserName).toMatch(/* TODO 3: /chromium|firefox|webkit/ */ /PLACEHOLDER/);
  });

  // Test 4: Network interception — both tools support it, but with different APIs.
  // Playwright: page.route(). Cypress: cy.intercept().
  test('network mock: page.route() equivalent to cy.intercept()', async ({ page }) => {
    // Playwright:
    await page.route('**/api/dashboard/stats**', route =>
      route.fulfill({ status: 200, json: { tasks: 99, members: 5 } })
    );

    await page.reload();
    await page.waitForLoadState('networkidle');

    // TODO 4: Assert the text '99' is visible (the mocked task count from the API).
    await expect(page.getByText(/* TODO 4: '99' */ 'PLACEHOLDER')).toBeVisible();

    await page.unroute('**/api/dashboard/stats**');
  });

  // Test 5: Async/await vs chainable commands — the biggest migration friction from Cypress to Playwright.
  // Cypress: cy.get('button').click().should('be.visible')  [synchronous chain]
  // Playwright: await locator.click(); await expect(locator).toBeVisible();  [async/await]
  test('async pattern: use the correct assertion method for a visible button', async ({ page }) => {
    await page.goto('/projects/test-project');

    const btn = page.getByRole('button', { name: 'New task' });

    // In Cypress: btn.should('be.visible') — synchronous chain.
    // In Playwright: await expect(btn).toBeVisible() — async/await, explicit method call.
    // TODO 5: Replace toBeHidden() with toBeVisible() — the correct assertion for a visible button.
    await expect(btn)./* TODO 5: toBeVisible() */ toBeHidden();
  });

  // Test 6: File download — Playwright first-class; Cypress requires workarounds.
  test('file download: waitForEvent captures the download object', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Playwright: page.waitForEvent('download') captures the download synchronously.
    // Cypress: requires intercepting the XHR and reading response body — no native download event.
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      // TODO 6: Click the export button using getByRole('button', { name: 'Export CSV' }).
      page.getByRole('button', { name: /* TODO 6: 'Export CSV' */ 'PLACEHOLDER' }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/\.csv$/);
  });

});
