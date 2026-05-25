# Lumio Context: M74

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
