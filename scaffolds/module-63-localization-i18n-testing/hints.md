# M63 Hints

## TODO 1 — locale URL

```typescript
const url = code === 'en' ? '/' : `/${code}`;
await page.goto(url);
```

## TODO 2 — translated heading

```typescript
await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
```

## TODO 3 — open language switcher

```typescript
await page.getByTestId('language-switcher').click();
```

## TODO 4 — select French

```typescript
await page.getByTestId('lang-option-fr').click();
```

## TODO 5 — URL assertion

```typescript
await expect(page).toHaveURL(/\/fr/);
```

## TODO 6 — French heading

```typescript
await expect(page.getByRole('heading', { level: 1 })).toHaveText('Organisez votre travail');
```

## TODO 7 — locale persists

```typescript
await page.goto('/fr');
await page.getByRole('link', { name: 'Projets' }).click();
await expect(page).toHaveURL(/^\/fr/);
```

## TODO 8 — date format

```typescript
const dateText = await page.getByTestId('card-due-date').first().textContent();
expect(dateText).not.toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
```

## TODO 9 — price text truthy

```typescript
expect(priceText?.length).toBeGreaterThan(0);
```

## Parametric locale tests

The `for...of` loop over LOCALES generates one test per locale automatically:
- "en locale shows correct hero heading"
- "fr locale shows correct hero heading"
- "es locale shows correct hero heading"

All three appear in the test report and can be run individually with --grep.
