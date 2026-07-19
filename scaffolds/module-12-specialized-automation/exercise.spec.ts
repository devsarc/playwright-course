// Lesson 12: Specialized Automation: Scraping, Crawling & Bots
// Combines former modules: M55 (Web Scraping Fundamentals), M56 (Advanced Scraping & Data Extraction),
// M57 (Web Crawling & Link Monitoring), M58 (Automated Form Filling & Bots), M59 (Screenshot & Demo Generation)
//
// Each Part below is the original module's test.describe block, unchanged
// except TODO numbers are prefixed with the Part number to stay unique in
// this file (e.g. a TODO originally numbered 3 in the original M57 module
// becomes TODO
// 3.3 here).

import { test, expect } from '../fixtures/fixtures';
import { writeFileSync, existsSync, unlinkSync, mkdirSync, rmSync } from 'fs';
import path from 'path';

test.describe('Part 1 — Web Scraping Fundamentals (formerly M55)', () => {

  // Test 1: Extract text content from multiple elements
  // page.evaluate() runs JavaScript inside the browser and returns JSON.
  test('extract all task card titles with page.evaluate()', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for task cards to render before evaluating.
    // TODO 1.1: Wait for the selector '[data-testid="task-card"]' before extracting.
    // Why? evaluate() runs immediately — if called before cards render, it returns an empty array.
    await page.waitForSelector(/* TODO 1.1: '[data-testid="task-card"]' */ 'body', { state: 'visible' }).catch(() => {});

    // TODO 1.2: Use page.evaluate() to extract an array of title strings.
    // Select all '[data-testid="task-card"] h3' elements and map to textContent.trim().
    // Why? One evaluate() call batching N DOM queries is far faster than N locator.textContent() calls.
    const titles = await page.evaluate(/* TODO 1.2: () =>
      Array.from(document.querySelectorAll('[data-testid="task-card"] h3'))
        .map(el => el.textContent?.trim() ?? '')
    */ () => []);

    expect(Array.isArray(titles)).toBe(true);
  });

  // Test 2: Extract structured data objects
  // evaluate() can return complex objects, not just strings.
  test('extract structured task data from the board', async ({ page }) => {
    await page.goto('/dashboard');

    // TODO 1.3: Use page.evaluate() to return an array of objects, each with:
    //   { title: string, priority: string }
    // Hint: data-priority is a dataset attribute on task card elements.
    const tasks = await page.evaluate(/* TODO 1.3: () =>
      Array.from(document.querySelectorAll('[data-testid="task-card"]')).map(card => ({
        title: card.querySelector('h3')?.textContent?.trim() ?? '',
        priority: (card as HTMLElement).dataset.priority ?? 'none',
      }))
    */ () => []);

    // TODO 1.4: Assert that tasks is an Array.
    expect(Array.isArray(/* TODO 1.4: tasks */)).toBe(true);
  });

  // Test 3: Pass arguments into page.evaluate()
  // evaluate() can receive arguments from Node.js — pass a selector or config.
  test('evaluate() accepts arguments from Node.js', async ({ page }) => {
    await page.goto('/dashboard');

    const selector = '[data-testid="task-card"]';

    // TODO 1.5: Use page.evaluate() with a second argument to pass 'selector' into the browser.
    // Signature: page.evaluate((selector) => document.querySelectorAll(selector).length, selector)
    // Why? Passing data in avoids hardcoding values inside the evaluate() callback —
    // the callback is transferred as a string to the browser, so closure variables don't transfer.
    const count = await page.evaluate(/* TODO 1.5: (sel) => document.querySelectorAll(sel).length, selector */ () => 0);

    expect(typeof count).toBe('number');
  });

  // Test 4: page.exposeFunction() — Node.js in the browser
  // Exposes a Node.js function so browser JavaScript can call it.
  test('exposeFunction gives browser access to Node.js', async ({ page }) => {
    const collected: string[] = [];

    // TODO 1.6: Use page.exposeFunction() to expose a function named 'collectItem'
    // that pushes its argument into the collected array.
    // Why? exposeFunction() bridges the browser/Node.js boundary —
    // browser code calls collectItem(), Node.js receives the call synchronously.
    await page.exposeFunction(/* TODO 1.6: 'collectItem', (item: string) => { collected.push(item); } */);

    await page.goto('/dashboard');

    // TODO 1.7: Use page.evaluate() to call window.collectItem('test-item').
    await page.evaluate(/* TODO 1.7: () => (window as any).collectItem('test-item') */);

    // TODO 1.8: Assert that collected contains 'test-item'.
    expect(collected).toContain(/* TODO 1.8: 'test-item' */);
  });

  // Test 5: Wait for dynamic content before extracting
  // SPAs render content after JavaScript runs — evaluate() must come after.
  test('waitForSelector before evaluate prevents empty results', async ({ page }) => {
    await page.goto('/dashboard');

    // The correct order: wait → evaluate.
    // Never evaluate() immediately after goto() without waiting.

    // TODO 1.9: Assert that page.waitForSelector is a function.
    // Why? This confirms the API exists — the concept is more important than the assertion here.
    expect(typeof page.waitForSelector).toBe(/* TODO 1.9: 'function' */);
  });

  // Test 6: Column-level scraping — scoped extraction
  test('extract tasks from a specific column only', async ({ page }) => {
    await page.goto('/dashboard');

    // TODO 1.10: Use page.evaluate() to extract task titles from ONLY the 'To Do' column.
    // Hint: scope the querySelectorAll to '[data-column="todo"] [data-testid="task-card"] h3'
    const todoTitles = await page.evaluate(/* TODO 1.10: () =>
      Array.from(document.querySelectorAll('[data-column="todo"] [data-testid="task-card"] h3'))
        .map(el => el.textContent?.trim() ?? '')
    */ () => []);

    expect(Array.isArray(todoTitles)).toBe(true);
  });

});

test.describe('Part 2 — Advanced Scraping & Data Extraction (formerly M56)', () => {

  // Test 1: Authenticated scraping — session persists after login
  test('session state enables scraping protected endpoints', async ({ page }) => {
    // Log in first, then navigate to protected data.
    await page.goto('/dashboard');

    // After login, the session cookie persists for the browser context's lifetime.
    // TODO 2.1: Assert that the current URL contains '/dashboard'.
    // Why? This confirms the authenticated session is active before scraping begins —
    // if the login failed, the scraper would collect login page HTML instead of data.
    await expect(page).toHaveURL(/* TODO 2.1: /\/dashboard/ */);
  });

  // Test 2: storageState restores auth without UI login
  test('storageState allows reusing a saved auth session', async ({}) => {
    // Pattern for restoring auth state:
    //   const context = await browser.newContext({ storageState: 'auth.json' });
    //
    // Save the auth state once:
    //   await context.storageState({ path: 'auth.json' });
    //
    // The scraped session survives process restarts — no UI login needed.

    // TODO 2.2: What option key passes a saved auth state to newContext()?
    const authStateOption = /* TODO 2.2: 'storageState' */ '';
    expect(authStateOption).toBe('storageState');
  });

  // Test 3: Infinite scroll termination condition
  test('infinite scroll stops when no new content loads', async ({ page }) => {
    await page.goto('/dashboard');

    // Scroll loop pattern:
    //   let previousHeight = 0;
    //   while (true) {
    //     const currentHeight = await page.evaluate(() => document.body.scrollHeight);
    //     if (currentHeight === previousHeight) break;
    //     previousHeight = currentHeight;
    //     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    //     await page.waitForTimeout(800);
    //   }

    // TODO 2.3: What property detects whether new content loaded after scrolling?
    // Hint: comparing this value before and after scroll reveals whether content added.
    const scrollHeightProperty = /* TODO 2.3: 'scrollHeight' */ '';
    expect(scrollHeightProperty).toBe('scrollHeight');
  });

  // Test 4: Save extracted data to a CSV file
  test('write extracted data to CSV', async ({ page }) => {
    await page.goto('/dashboard');

    // Simulate extracted data (in a real scraper, this comes from evaluate()).
    const tasks = [
      { title: 'Fix login bug', priority: 'high', column: 'todo' },
      { title: 'Write docs', priority: 'medium', column: 'todo' },
    ];

    const outputPath = path.join(__dirname, 'scraped-tasks.csv');

    // TODO 2.4: Build a CSV string with a header row and one row per task.
    // Format: title,priority,column
    const header = 'title,priority,column';
    const rows = tasks.map(t => `${t.title},${t.priority},${t.column}`);
    const csvContent = /* TODO 2.4: [header, ...rows].join('\n') */ '';

    writeFileSync(outputPath, csvContent);

    // TODO 2.5: Assert that the output file exists.
    expect(existsSync(/* TODO 2.5: outputPath */)).toBe(true);

    // Cleanup
    if (existsSync(outputPath)) unlinkSync(outputPath);
  });

  // Test 5: Rate limiting — delay between page loads
  test('rate limiting prevents server overload', async ({ page }) => {
    await page.goto('/dashboard');

    // In a real scraper, add a delay between requests:
    //   await page.waitForTimeout(500 + Math.random() * 1000);
    //
    // This randomizes the delay between 500ms and 1500ms, mimicking human behavior.

    // TODO 2.6: What method adds a delay in Playwright?
    // Hint: it's appropriate for scraping but not for testing (too slow).
    const delayMethod = /* TODO 2.6: 'waitForTimeout' */ '';
    expect(delayMethod).toBe('waitForTimeout');
  });

  // Test 6: Evaluate returns JSON-serializable data only
  test('evaluate cannot return DOM nodes', async ({ page }) => {
    await page.goto('/dashboard');

    // DOM nodes cannot cross the browser/Node.js boundary.
    // This returns null instead of the element:
    //   const el = await page.evaluate(() => document.querySelector('h1'));
    //   // el === null

    // Correct: extract serializable data from the element.
    const headingText = await page.evaluate(
      () => document.querySelector('h1')?.textContent ?? null
    );

    // TODO 2.7: Assert that headingText is either a string or null (JSON-serializable).
    expect(['string', 'object'].includes(typeof /* TODO 2.7: headingText */ '')).toBe(true);
  });

});

test.describe('Part 3 — Web Crawling & Link Monitoring (formerly M57)', () => {

  // Test 1: Collect links from a page
  test('extract all internal links from a page', async ({ page }) => {
    await page.goto('/dashboard');

    // TODO 3.1: Use page.evaluate() to extract all href values from anchor tags
    // that start with the current page's origin (window.location.origin).
    const links = await page.evaluate(/* TODO 3.1: () =>
      Array.from(document.querySelectorAll('a[href]'))
        .map(a => (a as HTMLAnchorElement).href)
        .filter(href => href.startsWith(window.location.origin))
    */ () => []);

    // TODO 3.2: Assert that links is an Array.
    expect(Array.isArray(/* TODO 3.2: links */)).toBe(true);
  });

  // Test 2: Detect 404 responses via response status
  test('page.goto returns response with status()', async ({ page }) => {
    await page.goto('/dashboard');

    // TODO 3.3: Assert that response is not null and status() is 200.
    // Why? response.status() is how you detect broken links during a crawl.
    const response = await page.goto('/dashboard');
    expect(response?.status()).toBe(/* TODO 3.3: 200 */);
  });

  // Test 3: Build a minimal site map
  test('crawl builds a site map from visited URLs', async ({ page }) => {
    const visited = new Set<string>();
    const siteMap: { url: string; status: number }[] = [];

    // Start with the dashboard.
    const startUrl = page.url().replace(/\/$/, '') || 'http://localhost:3000';

    await page.goto('/dashboard');
    const response = await page.goto('/dashboard');

    visited.add('/dashboard');
    siteMap.push({
      url: '/dashboard',
      status: response?.status() ?? 0,
    });

    // TODO 3.4: Assert that siteMap has at least one entry.
    // Why? The site map should grow as the crawl visits each URL —
    // confirming the first entry exists validates the accumulation pattern.
    expect(siteMap.length).toBeGreaterThan(/* TODO 3.4: 0 */);
  });

  // Test 4: Depth limiting prevents infinite crawl
  test('depth limiting stops crawl at a maximum hops', async ({}) => {
    const MAX_DEPTH = 3;
    const queue: { url: string; depth: number }[] = [
      { url: '/dashboard', depth: 0 },
      { url: '/settings', depth: 1 },
      { url: '/settings/billing', depth: 2 },
      { url: '/settings/billing/details', depth: 3 },
      { url: '/settings/billing/details/extra', depth: 4 }, // exceeds MAX_DEPTH
    ];

    // TODO 3.5: Filter queue to only entries with depth <= MAX_DEPTH.
    const crawlable = queue.filter(item => item.depth /* TODO 3.5: <= MAX_DEPTH */);

    // TODO 3.6: Assert that crawlable has length 4 (depth 0,1,2,3 included; 4 excluded).
    expect(crawlable.length).toBe(/* TODO 3.6: 4 */);
  });

  // Test 5: Domain filtering keeps crawl in-scope
  test('only same-origin links are queued', async ({ page }) => {
    await page.goto('/dashboard');
    const origin = new URL(page.url()).origin;

    const allLinks = [
      `${origin}/dashboard`,
      `${origin}/settings`,
      'https://external-site.com/page',
      'https://another-external.io',
    ];

    // TODO 3.7: Filter allLinks to only those that start with origin.
    const internalLinks = allLinks.filter(link => link/* TODO 3.7: .startsWith(origin) */);

    // TODO 3.8: Assert that internalLinks has length 2 (only the same-origin ones).
    expect(internalLinks.length).toBe(/* TODO 3.8: 2 */);
  });

  // Test 6: 404 detection accumulates broken links
  test('broken link detection accumulates 404 URLs', async ({}) => {
    const brokenLinks: string[] = [];

    // Simulate crawl results (in a real crawl, these come from response.status()).
    const crawlResults = [
      { url: '/dashboard', status: 200 },
      { url: '/settings', status: 200 },
      { url: '/missing-page', status: 404 },
      { url: '/another-missing', status: 404 },
    ];

    // TODO 3.9: Filter crawlResults to entries with status 404 and push their URLs into brokenLinks.
    for (const result of crawlResults) {
      if (result.status === /* TODO 3.9: 404 */ -1) {
        brokenLinks.push(result.url);
      }
    }

    // TODO 3.10: Assert that brokenLinks has length 2.
    expect(brokenLinks.length).toBe(/* TODO 3.10: 2 */);
  });

});

// Inline data simulating a CSV import.
// In a real bot: const tasks = parse(readFileSync('tasks.csv'), { columns: true });
const taskRows = [
  { title: 'Bot task 1', priority: 'high' },
  { title: 'Bot task 2', priority: 'medium' },
  { title: 'Bot task 3', priority: 'low' },
];

test.describe('Part 4 — Automated Form Filling & Bots (formerly M58)', () => {

  // Test 1: Submit a single form from data
  test('fill and submit one form row', async ({ page }) => {
    const task = taskRows[0];
    await page.goto('/dashboard');

    await page.getByRole('button', { name: 'Add task' }).first().click();

    // TODO 4.1: Fill the task title input with task.title.
    await page.getByTestId('task-title-input').fill(/* TODO 4.1: task.title */);

    await page.getByTestId('task-submit').click();

    // TODO 4.2: Assert that the dialog is no longer visible after submission.
    await expect(page.getByRole('dialog'))./* TODO 4.2: not.toBeVisible() */ toBeAttached();
  });

  // Test 2: Iterate over all rows — data-driven bot loop
  test('submit all task rows in a loop', async ({ page }) => {
    const submitted: string[] = [];

    for (const task of taskRows) {
      await page.goto('/dashboard');
      await page.getByRole('button', { name: 'Add task' }).first().click();
      await page.getByTestId('task-title-input').fill(task.title);
      await page.getByTestId('task-submit').click();
      await expect(page.getByRole('dialog')).not.toBeVisible();
      submitted.push(task.title);
    }

    // TODO 4.3: Assert that submitted has the same length as taskRows.
    // Why? Every row should produce one successful submission — if lengths differ,
    // a submission silently failed.
    expect(submitted).toHaveLength(/* TODO 4.3: taskRows.length */);
  });

  // Test 3: Dynamic fields — check visibility before interacting
  test('conditional field interaction', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Add task' }).first().click();

    // TODO 4.4: Check if a 'due-date-input' test ID is visible before filling it.
    // Pattern: if (await locator.isVisible()) { await locator.fill(...); }
    // Why? Dynamic fields that aren't present crash with locator.fill() —
    // isVisible() makes the interaction conditional and safe.
    const dueDateInput = page.getByTestId('due-date-input');
    if (await dueDateInput/* TODO 4.4: .isVisible() */) {
      await dueDateInput.fill('2024-12-31');
    }

    // The dialog is still open (no required fields filled or conditional field absent).
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
  });

  // Test 4: Error handling — continue on per-row failure
  test('bot continues when one row fails', async ({ page }) => {
    const errors: string[] = [];
    const succeeded: string[] = [];

    const rowsWithBadRow = [
      { title: 'Good task 1', shouldFail: false },
      { title: '',            shouldFail: true  }, // empty title will be rejected
      { title: 'Good task 2', shouldFail: false },
    ];

    for (const row of rowsWithBadRow) {
      try {
        await page.goto('/dashboard');
        await page.getByRole('button', { name: 'Add task' }).first().click();
        await page.getByTestId('task-title-input').fill(row.title);
        await page.getByTestId('task-submit').click();

        // For bad rows, dialog stays open — treat persistence as "failure".
        const dialogStillOpen = await page.getByRole('dialog').isVisible();
        if (dialogStillOpen) {
          throw new Error(`Submission rejected for title: "${row.title}"`);
        }
        succeeded.push(row.title);
      } catch (err) {
        errors.push(String(err));
        // Close dialog before next row.
        await page.keyboard.press('Escape').catch(() => {});
      }
    }

    // TODO 4.5: Assert that errors has length 1 (only the empty-title row failed).
    expect(errors.length).toBe(/* TODO 4.5: 1 */);

    // TODO 4.6: Assert that succeeded has length 2.
    expect(succeeded.length).toBe(/* TODO 4.6: 2 */);
  });

  // Test 5: Rate limiting between submissions
  test('understands rate limiting in bots', async ({}) => {
    // Rate limiting in bots: add a delay between submissions.
    // In a real bot:
    //   await page.waitForTimeout(300 + Math.random() * 200);

    // TODO 4.7: What is the minimum recommended delay (in ms) between form submissions?
    // Set to 300 — a reasonable baseline that avoids triggering most rate limiters.
    const minDelayMs = /* TODO 4.7: 300 */ 0;
    expect(minDelayMs).toBeGreaterThan(0);
  });

});

const DEMO_DIR = path.join(__dirname, 'demo-output');

test.describe('Part 5 — Screenshot & Demo Generation (formerly M59)', () => {

  test.beforeAll(() => {
    if (!existsSync(DEMO_DIR)) mkdirSync(DEMO_DIR, { recursive: true });
  });

  test.afterAll(() => {
    if (existsSync(DEMO_DIR)) rmSync(DEMO_DIR, { recursive: true });
  });

  // Test 1: Capture a step screenshot with sequential naming
  test('capture numbered step screenshots', async ({ page }) => {
    let step = 0;
    const capture = async (label: string) => {
      // TODO 5.1: Use page.screenshot() with path set to:
      //   `${DEMO_DIR}/step-${String(++step).padStart(2, '0')}-${label}.png`
      // Why? padStart(2, '0') zero-pads so '01' sorts before '10' in file explorers.
      await page.screenshot({
        path: /* TODO 5.1: `${DEMO_DIR}/step-${String(++step).padStart(2, '0')}-${label}.png` */ `${DEMO_DIR}/step.png`,
      });
    };

    await page.goto('/dashboard');
    await capture('dashboard');

    await page.getByRole('button', { name: 'Add task' }).first().click();
    await capture('dialog-open');

    await page.getByTestId('task-title-input').fill('Launch new feature');
    await capture('title-filled');

    // TODO 5.2: Assert that step equals 3 (three screenshots captured).
    expect(step).toBe(/* TODO 5.2: 3 */);
  });

  // Test 2: fullPage screenshot captures beyond the viewport
  test('fullPage option captures the complete scrollable page', async ({ page }) => {
    await page.goto('/dashboard');

    const screenshotPath = path.join(DEMO_DIR, 'full-page.png');

    // TODO 5.3: Take a full-page screenshot using { fullPage: true }.
    // Why? fullPage captures content below the fold — essential for long dashboard views.
    await page.screenshot({
      path: screenshotPath,
      fullPage: /* TODO 5.3: true */ false,
    });

    expect(existsSync(screenshotPath)).toBe(true);
  });

  // Test 3: Mask sensitive content in demo screenshots
  test('mask option obscures sensitive areas', async ({ page }) => {
    await page.goto('/dashboard');

    const screenshotPath = path.join(DEMO_DIR, 'masked.png');

    // TODO 5.4: Take a screenshot with the user avatar masked.
    // Use { mask: [page.getByTestId('user-avatar')] }
    // Why? Masking obscures test credentials or PII that would appear in a public demo.
    await page.screenshot({
      path: screenshotPath,
      mask: /* TODO 5.4: [page.getByTestId('user-avatar')] */ [],
    });

    expect(existsSync(screenshotPath)).toBe(true);
  });

  // Test 4: Video recording is configured at context level
  test('video recording option is understood', async ({}) => {
    // Video recording is configured when creating a context:
    //   const context = await browser.newContext({
    //     recordVideo: {
    //       dir: 'demo-videos/',
    //       size: { width: 1280, height: 720 },
    //     },
    //   });
    //
    // The video file appears in the dir after context.close().
    // Add slowMo for readable video: newContext({ ..., slowMo: 500 })

    // TODO 5.5: What option key on newContext() enables video recording?
    const videoOption = /* TODO 5.5: 'recordVideo' */ '';
    expect(videoOption).toBe('recordVideo');
  });

  // Test 5: slowMo paces interactions for readable video
  test('slowMo delays all actions for demo-quality video', async ({}) => {
    // slowMo is a launch or context option:
    //   await browser.newContext({ slowMo: 500 }); // 500ms between each action

    // TODO 5.6: What is the recommended slowMo value (in ms) for a demo video?
    const slowMoMs = /* TODO 5.6: 500 */ 0;
    expect(slowMoMs).toBeGreaterThan(0);
  });

  // Test 6: Demo script uses waitForLoadState instead of assertions
  test('demo scripts use waitForLoadState for stability', async ({ page }) => {
    // In a test: await expect(page).toHaveURL('/dashboard');
    // In a demo script: await page.waitForLoadState('networkidle');
    //
    // Assertions stop the demo on failure. waitForLoadState waits
    // for the page to stabilize without requiring a specific outcome.

    await page.goto('/dashboard');

    // TODO 5.7: Assert that page.waitForLoadState is a function.
    expect(typeof /* TODO 5.7: page.waitForLoadState */).toBe('function');
  });

});
