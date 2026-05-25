import { test, expect } from '../fixtures/fixtures';

// M63: Localization & i18n Testing
//
// Lumio uses next-intl for locale routing. Locale is determined by the URL prefix:
//   /en/... — English (default)
//   /fr/... — French
//   /es/... — Spanish
//
// Testing strategies:
//   1. Navigate to locale-prefixed URLs directly (/fr, /fr/projects/...)
//   2. Interact with the language switcher UI
//   3. Assert translated text for known strings
//   4. Verify RTL layout for right-to-left locales (if supported)

const LOCALES = [
  { code: 'en', heading: 'Organize your work' },
  { code: 'fr', heading: 'Organisez votre travail' },
  { code: 'es', heading: 'Organiza tu trabajo' },
] as const;

test.describe('Locale routing', () => {
  for (const { code, heading } of LOCALES) {
    test(`${code} locale shows correct hero heading`, async ({ page }) => {
      // TODO 1: Navigate to the locale-prefixed root URL (e.g. /fr for French).
      // For 'en', navigate to / (English is the default, no prefix needed).
      const url = code === 'en' ? '/' : `/${code}`;
      await page.goto(/* TODO 1: url */);

      // TODO 2: Assert the h1 heading matches the expected translated string.
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(/* TODO 2: heading */);
    });
  }
});

test.describe('Language switcher', () => {
  test('switching to French updates the URL and heading', async ({ page }) => {
    await page.goto('/');

    // TODO 3: Open the language switcher dropdown.
    // data-testid="language-switcher"
    await page.getByTestId(/* TODO 3: 'language-switcher' */).click();

    // TODO 4: Select the French option.
    // data-testid="lang-option-fr"
    await page.getByTestId(/* TODO 4: 'lang-option-fr' */).click();

    // TODO 5: Assert the URL now starts with /fr.
    await expect(page).toHaveURL(/* TODO 5: /\/fr/ */);

    // TODO 6: Assert the heading is the French translation.
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Organisez votre travail');
  });

  test('locale preference is preserved on navigation', async ({ page }) => {
    // TODO 7: Navigate to /fr, then click the "Projects" nav link, and assert
    // the URL still starts with /fr (locale persists across in-app navigation).
    await page.goto('/fr');
    await page.getByRole('link', { name: 'Projets' }).click(); // French for "Projects"
    await expect(page).toHaveURL(/* TODO 7: /^\/fr/ */);
  });
});

test.describe('Locale-specific formatting', () => {
  test('date is formatted according to locale', async ({ page }) => {
    // TODO 8: Navigate to /fr/projects/demo/board and assert a date element
    // uses French date format (day/month/year or "12 mai 2026").
    // data-testid="card-due-date" contains a formatted date string.
    await page.goto('/fr/projects/demo/board');
    const dateText = await page.getByTestId('card-due-date').first().textContent();

    // French dates don't use slashes — assert no MM/DD/YYYY format
    expect(dateText).not.toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });

  test('number formatting matches locale', async ({ page }) => {
    // TODO 9: Navigate to the French pricing page (/fr/pricing) and assert
    // that currency amounts use French number formatting (space as thousands separator,
    // comma as decimal separator — e.g. "9,99 $").
    await page.goto('/fr/pricing');
    const priceText = await page.getByTestId('price-amount').first().textContent();
    // French: 9,99 or 9.99 — just assert it's truthy and non-empty
    expect(priceText?.length).toBeGreaterThan(/* TODO 9: 0 */);
  });
});
