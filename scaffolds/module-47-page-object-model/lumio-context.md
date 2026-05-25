# Lumio Context: M47

## The Kanban Board

Route: `/projects/{projectId}/board`

The board renders three swim-lane columns (To Do, In Progress, Done), each identified by
`data-testid="kanban-column-{status}"`. Cards within each column have
`data-testid="kanban-card"`. The "Add card" button is `data-testid="add-card-button"`;
after clicking it a text input appears with `data-testid="new-card-input"`.

## Where to find this in the code

```
lumio/app/(app)/projects/[projectId]/board/
  page.tsx          → top-level board layout
  KanbanColumn.tsx  → renders one column with its cards
  KanbanCard.tsx    → individual card component
```

## Seed data

The seed script (`lumio/prisma/seed.ts`) creates a project with id `"demo"` containing
cards spread across all three columns. Tests can navigate to `/projects/demo/board`
without needing to create a project first.
