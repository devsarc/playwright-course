import { test, expect } from '../fixtures/fixtures';

// M89: Smoke Suite for Lumio
// These 8 tests cover the critical paths that, if broken, affect every user.
// Run with: npx playwright test tests/module-89-smoke-suite-for-lumio --grep "@smoke"

test.describe('M89 — Smoke Suite for Lumio', () => {

  // Smoke test 1: Landing page loads and brand is visible.
  // If this fails, marketing and SEO are broken for all visitors.
  test('landing: Lumio landing page loads with correct title @smoke', async ({ page }, testInfo) => {
    // TODO 1: Push an annotation with type 'tag' and description '@smoke'.
    // This makes the smoke membership explicit in the JSON reporter output and HTML report.
    testInfo.annotations.push({
      type: /* TODO 1: 'tag' */ 'PLACEHOLDER',
      description: '@smoke',
    });
    await page.goto('/');
    // TODO 1b: Replace /PLACEHOLDER/ with /Lumio/ — the page title must contain the brand name.
    await expect(page).toHaveTitle(/* TODO 1b: /Lumio/ */ /PLACEHOLDER/);
  });

  // Smoke test 2: Login page is reachable and shows the sign-in form.
  // If this fails, no credential-based user can log in.
  test('auth: login page is reachable and shows sign-in form @smoke', async ({ page }) => {
    await page.goto('/login');
    // TODO 2: Replace 'PLACEHOLDER' with 'Sign in' — the login form heading text.
    await expect(page.getByRole('heading', { name: /* TODO 2: 'Sign in' */ 'PLACEHOLDER' })).toBeVisible();
  });

  // Smoke test 3: Credential login succeeds and redirects to dashboard.
  // If this fails, no credential-based user can access any protected feature.
  test('auth: credential login succeeds and redirects to dashboard @smoke', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    // TODO 3: Replace /PLACEHOLDER/ with /dashboard/ — successful login lands on the dashboard.
    await expect(page).toHaveURL(/* TODO 3: /dashboard/ */ /PLACEHOLDER/);
  });

  // Smoke test 4: Dashboard loads for a logged-in user.
  // If this fails, users can log in but cannot see their work.
  test('dashboard: dashboard page loads after login @smoke', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(/dashboard/);
    // TODO 4: Replace 'PLACEHOLDER' with 'main' — the main content region should be visible on the dashboard.
    await expect(page.getByRole(/* TODO 4: 'main' */ 'PLACEHOLDER' as Parameters<typeof page.getByRole>[0])).toBeVisible();
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
    // TODO 5: Replace /PLACEHOLDER/ with /projects/ — the URL must contain 'projects'.
    await expect(page).toHaveURL(/* TODO 5: /projects/ */ /PLACEHOLDER/);
  });

  // Smoke test 6: Unauthenticated access to a protected route redirects to login.
  // If this fails, protected data is exposed to unauthenticated visitors.
  test('security: unauthenticated access to dashboard redirects to login @smoke', async ({ page }) => {
    await page.goto('/dashboard');
    // TODO 6: Replace /PLACEHOLDER/ with /login/ — unauthorized access must redirect to login.
    await expect(page).toHaveURL(/* TODO 6: /login/ */ /PLACEHOLDER/);
  });

  // Smoke test 7: API health endpoint returns 200.
  // If this fails, the backend is down and all API-dependent features are broken.
  test('api: health endpoint responds with status 200 @smoke', async ({ request }) => {
    const response = await request.get('/api/health');
    // TODO 7: Replace 999 with 200 — the health endpoint must return HTTP 200.
    expect(response.status()).toBe(/* TODO 7: 200 */ 999);
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
    // TODO 8: Replace /PLACEHOLDER/ with /\/$|\/login/ — logout lands on the root or login page.
    await expect(page).toHaveURL(/* TODO 8: /\/$|\/login/ */ /PLACEHOLDER/);
  });

});
