# M29: Performance Testing & Measurement

## Learning Objectives

- Measure page load with the Navigation Timing API via `page.evaluate()`
- Capture First Contentful Paint using `performance.getEntriesByName()`
- Assert on interaction latency using `Date.now()` deltas
- Intercept responses to enforce JS bundle size budgets
- Collect LCP, TTFB, FID, and CLS via `PerformanceObserver` inside `page.evaluate()`
- Read CDP performance metrics with `cdpSession.send('Performance.getMetrics')`
- Understand `page.coverage` at a conceptual level: what coverage data is and what it measures (CDP mechanism is in M62)
- Track performance regressions over time by writing results to a JSON file and comparing runs

## Concept

Playwright is not a performance profiling tool, but it can enforce budgets:

```typescript
// Navigation timing
const dcl = await page.evaluate(() =>
  performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
);
expect(dcl).toBeLessThan(3000);

// Resource size budget
page.on('response', async (res) => {
  if (res.headers()['content-type']?.includes('javascript')) {
    const size = (await res.body()).length;
    expect(size).toBeLessThan(500 * 1024);
  }
});
```

## Key Takeaways

1. `performance.timing` lives in the browser — access it via `page.evaluate()`.
2. `page.on('response', ...)` lets you assert on every network response.
3. Performance budgets in E2E tests are regression guards, not benchmarks.
4. Run on production builds for meaningful numbers — dev servers are significantly slower.

## Going Deeper

- [MDN: Navigation Timing API](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API/Navigation_timing)
- [Playwright docs: page.evaluate()](https://playwright.dev/docs/api/class-page#page-evaluate)
- M62 (CDP Direct Access) covers how `page.coverage` works under the hood via a raw CDP session
- M76 (Uptime & Performance Monitoring) covers long-term LCP trend tracking across deployments
