# M00 Hints

## TODO 1 — `page.goto('/')`

`page.goto` takes a path string. When `baseURL` is set in `playwright.config.ts`,
Playwright prepends it automatically:

```typescript
await page.goto('/');
// resolves to: http://localhost:3000/
```

## TODO 2 — `toHaveTitle`

`toHaveTitle` accepts a string (exact match) or a RegExp (partial match).
To assert any non-empty title, use `/\w+/`:

```typescript
await expect(page).toHaveTitle(/\w+/);
```

If you want to be specific about Lumio's title:
```typescript
await expect(page).toHaveTitle(/Lumio/);
```

## TODO 3 — `getByRole('heading', { level: 1 })`

`page.getByRole` takes the ARIA role and optional options:

```typescript
const heading = page.getByRole('heading', { level: 1 });
```

## TODO 4 — `toBeVisible()`

```typescript
await expect(heading).toBeVisible();
```
