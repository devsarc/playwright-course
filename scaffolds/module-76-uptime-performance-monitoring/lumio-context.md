# Lumio Context: M76

## Performance context

Lumio's engineering team tracks three performance metrics continuously:

| Metric | Production P50 | Production P95 | Budget |
|---|---|---|---|
| Landing page LCP | 1.4s | 2.1s | < 2.5s |
| Dashboard TTFB | 220ms | 640ms | < 800ms |
| Dashboard full load | 1.8s | 3.4s | < 5.0s |
| Health endpoint | 40ms | 120ms | < 200ms |

## Performance baselines

Baselines are computed from the previous 30 production monitoring runs. They're stored in `.perf-baselines.json` in the repo root (committed by the monitoring bot after each passing run). The before/after comparison in test 4 uses a hardcoded `1400ms` — in the real workflow, it reads from this file.

## Simulated regression scenario

The exercise simulates the scenario where a developer adds a large unoptimized hero image to the landing page, causing LCP to jump from 1.4s to 2.8s. The performance monitor catches this regression in the post-deployment CI check before the change reaches production. The fix: convert the image to WebP and add `loading="lazy"` to off-screen images.

## Dashboard load sequence

The dashboard renders in two phases:
1. **Shell render** (TTFB + 200ms): the layout skeleton is painted
2. **Data hydration** (TTFB + 600ms): charts and task lists populate via API calls

The `loadEventEnd` timing captures after phase 2, when all synchronous resources have loaded. Async data fetching (via React Query) may continue after `loadEventEnd` — LCP better captures the user-visible completion point.

## Monitoring integration

Performance measurements from these tests are emitted to Datadog as custom metrics using the Datadog agent sidecar deployed alongside the monitoring container:

```
lumio.perf.landing_lcp (gauge): milliseconds
lumio.perf.dashboard_ttfb (gauge): milliseconds
lumio.perf.health_latency (gauge): milliseconds
```

Grafana dashboards plot 30-day rolling P50/P95 for each metric and alert when the 7-day P95 exceeds the budget.
