import { test, expect } from '../fixtures/fixtures';

// M10: Watch Mode & Developer Workflow
//
// Run this module in watch mode:
// npx playwright test tests/module-10-watch-mode --watch
//
// Watch mode re-runs tests when files change. The key workflow:
// 1. Start watch mode
// 2. Open exercise.spec.ts
// 3. Complete a TODO
// 4. Save — watch re-runs automatically
// 5. See tests pass progressively

test.describe('Login form validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('login form has email and password fields @smoke', async ({ page }) => {
    // TODO 1: Assert the email input is visible.
    await expect(page.getByLabel('Email address'))/* TODO 1: toBeVisible() */;

    // TODO 2: Assert the password input is visible.
    await expect(page.getByLabel('Password'))/* TODO 2: toBeVisible() */;
  });

  test('login form has submit button @smoke', async ({ page }) => {
    // TODO 3: Assert the "Sign in" submit button is visible and enabled.
    const submitButton = page.getByRole('button', { name: 'Sign in' });
    await expect(submitButton)/* TODO 3: toBeVisible() */;
    await expect(submitButton)/* TODO 3b: toBeEnabled() */;
  });

  test('login form shows error on invalid credentials', async ({ page }) => {
    await page.getByLabel('Email address').fill('wrong@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // TODO 4: Assert an error message appears.
    // The login page renders a <div role="alert"> when credentials are invalid.
    const errorAlert = page.getByRole('alert');
    await expect(errorAlert)/* TODO 4: toBeVisible() */;
    await expect(errorAlert).toContainText('Invalid');
  });
});
