# M56: Advanced Scraping & Data Extraction

## Learning Objectives

- Scrape data behind authentication by navigating the login flow before extraction
- Handle infinite scroll by scrolling to the bottom and waiting for new content to load
- Save extracted data to a CSV file from Node.js
- Apply rate limiting and delays between page loads to avoid overloading the server

## Concept

The fundamentals of scraping (M55) work for anonymous, paginated pages with predictable structure. Advanced scraping adds three complications: authentication gates the data, infinite scroll replaces pagination, and the volume of data requires structured file output rather than in-memory arrays.

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

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-56-advanced-scraping-data-extraction
```

## Key Takeaways

1. Authenticated scraping uses the same login flow as testing — the browser maintains session state.
2. Infinite scroll: scroll to bottom → wait for new content → repeat until no change.
3. CSV output: header row + data rows, values joined with commas, written with `fs.writeFileSync`.
4. Add random delays between requests to avoid rate limits and mimic human behavior.
5. Restore `storageState` to skip the login UI when scraping the same account repeatedly.

## Going Deeper

- [Playwright docs: storageState](https://playwright.dev/docs/auth#reusing-signed-in-state)
- [Playwright docs: page.evaluate()](https://playwright.dev/docs/api/class-page#page-evaluate)
- [csv-stringify library](https://csv.js.org/stringify/)
