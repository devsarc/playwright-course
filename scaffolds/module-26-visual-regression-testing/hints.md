# M26 Hints

## TODO 1 — full-page screenshot

```typescript
await expect(page).toHaveScreenshot('landing-full.png', { fullPage: true });
```

## TODO 2 — element screenshot

```typescript
const hero = page.getByTestId('hero-section');
await expect(hero).toHaveScreenshot('hero-section.png');
```

## TODO 3 — dark mode screenshot

```typescript
await page.evaluate(() => document.documentElement.classList.add('dark'));
await expect(page).toHaveScreenshot('landing-dark.png', { fullPage: true });
```

## TODO 4 — column screenshot

```typescript
const doneColumn = page.getByTestId('kanban-column-done');
await expect(doneColumn).toHaveScreenshot('done-column.png');
```

## Updating baselines

When you intentionally change the UI, update baselines with:

```bash
npx playwright test module-22 --update-snapshots
```

## Threshold tuning

To allow minor rendering differences (anti-aliasing, font hinting):

```typescript
await expect(page).toHaveScreenshot('name.png', { maxDiffPixelRatio: 0.01 });
```
