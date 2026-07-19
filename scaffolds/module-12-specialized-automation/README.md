# Lesson 12: Specialized Automation: Scraping, Crawling & Bots

*Combines former modules M55–M59.*

## Learning Objectives

### Part 1 — Web Scraping Fundamentals (formerly M55)

- Use `page.evaluate()` to run JavaScript inside the browser and return structured data to Node.js
- Extract structured data (names, descriptions, counts) from a real page into a JSON-serializable object
- Handle dynamic content that renders after initial page load
- Apply `page.exposeFunction()` to give browser-side JavaScript access to Node.js functions

### Part 2 — Advanced Scraping & Data Extraction (formerly M56)

- Scrape data behind authentication by navigating the login flow before extraction
- Handle infinite scroll by scrolling to the bottom and waiting for new content to load
- Save extracted data to a CSV file from Node.js
- Apply rate limiting and delays between page loads to avoid overloading the server

### Part 3 — Web Crawling & Link Monitoring (formerly M57)

- Crawl all pages in a site by following links recursively from a starting URL
- Detect 404 responses by monitoring network responses during crawl
- Build a site map JSON from discovered URLs
- Apply crawl depth limiting to prevent runaway recursion

### Part 4 — Automated Form Filling & Bots (formerly M58)

- Read task data from a CSV file and automate form submission for each row
- Handle dynamic form fields that appear based on prior selections
- Understand responsible bot patterns: rate limiting, user-agent disclosure, CAPTCHA strategy in test environments
- Distinguish between legitimate automation (your own app, test data) and prohibited automation (bypassing access controls)

### Part 5 — Screenshot & Demo Generation (formerly M59)

- Script a Playwright flow that captures per-step screenshots for a product walkthrough
- Record a video of a scripted browser interaction using Playwright's built-in video recording
- Understand Playwright as a visual documentation and demo generation tool
- Assemble a demo walkthrough from sequentially named screenshots

## Concept

### Part 1 — Web Scraping Fundamentals (formerly M55)

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

### Part 2 — Advanced Scraping & Data Extraction (formerly M56)

The fundamentals of scraping (Part 1 of this lesson (formerly M55)) work for anonymous, paginated pages with predictable structure. Advanced scraping adds three complications: authentication gates the data, infinite scroll replaces pagination, and the volume of data requires structured file output rather than in-memory arrays.

**Scraping behind authentication.** Playwright's browser maintains session state exactly like a real browser. Log in through the normal UI flow (or restore `storageState` from a saved auth file), and the session persists for every subsequent navigation. The scraper sees exactly what a logged-in user sees:

```typescript
await page.goto('/login');
await page.getByLabel('Email').fill(process.env.SCRAPER_EMAIL!);
await page.getByLabel('Password').fill(process.env.SCRAPER_PASSWORD!);
await page.getByRole('button', { name: 'Sign in' }).click();
await page.waitForURL('/dashboard');
// Session is now active — navigate to any protected endpoint
await page.goto('/admin/users');
```

Alternatively, restore a pre-saved auth state to skip the login UI:

```typescript
const context = await browser.newContext({ storageState: 'auth.json' });
```

**Infinite scroll.** Infinite-scroll pages load more content as the user scrolls toward the bottom. The pattern: scroll to the bottom, wait for new content to appear (network request completes or DOM updates), scroll again, repeat until no new content appears:

```typescript
let previousHeight = 0;
while (true) {
  const currentHeight = await page.evaluate(() => document.body.scrollHeight);
  if (currentHeight === previousHeight) break; // No new content loaded
  previousHeight = currentHeight;
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000); // Wait for content to load after scroll
}
const allItems = await page.evaluate(() => /* extract everything */);
```

The termination condition — `currentHeight === previousHeight` — detects when scrolling produced no new content.

**Saving to CSV.** For datasets consumed by spreadsheets or data pipelines, CSV is the standard format. Node.js has no built-in CSV writer, but producing CSV manually is straightforward for simple structures:

```typescript
import { writeFileSync } from 'fs';

const header = ['title', 'priority', 'column'];
const rows = tasks.map(t => [t.title, t.priority, t.column].join(','));
writeFileSync('tasks.csv', [header.join(','), ...rows].join('\n'));
```

For production use, the `csv-stringify` or `papaparse` libraries handle edge cases (commas in values, newlines in text, UTF-8 BOM for Excel compatibility).

**Rate limiting.** Scraping too fast can trigger rate limits, IP bans, or degrade the server for real users. Add a delay between page loads:

```typescript
await page.waitForTimeout(500 + Math.random() * 1000); // 0.5–1.5 second jitter
```

The random jitter prevents a perfectly regular pattern that looks more bot-like than human variation. For serious scraping infrastructure, use Playwright's `slowMo` option at the context level.

**Anti-scraping patterns.** Some sites detect and block automated browsers through: fingerprinting (checking for headless browser signals), CAPTCHAs (on login or after N requests), and IP rate limiting. Playwright's default configuration mimics a real browser convincingly — but test environment detection, CAPTCHA, and IP limiting require separate strategies. For Lumio's test environment, anti-scraping is disabled — don't attempt to bypass production-grade anti-scraping on real sites without authorization.

### Part 3 — Web Crawling & Link Monitoring (formerly M57)

Web scraping extracts data from known pages. Web crawling discovers pages by following links — starting from one URL and recursively visiting every link found. The output is a set of discovered URLs (a site map) and information about each (status code, title, links found). Playwright is well-suited to crawling because it runs a real browser that handles redirects, JavaScript-rendered navigation menus, and Single Page App routing.

**The crawl loop.** The basic crawl algorithm: start with a set containing the seed URL, pop one URL, navigate to it, collect all links on the page, add unseen links to the queue, repeat:

```typescript
const visited = new Set<string>();
const queue = [startUrl];
const siteMap: { url: string; status: number; links: string[] }[] = [];

while (queue.length > 0) {
  const url = queue.shift()!;
  if (visited.has(url)) continue;
  visited.add(url);

  const response = await page.goto(url);
  const status = response?.status() ?? 0;
  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href]'))
      .map(a => (a as HTMLAnchorElement).href)
      .filter(href => href.startsWith(window.location.origin))
  );

  siteMap.push({ url, status, links });
  for (const link of links) {
    if (!visited.has(link)) queue.push(link);
  }
}
```

**404 detection.** The `response` object returned by `page.goto()` has a `status()` method. Any link returning 404 is a broken link. Collect them:

```typescript
if (status === 404) {
  brokenLinks.push(url);
}
```

**Crawl depth limiting.** Without limiting, a crawler follows links indefinitely. Set a maximum depth by tracking how many hops from the seed URL each link is:

```typescript
const queue: { url: string; depth: number }[] = [{ url: startUrl, depth: 0 }];
const MAX_DEPTH = 3;

while (queue.length > 0) {
  const { url, depth } = queue.shift()!;
  if (depth > MAX_DEPTH) continue;
  // ... crawl ...
  for (const link of links) {
    queue.push({ url: link, depth: depth + 1 });
  }
}
```

**Domain filtering.** A crawler must stay within the target domain — following external links would crawl the entire web. Filter links to the same origin before adding to the queue (as shown in the `evaluate()` filter above).

**`robots.txt` awareness.** The `robots.txt` file at the root of every domain declares which paths crawlers should not visit. For non-test sites, parse `robots.txt` before crawling and skip disallowed paths. For Lumio's test environment, `robots.txt` is relaxed.

**Performance.** A single-page crawler (one request at a time) is slow for large sites. Parallelizing across multiple pages or browser contexts speeds it up significantly, but requires careful queue management to avoid duplicate visits.

### Part 4 — Automated Form Filling & Bots (formerly M58)

A bot is a script that automates a human interaction repeatedly — filling forms, clicking buttons, submitting data. Playwright is an excellent bot platform because it drives a real browser, handles JavaScript-rendered forms, manages session state, and supports complex interaction patterns. The ethical considerations depend entirely on authorization: automating your own system or a test environment is legitimate; automating another system without permission is not.

**Data-driven form automation.** The pattern: read a data source (CSV, JSON, database), open the form, fill fields from the current row, submit, verify success, repeat:

```typescript
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

const tasks = parse(readFileSync('tasks.csv'), { columns: true });

for (const task of tasks) {
  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Add task' }).first().click();
  await page.getByTestId('task-title-input').fill(task.title);
  await page.getByTestId('task-submit').click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
}
```

**Dynamic form fields.** Some form fields only appear after prior selections. A form that shows a "due date" field only when "high priority" is selected requires checking for the field's existence before interacting:

```typescript
await page.getByLabel('Priority').selectOption('high');
const dueDateField = page.getByLabel('Due date');
if (await dueDateField.isVisible()) {
  await dueDateField.fill('2024-12-31');
}
```

This conditional interaction pattern is safer than hardcoding — it handles both form variants without branching test logic for each.

**CAPTCHA strategy.** Test environments should have CAPTCHAs disabled. If they aren't, the responsible approach is: request a test-environment flag from the team that disables CAPTCHA for known test user agents or IP ranges. Never attempt to solve or bypass CAPTCHAs on production systems — this violates terms of service and anti-bot protections designed to protect real users. For Lumio's test environment, CAPTCHA is not present.

**Rate limiting in bots.** Unlike scraping (where rate limiting protects the server), bot rate limiting also protects data integrity — submitting 100 forms simultaneously may trigger duplicate detection, database constraints, or server-side throttling. Add delays between submissions:

```typescript
for (const task of tasks) {
  await fillAndSubmitTask(page, task);
  await page.waitForTimeout(300); // 300ms between submissions
}
```

**User-agent disclosure.** For internal automation, set a descriptive user agent so logs identify your bot: `context.setExtraHTTPHeaders({ 'X-Bot-Source': 'lumio-task-importer' })`. This helps operations teams distinguish automated traffic from real user traffic in logs.

**Error handling in bots.** Unlike tests (where a single failure stops the suite), bots should continue processing remaining rows after a failure on one row. Wrap each iteration in a try/catch, log errors, and continue:

```typescript
const errors: string[] = [];
for (const task of tasks) {
  try {
    await fillAndSubmitTask(page, task);
  } catch (err) {
    errors.push(`Failed: ${task.title} — ${err}`);
  }
}
console.error('Bot errors:', errors);
```

### Part 5 — Screenshot & Demo Generation (formerly M59)

Playwright is typically used to verify that software works. But the same browser automation that drives tests can drive demo recordings — scripted flows that produce screenshots and videos for product documentation, marketing materials, and onboarding content. The key difference from testing: the goal is producing a compelling visual artifact, not asserting a boolean result.

**Per-step screenshots.** The pattern: perform an action, take a screenshot, name it sequentially, repeat. The sequential naming produces a folder of images that assembles into a slideshow or animated GIF:

```typescript
let step = 0;
const capture = async (label: string) => {
  await page.screenshot({ path: `demo/step-${String(++step).padStart(2, '0')}-${label}.png` });
};

await page.goto('/dashboard');
await capture('dashboard-initial');

await page.getByRole('button', { name: 'Add task' }).first().click();
await capture('add-task-dialog-open');

await page.getByTestId('task-title-input').fill('Launch new feature');
await capture('task-title-filled');
```

The `padStart(2, '0')` zero-pads the step number so `01`, `02`, `10` sort correctly in file explorers.

**Video recording.** Playwright records video at the browser context level. Configure it in `newContext()`:

```typescript
const context = await browser.newContext({
  recordVideo: {
    dir: 'demo-videos/',
    size: { width: 1280, height: 720 },
  },
});
```

After the context closes, the video file appears in `demo-videos/`. The video captures everything that happens in the browser — use `slowMo` to slow down interactions for readability:

```typescript
const context = await browser.newContext({
  recordVideo: { dir: 'demo-videos/' },
  slowMo: 500, // 500ms delay between each Playwright action
});
```

**Playwright as a documentation tool.** Every module of this curriculum was designed partly with this use case in mind. A product that releases a new feature can use Playwright to: automatically generate onboarding screenshots when the feature is deployed, record a 60-second demo video of the feature's happy path, regenerate both when the UI changes. The screenshots are always accurate because they're produced from the live app, not hand-crafted in design tools.

**`page.screenshot()` options.** The screenshot API has options that matter for demo generation:
- `{ fullPage: true }` — captures the full scrollable page, not just the viewport
- `{ clip: { x, y, width, height } }` — captures a specific region (useful for highlighting one component)
- `{ mask: [locator] }` — masks sensitive areas with a colored box (useful for obscuring test credentials in demo screenshots)
- `{ animations: 'disabled' }` — disables CSS animations for cleaner, consistent screenshots

**Scripting for demos vs. scripting for tests.** Demo scripts don't need assertions — a failed assertion stops the flow before the demo completes. Instead, use `await page.waitForLoadState('networkidle')` to ensure the page is stable before capturing. Demo scripts also benefit from explicit `waitForSelector()` calls to ensure elements are visible before capturing.

## Lumio Context

See [lumio-context.md](./lumio-context.md).

## Step-by-Step Tasks

### Part 1 — Web Scraping Fundamentals

Complete each TODO in `exercise.spec.ts` in order.

Validate this part only:
```bash
npx playwright test tests/module-12-specialized-automation -g "Part 1 — Web Scraping Fundamentals (formerly M55)"
```

### Part 2 — Advanced Scraping & Data Extraction

Validate this part only:
```bash
npx playwright test tests/module-12-specialized-automation -g "Part 2 — Advanced Scraping & Data Extraction (formerly M56)"
```

### Part 3 — Web Crawling & Link Monitoring

Validate this part only:
```bash
npx playwright test tests/module-12-specialized-automation -g "Part 3 — Web Crawling & Link Monitoring (formerly M57)"
```

### Part 4 — Automated Form Filling & Bots

Validate this part only:
```bash
npx playwright test tests/module-12-specialized-automation -g "Part 4 — Automated Form Filling & Bots (formerly M58)"
```

### Part 5 — Screenshot & Demo Generation

Validate this part only:
```bash
npx playwright test tests/module-12-specialized-automation -g "Part 5 — Screenshot & Demo Generation (formerly M59)"
```

## Validate (full lesson)

```bash
npx playwright test tests/module-12-specialized-automation
```

## Key Takeaways

### Part 1 — Web Scraping Fundamentals

1. `page.evaluate()` runs JavaScript in the browser and returns JSON-serializable results to Node.js.
2. Batch DOM queries inside a single `evaluate()` — it's faster than N individual locator calls.
3. Wait for dynamic content before calling `evaluate()` — never use hard sleeps.
4. Pagination scraping: extract → find next → click → wait → repeat.
5. `page.exposeFunction()` gives browser JavaScript access to Node.js APIs (file system, external requests).

### Part 2 — Advanced Scraping & Data Extraction

1. Authenticated scraping uses the same login flow as testing — the browser maintains session state.
2. Infinite scroll: scroll to bottom → wait for new content → repeat until no change.
3. CSV output: header row + data rows, values joined with commas, written with `fs.writeFileSync`.
4. Add random delays between requests to avoid rate limits and mimic human behavior.
5. Restore `storageState` to skip the login UI when scraping the same account repeatedly.

### Part 3 — Web Crawling & Link Monitoring

1. The crawl loop: pop URL from queue → navigate → collect links → add new links → repeat.
2. Monitor `response.status()` during crawl to detect 404s without a separate check.
3. Filter links to the same origin before queuing — don't crawl external domains.
4. Depth limiting prevents runaway recursion on large sites.
5. Build a site map JSON as a side effect of crawling — it's the natural output.

### Part 4 — Automated Form Filling & Bots

1. Data-driven bots read from CSV/JSON and submit one row per form iteration.
2. Dynamic fields require conditional interaction — check `isVisible()` before filling.
3. CAPTCHA: disable in test environments; never bypass on production systems.
4. Rate limit between submissions to avoid server-side throttling and data integrity issues.
5. Bots should continue on error — log failures and process remaining rows.

### Part 5 — Screenshot & Demo Generation

1. Per-step screenshots use sequential naming (`01-step`, `02-step`) for correct sort order.
2. Video recording is configured on `browser.newContext()` with `recordVideo: { dir }`.
3. `slowMo` on the context slows all interactions for more readable video output.
4. `page.screenshot({ mask: [locator] })` obscures sensitive content in demo screenshots.
5. Demo scripts omit assertions — use `waitForLoadState` and `waitForSelector` for stability instead.

## Going Deeper

### Part 1 — Web Scraping Fundamentals

- [Playwright docs: page.evaluate()](https://playwright.dev/docs/api/class-page#page-evaluate)
- [Playwright docs: page.exposeFunction()](https://playwright.dev/docs/api/class-page#page-expose-function)
- [Playwright docs: Scraping](https://playwright.dev/docs/library#evaluate-javascript)

### Part 2 — Advanced Scraping & Data Extraction

- [Playwright docs: storageState](https://playwright.dev/docs/auth#reusing-signed-in-state)
- [Playwright docs: page.evaluate()](https://playwright.dev/docs/api/class-page#page-evaluate)
- [csv-stringify library](https://csv.js.org/stringify/)

### Part 3 — Web Crawling & Link Monitoring

- [Playwright docs: response.status()](https://playwright.dev/docs/api/class-response#response-status)
- [Playwright docs: page.goto()](https://playwright.dev/docs/api/class-page#page-goto)
- [robots.txt specification](https://developers.google.com/search/docs/crawling-indexing/robots/intro)

### Part 4 — Automated Form Filling & Bots

- [Playwright docs: locator.isVisible()](https://playwright.dev/docs/api/class-locator#locator-is-visible)
- [csv-parse library](https://csv.js.org/parse/)
- [Playwright docs: context.setExtraHTTPHeaders()](https://playwright.dev/docs/api/class-browsercontext#browser-context-set-extra-http-headers)

### Part 5 — Screenshot & Demo Generation

- [Playwright docs: page.screenshot()](https://playwright.dev/docs/api/class-page#page-screenshot)
- [Playwright docs: Video recording](https://playwright.dev/docs/videos)
- [Playwright docs: slowMo](https://playwright.dev/docs/api/class-browsertype#browser-type-launch-option-slow-mo)
