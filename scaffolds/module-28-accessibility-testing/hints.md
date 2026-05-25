# M28 Hints

## TODO 1 — AxeBuilder instantiation

```typescript
const { violations } = await new AxeBuilder({ page }).analyze();
```

## TODO 2 — assert no violations

```typescript
expect(violations).toEqual([]);
```

## TODO 3 — WCAG 2.1 AA tags

```typescript
const { violations } = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  .analyze();
```

## TODO 4 — board page scan

```typescript
const { violations } = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  .analyze();
```

## TODO 5 — keyboard focus

```typescript
// Tab through navigation links until you reach the first card
for (let i = 0; i < 10; i++) {
  await page.keyboard.press('Tab');
  const focused = await page.getByTestId('kanban-card').first().evaluate(
    el => el === document.activeElement
  );
  if (focused) break;
}
await expect(page.getByTestId('kanban-card').first()).toBeFocused();
```

## TODO 6 — scoped include

```typescript
const { violations } = await new AxeBuilder({ page })
  .include('[data-testid="pricing-section"]')
  .analyze();
```

## Reading violation output

When `expect(violations).toEqual([])` fails, Playwright prints each violation:

```json
[{
  "id": "color-contrast",
  "impact": "serious",
  "nodes": [{ "html": "<p class=\"text-gray-400\">..." }]
}]
```

Fix the element, re-run, repeat.
