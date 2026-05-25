# M04 Hints

## TODO 1 — `toHaveTitle`
```typescript
await expect(page).toHaveTitle(/Lumio/);
```

## TODO 2 — `toHaveURL`
```typescript
await expect(page).toHaveURL(/localhost:3000/);
```

## TODO 3 — `toBeVisible`
```typescript
await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
```

## TODO 4 — `toHaveText`
```typescript
await expect(freeHeading).toHaveText('Free');
```

## TODO 5 — `toHaveCount`
```typescript
await expect(page.getByTestId('feature-card')).toHaveCount(4);
```

## TODO 6 — `toHaveAttribute`
```typescript
await expect(ctaLink).toHaveAttribute('href', '/signup');
```

## TODO 7 — `expect.soft(...).toBeVisible()`
```typescript
await expect.soft(page.getByRole('heading', { level: 1 })).toBeVisible();
```

## TODO 8 — `expect.soft(page).toHaveTitle`
```typescript
await expect.soft(page).toHaveTitle(/Lumio/);
```

## TODO 9 — `expect.poll(() => counter)`
```typescript
await expect.poll(() => counter, { timeout: 2000 }).toBe(5);
```

The first argument to `expect.poll` is a function (not a value).
Playwright calls this function repeatedly until the assertion passes.
