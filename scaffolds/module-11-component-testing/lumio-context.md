# Lumio Context: Lesson 11

## Part 1 — Component Testing Foundations (formerly M51)

### KanbanCard component

Location: `lumio/components/kanban/KanbanCard.tsx`

Props:
- `title: string` — card label
- `done?: boolean` — marks card complete (adds `line-through` class to title)
- `onDelete?: () => void` — called when the delete icon button is clicked

The delete button renders with `data-testid="card-delete-btn"`.
Completed cards render a badge with `data-testid="card-completed-badge"`.

### Why test KanbanCard in isolation?

The full kanban board requires a logged-in user, a seed project, and a database.
CT lets you test every visual state of KanbanCard (loading, completed, error) in
milliseconds without any of that infrastructure.

## Part 2 — React Component Testing (formerly M52)

### What's in Lumio at this point

Lumio has three components that are good candidates for component testing:

**`TaskCard`** — Renders a task with its title, priority badge, and action buttons (edit, delete). Props: `title: string`, `priority: 'high' | 'medium' | 'low'`, `onDelete: () => void`, `onEdit: () => void`. Tests: renders title, renders priority color, fires onDelete when delete button is clicked.

**`NotificationBadge`** — Shows a count inside a circular badge. Props: `count: number`. Tests: hidden when count is 0, shows count when greater than 0, shows "99+" when count exceeds 99.

**`BoardView`** — The full Kanban board. Consumes ThemeProvider context. Props: `columns: Column[]`. Tests: renders column headings, uses theme from provider (requires `beforeMount` wrapper).

### Why component tests for Lumio

End-to-end tests of the Kanban board reach `TaskCard` only through full page loads, auth, and data setup. A component test mounts `TaskCard` directly — no auth, no database, no navigation. This makes the tests faster and the feedback more precise.

The tradeoff: component tests can't catch integration bugs (e.g., a mismatched API response shape that causes `TaskCard` to receive the wrong prop type at runtime). Both CT and e2e are needed for full coverage.

### CT vs e2e boundary for Lumio

| Scenario | Tool |
|---------|------|
| TaskCard renders correctly with various prop combinations | CT |
| TaskCard onDelete fires the callback | CT |
| Deleting a task removes it from the board | e2e |
| TaskCard priority badge changes color based on prop | CT |
| Dragging a task to another column updates its status | e2e |

## Part 3 — Vue Component Testing (formerly M53)

### What's in Lumio at this point

Lumio itself is a React application — there are no Vue components in the production Lumio codebase. This module uses a standalone `vue-demo/TaskForm.vue` component bundled on this branch as a learning target.

### Why Vue in a React-primary course

Professional Playwright users work in codebases that are rarely framework-pure. You'll encounter:
- Third-party analytics dashboards built in Vue, embedded as iframes or web components
- Design system libraries published in Vue before your team migrated to React
- Acquired codebases that were Vue-based
- Micro-frontend setups where different teams own different framework choices

The Playwright CT API is largely framework-agnostic. Learning the Vue variant takes 20 minutes if you already know the React variant — the locator and assertion API is identical, only the mounting syntax differs.

### vue-demo directory

The `vue-demo/` directory at the repo root contains `TaskForm.vue` — a simple task creation form. It has:
- A text input for the task title (bound with `v-model`)
- A default slot for footer content
- A named `actions` slot for action buttons
- A `submit` emit that fires with the title when the form is submitted

This is a self-contained demo. The component is not imported by any Lumio code — it exists only for this module's exercises.

## Part 4 — Network Mocking in Component Tests (formerly M54)

### What's in Lumio at this point

Lumio's `TaskList` component fetches tasks from `/api/tasks` and renders them as `TaskCard` components. This makes it the ideal target for three-state component testing:

- **Loading state**: The `GET /api/tasks` request is in-flight — `TaskList` shows a loading spinner (`data-testid="loading-spinner"`)
- **Populated state**: The response returns task objects — `TaskList` renders one `TaskCard` per task (`data-testid="task-card"`)
- **Error state**: The response returns a 500 — `TaskList` renders an error alert (`role="alert"`) with a retry button

### Why mock the API in CT instead of using a test database

CT runs in a browser without access to the test database. Even if the database were reachable, using it would:
- Make the test slow (real network round-trip)
- Create interdependency with database state
- Cause failures when the database is unavailable

CT network mocking bypasses all of this — the mock is instant, deterministic, and fully controlled by the test.

### MSW in Lumio's CT setup

Lumio's CT configuration uses MSW for network mocking:

```
tests/playwright/
├── index.tsx        ← beforeMount hook that starts MSW
└── handlers.ts      ← default request handlers for all CT tests
```

Per-test overrides pass additional handlers via `hooksConfig`:
```tsx
const component = await mount(<TaskList />, {
  hooksConfig: {
    handlers: [http.get('/api/tasks', () => HttpResponse.json([]))],
  },
});
```
