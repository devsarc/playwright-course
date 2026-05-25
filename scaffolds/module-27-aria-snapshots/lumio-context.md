# Lumio Context: M27

## State of the app at M27

Lumio's dashboard has a fully functional kanban board built with Radix UI
primitives. Because Radix UI components ship with correct ARIA roles by
default, the accessibility tree is rich and stable — a good target for
snapshot assertions.

## Pages and components under test

| Route | What to test |
|-------|-------------|
| `/dashboard` | Kanban board container — heading, list of columns, task cards |
| `/dashboard` (modal open) | Task creation dialog — form fields, labels, submit button |

## Key selectors

| Element | Locator strategy | Notes |
|---------|-----------------|-------|
| Kanban board root | `getByTestId('kanban-board')` | Wraps all columns |
| Board heading | `getByRole('heading', { name: 'Kanban Board' })` | `<h1>` inside the board |
| Kanban column list | `getByRole('list')` | Each column is a `<ul>` |
| Task card | `getByTestId('kanban-card')` → `getByRole('listitem')` | One per task |
| "Add task" button | `getByRole('button', { name: 'Add task' })` | Opens the creation modal |
| Task creation dialog | `getByRole('dialog')` | Radix Dialog root |
| Dialog title | `getByRole('heading', { name: 'New task' })` | Inside the dialog |
| Task name input | `getByRole('textbox', { name: 'Task name' })` | Required field |
| Priority select | `getByRole('combobox', { name: 'Priority' })` | Radix Select |
| Save button | `getByRole('button', { name: 'Save task' })` | Submits the form |

## Relevant source files

```
lumio/
├── app/
│   └── (protected)/
│       └── dashboard/
│           └── page.tsx        ← kanban board with "Add task" button
└── components/
    └── board/
        └── TaskModal.tsx       ← the task creation dialog (Radix Dialog)
```

## Why Radix UI matters for ARIA snapshots

Radix UI manages ARIA attributes (role, aria-modal, aria-label, aria-expanded,
etc.) automatically. This means the accessibility tree is intentional and
meaningful — changes to it usually signal a real semantic regression, not a
cosmetic tweak. ARIA snapshots are therefore highly reliable here: a false
positive almost always means something genuinely changed in how the component
communicates with assistive technology.
