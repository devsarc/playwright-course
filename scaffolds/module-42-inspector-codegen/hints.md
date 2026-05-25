# M42 Hints

## TODO 1 — page.pause() and URL assertion

```typescript
// await page.pause(); // Remove before committing — hangs in CI
await expect(page).toHaveURL('/dashboard');
```

`page.pause()` is a development-only tool. Add it when debugging, remove it when done. A CI run with `page.pause()` will hang indefinitely since there is no human to click "Resume".

To use the Inspector without modifying the test source, run:
```bash
PWDEBUG=1 npx playwright test tests/module-42-inspector-codegen --headed
```

## TODO 2 — Find column heading with getByRole

```typescript
const todoHeading = page.getByRole('heading', { name: 'To Do' });
await expect(todoHeading).toBeVisible();
```

Codegen might produce `page.locator('[data-column="todo"] h2')`. The `getByRole` version is better because it tests the accessible name — if the heading text changes to "To-Do" or "TODO", the test fails (which is the right behavior). The CSS path would silently pass even if the heading text disappeared entirely.

## TODO 3 — Count matching elements

```typescript
const count = await addTaskButton.count();
expect(count).toBe(1);
```

If count > 1, tighten the locator. Common fixes:
- Add a scope: `page.getByTestId('kanban-board').getByRole('button', { name: 'Add task' })`
- Use `nth(0)` as a last resort (but investigate why multiple matches exist)

## TODO 4 — Click Add task button

```typescript
await page.getByRole('button', { name: 'Add task' }).click();
```

## TODO 5 — Assert dialog visible

```typescript
await expect(page.getByRole('dialog')).toBeVisible();
```

## TODO 6 — Fill task title

```typescript
await page.getByTestId('task-title-input').fill('Codegen test task');
```

## TODO 7 — Submit and assert dialog closes

```typescript
await page.getByTestId('task-submit').click();
await expect(page.getByRole('dialog')).not.toBeVisible();
```

## TODO 8 — Assert task card visible

```typescript
await expect(page.getByTestId('task-card').filter({ hasText: 'Codegen test task' })).toBeVisible();
```

This is the assertion codegen would never generate — it only records actions, not verifications. Always add at least one assertion after a meaningful action.

---

## Running codegen against Lumio

```bash
# Start Lumio dev server first (if not already running)
npm run dev --prefix lumio

# In a separate terminal:
npx playwright codegen http://localhost:3000
```

The codegen window opens. Interact with the app; the code panel updates in real time. When done, copy the generated code and compare it to your handwritten tests — look for fragile CSS selectors and replace them.
