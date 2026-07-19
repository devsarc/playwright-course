# Lumio Context: Lesson 17

## Part 1 — AI Test Planning (formerly M77)

## The kanban board

Lumio's kanban board at `/projects/{slug}` is the core product feature. It has three status columns:
- **Todo** — tasks not yet started
- **In Progress** — tasks actively being worked on
- **Done** — completed tasks

Each column is a `<section>` with `aria-label` matching the column name. The section contains a header with the column name, a task count badge (`data-testid="column-task-count"`), and a list of task cards (`role="article"`).

## Task card structure

Each task card contains:
- `<h3>` — task title (the `role="heading"` element)
- Assignee avatar with alt text
- Priority badge (Low/Medium/High/Critical)
- Due date (if set)
- `data-testid="drag-handle"` — the drag trigger element
- A click target that opens the task detail modal

## Test project seed data

The global setup seeds a project at slug `test-project` with:
- 3 tasks in Todo (titles: "Design mockups", "Write API spec", "Set up CI")
- 2 tasks in In Progress ("Implement login", "Build kanban board")
- 1 task in Done ("Configure Postgres")

An `empty-project` project is also seeded with all columns empty — used for testing empty state UIs.

## What a test planner would identify on this board

A complete test plan for the Lumio kanban board includes:

1. **Happy path flows:** create task → verify in Todo, drag to In Progress → verify move, mark Done → verify completion
2. **Edge cases:** empty column empty state, task with all optional fields filled, very long task title truncation
3. **Permission flows:** member can't delete, admin can archive project
4. **Concurrent flows:** two users dragging the same task simultaneously
5. **Filter flows:** filter by assignee, by priority, combined filters

The exercise in this module covers items 1 and 2 of this inventory — the observable structure that any test planner would document first.

## Part 2 — AI Test Code Generation (formerly M78)

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

## Part 3 — AI Test Healing (formerly M79)

## The refactoring events that broke these tests

This module simulates a real sprint where Lumio's frontend team made several independent changes:

| Change | Effect on tests |
|---|---|
| CSS class `.task-create-btn` → `.btn` + `data-action="create"` | Any test using `.task-create-btn` breaks |
| `data-testid="task-card-title"` removed from task card `<h3>` | `getByTestId('task-card-title')` finds nothing |
| Column heading copy: "TO DO" → "Todo" | Literal string assertion `'TO DO'` fails |
| Modal animation duration increased from 200ms to 800ms | `waitForTimeout(2000)` became flaky at 3s+ load |
| Task detail URL: `/task-detail?id=X` → `/projects/{slug}/tasks/{id}` | Old URL regex no longer matches |

All five changes were non-functional from a user perspective — the feature still works. But tests using brittle selectors or timing-dependent waits broke.

## How the healer approaches each case

The healer inspects the DOM after each failure and reasons:
1. "The element exists but the selector is wrong" → replace selector with a more robust one
2. "The text changed but the element is still there" → update the expected string
3. "The timing increased" → replace the wait with an assertion-based wait
4. "The URL pattern changed" → update the regex

Cases the healer cannot fix:
- A feature that was actually removed (no element to find)
- A logic regression (the test is correct, the code is wrong)
- A test that was wrong from the start (healer would entrench the bug)

## Healing review checklist for Lumio tests

When the healer proposes a fix, verify:
- [ ] The new locator uses `getByRole`, `getByLabel`, or `getByText` (not another CSS class)
- [ ] The assertion still tests the original intent (e.g., priority badge shows a valid value)
- [ ] The test passes in isolation: `npx playwright test --grep "test name" --headed`
- [ ] The fix doesn't break any other test that depended on the old element structure

## Part 4 — MCP Server & Agent Integration (formerly M80)

## MCP use cases for Lumio

Lumio's team uses the Playwright MCP server in three scenarios:

**Incident reproduction.** When a support ticket says "I can't drag tasks on mobile WebKit in France," an engineer gives the AI agent instructions: "Connect to staging, log in as the affected user, navigate to their project, switch to French locale, and reproduce the drag-and-drop failure on a mobile viewport." The agent calls MCP tools in sequence — no Playwright code written.

**Exploratory testing of new features.** When the billing team ships a new payment method screen, a QA engineer says: "Explore the new `/billing/add-payment` page and document every interactive element, validation message, and state transition." The agent navigates, snapshots at each step, and returns structured documentation.

**Automated demo generation.** The marketing team requests screenshots of 12 key features for a product update email. An agent drives the browser through each feature, takes screenshots at the right moment, and exports them to a folder.

## MCP tool → Playwright API mapping

| Natural language instruction | MCP tool | Playwright API |
|---|---|---|
| "Navigate to /admin/users" | `browser_navigate` | `page.goto('/admin/users')` |
| "Click the 'New task' button" | `browser_click` | `page.getByRole('button', { name: 'New task' }).click()` |
| "Type 'hello' in the Task title input" | `browser_type` | `page.getByLabel('Task title').fill('hello')` |
| "What's on this page?" | `browser_snapshot` | `page.accessibility.snapshot()` |
| "Take a screenshot" | `browser_take_screenshot` | `page.screenshot()` |
| "What is document.title?" | `browser_evaluate` | `page.evaluate(() => document.title)` |

## Accessibility tree on the kanban board

The accessibility snapshot for `/projects/test-project` includes:
```
{ role: 'WebArea', name: 'Test Project — Lumio',
  children: [
    { role: 'banner', children: [{ role: 'navigation', ... }] },
    { role: 'main', children: [
      { role: 'button', name: 'New task' },
      { role: 'region', name: 'Todo', children: [
        { role: 'article', name: 'Design mockups', ... },
        ...
      ]},
      { role: 'region', name: 'In Progress', ... },
      { role: 'region', name: 'Done', ... }
    ]}
  ]}
```

An agent uses this tree to locate elements before clicking — the same information `getByRole` uses internally.
