import { test, expect } from '../fixtures/fixtures';

// M57: Web Crawling & Link Monitoring

test.describe('M57 — Web Crawling & Link Monitoring', () => {

  // Test 1: Collect links from a page
  test('extract all internal links from a page', async ({ page }) => {
    await page.goto('/dashboard');

    // TODO 1: Use page.evaluate() to extract all href values from anchor tags
    // that start with the current page's origin (window.location.origin).
    const links = await page.evaluate(/* TODO 1: () =>
      Array.from(document.querySelectorAll('a[href]'))
        .map(a => (a as HTMLAnchorElement).href)
        .filter(href => href.startsWith(window.location.origin))
    */ () => []);

    // TODO 2: Assert that links is an Array.
    expect(Array.isArray(/* TODO 2: links */)).toBe(true);
  });

  // Test 2: Detect 404 responses via response status
  test('page.goto returns response with status()', async ({ page }) => {
    await page.goto('/dashboard');

    // TODO 3: Assert that response is not null and status() is 200.
    // Why? response.status() is how you detect broken links during a crawl.
    const response = await page.goto('/dashboard');
    expect(response?.status()).toBe(/* TODO 3: 200 */);
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

    // TODO 4: Assert that siteMap has at least one entry.
    // Why? The site map should grow as the crawl visits each URL —
    // confirming the first entry exists validates the accumulation pattern.
    expect(siteMap.length).toBeGreaterThan(/* TODO 4: 0 */);
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

    // TODO 5: Filter queue to only entries with depth <= MAX_DEPTH.
    const crawlable = queue.filter(item => item.depth /* TODO 5: <= MAX_DEPTH */);

    // TODO 6: Assert that crawlable has length 4 (depth 0,1,2,3 included; 4 excluded).
    expect(crawlable.length).toBe(/* TODO 6: 4 */);
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

    // TODO 7: Filter allLinks to only those that start with origin.
    const internalLinks = allLinks.filter(link => link/* TODO 7: .startsWith(origin) */);

    // TODO 8: Assert that internalLinks has length 2 (only the same-origin ones).
    expect(internalLinks.length).toBe(/* TODO 8: 2 */);
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

    // TODO 9: Filter crawlResults to entries with status 404 and push their URLs into brokenLinks.
    for (const result of crawlResults) {
      if (result.status === /* TODO 9: 404 */ -1) {
        brokenLinks.push(result.url);
      }
    }

    // TODO 10: Assert that brokenLinks has length 2.
    expect(brokenLinks.length).toBe(/* TODO 10: 2 */);
  });

});
