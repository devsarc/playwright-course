import { test, expect } from '../fixtures/fixtures';

// M04: Assertions — Verifying State
//
// Playwright's expect() assertions are "web-first": they auto-retry until the
// assertion passes or the timeout expires. This means you're asserting what the
// page SHOULD become, not what it IS right now.

test.describe('Assertions on Lumio landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('toHaveTitle: assert the page title', async ({ page }) => {
    // TODO 1: Assert the page title matches the regex /Lumio/.
    // toHaveTitle auto-retries until the <title> tag matches or timeout expires.
    await expect(page)/* TODO 1: toHaveTitle(/Lumio/) */;
  });

  test('toHaveURL: assert the current URL', async ({ page }) => {
    // TODO 2: Assert the URL contains 'localhost:3000'.
    await expect(page)/* TODO 2: toHaveURL(/localhost:3000/) */;
  });

  test('toBeVisible: assert element is in the viewport', async ({ page }) => {
    // TODO 3: Assert the h1 heading is visible.
    // toBeVisible checks: attached to DOM + not hidden by CSS + non-zero size.
    await expect(page.getByRole('heading', { level: 1 }))/* TODO 3: toBeVisible() */;
  });

  test('toHaveText: assert element text content', async ({ page }) => {
    // TODO 4: Find the "Free" pricing card heading and assert its text is exactly "Free".
    // toHaveText with a string does exact match on the trimmed text content.
    const freeCard = page.getByTestId('pricing-card-free');
    const freeHeading = freeCard.getByRole('heading', { level: 3 });

    await expect(freeHeading)/* TODO 4: toHaveText('Free') */;
  });

  test('toHaveCount: assert number of matching elements', async ({ page }) => {
    // TODO 5: Assert the page has exactly 4 feature cards.
    await expect(page.getByTestId('feature-card'))/* TODO 5: toHaveCount(4) */;
  });

  test('toHaveAttribute: assert an element attribute value', async ({ page }) => {
    // TODO 6: Assert that the "Get started free" link has href="/signup".
    const ctaLink = page.getByRole('link', { name: 'Get started free' }).first();
    await expect(ctaLink)/* TODO 6: toHaveAttribute('href', '/signup') */;
  });

  test('soft assertions: collect multiple failures', async ({ page }) => {
    // Soft assertions do NOT stop the test on failure — they collect all failures
    // and report them together at the end. Use when you want to check multiple
    // independent properties in one test without short-circuiting on the first miss.

    // TODO 7: Write a soft assertion that the h1 is visible.
    // Use expect.soft() instead of expect().
    await expect.soft(page.getByRole('heading', { level: 1 }))/* TODO 7: toBeVisible() */;

    // TODO 8: Write a soft assertion that the page title contains 'Lumio'.
    await expect.soft(page)/* TODO 8: toHaveTitle(/Lumio/) */;

    // If either soft assertion fails, the test continues but is reported as failed
    // after all assertions are collected.
  });

  test('expect.poll: assert a non-Playwright value eventually becomes true', async ({ page }) => {
    // expect.poll() is for asserting JavaScript values that change asynchronously —
    // values that don't come from a Playwright locator.
    // Example: waiting for a global counter to reach a value.

    let counter = 0;
    setTimeout(() => { counter = 5; }, 100);

    // TODO 9: Use expect.poll() to assert that `counter` becomes 5 within 2 seconds.
    // expect.poll() takes a function and retries it until the assertion passes.
    await expect.poll(/* TODO 9: () => counter */ (() => 0), { timeout: 2000 }).toBe(5);
  });
});
