# M34: Cross-Browser Testing Strategy

## Learning Objectives

- Configure Playwright's `projects` array to run the same tests across Chromium, Firefox, and WebKit
- Identify the most common browser-specific behavior differences and why they occur
- Decide which tests need to run on all three browsers vs. Chromium-only
- Diagnose and fix a test that passes on Chromium but fails on WebKit
- Apply strategies to manage WebKit's stricter security model and occasional timing differences

## Concept

Playwright ships with three browser engines: Chromium (the engine behind Chrome and Edge), Firefox, and WebKit (the engine behind Safari). Writing tests that run on all three is one of Playwright's clearest advantages over tools that are Chromium-only — but it also comes with a learning curve, because browsers do not behave identically.

**Why cross-browser matters.** Your users do not all use Chrome. Safari holds roughly 20% of global browser market share, and on iOS it is the only engine available — all browsers on iPhone and iPad use WebKit under the hood regardless of their icon. A bug that only appears in Safari is a real bug. Testing on WebKit in CI catches it before a user does.

**How Playwright projects work.** The `projects` array in `playwright.config.ts` is the control surface for cross-browser testing. Each project entry maps a name to a `use` block that specifies the browser and optional device settings:

```
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
]
```

When you run `npx playwright test`, Playwright runs every test file once per project. Three projects means three runs. You can filter to a single browser with `--project chromium` when you need speed during development.

**Where browsers actually differ.** Most tests pass on all three browsers without modification. The cases where they diverge fall into a handful of categories.

*Date and time inputs* are the most common trap. The HTML `<input type="date">` renders natively in Chromium with a date picker, but WebKit on desktop often falls back to a plain text field expecting a specific format. If your test fills a date input with `fill('2024-01-15')`, it may work on Chromium but produce an empty field on WebKit. The fix is either to use the API to set data directly, or to detect the browser and use the format WebKit expects.

*Security model differences.* WebKit enforces stricter rules around cross-origin iframes, clipboard access, and certain storage APIs. A test that reads from the clipboard via `page.evaluate(() => navigator.clipboard.readText())` may require an explicit permission grant on WebKit that Chromium grants implicitly. Use `context.grantPermissions(['clipboard-read'])` defensively.

*Timing and animation.* Firefox and WebKit sometimes have slightly different reflow timings for CSS transitions and animations. A test that asserts a menu is visible immediately after a click may need `{ timeout: 5000 }` rather than the default to pass reliably on WebKit. This is not flakiness — it is a genuine behavior difference.

*Font rendering.* Visual regression screenshots from Chromium, Firefox, and WebKit look subtly different due to font hinting and anti-aliasing differences. For visual regression tests (`toHaveScreenshot()`), Playwright stores separate snapshots per browser in directories named after the project. Expect to maintain three sets of baselines.

**Deciding what to run where.** Not every test needs to run on all three browsers. Pure API tests, tests that only exercise JavaScript logic, or tests of features that are provably Chromium-only (like `page.pdf()`) should be tagged or configured to run on Chromium only. Playwright supports this with `test.skip(({ browserName }) => browserName !== 'chromium', 'PDF only works on Chromium')`. Reserve full cross-browser runs for tests that exercise user-facing UI paths.

**WebKit in CI.** WebKit on Ubuntu (the default GitHub Actions runner OS) works but may require `--with-deps` during installation to pull in the required system libraries. `npx playwright install --with-deps webkit` handles this. Chromium and Firefox are more self-contained.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Complete each TODO in `exercise.spec.ts` in order.
Run after each TODO:
```bash
npx playwright test tests/module-34-cross-browser --project chromium
```

To run all three browsers:
```bash
npx playwright test tests/module-34-cross-browser
```

## Key Takeaways

1. Each `projects` entry in `playwright.config.ts` runs your entire test suite — filter by `--project` for speed during development.
2. The most common cross-browser gap is date input format: `fill('2024-01-15')` works on Chromium, but WebKit may need a different approach.
3. `test.skip(({ browserName }) => ...)` is the correct way to skip a test for a specific browser — not a conditional `if` inside the test body.
4. Visual regression snapshots are browser-specific by design — maintain three baseline directories, not one.
5. WebKit in CI on Ubuntu requires `npx playwright install --with-deps webkit` to get the system libraries it needs.

## Going Deeper

- [Playwright docs: Projects](https://playwright.dev/docs/test-projects)
- [Playwright docs: Browser-specific tests](https://playwright.dev/docs/api/class-testinfo#test-info-browser-name)
- [Playwright docs: Emulation (devices)](https://playwright.dev/docs/emulation)
