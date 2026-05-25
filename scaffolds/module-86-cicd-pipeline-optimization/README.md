# M86: CI/CD Pipeline Optimization

## Learning Objectives

- Use `--grep` and `--grep-invert` to run a targeted subset of tests on every push
- Configure `workers` and `fullyParallel` to maximize throughput on CI hardware
- Apply `retries` in CI without masking flakiness in local development
- Set per-test and global timeouts appropriate for CI runner latency
- Read `testInfo` properties to build adaptive test behavior for slow environments

## Concept

A CI pipeline that runs in 20 minutes on a laptop takes 8 minutes on a 4-CPU CI runner — or 4 minutes on an 8-CPU runner. The bottleneck is not the network or the app; it's usually a combination of unparallelized tests, overly generous timeouts, and missing caching. Optimizing a Playwright CI pipeline means making confident decisions about each of these levers.

**Parallelism.**

Playwright can parallelize at two levels:
- **Worker parallelism** — tests run in separate worker processes, each with its own browser context. Set via `workers` in `playwright.config.ts` or `--workers` on the CLI. A rule of thumb: one worker per CPU core for CPU-bound suites; for I/O-bound suites (network calls to a dev server), 2–3× the CPU count is safe.
- **Test-level parallelism** — within a single `test.describe` block, tests run sequentially by default. Use `test.describe.configure({ mode: 'parallel' })` to parallelize them within the block.

The tradeoff: parallelism increases throughput but increases peak memory and can cause data conflicts when tests share mutable state. The fix for data conflicts is unique test data per test (M84), not reduced parallelism.

**Selective test runs.**

Running the entire suite on every push is wasteful when a commit only touches one feature. Playwright's `--grep` flag accepts a regex to match test titles:

```bash
npx playwright test --grep "@smoke"
npx playwright test --grep "login|dashboard"
```

`--grep-invert` excludes matching tests — useful for skipping slow tests in a per-push check:
```bash
npx playwright test --grep-invert "@slow"
```

On larger repos, `--only-changed` (behind a config flag) re-runs only tests whose source files changed since the last run. This requires the JSON reporter to store previous results as a baseline.

**Timeouts.**

The default global timeout in Playwright is 30 seconds per test. For a CI runner that is 3× slower than localhost, a test that takes 12 seconds locally will take 36 seconds in CI — and fail. Two strategies:

1. Raise the global timeout for CI only:
   ```typescript
   timeout: process.env.CI ? 60_000 : 30_000,
   ```
2. Raise the timeout for a specific slow test using `testInfo.setTimeout()`:
   ```typescript
   testInfo.setTimeout(testInfo.timeout + 30_000);
   ```

**Retries.**

Use `retries: 2` in CI only. A test that needs retries on every run is not "passing" — it is intermittently failing. Use retry counts (visible in the HTML report) as a flakiness backlog, not as a success metric.

```typescript
retries: process.env.CI ? 2 : 0,
```

**Reporter configuration.**

Different CI environments consume different report formats:
- `html` — the interactive report for debugging; upload as a CI artifact
- `junit` — consumed by Jenkins, GitLab, and Azure DevOps for inline test result display
- `json` — consumed by custom dashboards and nightly flakiness analysis scripts
- `dot` — minimal stdout output for fast feedback during a PR check
- `github` — adds inline annotations to GitHub pull requests showing failed test locations

Configure multiple reporters in parallel:
```typescript
reporter: [['html'], ['junit', { outputFile: 'results.xml' }], ['json', { outputFile: 'results.json' }]],
```

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-86-cicd-pipeline-optimization
```

## Key Takeaways

1. Workers control parallelism — start with `cpuCount` workers and increase if the suite is I/O-bound.
2. `--grep` runs only matching tests — use `@smoke` tags for per-push checks and `@regression` for nightly.
3. Global and per-test timeouts must account for CI runner latency — CI is typically 2–4× slower than localhost.
4. `retries: 2` in CI only — retries mask flakiness locally but are a necessary safety net for infrastructure hiccups.
5. Multiple reporters can run in parallel — HTML for humans, JUnit for CI systems, JSON for dashboards.

## Going Deeper

- [Playwright docs: Parallelism](https://playwright.dev/docs/test-parallel)
- [Playwright docs: Configuration](https://playwright.dev/docs/test-configuration)
- [Playwright docs: Reporters](https://playwright.dev/docs/test-reporters)
- [GitHub Actions: Caching dependencies](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/caching-dependencies-to-speed-up-workflows)
