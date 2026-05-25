# Lumio Context: M23

## Kanban DnD implementation

Library: `@hello-pangea/dnd` (maintained fork of react-beautiful-dnd)

Cards are draggable within and across columns. The library listens to mouse events
(mousedown, mousemove, mouseup) not the HTML5 drag API. This is why
`locator.dragTo()` works directly.

## testid map

| Element | data-testid |
|---------|-------------|
| Column container | `kanban-column-{todo|in-progress|done}` |
| Draggable card | `kanban-card` |
| Drag handle icon | `card-drag-handle` |

## Seed data

`/projects/demo/board` has at least 2 cards in "todo" and 1 in "in-progress"
so drag tests do not need to create cards first.
