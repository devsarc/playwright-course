import { test, expect } from '../fixtures/fixtures';

// M26: Visual Regression Testing
//
// toHaveScreenshot() compares pixel-by-pixel against a stored baseline PNG.
// On the first run (no baseline exists), Playwright writes the baseline and
// FAILS the test — re-run once to confirm it passes.
//
// Baselines live in __screenshots__/ next to the spec. Commit them to git
// so CI can compare against the same baseline you approved locally.

test.describe('Visual regression — Lumio landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('full landing page matches baseline', async ({ page }) => {
    // TODO 1: Take a full-page screenshot and compare against the baseline.
    // Pass { fullPage: true } to capture content below the fold.
    // Why visual tests? They catch CSS regressions (colour, spacing, layout)
    // that functional assertions miss entirely.
    await expect(page).toHaveScreenshot(/* TODO 1: 'landing-full.png', { fullPage: true } */);
  });

  test('hero section matches baseline', async ({ page }) => {
    // TODO 2: Capture only the hero section element using toHaveScreenshot on a Locator.
    // Locator: page.getByTestId('hero-section')
    // Scoping to one element prevents false positives from unrelated page changes.
    const hero = page.getByTestId(/* TODO 2: 'hero-section' */);
    await expect(hero).toHaveScreenshot(/* TODO 2: 'hero-section.png' */);
  });

  test('dark mode landing page matches baseline', async ({ page }) => {
    // TODO 3: Enable dark mode by evaluating JS to add the "dark" class to
    // document.documentElement, then take a full-page screenshot.
    // page.evaluate() runs code in the browser context — use it when you need
    // to manipulate the DOM in a way no UI interaction can do.
    await page.evaluate(/* TODO 3: () => document.documentElement.classList.add('dark') */);
    await expect(page).toHaveScreenshot(/* TODO 3: 'landing-dark.png', { fullPage: true } */);
  });
});

test.describe('Visual regression — Kanban board', () => {
  test('empty column state matches baseline', async ({ page }) => {
    await page.goto('/projects/demo/board');
    // TODO 4: Find the "done" column (data-testid="kanban-column-done") and
    // take a screenshot of just that column. Name it 'done-column.png'.
    // Element screenshots are more stable than full-page — board layout changes
    // won't break a test that only cares about one column's appearance.
    const doneColumn = page.getByTestId(/* TODO 4 */);
    await expect(doneColumn).toHaveScreenshot(/* TODO 4: 'done-column.png' */);
  });
});
