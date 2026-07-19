# Lesson 09: Debugging, Tracing & Reporting

*Combines former modules M42–M46.*

## Learning Objectives

### Part 1 — Playwright Inspector & Codegen (formerly M42)

- Use `npx playwright codegen` to record a browser interaction and generate a test scaffold
- Evaluate the quality of codegen output: when the generated locators are robust and when they are fragile
- Pause a running test mid-execution with `page.pause()` to drop into the Inspector for live debugging
- Use the Inspector's locator picker to generate and verify a locator without running the full test
- Recognize the cases where codegen produces wrong or brittle output and manually correct it

### Part 2 — Tracing & Trace Viewer (formerly M43)

- Record traces with `context.tracing.start/stop()` and view them in the Trace Viewer
- Capture console logs with `page.on('console', ...)`
- Catch page errors with `page.on('pageerror', ...)`
- Configure automatic tracing and screenshots in `playwright.config.ts`
- Use `context.tracing.stopChunk()` to capture a trace snapshot mid-test without stopping the full trace
- Navigate all Trace Viewer tabs: action list, console, network, filmstrip, inspector (ARIA snapshots), annotations, attachments, log
- Generate a curl command from the Trace Viewer network tab to reproduce an API call outside Playwright
- Use the live Trace Viewer (`--ui` mode) during development to inspect tests as they run

### Part 3 — Reporters Deep Dive (formerly M44)

- Configure multiple reporters simultaneously in `playwright.config.ts` and understand what each produces
- Distinguish between interactive reporters (HTML, dot, line) and machine-readable reporters (JUnit, JSON, GitHub annotations)
- Understand how blob reports support sharded test runs and how `createMergedReport` combines them
- Recognize what the Reporter interface looks like and what lifecycle events a custom reporter would handle

### Part 4 — Debugging Strategies (formerly M45)

- Use Trace Viewer for post-mortem failure analysis: reading the action timeline, inspecting snapshots, and locating the exact failure point
- Attach a `page.on('console')` listener to capture browser console messages during a test
- Use `locator.highlight()` to visually confirm a locator matches the intended element before acting on it
- Combine `locator.count()` with `highlight()` to diagnose selector issues without running a full assertion

### Part 5 — test.step() & Runtime Attachments (formerly M46)

- Use `test.step()` to group related actions into named steps that appear in the Trace Viewer and HTML report
- Attach files and screenshots to a test report using `testInfo.attach()`
- Add metadata annotations to a test using `testInfo.annotations`
- Access `testInfo` from inside a test via the second argument to the test callback

## Concept

### Part 1 — Playwright Inspector & Codegen (formerly M42)

Playwright ships with two related interactive tools: `codegen` and the Inspector. Both are built on the same underlying mechanism — they open a real browser with Playwright's overlay UI attached. Understanding both gives you a significant productivity boost, but only if you understand their limitations.

**Codegen.** Running `npx playwright codegen http://localhost:3000` opens a headed browser alongside a code panel. As you interact with the page — clicking, typing, navigating — Playwright generates test code in real time. When you're done, you copy the generated code into a spec file. Codegen is at its best when: the app renders standard semantic HTML, you're recording a linear happy-path flow, and you want a starting scaffold to refine. It is not a replacement for writing tests thoughtfully.

Where codegen fails. Codegen records what you did, not what the test should verify. A recorded click sequence has no assertions. You must add them. More subtly, codegen often generates CSS selectors or XPath when no semantic locator is available — `page.locator('#__next > div:nth-child(2) > button')` will break the moment the DOM structure changes. The discipline from Lesson 00 (foundations) (formerly M02–M04) is what lets you evaluate codegen output critically and replace fragile selectors with `getByRole`, `getByLabel`, and `getByTestId`. Codegen is a productivity tool for people who already know how to write tests. For people who don't, it teaches the wrong habits.

**Multi-language codegen.** Codegen supports TypeScript, JavaScript, Python, Java, and C#. The browser control panel has a language selector. All languages use the same locator strategy and assertion style — the concepts transfer. If your team has Python engineers writing Playwright, `npx playwright codegen --target python http://localhost:3000` generates Python test code.

**`page.pause()` and the Inspector.** Add `await page.pause()` anywhere in a test and run it in headed mode or with `PWDEBUG=1`. The test execution pauses and the Inspector opens. From here you can: step through remaining test actions one by one; use the locator picker to click any element and see what Playwright would generate; edit the locator in the Inspector and see which elements it matches in real time; generate assertion code from the "Assertions" panel. This is the fastest way to debug a test mid-execution without adding print statements.

**Locator picker.** The Inspector's locator picker is the most useful part. Clicking an element shows the locator Playwright would use to find it, with a live count of how many elements match. You can edit the locator string and the highlighting updates immediately. This is how you verify a `getByRole` or `getByTestId` matches exactly one element before committing it to the spec file.

**PWDEBUG=1.** Setting the environment variable `PWDEBUG=1` before running tests (e.g., `PWDEBUG=1 npx playwright test`) opens the Inspector at the start of every test. Useful for investigating a failing test without modifying its source code.

This module is placed late in Phase 11 deliberately. Learners who have written 41 modules of tests by hand have a strong mental model of locators and assertions. Codegen now becomes a scaffolding accelerator rather than a crutch. If introduced at Lesson 00 (foundations) (formerly M01), it teaches the wrong habits; at M42, it amplifies skills you already have.

### Part 2 — Tracing & Trace Viewer (formerly M43)

The Trace Viewer is Playwright's most powerful debugging tool. A trace zip
contains screenshots, DOM snapshots, network logs, and a timeline — everything
you need to understand why a test failed in CI without re-running it.

**Recommended config for CI:**
```typescript
use: {
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```

**View a trace locally:**
```bash
npx playwright show-trace test-results/traces/trace.zip
# or open https://trace.playwright.dev and drag the zip
```

### Part 3 — Reporters Deep Dive (formerly M44)

Every Playwright test run produces output. By default you see the `list` reporter — a stream of pass/fail lines to the terminal. But that's the minimum viable option. Playwright ships with eight built-in reporters and a public `Reporter` interface for writing your own. Understanding which reporters to use in which context, and how to combine them, is what separates a professional CI pipeline from a fragile one.

**The built-in reporters.** The `dot` reporter prints one character per test — useful for dense output at scale. The `line` reporter overwrites the current terminal line to show progress without flooding the scroll buffer. The `list` reporter (the default) prints a line per test as it completes. These three are terminal-oriented and produce nothing you can read after the run.

The `html` reporter generates a full interactive report in `playwright-report/index.html`. It records pass/fail status, test duration, console output, and attached screenshots. If a test fails, the HTML report links directly to the trace file for that test. Run `npx playwright show-report` to open it after a run. The HTML report is the primary debugging artifact for local development and for async review by teammates.

The `json` reporter writes `test-results.json` — a machine-readable representation of every test, suite, and result. CI pipelines parse this file to extract metrics, track flakiness rates, or feed custom dashboards. The structure mirrors the suite tree exactly.

The `junit` reporter writes `junit-results.xml`. Jenkins, CircleCI, GitHub Actions, and most CI systems can consume JUnit XML natively — they parse it to display test results inline in pull request checks without any additional tooling.

The `github` reporter outputs GitHub Actions annotations. When running inside a GitHub Actions workflow, it writes `::error file=...::` log lines that GitHub converts into inline PR comments on the relevant source file. It requires no configuration beyond listing it as a reporter.

**Combining reporters.** The `reporter` key in `playwright.config.ts` accepts an array of `[name, options]` tuples. A production configuration might run the `list` reporter for terminal feedback, `html` for local debugging, and `junit` for CI parsing simultaneously. Each reporter runs independently against the same result stream.

```
reporter: [
  ['list'],
  ['html', { outputFolder: 'playwright-report' }],
  ['junit', { outputFile: 'junit-results.xml' }],
  ['github'],
]
```

**Blob reporter and sharded runs.** When tests are split across multiple machines using `--shard`, each machine has only a partial view of the results. The `blob` reporter serializes one machine's output to a binary `.zip` file. After all shards complete, `npx playwright merge-reports --reporter html ./blob-results` reads every blob, merges them, and produces a single unified HTML report as if all tests had run on one machine. This is the standard pattern for large parallel CI pipelines.

**The Reporter interface.** Playwright's custom reporter API is built on lifecycle events: `onBegin` fires when the run starts (receives the full test suite tree), `onTestBegin` fires before each test, `onTestEnd` fires after each test (receives the result), and `onEnd` fires after all tests complete. A custom reporter implements whichever events it cares about and writes to whatever output it needs — a database, a Slack webhook, a custom file format. The Playwright source exports the `Reporter` interface from `@playwright/test/reporter`, and the built-in reporters implement it. Understanding this interface helps you evaluate third-party reporters and decide when to build your own.

**When to write a custom reporter.** Most teams never need one. The built-in reporters cover: human review (HTML), CI parsing (JUnit), metrics (JSON), and PR comments (GitHub). Write a custom reporter only when you need an output that none of the built-ins produce — for example, writing results to your internal observability platform, or streaming test events to a real-time dashboard during a long run.

### Part 4 — Debugging Strategies (formerly M45)

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

### Part 5 — test.step() & Runtime Attachments (formerly M46)

A Playwright test that creates a task, moves it across columns, and assigns a user might have 30+ individual actions. In the Trace Viewer, that's 30 bars in the timeline — and finding the one that failed requires reading every label. `test.step()` solves this by grouping actions under a named heading. The timeline collapses the group, the HTML report renders it as an indented section, and the step name appears in the failure message. The test becomes readable as a document.

**`test.step()`.** The function takes a name and an async callback. Any actions inside the callback are grouped under that name:

```
await test.step('Create task', async () => {
  await page.getByRole('button', { name: 'Add task' }).click();
  await page.getByTestId('task-title-input').fill('My task');
  await page.getByTestId('task-submit').click();
});
```

In the HTML report and Trace Viewer, the three actions collapse into "Create task". If any action inside fails, the step name appears in the error output: `Error in "Create task": locator.click: ...`. This makes failures self-describing even without reading the full stack trace.

Steps nest naturally. A step can contain other `test.step()` calls, creating an indented hierarchy in the report. A common pattern: top-level steps describe the phase ("Login", "Create task", "Verify board state"), nested steps describe sub-actions.

**`testInfo.attach()`.** The `testInfo` object is available as the second argument to the test callback: `test('name', async ({ page }, testInfo) => { ... })`. Its `attach` method adds a named artifact to the HTML report:

```
await testInfo.attach('dashboard screenshot', {
  body: await page.screenshot(),
  contentType: 'image/png',
});
```

After the run, the HTML report shows the attachment inline — clicking the test reveals the attached screenshot. This is useful for capturing state at a specific assertion point rather than relying on the automatic failure screenshot. Common uses: attach the screenshot after a complex form submission to confirm the result, attach a downloaded PDF to verify its content, attach a JSON response to document the data that drove the test.

The `body` field accepts a `Buffer` or `string`. For binary attachments (images, PDFs) use a `Buffer`. For text (JSON, XML, logs) use a `string` with the appropriate `contentType`. The `path` field is an alternative to `body` — point it to a file on disk and Playwright copies it into the report.

**`testInfo.annotations`.** Annotations are metadata tags attached to a specific test run. Unlike the `test.info().annotations` pushed programmatically, the `@`-prefixed annotations in test titles (`test('title @slow', ...)`) are parsed from the title string. Programmatic annotations go through `testInfo.annotations.push()`:

```
testInfo.annotations.push({ type: 'issue', description: 'LUM-1234' });
```

The HTML report displays annotations alongside the test result. Use them to link failing tests to issue tracker tickets, to mark a test as part of a specific feature flag, or to record which environment the test ran in.

**When to use steps.** Not every test needs steps. A test with two actions and one assertion doesn't benefit from grouping. Steps add value when: the test exercises a multi-phase flow (auth → action → verify), the test has enough actions that the trace timeline is hard to read, or the test is read by people who don't write tests (product, QA, support). Write step names from the reader's perspective, not the implementation's: "Create Lumio task" not "click Add task button".

## Lumio Context

See [lumio-context.md](./lumio-context.md).

## Step-by-Step Tasks

### Part 1 — Playwright Inspector & Codegen

Complete each TODO in `exercise.spec.ts` in order.
Run after each TODO in headed mode (Inspector requires a visible browser):
```bash
npx playwright test tests/module-09-debugging-and-reporting --headed
```

To trigger the Inspector mid-test:
```bash
PWDEBUG=1 npx playwright test tests/module-09-debugging-and-reporting
```

Validate this part only:
```bash
npx playwright test tests/module-09-debugging-and-reporting -g "Part 1 — Playwright Inspector & Codegen (formerly M42)"
```

### Part 2 — Tracing & Trace Viewer

Validate this part only:
```bash
npx playwright test tests/module-09-debugging-and-reporting -g "Part 2 — Tracing & Trace Viewer (formerly M43)"
```

### Part 3 — Reporters Deep Dive

Complete each TODO in `exercise.spec.ts` in order.
Run with the default reporter config first, then modify `playwright.config.ts` per the tasks:
```bash
npx playwright test tests/module-09-debugging-and-reporting
```

Validate this part only:
```bash
npx playwright test tests/module-09-debugging-and-reporting -g "Part 3 — Reporters Deep Dive (formerly M44)"
```

### Part 4 — Debugging Strategies

Complete each TODO in `exercise.spec.ts` in order.
Run with `--headed` for the highlight TODO:
```bash
npx playwright test tests/module-09-debugging-and-reporting --headed
```

For trace analysis:
```bash
npx playwright test tests/module-09-debugging-and-reporting --trace on
npx playwright show-trace test-results/*/trace.zip
```

Validate this part only:
```bash
npx playwright test tests/module-09-debugging-and-reporting -g "Part 4 — Debugging Strategies (formerly M45)"
```

### Part 5 — test.step() & Runtime Attachments

Complete each TODO in `exercise.spec.ts` in order.
Run and then open the HTML report to see steps and attachments:
```bash
npx playwright test tests/module-09-debugging-and-reporting --reporter=html
npx playwright show-report
```

Validate this part only:
```bash
npx playwright test tests/module-09-debugging-and-reporting -g "Part 5 — test.step() & Runtime Attachments (formerly M46)"
```

## Validate (full lesson)

```bash
npx playwright test tests/module-09-debugging-and-reporting
```

## Key Takeaways

### Part 1 — Playwright Inspector & Codegen

1. Codegen records interactions, not intent — you must add assertions manually and replace fragile selectors.
2. `page.pause()` in a headed test opens the Inspector mid-execution — the most practical debugging entry point.
3. The Inspector's locator picker shows live match counts — use it to verify a locator before committing it.
4. Codegen output quality depends entirely on the app's use of semantic HTML — it is best in well-structured apps.
5. `PWDEBUG=1` opens the Inspector at every test's start without modifying test source — great for quick investigation.

### Part 2 — Tracing & Trace Viewer

1. Configure tracing in `playwright.config.ts` — don't add `tracing.start()` to every test.
2. `page.on('console', ...)` is the right way to capture JS console output.
3. `page.on('pageerror', ...)` catches uncaught JS exceptions — run it on every navigation.
4. `--ui` mode is the fastest way to debug interactively during development.
5. Debugging strategies (console/pageerror listeners, `locator.highlight()`, `locator.count()` for selector verification) are covered in Part 4 of this lesson (formerly M45) (Debugging Strategies). M43 focuses on the tracing infrastructure and Trace Viewer navigation.

### Part 3 — Reporters Deep Dive

1. Multiple reporters can run simultaneously — list them as an array in `playwright.config.ts`.
2. The `html` reporter is the primary debugging artifact; `junit` and `json` feed CI pipelines.
3. The `github` reporter adds inline PR annotations with no extra configuration beyond listing it.
4. Blob reports exist to merge results across sharded runs — one blob per shard, one merge step.
5. The `Reporter` interface exposes lifecycle events (`onBegin`, `onTestEnd`, `onEnd`) — understanding it helps you evaluate and build custom reporters.

### Part 4 — Debugging Strategies

1. Traces are the primary CI debugging artifact — configure `trace: 'on-first-retry'` in every project.
2. `page.on('console')` surfaces browser JavaScript errors that would otherwise be invisible to Playwright.
3. `locator.highlight()` visually confirms a locator targets the intended element without running an assertion.
4. `locator.count()` combined with `highlight()` diagnoses both over-matching and under-matching selectors.
5. Diagnose before adding waits — use trace + console + highlight to identify the root cause first.

### Part 5 — test.step() & Runtime Attachments

1. `test.step()` groups actions under a named heading in the Trace Viewer and HTML report, making failures self-describing.
2. `testInfo.attach()` adds screenshots, files, and text to the HTML report as inline artifacts.
3. `testInfo.annotations.push()` adds metadata (issue links, environment tags) to a test run.
4. `testInfo` is accessed as the second argument to the test callback — `async ({ page }, testInfo)`.
5. Steps nest naturally — use top-level steps for phases, nested steps for sub-actions.

## Going Deeper

### Part 1 — Playwright Inspector & Codegen

- [Playwright docs: Codegen](https://playwright.dev/docs/codegen-intro)
- [Playwright docs: Inspector](https://playwright.dev/docs/inspector)
- [Playwright docs: Debugging](https://playwright.dev/docs/debug)

### Part 2 — Tracing & Trace Viewer

- [Playwright docs: Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [Playwright docs: Debugging](https://playwright.dev/docs/debug)

### Part 3 — Reporters Deep Dive

- [Playwright docs: Reporters](https://playwright.dev/docs/test-reporters)
- [Playwright docs: Sharding](https://playwright.dev/docs/test-sharding)
- [Playwright docs: Custom reporters](https://playwright.dev/docs/api/class-reporter)

### Part 4 — Debugging Strategies

- [Playwright docs: Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [Playwright docs: Debugging tests](https://playwright.dev/docs/debug)
- [Playwright docs: Page events](https://playwright.dev/docs/api/class-page#page-event-console)

### Part 5 — test.step() & Runtime Attachments

- [Playwright docs: test.step()](https://playwright.dev/docs/api/class-test#test-step)
- [Playwright docs: testInfo.attach()](https://playwright.dev/docs/api/class-testinfo#test-info-attach)
- [Playwright docs: Annotations](https://playwright.dev/docs/test-annotations)
