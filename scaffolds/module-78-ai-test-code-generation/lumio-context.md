# Lumio Context: M78

## What AI code generation produces for Lumio

When `playwright-test-generator` runs against Lumio's kanban board, it produces test files for:
- Task creation (happy path, validation errors)
- Task editing (title change, priority change, assignee change)
- Drag-and-drop reordering
- Column filtering by assignee or priority
- Task detail navigation

## Common generator failure modes observed for Lumio

| Issue | Generated code | Fixed code |
|---|---|---|
| Brittle locator | `.btn-primary` | `getByRole('button', { name: 'New task' })` |
| Missing assertion | (no check after create) | `await expect(page.getByText(title)).toBeVisible()` |
| Hardcoded wait | `waitForTimeout(2000)` | `await expect(dialog).toBeVisible()` |
| State dependency | Uses task from prior test | Creates own task in `beforeEach` |

## Seeded test data for this module

The `test-project` slug is seeded with predictable tasks (see `lumio-context.md` for M77). The exercise uses `'Design mockups'` as a stable task title from the seed — this avoids test interdependency while still testing against real app data.

## Task detail URL pattern

Task detail pages are at: `/projects/{slug}/tasks/{taskId}`. The regex `/tasks\//` matches all task URLs regardless of the numeric task ID, which changes between seed runs.

## Priority badge

Each task card renders a priority badge with `data-testid="priority-badge"`. Possible text values:
- `Low`
- `Medium`
- `High`
- `Critical`

The seed data for `test-project` sets "Design mockups" to High priority.

## Why this module matters

AI code generators save time on the initial test scaffold but produce code that requires human review before it becomes reliable. Understanding the failure modes means you spend review time on the right things — not re-learning the same mistakes on every generated file.
