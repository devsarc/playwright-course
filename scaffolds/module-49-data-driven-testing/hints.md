# M49 Hints

## TODO 1 — Import task-data.json

```typescript
const taskDataPath = require('./task-data.json');
```

Or with ES import syntax (requires `resolveJsonModule: true` in tsconfig, which Playwright sets by default):
```typescript
import taskDataPath from './task-data.json';
```

## TODO 2 — Name each test using the description field

```typescript
test(`validates: ${description}`, async ({ page }) => {
```

The test name in the HTML report will read:
- `validates: empty title`
- `validates: whitespace only title`
- `validates: single character title`
- `validates: normal title`

Compare this to a generic `test('form validation', ...)` which produces four identical rows — impossible to tell which one failed without reading the stack trace.

## TODO 3 — Assert dialog stays visible on invalid input

```typescript
await expect(page.getByRole('dialog')).toBeVisible();
```

Lumio's task form rejects empty or whitespace-only titles and keeps the dialog open.

## TODO 4 — Assert dialog closes on valid input

```typescript
await expect(page.getByRole('dialog')).not.toBeVisible();
```

## TODO 5 — Loop over external data and name each test

```typescript
for (const { title, priority } of taskDataPath) {
  test(`creates task: "${title}" (${priority} priority)`, async ({ page }) => {
```

Full title format examples:
- `creates task: "Design landing page" (high priority)`
- `creates task: "Write API docs" (medium priority)`

## TODO 6 — Fill with the loop's title variable

```typescript
await page.getByTestId('task-title-input').fill(title);
```

## TODO 7 — Assert task card with matching title is visible

```typescript
await expect(
  page.getByTestId('task-card').filter({ hasText: title })
).toBeVisible();
```

`.filter({ hasText: title })` narrows the `task-card` locator to only the card containing the expected text. This is safe even if other cards exist — it finds the specific one.

## TODO 8 — Understand when to avoid data-driven

```typescript
const understoodWhenToAvoidDataDriven = true;
```

The rule: if the test body structure (the sequence of assertions) changes between cases, they are not the same test with different data — they are different tests. Use a loop only when the logic is identical and only the data varies.

## TODO 9 — Assert taskDataPath is an Array

```typescript
expect(Array.isArray(taskDataPath)).toBe(true);
```

## TODO 10 — Assert non-empty data file

```typescript
expect(taskDataPath.length).toBeGreaterThan(0);
```

This is a guard against data files being accidentally emptied. When the data file has zero entries, the `for...of` loop generates zero tests — and zero tests means zero failures, which means you'd never know the data disappeared.

---

## Adding new test cases

To add more task creation cases, edit `task-data.json`:
```json
[
  { "title": "New task", "priority": "high", "label": "feature", "column": "todo" }
]
```

No TypeScript changes needed. The loop picks it up automatically on the next run. This is the separation of concerns that makes data-driven testing valuable for large test suites maintained by mixed teams.
