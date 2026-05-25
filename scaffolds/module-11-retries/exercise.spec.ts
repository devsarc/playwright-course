import { test, expect } from '../fixtures/fixtures';

// M11: Retries & Flakiness Management
//
// Run this module with retries enabled:
// npx playwright test tests/module-11-retries --retries=2
//
// A retry re-runs the entire test from the beginning — not from the failed step.
// The test must be idempotent: running it multiple times must produce the same result.

test.describe('Signup form — potentially timing-sensitive', () => {
  test('signup form has success toast after submission', async ({ page }) => {
    // This test simulates a success toast that appears briefly after an action.
    // Timing-sensitive tests like this are a common source of flakiness.

    // TODO 1: Navigate to /signup and fill the form.
    await page.goto('/signup');
    await page.getByLabel('Full name').fill('Retry Test User');
    await page.getByLabel('Email address').fill(`retry-${Date.now()}@test.com`);
    await page.getByLabel('Password').fill('TestPassword123!');

    // TODO 2: Submit the form by clicking the "Create account" button.
    await page.getByRole('button', { name: 'Create account' })/* TODO 2: click() */;

    // TODO 3: Assert that after submission, the page navigated to /verify-email.
    // Use waitForURL — signup redirects to /verify-email on success.
    await page./* TODO 3: waitForURL(/verify-email/, { timeout: 10_000 }) */ evaluate(() => void 0);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('retry metadata: check retry count inside the test', async ({ page }) => {
    const retryCount = test.info().retry;

    // TODO 4: Log the current retry count and skip setup steps if this is a retry.
    // Real use case: on first run, create test data; on retry, skip creation
    // because the data may already exist from the first run.
    console.log(`Running on attempt ${retryCount + 1}`);

    // TODO 5: Assert the retry count is a non-negative number.
    // This just verifies the API — in real tests you'd use this to branch logic.
    expect(retryCount)/* TODO 5: toBeGreaterThanOrEqual(0) */;
  });
});
