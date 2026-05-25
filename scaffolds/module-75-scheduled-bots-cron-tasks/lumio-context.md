# Lumio Context: M75

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
