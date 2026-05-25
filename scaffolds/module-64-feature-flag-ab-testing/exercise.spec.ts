import { test, expect } from '../fixtures/fixtures';

// M64: Feature Flag & A/B Testing

test.describe('M64 — Feature Flag & A/B Testing', () => {

  // Test 1: Inject a flag via addInitScript (flag enabled)
  test('addInitScript injects flag before page scripts execute', async ({ page }) => {
    // TODO 1: Use page.addInitScript() to set window.__featureFlags = { aiSuggestions: true }
    // on the window object before page scripts run.
    // Why? addInitScript runs before page scripts — the flag is present when React initializes.
    await page.addInitScript(/* TODO 1: () => { (window as any).__featureFlags = { aiSuggestions: true }; } */
      () => { (window as any).__featureFlags = { aiSuggestions: false }; }
    );

    await page.goto('/dashboard');

    // With AI suggestions enabled, the AI panel should be visible
    // TODO 2: Assert that the element with testId 'ai-suggestions-panel' is visible.
    await expect(page.getByTestId('ai-suggestions-panel'))./* TODO 2: toBeVisible() */ toBeHidden();
  });

  // Test 2: Flag off — panel is hidden
  test('AI suggestions panel is hidden when flag is disabled', async ({ page }) => {
    await page.addInitScript(() => {
      // TODO 3: Set window.__featureFlags = { aiSuggestions: false }.
      (window as any).__featureFlags = { aiSuggestions: /* TODO 3: false */ true };
    });

    await page.goto('/dashboard');

    // TODO 4: Assert that 'ai-suggestions-panel' is hidden.
    await expect(page.getByTestId('ai-suggestions-panel'))./* TODO 4: toBeHidden() */ toBeVisible();
  });

  // Test 3: addInitScript receives a serializable argument
  test('addInitScript can receive a serializable parameter', async ({ page }) => {
    // addInitScript accepts an optional second argument passed to the browser function.
    // This lets you parameterize the init script without string interpolation.

    // TODO 5: Call page.addInitScript(fn, true) where fn receives the value as `enabled`
    // and sets window.__featureFlags = { aiSuggestions: enabled }.
    await page.addInitScript(
      /* TODO 5: (enabled: boolean) => { (window as any).__featureFlags = { aiSuggestions: enabled }; } */
      (_enabled: boolean) => { (window as any).__featureFlags = { aiSuggestions: false }; },
      /* TODO 5: true */ false
    );

    await page.goto('/dashboard');
    await expect(page.getByTestId('ai-suggestions-panel')).toBeVisible();
  });

  // Test 4: Cookie-based flag activation
  test('cookie-based flag enables the AI panel variant', async ({ page, context }) => {
    // TODO 6: Add a cookie { name: 'feature_ai_suggestions', value: 'enabled',
    //   domain: 'localhost', path: '/' } via context.addCookies().
    // Why? Cookie-based flags are read server-side — addCookies() before goto() sets the cookie
    // before the first request, ensuring the server renders the correct variant.
    await context.addCookies([{
      name: 'feature_ai_suggestions',
      value: /* TODO 6: 'enabled' */ 'disabled',
      domain: 'localhost',
      path: '/',
    }]);

    await page.goto('/dashboard');

    // TODO 7: Assert that 'ai-suggestions-panel' is visible (cookie flag active).
    await expect(page.getByTestId('ai-suggestions-panel'))./* TODO 7: toBeVisible() */ toBeHidden();
  });

  // Test 5: URL parameter flag activation
  test('URL parameter flag activates the beta dashboard', async ({ page }) => {
    // URL-param flags are common for QA overrides — append ?flags=beta_dashboard to activate.

    // TODO 8: Navigate to '/dashboard?flags=beta_dashboard'.
    // Why? URL params are the simplest flag mechanism — no cookie or script needed.
    await page.goto(/* TODO 8: '/dashboard?flags=beta_dashboard' */ '/dashboard');

    // TODO 9: Assert that the element with testId 'beta-dashboard-banner' is visible.
    await expect(page.getByTestId('beta-dashboard-banner'))./* TODO 9: toBeVisible() */ toBeHidden();
  });

  // Test 6: addInitScript persists across SPA navigations
  test('addInitScript flag persists across client-side route changes', async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__featureFlags = { aiSuggestions: true };
    });

    await page.goto('/dashboard');

    // Navigate via SPA (no full page reload — history.pushState)
    await page.getByTestId('nav-projects').click();
    await page.waitForURL('**/projects');

    // Flag should still be active — addInitScript runs once per page load, not per route change
    const flagValue = await page.evaluate(() => (window as any).__featureFlags?.aiSuggestions);

    // TODO 10: Assert that flagValue is true (flag persists after SPA navigation).
    expect(flagValue).toBe(/* TODO 10: true */ false);
  });

});
