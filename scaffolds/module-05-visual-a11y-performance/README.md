# Lesson 05: Visual Testing, Accessibility & Performance

*Combines former modules M25–M30.*

## Learning Objectives

### Part 1 — Screenshot Testing (formerly M25)

- Capture full-page and viewport-scoped screenshots with `page.screenshot()` and understand when each is appropriate
- Use `locator.screenshot()` to isolate a single component from the rest of the page
- Apply the `clip` option to capture an arbitrary rectangular region without relying on element boundaries
- Configure format, quality, and output path options to produce production-ready PNG and JPEG artifacts
- Know the difference between taking a screenshot (M25) and asserting one as a regression baseline (Part 2 of this lesson (formerly M26))

### Part 2 — Visual Regression Testing (formerly M26)

- Take full-page and element-scoped screenshots with `toHaveScreenshot()`
- Understand the baseline creation workflow (first run writes, second run compares)
- Update baselines intentionally with `--update-snapshots`
- Tune thresholds to handle minor rendering differences
- Store baselines in per-platform directories so macOS and Linux CI don't overwrite each other's snapshots
- Mask dynamic content (timestamps, user avatars, random IDs) using the `mask` option to prevent false failures
- Resolve snapshot conflicts after a team member updates baselines on a different OS: use `--update-snapshots` locally with the correct platform flag

### Part 3 — ARIA Snapshot Testing (formerly M27)

- Explain what the accessibility tree is and how it differs from the DOM, and why that difference matters for testing
- Use `toMatchAriaSnapshot()` to assert the structural shape of the accessibility tree as inline YAML
- Generate the initial ARIA snapshot string using `--update-snapshots` or the Trace Viewer InspectorTab
- Decide when ARIA snapshots are a better fit than visual screenshots (dynamic content, responsive layouts, semantic regressions)
- Update ARIA snapshots intentionally after deliberate UI changes without silencing legitimate failures

### Part 4 — Accessibility Testing (formerly M28)

- Run automated WCAG 2.1 AA checks with `@axe-core/playwright`
- Scope scans with `.withTags()` and `.include()`
- Interpret axe violation output (id, impact, nodes)
- Complement automated scans with manual keyboard-navigation assertions
- Filter axe rules by WCAG level: `.withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])` to commit to specific conformance levels
- Assert tab order: `press('Tab')` repeatedly and verify `page.evaluate(() => document.activeElement.getAttribute('data-testid'))` matches expected sequence
- Assert focus management: after opening a modal, confirm focus is trapped inside; after closing, confirm focus returns to the trigger
- Verify ARIA role and label correctness: `getByRole('dialog', { name: 'Delete task' })` fails if the role or name is wrong

### Part 5 — Performance Testing & Measurement (formerly M29)

- Measure page load with the Navigation Timing API via `page.evaluate()`
- Capture First Contentful Paint using `performance.getEntriesByName()`
- Assert on interaction latency using `Date.now()` deltas
- Intercept responses to enforce JS bundle size budgets
- Collect LCP, TTFB, FID, and CLS via `PerformanceObserver` inside `page.evaluate()`
- Read CDP performance metrics with `cdpSession.send('Performance.getMetrics')`
- Understand `page.coverage` at a conceptual level: what coverage data is and what it measures (CDP mechanism is in Lesson 13 (formerly M62))
- Track performance regressions over time by writing results to a JSON file and comparing runs

### Part 6 — HAR & DevTools Deep Analysis (formerly M30)

- Parse a recorded HAR file programmatically and rank requests by total response time
- Distinguish TTFB (`wait`) from download (`receive`) in HAR timing entries and explain what each implicates
- Simulate controlled network conditions using CDP throttling rather than OS-level tools, and explain why this produces more reproducible results
- Generate a curl command from HAR request data to reproduce an API call outside of any test
- Articulate the difference between a HAR file (network log) and a Playwright trace (full test timeline)

## Concept

### Part 1 — Screenshot Testing (formerly M25)

Screenshots are one of Playwright's most versatile tools, but they are often conflated with visual regression testing. Before writing a single line, it helps to separate these two ideas clearly. Taking a screenshot means calling an API that saves an image to disk. Asserting a screenshot means comparing that image against a previously approved baseline and failing the test if pixels differ. M25 is entirely about the first idea. The second lives in Part 2 of this lesson (formerly M26).

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

To be precise: if your test calls `page.screenshot({ path: '...' })` and then checks that the returned buffer is truthy, you are in M25 territory. If your test calls `expect(page).toHaveScreenshot('name.png')`, you are in Part 2 of this lesson (formerly M26). The two APIs look similar but answer different questions. M25 answers "did we capture an image?" Part 2 of this lesson (formerly M26) answers "does the image look the same as last time?" Use M25 for documentation and debugging. Use Part 2 of this lesson (formerly M26) when you want to detect unintended visual regressions.

### Part 2 — Visual Regression Testing (formerly M26)

Visual regression catches what functional tests can't:
- A button's background changed from blue to grey
- A grid's spacing shrank by 4px
- Dark mode colours leaked into light mode

`toHaveScreenshot()` does pixel-by-pixel comparison. The first run creates the
baseline; subsequent runs diff against it.

**Workflow:**
1. Write test → run → baseline created → test fails (expected — no baseline yet)
2. Review the new PNG in `__screenshots__/`
3. Re-run → test passes (baseline matches itself)
4. UI changes → test fails → inspect diff → update with `--update-snapshots`

**Per-platform snapshots:**
```typescript
// playwright.config.ts
snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}-{platform}{ext}',
```
This stores `dashboard-linux.png` and `dashboard-darwin.png` separately, so cross-platform CI doesn't fail on minor rendering differences.

**Masking dynamic regions:**
```typescript
await expect(page).toHaveScreenshot('dashboard.png', {
  mask: [page.getByTestId('timestamp'), page.getByTestId('user-avatar')],
});
```
Masked regions are replaced with a solid colour before comparison — they never cause false failures.

### Part 3 — ARIA Snapshot Testing (formerly M27)

Every page has two representations: the DOM and the accessibility tree. The DOM is what browsers render — a tree of HTML elements, CSS classes, and JavaScript-managed state. The accessibility tree is what screen readers and other assistive technologies consume. It is derived from the DOM but transformed: ARIA roles replace tag names, accessible names replace visual labels, and many presentational nodes are filtered out entirely. A `<div>` with `role="button"` and `aria-label="Close"` appears in the accessibility tree as a button named "Close", regardless of how it is styled.

This distinction matters enormously for testing. Two screenshots can look identical while the accessibility tree has completely broken. A modal might render visually with the right text but be missing `role="dialog"`, making it impossible for a screen reader user to understand they are in a focused context. A button might display an icon but have no accessible name, so it reads only as "button" — meaningless to someone using a screen reader. These are semantic regressions, and pixel-level visual tests will never catch them.

`toMatchAriaSnapshot()` is Playwright's answer to this class of regression. You pass an inline YAML string that describes the expected shape of the accessibility tree for a given locator. Playwright serialises the real tree, normalises it to YAML, and compares it to your string. If a role changes, a name disappears, or a heading level shifts, the test fails — even if the page looks completely unchanged.

The YAML format maps directly to accessibility tree concepts. Each line is a node: the token before any quoted text is the role, and the quoted text is the accessible name. Indentation expresses parent-child relationships. A heading at level 1 becomes `- heading "Kanban Board" [level=1]`. A list with two items becomes a `- list:` parent with `- listitem` children on the next indented level. You can use exact strings or JavaScript-style regular expressions (e.g. `/todo|done/i`) for values that might vary.

Generating the first snapshot by hand is tedious, and Playwright knows it. The intended workflow is to write the test with an empty expected string — or no string at all — and then run it with `--update-snapshots`. Playwright will capture the real accessibility tree and write it directly into your test file as the expected YAML. You review the output, trim it to the parts you actually want to assert, commit it, and from then on the test guards that structure.

The Trace Viewer InspectorTab is an even faster path. After running a test with tracing enabled, open the trace, click on any action, and the Inspector tab shows the accessibility tree for the page state at that moment. You can click any node to copy it as YAML — paste it straight into `toMatchAriaSnapshot()` and you are done.

ARIA snapshots shine in scenarios where visual snapshots struggle. Dynamic content — timestamps, user avatars, live counters — causes constant false failures in visual tests because the pixels keep changing. In ARIA snapshots you simply omit those nodes from the expected YAML or match them with a regex. Responsive layouts are another case: a component can reflow entirely between breakpoints while keeping its semantic structure intact. Asserting the accessibility tree at any viewport will pass as long as the roles and names are correct, regardless of layout changes.

The flip side is that ARIA snapshots are not a substitute for visual tests when you genuinely care about appearance. They do not catch a button turning red, a card losing its shadow, or a column narrowing by 20px. Use both: visual regression tests for appearance, ARIA snapshots for semantics.

When you intentionally redesign part of the UI — renaming a button, splitting a modal into steps, promoting a `div` to a `section` — existing ARIA snapshots will fail on purpose. The fix is the same workflow as snapshot creation: run `--update-snapshots`, review the diff in git, and commit. The key phrase is "review the diff". Never run `--update-snapshots` reflexively to silence a red test without understanding what changed. Each update is you signing off on a new accessibility contract for that component.

### Part 4 — Accessibility Testing (formerly M28)

axe-core checks ~100 WCAG rules automatically:
- Missing alt text
- Insufficient colour contrast
- Non-descriptive link text ("click here")
- Missing form labels
- Elements not reachable by keyboard

Automated scans catch ~30–40% of accessibility issues. The rest require
manual testing (e.g. screen reader flow, logical tab order).

**Rule of thumb:** Run axe on every page in your test suite. It's a 3-line
addition to existing tests and catches regressions before they ship.

### Part 5 — Performance Testing & Measurement (formerly M29)

Playwright is not a performance profiling tool, but it can enforce budgets:

```typescript
// Navigation timing
const dcl = await page.evaluate(() =>
  performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
);
expect(dcl).toBeLessThan(3000);

// Resource size budget
page.on('response', async (res) => {
  if (res.headers()['content-type']?.includes('javascript')) {
    const size = (await res.body()).length;
    expect(size).toBeLessThan(500 * 1024);
  }
});
```

### Part 6 — HAR & DevTools Deep Analysis (formerly M30)

HAR stands for HTTP Archive. It is a JSON file with a specific schema, and inside it lives a complete record of every network transaction the browser made during a session. Each entry in the `log.entries` array represents one request-response pair and includes the URL, method, status code, request and response headers, the response body (optionally), and a detailed timing breakdown.

The timing breakdown is where HAR analysis becomes genuinely useful for performance work. Each `timings` object inside an entry carries six fields: `dns` (name resolution time), `connect` (TCP handshake), `ssl` (TLS negotiation), `send` (time to transmit the request), `wait` (time from request sent to first byte received, commonly called TTFB — Time To First Byte), and `receive` (time to download the full response body). The sum of these fields is the total duration for that request.

When you are trying to find performance bottlenecks, the `wait` field is almost always the most meaningful one for API calls. A high `wait` value means the server spent a long time generating the response — that is a backend problem. A high `receive` value on a large payload means the response itself is big — that might be a data-shaping or pagination problem. Sorting HAR entries by total duration and then examining the `wait` vs `receive` split on the slowest three gives you an immediate diagnosis strategy: is this a slow server, or a large payload?

Finding those slowest requests is straightforward once you treat the HAR as data. Load the file with `fs.readFileSync`, parse it as JSON, access `har.log.entries`, sort by the sum of all timing fields, and take the top three. This is exactly the kind of analysis a developer would do manually in the browser's Network tab, but done programmatically it becomes part of your test output and can be asserted against.

Trace Viewer offers a complementary view. When Playwright records a trace, it captures a full timeline of the test: every action, screenshot, console message, and network request. The Network panel inside Trace Viewer shows all requests with their timing waterfall. Crucially, you can right-click any request in Trace Viewer and copy it as a curl command. This lets you step outside the test harness entirely and reproduce the exact API call — same URL, same headers, same cookies — from your terminal or Postman. This is extremely useful when debugging a failing API assertion: you can isolate the HTTP call from everything else. HAR data gives you the same raw material, and exercise 4 shows how to reconstruct a curl command programmatically from HAR entries so you understand exactly what Trace Viewer is doing for you.

HAR and trace are different artifacts that serve different purposes. A HAR file is a network-only log. It tells you nothing about what the test was doing, what assertions ran, or what the page looked like at any given moment. A Playwright trace is a full test recording — it includes network data but also screenshots at every step, the action log, and console output. Use HAR when you want to analyze or replay network traffic. Use traces when you want to understand what happened during a test run.

CDP network throttling deserves special attention because it is substantially better than OS-level throttling (like macOS Network Link Conditioner or `tc` on Linux) for performance testing. OS-level throttling affects all processes on the machine — your test runner, your dev server, your database — which introduces noise and can produce misleading results. CDP throttling is applied at the browser level, inside a single browser context. It simulates the network conditions the browser experiences as if it were on a slow connection, while leaving the local server and test runner unaffected. This means results are reproducible across machines and CI environments. The three parameters — `downloadThroughput`, `uploadThroughput`, and `latency` — map directly to the network presets you see in Chrome DevTools. A simulated 3G connection uses roughly 750 Kbps down, 250 Kbps up, and 100ms of added latency. Establishing this baseline, measuring LCP under it, and comparing against the fast-network baseline is a meaningful regression test pattern.

## Lumio Context

See [lumio-context.md](./lumio-context.md).

## Step-by-Step Tasks

### Part 1 — Screenshot Testing

1. Create the output directory `test-results/screenshots/` (Playwright will not create nested directories automatically if they don't exist — check the fixture or use `fs.mkdirSync` with `{ recursive: true }`).
2. Open `exercise.spec.ts` and read the `test.beforeEach` setup. Note the comment about auth — Lesson 03 (formerly M16) covers auth patterns; here we focus on the screenshot API.
3. Complete **TODO 1.1**: call `page.screenshot()` with `fullPage: true` and save to `test-results/screenshots/dashboard-full.png`. Assert the returned buffer is truthy.
4. Complete **TODO 1.2**: call `page.screenshot()` without `fullPage` (viewport only) and save to `test-results/screenshots/dashboard-viewport.png`. Assert the buffer.
5. Complete **TODO 1.3**: use `page.getByTestId('task-card').first()` to get an element locator, then call `.screenshot()` on it and save to `test-results/screenshots/task-card.png`. Assert the buffer.
6. Complete **TODO 1.4**: use `locator.screenshot()` on the `task-card` locator — no path this time. Assert the buffer length is greater than zero to confirm pixels were captured.
7. Complete **TODO 1.5**: call `page.screenshot()` with a `clip` rectangle `{ x: 0, y: 0, width: 1280, height: 80 }` to capture just the header region. Save to `test-results/screenshots/header-clip.png`. Assert the buffer.
8. Complete **TODO 1.6** (stretch): call `page.screenshot({ path: '...', type: 'jpeg', quality: 80 })` on the same header clip. Observe the smaller file size.

Run the suite:

```bash
npx playwright test tests/module-05-visual-a11y-performance
```

After a passing run, open `test-results/screenshots/` and inspect the generated images. Compare the full-page PNG with the viewport PNG — the full-page version should be noticeably taller.

Validate this part only:
```bash
npx playwright test tests/module-05-visual-a11y-performance -g "Part 1 — Screenshot Testing (formerly M25)"
```

### Part 2 — Visual Regression Testing

Validate this part only:
```bash
npx playwright test tests/module-05-visual-a11y-performance -g "Part 2 — Visual Regression Testing (formerly M26)"
```

### Part 3 — ARIA Snapshot Testing

1. Navigate to `/dashboard` and use `getByTestId('kanban-board')` to scope your first snapshot to the board container.
2. Complete **TODO 3.1** and **TODO 3.2**: add the `'kanban-board'` testid and write the YAML for the board heading and list structure.
3. Complete **TODO 3.3** and **TODO 3.4**: locate the first task card and assert its listitem/heading/text structure.
4. Complete **TODO 3.5**: assert the accessible name of the "Add task" button.
5. Complete **TODO 3.6**: click "Add task", wait for the dialog, and assert the full modal structure including form controls.
6. Complete **TODO 3.7**: press Escape, then assert the dialog is no longer visible in the accessibility tree.
7. Read **TODO 3.8** and run the module with `--update-snapshots` to see Playwright rewrite the expected YAML automatically.

**Validation command:**

```bash
npx playwright test tests/module-05-visual-a11y-performance/exercise.spec.ts
```

To regenerate all snapshots after a deliberate UI change:

```bash
npx playwright test tests/module-05-visual-a11y-performance/exercise.spec.ts --update-snapshots
```

Validate this part only:
```bash
npx playwright test tests/module-05-visual-a11y-performance -g "Part 3 — ARIA Snapshot Testing (formerly M27)"
```

### Part 4 — Accessibility Testing

Validate this part only:
```bash
npx playwright test tests/module-05-visual-a11y-performance -g "Part 4 — Accessibility Testing (formerly M28)"
```

### Part 5 — Performance Testing & Measurement

Validate this part only:
```bash
npx playwright test tests/module-05-visual-a11y-performance -g "Part 5 — Performance Testing & Measurement (formerly M29)"
```

### Part 6 — HAR & DevTools Deep Analysis

**Task 1: Record the HAR**

```bash
npx playwright test tests/module-05-visual-a11y-performance -g "record"
```

After this runs, verify `test-results/dashboard.har` exists before proceeding to Task 2.

**Task 2: Identify the three slowest requests**

```bash
npx playwright test tests/module-05-visual-a11y-performance -g "slowest"
```

Read the test output to see which endpoints are flagged. You should see the three Lumio API routes near the top.

**Task 3: CDP throttling and LCP**

```bash
npx playwright test tests/module-05-visual-a11y-performance -g "throttle"
```

Compare the LCP value reported here against the unthrottled LCP from Part 5 of this lesson (formerly M29). The delta should be significant.

**Task 4: Generate curl from HAR**

```bash
npx playwright test tests/module-05-visual-a11y-performance -g "curl"
```

The generated curl command will be printed to the test output. You can run it directly in your terminal to reproduce the API call.

**Run all four together:**

```bash
npx playwright test tests/module-05-visual-a11y-performance/exercise.spec.ts
```

Validate this part only:
```bash
npx playwright test tests/module-05-visual-a11y-performance -g "Part 6 — HAR & DevTools Deep Analysis (formerly M30)"
```

## Validate (full lesson)

```bash
npx playwright test tests/module-05-visual-a11y-performance
```

## Key Takeaways

### Part 1 — Screenshot Testing

1. Use `fullPage: true` when you need to capture content below the fold; use the default (viewport-only) when you only care about what is visible without scrolling.
2. Prefer `locator.screenshot()` over `clip` when the target region has a stable test ID — element-scoped screenshots are more resilient to layout shifts.
3. Use `clip` when you need to capture a region by coordinates (e.g., a fixed header) that does not map cleanly to a single DOM element.
4. Configure `screenshot: 'only-on-failure'` in `playwright.config.ts` so you get diagnostic images in CI without paying the cost on every passing test.
5. `page.screenshot()` and `locator.screenshot()` are capture tools; `toHaveScreenshot()` is a comparison tool. Use the right one for the job.

### Part 2 — Visual Regression Testing

1. Scope screenshots to elements, not full pages, for more stable tests.
2. Commit baseline PNGs to git — CI needs them.
3. `--update-snapshots` is intentional; don't run it blindly.
4. `maxDiffPixelRatio` handles anti-aliasing differences across OS/GPU.

### Part 3 — ARIA Snapshot Testing

1. The accessibility tree is not the DOM — always test the tree when you care about assistive technology compatibility.
2. `toMatchAriaSnapshot()` guards semantic structure; `toHaveScreenshot()` guards visual appearance. Use both, for different regressions.
3. Generate the initial YAML with `--update-snapshots` or the Trace Viewer InspectorTab rather than hand-authoring it from scratch.
4. ARIA snapshots are more stable than visual ones for dynamic content — omit or regex-match any node whose text changes at runtime.
5. Every `--update-snapshots` run is a deliberate decision: review the git diff before committing, because you are approving a new accessibility contract.

### Part 4 — Accessibility Testing

1. `new AxeBuilder({ page }).analyze()` returns `{ violations, passes, incomplete }`.
2. Scope with `.withTags()` to run only the rules your project commits to.
3. Scope with `.include()` to test a specific component in isolation.
4. Keyboard navigation tests must be written manually — axe doesn't test interaction flow.

### Part 5 — Performance Testing & Measurement

1. `performance.timing` lives in the browser — access it via `page.evaluate()`.
2. `page.on('response', ...)` lets you assert on every network response.
3. Performance budgets in E2E tests are regression guards, not benchmarks.
4. Run on production builds for meaningful numbers — dev servers are significantly slower.

### Part 6 — HAR & DevTools Deep Analysis

1. Sort HAR entries by total `timings` sum to identify the slowest requests; then split `wait` vs `receive` to diagnose whether the problem is server latency or payload size.
2. CDP throttling (`newCDPSession` + `Network.emulateNetworkConditions`) is reproducible and isolated — it throttles only the browser context, not the dev server.
3. HAR is a network log; a Playwright trace is a full test recording. They complement each other but are not interchangeable.
4. Generating a curl command from HAR data (or from Trace Viewer) lets you reproduce an API call in isolation — the fastest path to narrowing down whether a bug is in the request, the server, or the test.
5. `wait` (TTFB) in HAR timings is the metric most directly under the server's control; `receive` reflects payload size.

## Going Deeper

### Part 1 — Screenshot Testing

- [Playwright docs: Screenshots](https://playwright.dev/docs/screenshots)
- [Playwright docs: Test configuration — screenshot option](https://playwright.dev/docs/test-configuration#automatic-screenshots)
- [Playwright docs: page.pdf()](https://playwright.dev/docs/api/class-page#page-pdf)

### Part 2 — Visual Regression Testing

- [Playwright docs: Screenshots](https://playwright.dev/docs/screenshots)
- [Playwright docs: Visual comparisons](https://playwright.dev/docs/test-snapshots)
- Part 1 of this lesson (formerly M25) covers `page.screenshot()` and `locator.screenshot()` as general-purpose capture tools (docs, debugging, CI artifacts). Part 2 of this lesson (formerly M26) (this module) is specifically about comparison-based regression detection using `toHaveScreenshot()`.

### Part 3 — ARIA Snapshot Testing

- [Playwright docs: ARIA snapshots](https://playwright.dev/docs/aria-snapshots)
- [Playwright docs: Accessibility testing](https://playwright.dev/docs/accessibility-testing)
- [Playwright docs: Trace Viewer](https://playwright.dev/docs/trace-viewer)

### Part 4 — Accessibility Testing

- [axe-core/playwright docs](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright)
- [WCAG 2.1 quick reference](https://www.w3.org/WAI/WCAG21/quickref/)

### Part 5 — Performance Testing & Measurement

- [MDN: Navigation Timing API](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API/Navigation_timing)
- [Playwright docs: page.evaluate()](https://playwright.dev/docs/api/class-page#page-evaluate)
- Lesson 13 (formerly M62) (CDP Direct Access) covers how `page.coverage` works under the hood via a raw CDP session
- Lesson 16 (formerly M76) (Uptime & Performance Monitoring) covers long-term LCP trend tracking across deployments

### Part 6 — HAR & DevTools Deep Analysis

- [HAR 1.2 specification (softwareishard.com)](http://www.softwareishard.com/blog/har-12-spec/) — the authoritative field-by-field reference for HAR entries and timings
- [Playwright docs: CDP sessions](https://playwright.dev/docs/api/class-cdpsession) — how to open a raw CDP session and send protocol commands
- [Chrome DevTools Protocol: Network domain](https://chromedevtools.github.io/devtools-protocol/tot/Network/#method-emulateNetworkConditions) — the full `Network.emulateNetworkConditions` parameter reference, including preset values for 3G, 4G, and offline
