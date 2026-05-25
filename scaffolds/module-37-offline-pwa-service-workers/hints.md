# M37 Hints

## TODO 1 — waitForEvent('serviceworker')

```typescript
const [sw] = await Promise.all([
  context.waitForEvent('serviceworker'),
  page.goto('/'),
]);
```

## TODO 2 — assert SW URL

```typescript
expect(sw.url()).toContain('sw.js');
```

## TODO 3 — serviceWorkers list

```typescript
const workers = context.serviceWorkers();
expect(workers.length).toBeGreaterThan(0);
```

## TODO 4 — go offline

```typescript
await context.setOffline(true);
```

## TODO 5 — offline banner

```typescript
await page.reload();
await expect(page.getByTestId('offline-banner')).toBeVisible();
```

## TODO 6 — cached content still visible

```typescript
await page.goto('/projects/demo/board');
await page.waitForTimeout(1000);
await context.setOffline(true);
await page.reload();
await expect(page.getByTestId('kanban-column-todo')).toBeVisible();
```

## TODO 7 — back online

```typescript
await context.setOffline(false);
await page.reload();
await expect(page.getByTestId('offline-banner')).not.toBeVisible();
```
