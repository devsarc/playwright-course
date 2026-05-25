# M63: Localization & i18n Testing

## Learning Objectives

- Navigate to locale-prefixed URLs and assert translated strings
- Interact with a language switcher and assert URL changes
- Verify locale persistence across in-app navigation
- Test locale-specific date and number formatting
- Set the browser locale via `context` options (`locale: 'fr-FR'`) so `Intl.*` APIs return locale-aware output
- Test RTL layout: verify `dir="rtl"` on `<html>` and assert that the layout mirrors correctly for a hypothetical Arabic locale
- Build a multi-language regression strategy: parametric tests that cover all supported locales from a single data file

## Concept

Testing i18n is testing content — the UI structure is the same; the strings differ.
Two patterns:

**1. Parametric locale tests:**
```typescript
for (const { code, heading } of LOCALES) {
  test(`${code} locale shows ${heading}`, async ({ page }) => {
    await page.goto(code === 'en' ? '/' : `/${code}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
  });
}
```
Generates one test per locale — all visible in the report.

**2. Switcher interaction:**
```typescript
await page.getByTestId('language-switcher').click();
await page.getByTestId('lang-option-fr').click();
await expect(page).toHaveURL(/\/fr/);
```

**Browser-level locale (affects `Intl.*` APIs):**
```typescript
const context = await browser.newContext({ locale: 'fr-FR' });
```
This sets what `Intl.DateTimeFormat`, `Intl.NumberFormat`, and `Intl.RelativeTimeFormat` return — independently of the URL locale prefix. Use both together for complete coverage.

## Key Takeaways

1. Navigate to locale URLs directly — it's faster than clicking the switcher.
2. Use `toHaveURL(/\/fr/)` — not `toHaveURL('/fr/...')` — to match any /fr path.
3. Parametric tests (loop over locales) give you full locale coverage without repetition.
4. Test locale persistence by navigating within the app and checking the URL prefix.

## Going Deeper

- [next-intl docs](https://next-intl-docs.vercel.app/)
- [Playwright docs: toHaveURL](https://playwright.dev/docs/api/class-pageassertions#page-assertions-to-have-url)
