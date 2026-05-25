# M74: Synthetic Monitoring Fundamentals

## Learning Objectives

- Distinguish synthetic monitoring from functional testing: same tool, different operational context
- Write a Lumio monitor script that validates the critical login journey continuously
- Collect and assert performance timing metrics as part of a monitor
- Understand how monitor failures map to alerting pipelines (Elastic Synthetics, Datadog, Azure Application Insights)

## Concept

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

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-74-synthetic-monitoring-fundamentals
```

## Key Takeaways

1. Synthetic monitoring = Playwright tests deployed to run on a schedule against production; the script is identical.
2. Choose journeys to monitor by criticality and observability — login, checkout, core CRUD.
3. Performance budgets belong in monitors, not mocked test environments, because they measure real production behavior.
4. `test.step()` names become the readable alert message when a monitor fails in production.
5. Elastic Synthetics, Datadog Synthetics, Checkly all consume Playwright scripts — no platform-specific API needed.

## Going Deeper

- [Playwright docs: test.step()](https://playwright.dev/docs/api/class-test#test-step)
- [Elastic Synthetics with Playwright](https://www.elastic.co/docs/solutions/observability/synthetics/playwright)
- [Checkly: Playwright-based monitoring](https://www.checklyhq.com/docs/browser-checks/playwright-test/)
- [Navigation Timing API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_timing_API)
