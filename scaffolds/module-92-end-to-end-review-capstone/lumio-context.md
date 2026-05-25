# Lumio Context: M92

## User journey map

```
/signup
  -> /dashboard          (after successful signup)
  -> /projects/new       (via "New project" button)
  -> /projects/{id}      (after project creation)
  -> /projects/{id}/board (kanban board)
```

## Forms and inputs

| Form | Field | data-testid |
|------|-------|-------------|
| Signup | Name | `signup-name` |
| Signup | Email | `signup-email` |
| Signup | Password | `signup-password` |
| New project | Name | `project-name-input` |
| New project | Submit | Button: "Create" |

## Techniques integrated in this module

| Step | Technique | Taught in |
|------|-----------|-----------|
| Add cards | POM | M20 |
| Move card | Drag-and-drop | M24 |
| Accessibility audit | axe-core | M23 |
| Performance budget | Navigation timing | M33 |
| Multi-user sync | Multi-context | M28 |

## Why a capstone matters

Individual modules test one technique in isolation. The capstone reveals
integration problems: does the POM still work when the board was just created?
Does axe report violations that only appear after certain user actions?
Does performance degrade when the board has more cards?
