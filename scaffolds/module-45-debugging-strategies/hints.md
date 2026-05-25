# M45 Hints

## TODO 1 — Attach console listener

```typescript
page.on('console', msg => messages.push(msg.text()));
```

The listener receives a `ConsoleMessage` object. Common methods:
- `msg.text()` — the message string
- `msg.type()` — `'log'`, `'error'`, `'warning'`, `'info'`, `'debug'`
- `msg.location()` — `{ url, lineNumber, columnNumber }` of the source

## TODO 2 — Assert messages is an Array

```typescript
expect(Array.isArray(messages)).toBe(true);
```

## TODO 3 — Filter to error type

```typescript
if (msg.type() === 'error') {
  errors.push(msg.text());
}
```

To also capture warnings:
```typescript
if (['error', 'warning'].includes(msg.type())) {
  errors.push(`[${msg.type()}] ${msg.text()}`);
}
```

## TODO 4 — Assert no console errors

```typescript
expect(errors).toHaveLength(0);
```

If this assertion fails, the `errors` array will show in the failure output — instant root cause.

## TODO 5 — Call highlight()

```typescript
await addTaskButton.highlight();
```

Run with `--headed` to see the visual bounding box. `highlight()` is a no-op in headless mode — it won't error, it just does nothing. Remove it before committing.

## TODO 6 — Assert three Add task buttons

```typescript
expect(allCount).toBe(3);
```

If your Lumio instance shows a different count, the board may have a different column configuration. The key lesson is that `allAddButtons` is too broad to be used safely.

## TODO 7 — Assert scoped button count is 1

```typescript
expect(scopedCount).toBe(1);
```

The scoped locator pattern:
```typescript
page.getByTestId('kanban-column-todo').getByRole('button', { name: 'Add task' })
```

This reads: "find the button named 'Add task' inside the element with `data-testid='kanban-column-todo'`." The scope dramatically reduces the match set.

## TODO 8 — Assert dashboard URL

```typescript
await expect(page).toHaveURL(/\/dashboard/);
```

After running with `trace: 'on'`:
```bash
npx playwright test tests/module-45-debugging-strategies --trace on
npx playwright show-trace test-results/*/trace.zip
```

In the Trace Viewer, click the `goto` action to see the DOM snapshot immediately after navigation.

## TODO 9 — Assert dialog count is 1

```typescript
expect(dialogCount).toBe(1);
```

`count()` is synchronous-feeling but returns a Promise — always `await` it. If `count()` returns 0, the dialog isn't in the DOM yet — add a `waitFor()`:
```typescript
await dialog.waitFor({ state: 'attached' });
```

## TODO 10 — Assert no errors during dialog interaction

```typescript
expect(errors).toHaveLength(0);
```

This assertion uses the `errors` array populated by the console listener set up at the start of the test. The listener captures everything from `page.goto()` through to this point.

---

## Configuring traces globally

In `playwright.config.ts`:

```typescript
use: {
  trace: 'on-first-retry',        // Record only on retry (CI-friendly)
  // trace: 'on',                 // Record every test (investigation mode)
  // trace: 'retain-on-failure',  // Keep only for failed tests
}
```

`on-first-retry` is the production recommendation: you get traces when they matter (failures) without the storage overhead of tracing every passing test.
