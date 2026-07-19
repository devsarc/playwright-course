# Lumio Context: Lesson 16

## Part 1 — Synthetic Monitoring Fundamentals (formerly M74)

## Monitoring context

Lumio's engineering team runs synthetic monitors against the staging environment every 15 minutes and against production every 5 minutes. The monitors are Playwright test files — the same scripts that run in CI, deployed to Elastic Synthetics (staging) and Checkly (production).

## Tier-1 monitors (critical — alert PagerDuty immediately on failure)

| Journey | Timeout |
|---|---|
| Login | 5 seconds |
| Dashboard load | 3 seconds |
| Task creation | 8 seconds |
| Billing page access | 5 seconds |

## Health endpoint

`GET /api/health` returns:

```json
{ "status": "ok", "db": "connected", "latency_ms": 42 }
```

Returns `{ "status": "degraded" }` if the database is slow (>500ms query time), and `{ "status": "error" }` if the database is unreachable. This endpoint is excluded from authentication — it is publicly accessible.

## Monitor credentials

Monitors use a dedicated service account: `admin@lumio.test` / `password123`. This account:
- Is never used by real users
- Has full admin access for journey breadth
- Is rotated monthly and injected via environment variable in production monitoring: `process.env.MONITOR_PASSWORD`

## Performance baselines (production P50)

| Metric | Value |
|---|---|
| Login TTFB | 180ms |
| Dashboard TTFB | 220ms |
| Dashboard LCP | 1.4s |
| Task creation (UI round-trip) | 600ms |

Monitor thresholds are set at 4× the P50 to avoid false positives from normal variance, while still catching real degradations.

## Login error handling

The login form at `/login` uses a `role="alert"` element that appears below the form when credentials are invalid. The message text is "Invalid email or password." — this exact string is intentional: it doesn't reveal which of email or password was wrong.

## Part 2 — Scheduled Bots & Cron Tasks (formerly M75)

## The monitoring workflow

Lumio's production monitoring uses a GitHub Actions workflow file at `.github/workflows/monitor.yml`. This workflow runs on a 15-minute cron schedule and also supports `workflow_dispatch` for manual triggering during incidents.

## Example workflow structure (for reference, not built in this module)

```yaml
name: Lumio Synthetic Monitor

on:
  schedule:
    - cron: '*/15 * * * *'
  workflow_dispatch:

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx playwright install chromium
      - name: Run login monitor
        run: npx playwright test tests/module-75-scheduled-bots-cron-tasks --reporter=json:results.json
        env:
          MONITOR_EMAIL: monitor@lumio.test
          MONITOR_PASSWORD: ${{ secrets.MONITOR_PASSWORD }}
      - name: Notify Slack on failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {"text": "🚨 Lumio monitor failed: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"}
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Monitor service account

The monitoring scripts use `monitor@lumio.test` — a dedicated service account with read access to the core app features but no admin permissions. The password is stored as a GitHub Actions secret (`MONITOR_PASSWORD`) and injected at runtime.

## Admin panel data collection

The admin panel at `/admin/users` displays a pagination status element with text format "X–Y of Z users". The bot in test 2 parses this to emit a `user_count` metric. In production, this metric is posted to Datadog as a custom gauge that powers the "Total registered users" dashboard widget.

## Idempotency requirements

Lumio's monitoring scripts must not:
- Create tasks, projects, or workspaces (these accumulate and pollute the database)
- Send notifications or emails (these wake up real users)
- Modify user roles or settings

The login and read-only operations in this module are safe to run every 15 minutes without cleanup.

## Part 3 — Uptime & Performance Monitoring (formerly M76)

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
