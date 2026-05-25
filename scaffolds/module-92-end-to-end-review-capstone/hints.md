# M92 Hints

## TODO 1 — signup

```typescript
await page.goto('/signup');
await page.getByTestId('signup-name').fill(NEW_USER.name);
await page.getByTestId('signup-email').fill(NEW_USER.email);
await page.getByTestId('signup-password').fill(NEW_USER.password);
await page.getByRole('button', { name: 'Create account' }).click();
await expect(page).toHaveURL(/\/dashboard/);
```

## TODO 2 — create project

```typescript
await page.getByTestId('new-project-button').click();
await page.getByTestId('project-name-input').fill('Capstone Project');
await page.getByRole('button', { name: 'Create' }).click();
await expect(page).toHaveURL(/\/projects\//);
```

## TODO 3 — add cards

```typescript
await kanban.addCard('Task 1: Research');
await kanban.addCard('Task 2: Design');
await kanban.addCard('Task 3: Implement');
```

## TODO 4 — drag to in-progress

```typescript
const firstCard = kanban.todoColumn.getByTestId('kanban-card').first();
await firstCard.dragTo(kanban.inProgressColumn);
```

## TODO 5 — axe audit

```typescript
const { violations } = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  .analyze();
expect(violations).toEqual([]);
```

## TODO 6 — performance budget

```typescript
const start = Date.now();
await page.reload();
await page.getByTestId('kanban-column-todo').waitFor();
const elapsed = Date.now() - start;
expect(elapsed).toBeLessThan(5000);
```

## TODO 7 — viewer navigation

```typescript
await viewerPage.goto('/projects/demo/board');
```

## TODO 8 — author adds card

```typescript
const cardTitle = `capstone-collab-${Date.now()}`;
await authorPage.getByTestId('add-card-button').click();
await authorPage.getByTestId('new-card-input').fill(cardTitle);
await authorPage.getByTestId('new-card-input').press('Enter');
```

## TODO 9 — viewer sees card

```typescript
await expect(
  viewerPage.getByTestId('kanban-card').filter({ hasText: cardTitle })
).toBeVisible();
```

## test.step() best practices

- Keep step names concise: "Sign up", "Create project", "Verify board"
- One logical action per step — steps appear in the trace viewer timeline
- Failures show the step name in the error message — makes CI reports readable
