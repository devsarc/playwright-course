import { test, expect } from '../fixtures/fixtures';

// M00: Your first Playwright test.
// Goal: prove the environment works — Playwright can launch a browser,
// navigate to Lumio, and make an assertion.

test('Lumio landing page loads and has a title', async ({ page }) => {
  // TODO 1: Navigate to Lumio's landing page.
  // Use page.goto() with the path '/' — the baseURL from playwright.config.ts
  // will prepend http://localhost:3000 automatically.
  // Why baseURL? It lets you change environments (staging, prod) without
  // touching individual tests.
  await /* TODO 1: page.goto('/') */ undefined;

  // TODO 2: Assert the page has a <title> tag that is not empty.
  // Use expect(page).toHaveTitle() with a regex that matches any non-empty string.
  // Why a regex? A hard-coded title string would break every time marketing
  // renames the product. A regex tests the concept (title exists) not the copy.
  await expect(page).toHaveTitle(/* TODO 2: /\w+/ */);
});

test('Lumio landing page has a visible heading', async ({ page }) => {
  await page.goto('/');

  // TODO 3: Find the main heading on the landing page using getByRole.
  // Role: 'heading', level: 1 (the <h1>).
  // Why getByRole over page.locator('h1')? getByRole tests semantic meaning —
  // it finds the same element a screen reader would announce as the page heading,
  // regardless of what HTML tag or class is used.
  const heading = page.getByRole(/* TODO 3: 'heading', { level: 1 } */);

  // TODO 4: Assert the heading is visible (in the viewport, not hidden by CSS).
  await expect(heading)/* TODO 4: .toBeVisible() */;
});
