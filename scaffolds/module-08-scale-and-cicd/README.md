# Lesson 08: Scale & CI/CD

*Combines former modules M38–M41.*

## Learning Objectives

### Part 1 — Parallel Execution & Test Isolation (formerly M38)

- Configure `fullyParallel: true` and `workers` in `playwright.config.ts` to control concurrency
- Explain why a fresh `BrowserContext` per test is the correct isolation boundary
- Identify the root cause when a test passes alone but fails when run in parallel
- Refactor a test that uses shared mutable state so it is safe for parallel execution
- Decide when to use worker-scoped fixtures for expensive shared setup

### Part 2 — Sharding for Large Suites (formerly M39)

- Split a test suite across N parallel CI jobs with `--shard=1/4`, `--shard=2/4`, etc.
- Configure a GitHub Actions matrix to run one shard per job
- Use the `blob` reporter to capture per-shard output that can be merged later
- Combine shard results into a single HTML report with `npx playwright merge-reports`
- Understand `fullyParallel` vs sharding: workers parallelize within one machine; sharding distributes across machines

### Part 3 — CI/CD Pipeline Setup (formerly M40)

- Build a GitHub Actions workflow that installs Playwright browsers, runs tests, and uploads HTML reports as artifacts
- Configure a browser matrix to run tests across Chromium, Firefox, and WebKit in parallel CI jobs
- Use the GitHub annotations reporter to surface test failures inline on pull requests
- Understand when to use JUnit vs. JSON vs. HTML vs. blob reporters and configure multiple simultaneously
- Cache Playwright browser binaries to reduce CI runtime

### Part 4 — WebServer Config & Test Environment (formerly M41)

- Configure every `webServer` option (`command`, `url`, `reuseExistingServer`, `timeout`, `env`, `stdout`, `stderr`) and explain what each controls
- Run multiple `webServer` instances for a frontend + backend split architecture
- Manage test environment variables with `.env.test` and `dotenv` in `playwright.config.ts`
- Decide when `reuseExistingServer: true` is appropriate and when it is dangerous
- Override the base URL per test or per project without touching `playwright.config.ts`

## Concept

### Part 1 — Parallel Execution & Test Isolation (formerly M38)

By default, Playwright runs test files in parallel but runs tests within a file sequentially. Setting `fullyParallel: true` goes further — tests within the same file also run concurrently. This dramatically speeds up large suites but surfaces a class of bug that sequential execution hides: shared mutable state.

**The isolation boundary.** Each Playwright test receives its own `BrowserContext`. A `BrowserContext` is like a fresh browser profile — its own cookies, `localStorage`, `sessionStorage`, and authentication state, isolated from every other context. This is the correct isolation boundary. Contexts in parallel do not interfere with each other because they truly have no shared state at the browser level.

The problem arises when tests share state *outside* the browser: a single database record being modified by two tests simultaneously, a file on disk that two tests write to the same path, or a global JavaScript variable in your test code. These produce race conditions that are timing-dependent and therefore intermittent — the most frustrating kind of failure.

**Diagnosing shared state.** A test that fails only in parallel but passes when run with `--workers 1` is almost certainly a shared state problem. The workflow is: reduce workers to 1 to confirm the sequential pass → run with full workers and look at which tests overlap in time (the HTML report shows start/end times) → trace the shared resource those tests touch.

**Worker-scoped fixtures.** Some setup is expensive and should be shared — creating a test database, compiling assets, spinning up a mock server. Worker-scoped fixtures run once per worker process and are shared by all tests in that worker. They are appropriate for read-only or idempotent resources. For anything mutable, prefer test-scoped setup that creates fresh state for each test. The rule of thumb: if two tests modifying the same state would conflict, the state belongs in a test-scoped fixture.

**Database isolation strategies.** There are two common approaches for database-backed tests running in parallel. The first is *isolated test data*: each test creates its own records with unique identifiers and only asserts on those records — it never reads or modifies shared records. The second is *database transactions*: each test runs inside a transaction that is rolled back at the end, leaving the database clean. Playwright's fixtures are the right place to wrap setup and teardown. For Lumio, the practical approach is unique workspaces and projects per test: because workspace slugs are unique, two tests creating different slugs can run concurrently without conflict.

**`fullyParallel` and `workers` together.** `fullyParallel: true` says "parallelize within files". `workers: N` says "use N worker processes". In CI, `workers: 1` is often safer than it sounds — GitHub Actions free-tier runners have 2 CPUs, and running 4 browser instances on 2 CPUs causes more context-switching overhead than the parallelism saves. Measure before tuning. On a 4-CPU CI runner, `workers: 2` is often the sweet spot for a Playwright suite because each browser process uses roughly 2 CPUs under load.

### Part 2 — Sharding for Large Suites (formerly M39)

**CI config pattern:**
```typescript
retries: process.env.CI ? 2 : 0,
workers: process.env.CI ? 1 : undefined,
reporter: process.env.CI ? [['blob'], ['github']] : [['html']],
```

**Sharding (4 parallel jobs):**
```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - run: npx playwright test --shard=${{ matrix.shard }}/4
```

After all shards complete, merge reports:
```bash
npx playwright merge-reports ./all-blob-reports --reporter html
```

### Part 3 — CI/CD Pipeline Setup (formerly M40)

Running Playwright locally is fast and immediate. Running it in CI requires thinking about a different set of constraints: fresh environments on every run, network latency for browser downloads, limited CPU, and the need to surface results to other tools (GitHub PR annotations, a Jenkins test reporter, a Slack alert system). Getting CI right transforms Playwright from "works on my machine" to "automatic quality gate for every PR".

**The GitHub Actions structure.** A Playwright CI job has four essential phases: checkout → install Node + dependencies → install browser binaries → run tests. The browser binary installation step (`npx playwright install --with-deps chromium`) is the expensive one — Chromium alone is around 300MB. Caching it is not optional on a busy project; without caching, every CI run downloads browsers afresh.

**Caching browser binaries.** Playwright stores browsers in a versioned cache directory (`~/.cache/ms-playwright` on Linux). Because the path is keyed to the Playwright version, caching on `hashFiles('package-lock.json')` correctly invalidates when you upgrade Playwright. GitHub Actions' `actions/cache@v4` handles this with a cache key and a restore key. The pattern: try to restore the cache; if it hits, skip the install step; if it misses, install and then save.

**Matrix builds for cross-browser CI.** GitHub Actions' `strategy.matrix` lets you run the same job definition N times with different input values. For Playwright, the matrix variable is typically the browser name or Playwright project name. Each matrix job runs one browser — three parallel jobs instead of one sequential job running all three browsers. The total wall time drops from 3× to 1× (plus a few seconds of job spin-up overhead). The tradeoff is cost: you consume three GitHub Actions minutes per test run instead of one.

**Reporters in CI.** The right reporter depends on the consumer. `html` produces a rich local report. `github` (the GitHub annotations reporter) posts inline failure comments on pull requests — learners see failures next to the code that caused them, not buried in a log. `junit` produces an XML file that Jenkins, GitLab CI, and Azure DevOps all know how to parse. `json` produces machine-readable output for custom integrations. `blob` is Playwright's format for splitting reports across shards and merging them later (Part 2 of this lesson (formerly M39) covers sharding). You can configure multiple reporters simultaneously with an array — a common CI setup is `[['github'], ['html', { open: 'never' }], ['junit', { outputFile: 'results.xml' }]]`.

**Uploading artifacts.** Test HTML reports and trace files are worth uploading as CI artifacts even when tests pass. When tests fail, the artifacts are what engineers use to debug. `actions/upload-artifact@v4` with `if: always()` ensures artifacts are uploaded regardless of test outcome. Set retention to 7–30 days depending on your team's debugging habits.

**Environment variables.** CI runs against a test database, not production. `DATABASE_URL`, `NEXTAUTH_SECRET`, and test user credentials live in GitHub repository secrets and are injected into the job via `env`. Never hardcode credentials; never commit `.env.test`.

### Part 4 — WebServer Config & Test Environment (formerly M41)

`webServer` is Playwright's way of owning the full lifecycle of your application during tests — start the server before tests run, tear it down after. Lesson 00 (formerly M00) introduced the basic configuration. M41 goes deep on every option, the edge cases, and the patterns for more complex architectures.

**`command` and `url`.** The `command` is a shell command Playwright spawns as a child process. The `url` is the address Playwright polls with HTTP GET requests every 1 second. When the URL returns any 2xx response, Playwright considers the server ready and starts running tests. This polling is why you need a `/` route or a `/health` endpoint — Playwright needs something to hit. If the URL never responds within `timeout`, the entire run fails before any test executes.

**`timeout`.** The default timeout is 60 seconds. Next.js on a cold start with TypeScript compilation can take 30–45 seconds, especially the first time. Set `timeout: 120_000` for Next.js projects. For production builds (`next start` instead of `next dev`), compilation happens at build time and startup is faster — but building takes longer upfront.

**`reuseExistingServer`.** When `true`, Playwright checks whether the `url` is already responding before starting the `command`. If it is, Playwright skips the start and uses the running server. This is the right setting for local development: if you already have `npm run dev` running, tests use it immediately without a restart. In CI, set this to `false` (or `!process.env.CI`) — CI runners have no pre-existing server and silently skipping the start command would produce connection refused errors.

**`env`.** Additional environment variables to inject into the server process. If your Next.js app reads `DATABASE_URL` from the environment, pass it here: `env: { DATABASE_URL: process.env.DATABASE_URL }`. This is separate from the test process's environment — the server process does not automatically inherit all of the test process's env vars.

**`stdout` and `stderr`.** By default Playwright suppresses server output. Set `stdout: 'pipe'` to capture it for debugging. During development, `stdout: 'pipe'` combined with Playwright's `DEBUG=pw:api` flag gives you full visibility into both the test framework and the server.

**Multiple servers.** `webServer` accepts an array. A common pattern for Next.js + a separate WebSocket server: `webServer: [{ command: 'npm run dev --prefix lumio', url: 'http://localhost:3000' }, { command: 'node lumio/server.ts', url: 'http://localhost:3001/health' }]`. Playwright starts both, waits for both to be ready, and tears both down after the run.

**`.env.test` management.** The test database URL, auth secrets, and credentials belong in `.env.test` — not in `.env` (which is for development) and not in the repository (committed secrets are a security incident). The pattern: `.env.test.example` is committed (with placeholder values), `.env.test` is gitignored. `dotenv.config({ path: '.env.test' })` in `playwright.config.ts` loads these values for both the test process and (via `env:` in `webServer`) the server process.

## Lumio Context

See [lumio-context.md](./lumio-context.md).

## Step-by-Step Tasks

### Part 1 — Parallel Execution & Test Isolation

Complete each TODO in `exercise.spec.ts` in order.
Run after each TODO:
```bash
npx playwright test tests/module-08-scale-and-cicd --workers 4
```

Validate this part only:
```bash
npx playwright test tests/module-08-scale-and-cicd -g "Part 1 — Parallel Execution & Test Isolation (formerly M38)"
```

### Part 2 — Sharding for Large Suites

Validate this part only:
```bash
npx playwright test tests/module-08-scale-and-cicd -g "Part 2 — Sharding for Large Suites (formerly M39)"
```

### Part 3 — CI/CD Pipeline Setup

This module's exercise creates a GitHub Actions workflow file rather than a test spec. Complete each TODO in `exercise.spec.ts` AND in the workflow template.

Run after each TODO:
```bash
npx playwright test tests/module-08-scale-and-cicd
```

Validate this part only:
```bash
npx playwright test tests/module-08-scale-and-cicd -g "Part 3 — CI/CD Pipeline Setup (formerly M40)"
```

### Part 4 — WebServer Config & Test Environment

Complete each TODO in `exercise.spec.ts` in order.
Run after each TODO:
```bash
npx playwright test tests/module-08-scale-and-cicd
```

Validate this part only:
```bash
npx playwright test tests/module-08-scale-and-cicd -g "Part 4 — WebServer Config & Test Environment (formerly M41)"
```

## Validate (full lesson)

```bash
npx playwright test tests/module-08-scale-and-cicd
```

## Key Takeaways

### Part 1 — Parallel Execution & Test Isolation

1. `BrowserContext` isolation is automatic — each test gets its own context. Shared state problems live outside the browser, in your test data or fixtures.
2. A test that fails in parallel but passes with `--workers 1` is a shared state bug, not a flaky test.
3. Make test data unique per test (unique IDs, unique slugs) rather than relying on cleanup.
4. Worker-scoped fixtures are for expensive, read-only shared resources — not for mutable shared state.
5. Measure before tuning `workers`: more workers is not always faster on resource-constrained CI.

### Part 2 — Sharding for Large Suites

1. Set `retries: 2` in CI — flaky network or timing issues fail tests once, not twice.
2. Use `blob` reporter in CI — it's merge-able across shards.
3. Tag critical-path tests `@smoke` so you can run the fast subset on every push.
4. Publish `playwright-report/` as a GitHub Actions artifact for visual inspection.

> **Note — M39 vs M40:** This module focuses on sharding: splitting suites horizontally across CI machines. Part 3 of this lesson (formerly M40) (CI/CD Pipeline Setup) covers the full GitHub Actions workflow structure, reporter configuration (github annotations, JUnit, JSON reporters), browser binary caching, artifact upload, Docker container execution, and cloud grid integration. Some of that content currently lives in this module and will be formally moved when Part 3 of this lesson (formerly M40) is created.

### Part 3 — CI/CD Pipeline Setup

1. Cache Playwright browser binaries on `hashFiles('package-lock.json')` — Playwright's cache path is versioned, so the cache auto-invalidates on upgrade.
2. Use `actions/matrix` to run browser projects in parallel — three 2-minute jobs beats one 6-minute job.
3. Configure `['github']` reporter in CI for inline PR annotations; `['html']` for the downloadable report; `['junit']` for external CI systems.
4. Always upload reports with `if: always()` — you need artifacts when tests fail, and you need them most when everything seems to be breaking.
5. `workers: 1` on a 2-CPU free runner often outperforms higher worker counts due to context-switching overhead.

### Part 4 — WebServer Config & Test Environment

1. `webServer.url` is polled until it responds — your app needs a root or health route that returns 2xx quickly.
2. `reuseExistingServer: !process.env.CI` is the correct default — reuse locally, always start fresh in CI.
3. `webServer` accepts an array for multi-process architectures (frontend + API + WebSocket server).
4. Put secrets in `.env.test`, load with `dotenv` in config, pass to server via `webServer.env`.
5. `timeout: 120_000` is sensible for Next.js — cold-start TypeScript compilation takes time.

## Going Deeper

### Part 1 — Parallel Execution & Test Isolation

- [Playwright docs: Parallelism](https://playwright.dev/docs/test-parallel)
- [Playwright docs: Test isolation](https://playwright.dev/docs/browser-contexts)
- [Playwright docs: Fixtures](https://playwright.dev/docs/test-fixtures#worker-scoped-fixtures)

### Part 2 — Sharding for Large Suites

- [Playwright docs: CI configuration](https://playwright.dev/docs/ci)
- [Playwright docs: Sharding](https://playwright.dev/docs/test-sharding)

### Part 3 — CI/CD Pipeline Setup

- [Playwright docs: CI configuration](https://playwright.dev/docs/ci)
- [Playwright docs: GitHub Actions](https://playwright.dev/docs/ci-intro)
- [Playwright docs: Reporters](https://playwright.dev/docs/test-reporters)

### Part 4 — WebServer Config & Test Environment

- [Playwright docs: webServer](https://playwright.dev/docs/test-webserver)
- [Playwright docs: Configuration](https://playwright.dev/docs/test-configuration)
- [Playwright docs: Environment variables](https://playwright.dev/docs/test-parameterize#env-files)
