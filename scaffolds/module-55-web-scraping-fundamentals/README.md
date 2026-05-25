# M55: Web Scraping Fundamentals

## Learning Objectives

- Use `page.evaluate()` to run JavaScript inside the browser and return structured data to Node.js
- Extract structured data (names, descriptions, counts) from a real page into a JSON-serializable object
- Handle dynamic content that renders after initial page load
- Apply `page.exposeFunction()` to give browser-side JavaScript access to Node.js functions

## Concept

Web scraping is browser automation applied to data extraction rather than testing. The same Playwright primitives that drive test assertions — navigation, waiting for elements, evaluating page state — drive scraping. The key difference is the output: instead of asserting a boolean pass/fail, scraping collects and serializes data.

**`page.evaluate()`.** The core primitive for scraping. It runs an arbitrary JavaScript function inside the browser's page context and returns the result to Node.js. The function has full access to the DOM — `document.querySelectorAll`, `window`, and every browser API:

```typescript
const titles = await page.evaluate(() =>
  Array.from(document.querySelectorAll('.task-card h3')).map(el => el.textContent?.trim())
);
```

The return value must be JSON-serializable — strings, numbers, plain objects, arrays. Functions, Promises, and DOM nodes cannot cross the browser/Node.js boundary. If you try to return a DOM element, you get `null`.

**Structured extraction.** The real power of `evaluate()` is that it runs a single JavaScript call in the browser, which is faster than running N individual Playwright locator calls for N elements. For scraping a list of 100 items, one `evaluate()` with `querySelectorAll` is far faster than 100 individual `locator.textContent()` calls:

```typescript
const tasks = await page.evaluate(() =>
  Array.from(document.querySelectorAll('[data-testid="task-card"]')).map(card => ({
    title: card.querySelector('h3')?.textContent?.trim() ?? '',
    priority: card.dataset.priority ?? 'none',
  }))
);
```

**Waiting for dynamic content.** Single-page applications render content after JavaScript runs. Calling `page.evaluate()` before the data appears returns empty results. Use Playwright's waiting mechanisms first:

```typescript
await page.waitForSelector('[data-testid="task-card"]');
const tasks = await page.evaluate(() => ...);
```

Or use `page.locator().waitFor()` to wait for the first item before evaluating the full list. Never add hard sleeps (`page.waitForTimeout()`) — they make scrapers fragile and slow.

**Pagination.** Most real-world scraping involves paginated data. The pattern: extract the current page, find the "next" button, click it, wait for new content, repeat:

```typescript
const allData = [];
while (true) {
  const pageData = await page.evaluate(() => /* extract current page */);
  allData.push(...pageData);
  
  const nextButton = page.getByRole('button', { name: 'Next' });
  if (!await nextButton.isVisible()) break;
  await nextButton.click();
  await page.waitForLoadState('networkidle');
}
```

**`page.exposeFunction()`.** Exposes a Node.js function to the browser's JavaScript context. Useful when scraping logic needs Node.js capabilities (file system access, external HTTP calls) from inside a `page.evaluate()` callback:

```typescript
await page.exposeFunction('saveItem', async (item: object) => {
  await fs.appendFile('results.json', JSON.stringify(item) + '\n');
});

await page.evaluate(async () => {
  const items = document.querySelectorAll('.item');
  for (const item of items) {
    await (window as any).saveItem({ text: item.textContent });
  }
});
```

**Ethical scraping.** Playwright is a legitimate browser — the server sees real browser requests, not bot signatures. Ethical scraping means: respecting `robots.txt`, adding reasonable delays between requests, not hammering servers, and only scraping publicly accessible data. For data behind authentication, verify you have the right to access and export it.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Complete each TODO in `exercise.spec.ts` in order.
```bash
npx playwright test tests/module-55-web-scraping-fundamentals
```

## Key Takeaways

1. `page.evaluate()` runs JavaScript in the browser and returns JSON-serializable results to Node.js.
2. Batch DOM queries inside a single `evaluate()` — it's faster than N individual locator calls.
3. Wait for dynamic content before calling `evaluate()` — never use hard sleeps.
4. Pagination scraping: extract → find next → click → wait → repeat.
5. `page.exposeFunction()` gives browser JavaScript access to Node.js APIs (file system, external requests).

## Going Deeper

- [Playwright docs: page.evaluate()](https://playwright.dev/docs/api/class-page#page-evaluate)
- [Playwright docs: page.exposeFunction()](https://playwright.dev/docs/api/class-page#page-expose-function)
- [Playwright docs: Scraping](https://playwright.dev/docs/library#evaluate-javascript)
