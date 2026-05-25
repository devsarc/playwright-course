# M25: Screenshot Testing

## Learning Objectives

- Capture full-page and viewport-scoped screenshots with `page.screenshot()` and understand when each is appropriate
- Use `locator.screenshot()` to isolate a single component from the rest of the page
- Apply the `clip` option to capture an arbitrary rectangular region without relying on element boundaries
- Configure format, quality, and output path options to produce production-ready PNG and JPEG artifacts
- Know the difference between taking a screenshot (M25) and asserting one as a regression baseline (M26)

## Concept

Screenshots are one of Playwright's most versatile tools, but they are often conflated with visual regression testing. Before writing a single line, it helps to separate these two ideas clearly. Taking a screenshot means calling an API that saves an image to disk. Asserting a screenshot means comparing that image against a previously approved baseline and failing the test if pixels differ. M25 is entirely about the first idea. The second lives in M26.

**page.screenshot() — the core API**

The simplest call is `await page.screenshot({ path: 'output.png' })`. Without options, Playwright captures the visible viewport at its current scroll position. That is usually fine for checking the top of a page, but it misses anything below the fold. To capture the entire document height, add `fullPage: true`. Playwright scrolls the page internally before taking the shot, so your viewport size does not limit what you can capture.

The `type` option accepts `'png'` or `'jpeg'`. PNG is lossless and the default. JPEG is useful when file size matters — for example, when attaching screenshots to a CI pipeline that stores hundreds of artifacts per week. Pair JPEG with a `quality` value between 0 and 100; 80 is a reasonable default for screenshots that will be reviewed by humans rather than compared pixel-by-pixel.

The `clip` option accepts a rectangle `{ x, y, width, height }` in CSS pixels. It tells Playwright to cut out that region from the otherwise full-page or viewport capture. This is useful when you care about a specific zone — a sticky header, a toast notification, a floating action button — and the element in question doesn't have a reliable test ID or is positioned absolutely in a way that makes locating it awkward.

**locator.screenshot() — element-scoped capture**

When you do have a reliable locator, `locator.screenshot()` is cleaner than clipping by coordinates. Playwright scrolls the element into view, waits for it to be stable, then captures exactly its bounding box. The result is an image of that component alone, with no surrounding page chrome. This is valuable for component-level documentation: a screenshot of a single task card, a modal, or a data table column tells a reader more than a full-page shot where the component is a tiny fraction of the total area.

The same `path`, `type`, and `quality` options apply to `locator.screenshot()` as to `page.screenshot()`.

**When to use screenshots in a test suite**

Screenshots in tests serve three distinct purposes. First, they are CI artifacts: attaching screenshots to a pull request pipeline lets reviewers verify the visual result of a change without running the app locally. Most CI platforms (GitHub Actions, GitLab CI, Buildkite) support uploading arbitrary files as artifacts — a screenshot of the dashboard after a major layout refactor communicates more than a hundred lines of diff.

Second, screenshots are debugging tools. When a test fails in CI and you cannot reproduce it locally, a screenshot taken at the moment of failure tells you immediately whether the problem is a missing element, an incorrect layout, or unexpected content. Playwright can be configured to take screenshots automatically on failure by setting `screenshot: 'only-on-failure'` (or `'on'` for every test) in the `use` block of `playwright.config.ts`. The images are stored under `test-results/` and attached to the HTML report automatically.

Third, screenshots power demo and documentation pipelines. Teams that maintain product screenshots in their docs or marketing site can run a Playwright script to regenerate all images on every release, eliminating the manual screenshot-taking step that is always the last thing to be updated.

**Automatic screenshots on failure**

In `playwright.config.ts`, the `use.screenshot` option controls when Playwright captures a page image automatically. The value `'only-on-failure'` is the most common choice — it costs nothing on passing tests and gives you a diagnostic image when something breaks. Setting it to `'on'` captures after every test, which is useful during initial development but noisy in large suites. Setting it to `'off'` (the default) means you rely on explicit calls in your tests.

**page.pdf() — a note on PDF export**

Playwright also exposes `page.pdf()`, which generates a PDF of the current page. The API is intentionally similar to `page.screenshot()` — you pass a `path` and options like `format`, `margin`, and `printBackground`. However, `page.pdf()` is available only in Chromium-based browsers. Attempting it in Firefox or WebKit throws an error. Keep this in mind if your project requires cross-browser PDF generation; in that case, server-side rendering with a library like Puppeteer or a dedicated PDF service is more appropriate. For Chromium-only pipelines, `page.pdf()` is a convenient one-line alternative to a full headless Chrome script.

**The M25 / M26 boundary**

To be precise: if your test calls `page.screenshot({ path: '...' })` and then checks that the returned buffer is truthy, you are in M25 territory. If your test calls `expect(page).toHaveScreenshot('name.png')`, you are in M26. The two APIs look similar but answer different questions. M25 answers "did we capture an image?" M26 answers "does the image look the same as last time?" Use M25 for documentation and debugging. Use M26 when you want to detect unintended visual regressions.

## Lumio Context

See [lumio-context.md](./lumio-context.md).

## Step-by-Step Tasks

1. Create the output directory `test-results/screenshots/` (Playwright will not create nested directories automatically if they don't exist — check the fixture or use `fs.mkdirSync` with `{ recursive: true }`).
2. Open `exercise.spec.ts` and read the `test.beforeEach` setup. Note the comment about auth — M16 covers auth patterns; here we focus on the screenshot API.
3. Complete **TODO 1**: call `page.screenshot()` with `fullPage: true` and save to `test-results/screenshots/dashboard-full.png`. Assert the returned buffer is truthy.
4. Complete **TODO 2**: call `page.screenshot()` without `fullPage` (viewport only) and save to `test-results/screenshots/dashboard-viewport.png`. Assert the buffer.
5. Complete **TODO 3**: use `page.getByTestId('task-card').first()` to get an element locator, then call `.screenshot()` on it and save to `test-results/screenshots/task-card.png`. Assert the buffer.
6. Complete **TODO 4**: use `locator.screenshot()` on the `task-card` locator — no path this time. Assert the buffer length is greater than zero to confirm pixels were captured.
7. Complete **TODO 5**: call `page.screenshot()` with a `clip` rectangle `{ x: 0, y: 0, width: 1280, height: 80 }` to capture just the header region. Save to `test-results/screenshots/header-clip.png`. Assert the buffer.
8. Complete **TODO 6** (stretch): call `page.screenshot({ path: '...', type: 'jpeg', quality: 80 })` on the same header clip. Observe the smaller file size.

Run the suite:

```bash
npx playwright test tests/module-25-screenshot-testing
```

After a passing run, open `test-results/screenshots/` and inspect the generated images. Compare the full-page PNG with the viewport PNG — the full-page version should be noticeably taller.

## Key Takeaways

1. Use `fullPage: true` when you need to capture content below the fold; use the default (viewport-only) when you only care about what is visible without scrolling.
2. Prefer `locator.screenshot()` over `clip` when the target region has a stable test ID — element-scoped screenshots are more resilient to layout shifts.
3. Use `clip` when you need to capture a region by coordinates (e.g., a fixed header) that does not map cleanly to a single DOM element.
4. Configure `screenshot: 'only-on-failure'` in `playwright.config.ts` so you get diagnostic images in CI without paying the cost on every passing test.
5. `page.screenshot()` and `locator.screenshot()` are capture tools; `toHaveScreenshot()` is a comparison tool. Use the right one for the job.

## Going Deeper

- [Playwright docs: Screenshots](https://playwright.dev/docs/screenshots)
- [Playwright docs: Test configuration — screenshot option](https://playwright.dev/docs/test-configuration#automatic-screenshots)
- [Playwright docs: page.pdf()](https://playwright.dev/docs/api/class-page#page-pdf)
