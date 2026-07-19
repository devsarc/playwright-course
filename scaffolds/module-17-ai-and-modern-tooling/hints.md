# Lesson 17 Hints

## Part 1 — AI Test Planning (formerly M77)

## TODO 1.1 — Column count assertion

```typescript
await expect(columns).toHaveCount(3);
```

`0` always fails. The kanban board has exactly 3 status columns: "Todo", "In Progress", and "Done". Each column is a `<section>` or `<div>` with a matching `aria-label`. If the AI planner sees only 2 columns, it generates incomplete plans — this check verifies the board structure before trusting the plan.

## TODO 1.2 — Heading role in task card

```typescript
await expect(firstCard.getByRole('heading')).toBeVisible();
```

`'PLACEHOLDER'` finds no element with that role. Task cards render their title as a heading (`<h3>` or element with `role="heading"`). The planner documents: "each card has a `heading` — assert its text matches the task title." This is how AI-generated plans translate observations into assertions.

## TODO 1.3 — New task button name

```typescript
const newTaskBtn = page.getByRole('button', { name: 'New task' });
```

`'PLACEHOLDER'` finds no button with that label. The "New task" button is the entry point for the task creation flow — a planner identifies it as the start of the highest-priority flow to test.

## TODO 1.4 — Drag handle test ID

```typescript
await expect(firstCard.locator('[data-testid="drag-handle"]')).toBeVisible();
```

`'[data-testid="PLACEHOLDER"]'` finds no element. The drag handle's presence tells the planner to generate a "reorder task" flow in the plan. If the drag handle is missing, the planner correctly omits drag-drop tests — but this test catches regressions where the drag handle was accidentally removed.

## TODO 1.5 — Filter control count

```typescript
expect(count).toBeGreaterThanOrEqual(1);
```

`999` always fails. The board has at least one filter (assignee dropdown or priority select). Each filter the planner finds becomes a new dimension of test coverage: "filter by Alice → only Alice's tasks visible."

## TODO 1.6 — Empty state text

```typescript
await expect(todoColumn).toContainText('No tasks');
```

`'PLACEHOLDER'` won't match the actual empty state message. The empty state is a frequently missed scenario in AI-generated plans — the planner must navigate to a state with no data to discover it. Here the plan explicitly includes it.

## TODO 1.7 — Column count badge regex

```typescript
await expect(countBadge).toHaveText(/^\d+$/);
```

`/PLACEHOLDER/` won't match "3" or "12". The regex `/^\d+$/` matches any non-negative integer. This assertion validates that column counts are numeric — the building block for "count decreases by 1 after drag" assertions in the full test plan.

## Part 2 — AI Test Code Generation (formerly M78)

## TODO 2.1 — Replace brittle CSS selector

```typescript
await page.getByRole('button', { name: 'New task' }).click();
```

`'PLACEHOLDER'` finds no button with that label. `getByRole('button', { name: 'New task' })` is robust: it matches by ARIA role and accessible name, both of which survive CSS refactoring, class renames, and DOM restructuring. CSS class selectors like `.btn-primary` break whenever a designer touches the stylesheet.

## TODO 2.2 — Add missing assertion

```typescript
await expect(page.getByText('Task with missing assertion')).toBeVisible();
```

`'PLACEHOLDER'` finds no matching text. The AI generator omitted this assertion because it only recorded browser actions — it didn't observe the outcome. Every action that changes visible state needs a corresponding assertion; without it, the test passes even if the action failed silently.

## TODO 2.3 — Replace timeout with dialog assertion

```typescript
await expect(page.getByRole('dialog')).toBeVisible();
```

`'PLACEHOLDER'` finds no element. `getByRole('dialog')` waits until the modal appears — Playwright's auto-wait handles the timing. A 2-second `waitForTimeout` is both flaky (fails on slow machines) and wasteful (waits even when the modal appeared in 200ms).

## TODO 2.4 — Use seeded task title

```typescript
const taskTitle = 'Design mockups';
```

`'PLACEHOLDER'` won't find any task. `'Design mockups'` is from the seed data — guaranteed to exist at the start of every test run. Relying on data created by a previous test makes the test order-dependent, which breaks parallel test execution and isolated runs.

## TODO 2.5 — Task detail URL regex

```typescript
await expect(page).toHaveURL(/tasks\//);
```

`/PLACEHOLDER/` won't match the task detail URL (e.g., `/projects/test-project/tasks/123`). Asserting the URL change confirms the click triggered a navigation — not just a modal open. Without this, a broken router that opened a modal instead of navigating would pass silently.

## TODO 2.6 — Board text assertion

```typescript
await expect(board).toContainText('Admin User');
```

`'PLACEHOLDER'` won't match. Scoping to `board` (the main content area) rather than `page` ensures the assertion applies to the filtered task cards, not to the header or sidebar where "Admin User" may also appear (in the user menu, for example).

## TODO 2.7 — Priority badge text regex

```typescript
await expect(priorityBadge).toHaveText(/High|Medium|Low|Critical/);
```

`/PLACEHOLDER/` won't match any priority value. Using a regex with alternatives is more robust than a literal string — it tests that the badge displays a valid priority without coupling to a specific seed task's priority value. If the test data changes, the assertion still passes.

## Part 3 — AI Test Healing (formerly M79)

## TODO 3.1 — Healed create button locator

```typescript
const createBtn = page.getByRole('button', { name: 'New task' });
```

The CSS class `.task-create-btn` was renamed in a UI refactor. `getByRole('button', { name: 'New task' })` is the healed replacement — it's role-based and survives CSS changes. `'PLACEHOLDER'` finds no button with that name.

## TODO 3.2 — Healed heading locator inside card

```typescript
const title = firstCard.getByRole('heading');
```

`data-testid="task-card-title"` was removed when the component was simplified. `getByRole('heading')` scoped inside `firstCard` finds the task title `<h3>` — without depending on a `data-testid` attribute that may be removed in future refactors. `'PLACEHOLDER'` is not a valid role name.

## TODO 3.3 — Healed column heading text

```typescript
await expect(todoHeading).toHaveText(/^Todo$/);
```

The column heading was changed from "TO DO" to "Todo" in a copy update. `/^Todo$/` matches exactly "Todo" (anchored by `^` and `$`). `/PLACEHOLDER/` won't match "Todo". Note: the test also uses `getByRole('heading', { name: /todo/i })` with a case-insensitive flag to find the heading regardless of casing.

## TODO 3.4 — Healed wait strategy

```typescript
await expect(page.getByRole('dialog')).toBeVisible();
```

`waitForTimeout(3000)` is timing-dependent — it fails on slow machines and wastes 3 seconds on fast ones. `expect(dialog).toBeVisible()` waits until the dialog appears using Playwright's auto-wait, which is both reliable and efficient. `'PLACEHOLDER'` finds no element with that role.

## TODO 3.5 — Healed URL pattern

```typescript
await expect(page).toHaveURL(/tasks\//);
```

The URL structure changed from `/task-detail?id=X` to `/projects/{slug}/tasks/{id}`. The regex `/tasks\//` matches the new URL pattern for any task ID. `/PLACEHOLDER/` won't match any real task URL.

## TODO 3.6 — Healed scoped priority assertion

```typescript
await expect(priorityBadge).toHaveText(/High|Medium|Low|Critical/);
```

`/PLACEHOLDER/` won't match any priority value. The healed version scopes the locator to `firstCard.getByTestId('priority-badge')` — eliminating the ambiguity of matching multiple priority badges across all cards. The regex validates the badge shows a known priority value.

## TODO 3.7 — Healed outcome assertion

```typescript
await expect(todoColumn).toContainText('Healed test task');
```

`'PLACEHOLDER'` won't be found. The original test had no assertion after task creation — a common AI generation gap. The healed test adds the missing assertion scoped to the Todo column, confirming the task appeared in the right column (not just somewhere on the page).

## Part 4 — MCP Server & Agent Integration (formerly M80)

## TODO 4.1 — Snapshot not null

```typescript
expect(snapshot).not.toBeNull();
```

`page.accessibility.snapshot()` returns `null` only for pages with no accessible content (e.g., an empty `<body>`). Any rendered Lumio page will have an accessible tree. The default `toBeNull()` asserts the snapshot IS null — always fails for a rendered page.

## TODO 4.2 — Main landmark not undefined

```typescript
expect(mainLandmark).not.toBeUndefined();
```

`snapshot.children.find()` returns `undefined` when no child matches the predicate. The default `toBeUndefined()` asserts no main landmark exists, which always fails for a properly structured page. The main landmark is how agents scope their interactions to the page content area.

## TODO 4.3 — Admin users URL regex

```typescript
await expect(page).toHaveURL(/\/admin\/users$/);
```

`/PLACEHOLDER/` won't match `/admin/users`. The `$` anchor ensures the URL ends with `/admin/users` — preventing false matches if a future URL has `/admin/users/detail`. Forward slashes in the regex are escaped with `\/`.

## TODO 4.4 — New task button name

```typescript
await page.getByRole('button', { name: 'New task' }).click();
```

`'PLACEHOLDER'` finds no button. This is the direct Playwright equivalent of what the MCP `browser_click` tool does when an agent says "click the New task button" — it uses the accessible name from the snapshot to identify the element.

## TODO 4.5 — document.title via evaluate

```typescript
const title = await page.evaluate(() => document.title);
```

The arrow function `() => ''` returns an empty string, which won't match `/Lumio/`. `document.title` reads the current document title — the same value `toHaveTitle()` waits for. This is what MCP's `browser_evaluate` tool executes when an agent requests page metadata.

## TODO 4.6 — Task title label

```typescript
await page.getByLabel('Task title').fill('Agent-created task');
```

`'PLACEHOLDER'` finds no input with that label. `getByLabel('Task title')` scopes to the input associated with the "Task title" label — the same association that MCP's `browser_type` tool uses when an agent instructs it to type into a labeled field.

## TODO 4.7 — hasNewTaskButton is true

```typescript
expect(hasNewTaskButton).toBe(true);
```

`false` always fails. The accessibility snapshot serialized to JSON should contain "New task" somewhere in the button name — confirming the button is discoverable without running any locator. This verifies that the MCP `browser_snapshot` → `browser_click` sequence can find the button before attempting to click it.
