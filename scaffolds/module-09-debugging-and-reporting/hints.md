# Lesson 09 Hints

## Part 1 — Playwright Inspector & Codegen (formerly M42)

### TODO 1.1 — page.pause() and URL assertion

```typescript
// await page.pause(); // Remove before committing — hangs in CI
await expect(page).toHaveURL('/dashboard');
```

`page.pause()` is a development-only tool. Add it when debugging, remove it when done. A CI run with `page.pause()` will hang indefinitely since there is no human to click "Resume".

To use the Inspector without modifying the test source, run:
```bash
PWDEBUG=1 npx playwright test tests/module-09-debugging-and-reporting --headed
```

### TODO 1.2 — Find column heading with getByRole

```typescript
const todoHeading = page.getByRole('heading', { name: 'To Do' });
await expect(todoHeading).toBeVisible();
```

Codegen might produce `page.locator('[data-column="todo"] h2')`. The `getByRole` version is better because it tests the accessible name — if the heading text changes to "To-Do" or "TODO", the test fails (which is the right behavior). The CSS path would silently pass even if the heading text disappeared entirely.

### TODO 1.3 — Count matching elements

```typescript
const count = await addTaskButton.count();
expect(count).toBe(1);
```

If count > 1, tighten the locator. Common fixes:
- Add a scope: `page.getByTestId('kanban-board').getByRole('button', { name: 'Add task' })`
- Use `nth(0)` as a last resort (but investigate why multiple matches exist)

### TODO 1.4 — Click Add task button

```typescript
await page.getByRole('button', { name: 'Add task' }).click();
```

### TODO 1.5 — Assert dialog visible

```typescript
await expect(page.getByRole('dialog')).toBeVisible();
```

### TODO 1.6 — Fill task title

```typescript
await page.getByTestId('task-title-input').fill('Codegen test task');
```

### TODO 1.7 — Submit and assert dialog closes

```typescript
await page.getByTestId('task-submit').click();
await expect(page.getByRole('dialog')).not.toBeVisible();
```

### TODO 1.8 — Assert task card visible

```typescript
await expect(page.getByTestId('task-card').filter({ hasText: 'Codegen test task' })).toBeVisible();
```

This is the assertion codegen would never generate — it only records actions, not verifications. Always add at least one assertion after a meaningful action.

---

### Running codegen against Lumio

```bash
# Start Lumio dev server first (if not already running)
npm run dev --prefix lumio

# In a separate terminal:
npx playwright codegen http://localhost:3000
```

The codegen window opens. Interact with the app; the code panel updates in real time. When done, copy the generated code and compare it to your handwritten tests — look for fragile CSS selectors and replace them.

## Part 2 — Tracing & Trace Viewer (formerly M43)

### TODO 2.1 — start tracing

```typescript
await context.tracing.start({ screenshots: true, snapshots: true });
```

### TODO 2.2 — stop tracing

```typescript
await context.tracing.stop({ path: 'test-results/traces/board-interaction.zip' });
```

View the trace:
```bash
npx playwright show-trace test-results/traces/board-interaction.zip
```

### TODO 2.3 — console listener

```typescript
const messages: string[] = [];
page.on('console', msg => messages.push(msg.text()));
```

### TODO 2.4 — evaluate console.log

```typescript
await page.evaluate(() => console.log('debug-marker-12345'));
expect(messages.some(m => m.includes('debug-marker-12345'))).toBe(true);
```

### TODO 2.5 — pageerror listener

```typescript
const errors: Error[] = [];
page.on('pageerror', err => errors.push(err));
```

### TODO 2.6 — assert no errors

```typescript
expect(errors).toHaveLength(0);
```

### TODO 2.7 — screenshot on failure

```typescript
try {
  await expect(page.getByTestId('non-existent-element')).toBeVisible({ timeout: 1000 });
} catch (err) {
  await page.screenshot({ path: 'test-results/screenshots/failure-screenshot.png' });
  throw err;
}
```

### Enabling tracing in config (recommended for CI)

In `playwright.config.ts`:
```typescript
use: {
  trace: 'on-first-retry',    // capture trace only when test is retried
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```

## Part 3 — Reporters Deep Dive (formerly M44)

### TODO 3.1 — Assert list reporter

```typescript
expect(configContent).toContain('list');
```

The `list` reporter is Playwright's default. Your `playwright.config.ts` should already have it — or you can explicitly set:
```typescript
reporter: [['list'], ['html']],
```

### TODO 3.2 — Assert html reporter

```typescript
expect(configContent).toContain('html');
```

Add the html reporter to your config if it's not there:
```typescript
reporter: [
  ['list'],
  ['html', { outputFolder: 'playwright-report', open: 'never' }],
]
```
`open: 'never'` prevents the browser from auto-opening after every run — useful in CI.

### TODO 3.3 — Assert junit reporter

```typescript
expect(configContent).toContain('junit');
```

Add JUnit to the reporter array:
```typescript
['junit', { outputFile: 'junit-results.xml' }],
```

### TODO 3.4 — Blob reporter workflow

```typescript
const blobExpected = true;
```

The blob workflow is:
1. Each shard runs: `npx playwright test --shard=1/3 --reporter=blob`
2. Blobs accumulate in `blob-results/` (one `.zip` per shard)
3. After all shards: `npx playwright merge-reports --reporter html ./blob-results`

This produces a single `playwright-report/` as if all tests ran on one machine.

### TODO 3.5 — GitHub reporter in CI config

```typescript
const hasGithubReporter = configContent.includes('github');
expect(hasGithubReporter).toBe(true);
```

A production config guards the `github` reporter with `process.env.CI`:
```typescript
reporter: process.env.CI
  ? [['github'], ['junit', { outputFile: 'junit-results.xml' }], ['blob']]
  : [['list'], ['html']],
```

This avoids polluting local terminal output with `::error::` annotation syntax.

### TODO 3.6–3.9 — Reporter interface lifecycle events

```typescript
const lifecycleEvents = [
  'onBegin',
  'onTestBegin',
  'onTestEnd',
  'onEnd',
];
```

A minimal custom reporter that logs every failure:
```typescript
import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

class FailureLogger implements Reporter {
  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'failed') {
      console.error(`FAILED: ${test.title}`);
    }
  }
}

export default FailureLogger;
```

Register it in `playwright.config.ts`:
```typescript
reporter: [['./failure-logger.ts']],
```

### TODO 3.10 — Assert Lumio title

```typescript
await expect(page).toHaveTitle(/Lumio/);
```

After this test runs with `--reporter=html`, open the report:
```bash
npx playwright show-report
```

Click the test to see its trace, console output, and any screenshots. This is the primary workflow for investigating failures.

---

### Configuring all reporters at once

```typescript
// playwright.config.ts
reporter: process.env.CI
  ? [
      ['github'],
      ['junit', { outputFile: 'results/junit.xml' }],
      ['blob', { outputDir: 'blob-results' }],
    ]
  : [
      ['list'],
      ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ],
```

This is the standard pattern: lightweight reporters in CI (github + junit + blob for merging), interactive reporters locally (list + html).

## Part 4 — Debugging Strategies (formerly M45)

### TODO 4.1 — Attach console listener

```typescript
page.on('console', msg => messages.push(msg.text()));
```

The listener receives a `ConsoleMessage` object. Common methods:
- `msg.text()` — the message string
- `msg.type()` — `'log'`, `'error'`, `'warning'`, `'info'`, `'debug'`
- `msg.location()` — `{ url, lineNumber, columnNumber }` of the source

### TODO 4.2 — Assert messages is an Array

```typescript
expect(Array.isArray(messages)).toBe(true);
```

### TODO 4.3 — Filter to error type

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

### TODO 4.4 — Assert no console errors

```typescript
expect(errors).toHaveLength(0);
```

If this assertion fails, the `errors` array will show in the failure output — instant root cause.

### TODO 4.5 — Call highlight()

```typescript
await addTaskButton.highlight();
```

Run with `--headed` to see the visual bounding box. `highlight()` is a no-op in headless mode — it won't error, it just does nothing. Remove it before committing.

### TODO 4.6 — Assert three Add task buttons

```typescript
expect(allCount).toBe(3);
```

If your Lumio instance shows a different count, the board may have a different column configuration. The key lesson is that `allAddButtons` is too broad to be used safely.

### TODO 4.7 — Assert scoped button count is 1

```typescript
expect(scopedCount).toBe(1);
```

The scoped locator pattern:
```typescript
page.getByTestId('kanban-column-todo').getByRole('button', { name: 'Add task' })
```

This reads: "find the button named 'Add task' inside the element with `data-testid='kanban-column-todo'`." The scope dramatically reduces the match set.

### TODO 4.8 — Assert dashboard URL

```typescript
await expect(page).toHaveURL(/\/dashboard/);
```

After running with `trace: 'on'`:
```bash
npx playwright test tests/module-09-debugging-and-reporting --trace on
npx playwright show-trace test-results/*/trace.zip
```

In the Trace Viewer, click the `goto` action to see the DOM snapshot immediately after navigation.

### TODO 4.9 — Assert dialog count is 1

```typescript
expect(dialogCount).toBe(1);
```

`count()` is synchronous-feeling but returns a Promise — always `await` it. If `count()` returns 0, the dialog isn't in the DOM yet — add a `waitFor()`:
```typescript
await dialog.waitFor({ state: 'attached' });
```

### TODO 4.10 — Assert no errors during dialog interaction

```typescript
expect(errors).toHaveLength(0);
```

This assertion uses the `errors` array populated by the console listener set up at the start of the test. The listener captures everything from `page.goto()` through to this point.

---

### Configuring traces globally

In `playwright.config.ts`:

```typescript
use: {
  trace: 'on-first-retry',        // Record only on retry (CI-friendly)
  // trace: 'on',                 // Record every test (investigation mode)
  // trace: 'retain-on-failure',  // Keep only for failed tests
}
```

`on-first-retry` is the production recommendation: you get traces when they matter (failures) without the storage overhead of tracing every passing test.

## Part 5 — test.step() & Runtime Attachments (formerly M46)

### TODO 5.1 — Wrap navigation in a named step

```typescript
await test.step('Navigate to dashboard', async () => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL('/dashboard');
});
```

The step name appears in the Trace Viewer timeline and HTML report. Choose names that describe the intent, not the implementation.

### TODO 5.2 — Step: Open task creation dialog

```typescript
await test.step('Open task creation dialog', async () => {
  await page.getByRole('button', { name: 'Add task' }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
});
```

### TODO 5.3 — Step: Fill and submit task form

```typescript
await test.step('Fill and submit task form', async () => {
  await page.getByTestId('task-title-input').fill('Step test task');
  await page.getByTestId('task-submit').click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
});
```

### TODO 5.4 — Step: Verify task on board

```typescript
await test.step('Verify task on board', async () => {
  await expect(
    page.getByTestId('task-card').filter({ hasText: 'Step test task' })
  ).toBeVisible();
});
```

When this step fails, the error message reads: `Error in "Verify task on board": ...` — immediately clear where the problem is.

### TODO 5.5 — Capture a screenshot

```typescript
const screenshot = await page.screenshot();
```

`page.screenshot()` returns a `Buffer`. Optional options:
- `{ fullPage: true }` — captures the full scrollable page
- `{ clip: { x, y, width, height } }` — captures a specific region

### TODO 5.6 — Attach the screenshot

```typescript
await testInfo.attach('dashboard state', {
  body: screenshot,
  contentType: 'image/png',
});
```

After running with `--reporter=html` and opening `npx playwright show-report`, click the test name to see the attachment displayed inline.

### TODO 5.7 — Attach JSON text

```typescript
await testInfo.attach('test data', {
  body: JSON.stringify(testData, null, 2),
  contentType: 'application/json',
});
```

The `body` field for text attachments is a `string`. Use `JSON.stringify(data, null, 2)` for indented output that's readable in the report.

### TODO 5.8 — Push an annotation

```typescript
testInfo.annotations.push({ type: 'issue', description: 'LUM-1234' });
```

Common annotation types: `'issue'`, `'slow'`, `'flaky'`, `'feature'`. The type is a free-form string — Playwright doesn't validate it, but the HTML report renders it as a badge alongside the test.

### TODO 5.9 — Step with screenshot attachment

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

### Accessing testInfo

`testInfo` is always the second argument to the test callback:

```typescript
test('my test', async ({ page }, testInfo) => {
  // testInfo is available here
});
```

It's also available inside fixtures via the `testInfo` fixture. Most `testInfo` methods are safe to call anywhere in the test, but `attach()` and `annotations.push()` should be called before the test ends.
