# M09: Global Setup & Teardown

## Learning Objectives

- Write a `globalSetup` function that runs once before all tests
- Pass shared state from `globalSetup` to tests via a JSON file
- Use `globalTeardown` to clean up resources after all tests
- Configure `globalSetup` in `playwright.config.ts`

## Concept

`globalSetup` runs once before any test worker starts. It's the right place for:

- Verifying the test environment (database seeded, services running)
- Creating shared resources (auth tokens, test fixtures that are expensive to create)
- Writing shared state (workspace IDs, feature flags) to a file that tests can read

`globalTeardown` runs once after all workers have finished. Use it for:

- Deleting test data created by `globalSetup`
- Closing connections opened in setup

### Configuring global setup

In `playwright.config.ts`:

```typescript
export default defineConfig({
  globalSetup: './tests/module-09-global-setup/globalSetup',
  globalTeardown: './tests/module-09-global-setup/globalTeardown',
  // ...
});
```

The function receives a `FullConfig` object — the entire resolved Playwright config.
This lets you read `config.projects`, `config.use.baseURL`, etc. in your setup.

### Sharing state from setup to tests

`globalSetup` runs in a separate Node.js process from the tests. You can't share
in-memory variables. The common patterns are:

1. **JSON file** — write data to a file, tests read it with `fs.readFileSync`. Simple and inspectable.
2. **Environment variables** — set `process.env.KEY = value` in setup. Works across processes.
3. **Shared module** — export a cached value that both setup and tests import.

The JSON file pattern is the most transparent — you can inspect `.test-state.json`
after a failed run to understand what the setup produced.

### When to use `globalSetup` vs `beforeAll`

- `globalSetup` — for things that need to happen once for the entire suite, across all workers
- `beforeAll` — for things that need to happen once per test file or describe block

If you need to seed a database once before all tests, use `globalSetup`.
If you need to create a user once for a group of related tests, use `beforeAll`.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

1. Read `globalSetup.ts` and understand the TODOs.
2. Complete TODOs 4–5 in `exercise.spec.ts`.
3. Create `playwright-m09.config.ts` with `globalSetup` pointing to this module's file.
4. Run:

```bash
npx playwright test tests/module-09-global-setup \
  --config=tests/module-09-global-setup/playwright-m09.config.ts
```

## Key Takeaways

1. `globalSetup` runs once before any test — use it for suite-wide environment checks.
2. Pass data from setup to tests via JSON files, not in-memory variables.
3. `globalTeardown` is optional but important for cleaning up long-lived resources.
4. `beforeAll` is scoped to a file; `globalSetup` is scoped to the entire suite.
5. A helpful error message in `globalSetup` saves hours of debugging seed issues.

## Going Deeper

- [Playwright docs: Global setup and teardown](https://playwright.dev/docs/test-global-setup-teardown)
