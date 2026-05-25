import { test, expect } from '../fixtures/fixtures';

// M05: Navigation & Page State
//
// Most navigation in Playwright is handled by auto-wait after actions like click().
// The explicit navigation APIs (waitForURL, waitForLoadState, waitForResponse) are
// needed for scenarios where navigation is triggered by non-Playwright code (redirects,
// timers, WebSocket messages, etc.) or when you need to assert about load state.

test.describe('Navigation on Lumio public pages', () => {
  test('goto: navigate directly to a page', async ({ page }) => {
    // TODO 1: Navigate to the Lumio docs page using page.goto('/docs').
    // Assert the page loaded by checking for an h1.
    await page.goto(/* TODO 1: '/docs' */);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('reload: refresh the page and assert content persists', async ({ page }) => {
    await page.goto('/');

    // TODO 2: Reload the page using page.reload().
    // After reload, assert the h1 is still visible (basic smoke check).
    await page./* TODO 2: reload() */ evaluate(() => void 0);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('goBack / goForward: browser history navigation', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Pricing' }).click();
    await expect(page).toHaveURL(/\/pricing/);

    // TODO 3: Navigate back to the landing page using page.goBack().
    await page./* TODO 3: goBack() */;
    await expect(page).toHaveURL('http://localhost:3000/');

    // TODO 4: Navigate forward to /pricing using page.goForward().
    await page./* TODO 4: goForward() */;
    await expect(page).toHaveURL(/\/pricing/);
  });

  test('waitForURL: assert URL after client-side navigation', async ({ page }) => {
    await page.goto('/login');
    // Sign in with the test user credentials
    await page.getByLabel('Email address').fill(process.env.TEST_USER_EMAIL!);
    await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD!);
    await page.getByRole('button', { name: 'Sign in' }).click();

    // TODO 5: Wait for the URL to change to /dashboard after login.
    // waitForURL waits for the browser to navigate to a URL matching the pattern.
    // Use a regex to match any URL containing 'dashboard'.
    await page./* TODO 5: waitForURL(/dashboard/, { timeout: 10_000 }) */;

    await expect(page).toHaveURL(/dashboard/);
  });

  test('waitForLoadState: wait for network to settle', async ({ page }) => {
    // TODO 6: Navigate to the landing page and wait for 'domcontentloaded'.
    // 'domcontentloaded' fires when HTML is parsed but before images and stylesheets load.
    // 'load' fires after all resources. 'networkidle' fires when no requests for 500ms.
    // Use 'domcontentloaded' for fast pages; 'networkidle' for SPAs with dynamic content.
    await page.goto('/');
    await page./* TODO 6: waitForLoadState('domcontentloaded') */;
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('waitForResponse: intercept a specific API response', async ({ page }) => {
    // waitForResponse returns a promise that resolves when a matching response arrives.
    // Create the promise BEFORE the action that triggers the request.

    // TODO 7: Create a promise that waits for a response whose URL contains '/api/'.
    // Use page.waitForResponse() with a URL pattern.
    // Trigger it by navigating to /login and submitting the form — which calls /api/auth.
    const responsePromise = page./* TODO 7: waitForResponse(/\/api\//) */;
    await page.goto('/login');

    const response = await responsePromise;
    // Assert the response was received (status could be anything — we just verify it arrived)
    expect(response.status()).toBeGreaterThanOrEqual(0);
  });
});
