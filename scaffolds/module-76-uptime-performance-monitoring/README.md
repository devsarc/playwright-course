# M76: Uptime & Performance Monitoring

## Learning Objectives

- Measure Lumio's dashboard LCP across multiple runs and assert it stays under a budget
- Compare before/after performance metrics to detect regressions after a deployment
- Enforce performance budgets in CI using Navigation Timing and LCP data
- Understand how Playwright performance metrics integrate with observability platforms like Datadog and Grafana

## Concept

Performance is not binary. A page doesn't just "work" or "not work" — it responds in 200ms or 2 seconds, renders the largest content at 1.2s or 4.8s. Synthetic performance monitoring adds numbers to those observations and enforces budgets over time.

**What to measure.**

The three metrics that matter most for perceived user experience:

| Metric | What it measures | Target |
|---|---|---|
| LCP (Largest Contentful Paint) | When the main content is visible | < 2.5s |
| TTFB (Time to First Byte) | Server processing speed | < 800ms |
| Load event | Full page load including all resources | < 5s |

LCP is the most user-relevant because it correlates with "is the page usable yet." TTFB is the most actionable server-side metric.

**Collecting LCP via page.evaluate().**

LCP is a Web Vitals metric exposed via the `PerformanceObserver` API:

```typescript
const lcp = await page.evaluate(() =>
  new Promise<number>(resolve => {
    new PerformanceObserver(list => {
      const entries = list.getEntries();
      resolve(entries[entries.length - 1].startTime);
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  })
);
```

Alternatively, the `web-vitals` library provides a simpler interface if installed in the app. For a monitoring script without app dependency, the raw `PerformanceObserver` approach is self-contained.

**Collecting TTFB and load time via Navigation Timing.**

Navigation Timing entries are synchronously available after page load:

```typescript
const timing = await page.evaluate(() =>
  JSON.parse(JSON.stringify(window.performance.getEntriesByType('navigation')[0]))
);
const ttfb = timing.responseStart - timing.fetchStart;
const loadTime = timing.loadEventEnd - timing.fetchStart;
```

**Before/after comparison pattern.**

To detect regressions after a deployment, collect baseline metrics before the change and compare after:

```typescript
// Baseline (collected before the deployment)
const baselineLcp = 1400; // ms, from the previous run

// After deployment
const currentLcp = await measureLcp(page);

// Regression check: flag if LCP increased more than 20%
expect(currentLcp).toBeLessThan(baselineLcp * 1.2);
```

In a CI pipeline, the baseline is read from a file committed to the repo or a metrics store. The comparison runs post-deployment as a gate before traffic routing.

**Trending over time.**

A single data point is not a trend. Meaningful performance monitoring runs 10+ measurements and tracks percentiles (P50, P95) rather than single values. A spike is noise; a consistent P95 increase is a regression.

In practice: emit each measurement to a time-series database (Datadog custom metrics, Prometheus gauge) and visualize in Grafana. Playwright generates the data; the observability platform stores and visualizes it.

**Performance budget enforcement in CI.**

Add a performance check step to the post-deployment CI job:

```yaml
- name: Assert performance budget
  run: npx playwright test tests/module-76-uptime-performance-monitoring
  env:
    BASE_URL: https://staging.lumio.io
```

This runs after the deployment step and fails the pipeline if LCP or TTFB exceed the budget — blocking the release before it reaches production.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-76-uptime-performance-monitoring
```

## Key Takeaways

1. LCP, TTFB, and full load time are the three metrics worth asserting in a performance monitor.
2. Collect LCP via `PerformanceObserver` inside `page.evaluate()` — it's the only way to access Web Vitals data.
3. Navigation Timing (synchronous after load) gives TTFB and load time without any observer setup.
4. Before/after comparison: collect baseline → deploy → assert current metric is within X% of baseline.
5. Playwright generates performance data; emit it to Datadog/Prometheus for trending and alerting.

## Going Deeper

- [Web Vitals explained (web.dev)](https://web.dev/articles/vitals)
- [PerformanceObserver API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver)
- [Navigation Timing API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_timing_API)
- [Datadog: custom metrics from CI](https://docs.datadoghq.com/metrics/custom_metrics/)
