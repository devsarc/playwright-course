# Lesson 18: Decision-Making & Real-World Patterns

*Combines former modules M81–M88.*

## Learning Objectives

### Part 1 — Playwright vs Selenium (formerly M81)

- Understand the architectural difference between WebDriver (Selenium) and CDP/BiDi (Playwright)
- Identify Lumio test scenarios where Playwright's architecture provides a concrete advantage
- Recognize when Selenium is the right choice: legacy enterprise environments and language breadth
- Evaluate the migration cost from a Selenium suite to Playwright

### Part 2 — Playwright vs Cypress (formerly M82)

- Compare Playwright and Cypress for the Lumio SPA dashboard scenario across specific technical criteria
- Understand multi-browser, multi-tab, and multi-origin differences — the core architectural divergence
- Recognize when Cypress is the better choice: simpler SPA testing with a team that values DX over breadth
- Know the migration patterns when moving from Cypress to Playwright

### Part 3 — Playwright vs Puppeteer & Others (formerly M83)

- Distinguish Playwright from Puppeteer: same CDP foundation, very different scope
- Know when Puppeteer is the right tool for Chrome-only automation tasks (scraping, PDF generation)
- Understand the decision framework for WebdriverIO, TestCafe, and Nightwatch in specific contexts
- Apply multi-language binding awareness: choose the right Playwright binding for your team's language

### Part 4 — Flakiness Root Cause Analysis (formerly M84)

- Categorize flaky Lumio tests into the four root-cause buckets: timing, data, environment, selector
- Use Trace Viewer and retry counts to isolate the root cause of each flaky test
- Distinguish between masking flakiness with retries and fixing the underlying cause
- Apply systematic prevention strategies for each flakiness category

### Part 5 — Test Maintenance & Long-term Strategy (formerly M85)

- Recognize the four maintenance smells: brittle selectors, dead tests, overcoupled assertions, and scope leaks
- Apply the selector resilience hierarchy: role > label > text > testId > CSS
- Use `testInfo.annotations` to document tests with issue links and coverage tags
- Collect all assertion failures per test run using `expect.soft()`

### Part 6 — CI/CD Pipeline Optimization (formerly M86)

- Use `--grep` and `--grep-invert` to run a targeted subset of tests on every push
- Configure `workers` and `fullyParallel` to maximize throughput on CI hardware
- Apply `retries` in CI without masking flakiness in local development
- Set per-test and global timeouts appropriate for CI runner latency
- Read `testInfo` properties to build adaptive test behavior for slow environments

### Part 7 — Secrets & Security in Tests (formerly M87)

- Manage credentials via environment variables rather than hardcoded strings
- Mask sensitive values so they do not appear in HTML reports or Trace Viewer
- Verify that secrets are never written to test artifacts
- Isolate the test environment from production data sources
- Audit an existing test suite for common credential-exposure patterns

### Part 8 — Test Health Observability (formerly M88)

- Collect per-test duration, retry count, and pass/fail state from `testInfo`
- Use `testInfo.annotations` to attach observability metadata to test results
- Understand how the JSON reporter output feeds dashboards and flakiness analysis scripts
- Recognize the metrics that constitute a healthy test suite: pass rate, flakiness rate, and duration trend
- Integrate test health data with external monitoring systems (Allure, Datadog, Grafana)

## Concept

### Part 1 — Playwright vs Selenium (formerly M81)

Selenium and Playwright are both browser automation frameworks — but their underlying protocols differ fundamentally, and those differences manifest in real test authoring and maintenance tradeoffs.

**WebDriver vs CDP/BiDi.**

Selenium uses the W3C WebDriver protocol: the test sends HTTP commands to a browser driver (chromedriver, geckodriver), which translates them to browser instructions. Each command is a synchronous HTTP round-trip. This adds latency and requires explicit waiting because the driver doesn't know what the browser is about to do next.

Playwright uses Chrome DevTools Protocol (CDP) for Chromium and its own BiDirectional protocol for Firefox and WebKit. CDP is a direct bidirectional channel — Playwright and the browser communicate in real time, which enables auto-waiting: Playwright waits for the element to be ready before interacting.

| Dimension | Selenium | Playwright |
|---|---|---|
| Protocol | WebDriver (HTTP) | CDP / BiDi (WebSocket) |
| Auto-waiting | No (explicit waits required) | Yes (built into all locators) |
| Test speed | Slower (round-trip latency) | Faster (bidirectional channel) |
| Flakiness | Higher (explicit waits drift) | Lower (auto-wait eliminates timing waits) |
| Language support | Java, Python, JS, C#, Ruby, Kotlin | JS/TS, Python, Java, C# |
| Browser support | All major browsers + cloud grids | Chromium, Firefox, WebKit |
| Multi-tab | Complex (window handle switching) | Simple (context.waitForEvent) |
| Network mocking | Requires proxy (BrowserMob) | Built-in (page.route) |
| Shadow DOM | Via JavascriptExecutor | First-class (`:shadow` CSS) |

**When Selenium is the right choice.**

Choose Selenium when:
- The team uses Ruby or Kotlin (no Playwright bindings exist)
- The CI infrastructure is a Selenium Grid with dozens of physical browsers — migration cost is prohibitive
- The app targets Internet Explorer or old enterprise browsers not supported by Playwright
- The organization has existing Selenium frameworks (Page Object utilities, custom reporters) that would need to be rebuilt
- You need to integrate with a commercial Selenium-based cloud (BrowserStack, Sauce Labs have Playwright support too, but legacy pricing may favor Selenium)

**Migration cost from Selenium to Playwright.**

Migrating a Selenium suite is not a find-and-replace. The differences that require actual work:
- **Locators:** Selenium uses `By.id()`, `By.cssSelector()`, `By.xpath()` → Playwright uses `getByRole`, `getByLabel`, `locator()`. Most tests need locator rewrites.
- **Waits:** Remove all `WebDriverWait` and `ExpectedConditions` — Playwright handles them automatically.
- **POM structure:** The POM pattern transfers, but method implementations change (no `WebElement` type, no `driver.findElement()`).
- **Configuration:** `WebDriver` initialization → `playwright.config.ts`.
- A 200-test Selenium suite typically takes 2–4 weeks to migrate with one engineer.

### Part 2 — Playwright vs Cypress (formerly M82)

Cypress and Playwright are both modern browser automation tools with first-class JavaScript/TypeScript support, automatic waiting, and good developer experience. The tradeoffs are real but context-dependent — neither is universally better.

**Architecture.**

Both Cypress and Playwright run inside the browser (sort of). Cypress runs tests in an iframe alongside the app in the same browser tab. Playwright runs tests in a Node.js process and communicates with the browser via CDP/BiDi (same as with Selenium's CDP mode).

The iframe architecture gives Cypress real-time test execution visibility but also causes its most significant limitations:

**1. Same-origin restriction.**

Cypress cannot navigate between different origins in the same test by default (unless you set `chromeWebSecurity: false`, which has caveats). Playwright has no origin restriction.

Lumio example: testing the OAuth redirect to `github.com` and back requires multi-origin navigation. In Cypress, you must mock the OAuth provider. In Playwright, you can automate the actual OAuth redirect (or mock it — both are valid).

**2. Multi-tab.**

Cypress cannot access a second browser tab — there is no API for it. Playwright's `context.waitForEvent('page')` handles new tabs naturally.

Lumio example: opening a task in a new tab to compare two tasks side by side — testable in Playwright, untestable in Cypress without mocking.

**3. Multi-browser support.**

Cypress supports Chromium-based browsers (Chrome, Edge, Electron) and Firefox. It does not support WebKit (Safari). Playwright supports Chromium, Firefox, and WebKit — including iOS Safari simulation.

Lumio example: WebKit-specific date input bugs (Lesson 07 (formerly M34)) — only discoverable in Playwright's WebKit.

**4. Developer experience.**

Cypress has a better interactive test runner UI for debugging: real-time test execution, time-travel debugging (snapshots for every command), and a polished dashboard. Playwright's UI Mode (`--ui`) is comparable but newer and less mature.

If a team's primary goal is fast, pleasant test writing for a simple React SPA with no multi-tab, multi-origin, or WebKit requirements — Cypress is often the better experience.

**5. Component testing.**

Both support component testing. Cypress CT was the first to market and has a broader ecosystem (stories, design system testing). Playwright CT (`@playwright/experimental-ct-react`) is newer but integrates with Playwright's full feature set (network mocking, multi-browser).

**When Cypress is the better choice.**

Choose Cypress when:
- The app is a single-origin SPA with no OAuth redirects or multi-tab flows
- The team prioritizes DX and the interactive runner UI over browser coverage
- WebKit/Safari testing is not required (iOS Safari is tested separately via device farm)
- The team already has Cypress expertise and a large existing test suite
- You need the Cypress Dashboard (analytics, flakiness detection) without building your own

**Migration from Cypress to Playwright.**

Key differences:
- `cy.visit(url)` → `await page.goto(url)`
- `cy.get('selector')` → `await page.locator('selector')` (add `await`)
- `cy.contains('text')` → `page.getByText('text')`
- `cy.intercept()` → `page.route()`
- `.should('be.visible')` → `await expect(locator).toBeVisible()`
- `beforeEach(()` → `test.beforeEach(async ({ page }) =>`

The main mental shift: Cypress commands are synchronous (chainable, auto-queued); Playwright commands are async/await.

### Part 3 — Playwright vs Puppeteer & Others (formerly M83)

**Playwright vs Puppeteer.**

Puppeteer and Playwright share a creator (the Playwright team left Google to build Playwright) and both use CDP under the hood. The key differences:

| Dimension | Playwright | Puppeteer |
|---|---|---|
| Browsers | Chromium, Firefox, WebKit | Chromium only (Firefox experimental) |
| Languages | JS/TS, Python, Java, C# | JS/TS only |
| Testing framework | Built-in (`@playwright/test`) | Requires external (Jest, Mocha) |
| Auto-waiting | Yes (built into locators) | No (must use `page.waitForSelector`) |
| Network mocking | `page.route()` | `page.setRequestInterception()` |
| Test isolation | `BrowserContext` per test | Manual context management |
| Maintained by | Microsoft | Google |

For scraping and automation scripts where you control the environment, Puppeteer is simpler and lighter. For test suites requiring Firefox/WebKit, built-in test isolation, and auto-waiting, Playwright is the clear choice.

**Puppeteer's sweet spot.**

Puppeteer excels at:
- Chrome-only server-side tasks: PDF generation, screenshot services, headless scraping
- Embedding in existing Node.js apps that already have a test framework
- Tight Chrome version control (Puppeteer pins a specific Chromium revision)

Playwright replaced Puppeteer for Lumio's test suite, but Lumio's server-side PDF generation still uses Puppeteer (via the `puppeteer` package in the Next.js server) because it's a focused Chrome-only task with no multi-browser requirement.

**WebdriverIO.**

WebdriverIO (WDIO) bridges WebDriver and CDP — it supports both Selenium Grid targets and direct Chrome CDP. It has a rich plugin ecosystem and a built-in test runner. Choose WDIO when:
- The team needs Selenium Grid integration with a modern JS API
- The app requires AppiumDriver for mobile native testing alongside web
- The organization has existing WDIO configuration and scripts
- You need fine-grained control over WebDriver capabilities

**TestCafe.**

TestCafe uses a proxy-based approach — no WebDriver, no CDP. Tests run as injected scripts. Advantages: zero browser driver installation, works with any browser that can run JavaScript. Choose TestCafe when the team wants the simplest possible CI setup (no playwright install, no chromedriver, no geckodriver) and the feature set is sufficient.

**Nightwatch.**

Nightwatch uses WebDriver under the hood but provides a simpler fluent API. It has first-class support for cloud grids (BrowserStack, Sauce Labs). Choose Nightwatch when: the team needs a simple WebDriver wrapper with cloud grid integration and no desire to switch to Playwright's CDP model.

**Multi-language Playwright bindings.**

Playwright provides official clients for:

| Language | Package | Maintained by |
|---|---|---|
| JavaScript/TypeScript | `@playwright/test` | Microsoft |
| Python | `playwright` (PyPI) | Microsoft |
| Java | `com.microsoft.playwright:playwright` | Microsoft |
| C# | `Microsoft.Playwright` | Microsoft |

All four bindings provide the same core API surface — page, context, locators, network interception. For a polyglot team, different Playwright bindings can test the same application from different languages, all against the same Lumio dev server.

**Decision framework.**

```
Need Firefox/WebKit? → Playwright (Puppeteer is out)
Need mobile native (iOS/Android)?  → Appium
Chrome-only, no test framework needed? → Puppeteer or Playwright
Java team, Selenium Grid investment? → WebdriverIO or Playwright Java
Simple setup, no CDP? → TestCafe
Existing Nightwatch + cloud grid? → Nightwatch
Default (new project, modern team) → Playwright
```

### Part 4 — Flakiness Root Cause Analysis (formerly M84)

A flaky test is not "unreliable" — it has a specific, diagnosable root cause. Every flaky test falls into one of four categories. Identifying the category is 90% of the fix.

**Category 1: Timing flakiness.**

The test assumes a fixed duration that isn't always met. Symptoms: passes on a fast CI machine, fails on a slow one; passes when run alone, fails in parallel.

Root cause: `page.waitForTimeout()`, `sleep()`, or assertions without auto-wait.

Diagnosis: In Trace Viewer → action list, look for the failed action immediately following a hardcoded wait. The wait ended before the element was ready.

Fix: Replace `waitForTimeout` with a condition-based wait (`expect(el).toBeVisible()`, `waitForLoadState('networkidle')`, `waitForResponse()`).

**Category 2: Data flakiness.**

Test data bleeds between tests. Symptoms: passes when run in isolation, fails when run in the full suite; passes on even runs, fails on odd runs.

Root cause: Tests share mutable data (same task name, same user, same workspace slug). One test creates data that a parallel test also expects to create — causing a uniqueness conflict.

Diagnosis: In Trace Viewer → network tab, look for 409 Conflict or 422 Unprocessable Entity responses on API calls that create data.

Fix: Use unique data per test (`const taskName = 'Task ' + Date.now()`), or use `beforeEach` with API setup and `afterEach` with cleanup.

**Category 3: Environment flakiness.**

The test assumes an environment state that isn't guaranteed. Symptoms: passes in local dev, fails in CI; passes in Chrome, fails in Firefox.

Root cause: Network latency differences, font rendering differences, CI container memory limits, locale or timezone mismatch.

Diagnosis: Compare traces from a passing run and a failing run — look for timing differences in network requests, or rendering differences in screenshots.

Fix: Set explicit timeouts for slow environments (`test.setTimeout(60_000)`), use `page.emulateMedia()` for consistent rendering, run with explicit `locale` and `timezone` in context options.

**Category 4: Selector flakiness.**

The locator sometimes finds multiple elements, or finds the wrong one. Symptoms: fails with "strict mode violation" (multiple matches) or fails with a mismatch assertion (found the wrong element).

Root cause: CSS selector matches multiple elements; locator that relies on an index (`.nth(0)`) when order is not guaranteed; `getByText` matches a substring that appears in multiple places.

Diagnosis: In Trace Viewer → inspector tab, click the failed locator and see how many elements it matches.

Fix: Use more specific locators (`getByRole + name`), scope locators to a parent (`parentEl.getByRole(...)`), or use `getByTestId` for elements with no accessible role.

**Retry configuration: signal vs mask.**

```typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0, // retries in CI only
});
```

Retries are a safety net for legitimate transient failures (network hiccup, CI resource contention). They are not a fix for any of the four flakiness categories above. Watching retry counts in your HTML report tells you which tests are flaky — use that as a backlog to diagnose, not a dashboard to celebrate.

`test.info().retry` gives the current retry index inside a test — use it to take a diagnostic screenshot on retry:

```typescript
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.retry > 0) {
    await testInfo.attach('retry-screenshot', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
  }
});
```

### Part 5 — Test Maintenance & Long-term Strategy (formerly M85)

Tests are not write-once artifacts. A test suite that isn't maintained becomes a liability: slow to run, hard to debug, and actively misleading when it gives false confidence. Maintenance debt accumulates silently until a single UI change breaks thirty tests that have nothing to do with the change.

The goal of a maintainable test suite is **low breakage rate** when the application's behavior hasn't changed. If a CSS rename causes test failures, the tests weren't testing behavior — they were testing implementation. That's the core diagnostic question: *what specifically would have to change in the app for this test to break?*

**Smell 1: Brittle selectors.**

CSS class selectors and index-based locators break when:
- A developer renames a class during a CSS refactor
- A new button is added above an existing one, shifting nth(0) to nth(1)
- A placeholder text string is updated in a copy edit

The fix follows the selector resilience hierarchy:
1. `getByRole()` — backed by ARIA semantics, survives HTML restructuring
2. `getByLabel()` — backed by form label, survives placeholder and class changes
3. `getByText()` — tied to visible copy, breaks on copy edits but rarely on structural changes
4. `getByTestId()` — explicit contract, requires coordination with developers
5. `locator('.css')` — last resort; breaks on any CSS refactor

**Smell 2: Dead tests (tautological assertions).**

A dead test always passes regardless of application behavior. Common patterns:
- `expect(true).toBeTruthy()` — asserts nothing
- `expect(await locator.count()).toBeGreaterThan(-1)` — always true (count is never negative)
- `expect(someString).toBeDefined()` — always true if the variable was declared

Dead tests are worse than no tests: they give false confidence, consume CI time, and make reviewers think coverage exists where it doesn't. Identifying a dead test requires asking: *would this test fail if the feature were completely removed?*

**Smell 3: Overcoupled assertions.**

An overcoupled test checks implementation details instead of observable behavior. Examples:
- Asserting a CSS class name like `aria-pressed="true"` instead of `toBeChecked()`
- Asserting DOM structure (number of `<li>` elements) instead of user-visible count
- Asserting the value of a React state variable via `window.__state`

The fix: assert what a user would observe (visible text, enabled state, URL), not how the component achieves it internally.

**Smell 4: Scope leaks (ambiguous locators).**

An unscoped locator like `page.getByRole('heading', { name: 'Settings' })` fails with a "strict mode violation" if both the sidebar and the page content contain a heading named "Settings". Scoping to a parent locator (`page.getByRole('main').getByRole('heading', ...)`) eliminates ambiguity without needing a test ID.

**Documenting tests: `testInfo.annotations`.**

Playwright's `testInfo.annotations` array allows attaching metadata to a test at runtime. The HTML report renders these as visible annotations, and CI tooling can read them from the JSON reporter output:

```typescript
testInfo.annotations.push({
  type: 'issue',
  description: 'https://linear.app/lumio/issue/LUM-123'
});
```

Common annotation types used by Lumio's team:
- `'issue'` — links a test to the bug report it was written to prevent regressions for
- `'tag'` — marks coverage tier (`@smoke`, `@sanity`, `@regression`)
- `'owner'` — the squad responsible for maintaining this test

**Collecting all failures: `expect.soft()`.**

By default, the first failed assertion terminates the test. `expect.soft()` continues execution after a failure, collecting all assertion errors into `testInfo.errors`. This is useful for maintenance-oriented tests that audit multiple properties at once: rather than fixing one assertion, rerunning, and discovering the next failure, all issues surface in a single run.

```typescript
await expect.soft(page).toHaveTitle(/Lumio/);
await expect.soft(page.getByRole('main')).toBeVisible();
// Both failures reported even if the first fails
```

### Part 6 — CI/CD Pipeline Optimization (formerly M86)

A CI pipeline that runs in 20 minutes on a laptop takes 8 minutes on a 4-CPU CI runner — or 4 minutes on an 8-CPU runner. The bottleneck is not the network or the app; it's usually a combination of unparallelized tests, overly generous timeouts, and missing caching. Optimizing a Playwright CI pipeline means making confident decisions about each of these levers.

**Parallelism.**

Playwright can parallelize at two levels:
- **Worker parallelism** — tests run in separate worker processes, each with its own browser context. Set via `workers` in `playwright.config.ts` or `--workers` on the CLI. A rule of thumb: one worker per CPU core for CPU-bound suites; for I/O-bound suites (network calls to a dev server), 2–3× the CPU count is safe.
- **Test-level parallelism** — within a single `test.describe` block, tests run sequentially by default. Use `test.describe.configure({ mode: 'parallel' })` to parallelize them within the block.

The tradeoff: parallelism increases throughput but increases peak memory and can cause data conflicts when tests share mutable state. The fix for data conflicts is unique test data per test (Part 4 of this lesson (formerly M84)), not reduced parallelism.

**Selective test runs.**

Running the entire suite on every push is wasteful when a commit only touches one feature. Playwright's `--grep` flag accepts a regex to match test titles:

```bash
npx playwright test --grep "@smoke"
npx playwright test --grep "login|dashboard"
```

`--grep-invert` excludes matching tests — useful for skipping slow tests in a per-push check:
```bash
npx playwright test --grep-invert "@slow"
```

On larger repos, `--only-changed` (behind a config flag) re-runs only tests whose source files changed since the last run. This requires the JSON reporter to store previous results as a baseline.

**Timeouts.**

The default global timeout in Playwright is 30 seconds per test. For a CI runner that is 3× slower than localhost, a test that takes 12 seconds locally will take 36 seconds in CI — and fail. Two strategies:

1. Raise the global timeout for CI only:
   ```typescript
   timeout: process.env.CI ? 60_000 : 30_000,
   ```
2. Raise the timeout for a specific slow test using `testInfo.setTimeout()`:
   ```typescript
   testInfo.setTimeout(testInfo.timeout + 30_000);
   ```

**Retries.**

Use `retries: 2` in CI only. A test that needs retries on every run is not "passing" — it is intermittently failing. Use retry counts (visible in the HTML report) as a flakiness backlog, not as a success metric.

```typescript
retries: process.env.CI ? 2 : 0,
```

**Reporter configuration.**

Different CI environments consume different report formats:
- `html` — the interactive report for debugging; upload as a CI artifact
- `junit` — consumed by Jenkins, GitLab, and Azure DevOps for inline test result display
- `json` — consumed by custom dashboards and nightly flakiness analysis scripts
- `dot` — minimal stdout output for fast feedback during a PR check
- `github` — adds inline annotations to GitHub pull requests showing failed test locations

Configure multiple reporters in parallel:
```typescript
reporter: [['html'], ['junit', { outputFile: 'results.xml' }], ['json', { outputFile: 'results.json' }]],
```

### Part 7 — Secrets & Security in Tests (formerly M87)

A Playwright test suite that stores a real password in a string literal has already failed a security audit before the first test runs. The problem is not theoretical: CI logs are visible to anyone with repo access, HTML report artifacts are uploaded and shared, and Trace Viewer files include network request headers — all of which can expose credentials if the suite is not written defensively.

**Environment variables are the minimum bar.**

Never hardcode credentials in test files. Load them from `process.env` at runtime:

```typescript
const password = process.env.TEST_PASSWORD ?? '';
```

In local development, store them in a `.env.test` file that is listed in `.gitignore`. In CI, inject them as repository secrets via GitHub Actions, Azure Key Vault, or AWS Secrets Manager — never in the workflow YAML file in plain text.

**`.env.test` must be in `.gitignore`.**

A `.env.test` file that leaks into the repo is equivalent to committing a password. The pattern:

```
# .gitignore
.env.test
.env*.local
```

**Masking secrets in reports and traces.**

Even when credentials come from env vars, they can leak into artifacts. A Trace Viewer capture includes network request payloads. An HTML report includes test step labels. Masking strategies:

1. **Redact in step labels.** Do not include raw secret values in `test.step()` descriptions.
2. **Network request masking.** For requests that carry credentials (Authorization header, form POST with password), use `page.route()` to intercept and redact the value before it reaches the trace.
3. **Screenshot masking.** `page.screenshot({ mask: [locator] })` and `toHaveScreenshot({ mask: [locator] })` blur the matched element in the captured image — use this for password fields, API keys displayed in the UI, and user PII.
4. **Attachment metadata.** When attaching trace files, do not include the secret value in the attachment name.

**Test environment isolation.**

The test database must be completely separate from production. Patterns:

- `.env.test` points to `DATABASE_URL=postgresql://localhost:5432/lumio_test` — never the production URL.
- The `globalSetup` script seeds from `prisma db seed` against the test DB, not production.
- If your CI runner has access to the real cloud DB (even via read replica), you have a blast-radius problem. Fix it with a dedicated test account and schema, not trust.

**API key scoping.**

Test API keys must be read-only where possible, scoped to the test workspace only, and rotated when a team member leaves. Never use a production admin API key in tests.

**Auditing an existing suite.**

When auditing a test codebase for credential exposure, grep for:
- String literals that look like passwords, tokens, or keys
- Hardcoded email addresses that match production accounts
- `Authorization: Bearer` headers constructed from string interpolation with a literal value
- `DATABASE_URL` values pointing at non-`localhost` hosts

Playwright provides `testInfo.annotations` as a way to attach structured metadata to test runs without exposing the values in the HTML report title.

### Part 8 — Test Health Observability (formerly M88)

A CI pipeline that shows "217 tests passed" hides the questions that matter: how many needed a retry? Which tests are getting slower each week? What percentage of tests are genuinely stable vs. intermittently green? Test health observability is the practice of collecting and surfacing this data systematically.

**The four health signals.**

1. **Pass rate** — what percentage of test runs complete without failure? Below 95% means something is structurally broken: flaky tests, environment instability, or real bugs being masked by retries.
2. **Flakiness rate** — what percentage of passed tests required at least one retry? Flaky tests are pre-failures. A test that passes on the third attempt is a bug that hasn't been diagnosed yet.
3. **Duration trend** — is the suite getting slower? A 10% increase per month means the suite doubles in runtime every 8 months. Duration regression is a CI cost signal.
4. **Coverage distribution** — are `@smoke`, `@sanity`, and `@regression` tests distributed across features proportionally? A single feature with 40% of the tests and another with 0% is a coverage gap.

**Reading `testInfo` for observability.**

Playwright exposes all the data you need from `testInfo`:

```typescript
test('example', async ({ page }, testInfo) => {
  // Duration so far (mid-test):
  console.log(testInfo.duration);

  // Retry attempt (0 = first run):
  console.log(testInfo.retry);

  // Unique ID for this test run:
  console.log(testInfo.testId);

  // Tags from the title (e.g., @smoke):
  const tags = testInfo.title.match(/@\w+/g) ?? [];
});
```

**Attaching observability metadata.**

`testInfo.annotations` is the structured channel for test metadata. The JSON reporter serializes it into every test's result object:

```typescript
testInfo.annotations.push({
  type: 'flakiness-risk',
  description: 'high — network-dependent assertion',
});
```

A post-processing script reading the JSON reporter output can then compute flakiness scores per annotation value.

**The JSON reporter output format.**

Running `npx playwright test --reporter=json` writes a structured JSON file. Each test result includes:

```json
{
  "title": "login: renders sign in form @smoke",
  "status": "passed",
  "duration": 1432,
  "retry": 1,
  "annotations": [{ "type": "tag", "description": "@smoke" }],
  "attachments": []
}
```

A nightly script can aggregate these results across runs to compute moving averages, flakiness counts, and duration percentiles.

**External integrations.**

- **Allure Report** — a rich report format (separate CLI) that supports trend graphs, retries history, and owner annotations.
- **Datadog CI Visibility** — native Playwright integration; sends test results as CI visibility events automatically.
- **Grafana + InfluxDB** — parse JSON reporter output in a GitHub Actions step and POST metrics to InfluxDB; Grafana visualizes trends over time.

The key principle: don't rely on a human to look at CI output and notice the suite is slowing down. Instrument the output so a dashboard catches it automatically.

## Lumio Context

See [lumio-context.md](./lumio-context.md).

## Step-by-Step Tasks

### Part 1 — Playwright vs Selenium

Validate this part only:
```bash
npx playwright test tests/module-18-decision-making-and-patterns -g "Part 1 — Playwright vs Selenium (formerly M81)"
```

### Part 2 — Playwright vs Cypress

Validate this part only:
```bash
npx playwright test tests/module-18-decision-making-and-patterns -g "Part 2 — Playwright vs Cypress (formerly M82)"
```

### Part 3 — Playwright vs Puppeteer & Others

Validate this part only:
```bash
npx playwright test tests/module-18-decision-making-and-patterns -g "Part 3 — Playwright vs Puppeteer & Others (formerly M83)"
```

### Part 4 — Flakiness Root Cause Analysis

Validate this part only:
```bash
npx playwright test tests/module-18-decision-making-and-patterns -g "Part 4 — Flakiness Root Cause Analysis (formerly M84)"
```

### Part 5 — Test Maintenance & Long-term Strategy

Validate this part only:
```bash
npx playwright test tests/module-18-decision-making-and-patterns -g "Part 5 — Test Maintenance & Long-term Strategy (formerly M85)"
```

### Part 6 — CI/CD Pipeline Optimization

Validate this part only:
```bash
npx playwright test tests/module-18-decision-making-and-patterns -g "Part 6 — CI/CD Pipeline Optimization (formerly M86)"
```

### Part 7 — Secrets & Security in Tests

Validate this part only:
```bash
npx playwright test tests/module-18-decision-making-and-patterns -g "Part 7 — Secrets & Security in Tests (formerly M87)"
```

### Part 8 — Test Health Observability

Validate this part only:
```bash
npx playwright test tests/module-18-decision-making-and-patterns -g "Part 8 — Test Health Observability (formerly M88)"
```

## Validate (full lesson)

```bash
npx playwright test tests/module-18-decision-making-and-patterns
```

## Key Takeaways

### Part 1 — Playwright vs Selenium

1. WebDriver = HTTP round-trip per command (slow, requires explicit waits); CDP/BiDi = bidirectional WebSocket (fast, enables auto-wait).
2. Playwright's auto-waiting is not a magic timer — it watches the element state (attached, visible, stable, enabled) before acting.
3. Multi-tab, network mocking, and shadow DOM are Playwright built-ins; in Selenium they require external libraries or hacks.
4. Choose Selenium when: Ruby/Kotlin team, existing Grid investment, IE/old enterprise browser requirements.
5. Migration cost: locator rewrites + wait removal + config rebuild — not a find-and-replace.

### Part 2 — Playwright vs Cypress

1. Cypress same-origin restriction: cannot navigate between origins in one test; Playwright has no restriction.
2. Cypress multi-tab: not supported; Playwright's `context.waitForEvent('page')` handles it natively.
3. Cypress browser support: Chromium + Firefox; Playwright adds WebKit — critical for Safari-specific bugs.
4. Cypress DX advantage: time-travel debugger and interactive runner are excellent for simple SPA teams.
5. Migration: `cy.get()` → `locator()`, `.should('be.visible')` → `await expect().toBeVisible()`, add `await` everywhere.

### Part 3 — Playwright vs Puppeteer & Others

1. Playwright and Puppeteer both use CDP for Chromium — the difference is Firefox/WebKit support, auto-waiting, and built-in test isolation.
2. Puppeteer remains the right choice for Chrome-only server-side tasks (PDF, screenshot services) that don't need multi-browser.
3. WebdriverIO bridges WebDriver and CDP — choose it when Selenium Grid integration is required alongside modern JS.
4. Playwright's multi-language bindings (Python, Java, C#) let polyglot teams use one tool across language boundaries.
5. Default to Playwright for new projects — migrate away only when a specific binding, platform, or ecosystem constraint forces it.

### Part 4 — Flakiness Root Cause Analysis

1. Every flaky test has a category: timing, data, environment, or selector — diagnose the category before writing the fix.
2. Trace Viewer → action list diagnoses timing flakes; network tab diagnoses data flakes (409/422 responses).
3. `waitForTimeout` always indicates timing flakiness — replace with a condition-based wait.
4. Unique test data (`Date.now()` suffix) prevents data conflicts in parallel test runs.
5. Retries mask flakiness; they don't fix it. Use retry count as a flakiness backlog signal.

### Part 5 — Test Maintenance & Long-term Strategy

1. A test that breaks on a CSS rename was testing implementation, not behavior — fix the selector, not the CSS.
2. The selector hierarchy: role > label > text > testId > CSS. Prefer higher entries.
3. Scope locators to a parent to prevent strict mode violations from unrelated matching elements.
4. `testInfo.annotations` links tests to issue trackers and coverage tiers — use it so reports are self-documenting.
5. `expect.soft()` collects all failures per run — useful for maintenance audits where you want a complete picture.

### Part 6 — CI/CD Pipeline Optimization

1. Workers control parallelism — start with `cpuCount` workers and increase if the suite is I/O-bound.
2. `--grep` runs only matching tests — use `@smoke` tags for per-push checks and `@regression` for nightly.
3. Global and per-test timeouts must account for CI runner latency — CI is typically 2–4× slower than localhost.
4. `retries: 2` in CI only — retries mask flakiness locally but are a necessary safety net for infrastructure hiccups.
5. Multiple reporters can run in parallel — HTML for humans, JUnit for CI systems, JSON for dashboards.

### Part 7 — Secrets & Security in Tests

1. Credentials belong in environment variables, not source code — `.env.test` is for local dev and must be gitignored.
2. `page.screenshot({ mask: [locator] })` hides sensitive UI values from captured images without skipping the screenshot.
3. Traces capture network request headers — routes that carry Authorization headers should be audited for leakage.
4. Test database URLs must point at an isolated instance; production and test data must never share a schema.
5. Use `process.env.SECRET ?? ''` with a clear fail-fast check (`if (!secret) throw`) rather than silently using an empty string.

### Part 8 — Test Health Observability

1. `testInfo.duration`, `testInfo.retry`, and `testInfo.status` are the raw data for pass rate, flakiness rate, and duration trend.
2. `testInfo.annotations` is the structured channel for attaching health metadata — it appears in JSON reporter output.
3. A flakiness rate above 5% is a signal to stop adding tests and diagnose existing ones.
4. Duration regression is a cost signal — track P50 and P95 durations, not just totals.
5. The JSON reporter output is the integration point for external dashboards — parse it, don't scrape HTML reports.

## Going Deeper

### Part 1 — Playwright vs Selenium

- [W3C WebDriver specification](https://www.w3.org/TR/webdriver2/)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [Playwright migration guide from Selenium](https://playwright.dev/docs/selenium-grid)
- [Selenium vs Playwright: architectural comparison](https://www.selenium.dev/documentation/overview/differences/)

### Part 2 — Playwright vs Cypress

- [Playwright vs Cypress official comparison](https://playwright.dev/docs/why-playwright)
- [Cypress docs: multiple origins](https://docs.cypress.io/guides/guides/web-security#Same-superdomain-per-test)
- [Cypress: multiple tabs limitation](https://docs.cypress.io/guides/references/trade-offs#Multiple-tabs)

### Part 3 — Playwright vs Puppeteer & Others

- [Puppeteer docs](https://pptr.dev/)
- [WebdriverIO docs](https://webdriver.io/docs/gettingstarted)
- [TestCafe docs](https://testcafe.io/documentation/402635/getting-started)
- [Playwright Python docs](https://playwright.dev/python/docs/intro)
- [Playwright Java docs](https://playwright.dev/java/docs/intro)

### Part 4 — Flakiness Root Cause Analysis

- [Playwright docs: Retries](https://playwright.dev/docs/test-retries)
- [Playwright docs: test.info()](https://playwright.dev/docs/api/class-testinfo)
- [Trace Viewer documentation](https://playwright.dev/docs/trace-viewer)
- [Martin Fowler: Eradicating Non-Determinism in Tests](https://martinfowler.com/articles/nonDeterminism.html)

### Part 5 — Test Maintenance & Long-term Strategy

- [Playwright docs: Locator best practices](https://playwright.dev/docs/locators)
- [Playwright docs: Test annotations](https://playwright.dev/docs/test-annotations)
- [Playwright docs: expect.soft()](https://playwright.dev/docs/test-assertions#soft-assertions)
- [Martin Fowler: Page Objects](https://martinfowler.com/bliki/PageObject.html)

### Part 6 — CI/CD Pipeline Optimization

- [Playwright docs: Parallelism](https://playwright.dev/docs/test-parallel)
- [Playwright docs: Configuration](https://playwright.dev/docs/test-configuration)
- [Playwright docs: Reporters](https://playwright.dev/docs/test-reporters)
- [GitHub Actions: Caching dependencies](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/caching-dependencies-to-speed-up-workflows)

### Part 7 — Secrets & Security in Tests

- [Playwright docs: Mask secrets in screenshots](https://playwright.dev/docs/api/class-page#page-screenshot-option-mask)
- [GitHub Actions: Encrypted secrets](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions)
- [OWASP: Secrets management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Playwright docs: Environment variables](https://playwright.dev/docs/test-parameterize#passing-environment-variables)

### Part 8 — Test Health Observability

- [Playwright docs: Test reporters](https://playwright.dev/docs/test-reporters)
- [Playwright docs: Test info](https://playwright.dev/docs/api/class-testinfo)
- [Allure Report for Playwright](https://allurereport.org/docs/playwright/)
- [Datadog CI Visibility](https://docs.datadoghq.com/continuous_integration/tests/playwright/)
