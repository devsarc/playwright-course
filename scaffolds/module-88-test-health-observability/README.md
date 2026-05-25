# M88: Test Health Observability

## Learning Objectives

- Collect per-test duration, retry count, and pass/fail state from `testInfo`
- Use `testInfo.annotations` to attach observability metadata to test results
- Understand how the JSON reporter output feeds dashboards and flakiness analysis scripts
- Recognize the metrics that constitute a healthy test suite: pass rate, flakiness rate, and duration trend
- Integrate test health data with external monitoring systems (Allure, Datadog, Grafana)

## Concept

A CI pipeline that shows "217 tests passed" hides the questions that matter: how many needed a retry? Which tests are getting slower each week? What percentage of tests are genuinely stable vs. intermittently green? Test health observability is the practice of collecting and surfacing this data systematically.

**The four health signals.**

1. **Pass rate** — what percentage of test runs complete without failure? Below 95% means something is structurally broken: flaky tests, environment instability, or real bugs being masked by retries.
2. **Flakiness rate** — what percentage of passed tests required at least one retry? Flaky tests are pre-failures. A test that passes on the third attempt is a bug that hasn't been diagnosed yet.
3. **Duration trend** — is the suite getting slower? A 10% increase per month means the suite doubles in runtime every 8 months. Duration regression is a CI cost signal.
4. **Coverage distribution** — are `@smoke`, `@sanity`, and `@regression` tests distributed across features proportionally? A single feature with 40% of the tests and another with 0% is a coverage gap.

**Reading `testInfo` for observability.**

Playwright exposes all the data you need from `testInfo`:

```typescript
test('example', async ({ page }, testInfo) => {
  // Duration so far (mid-test):
  console.log(testInfo.duration);

  // Retry attempt (0 = first run):
  console.log(testInfo.retry);

  // Unique ID for this test run:
  console.log(testInfo.testId);

  // Tags from the title (e.g., @smoke):
  const tags = testInfo.title.match(/@\w+/g) ?? [];
});
```

**Attaching observability metadata.**

`testInfo.annotations` is the structured channel for test metadata. The JSON reporter serializes it into every test's result object:

```typescript
testInfo.annotations.push({
  type: 'flakiness-risk',
  description: 'high — network-dependent assertion',
});
```

A post-processing script reading the JSON reporter output can then compute flakiness scores per annotation value.

**The JSON reporter output format.**

Running `npx playwright test --reporter=json` writes a structured JSON file. Each test result includes:

```json
{
  "title": "login: renders sign in form @smoke",
  "status": "passed",
  "duration": 1432,
  "retry": 1,
  "annotations": [{ "type": "tag", "description": "@smoke" }],
  "attachments": []
}
```

A nightly script can aggregate these results across runs to compute moving averages, flakiness counts, and duration percentiles.

**External integrations.**

- **Allure Report** — a rich report format (separate CLI) that supports trend graphs, retries history, and owner annotations.
- **Datadog CI Visibility** — native Playwright integration; sends test results as CI visibility events automatically.
- **Grafana + InfluxDB** — parse JSON reporter output in a GitHub Actions step and POST metrics to InfluxDB; Grafana visualizes trends over time.

The key principle: don't rely on a human to look at CI output and notice the suite is slowing down. Instrument the output so a dashboard catches it automatically.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-88-test-health-observability
```

## Key Takeaways

1. `testInfo.duration`, `testInfo.retry`, and `testInfo.status` are the raw data for pass rate, flakiness rate, and duration trend.
2. `testInfo.annotations` is the structured channel for attaching health metadata — it appears in JSON reporter output.
3. A flakiness rate above 5% is a signal to stop adding tests and diagnose existing ones.
4. Duration regression is a cost signal — track P50 and P95 durations, not just totals.
5. The JSON reporter output is the integration point for external dashboards — parse it, don't scrape HTML reports.

## Going Deeper

- [Playwright docs: Test reporters](https://playwright.dev/docs/test-reporters)
- [Playwright docs: Test info](https://playwright.dev/docs/api/class-testinfo)
- [Allure Report for Playwright](https://allurereport.org/docs/playwright/)
- [Datadog CI Visibility](https://docs.datadoghq.com/continuous_integration/tests/playwright/)
