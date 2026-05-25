# M79 Hints

## TODO 1 — Healed create button locator

```typescript
const createBtn = page.getByRole('button', { name: 'New task' });
```

The CSS class `.task-create-btn` was renamed in a UI refactor. `getByRole('button', { name: 'New task' })` is the healed replacement — it's role-based and survives CSS changes. `'PLACEHOLDER'` finds no button with that name.

## TODO 2 — Healed heading locator inside card

```typescript
const title = firstCard.getByRole('heading');
```

`data-testid="task-card-title"` was removed when the component was simplified. `getByRole('heading')` scoped inside `firstCard` finds the task title `<h3>` — without depending on a `data-testid` attribute that may be removed in future refactors. `'PLACEHOLDER'` is not a valid role name.

## TODO 3 — Healed column heading text

```typescript
await expect(todoHeading).toHaveText(/^Todo$/);
```

The column heading was changed from "TO DO" to "Todo" in a copy update. `/^Todo$/` matches exactly "Todo" (anchored by `^` and `$`). `/PLACEHOLDER/` won't match "Todo". Note: the test also uses `getByRole('heading', { name: /todo/i })` with a case-insensitive flag to find the heading regardless of casing.

## TODO 4 — Healed wait strategy

```typescript
await expect(page.getByRole('dialog')).toBeVisible();
```

`waitForTimeout(3000)` is timing-dependent — it fails on slow machines and wastes 3 seconds on fast ones. `expect(dialog).toBeVisible()` waits until the dialog appears using Playwright's auto-wait, which is both reliable and efficient. `'PLACEHOLDER'` finds no element with that role.

## TODO 5 — Healed URL pattern

```typescript
await expect(page).toHaveURL(/tasks\//);
```

The URL structure changed from `/task-detail?id=X` to `/projects/{slug}/tasks/{id}`. The regex `/tasks\//` matches the new URL pattern for any task ID. `/PLACEHOLDER/` won't match any real task URL.

## TODO 6 — Healed scoped priority assertion

```typescript
await expect(priorityBadge).toHaveText(/High|Medium|Low|Critical/);
```

`/PLACEHOLDER/` won't match any priority value. The healed version scopes the locator to `firstCard.getByTestId('priority-badge')` — eliminating the ambiguity of matching multiple priority badges across all cards. The regex validates the badge shows a known priority value.

## TODO 7 — Healed outcome assertion

```typescript
await expect(todoColumn).toContainText('Healed test task');
```

`'PLACEHOLDER'` won't be found. The original test had no assertion after task creation — a common AI generation gap. The healed test adds the missing assertion scoped to the Todo column, confirming the task appeared in the right column (not just somewhere on the page).
