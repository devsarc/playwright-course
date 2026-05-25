# M55 Hints

## TODO 1 — Wait for task cards before extracting

```typescript
await page.waitForSelector('[data-testid="task-card"]', { state: 'visible' }).catch(() => {});
```

The `.catch(() => {})` suppresses the error if no task cards exist yet — the board may be empty. Adjust based on your test setup.

## TODO 2 — Extract title strings with evaluate()

```typescript
const titles = await page.evaluate(() =>
  Array.from(document.querySelectorAll('[data-testid="task-card"] h3'))
    .map(el => el.textContent?.trim() ?? '')
);
```

## TODO 3 — Extract structured objects

```typescript
const tasks = await page.evaluate(() =>
  Array.from(document.querySelectorAll('[data-testid="task-card"]')).map(card => ({
    title: card.querySelector('h3')?.textContent?.trim() ?? '',
    priority: (card as HTMLElement).dataset.priority ?? 'none',
  }))
);
```

The cast `(card as HTMLElement)` is needed to access `dataset` in TypeScript.

## TODO 4 — Assert tasks is an Array

```typescript
expect(Array.isArray(tasks)).toBe(true);
```

## TODO 5 — Pass arguments into evaluate()

```typescript
const count = await page.evaluate(
  (sel) => document.querySelectorAll(sel).length,
  selector
);
```

The second argument to `evaluate()` is passed as the first argument to the function. Multiple arguments use an array: `evaluate(([a, b]) => ..., [valA, valB])`.

## TODO 6 — Expose a Node.js function to the browser

```typescript
await page.exposeFunction('collectItem', (item: string) => {
  collected.push(item);
});
```

The function is exposed on `window.collectItem` in the browser. It can be async — returning a Promise that the browser-side code can await.

## TODO 7 — Call the exposed function from browser context

```typescript
await page.evaluate(() => (window as any).collectItem('test-item'));
```

## TODO 8 — Assert collected contains the item

```typescript
expect(collected).toContain('test-item');
```

## TODO 9 — Assert waitForSelector is a function

```typescript
expect(typeof page.waitForSelector).toBe('function');
```

## TODO 10 — Scoped column extraction

```typescript
const todoTitles = await page.evaluate(() =>
  Array.from(document.querySelectorAll('[data-column="todo"] [data-testid="task-card"] h3'))
    .map(el => el.textContent?.trim() ?? '')
);
```

---

## Saving scraped data to a file

After extracting, save with Node.js `fs`:
```typescript
import { writeFileSync } from 'fs';

const tasks = await page.evaluate(() => /* ... */);
writeFileSync('scraped-tasks.json', JSON.stringify(tasks, null, 2));
```

For large scrapes, append incrementally:
```typescript
import { appendFileSync } from 'fs';
for (const task of tasks) {
  appendFileSync('tasks.ndjson', JSON.stringify(task) + '\n');
}
```
