# Lumio Context: M45

## What's in Lumio at this point

Lumio's dashboard (`/dashboard`) is fully rendered with a three-column Kanban board. Each column has an "Add task" button that opens a modal dialog. This structure makes it useful for demonstrating selector scoping: `getByRole('button', { name: 'Add task' })` matches all three column buttons, while scoping to a specific column's `data-testid` narrows it to one.

## Elements used in this module

| Element | Locator |
|---------|---------|
| Any "Add task" button (3 total) | `page.getByRole('button', { name: 'Add task' })` |
| "Add task" button in To Do column | `page.getByTestId('kanban-column-todo').getByRole('button', { name: 'Add task' })` |
| Task creation dialog | `page.getByRole('dialog')` |

## Console behavior

Lumio is a React/Next.js application. In development mode (`npm run dev`), the browser console includes React DevTools messages and Next.js hydration logs. These are `'log'` type — filtering to `'error'` type in tests isolates genuine application errors from framework noise.

## Trace files

When running with `--trace on`, Playwright writes trace files to `test-results/<test-name>/trace.zip`. Open them with:

```bash
npx playwright show-trace test-results/*/trace.zip
```

Or upload directly to [trace.playwright.dev](https://trace.playwright.dev) for browser-based viewing without installing Playwright locally.
