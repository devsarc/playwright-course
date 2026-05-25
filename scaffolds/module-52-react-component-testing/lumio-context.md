# Lumio Context: M52

## What's in Lumio at this point

Lumio has three components that are good candidates for component testing:

**`TaskCard`** — Renders a task with its title, priority badge, and action buttons (edit, delete). Props: `title: string`, `priority: 'high' | 'medium' | 'low'`, `onDelete: () => void`, `onEdit: () => void`. Tests: renders title, renders priority color, fires onDelete when delete button is clicked.

**`NotificationBadge`** — Shows a count inside a circular badge. Props: `count: number`. Tests: hidden when count is 0, shows count when greater than 0, shows "99+" when count exceeds 99.

**`BoardView`** — The full Kanban board. Consumes ThemeProvider context. Props: `columns: Column[]`. Tests: renders column headings, uses theme from provider (requires `beforeMount` wrapper).

## Why component tests for Lumio

End-to-end tests of the Kanban board reach `TaskCard` only through full page loads, auth, and data setup. A component test mounts `TaskCard` directly — no auth, no database, no navigation. This makes the tests faster and the feedback more precise.

The tradeoff: component tests can't catch integration bugs (e.g., a mismatched API response shape that causes `TaskCard` to receive the wrong prop type at runtime). Both CT and e2e are needed for full coverage.

## CT vs e2e boundary for Lumio

| Scenario | Tool |
|---------|------|
| TaskCard renders correctly with various prop combinations | CT |
| TaskCard onDelete fires the callback | CT |
| Deleting a task removes it from the board | e2e |
| TaskCard priority badge changes color based on prop | CT |
| Dragging a task to another column updates its status | e2e |
