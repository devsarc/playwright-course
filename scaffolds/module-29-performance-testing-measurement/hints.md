# M29 Hints

## TODO 1 — Navigation Timing

```typescript
const dcl = await page.evaluate(() =>
  performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
);
```

## TODO 2 — DCL budget assertion

```typescript
expect(dcl).toBeLessThan(3000);
```

## TODO 3 — First Contentful Paint

```typescript
const fcp = await page.evaluate(() => {
  const entries = performance.getEntriesByName('first-contentful-paint');
  return entries.length > 0 ? entries[0].startTime : -1;
});
```

## TODO 4 — FCP assertion

```typescript
expect(fcp).toBeGreaterThan(0);
expect(fcp).toBeLessThan(2500);
```

## TODO 5 — board load timing

```typescript
const elapsed = Date.now() - start;
expect(elapsed).toBeLessThan(5000);
```

## TODO 6 — card creation latency

```typescript
const duration = Date.now() - start;
expect(duration).toBeLessThan(1000);
```

## TODO 7 — resource size budget

```typescript
page.on('response', async (response) => {
  const contentType = response.headers()['content-type'] ?? '';
  if (contentType.includes('javascript')) {
    const body = await response.body().catch(() => Buffer.alloc(0));
    resourceSizes.push(body.length);
  }
});
// ...
for (const size of resourceSizes) {
  expect(size).toBeLessThan(MAX_JS_BUNDLE);
}
```

## Performance testing limitations

These tests measure performance on the test runner machine — not production.
Use them as regression guards ("did we introduce a 2x slowdown?") rather
than as absolute performance benchmarks.
