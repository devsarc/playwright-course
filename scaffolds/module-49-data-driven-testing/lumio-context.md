# Lumio Context: M49

## What's in Lumio at this point

Lumio's task creation form (`/dashboard` → "Add task" → dialog) is the primary interaction surface for this module. The form has:

- A required title input (`data-testid="task-title-input"`)
- A submit button (`data-testid="task-submit"`)
- Validation: empty and whitespace-only titles are rejected; the dialog stays open

This makes the form a good target for validation data-driven tests: the same actions apply to every case, and only the input value and expected outcome vary.

## task-data.json

The module ships with `task-data.json` containing five task entries. Each entry has:
- `title` — the task title to enter
- `priority` — `"high"`, `"medium"`, or `"low"`
- `label` — a category tag
- `column` — which Kanban column (`"todo"`, `"in-progress"`, `"done"`)

The current exercise only uses `title` and `priority` — `label` and `column` are included for future extension (e.g., when Lumio's task form adds priority selectors and column assignment).

## Adding data cases

Edit `task-data.json` to add more test entries. No TypeScript changes needed — the loop in `exercise.spec.ts` picks up new entries automatically.
