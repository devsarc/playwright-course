# M07: Configuration Deep Dive

> **Note:** `exercise.spec.ts` imports directly from `@playwright/test` rather than the shared
> `../fixtures/fixtures` used by most other modules. This is intentional — the module ships its own
> `playwright-m07.config.ts` that points to a different `baseURL`, so using the shared fixture
> (which bakes in the default config) would conflict. If you see this and wonder why it diverges
> from the course pattern, that's the reason.

## Learning Objectives

- Add browser projects to a Playwright config (chromium, firefox, webkit, mobile)
- Understand the `devices` map and what device presets configure
- Use `browserName` and `viewportSize()` to conditionally skip tests per project
- Add runtime annotations to test results

## Concept

Playwright's config file (`playwright.config.ts`) is the central control panel for your test suite. The most important section is `projects` — each project is an independent run configuration that can specify a browser, viewport, locale, or any other context option.

### Adding browser projects

```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
]
```

When you add multiple projects, Playwright runs every test in every project. A suite with 10 tests and 3 projects produces 30 test results. The HTML report groups them by project.

### Device presets

`devices['Pixel 5']` is a shorthand for a full set of context options:

```typescript
{
  viewport: { width: 393, height: 851 },
  userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5)...',
  deviceScaleFactor: 2.75,
  isMobile: true,
  hasTouch: true,
}
```

Using device presets means your tests run in conditions that match what real users experience — not just a resized desktop window.

### The `webServer` option

`webServer` starts your app before tests run and stops it after. `reuseExistingServer: !process.env.CI` means:
- Local dev: if the server is already running, reuse it (faster iteration)
- CI: always start a fresh server (reproducible)

### `test.info().annotations`

You can attach metadata to any test result at runtime:

```typescript
test.info().annotations.push({ type: 'browser', description: browserName });
```

Annotations appear in the HTML report. They're useful for debugging — you can see which browser or config produced a failure.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

1. Add the missing projects to `playwright-m07.config.ts` (TODOs 1–3).
2. Complete `exercise.spec.ts` (TODOs 4–6).
3. Run with the local config:

```bash
npx playwright test tests/module-07-configuration \
  --config=tests/module-07-configuration/playwright-m07.config.ts
```

## Key Takeaways

1. Each project in `playwright.config.ts` runs all tests independently — n projects = n × test count.
2. `devices['Pixel 5']` configures viewport, userAgent, touch, and deviceScaleFactor together.
3. `reuseExistingServer: !process.env.CI` is the standard pattern for local dev speed + CI correctness.
4. `test.info().annotations.push(...)` adds searchable metadata to the HTML report.
5. `browserName` fixture tells you which project is running — use it for conditional skips.

## Going Deeper

- [Playwright docs: Configuration](https://playwright.dev/docs/test-configuration)
- [Playwright docs: Projects](https://playwright.dev/docs/test-projects)
