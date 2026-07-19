# Lumio Context: Lesson 10

## Part 1 — Page Object Model (formerly M47)

### The Kanban Board

Route: `/projects/{projectId}/board`

The board renders three swim-lane columns (To Do, In Progress, Done), each identified by
`data-testid="kanban-column-{status}"`. Cards within each column have
`data-testid="kanban-card"`. The "Add card" button is `data-testid="add-card-button"`;
after clicking it a text input appears with `data-testid="new-card-input"`.

### Where to find this in the code

```
lumio/app/(app)/projects/[projectId]/board/
  page.tsx          → top-level board layout
  KanbanColumn.tsx  → renders one column with its cards
  KanbanCard.tsx    → individual card component
```

### Seed data

The seed script (`lumio/prisma/seed.ts`) creates a project with id `"demo"` containing
cards spread across all three columns. Tests can navigate to `/projects/demo/board`
without needing to create a project first.

## Part 2 — Advanced Fixture Patterns (formerly M48)

### What's in Lumio at this point

Lumio has authentication (NextAuth v5), a Kanban board at `/dashboard`, and a REST-style API for tasks. These make it an ideal target for advanced fixture patterns:

- **Authentication fixture**: Log in once via the UI, save `storageState`, hand authenticated pages to tests without repeating the login flow
- **Task API fixture**: Call `POST /api/tasks` to seed a task record, yield the task object to the test, call `DELETE /api/tasks/:id` in teardown

### Why fixtures over beforeEach

`beforeEach` runs login code in every test file that needs it. If the login flow changes, you update N files. A fixture lives in one place — update the fixture, all tests pick up the change automatically.

Additionally, fixtures compose: an `authenticatedPage` fixture can be built from an `authState` fixture, which can be built from a `userCredentials` fixture. The dependency graph is explicit and Playwright resolves it automatically.

### Fixture scope recommendation for Lumio

| Fixture | Scope | Reason |
|---------|-------|--------|
| `authState` (saved storage state file) | `worker` | Read-only — safe to share across tests in a worker |
| `authenticatedPage` | `test` | Creates a page that the test will interact with |
| `seededTask` | `test` | Writes to the database — must be cleaned up per test |
| `adminContext` | `test` | Context with elevated permissions — isolate to prevent leakage |

## Part 3 — Data-Driven Testing (formerly M49)

### What's in Lumio at this point

Lumio's task creation form (`/dashboard` → "Add task" → dialog) is the primary interaction surface for this module. The form has:

- A required title input (`data-testid="task-title-input"`)
- A submit button (`data-testid="task-submit"`)
- Validation: empty and whitespace-only titles are rejected; the dialog stays open

This makes the form a good target for validation data-driven tests: the same actions apply to every case, and only the input value and expected outcome vary.

### task-data.json

The module ships with `task-data.json` containing five task entries. Each entry has:
- `title` — the task title to enter
- `priority` — `"high"`, `"medium"`, or `"low"`
- `label` — a category tag
- `column` — which Kanban column (`"todo"`, `"in-progress"`, `"done"`)

The current exercise only uses `title` and `priority` — `label` and `column` are included for future extension (e.g., when Lumio's task form adds priority selectors and column assignment).

### Adding data cases

Edit `task-data.json` to add more test entries. No TypeScript changes needed — the loop in `exercise.spec.ts` picks up new entries automatically.

## Part 4 — Test Organization & Suite Architecture (formerly M50)

### What's in Lumio at this point

By M50, 49 modules of Lumio tests exist. This module introduces the organizational layer — how to make those 49+ modules navigable and selectively runnable.

### Recommended tag assignments for existing Lumio tests

| Module | Suggested tags |
|--------|---------------|
| M02 — Login | `@smoke @regression` |
| M03 — Navigation | `@smoke @regression` |
| M20 — Form automation | `@regression` |
| M25 — Screenshot testing | `@visual` |
| M26 — Visual regression | `@visual` |
| M27 — ARIA snapshots | `@accessibility` |
| M28 — Accessibility | `@accessibility` |
| M33 — User journeys | `@e2e` |
| M34 — Cross-browser | `@regression` |

### Smoke suite for Lumio

The smoke suite should cover: can a user log in, does the dashboard load, can a task be created, does the task appear on the board. These four checks represent the minimum viable Lumio — if any of them fail, the app is not deployable.

### test.fixme() in this project

Known issues worth tracking with `fixme()` rather than deletion:
- Any tests for drag-and-drop (M23) — flaky due to pointer event timing
- Tests for the Electron app (M72) — only relevant when Electron build is present
- Visual regression tests (M26) — only valid after baselines are established

Add the fixme with a comment explaining when to remove it.
