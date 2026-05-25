# M46 Hints

## TODO 1 — Wrap navigation in a named step

```typescript
await test.step('Navigate to dashboard', async () => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL('/dashboard');
});
```

The step name appears in the Trace Viewer timeline and HTML report. Choose names that describe the intent, not the implementation.

## TODO 2 — Step: Open task creation dialog

```typescript
await test.step('Open task creation dialog', async () => {
  await page.getByRole('button', { name: 'Add task' }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
});
```

## TODO 3 — Step: Fill and submit task form

```typescript
await test.step('Fill and submit task form', async () => {
  await page.getByTestId('task-title-input').fill('Step test task');
  await page.getByTestId('task-submit').click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
});
```

## TODO 4 — Step: Verify task on board

```typescript
await test.step('Verify task on board', async () => {
  await expect(
    page.getByTestId('task-card').filter({ hasText: 'Step test task' })
  ).toBeVisible();
});
```

When this step fails, the error message reads: `Error in "Verify task on board": ...` — immediately clear where the problem is.

## TODO 5 — Capture a screenshot

```typescript
const screenshot = await page.screenshot();
```

`page.screenshot()` returns a `Buffer`. Optional options:
- `{ fullPage: true }` — captures the full scrollable page
- `{ clip: { x, y, width, height } }` — captures a specific region

## TODO 6 — Attach the screenshot

```typescript
await testInfo.attach('dashboard state', {
  body: screenshot,
  contentType: 'image/png',
});
```

After running with `--reporter=html` and opening `npx playwright show-report`, click the test name to see the attachment displayed inline.

## TODO 7 — Attach JSON text

```typescript
await testInfo.attach('test data', {
  body: JSON.stringify(testData, null, 2),
  contentType: 'application/json',
});
```

The `body` field for text attachments is a `string`. Use `JSON.stringify(data, null, 2)` for indented output that's readable in the report.

## TODO 8 — Push an annotation

```typescript
testInfo.annotations.push({ type: 'issue', description: 'LUM-1234' });
```

Common annotation types: `'issue'`, `'slow'`, `'flaky'`, `'feature'`. The type is a free-form string — Playwright doesn't validate it, but the HTML report renders it as a badge alongside the test.

## TODO 9 — Step with screenshot attachment

```typescript
await test.step('Capture board state', async () => {
  const screenshot = await page.screenshot();
  await testInfo.attach('after task creation', {
    body: screenshot,
    contentType: 'image/png',
  });
  await expect(
    page.getByTestId('task-card').filter({ hasText: 'Combined test task' })
  ).toBeVisible();
});
```

This is the production pattern: the step groups the assertion with its evidence. If the assertion fails, the report shows both the error and the screenshot of what the test saw.

---

## Accessing testInfo

`testInfo` is always the second argument to the test callback:

```typescript
test('my test', async ({ page }, testInfo) => {
  // testInfo is available here
});
```

It's also available inside fixtures via the `testInfo` fixture. Most `testInfo` methods are safe to call anywhere in the test, but `attach()` and `annotations.push()` should be called before the test ends.
