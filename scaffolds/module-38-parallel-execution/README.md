# M38: Parallel Execution & Test Isolation

## Learning Objectives

- Configure `fullyParallel: true` and `workers` in `playwright.config.ts` to control concurrency
- Explain why a fresh `BrowserContext` per test is the correct isolation boundary
- Identify the root cause when a test passes alone but fails when run in parallel
- Refactor a test that uses shared mutable state so it is safe for parallel execution
- Decide when to use worker-scoped fixtures for expensive shared setup

## Concept

By default, Playwright runs test files in parallel but runs tests within a file sequentially. Setting `fullyParallel: true` goes further — tests within the same file also run concurrently. This dramatically speeds up large suites but surfaces a class of bug that sequential execution hides: shared mutable state.

**The isolation boundary.** Each Playwright test receives its own `BrowserContext`. A `BrowserContext` is like a fresh browser profile — its own cookies, `localStorage`, `sessionStorage`, and authentication state, isolated from every other context. This is the correct isolation boundary. Contexts in parallel do not interfere with each other because they truly have no shared state at the browser level.

The problem arises when tests share state *outside* the browser: a single database record being modified by two tests simultaneously, a file on disk that two tests write to the same path, or a global JavaScript variable in your test code. These produce race conditions that are timing-dependent and therefore intermittent — the most frustrating kind of failure.

**Diagnosing shared state.** A test that fails only in parallel but passes when run with `--workers 1` is almost certainly a shared state problem. The workflow is: reduce workers to 1 to confirm the sequential pass → run with full workers and look at which tests overlap in time (the HTML report shows start/end times) → trace the shared resource those tests touch.

**Worker-scoped fixtures.** Some setup is expensive and should be shared — creating a test database, compiling assets, spinning up a mock server. Worker-scoped fixtures run once per worker process and are shared by all tests in that worker. They are appropriate for read-only or idempotent resources. For anything mutable, prefer test-scoped setup that creates fresh state for each test. The rule of thumb: if two tests modifying the same state would conflict, the state belongs in a test-scoped fixture.

**Database isolation strategies.** There are two common approaches for database-backed tests running in parallel. The first is *isolated test data*: each test creates its own records with unique identifiers and only asserts on those records — it never reads or modifies shared records. The second is *database transactions*: each test runs inside a transaction that is rolled back at the end, leaving the database clean. Playwright's fixtures are the right place to wrap setup and teardown. For Lumio, the practical approach is unique workspaces and projects per test: because workspace slugs are unique, two tests creating different slugs can run concurrently without conflict.

**`fullyParallel` and `workers` together.** `fullyParallel: true` says "parallelize within files". `workers: N` says "use N worker processes". In CI, `workers: 1` is often safer than it sounds — GitHub Actions free-tier runners have 2 CPUs, and running 4 browser instances on 2 CPUs causes more context-switching overhead than the parallelism saves. Measure before tuning. On a 4-CPU CI runner, `workers: 2` is often the sweet spot for a Playwright suite because each browser process uses roughly 2 CPUs under load.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Complete each TODO in `exercise.spec.ts` in order.
Run after each TODO:
```bash
npx playwright test tests/module-38-parallel-execution --workers 4
```

## Key Takeaways

1. `BrowserContext` isolation is automatic — each test gets its own context. Shared state problems live outside the browser, in your test data or fixtures.
2. A test that fails in parallel but passes with `--workers 1` is a shared state bug, not a flaky test.
3. Make test data unique per test (unique IDs, unique slugs) rather than relying on cleanup.
4. Worker-scoped fixtures are for expensive, read-only shared resources — not for mutable shared state.
5. Measure before tuning `workers`: more workers is not always faster on resource-constrained CI.

## Going Deeper

- [Playwright docs: Parallelism](https://playwright.dev/docs/test-parallel)
- [Playwright docs: Test isolation](https://playwright.dev/docs/browser-contexts)
- [Playwright docs: Fixtures](https://playwright.dev/docs/test-fixtures#worker-scoped-fixtures)
