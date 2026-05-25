# M47 Hints

## TODO 1 — Locator property declarations

```typescript
readonly todoColumn: Locator;
readonly inProgressColumn: Locator;
readonly doneColumn: Locator;
```

## TODO 2 — addCardButton declaration

```typescript
readonly addCardButton: Locator;
```

## TODO 3 — Constructor initialization

```typescript
this.todoColumn = page.getByTestId('kanban-column-todo');
this.inProgressColumn = page.getByTestId('kanban-column-in-progress');
this.doneColumn = page.getByTestId('kanban-column-done');
this.addCardButton = page.getByTestId('add-card-button');
```

## TODO 4 — goto()

```typescript
async goto(projectId: string): Promise<void> {
  await this.page.goto(`/projects/${projectId}/board`);
}
```

## TODO 5 — addCard()

```typescript
async addCard(title: string): Promise<Locator> {
  await this.addCardButton.click();
  await this.page.getByTestId('new-card-input').fill(title);
  await this.page.getByTestId('new-card-input').press('Enter');
  return this.page.getByTestId('kanban-card').filter({ hasText: title });
}
```

## TODO 6 — cardCount()

```typescript
async cardCount(column: Locator): Promise<number> {
  return column.getByTestId('kanban-card').count();
}
```

## TODO 7 — beforeEach

```typescript
kanban = new KanbanPage(page);
await kanban.goto(PROJECT_ID);
```

## TODO 8 — column visibility

```typescript
await expect(kanban.todoColumn).toBeVisible();
await expect(kanban.inProgressColumn).toBeVisible();
await expect(kanban.doneColumn).toBeVisible();
```

## TODO 9 — addCard assertion

```typescript
const card = await kanban.addCard(title);
await expect(kanban.todoColumn.locator(card)).toBeVisible();
```

## TODO 10 — cardCount before/after

```typescript
const before = await kanban.cardCount(kanban.todoColumn);
await kanban.addCard('count test');
const after = await kanban.cardCount(kanban.todoColumn);
expect(after).toBe(before + 1);
```
