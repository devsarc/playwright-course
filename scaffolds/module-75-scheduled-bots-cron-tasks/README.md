# M75: Scheduled Bots & Cron Tasks

## Learning Objectives

- Configure a GitHub Actions workflow with a `schedule` cron trigger to run Lumio monitors continuously
- Understand the health check bot pattern and how it differs from a CI test run
- Send a Slack alert on monitor failure using the GitHub Actions workflow output
- Recognize the structural patterns of long-running monitoring loops and automated data collection bots

## Concept

The M74 monitor script can check if Lumio is healthy right now. A cron workflow answers a different question: "has Lumio been continuously healthy?" The monitor must run on a schedule, and when it fails, someone must be notified before a user is.

**GitHub Actions cron triggers.**

A GitHub Actions workflow can be triggered on a schedule using the `schedule` event with a cron expression:

```yaml
on:
  schedule:
    - cron: '*/15 * * * *'  # every 15 minutes
  workflow_dispatch:          # also allow manual runs
```

The `workflow_dispatch` trigger is essential alongside `schedule` — it lets you run the monitor manually during incident investigation without waiting for the next cron tick.

Cron syntax: `minute hour day-of-month month day-of-week`. `*/15` means "every 15 minutes." GitHub Actions crons run in UTC and have a documented minimum interval of 5 minutes.

**Health check bot pattern.**

A health check bot is a stripped-down monitor designed to run frequently with minimal overhead:
1. Run the critical-path test
2. Check exit code: 0 = healthy, nonzero = failing
3. If failing, send an alert with the failure detail
4. Exit without retaining state

This pattern differs from a CI test run in that it never blocks a deployment. It is advisory: it tells the team something is wrong so they can investigate, but it does not prevent action.

**Slack notification on failure.**

GitHub Actions can send Slack notifications using a webhook:

```yaml
- name: Notify Slack on failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "🚨 Lumio login monitor failed: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

The `if: failure()` condition runs this step only when a previous step failed. The message includes the Actions run URL so the on-call engineer can open the Trace Viewer artifact immediately.

**Long-running monitoring loops.**

For very frequent checks (sub-minute) where GitHub Actions scheduling is too coarse, a monitoring loop runs as a persistent process:

```typescript
async function runMonitor() {
  while (true) {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await page.goto('/login');
      // ... run checks ...
      console.log(JSON.stringify({ status: 'ok', ts: Date.now() }));
    } catch (e) {
      console.error(JSON.stringify({ status: 'error', message: e.message, ts: Date.now() }));
      // alert here
    } finally {
      await browser.close();
    }
    await new Promise(r => setTimeout(r, 60_000)); // wait 60 seconds
  }
}
```

Playwright-based monitoring loops are typically deployed as a container process alongside the application being monitored.

**Automated data collection bots.**

The same scheduling pattern applies to data collection: scraping dashboards, collecting analytics, archiving content. A Playwright cron bot for data collection has the same structure as a health check bot, but instead of asserting correctness, it extracts and stores data.

**Exit code discipline.**

When running Playwright as a monitoring tool (not in CI), exit code 0 must mean healthy and nonzero must mean degraded. The default `npx playwright test` behavior already does this — a passing test suite exits 0, a failing suite exits 1. Monitoring platforms read this exit code to determine the check status.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-75-scheduled-bots-cron-tasks
```

## Key Takeaways

1. GitHub Actions `schedule` + `workflow_dispatch` is the standard setup for cron-triggered monitors.
2. The health check bot pattern: run → check exit code → alert if nonzero → exit.
3. Slack alerts via `if: failure()` + `slackapi/slack-github-action` — the run URL is the most useful payload.
4. For sub-minute checks, run a persistent loop process rather than scheduled GitHub Actions jobs.
5. Exit code discipline: Playwright's default behavior (0 = passing, 1 = failing) maps directly to monitoring platform expectations.

## Going Deeper

- [GitHub Actions: schedule trigger](https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#schedule)
- [slackapi/slack-github-action](https://github.com/slackapi/slack-github-action)
- [Cron expression syntax](https://crontab.guru/)
- [Checkly: alerting configuration](https://www.checklyhq.com/docs/alerting-and-retries/)
