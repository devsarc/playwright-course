import { test, expect } from '../fixtures/fixtures';

// M02: Locators — Finding Elements
//
// A locator describes HOW to find an element, not WHICH element it is right now.
// Playwright re-evaluates locators on every interaction, which is why they stay
// valid even when the DOM re-renders between steps.

test.describe('Locator strategies on Lumio landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('getByRole: find the primary CTA button', async ({ page }) => {
    // TODO 1: Find the "Get started free" button using getByRole.
    // Role: 'link' (it's an <a> tag). Name: 'Get started free' (the visible text).
    // Why getByRole over page.locator('a')? It distinguishes interactive roles —
    // a button and a link are different roles even if they look the same visually.
    const cta = page.getByRole(/* TODO 1: 'link', { name: 'Get started free' } */);

    await expect(cta).toBeVisible();
  });

  test('getByRole: find a heading by level', async ({ page }) => {
    // TODO 2: Find the main h1 heading using getByRole with level: 1.
    const heading = page.getByRole(/* TODO 2: 'heading', { level: 1 } */);

    await expect(heading).toBeVisible();
  });

  test('getByText: find a nav link by exact text', async ({ page }) => {
    // TODO 3: Find the "Pricing" nav link using getByText.
    // Use exact: true to avoid matching "Pricing" inside "View pricing details".
    const pricingLink = page.getByText(/* TODO 3: 'Pricing', { exact: true } */);

    await expect(pricingLink).toBeVisible();
  });

  test('getByRole: find all pricing card headings', async ({ page }) => {
    // TODO 4: Find the three pricing tier headings (Free, Pro, Enterprise).
    // Use getByRole('heading', { level: 3 }) — the tier names are <h3> elements.
    // Then assert the locator resolves to exactly 3 elements.
    const tierHeadings = page.getByRole(/* TODO 4: 'heading', { level: 3 } */);

    // TODO 5: Assert there are exactly 3 tier headings.
    // Use .toHaveCount() — not .toBeVisible(), which only checks the first match.
    await expect(tierHeadings)/* TODO 5: toHaveCount(3) */;
  });

  test('locator chaining: find a button inside a specific pricing card', async ({ page }) => {
    // TODO 6: Find the Pro tier pricing card using data-testid.
    // The card has data-testid="pricing-card-pro".
    const proCard = page.getByTestId(/* TODO 6: 'pricing-card-pro' */);

    // TODO 7: Within the Pro card, find the CTA button using getByRole.
    // Chaining narrows the search scope — getByRole on a locator searches only within it.
    const proButton = proCard.getByRole(/* TODO 7: 'link' */);

    await expect(proButton).toBeVisible();
  });

  test('nth(): select a specific item from a list', async ({ page }) => {
    // TODO 8: Get the second feature card (index 1) using .nth().
    // The feature cards have data-testid="feature-card".
    const secondCard = page.getByTestId('feature-card').nth(/* TODO 8: 1 */);

    await expect(secondCard).toBeVisible();
  });

  test('filter(): narrow a locator by visible text', async ({ page }) => {
    // TODO 9: Find the feature card whose heading contains "Kanban" using .filter().
    // .filter({ hasText: '...' }) is applied AFTER the initial locator match.
    // It's more composable than embedding the text directly in the original locator.
    const kanbanCard = page.getByTestId('feature-card').filter(/* TODO 9: { hasText: 'Kanban' } */);

    await expect(kanbanCard).toBeVisible();
  });
});
