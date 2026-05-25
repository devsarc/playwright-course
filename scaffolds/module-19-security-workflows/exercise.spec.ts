import { test, expect } from '../fixtures/fixtures';
import path from 'path';

// M19: Security Workflow Testing
//
// Security tests verify that the application enforces its access rules:
// - Unauthenticated users can't access protected routes
// - Members can't access admin routes
// - CAPTCHA is disabled in test environments
// - Session expiry is handled correctly

// Reuse the member auth state from M16 (if it exists)
const MEMBER_AUTH = path.join(__dirname, '../module-16-auth-patterns/.auth-state-member.json');

test.describe('Unauthenticated access', () => {
  test('redirect to login when accessing dashboard unauthenticated', async ({ page }) => {
    // TODO 1: Navigate to /dashboard WITHOUT authentication.
    // Assert you are redirected to /login.
    await page.goto('/dashboard');
    await expect(page)/* TODO 1: toHaveURL(/\/login/) */;
  });

  test('redirect to login when accessing admin panel unauthenticated', async ({ page }) => {
    // TODO 2: Navigate to /admin. Assert redirect to /login.
    await page.goto('/admin');
    await expect(page)/* TODO 2: toHaveURL(/\/login/) */;
  });

  test('API returns 401 for protected endpoints', async ({ request }) => {
    // TODO 3: Make an unauthenticated GET to /api/workspaces. Assert 401.
    const res = await request.get('/api/workspaces');
    expect(res.status())/* TODO 3: toBe(401) */;
  });
});

test.describe('Member access controls', () => {
  // Set up with a regular member's auth state
  test.use({ storageState: MEMBER_AUTH });

  test('member cannot access admin panel — gets redirected', async ({ page }) => {
    // TODO 4: Navigate to /admin as a member. Assert redirect to /dashboard.
    // (The app redirects non-admin users to /dashboard, not to /login.)
    await page.goto('/admin');
    await expect(page)/* TODO 4: toHaveURL(/\/dashboard/) */;
  });

  test('member API calls return 403 on admin endpoints', async ({ request, page }) => {
    // Navigate first so the session cookie is active
    await page.goto('/dashboard');

    // TODO 5: Make a GET to /api/admin/users as a member. Assert 403.
    const res = await request.get('/api/admin/users');
    expect(res.status())/* TODO 5: toBe(403) */;
  });
});
