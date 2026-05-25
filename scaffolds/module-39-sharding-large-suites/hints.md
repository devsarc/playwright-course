# M39 Hints

## TODO 1 — landing page heading

```typescript
await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
```

## TODO 2 — all three columns

```typescript
await expect(page.getByTestId('kanban-column-in-progress')).toBeVisible();
await expect(page.getByTestId('kanban-column-done')).toBeVisible();
```

## TODO 3 — retry-aware test

```typescript
if (testInfo.retry === 0) {
  expect(testInfo.retry).toBe(99); // fails deliberately on first attempt
}
```

## TODO 4 — CI env check

```typescript
test.skip(!process.env.CI, 'shard env vars only exist in CI');
expect(process.env.CI).toBeDefined();
```

## Selecting @smoke tests

```bash
npx playwright test --grep "@smoke"
```

## Sharding syntax

```bash
# Run shard 1 of 4
npx playwright test --shard=1/4

# Merge reports from all shards
npx playwright merge-reports ./all-blob-reports --reporter html
```
