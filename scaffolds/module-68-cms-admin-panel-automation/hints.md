# M68 Hints

## TODO 1 — columnheader role locator

```typescript
const emailHeader = page.getByRole('columnheader', { name: 'Email' });
```

`getByRole('columnheader')` matches `<th>` elements with `role="columnheader"` (implicit for `<th>` inside `<thead>`). The `name` option matches the accessible name, which is the visible text.

## TODO 2 — Assert aria-sort ascending

```typescript
await expect(emailHeader).toHaveAttribute('aria-sort', 'ascending');
```

The `aria-sort` attribute has four valid values: `'none'`, `'ascending'`, `'descending'`, `'other'`. Well-built admin tables update this attribute on sort to communicate state to assistive technology — and to your tests.

## TODO 3 — Assert aria-sort descending

```typescript
await expect(emailHeader).toHaveAttribute('aria-sort', 'descending');
```

## TODO 4 — Filter input placeholder

```typescript
const filterInput = page.getByPlaceholder('Filter by email');
```

## TODO 5 — Assert count decreased

```typescript
expect(afterCount).toBeLessThan(initialCount);
```

## TODO 6 — Next page button name

```typescript
await page.getByRole('button', { name: 'Next page' }).click();
```

## TODO 7 — Assert pagination status changed

```typescript
expect(statusAfter).not.toBe(statusBefore);
```

`statusBefore` might be "1–10 of 47" and `statusAfter` "11–20 of 47". Not-equal is sufficient here — you don't need to know the exact values.

## TODO 8 — Checkbox role in row

```typescript
await rows.nth(1).getByRole('checkbox').check();
```

`rows.nth(1)` is the first data row (nth(0) is the header). Each row has a checkbox for selection — `getByRole('checkbox')` finds it within that row's scope.

## TODO 9 — Assert row count after delete

```typescript
await expect(rows).toHaveCount(initialCount - 3);
```

Three rows were selected and deleted. The header row remains, so the new count is `initialCount - 3`.

## TODO 10 — setInputFiles on hidden input

```typescript
await page.locator('input[type="file"]').setInputFiles(logoFile);
```

`setInputFiles()` works on hidden inputs — no need to make the element visible. This bypasses the OS file picker entirely, which is essential for CI where no graphical environment is available.

## TODO 11 — Assert logo preview visible

```typescript
await expect(page.getByTestId('logo-preview')).toBeVisible();
```
