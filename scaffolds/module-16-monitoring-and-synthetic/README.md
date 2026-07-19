# Lesson 16: Synthetic Monitoring & Scheduled Bots

*Combines former modules M74–M76.*

## Learning Objectives

### Part 1 — Synthetic Monitoring Fundamentals (formerly M74)

- Distinguish synthetic monitoring from functional testing: same tool, different operational context
- Write a Lumio monitor script that validates the critical login journey continuously
- Collect and assert performance timing metrics as part of a monitor
- Understand how monitor failures map to alerting pipelines (Elastic Synthetics, Datadog, Azure Application Insights)

### Part 2 — Scheduled Bots & Cron Tasks (formerly M75)

- Configure a GitHub Actions workflow with a `schedule` cron trigger to run Lumio monitors continuously
- Understand the health check bot pattern and how it differs from a CI test run
- Send a Slack alert on monitor failure using the GitHub Actions workflow output
- Recognize the structural patterns of long-running monitoring loops and automated data collection bots

### Part 3 — Uptime & Performance Monitoring (formerly M76)

- Measure Lumio's dashboard LCP across multiple runs and assert it stays under a budget
- Compare before/after performance metrics to detect regressions after a deployment
- Enforce performance budgets in CI using Navigation Timing and LCP data
- Understand how Playwright performance metrics integrate with observability platforms like Datadog and Grafana

## Concept

### Part 1 — Synthetic Monitoring Fundamentals (formerly M74)

A functional test answers "does this work when I run CI?" A synthetic monitor answers "is this working _right now_ in production?" Same Playwright code, radically different operational context.

**Synthetic monitoring vs RUM.**

Real User Monitoring (RUM) records what actual users experience: page load times, errors, and interactions aggregated across millions of real sessions. It's passive — you instrument the app and wait for users.

Synthetic monitoring runs scripted browser sessions on a schedule, simulating the critical user journeys your real users care about. It's active — you define the journey, run it every minute (or every 15 minutes), and alert immediately when it breaks. RUM tells you a login is slow for 5% of users in Berlin. Synthetic monitoring tells you login is broken right now before any user hits it.

**What a monitor script looks like.**

Structurally, a monitor looks identical to a Playwright test. The behavioral difference is in how it's deployed and what it does when it fails:

- A test fails in CI → the PR is blocked
- A monitor fails in production → an alert fires → an on-call engineer is paged

The script itself doesn't know which mode it's in. That's the power: the same journey file that runs in CI also runs in your monitoring platform.

```typescript
test('login journey is healthy', async ({ page }) => {
  const start = Date.now();

  await page.goto('/login');
  await page.getByLabel('Email').fill('monitor@lumio.test');
  await page.getByLabel('Password').fill(process.env.MONITOR_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/dashboard/);
  expect(Date.now() - start).toBeLessThan(5000); // 5-second budget
});
```

**Key journey selection.**

Not every journey is worth monitoring. A good synthetic monitor journey is:
- **Critical** — its failure directly impacts revenue or user trust (login, signup, checkout)
- **Observable** — the journey has a clear success signal (URL change, visible text, API response)
- **Stable** — it doesn't randomly fail due to test data or external dependencies
- **Fast** — under 60 seconds per run so it can run frequently without overlap

For Lumio, the tier-1 monitors are: login, workspace creation, task creation, and the billing checkout flow.

**Performance budgets in monitors.**

Monitors are the right place to enforce performance budgets because they run against the real production environment, not a mocked test environment:

```typescript
const timing = await page.evaluate(() =>
  JSON.parse(JSON.stringify(window.performance.getEntriesByType('navigation')[0]))
);
const ttfb = timing.responseStart - timing.fetchStart;
expect(ttfb).toBeLessThan(800); // 800ms TTFB budget
```

Navigation Timing API data is available via `page.evaluate()` immediately after page load.

**Structured monitoring output.**

`test.step()` creates nested steps visible in the HTML report and in monitoring platforms that consume Playwright output. Naming steps clearly makes alert messages interpretable without reading the full trace:

```typescript
await test.step('navigate to login', () => page.goto('/login'));
await test.step('submit credentials', async () => {
  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: 'Sign in' }).click();
});
await test.step('verify dashboard renders', () =>
  expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
);
```

When the monitor fails at step 2, the alert says "Lumio login monitor failed at: submit credentials" — immediately actionable.

**Integration with monitoring services.**

Elastic Synthetics, Datadog Synthetics, Azure Application Insights Monitor, and Checkly all support running Playwright scripts on a schedule. Each has a runner that:
1. Runs your Playwright test file
2. Reads the exit code (0 = passing, nonzero = failing)
3. Parses the JUnit or JSON reporter output for step details
4. Stores metrics (pass/fail, duration) and triggers alerts on failure

Your Playwright knowledge transfers directly — the platform wraps it; you don't need to learn a new API.

### Part 2 — Scheduled Bots & Cron Tasks (formerly M75)

The Part 1 of this lesson (formerly M74) monitor script can check if Lumio is healthy right now. A cron workflow answers a different question: "has Lumio been continuously healthy?" The monitor must run on a schedule, and when it fails, someone must be notified before a user is.

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

### Part 3 — Uptime & Performance Monitoring (formerly M76)

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
  run: npx playwright test tests/module-16-monitoring-and-synthetic
  env:
    BASE_URL: https://staging.lumio.io
```

This runs after the deployment step and fails the pipeline if LCP or TTFB exceed the budget — blocking the release before it reaches production.

## Lumio Context

See [lumio-context.md](./lumio-context.md).

## Step-by-Step Tasks

### Part 1 — Synthetic Monitoring Fundamentals

```bash
npx playwright test tests/module-16-monitoring-and-synthetic
```

Validate this part only:
```bash
npx playwright test tests/module-16-monitoring-and-synthetic -g "Part 1 — Synthetic Monitoring Fundamentals (formerly M74)"
```

### Part 2 — Scheduled Bots & Cron Tasks

```bash
npx playwright test tests/module-16-monitoring-and-synthetic
```

Validate this part only:
```bash
npx playwright test tests/module-16-monitoring-and-synthetic -g "Part 2 — Scheduled Bots & Cron Tasks (formerly M75)"
```

### Part 3 — Uptime & Performance Monitoring

```bash
npx playwright test tests/module-16-monitoring-and-synthetic
```

Validate this part only:
```bash
npx playwright test tests/module-16-monitoring-and-synthetic -g "Part 3 — Uptime & Performance Monitoring (formerly M76)"
```

## Validate (full lesson)

```bash
npx playwright test tests/module-16-monitoring-and-synthetic
```

## Key Takeaways

### Part 1 — Synthetic Monitoring Fundamentals

1. Synthetic monitoring = Playwright tests deployed to run on a schedule against production; the script is identical.
2. Choose journeys to monitor by criticality and observability — login, checkout, core CRUD.
3. Performance budgets belong in monitors, not mocked test environments, because they measure real production behavior.
4. `test.step()` names become the readable alert message when a monitor fails in production.
5. Elastic Synthetics, Datadog Synthetics, Checkly all consume Playwright scripts — no platform-specific API needed.

### Part 2 — Scheduled Bots & Cron Tasks

1. GitHub Actions `schedule` + `workflow_dispatch` is the standard setup for cron-triggered monitors.
2. The health check bot pattern: run → check exit code → alert if nonzero → exit.
3. Slack alerts via `if: failure()` + `slackapi/slack-github-action` — the run URL is the most useful payload.
4. For sub-minute checks, run a persistent loop process rather than scheduled GitHub Actions jobs.
5. Exit code discipline: Playwright's default behavior (0 = passing, 1 = failing) maps directly to monitoring platform expectations.

### Part 3 — Uptime & Performance Monitoring

1. LCP, TTFB, and full load time are the three metrics worth asserting in a performance monitor.
2. Collect LCP via `PerformanceObserver` inside `page.evaluate()` — it's the only way to access Web Vitals data.
3. Navigation Timing (synchronous after load) gives TTFB and load time without any observer setup.
4. Before/after comparison: collect baseline → deploy → assert current metric is within X% of baseline.
5. Playwright generates performance data; emit it to Datadog/Prometheus for trending and alerting.

## Going Deeper

### Part 1 — Synthetic Monitoring Fundamentals

- [Playwright docs: test.step()](https://playwright.dev/docs/api/class-test#test-step)
- [Elastic Synthetics with Playwright](https://www.elastic.co/docs/solutions/observability/synthetics/playwright)
- [Checkly: Playwright-based monitoring](https://www.checklyhq.com/docs/browser-checks/playwright-test/)
- [Navigation Timing API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_timing_API)

### Part 2 — Scheduled Bots & Cron Tasks

- [GitHub Actions: schedule trigger](https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#schedule)
- [slackapi/slack-github-action](https://github.com/slackapi/slack-github-action)
- [Cron expression syntax](https://crontab.guru/)
- [Checkly: alerting configuration](https://www.checklyhq.com/docs/alerting-and-retries/)

### Part 3 — Uptime & Performance Monitoring

- [Web Vitals explained (web.dev)](https://web.dev/articles/vitals)
- [PerformanceObserver API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver)
- [Navigation Timing API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_timing_API)
- [Datadog: custom metrics from CI](https://docs.datadoghq.com/metrics/custom_metrics/)
