# Lumio Context: M42

## What's in Lumio at this point

Lumio is a fully-featured Kanban board application. The dashboard (`/dashboard`) renders three columns — To Do, In Progress, and Done — each with an "Add task" button. Clicking the button opens a dialog with a title input and a submit button. Submitted tasks appear as cards in the column.

## What codegen sees

When you run `npx playwright codegen http://localhost:3000` and record a task creation flow on the dashboard, codegen generates something like:

```typescript
await page.goto('http://localhost:3000/dashboard');
await page.locator('[data-column="todo"] button').first().click();
await page.locator('#task-title-input').fill('My task');
await page.locator('[data-testid="task-submit"]').click();
```

This mix of CSS selectors and ID locators is fragile — `[data-column="todo"] button` matches every button in the column, not just "Add task". The exercises in this module replace fragile codegen output with resilient locators.

## Relevant elements

| Element | Preferred locator |
|---------|------------------|
| Kanban column heading "To Do" | `page.getByRole('heading', { name: 'To Do' })` |
| Add task button | `page.getByRole('button', { name: 'Add task' })` |
| Task creation dialog | `page.getByRole('dialog')` |
| Task title input | `page.getByTestId('task-title-input')` |
| Submit button | `page.getByTestId('task-submit')` |
| Task card | `page.getByTestId('task-card')` |

## Running codegen against Lumio

```bash
# Start Lumio first
npm run dev --prefix lumio

# In a separate terminal
npx playwright codegen http://localhost:3000
```

Interact with the Kanban board. Copy the generated code and compare it against the handwritten tests in this module — notice where codegen used a CSS selector where a semantic locator would be better.
