# Lumio Context: M51

## KanbanCard component

Location: `lumio/components/kanban/KanbanCard.tsx`

Props:
- `title: string` — card label
- `done?: boolean` — marks card complete (adds `line-through` class to title)
- `onDelete?: () => void` — called when the delete icon button is clicked

The delete button renders with `data-testid="card-delete-btn"`.
Completed cards render a badge with `data-testid="card-completed-badge"`.

## Why test KanbanCard in isolation?

The full kanban board requires a logged-in user, a seed project, and a database.
CT lets you test every visual state of KanbanCard (loading, completed, error) in
milliseconds without any of that infrastructure.
