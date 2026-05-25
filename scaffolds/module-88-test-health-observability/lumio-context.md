# Lumio Context — M88: Test Health Observability

## What Lumio feature is under test

Lumio's engineering team tracks test suite health across nightly CI runs using a custom script that parses the JSON reporter output and posts metrics to a Grafana dashboard. The dashboard shows pass rate trend, flakiness counts per test, and P95 duration over the last 30 days.

## Why this scenario is realistic

Without active observability, test suites degrade silently: flakiness accumulates until CI becomes unreliable, duration creeps up until the pipeline takes 45 minutes, and coverage gaps grow as new features ship without tests. Instrumenting the test suite with `testInfo` metadata and structured annotations is the minimum viable step toward a health dashboard.

## Relevant app details

- Lumio's CI runs nightly with `reporter: [['json', { outputFile: 'results.json' }], ['html']]`.
- The `results.json` is uploaded as a GitHub Actions artifact and then fetched by a nightly Node.js script that posts metrics to InfluxDB.
- Tests annotated with `@smoke` are part of the per-push check; all others run only nightly.
- A flakiness threshold of 5% triggers a Slack alert to the `#test-health` channel.
- The Lumio health dashboard tracks test-level metrics using `testInfo.testId` as the stable DB key.
