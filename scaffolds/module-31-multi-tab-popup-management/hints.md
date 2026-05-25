# M31 Hints

## TODO 1 — two pages, same context

```typescript
const pageA = await context.newPage();
const pageB = await context.newPage();
```

## TODO 2 — navigate pageB

```typescript
await pageB.goto('/projects/demo/board');
```

## TODO 3 — add a card in pageA

```typescript
const title = `multi-tab-${Date.now()}`;
await pageA.getByTestId('add-card-button').click();
await pageA.getByTestId('new-card-input').fill(title);
await pageA.getByTestId('new-card-input').press('Enter');
```

## TODO 4 — assert card in pageB

```typescript
await expect(
  pageB.getByTestId('kanban-card').filter({ hasText: title })
).toBeVisible();
```

## TODO 5 — two independent contexts

```typescript
const contextA = await browser.newContext({
  storageState: 'tests/fixtures/auth/user-a.json',
});
const contextB = await browser.newContext({
  storageState: 'tests/fixtures/auth/user-b.json',
});
```

## TODO 6 — navigate both users

```typescript
await pageA.goto('/projects/demo/board');
await pageB.goto('/projects/demo/board');
```

## TODO 7 — user A adds a card

```typescript
const cardTitle = `collab-${Date.now()}`;
await pageA.getByTestId('add-card-button').click();
await pageA.getByTestId('new-card-input').fill(cardTitle);
await pageA.getByTestId('new-card-input').press('Enter');
```

## TODO 8 — user B sees the card

```typescript
await expect(
  pageB.getByTestId('kanban-card').filter({ hasText: cardTitle })
).toBeVisible();
```

## TODO 9 — cleanup

```typescript
await contextA.close();
await contextB.close();
```

## TODO 10 — presence avatar

```typescript
await pageA.goto('/projects/demo/board');
await pageB.goto('/projects/demo/board');
await expect(pageB.getByTestId('presence-avatar')).toBeVisible();
```
