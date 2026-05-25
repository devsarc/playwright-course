import { test, expect } from '@playwright/test';
import path from 'path';

const AUTH_FILE = path.join(__dirname, '.auth-state-member.json');

// TODO 4: Configure this test file to use the saved auth state.
// Use test.use() with storageState pointing to AUTH_FILE.
// This makes every test in this file start as an authenticated user —
// no login UI interaction needed.
test.use({ storageState: /* TODO 4: AUTH_FILE */ undefined as any });

test('authenticated user can access dashboard', async ({ page }) => {
  // TODO 5: Navigate directly to /dashboard (no login needed — storageState handles it).
  await page.goto(/* TODO 5: '/dashboard' */);

  // Assert we're on the dashboard (not redirected to login)
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
});

test('authenticated user sees their name', async ({ page }) => {
  await page.goto('/dashboard');

  // The dashboard shows the user's name in the welcome message
  // TODO 6: Assert the page contains the test user's name or email.
  await expect(page.getByText(/* TODO 6: /Test User|test@lumio\.dev/ */)).toBeVisible();
});
