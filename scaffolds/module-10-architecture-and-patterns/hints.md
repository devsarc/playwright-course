# Lesson 10 Hints

## Part 1 — Page Object Model (formerly M47)

### TODO 1.1 — Locator property declarations

```typescript
readonly todoColumn: Locator;
readonly inProgressColumn: Locator;
readonly doneColumn: Locator;
```

### TODO 1.2 — addCardButton declaration

```typescript
readonly addCardButton: Locator;
```

### TODO 1.3 — Constructor initialization

```typescript
this.todoColumn = page.getByTestId('kanban-column-todo');
this.inProgressColumn = page.getByTestId('kanban-column-in-progress');
this.doneColumn = page.getByTestId('kanban-column-done');
this.addCardButton = page.getByTestId('add-card-button');
```

### TODO 1.4 — goto()

```typescript
async goto(projectId: string): Promise<void> {
  await this.page.goto(`/projects/${projectId}/board`);
}
```

### TODO 1.5 — addCard()

```typescript
async addCard(title: string): Promise<Locator> {
  await this.addCardButton.click();
  await this.page.getByTestId('new-card-input').fill(title);
  await this.page.getByTestId('new-card-input').press('Enter');
  return this.page.getByTestId('kanban-card').filter({ hasText: title });
}
```

### TODO 1.6 — cardCount()

```typescript
async cardCount(column: Locator): Promise<number> {
  return column.getByTestId('kanban-card').count();
}
```

(TODOs 1.1–1.6 above are in `pages/KanbanPage.ts`, not `exercise.spec.ts` — that file
is copied over from the original module unchanged, so its TODOs keep their original
bare numbers `TODO 1`–`TODO 6`, per the same precedent used for other extra files
copied unchanged in this lesson series.)

### TODO 1.7 — beforeEach

```typescript
kanban = new KanbanPage(page);
await kanban.goto(PROJECT_ID);
```

### TODO 1.8 — column visibility

```typescript
await expect(kanban.todoColumn).toBeVisible();
await expect(kanban.inProgressColumn).toBeVisible();
await expect(kanban.doneColumn).toBeVisible();
```

### TODO 1.9 — addCard assertion

```typescript
const card = await kanban.addCard(title);
await expect(kanban.todoColumn.locator(card)).toBeVisible();
```

### TODO 1.10 — cardCount before/after

```typescript
const before = await kanban.cardCount(kanban.todoColumn);
await kanban.addCard('count test');
const after = await kanban.cardCount(kanban.todoColumn);
expect(after).toBe(before + 1);
```

## Part 2 — Advanced Fixture Patterns (formerly M48)

### TODO 2.1 — Create a new browser context

```typescript
const context = await browser.newContext({});
```

Common options you'd add in a real authenticated fixture:
```typescript
const context = await browser.newContext({
  storageState: 'auth.json',  // restores cookies/localStorage from a saved state
  baseURL: 'http://localhost:3000',
});
```

### TODO 2.2 — Call use(context)

```typescript
await use(context);
```

The test receives `context` as the fixture value. Code after this line runs as teardown — guaranteed to execute even if the test throws.

### TODO 2.3 — Close the context in teardown

```typescript
await context.close();
```

Teardown in a fixture replaces `afterEach`. The advantage: if the fixture's setup throws, Playwright knows not to run teardown for that fixture (since setup never completed). `afterEach` doesn't have this guarantee.

### TODO 2.4 — Create a page from isolatedContext

```typescript
const page = await isolatedContext.newPage();
```

No options needed — the context already has all the settings (baseURL, storageState, etc.). The page inherits them automatically.

### TODO 2.5 — Call use(data)

```typescript
await use(data);
```

In a real data fixture, the pattern would be:
```typescript
const response = await request.post('/api/tasks', { data: { title: 'Test task' } });
const task = await response.json();
await use(task);
await request.delete(`/api/tasks/${task.id}`);  // teardown: clean up
```

### TODO 2.6 — Assert fresh context has no pages

```typescript
expect(isolatedContext.pages()).toHaveLength(0);
```

`context.pages()` returns an array of all open pages in the context. A fresh context has none.

### TODO 2.7 — Navigate isolatedPage to dashboard

```typescript
await isolatedPage.goto('/dashboard');
```

The page uses whatever `baseURL` is configured in `playwright.config.ts`. The fixture doesn't need to know the URL — it comes from config.

### TODO 2.8 — Assert taskData.title is a string

```typescript
expect(typeof taskData.title).toBe('string');
```

### TODO 2.9 — Assert taskData.column equals 'todo'

```typescript
expect(taskData.column).toBe('todo');
```

### TODO 2.10 — Assert both scope arrays have items

```typescript
expect(workerScopedUseCases.length).toBeGreaterThan(0);
expect(testScopedUseCases.length).toBeGreaterThan(0);
```

---

### Building an authenticated page fixture

This is the real-world authenticated fixture pattern:

```typescript
const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Login via the UI
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('secret');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL('/dashboard');

    // Save auth state for reuse (worker-scoped optimization)
    await context.storageState({ path: 'auth.json' });

    await use(page);
    await context.close();
  },
});
```

For worker-scoped auth (faster):
```typescript
const test = base.extend<{}, { authState: string }>({
  authState: [async ({ browser }, use) => {
    // Runs once per worker — login once, share across tests
    const context = await browser.newContext();
    const page = await context.newPage();
    // ... login ...
    await context.storageState({ path: 'auth.json' });
    await context.close();
    await use('auth.json');
  }, { scope: 'worker' }],

  authenticatedPage: async ({ browser, authState }, use) => {
    const context = await browser.newContext({ storageState: authState });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});
```

## Part 3 — Data-Driven Testing (formerly M49)

### TODO 3.1 — Import task-data.json

```typescript
const taskDataPath = require('./task-data.json');
```

Or with ES import syntax (requires `resolveJsonModule: true` in tsconfig, which Playwright sets by default):
```typescript
import taskDataPath from './task-data.json';
```

### TODO 3.2 — Name each test using the description field

```typescript
test(`validates: ${description}`, async ({ page }) => {
```

The test name in the HTML report will read:
- `validates: empty title`
- `validates: whitespace only title`
- `validates: single character title`
- `validates: normal title`

Compare this to a generic `test('form validation', ...)` which produces four identical rows — impossible to tell which one failed without reading the stack trace.

### TODO 3.3 — Assert dialog stays visible on invalid input

```typescript
await expect(page.getByRole('dialog')).toBeVisible();
```

Lumio's task form rejects empty or whitespace-only titles and keeps the dialog open.

### TODO 3.4 — Assert dialog closes on valid input

```typescript
await expect(page.getByRole('dialog')).not.toBeVisible();
```

### TODO 3.5 — Loop over external data and name each test

```typescript
for (const { title, priority } of taskDataPath) {
  test(`creates task: "${title}" (${priority} priority)`, async ({ page }) => {
```

Full title format examples:
- `creates task: "Design landing page" (high priority)`
- `creates task: "Write API docs" (medium priority)`

### TODO 3.6 — Fill with the loop's title variable

```typescript
await page.getByTestId('task-title-input').fill(title);
```

### TODO 3.7 — Assert task card with matching title is visible

```typescript
await expect(
  page.getByTestId('task-card').filter({ hasText: title })
).toBeVisible();
```

`.filter({ hasText: title })` narrows the `task-card` locator to only the card containing the expected text. This is safe even if other cards exist — it finds the specific one.

### TODO 3.8 — Understand when to avoid data-driven

```typescript
const understoodWhenToAvoidDataDriven = true;
```

The rule: if the test body structure (the sequence of assertions) changes between cases, they are not the same test with different data — they are different tests. Use a loop only when the logic is identical and only the data varies.

### TODO 3.9 — Assert taskDataPath is an Array

```typescript
expect(Array.isArray(taskDataPath)).toBe(true);
```

### TODO 3.10 — Assert non-empty data file

```typescript
expect(taskDataPath.length).toBeGreaterThan(0);
```

This is a guard against data files being accidentally emptied. When the data file has zero entries, the `for...of` loop generates zero tests — and zero tests means zero failures, which means you'd never know the data disappeared.

---

### Adding new test cases

To add more task creation cases, edit `task-data.json`:
```json
[
  { "title": "New task", "priority": "high", "label": "feature", "column": "todo" }
]
```

No TypeScript changes needed. The loop picks it up automatically on the next run. This is the separation of concerns that makes data-driven testing valuable for large test suites maintained by mixed teams.

## Part 4 — Test Organization & Suite Architecture (formerly M50)

### TODO 4.1 — Tag a test with @smoke

The tag is already in the test name: `'dashboard loads @smoke'`. No additional code needed — just run:

```bash
npx playwright test tests/module-10-architecture-and-patterns --grep @smoke
```

This runs only the tests whose names contain `@smoke`.

### TODO 4.2 — Assert Add task button visible

```typescript
await expect(page.getByRole('button', { name: 'Add task' }).first()).toBeVisible();
```

### TODO 4.3 — Close dialog with Escape and assert not visible

```typescript
await page.keyboard.press('Escape');
await expect(page.getByRole('dialog')).not.toBeVisible();
```

### TODO 4.4 — Assert 'To Do' heading

```typescript
const todoHeading = page.getByRole('heading', { name: 'To Do' });
await expect(todoHeading).toBeVisible();
```

### TODO 4.5 — Use test.fixme() with a bug reference

```typescript
test.fixme(true, 'LUM-9999: task drag-and-drop intermittently fails');
```

When `fixme(true, ...)` is called, the test is immediately marked as skipped with the reason shown in the HTML report. The bug reference links it to your issue tracker — the test won't silently disappear.

Alternative forms:
```typescript
test.fixme();                  // always skip, no reason
test.fixme(condition, reason); // conditional — skip only when condition is true
```

### TODO 4.6 — Distinguish skip from fixme

```typescript
const brokenWithBug = 'fixme';
const notApplicable = 'skip';
```

The mental model:
- `fixme` = "I know this is broken, here's the ticket"
- `skip` = "this test doesn't apply to this run (platform, flag, environment)"

### TODO 4.7 — Configure describe block timeout

```typescript
test.describe.configure({ timeout: 60_000 });
```

Other options you can set at the describe level:
```typescript
test.describe.configure({
  mode: 'parallel',   // run tests in this block concurrently
  retries: 2,         // retry up to 2 times on failure
  timeout: 60_000,    // 60 second timeout per test
});
```

### TODO 4.8 — Confirm grep filtering is understood

```typescript
const greppingUnderstood = true;
```

Verify by running:
```bash
# Only smoke tests (2–3 tests)
npx playwright test tests/module-10-architecture-and-patterns --grep @smoke

# Only regression tests (2–3 tests)
npx playwright test tests/module-10-architecture-and-patterns --grep @regression

# Everything except accessibility
npx playwright test tests/module-10-architecture-and-patterns --grep-invert @accessibility
```

---

### Recommended tagging strategy for Lumio

| Tag | Purpose | Run frequency |
|-----|---------|--------------|
| `@smoke` | Login + dashboard load + task create | Every commit |
| `@regression` | All happy-path flows | Pre-release |
| `@e2e` | Multi-user / multi-system flows | Nightly |
| `@accessibility` | ARIA snapshot + role assertions | Weekly or on PR |
| `@visual` | Screenshot comparisons | After visual review |

In `playwright.config.ts`, you can set the default grep for CI:
```typescript
grep: process.env.CI ? /@smoke/ : undefined,
```

This runs only smoke tests in CI by default, with the full suite available locally.
