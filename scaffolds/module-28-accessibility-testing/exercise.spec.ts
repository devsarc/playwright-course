import { test, expect } from '../fixtures/fixtures';
import AxeBuilder from '@axe-core/playwright';

// M28: Accessibility Testing with axe-core
//
// axe-core runs WCAG 2.1 rules in the browser context and returns a list of
// violations. Each violation has an id (e.g. "color-contrast"), impact level
// (critical/serious/moderate/minor), and the exact DOM nodes that fail.
//
// Install: npm install --save-dev @axe-core/playwright

test.describe('Accessibility — landing page', () => {
  test('landing page has no critical axe violations', async ({ page }) => {
    await page.goto('/');

    // TODO 1: Create an AxeBuilder for the page, run the analysis, and
    // destructure { violations } from the result.
    // AxeBuilder is instantiated with ({ page }) — it injects axe-core
    // into the current page and runs all enabled rules.
    const { violations } = await new AxeBuilder(/* TODO 1: { page } */).analyze();

    // TODO 2: Assert violations is an empty array.
    // Use expect(violations).toEqual([]) — if the assertion fails, Playwright
    // prints the full violations array which tells you exactly what to fix.
    expect(violations).toEqual(/* TODO 2: [] */);
  });

  test('landing page passes WCAG 2.1 AA rules only', async ({ page }) => {
    await page.goto('/');

    // TODO 3: Run axe with only WCAG 2.1 AA tags.
    // .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']) scopes the scan.
    // Why scope? Best-practice and experimental rules have false-positives;
    // WCAG tags target the rules your legal team actually cares about.
    const { violations } = await new AxeBuilder({ page })
      .withTags(/* TODO 3: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] */)
      .analyze();

    expect(violations).toEqual([]);
  });
});

test.describe('Accessibility — kanban board', () => {
  test('board page passes WCAG 2.1 AA', async ({ page }) => {
    await page.goto('/projects/demo/board');

    // TODO 4: Run a WCAG 2.1 AA scoped axe scan on the board page.
    // Reuse the same pattern from TODO 3.
    const { violations } = await /* TODO 4 */ Promise.resolve({ violations: [] as unknown[] });

    expect(violations).toEqual([]);
  });

  test('each kanban card is keyboard-focusable', async ({ page }) => {
    await page.goto('/projects/demo/board');

    // TODO 5: Press Tab until a kanban card receives focus. Assert that
    // page.getByTestId('kanban-card').first() is focused using
    // expect(locator).toBeFocused().
    // Keyboard navigation tests go beyond axe — they verify interactive flow,
    // not just markup attributes.
    await page.keyboard.press('Tab');
    // TODO 5: press Tab enough times to reach the first card, then assert focus
    /* TODO 5 */
  });
});

test.describe('Accessibility — scoped scan', () => {
  test('pricing section has no violations', async ({ page }) => {
    await page.goto('/');

    // TODO 6: Scope the axe scan to only the pricing section using .include().
    // .include('[data-testid="pricing-section"]') limits the scan to that subtree.
    // Scoped scans are faster and surface fewer false positives from unrelated sections.
    const { violations } = await new AxeBuilder({ page })
      .include(/* TODO 6: '[data-testid="pricing-section"]' */)
      .analyze();

    expect(violations).toEqual([]);
  });
});
