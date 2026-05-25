# M23 Hints

## TODO 1 — source card locator

```typescript
const sourceCard = page
  .getByTestId('kanban-column-todo')
  .getByTestId('kanban-card')
  .first();
```

## TODO 2 — target column

```typescript
const targetColumn = page.getByTestId('kanban-column-in-progress');
```

## TODO 3 — read title before drag

```typescript
const cardTitle = await sourceCard.textContent();
```

## TODO 4 — dragTo

```typescript
await sourceCard.dragTo(targetColumn);
```

## TODO 5 — assert position

```typescript
await expect(
  targetColumn.getByTestId('kanban-card').filter({ hasText: cardTitle! })
).toBeVisible();
```

## TODO 6 — in-progress to done

```typescript
const sourceCard = page.getByTestId('kanban-column-in-progress').getByTestId('kanban-card').first();
const targetColumn = page.getByTestId('kanban-column-done');
```

## TODO 7 — revert flow

```typescript
const sourceCard = page.getByTestId('kanban-column-done').getByTestId('kanban-card').first();
const targetColumn = page.getByTestId('kanban-column-todo');
const cardTitle = await sourceCard.textContent();
await sourceCard.dragTo(targetColumn);
await expect(
  targetColumn.getByTestId('kanban-card').filter({ hasText: cardTitle! })
).toBeVisible();
```

## TODO 8 — steps

```typescript
await sourceCard.dragTo(targetColumn, { steps: 20 });
```

## Manual mouse fallback

When dragTo fails, use page.mouse for precise control:

```typescript
const box = await sourceCard.boundingBox();
const tgt = await targetColumn.boundingBox();
await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
await page.mouse.down();
await page.mouse.move(tgt!.x + tgt!.width / 2, tgt!.y + 50, { steps: 20 });
await page.mouse.up();
```
