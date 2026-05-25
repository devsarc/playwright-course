# M45: Debugging Strategies

## Learning Objectives

- Use Trace Viewer for post-mortem failure analysis: reading the action timeline, inspecting snapshots, and locating the exact failure point
- Attach a `page.on('console')` listener to capture browser console messages during a test
- Use `locator.highlight()` to visually confirm a locator matches the intended element before acting on it
- Combine `locator.count()` with `highlight()` to diagnose selector issues without running a full assertion

## Concept

A test failure is a symptom, not an explanation. The discipline of debugging is reconstructing what actually happened — not guessing from the error message. Playwright gives you three tools that, used together, cover almost every failure scenario: the Trace Viewer, console event listeners, and the locator highlight API.

**Trace Viewer.** Every Playwright test can record a trace — a ZIP file containing the full action sequence, DOM snapshots before and after each action, network requests, browser console output, and screenshots. When a test fails in CI and you cannot reproduce it locally, the trace file is the artifact that lets you reconstruct the failure precisely. Open one with `npx playwright show-trace trace.zip` or by uploading it to `trace.playwright.dev`.

Configure tracing in `playwright.config.ts`:
```
use: { trace: 'on-first-retry' }
```
This records traces only on the first retry of a failed test — capturing the failure without generating trace files for every passing test. In investigation mode, use `trace: 'on'` to record every test.

Reading a trace is a skill. The timeline at the top shows each action as a bar. Clicking an action shows the DOM snapshot immediately before and after it. If a `click()` hits the wrong element, you'll see it in the snapshot. If a `fill()` targeted an element that was stale, the snapshot shows the state of the page at that moment. The network panel shows which requests were in-flight during the failure.

**`page.on('console')`.** Browser console messages are invisible to Playwright by default — they go to the browser's JavaScript runtime, not to your terminal. Attaching a listener makes them visible:

```
page.on('console', msg => console.log(msg.type(), msg.text()));
```

This matters when debugging JavaScript errors in the application code during a test. A `TypeError` thrown by Lumio's React components will appear in the browser console, not in the Playwright output. Without a listener, that error is silent — the test just sees a timeout or a missing element. With a listener, the root cause appears in the terminal alongside the test output.

Filter by type to reduce noise: `msg.type() === 'error'` selects only errors. Use `msg.location()` to get the source file and line number.

**`locator.highlight()`.** Call `await locator.highlight()` in a headed test and Playwright draws a box around every matching element in the browser. This is the fastest way to visually verify that a locator points to the right element — faster than running a full assertion that might be poorly worded, faster than reading the HTML source, and faster than using the Inspector.

Combine it with `locator.count()` to understand how many elements match before acting:
```
console.log(await myLocator.count()); // 2 — need to scope the locator
await myLocator.highlight();          // see which two it found
```

If `count()` returns more than one, the locator is too broad. If it returns zero, the element isn't there yet — possibly a timing issue. If it returns one but `highlight()` draws a box on the wrong element, the selector is logically wrong despite being technically unique.

**Systematic debugging approach.** Most intermittent failures fall into four categories: timing (element not ready), scope (locator matches wrong element), state (prior test left unexpected state), and network (response slower than expected). Before adding waits or retries, diagnose first. Trace Viewer tells you whether the element was present. Console listener tells you whether the app threw an error. Highlight tells you what the locator actually found. Only after ruling these out should you reach for `waitFor` or `retry`.

**`locator.highlight()` is development-only.** Like `page.pause()`, it requires a headed browser and has no effect in headless mode. Remove it before committing — or better, never commit it. It belongs in your personal debugging workflow, not in checked-in test code.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Complete each TODO in `exercise.spec.ts` in order.
Run with `--headed` for the highlight TODO:
```bash
npx playwright test tests/module-45-debugging-strategies --headed
```

For trace analysis:
```bash
npx playwright test tests/module-45-debugging-strategies --trace on
npx playwright show-trace test-results/*/trace.zip
```

## Key Takeaways

1. Traces are the primary CI debugging artifact — configure `trace: 'on-first-retry'` in every project.
2. `page.on('console')` surfaces browser JavaScript errors that would otherwise be invisible to Playwright.
3. `locator.highlight()` visually confirms a locator targets the intended element without running an assertion.
4. `locator.count()` combined with `highlight()` diagnoses both over-matching and under-matching selectors.
5. Diagnose before adding waits — use trace + console + highlight to identify the root cause first.

## Going Deeper

- [Playwright docs: Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [Playwright docs: Debugging tests](https://playwright.dev/docs/debug)
- [Playwright docs: Page events](https://playwright.dev/docs/api/class-page#page-event-console)
