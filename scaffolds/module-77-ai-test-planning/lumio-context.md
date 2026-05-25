# Lumio Context: M77

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
