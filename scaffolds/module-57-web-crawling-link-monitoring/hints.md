# M57 Hints

## TODO 1 — Extract internal links

```typescript
const links = await page.evaluate(() =>
  Array.from(document.querySelectorAll('a[href]'))
    .map(a => (a as HTMLAnchorElement).href)
    .filter(href => href.startsWith(window.location.origin))
);
```

`window.location.origin` is `http://localhost:3000` in Lumio's test environment.

## TODO 2 — Assert links is an Array

```typescript
expect(Array.isArray(links)).toBe(true);
```

## TODO 3 — Assert response status is 200

```typescript
expect(response?.status()).toBe(200);
```

During a crawl, any status outside 2xx is worth recording. 404 specifically means broken link.

## TODO 4 — Assert siteMap has at least one entry

```typescript
expect(siteMap.length).toBeGreaterThan(0);
```

## TODO 5 — Filter by depth

```typescript
const crawlable = queue.filter(item => item.depth <= MAX_DEPTH);
```

## TODO 6 — Assert 4 crawlable entries

```typescript
expect(crawlable.length).toBe(4);
```

Depths 0, 1, 2, 3 are within MAX_DEPTH (3). Depth 4 is excluded.

## TODO 7 — Filter same-origin links

```typescript
const internalLinks = allLinks.filter(link => link.startsWith(origin));
```

## TODO 8 — Assert 2 internal links

```typescript
expect(internalLinks.length).toBe(2);
```

## TODO 9 — Detect 404s

```typescript
if (result.status === 404) {
  brokenLinks.push(result.url);
}
```

## TODO 10 — Assert 2 broken links

```typescript
expect(brokenLinks.length).toBe(2);
```
