# M57: Web Crawling & Link Monitoring

## Learning Objectives

- Crawl all pages in a site by following links recursively from a starting URL
- Detect 404 responses by monitoring network responses during crawl
- Build a site map JSON from discovered URLs
- Apply crawl depth limiting to prevent runaway recursion

## Concept

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

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-57-web-crawling-link-monitoring
```

## Key Takeaways

1. The crawl loop: pop URL from queue → navigate → collect links → add new links → repeat.
2. Monitor `response.status()` during crawl to detect 404s without a separate check.
3. Filter links to the same origin before queuing — don't crawl external domains.
4. Depth limiting prevents runaway recursion on large sites.
5. Build a site map JSON as a side effect of crawling — it's the natural output.

## Going Deeper

- [Playwright docs: response.status()](https://playwright.dev/docs/api/class-response#response-status)
- [Playwright docs: page.goto()](https://playwright.dev/docs/api/class-page#page-goto)
- [robots.txt specification](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
