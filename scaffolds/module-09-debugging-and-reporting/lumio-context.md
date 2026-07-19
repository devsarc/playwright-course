# Lumio Context: Lesson 09

## Part 1 — Playwright Inspector & Codegen (formerly M42)

### What's in Lumio at this point

Lumio is a fully-featured Kanban board application. The dashboard (`/dashboard`) renders three columns — To Do, In Progress, and Done — each with an "Add task" button. Clicking the button opens a dialog with a title input and a submit button. Submitted tasks appear as cards in the column.

### What codegen sees

When you run `npx playwright codegen http://localhost:3000` and record a task creation flow on the dashboard, codegen generates something like:

```typescript
await page.goto('http://localhost:3000/dashboard');
await page.locator('[data-column="todo"] button').first().click();
await page.locator('#task-title-input').fill('My task');
await page.locator('[data-testid="task-submit"]').click();
```

This mix of CSS selectors and ID locators is fragile — `[data-column="todo"] button` matches every button in the column, not just "Add task". The exercises in this module replace fragile codegen output with resilient locators.

### Relevant elements

| Element | Preferred locator |
|---------|------------------|
| Kanban column heading "To Do" | `page.getByRole('heading', { name: 'To Do' })` |
| Add task button | `page.getByRole('button', { name: 'Add task' })` |
| Task creation dialog | `page.getByRole('dialog')` |
| Task title input | `page.getByTestId('task-title-input')` |
| Submit button | `page.getByTestId('task-submit')` |
| Task card | `page.getByTestId('task-card')` |

### Running codegen against Lumio

```bash
# Start Lumio first
npm run dev --prefix lumio

# In a separate terminal
npx playwright codegen http://localhost:3000
```

Interact with the Kanban board. Copy the generated code and compare it against the handwritten tests in this module — notice where codegen used a CSS selector where a semantic locator would be better.

## Part 2 — Tracing & Trace Viewer (formerly M43)

### What to trace in Lumio

High-value traces for debugging:
- Board load with card fetch (network requests visible in trace)
- Card creation with optimistic update
- Auth redirect flow

### Trace viewer features

When you open a `.zip` trace in the viewer, you can see:
- Timeline of actions (click, fill, goto)
- Network requests with headers and response bodies
- Console logs from each step
- DOM snapshots before and after each action
- Screenshot thumbnails for visual diffs

### test-results directory

Playwright writes all artifacts (traces, screenshots, videos) to
`test-results/` by default. This directory is gitignored — do not commit
test artifacts.

### Debugging modes

| Mode | Command | What it does |
|------|---------|--------------|
| Headed | `--headed` | Opens a real browser window |
| Inspector | `--debug` | Adds page.pause() breakpoints |
| UI mode | `--ui` | Interactive test runner with trace viewer |
| Slow-mo | `--slowmo=500` | 500ms delay between actions |

## Part 3 — Reporters Deep Dive (formerly M44)

### What's in Lumio at this point

Lumio is a full Next.js application. The exercises in this module focus primarily on Playwright configuration rather than app interaction — most TODOs read `playwright.config.ts` and assert structural properties.

The final test (TODO 3.10) navigates to the Lumio dashboard to confirm a real browser run happened, so the HTML report captures a live trace.

### Recommended playwright.config.ts changes

For this module to pass, add multiple reporters to your config:

```typescript
reporter: process.env.CI
  ? [
      ['github'],
      ['junit', { outputFile: 'results/junit.xml' }],
      ['blob', { outputDir: 'blob-results' }],
    ]
  : [
      ['list'],
      ['html', { outputFolder: 'playwright-report', open: 'never' }],
      ['junit', { outputFile: 'junit-results.xml' }],
    ],
```

The `process.env.CI` guard is standard practice: interactive reporters (html, list) locally; machine-readable reporters (github, junit, blob) in CI.

### Running the HTML report

```bash
npx playwright test tests/module-09-debugging-and-reporting
npx playwright show-report
```

The HTML report opens at `http://localhost:9323`. Click any test to see its trace, console output, and attached screenshots.

## Part 4 — Debugging Strategies (formerly M45)

### What's in Lumio at this point

Lumio's dashboard (`/dashboard`) is fully rendered with a three-column Kanban board. Each column has an "Add task" button that opens a modal dialog. This structure makes it useful for demonstrating selector scoping: `getByRole('button', { name: 'Add task' })` matches all three column buttons, while scoping to a specific column's `data-testid` narrows it to one.

### Elements used in this module

| Element | Locator |
|---------|---------|
| Any "Add task" button (3 total) | `page.getByRole('button', { name: 'Add task' })` |
| "Add task" button in To Do column | `page.getByTestId('kanban-column-todo').getByRole('button', { name: 'Add task' })` |
| Task creation dialog | `page.getByRole('dialog')` |

### Console behavior

Lumio is a React/Next.js application. In development mode (`npm run dev`), the browser console includes React DevTools messages and Next.js hydration logs. These are `'log'` type — filtering to `'error'` type in tests isolates genuine application errors from framework noise.

### Trace files

When running with `--trace on`, Playwright writes trace files to `test-results/<test-name>/trace.zip`. Open them with:

```bash
npx playwright show-trace test-results/*/trace.zip
```

Or upload directly to [trace.playwright.dev](https://trace.playwright.dev) for browser-based viewing without installing Playwright locally.

## Part 5 — test.step() & Runtime Attachments (formerly M46)

### What's in Lumio at this point

Lumio's task creation flow is the primary target for this module — it's a multi-step interaction (open dialog → fill form → submit → verify card) that benefits from step grouping. The HTML report for a four-step test reads like a specification: each phase is a named heading, and failures are localized to the step that failed.

### The task creation flow

Steps map directly to the natural phases of the flow:

1. **Navigate to dashboard** — `page.goto('/dashboard')`
2. **Open task creation dialog** — click "Add task", assert dialog visible
3. **Fill and submit task form** — fill title, click submit, assert dialog closed
4. **Verify task on board** — assert task card visible with the entered title

This four-step structure is the template for any Lumio CRUD test. Steps make the structure explicit in the report.

### Viewing steps and attachments

```bash
npx playwright test tests/module-09-debugging-and-reporting --reporter=html
npx playwright show-report
```

In the HTML report:
- Steps appear as indented rows under the test name
- Attached images display inline when you click the attachment name
- Annotations appear as colored badges next to the test status
