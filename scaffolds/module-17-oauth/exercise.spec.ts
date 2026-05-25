import { test, expect } from '../fixtures/fixtures';

// M17: OAuth & SSO Flows
//
// OAuth involves a redirect to an external provider (GitHub) and back.
// Two strategies:
// 1. Automate the real redirect (slow, brittle if GitHub changes their UI)
// 2. Mock the OAuth provider (fast, reliable, CI-friendly)
// Strategy 2 is strongly preferred for test suites.

test.describe('GitHub OAuth flow', () => {
  test('OAuth redirect: GitHub button navigates to GitHub authorize URL', async ({ page }) => {
    await page.goto('/login');

    // TODO 1: Listen for the popup window that opens when GitHub OAuth is triggered.
    // Use context.waitForEvent('page') BEFORE clicking the GitHub button.
    const popupPromise = page.context()/* TODO 1: waitForEvent('page') */;

    // TODO 2: Click the "GitHub" OAuth button.
    await page.getByRole('button', { name: /GitHub/i })/* TODO 2: click() */;

    // TODO 3: Await the popup promise to get the popup page.
    const popup = await /* TODO 3: popupPromise */ Promise.resolve(page as import('@playwright/test').Page);

    // TODO 4: Assert the popup URL contains 'github.com/login/oauth/authorize'.
    // waitForURL on the popup page to handle redirects.
    await popup./* TODO 4: waitForURL(/github\.com\/login\/oauth/, { timeout: 10_000 }) */ evaluate(() => void 0);
    await expect(popup).toHaveURL(/github\.com/);

    await popup.close();
  });

  test('mock OAuth: intercept the GitHub callback and simulate a successful login', async ({ page }) => {
    // Mocking OAuth means intercepting the callback URL that GitHub would redirect to,
    // and providing a mock response that NextAuth processes as a successful login.

    // TODO 5: Use page.route() to intercept the NextAuth GitHub callback URL.
    // Pattern: /api/auth/callback/github
    // Response: redirect to /dashboard (simulating a successful GitHub auth)
    await page.route('/api/auth/callback/github*', async (route) => {
      // TODO 5: Redirect to /dashboard to simulate successful OAuth
      await route./* TODO 5: fulfill({ status: 302, headers: { Location: '/dashboard' } }) */;
    });

    await page.goto('/login');
    await page.getByRole('button', { name: /GitHub/i }).click();

    // With the mock in place, after clicking GitHub, the OAuth popup would
    // hit the mocked callback and redirect to /dashboard.
    // (This simplified test demonstrates the mocking concept.)
  });
});
