import { test, expect } from '../fixtures/fixtures';

// M55: Web Scraping Fundamentals
//
// This module uses page.evaluate() to extract structured data from Lumio.
// Scraping is automation for data extraction rather than testing —
// the same primitives, a different output.

test.describe('M55 — Web Scraping Fundamentals', () => {

  // Test 1: Extract text content from multiple elements
  // page.evaluate() runs JavaScript inside the browser and returns JSON.
  test('extract all task card titles with page.evaluate()', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for task cards to render before evaluating.
    // TODO 1: Wait for the selector '[data-testid="task-card"]' before extracting.
    // Why? evaluate() runs immediately — if called before cards render, it returns an empty array.
    await page.waitForSelector(/* TODO 1: '[data-testid="task-card"]' */ 'body', { state: 'visible' }).catch(() => {});

    // TODO 2: Use page.evaluate() to extract an array of title strings.
    // Select all '[data-testid="task-card"] h3' elements and map to textContent.trim().
    // Why? One evaluate() call batching N DOM queries is far faster than N locator.textContent() calls.
    const titles = await page.evaluate(/* TODO 2: () =>
      Array.from(document.querySelectorAll('[data-testid="task-card"] h3'))
        .map(el => el.textContent?.trim() ?? '')
    */ () => []);

    expect(Array.isArray(titles)).toBe(true);
  });

  // Test 2: Extract structured data objects
  // evaluate() can return complex objects, not just strings.
  test('extract structured task data from the board', async ({ page }) => {
    await page.goto('/dashboard');

    // TODO 3: Use page.evaluate() to return an array of objects, each with:
    //   { title: string, priority: string }
    // Hint: data-priority is a dataset attribute on task card elements.
    const tasks = await page.evaluate(/* TODO 3: () =>
      Array.from(document.querySelectorAll('[data-testid="task-card"]')).map(card => ({
        title: card.querySelector('h3')?.textContent?.trim() ?? '',
        priority: (card as HTMLElement).dataset.priority ?? 'none',
      }))
    */ () => []);

    // TODO 4: Assert that tasks is an Array.
    expect(Array.isArray(/* TODO 4: tasks */)).toBe(true);
  });

  // Test 3: Pass arguments into page.evaluate()
  // evaluate() can receive arguments from Node.js — pass a selector or config.
  test('evaluate() accepts arguments from Node.js', async ({ page }) => {
    await page.goto('/dashboard');

    const selector = '[data-testid="task-card"]';

    // TODO 5: Use page.evaluate() with a second argument to pass 'selector' into the browser.
    // Signature: page.evaluate((selector) => document.querySelectorAll(selector).length, selector)
    // Why? Passing data in avoids hardcoding values inside the evaluate() callback —
    // the callback is transferred as a string to the browser, so closure variables don't transfer.
    const count = await page.evaluate(/* TODO 5: (sel) => document.querySelectorAll(sel).length, selector */ () => 0);

    expect(typeof count).toBe('number');
  });

  // Test 4: page.exposeFunction() — Node.js in the browser
  // Exposes a Node.js function so browser JavaScript can call it.
  test('exposeFunction gives browser access to Node.js', async ({ page }) => {
    const collected: string[] = [];

    // TODO 6: Use page.exposeFunction() to expose a function named 'collectItem'
    // that pushes its argument into the collected array.
    // Why? exposeFunction() bridges the browser/Node.js boundary —
    // browser code calls collectItem(), Node.js receives the call synchronously.
    await page.exposeFunction(/* TODO 6: 'collectItem', (item: string) => { collected.push(item); } */);

    await page.goto('/dashboard');

    // TODO 7: Use page.evaluate() to call window.collectItem('test-item').
    await page.evaluate(/* TODO 7: () => (window as any).collectItem('test-item') */);

    // TODO 8: Assert that collected contains 'test-item'.
    expect(collected).toContain(/* TODO 8: 'test-item' */);
  });

  // Test 5: Wait for dynamic content before extracting
  // SPAs render content after JavaScript runs — evaluate() must come after.
  test('waitForSelector before evaluate prevents empty results', async ({ page }) => {
    await page.goto('/dashboard');

    // The correct order: wait → evaluate.
    // Never evaluate() immediately after goto() without waiting.

    // TODO 9: Assert that page.waitForSelector is a function.
    // Why? This confirms the API exists — the concept is more important than the assertion here.
    expect(typeof page.waitForSelector).toBe(/* TODO 9: 'function' */);
  });

  // Test 6: Column-level scraping — scoped extraction
  test('extract tasks from a specific column only', async ({ page }) => {
    await page.goto('/dashboard');

    // TODO 10: Use page.evaluate() to extract task titles from ONLY the 'To Do' column.
    // Hint: scope the querySelectorAll to '[data-column="todo"] [data-testid="task-card"] h3'
    const todoTitles = await page.evaluate(/* TODO 10: () =>
      Array.from(document.querySelectorAll('[data-column="todo"] [data-testid="task-card"] h3'))
        .map(el => el.textContent?.trim() ?? '')
    */ () => []);

    expect(Array.isArray(todoTitles)).toBe(true);
  });

});
