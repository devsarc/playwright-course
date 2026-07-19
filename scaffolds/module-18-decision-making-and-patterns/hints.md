# Lesson 18 Hints

## Part 1 — Playwright vs Selenium (formerly M81)

## TODO 1.1 — Auto-wait click

```typescript
await page.getByRole('button', { name: 'New task' }).click();
```

Playwright waits for the button to be visible, stable, and enabled before clicking. In Selenium, you'd write `WebDriverWait(driver, 10).until(EC.element_to_be_clickable(By.xpath(...)))` before every click. Playwright's auto-wait eliminates this boilerplate for all locator actions.

## TODO 1.2 — Empty state after mock

```typescript
await expect(page.getByText('No projects')).toBeVisible();
```

`page.route()` intercepts matching requests before they leave the browser — no external proxy process needed. In Selenium, network mocking requires BrowserMob Proxy (a separate Java server) or HAR replay. `'PLACEHOLDER'` finds no matching text.

## TODO 1.3 — context.waitForEvent('page')

```typescript
context.waitForEvent('page'),
```

`context.waitForEvent('page')` resolves when the browser opens a new tab or window. The new page is returned directly — no handle iteration needed. In Selenium, you'd collect `driver.getWindowHandles()` before the click, click, then find the new handle by set difference. `'request'` returns a `Request` object, not a `Page`.

## TODO 1.4 — Shadow DOM locator

```typescript
const themeButton = page.locator('theme-toggle button');
```

Playwright's CSS locator automatically pierces shadow root boundaries when chaining through custom elements (`theme-toggle` → shadow root → `button`). In Selenium, accessing shadow DOM requires `driver.executeScript("return arguments[0].shadowRoot", host).findElement(...)`. `'PLACEHOLDER'` finds no element.

## TODO 1.5 — Created response status 201

```typescript
expect(response.status()).toBe(201);
```

HTTP 201 Created is the standard response for a successful POST that creates a resource. The `request` fixture is a built-in Playwright feature — no extra library needed. In Selenium, you'd import `requests` (Python) or `RestAssured` (Java) as a separate dependency and make the HTTP call outside the WebDriver context.

## TODO 1.6 — Semantic button locator

```typescript
const createBtn = page.getByRole('button', { name: 'New task' });
```

`getByRole` is stable across CSS refactors, DOM restructuring, and element moves. Selenium defaults to CSS selectors and XPath because WebDriver has no semantic locator concept — those strategies require constant maintenance when the DOM changes. `'PLACEHOLDER'` finds no matching button.

## Part 2 — Playwright vs Cypress (formerly M82)

## TODO 2.1 — context.waitForEvent('page')

```typescript
context.waitForEvent('page'),
```

`context.waitForEvent('page')` resolves with the `Page` object when the browser opens a new tab. In Cypress, there is no equivalent — multi-tab testing is listed in Cypress's [trade-offs documentation](https://docs.cypress.io/guides/references/trade-offs#Multiple-tabs) as an unsupported scenario. `'request'` resolves with a `Request` object, not a `Page`.

## TODO 2.2 — Documentation title regex

```typescript
await expect(page).toHaveTitle(/Documentation/);
```

`/PLACEHOLDER/` won't match the docs title. In Cypress with default settings, navigating to a different origin mid-test throws: "Cypress detected that you are trying to run a cross-origin test." Playwright has no such restriction — `page.goto()` works for any URL.

## TODO 2.3 — browserName regex

```typescript
expect(browserName).toMatch(/chromium|firefox|webkit/);
```

`/PLACEHOLDER/` won't match any browser engine name. Playwright surfaces `browserName` as a built-in fixture, enabling browser-conditional logic. Cypress supports Chromium (Chrome, Edge, Electron) and Firefox — WebKit (Safari) is not available in Cypress, making this test category unreachable.

## TODO 2.4 — Mocked stats count

```typescript
await expect(page.getByText('99')).toBeVisible();
```

`'PLACEHOLDER'` finds no matching text. Both Playwright (`page.route()`) and Cypress (`cy.intercept()`) support network interception, but with different APIs. The mocked response returns `{ tasks: 99, members: 5 }`, and the dashboard renders the task count as "99".

## TODO 2.5 — toBeVisible() assertion

```typescript
await expect(btn).toBeVisible();
```

The default `toBeHidden()` fails because the "New task" button IS visible on the kanban board. The key Cypress → Playwright migration difference in this test: Cypress uses `.should('be.visible')` on a chainable object; Playwright uses `await expect(locator).toBeVisible()` — explicit async/await.

## TODO 2.6 — Export CSV button name

```typescript
page.getByRole('button', { name: 'Export CSV' }).click(),
```

`'PLACEHOLDER'` finds no button. The download event fires when the browser starts downloading a file. Playwright captures it with `page.waitForEvent('download')` before the click triggers it. In Cypress, there is no download event API — teams typically intercept the XHR response and read the content as a blob.

## Part 3 — Playwright vs Puppeteer & Others (formerly M83)

## TODO 3.1 — toBeVisible() assertion

```typescript
await expect(firstCard).toBeVisible();
```

`toBeHidden()` fails because the first task card IS visible on the kanban board. The comparison point: Playwright auto-waits for the element to be visible before the assertion runs — you don't need to call `waitForSelector` first. In Puppeteer, you'd write `await page.waitForSelector('[role="article"]', { visible: true })` before accessing the element.

## TODO 3.2 — intercepted is true

```typescript
expect(intercepted).toBe(true);
```

`false` always fails. `page.route()` intercepts the matching request and sets `intercepted = true`. In Puppeteer's equivalent, you'd enable request interception globally with `page.setRequestInterception(true)`, which blocks ALL requests until explicitly continued — requiring more careful management to avoid hanging requests.

## TODO 3.3 — Cookies greater than 0

```typescript
expect(cookies.length).toBeGreaterThan(0);
```

`999` always fails. The login in `beforeEach` sets a session cookie. In Playwright, each test gets a fresh `BrowserContext` with isolated cookies and storage. In Puppeteer, you manually create an incognito context or manage cookie state between tests — there's no automatic test isolation.

## TODO 3.4 — Browser engine regex

```typescript
expect(browserName).toMatch(/chromium|firefox|webkit/);
```

`/PLACEHOLDER/` won't match any engine name. This is the critical Playwright advantage over Puppeteer: the same test runs on three browser engines without code changes. In Puppeteer, `browserName` doesn't exist — you're always in Chromium.

## TODO 3.5 — Buffer instance

```typescript
expect(pdfBuffer).toBeInstanceOf(Buffer);
```

`Array` is not the same as `Buffer`. `page.pdf()` returns a Node.js `Buffer` containing the raw PDF bytes. This is Chromium-only in both Playwright and Puppeteer — the API is identical in both tools, making this one area where Puppeteer and Playwright are completely interchangeable.

## TODO 3.6 — Links length greater than 0

```typescript
expect(links.length).toBeGreaterThan(0);
```

`999` always fails — the nav has a small number of links (4–6). The `evaluateAll()` method is Playwright's equivalent of Puppeteer's `$$eval()`. The main difference: Playwright's version is scoped to a locator (`nav a`), while Puppeteer's is called on `page` with a full selector string.

## Part 4 — Flakiness Root Cause Analysis (formerly M84)

## TODO 4.1 — waitForURL with regex

```typescript
await page.waitForURL(/dashboard/);
```

`/PLACEHOLDER/` won't match the dashboard URL. `waitForURL` waits until `page.url()` matches the pattern — it's condition-based, not time-based. Unlike `waitForTimeout(2000)`, it resolves the instant the URL changes, making it both faster and more reliable.

## TODO 4.2 — Unique task title

```typescript
const uniqueTitle = `Unique task ${Date.now()}`;
```

`Date.now()` returns the current timestamp in milliseconds — unique per call even in parallel runs. `'My task'` is the antipattern: if two parallel workers both try to create `'My task'`, the second will get a 409 Conflict response (if task titles must be unique) or create a duplicate (causing assertion ambiguity in `getByText`).

## TODO 4.3 — Accessible name locator

```typescript
const createBtn = page.getByRole('button', { name: 'New task' });
```

`'PLACEHOLDER'` finds no button. `nth(0)` is the antipattern: the first button in the DOM changes when a navigation button, a modal close button, or a dropdown is added above it. `getByRole('button', { name: 'New task' })` is stable — it matches by semantic meaning, not DOM position.

## TODO 4.4 — Test timeout 60000ms

```typescript
testInfo.setTimeout(60000);
```

`0` causes the test to time out immediately — any action fails. `testInfo.setTimeout()` overrides the per-test timeout for the current test only (without changing the config). Use this for tests that are legitimately slower (complex UI workflows, large data renders) without making every test wait longer.

## TODO 4.5 — Retry less than 2

```typescript
expect(testInfo.retry).toBeLessThan(2);
```

`0` always fails because `testInfo.retry >= 0` always. Changing it to `2` asserts the test did not need more than 1 retry — a signal that the occasional flake is within acceptable bounds. If this assertion fails (retry was 2 or more), the test is flakier than acceptable and needs root cause analysis.

## TODO 4.6 — Await responsePromise

```typescript
const response = await responsePromise;
```

`Promise.resolve(null)` resolves immediately with `null`, and `expect(null).not.toBeNull()` fails. `responsePromise` is the actual API response — awaiting it pauses the test until the task creation API call completes with status 201. This eliminates the need for `waitForTimeout(1000)` after clicking "Create task."

## Part 5 — Test Maintenance & Long-term Strategy (formerly M85)

## TODO 5.1 — getByLabel with 'Email'

```typescript
const emailInput = page.getByLabel('Email');
```

`'PLACEHOLDER'` matches no label and times out. `getByLabel('Email')` targets the `<label>` element whose text is "Email" — this survives CSS renames, placeholder text changes, and HTML restructuring, because labels are semantic markup tied directly to their input. Compare: `getByPlaceholder('Enter email')` breaks the moment a designer edits the placeholder string.

## TODO 5.2 — Named button role with 'Sign in'

```typescript
const signInBtn = page.getByRole('button', { name: 'Sign in' });
```

`'PLACEHOLDER'` finds no button and times out. The accessible name `'Sign in'` is derived from the button's visible text or `aria-label`, which product teams treat as UX copy — far more stable than DOM position. `nth(0)` becomes `nth(1)` the moment a back-button or close-icon appears above the sign-in button.

## TODO 5.3 — Scoped link locator with 'Features'

```typescript
const featuresLink = nav.getByRole('link', { name: 'Features' });
```

`'PLACEHOLDER'` matches no link and times out. `'Features'` finds the nav link by accessible name. The key maintenance insight: scoping to `nav` means that even if a footer link named "Features" appears later, this locator won't produce a strict mode violation — it only searches within the navigation element.

## TODO 5.4 — Annotation type 'issue'

```typescript
testInfo.annotations.push({ type: 'issue', description: '...' });
```

`'PLACEHOLDER'` attaches an annotation with type `'PLACEHOLDER'`, so `.find(a => a.type === 'issue')` returns `undefined`, and `expect(undefined).not.toBeUndefined()` fails. The `'issue'` type is a Playwright convention rendered in HTML reports — it creates a clickable link to your issue tracker. Other built-in types: `'skip'`, `'fixme'`, `'fail'`.

## TODO 5.5 — Annotation type 'tag'

```typescript
testInfo.annotations.push({ type: 'tag', description: '@smoke' });
```

`'PLACEHOLDER'` causes `smokeAnnotation?.type` to be `'PLACEHOLDER'`, so `toBe('tag')` fails. The `'tag'` type is used by the HTML reporter to display coverage tiers alongside test results. Teams use this to filter the report by `@smoke`, `@sanity`, etc., giving visibility into which CI tier caught a regression.

## TODO 5.6 — Role 'navigation' for sidebar

```typescript
const sidebar = page.getByRole('navigation');
```

`'PLACEHOLDER'` is not a valid ARIA role and throws a `locator.getByRole` error immediately. `'navigation'` matches the `<nav>` element (or any element with `role="navigation"`), which is how Lumio's sidebar is structured. This is a behavioral assertion — the sidebar IS visible — not a CSS assertion about how it's styled.

## TODO 5.7 — Title regex /Lumio/

```typescript
await expect.soft(page).toHaveTitle(/Lumio/);
```

`/PLACEHOLDER/` does not match the page title (which contains "Lumio"), so the soft assertion fails. The test continues running (that's the point of `expect.soft`), and the heading assertion on the next line still executes. When the test finishes, the soft assertion failure is reported in `testInfo.errors` and marked in the HTML report — but execution was not interrupted mid-test.

## Part 6 — CI/CD Pipeline Optimization (formerly M86)

## TODO 6.1 — Extend timeout for slow CI runners

```typescript
testInfo.setTimeout(testInfo.timeout + 30_000);
```

**Why it works:** `testInfo.timeout` is the current test's configured timeout (e.g., 30 000 ms from `playwright.config.ts`). Adding 30 000 extends it by 30 seconds for this test only, without touching the global config. This is the right pattern when one test consistently needs more time in CI without making every test slower.

---

## TODO 6.2 — Assert retry count is less than 2

```typescript
expect(testInfo.retry).toBeLessThan(2);
```

**Why it works:** `testInfo.retry` is 0 on the first attempt and increments with each retry. Asserting it is less than 2 means the test is allowed at most one retry (index 1) before the assertion itself fails. A test that regularly needs two retries is too flaky to ship.

---

## TODO 6.3 — Assert workerIndex is non-negative

```typescript
expect(testInfo.workerIndex).toBeGreaterThanOrEqual(0);
```

**Why it works:** Worker indices are assigned sequentially starting at 0. Asserting `>= 0` confirms the property exists and carries a valid value. In real test data strategies you would use the index to construct unique email addresses (`worker${testInfo.workerIndex}@lumio.test`) to avoid cross-worker conflicts.

---

## TODO 6.4 — Assert project name matches browser pattern

```typescript
expect(testInfo.project.name).toMatch(/chromium|firefox|webkit/i);
```

**Why it works:** `testInfo.project.name` matches the `name` field of the project in `playwright.config.ts`. The regex covers all three standard browser projects. Matching against this lets you skip known browser-specific bugs (`test.skip(browserName === 'webkit', 'known bug')`) or apply conditional assertions per browser.

---

## TODO 6.5b — Assert outputDir contains 'test-results'

```typescript
expect(testInfo.outputDir).toContain('test-results');
```

**Why it works:** Playwright writes all per-test artifacts (traces, screenshots, attachments) to `testInfo.outputDir`, which is nested inside the configured `outputDir` (defaulting to `test-results/`). Asserting it contains `'test-results'` verifies the artifact pipeline is correctly configured before you rely on it for CI uploads.

---

## TODO 6.6 — Push a 'tag' annotation

```typescript
testInfo.annotations.push({
  type: 'tag',
  description: '@smoke',
});
```

**Why it works:** The `type: 'tag'` convention is recognized by the HTML reporter and custom dashboards. When you run `--grep "@smoke"`, Playwright matches on the test title string. Adding the annotation as well makes the tag queryable from the JSON reporter output — useful for flakiness tracking scripts that need to group results by tag.

---

## TODO 6.7 — Assert duration is non-negative

```typescript
expect(testInfo.duration).toBeGreaterThanOrEqual(0);
```

**Why it works:** `testInfo.duration` reflects elapsed milliseconds during the test body. It is always `>= 0` while the test is running and is finalized (total duration) after the test completes. The real use case is in `afterEach` hooks: compare `testInfo.duration` against a budget threshold to flag slow tests in the CI report.

## Part 7 — Secrets & Security in Tests (formerly M87)

## TODO 7.1 — Load password from environment variable

```typescript
const password = process.env.TEST_PASSWORD ?? 'password123';
```

**Why it works:** `process.env.TEST_PASSWORD` is read at runtime from the environment, not from source code. The `?? 'password123'` fallback is safe here because `password123` is a seed-only test account credential that only exists in the isolated test database. In CI, set `TEST_PASSWORD` as an encrypted repository secret — it will override the fallback.

---

## TODO 7.2 — Assert env var is not an empty string

```typescript
expect(email).not.toBe('');
```

**Why it works:** An empty string that passes silently is worse than an explicit failure. If `TEST_EMAIL` is unset and the auth system accepts blank credentials, your tests will produce false positives. The pattern `not.toBe('')` fails fast with a clear message so you know the environment is misconfigured before wasting CI time.

---

## TODO 7.3 — Mask the password field in screenshots

```typescript
const maskedField = page.getByLabel('Password');
```

**Why it works:** `page.screenshot({ mask: [locator] })` replaces the matched element's bounding box with a magenta overlay in the captured PNG. The password field value never appears in the artifact. Apply the same pattern to API key display fields, credit card inputs, and any PII shown in the UI during tests.

---

## TODO 7.4 — Annotate presence without exposing the key value

```typescript
testInfo.annotations.push({
  type: 'security',
  description: 'api-key-present',
});
```

**Why it works:** The annotation confirms the API key was provided for this test run without writing the key itself into the report. The HTML reporter renders annotation descriptions directly in the test result — if you wrote `description: apiKey`, the key would appear in every CI artifact. "Present/absent" flags communicate the intent without the exposure risk.

---

## TODO 7.5 — Assert DATABASE_URL matches a safe pattern

```typescript
expect(dbUrl).toMatch(/localhost|127\.0\.0\.1|lumio_test/);
```

**Why it works:** The regex matches three valid patterns for a test database URL: a localhost hostname, the loopback IP, or a database name containing `lumio_test`. If someone accidentally sets `DATABASE_URL` to the production connection string, this assertion fails immediately before any destructive test operations run. Fail-fast beats discovering the problem after the seed script drops the prod database.

---

## TODO 7.6 — Assert authHeaderFound is true

```typescript
expect(authHeaderFound).toBe(true);
```

**Why it works:** After a successful login, Lumio's dashboard page makes authenticated API requests. The route interceptor checks for the `Authorization` header presence without logging its value. The boolean `authHeaderFound` tells you whether auth is wired up correctly — the header value never enters the test output.

---

## TODO 7.7 — Assert outputDir contains 'test-results'

```typescript
expect(testInfo.outputDir).toContain('test-results');
```

**Why it works:** `testInfo.outputDir` is the per-test artifact directory. It should always be under the project's `test-results/` folder, not a shared network path, a cloud mount, or a production log directory. If your CI configuration misconfigures the output path, this assertion catches it before sensitive artifacts (traces with auth headers) are written to an unintended location.

## Part 8 — Test Health Observability (formerly M88)

## TODO 8.1 — Assert retry is 0

```typescript
expect(testInfo.retry).toBe(0);
```

**Why it works:** `testInfo.retry` is 0 on the first run attempt, 1 on the first retry, and so on. A stable test that passes without retries always has `retry === 0`. Asserting this in a known-stable test validates that your flakiness tracking baseline is correct: if this test ever reports a non-zero retry, it means the test or its environment has become unreliable.

---

## TODO 8.2 — Assert duration is >= 0

```typescript
expect(testInfo.duration).toBeGreaterThanOrEqual(0);
```

**Why it works:** Duration is measured in milliseconds from when the test starts. It is always non-negative, even at the start of the test body. In `afterEach` hooks, `testInfo.duration` reflects the complete test runtime — that's where you'd enforce a budget like `expect(testInfo.duration).toBeLessThan(10_000)`.

---

## TODO 8.3 — Push annotation with type 'tag'

```typescript
testInfo.annotations.push({
  type: 'tag',
  description: '@smoke',
});
```

**Why it works:** `'tag'` is the conventional annotation type for coverage tier markers. The HTML reporter renders it visually alongside the test, and the JSON reporter serializes it so post-processing scripts can count tests by tier. With `'PLACEHOLDER'`, the find call returns `undefined` and `undefined?.type` does not equal `'tag'`, causing the assertion to fail.

---

## TODO 8.4 — Set flakiness-risk description to 'low'

```typescript
description: 'low',
```

**Why it works:** The `flakiness-risk` annotation is a custom type your health script reads from the JSON reporter output. Values like `'low'`, `'medium'`, and `'high'` let you prioritize which flaky tests to investigate first. `'PLACEHOLDER'` does not equal `'low'`, so the assertion fails. Tests that hit network-dependent assertions (WebSocket, SSE) should be tagged `'high'`.

---

## TODO 8.5 — Assert testId is not an empty string

```typescript
expect(testInfo.testId).not.toBe('');
```

**Why it works:** `testInfo.testId` is a stable hash derived from the test's file path, title, and project. It is the correct key for a metrics database because it remains consistent across runs for the same test. `not.toBe('definitely-not-empty')` is always true and does not verify the property — `not.toBe('')` verifies it is actually populated.

---

## TODO 8.6 — Assert title matches /@smoke/

```typescript
expect(testInfo.title).toMatch(/@smoke/);
```

**Why it works:** `testInfo.title` is the full test title string. Including `@smoke` in the test name is what makes `npx playwright test --grep "@smoke"` match it. The regex `/@smoke/` verifies the tag is present. `/PLACEHOLDER/` does not match any part of the title, so the assertion fails, signaling the learner that the tag is missing.

---

## TODO 8.7 — Set contentType to 'application/json'

```typescript
contentType: 'application/json',
```

**Why it works:** `testInfo.attach()` requires a `contentType` MIME type to tell report viewers how to render the attachment. `'application/json'` causes the HTML reporter to display the JSON as formatted text, and it allows downstream consumers to parse the attachment body. With `'PLACEHOLDER_CONTENT_TYPE'`, the attachment is registered but the assertion `expect(testInfo.attachments[0].contentType).toBe('application/json')` fails.
