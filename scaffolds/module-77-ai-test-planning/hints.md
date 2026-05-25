# M77 Hints

## TODO 1 — Column count assertion

```typescript
await expect(columns).toHaveCount(3);
```

`0` always fails. The kanban board has exactly 3 status columns: "Todo", "In Progress", and "Done". Each column is a `<section>` or `<div>` with a matching `aria-label`. If the AI planner sees only 2 columns, it generates incomplete plans — this check verifies the board structure before trusting the plan.

## TODO 2 — Heading role in task card

```typescript
await expect(firstCard.getByRole('heading')).toBeVisible();
```

`'PLACEHOLDER'` finds no element with that role. Task cards render their title as a heading (`<h3>` or element with `role="heading"`). The planner documents: "each card has a `heading` — assert its text matches the task title." This is how AI-generated plans translate observations into assertions.

## TODO 3 — New task button name

```typescript
const newTaskBtn = page.getByRole('button', { name: 'New task' });
```

`'PLACEHOLDER'` finds no button with that label. The "New task" button is the entry point for the task creation flow — a planner identifies it as the start of the highest-priority flow to test.

## TODO 4 — Drag handle test ID

```typescript
await expect(firstCard.locator('[data-testid="drag-handle"]')).toBeVisible();
```

`'[data-testid="PLACEHOLDER"]'` finds no element. The drag handle's presence tells the planner to generate a "reorder task" flow in the plan. If the drag handle is missing, the planner correctly omits drag-drop tests — but this test catches regressions where the drag handle was accidentally removed.

## TODO 5 — Filter control count

```typescript
expect(count).toBeGreaterThanOrEqual(1);
```

`999` always fails. The board has at least one filter (assignee dropdown or priority select). Each filter the planner finds becomes a new dimension of test coverage: "filter by Alice → only Alice's tasks visible."

## TODO 6 — Empty state text

```typescript
await expect(todoColumn).toContainText('No tasks');
```

`'PLACEHOLDER'` won't match the actual empty state message. The empty state is a frequently missed scenario in AI-generated plans — the planner must navigate to a state with no data to discover it. Here the plan explicitly includes it.

## TODO 7 — Column count badge regex

```typescript
await expect(countBadge).toHaveText(/^\d+$/);
```

`/PLACEHOLDER/` won't match "3" or "12". The regex `/^\d+$/` matches any non-negative integer. This assertion validates that column counts are numeric — the building block for "count decreases by 1 after drag" assertions in the full test plan.
