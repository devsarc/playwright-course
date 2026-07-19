# Lesson 12 Hints

## Part 1 — Web Scraping Fundamentals (formerly M55)

### TODO 1.1 — Wait for task cards before extracting

```typescript
await page.waitForSelector('[data-testid="task-card"]', { state: 'visible' }).catch(() => {});
```

The `.catch(() => {})` suppresses the error if no task cards exist yet — the board may be empty. Adjust based on your test setup.

### TODO 1.2 — Extract title strings with evaluate()

```typescript
const titles = await page.evaluate(() =>
  Array.from(document.querySelectorAll('[data-testid="task-card"] h3'))
    .map(el => el.textContent?.trim() ?? '')
);
```

### TODO 1.3 — Extract structured objects

```typescript
const tasks = await page.evaluate(() =>
  Array.from(document.querySelectorAll('[data-testid="task-card"]')).map(card => ({
    title: card.querySelector('h3')?.textContent?.trim() ?? '',
    priority: (card as HTMLElement).dataset.priority ?? 'none',
  }))
);
```

The cast `(card as HTMLElement)` is needed to access `dataset` in TypeScript.

### TODO 1.4 — Assert tasks is an Array

```typescript
expect(Array.isArray(tasks)).toBe(true);
```

### TODO 1.5 — Pass arguments into evaluate()

```typescript
const count = await page.evaluate(
  (sel) => document.querySelectorAll(sel).length,
  selector
);
```

The second argument to `evaluate()` is passed as the first argument to the function. Multiple arguments use an array: `evaluate(([a, b]) => ..., [valA, valB])`.

### TODO 1.6 — Expose a Node.js function to the browser

```typescript
await page.exposeFunction('collectItem', (item: string) => {
  collected.push(item);
});
```

The function is exposed on `window.collectItem` in the browser. It can be async — returning a Promise that the browser-side code can await.

### TODO 1.7 — Call the exposed function from browser context

```typescript
await page.evaluate(() => (window as any).collectItem('test-item'));
```

### TODO 1.8 — Assert collected contains the item

```typescript
expect(collected).toContain('test-item');
```

### TODO 1.9 — Assert waitForSelector is a function

```typescript
expect(typeof page.waitForSelector).toBe('function');
```

### TODO 1.10 — Scoped column extraction

```typescript
const todoTitles = await page.evaluate(() =>
  Array.from(document.querySelectorAll('[data-column="todo"] [data-testid="task-card"] h3'))
    .map(el => el.textContent?.trim() ?? '')
);
```

---

### Saving scraped data to a file

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

## Part 2 — Advanced Scraping & Data Extraction (formerly M56)

### TODO 2.1 — Assert dashboard URL

```typescript
await expect(page).toHaveURL(/\/dashboard/);
```

### TODO 2.2 — storageState option key

```typescript
const authStateOption = 'storageState';
```

Save auth: `await context.storageState({ path: 'auth.json' })`.
Restore auth: `browser.newContext({ storageState: 'auth.json' })`.

### TODO 2.3 — scrollHeight property

```typescript
const scrollHeightProperty = 'scrollHeight';
```

Full infinite scroll loop:
```typescript
let previousHeight = 0;
while (true) {
  const currentHeight = await page.evaluate(() => document.body.scrollHeight);
  if (currentHeight === previousHeight) break;
  previousHeight = currentHeight;
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
}
```

### TODO 2.4 — Build CSV content string

```typescript
const csvContent = [header, ...rows].join('\n');
```

### TODO 2.5 — Assert output file exists

```typescript
expect(existsSync(outputPath)).toBe(true);
```

### TODO 2.6 — Delay method

```typescript
const delayMethod = 'waitForTimeout';
```

`page.waitForTimeout()` is appropriate for scraping delays but is an antipattern in tests — in tests, always wait for a condition, not a fixed time.

### TODO 2.7 — Assert heading text is serializable

```typescript
expect(['string', 'object'].includes(typeof headingText)).toBe(true);
```

`typeof null === 'object'` in JavaScript. So checking for `'string' | 'object'` covers both `string` and `null`.

## Part 3 — Web Crawling & Link Monitoring (formerly M57)

### TODO 3.1 — Extract internal links

```typescript
const links = await page.evaluate(() =>
  Array.from(document.querySelectorAll('a[href]'))
    .map(a => (a as HTMLAnchorElement).href)
    .filter(href => href.startsWith(window.location.origin))
);
```

`window.location.origin` is `http://localhost:3000` in Lumio's test environment.

### TODO 3.2 — Assert links is an Array

```typescript
expect(Array.isArray(links)).toBe(true);
```

### TODO 3.3 — Assert response status is 200

```typescript
expect(response?.status()).toBe(200);
```

During a crawl, any status outside 2xx is worth recording. 404 specifically means broken link.

### TODO 3.4 — Assert siteMap has at least one entry

```typescript
expect(siteMap.length).toBeGreaterThan(0);
```

### TODO 3.5 — Filter by depth

```typescript
const crawlable = queue.filter(item => item.depth <= MAX_DEPTH);
```

### TODO 3.6 — Assert 4 crawlable entries

```typescript
expect(crawlable.length).toBe(4);
```

Depths 0, 1, 2, 3 are within MAX_DEPTH (3). Depth 4 is excluded.

### TODO 3.7 — Filter same-origin links

```typescript
const internalLinks = allLinks.filter(link => link.startsWith(origin));
```

### TODO 3.8 — Assert 2 internal links

```typescript
expect(internalLinks.length).toBe(2);
```

### TODO 3.9 — Detect 404s

```typescript
if (result.status === 404) {
  brokenLinks.push(result.url);
}
```

### TODO 3.10 — Assert 2 broken links

```typescript
expect(brokenLinks.length).toBe(2);
```

## Part 4 — Automated Form Filling & Bots (formerly M58)

### TODO 4.1 — Fill with task.title

```typescript
await page.getByTestId('task-title-input').fill(task.title);
```

### TODO 4.2 — Assert dialog closed

```typescript
await expect(page.getByRole('dialog')).not.toBeVisible();
```

### TODO 4.3 — Assert submitted length

```typescript
expect(submitted).toHaveLength(taskRows.length);
```

### TODO 4.4 — isVisible() before filling

```typescript
if (await dueDateInput.isVisible()) {
  await dueDateInput.fill('2024-12-31');
}
```

`isVisible()` is a non-strict check — it returns false if the element doesn't exist rather than throwing. This is the correct API for conditional interaction.

### TODO 4.5 — Assert 1 error

```typescript
expect(errors.length).toBe(1);
```

### TODO 4.6 — Assert 2 succeeded

```typescript
expect(succeeded.length).toBe(2);
```

### TODO 4.7 — Minimum delay

```typescript
const minDelayMs = 300;
```

For bots submitting to external services, increase to 1000–2000ms. For internal test environments, 100–300ms is usually sufficient.

## Part 5 — Screenshot & Demo Generation (formerly M59)

### TODO 5.1 — Numbered step screenshot path

```typescript
await page.screenshot({
  path: `${DEMO_DIR}/step-${String(++step).padStart(2, '0')}-${label}.png`,
});
```

`padStart(2, '0')` produces `01`, `02`, ..., `09`, `10` — correct alphabetical sort order.

### TODO 5.2 — Assert step equals 3

```typescript
expect(step).toBe(3);
```

### TODO 5.3 — Full page screenshot

```typescript
await page.screenshot({ path: screenshotPath, fullPage: true });
```

### TODO 5.4 — Mask sensitive areas

```typescript
await page.screenshot({
  path: screenshotPath,
  mask: [page.getByTestId('user-avatar')],
});
```

The masked element is replaced with a solid magenta box in the screenshot output. Use this to hide usernames, email addresses, or test credentials.

### TODO 5.5 — Video recording option key

```typescript
const videoOption = 'recordVideo';
```

Full context setup:
```typescript
const context = await browser.newContext({
  recordVideo: {
    dir: 'demo-videos/',
    size: { width: 1280, height: 720 },
  },
  slowMo: 500,
});
```

### TODO 5.6 — Recommended slowMo for demo

```typescript
const slowMoMs = 500;
```

500ms is a good baseline — it's slow enough to see each action but fast enough that a 2-minute flow produces a 3-minute video rather than a 10-minute one.

### TODO 5.7 — Assert waitForLoadState is a function

```typescript
expect(typeof page.waitForLoadState).toBe('function');
```
