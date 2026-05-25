# M78 Hints

## TODO 1 — Replace brittle CSS selector

```typescript
await page.getByRole('button', { name: 'New task' }).click();
```

`'PLACEHOLDER'` finds no button with that label. `getByRole('button', { name: 'New task' })` is robust: it matches by ARIA role and accessible name, both of which survive CSS refactoring, class renames, and DOM restructuring. CSS class selectors like `.btn-primary` break whenever a designer touches the stylesheet.

## TODO 2 — Add missing assertion

```typescript
await expect(page.getByText('Task with missing assertion')).toBeVisible();
```

`'PLACEHOLDER'` finds no matching text. The AI generator omitted this assertion because it only recorded browser actions — it didn't observe the outcome. Every action that changes visible state needs a corresponding assertion; without it, the test passes even if the action failed silently.

## TODO 3 — Replace timeout with dialog assertion

```typescript
await expect(page.getByRole('dialog')).toBeVisible();
```

`'PLACEHOLDER'` finds no element. `getByRole('dialog')` waits until the modal appears — Playwright's auto-wait handles the timing. A 2-second `waitForTimeout` is both flaky (fails on slow machines) and wasteful (waits even when the modal appeared in 200ms).

## TODO 4 — Use seeded task title

```typescript
const taskTitle = 'Design mockups';
```

`'PLACEHOLDER'` won't find any task. `'Design mockups'` is from the seed data — guaranteed to exist at the start of every test run. Relying on data created by a previous test makes the test order-dependent, which breaks parallel test execution and isolated runs.

## TODO 5 — Task detail URL regex

```typescript
await expect(page).toHaveURL(/tasks\//);
```

`/PLACEHOLDER/` won't match the task detail URL (e.g., `/projects/test-project/tasks/123`). Asserting the URL change confirms the click triggered a navigation — not just a modal open. Without this, a broken router that opened a modal instead of navigating would pass silently.

## TODO 6 — Board text assertion

```typescript
await expect(board).toContainText('Admin User');
```

`'PLACEHOLDER'` won't match. Scoping to `board` (the main content area) rather than `page` ensures the assertion applies to the filtered task cards, not to the header or sidebar where "Admin User" may also appear (in the user menu, for example).

## TODO 7 — Priority badge text regex

```typescript
await expect(priorityBadge).toHaveText(/High|Medium|Low|Critical/);
```

`/PLACEHOLDER/` won't match any priority value. Using a regex with alternatives is more robust than a literal string — it tests that the badge displays a valid priority without coupling to a specific seed task's priority value. If the test data changes, the assertion still passes.
