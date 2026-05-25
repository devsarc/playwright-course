# M00: Setup & Project Structure

## Learning Objectives

By the end of this module you will be able to:
- Explain what `@playwright/test` adds over `playwright-core` and when you'd use each
- Read a `playwright.config.ts` and understand what every top-level option controls
- Configure a `webServer` so tests automatically start and stop the app under test
- Install browser binaries and run your first passing test

## Concept

### `playwright-core` vs `@playwright/test`

Playwright ships as two packages:

- **`playwright-core`** — the automation engine only. No test runner, no assertions, no fixtures. You use it when writing scraping scripts, monitoring bots, or embedding Playwright into an existing test framework.
- **`@playwright/test`** — everything in `playwright-core` plus the `test()` runner, `expect()` assertions, fixtures, reporters, and the CLI. This is what you want for a test suite.

This course uses `@playwright/test`. You'll see `playwright-core` mentioned in M55 (scraping) and M80 (MCP server) where the test runner is not needed.

### `webServer` config

Rather than requiring you to start Lumio manually before each test run, `playwright.config.ts` uses `webServer` to manage the app lifecycle:

```typescript
webServer: {
  command: 'npm run dev --prefix lumio',  // starts Next.js
  url: 'http://localhost:3000',            // Playwright polls this URL
  reuseExistingServer: !process.env.CI,   // reuse local dev server; start fresh in CI
  timeout: 120_000,                        // give Next.js 2 minutes to compile
}
```

Playwright starts the command, waits until the `url` responds, runs all tests, then kills the process. M41 goes deep on all the available options.

### Headless vs headed

By default, Playwright runs headless (no visible browser window) — it's fast and CI-friendly. To watch tests run:

```bash
npx playwright test --headed
```

Or use UI mode (`--ui`) for a full GUI with time-travel debugging. You'll use both in M10.

## Lumio Context

At M00, Lumio has only a landing page. Your test navigates to it and asserts the page title exists. This is intentionally minimal — the goal is to prove your environment works, not to write a meaningful test.

## Step-by-Step Tasks

### TODO 1: Install Playwright browsers

Playwright bundles its own browser binaries (Chromium, Firefox, WebKit). They are not the same as your system Chrome. Run:

```bash
npx playwright install chromium
```

Verify installation: `~/.cache/ms-playwright/` (Linux/Mac) or `%APPDATA%\ms-playwright\` (Windows) should contain a `chromium-*` directory.

### TODO 2: Complete the exercise

Open `exercise.spec.ts`. Complete the two TODOs.

### TODO 3: Run the test

```bash
npx playwright test tests/module-00-setup
```

All tests should pass. If Lumio is not running, start it first: `npm run dev --prefix lumio`

## Key Takeaways

1. `@playwright/test` = `playwright-core` + test runner + assertions + fixtures. Use it for test suites.
2. `webServer` removes the "start the app first" manual step — it's the right default for test suites.
3. `npx playwright install` must be run on any new machine — browser binaries are not in `node_modules`.
4. `headless: true` is the default. `--headed` or `--ui` adds visibility for debugging.
5. Browser binaries are versioned with the Playwright release. After upgrading Playwright, re-run `npx playwright install`.

## Going Deeper

- [Playwright docs: Configuration](https://playwright.dev/docs/test-configuration)
- [Playwright docs: webServer](https://playwright.dev/docs/test-webserver)
- [playwright-core vs @playwright/test distinction](https://playwright.dev/docs/library)
