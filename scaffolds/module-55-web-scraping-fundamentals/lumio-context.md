# Lumio Context: M55

## What's in Lumio at this point

Lumio's dashboard (`/dashboard`) renders a Kanban board with task cards. Each card has:
- `data-testid="task-card"` — the card container
- `data-priority="high|medium|low"` — the task's priority level
- `h3` — the task title

The board also has column containers with `data-column="todo|in-progress|done"`. Scoping a `querySelectorAll` to a specific column extracts only that column's tasks.

## Public project directory

In a later module, Lumio will have a public project directory page — a list of public projects with names, descriptions, and member counts. That's the "public project directory" referenced in the spec's original M55 framing. For now, the Kanban board is the extraction target.

## Why scrape Lumio instead of an external site

Using Lumio as the scraping target means:
- The data structure is known and stable
- No external service dependency
- The scraping exercises work offline
- The `data-testid` attributes provide clean extraction hooks

In real-world scraping, the target site has no `data-testid` attributes — you'd rely on CSS classes, element structure, and text content. The principles are identical; the selectors are messier.
