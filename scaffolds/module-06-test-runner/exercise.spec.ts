import { test, expect } from '../fixtures/fixtures';

// M06: Test Runner Fundamentals
//
// describe blocks, lifecycle hooks, and test modifiers give you precise control
// over what runs, when, and under what conditions.

test.describe('Landing page smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // TODO 1: Add a test.afterEach that logs 'test finished' to the console.
  // afterEach runs after every test in this describe block, even on failure.
  /* TODO 1: test.afterEach(async () => { console.log('test finished'); }); */

  test('page loads', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('has pricing section', async ({ page }) => {
    await expect(page.getByTestId('pricing-card-free')).toBeVisible();
  });

  // TODO 2: Skip this test only on WebKit using test.skip with a condition.
  // Condition: browserName === 'webkit'. Reason: 'Date input behavior differs in WebKit'.
  test('skip on webkit example', async ({ page, browserName }) => {
    test.skip(/* TODO 2: browserName === 'webkit', 'Date input behavior differs in WebKit' */);
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  // TODO 3: Mark this test as fixme — it documents a known bug to fix later.
  test('footer has social links', async ({ page }) => {
    test.fixme(/* TODO 3: true, 'Social links not yet implemented in footer' */);
    await expect(page.getByRole('link', { name: 'Twitter' })).toBeVisible();
  });
});

test.describe('Login page', () => {
  // TODO 4: Add a custom annotation to this describe block.
  // Use test.describe.configure() to annotate all tests with { tag: '@smoke' }.
  // This allows filtering: npx playwright test --grep @smoke

  test('login page loads @smoke', async ({ page }) => {
    // The @smoke annotation in the test name also enables --grep @smoke filtering
    await page.goto('/login');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('signup page loads @smoke', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
