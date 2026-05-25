import { test, expect } from '../fixtures/fixtures';

// M13: Advanced Network Patterns
//
// addInitScript injects JS that runs before any page script — useful for overriding
// globals, mocking browser APIs, or injecting test flags without hitting the DB.
// context.setOffline() simulates a network failure at the OS level (not just API interception).

test.describe('Advanced network patterns', () => {
  test('addInitScript: inject a feature flag before page load', async ({ page }) => {
    // TODO 1: Use page.addInitScript() to inject window.__lumioFlags = { aiSuggestions: true }
    // before the page loads. This simulates a feature flag being enabled without
    // hitting the database.
    await page.addInitScript(/* TODO 1: () => {
      (window as any).__lumioFlags = { aiSuggestions: true };
    } */);

    await page.goto('/');

    // TODO 2: Use page.evaluate() to read window.__lumioFlags and assert it's set.
    const flags = await page.evaluate(/* TODO 2: () => (window as any).__lumioFlags */);
    expect(flags).toEqual({ aiSuggestions: true });
  });

  test('page.on request: monitor outgoing API calls', async ({ page }) => {
    const apiRequests: string[] = [];

    // TODO 3: Listen to page's 'request' event and collect all API request URLs.
    // Use page.on('request', handler). The handler receives a Request object;
    // call request.url() to get the URL.
    page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        apiRequests.push(/* TODO 3: request.url() */);
      }
    });

    await page.goto('/login');
    await page.getByLabel('Email address').fill('test@lumio.dev');
    await page.getByLabel('Password').fill('TestPassword123!');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Wait for navigation or error
    await page.waitForLoadState('networkidle');

    // TODO 4: Assert that at least one request was made to /api/auth/callback/credentials.
    expect(apiRequests.some((url) => url.includes('/api/auth')))/* TODO 4: toBe(true) */;
  });

  test('context.setOffline: simulate network failure', async ({ context, page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // TODO 5: Set the browser context offline using context.setOffline(true).
    // After going offline, any new network request will fail with a network error.
    await context./* TODO 5: setOffline(true) */ setOffline(false);

    // Try to navigate to a new page — it will fail with net::ERR_INTERNET_DISCONNECTED
    // Wrap in try/catch to handle the navigation error gracefully in the test
    try {
      await page.goto('/pricing', { timeout: 3000 });
    } catch {
      // Expected — network is offline
    }

    // TODO 6: Restore online status and verify navigation works again.
    await context.setOffline(/* TODO 6: false */);
    await page.goto('/pricing');
    await expect(page).toHaveURL(/\/pricing/);
  });
});
