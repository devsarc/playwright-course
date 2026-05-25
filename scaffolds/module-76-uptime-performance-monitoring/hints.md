# M76 Hints

## TODO 1 — LCP budget assertion

```typescript
expect(lcp).toBeLessThan(2500);
```

2500ms is the Web Vitals "Good" threshold for LCP. Values 2500–4000ms are "Needs Improvement" and above 4000ms is "Poor." The default `0` always fails because LCP is always a positive number greater than 0.

## TODO 2 — TTFB calculation

```typescript
const ttfb = timing.responseStart - timing.fetchStart;
```

TTFB is the time from when the browser started fetching the resource (`fetchStart`) to when it received the first byte of the response (`responseStart`). This measures server processing time, CDN latency, and network round-trip time. The default `99999` makes `toBeLessThan(800)` fail (99999 > 800) — change it to the actual subtraction to use the real measured value.

## TODO 3 — Full load time calculation

```typescript
const loadTime = timing.loadEventEnd - timing.fetchStart;
```

`loadEventEnd` is when the browser's `load` event handler finished executing. Subtracting `fetchStart` gives the total wall-clock time from navigation start to fully loaded. The default `99999` makes `toBeLessThan(5000)` fail — change it to the actual calculated value.

## TODO 4 — Regression budget assertion

```typescript
expect(currentLcp).toBeLessThan(baselineLcp * 1.2);
```

`baselineLcp * 1.2` is 1400 × 1.2 = 1680ms — the maximum acceptable LCP including a 20% regression budget. The default `0` always fails because LCP is always > 0. A 20% budget is a common starting point: tight enough to catch real regressions, loose enough to tolerate measurement variance.

## TODO 5 — Per-measurement budget

```typescript
expect(measurements.every(m => m < 2500)).toBe(true);
```

`Array.every()` returns true only if all elements satisfy the predicate. With the default `0`, `m < 0` is never true, so `every()` returns false and the assertion fails. The assertion is intentionally per-measurement (not just the average) — any single over-budget run means the user experienced a slow page.

## TODO 6 — Health endpoint status

```typescript
expect(response.status()).toBe(200);
```

The default `0` always fails. If the health endpoint returns 503, the test correctly fails — signaling the service is degraded.

## TODO 7 — Health endpoint latency

```typescript
expect(elapsed).toBeLessThan(200);
```

200ms is the budget for a health check endpoint — it should be a fast database ping with no complex logic. The default `0` always fails because the HTTP round-trip takes longer than 0ms. If this assertion fails in production, it usually means the database is slow, not the Node.js process.
