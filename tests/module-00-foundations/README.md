# Lesson 00: Foundations

*Combines former modules M00–M05.*

## Learning Objectives

### Part 1 — Setup & Project Structure (formerly M00)

By the end of this module you will be able to:
- Explain what `@playwright/test` adds over `playwright-core` and when you'd use each
- Read a `playwright.config.ts` and understand what every top-level option controls
- Configure a `webServer` so tests automatically start and stop the app under test
- Install browser binaries and run your first passing test

### Part 2 — How Playwright Works Internally (formerly M01)

> **Awareness module** — no exercise. Read this before Part 3 of this lesson (formerly M02).

- Explain the Browser/BrowserContext/Page hierarchy and why it matters for test isolation
- Describe what "auto-waiting" means and why tests don't need `sleep()` calls
- Explain the difference between `playwright-core` and `@playwright/test`
- Understand at a high level how Playwright communicates with browsers (CDP / BiDi)

### Part 3 — Locators — Finding Elements (formerly M02)

- Choose between `getByRole`, `getByLabel`, `getByText`, `getByPlaceholder`, `getByTestId`, CSS/XPath for any given element
- Chain locators to narrow scope to a specific container
- Filter a locator set with `.filter()` and select a specific index with `.nth()`
- Explain why locators are evaluated lazily (re-evaluated on each action, not at creation time)

### Part 4 — Actions — Interacting with Elements (formerly M03)

- Choose between `click`, `fill`, `press`, `pressSequentially`, `hover`, `selectOption` for any interaction
- Explain what "actionable" means and why auto-wait makes explicit waits unnecessary
- Know when `pressSequentially` is needed over `fill`
- Know the difference between `selectOption` (native select) and click-based patterns for custom dropdowns

### Part 5 — Assertions — Verifying State (formerly M04)

- Use the most appropriate assertion matcher for each verification type
- Explain the difference between `expect()` (web-first, auto-retry) and Node.js `assert`
- Use soft assertions to collect multiple failures without short-circuiting
- Use `expect.poll()` for non-Playwright values that change asynchronously

### Part 6 — Navigation & Page State (formerly M05)

- Navigate programmatically with `goto`, `reload`, `goBack`, `goForward`
- Explain when `waitForURL` is needed vs when click-based navigation is sufficient
- Choose between `'domcontentloaded'`, `'load'`, and `'networkidle'` for `waitForLoadState`
- Use `waitForResponse` to synchronize tests with specific API calls

## Concept

### Part 1 — Setup & Project Structure (formerly M00)

#### `playwright-core` vs `@playwright/test`

Playwright ships as two packages:

- **`playwright-core`** — the automation engine only. No test runner, no assertions, no fixtures. You use it when writing scraping scripts, monitoring bots, or embedding Playwright into an existing test framework.
- **`@playwright/test`** — everything in `playwright-core` plus the `test()` runner, `expect()` assertions, fixtures, reporters, and the CLI. This is what you want for a test suite.

This course uses `@playwright/test`. You'll see `playwright-core` mentioned in Lesson 12 (formerly M55) (scraping) and Lesson 17 (formerly M80) (MCP server) where the test runner is not needed.

#### `webServer` config

Rather than requiring you to start Lumio manually before each test run, `playwright.config.ts` uses `webServer` to manage the app lifecycle:

```typescript
webServer: {
  command: 'npm run dev --prefix lumio',  // starts Next.js
  url: 'http://localhost:3000',            // Playwright polls this URL
  reuseExistingServer: !process.env.CI,   // reuse local dev server; start fresh in CI
  timeout: 120_000,                        // give Next.js 2 minutes to compile
}
```

Playwright starts the command, waits until the `url` responds, runs all tests, then kills the process. Lesson 08 (formerly M41) goes deep on all the available options.

#### Headless vs headed

By default, Playwright runs headless (no visible browser window) — it's fast and CI-friendly. To watch tests run:

```bash
npx playwright test --headed
```

Or use UI mode (`--ui`) for a full GUI with time-travel debugging. You'll use both in Lesson 01 (formerly M10).

### Part 2 — How Playwright Works Internally (formerly M01)

#### The hierarchy

Playwright structures browser automation in three layers:

```
Browser
  └── BrowserContext  ← isolated session (cookies, localStorage, permissions)
        └── Page      ← a single browser tab
```

**Browser** — a running Chrome/Firefox/WebKit process. Expensive to create.

**BrowserContext** — like a fresh browser profile: separate cookies, localStorage, and auth state. Creating one is fast (milliseconds). Each test gets its own context, which is why tests don't bleed into each other even when running in parallel.

**Page** — a single tab inside a context. Most test code works at the `page` level.

In `@playwright/test`, each `test()` function receives a fresh `page` (and its parent `context`) automatically. You never call `browser.newContext()` yourself in normal tests — the fixtures handle it.

#### Auto-waiting

Playwright waits for elements to be:
- Attached to the DOM
- Visible (not hidden, not zero-size)
- Stable (not animating)
- Enabled (not disabled)
- Editable (for fill/type actions)

Before performing any action. This is why you almost never need `await page.waitForSelector()` or `sleep()`. Auto-waiting has a timeout (default 30 seconds, configurable per action) after which it throws a `TimeoutError`.

#### How communication works (conceptual)

Playwright talks to browsers via two protocols:
- **CDP** (Chrome DevTools Protocol) — used for Chromium
- **WebKit debug protocol** — used for WebKit/Safari
- **Firefox Remote Debugging Protocol / BiDi** — used for Firefox

These are low-level socket-based protocols. Playwright's Node.js process is the "client"; the browser process is the "server". Every `click()`, `fill()`, `goto()` you call is translated into protocol messages that the browser executes and confirms.

You will never interact with these protocols directly in most testing. They matter when you reach for `page.evaluate()`, CDP sessions (Lesson 13 (formerly M62)), or when debugging why auto-wait didn't work.

### Part 3 — Locators — Finding Elements (formerly M02)

The most important question in any Playwright test is: *how do you find the element you want?* The answer matters far more than you might think — a fragile locator is the leading cause of flaky tests.

Playwright gives you several locator strategies. They're not equally good, and knowing the hierarchy will save you hours of debugging.

**`getByRole` is your default.** It targets elements by their ARIA role and accessible name — the same information screen readers use. `page.getByRole('button', { name: 'Submit' })` finds a button with the text "Submit" regardless of where it lives in the DOM, what class it has, or how it's styled. It survives refactors. If your designer renames a class from `.btn-primary` to `.btn-cta`, your `getByRole` test still passes.

**`getByLabel` is best for form inputs.** A label/input pair is a first-class HTML relationship. `page.getByLabel('Email address')` matches the `<input>` associated with a `<label>Email address</label>` — far more readable than `page.locator('#email-input')`.

**`getByText` for visible text content.** Use `exact: true` to prevent partial matches from causing false positives. `page.getByText('Pricing', { exact: true })` won't match a card that says "View pricing details".

**`getByTestId` when nothing else fits.** Feature cards and pricing cards on Lumio's landing page are visually distinct but don't have unique accessible names. That's exactly the right time for `data-testid`. The attribute exists solely for automation — it doesn't affect semantics or styling. Don't use `data-testid` as your *first* choice though; a `getByRole` that works is always clearer.

**Avoid CSS selectors and XPath** in almost all cases. They couple your tests to implementation details — a class rename or DOM restructure breaks them even when the feature is working fine.

#### Locators are lazy

This is the property that makes Playwright tests robust. When you write:

```typescript
const heading = page.getByRole('heading', { level: 1 });
```

Playwright doesn't look up the element yet. It records *how* to find it. Every time you call `.toBeVisible()`, `.click()`, or any other operation on `heading`, Playwright evaluates the locator fresh against the current DOM state. This means if the DOM re-renders (a React state update, a fetch completing), your locator still finds the right element — it doesn't hold a stale reference.

#### Chaining and filtering

Chaining narrows scope. If you have three pricing cards and you want the button inside the Pro card:

```typescript
const proCard = page.getByTestId('pricing-card-pro');
const proButton = proCard.getByRole('link'); // only searches inside proCard
```

`.filter()` is for when you start with a set of elements and want to narrow it by a condition. It's more composable than embedding the condition in the original locator. `.nth()` picks by position (zero-indexed).

### Part 4 — Actions — Interacting with Elements (formerly M03)

Every action you call in Playwright — `click()`, `fill()`, `hover()`, `press()` — goes through an actionability check before it executes. Playwright waits until the element is:

- **Attached** to the DOM (not removed or not yet rendered)
- **Visible** (not hidden by CSS, non-zero size)
- **Stable** (not mid-animation)
- **Enabled** (not `disabled`)
- **Editable** (for `fill()` — not `readonly`)

This is auto-waiting. It's the reason you don't need `sleep()` calls or `waitForSelector()` in the vast majority of tests. If you've ever written Selenium tests littered with `Thread.sleep(1000)`, this is the feature that replaces all of that.

If actionability isn't reached within the timeout (default 30 seconds, configurable per action), Playwright throws a `TimeoutError` with a detailed message explaining what condition wasn't met.

#### `fill()` vs `pressSequentially()`

`fill()` clears the field and sets its value atomically — it's the equivalent of clearing the input and pasting text. It's fast and reliable for almost all use cases.

`pressSequentially()` dispatches real keyboard events (`keydown`, `keypress`, `input`, `keyup`) for each character, one at a time. Use it when the app responds to individual keystrokes — for example, a search box that shows suggestions on each character typed, or a rich text editor that intercepts keyboard shortcuts. For a plain `<input>`, `fill()` is always better.

#### `click()` is smarter than it looks

`click()` doesn't just fire a click event. It waits for actionability, scrolls the element into view if needed, moves the mouse pointer to the element's center, and clicks. If the click is intercepted (another element is covering the target), Playwright retries — it doesn't fail immediately.

#### `hover()` and CSS `:hover`

`hover()` moves the mouse to the element's center, triggering CSS `:hover` styles and any JavaScript `mouseover` handlers. It's useful for testing dropdown menus, tooltips, and any UI that responds to pointer position.

#### `selectOption()` — native `<select>` only

`selectOption()` works exclusively with the HTML `<select>` element. Most modern UI libraries (Radix UI, shadcn/ui, Headless UI) render custom dropdown components using `<div>` and `<button>` elements, not native `<select>`. For these, the correct pattern is `click()` on the trigger to open the dropdown, then `click()` on the desired option.

#### `dragTo()` — a note

`dragTo()` handles most basic drag-and-drop scenarios. Lumio's kanban board uses a library that listens to pointer events, so it works with `dragTo()`. For libraries that intercept low-level mouse events, you'll need `page.mouse.down()` / `page.mouse.move()` / `page.mouse.up()` — covered in Lesson 04 (formerly M23).

### Part 5 — Assertions — Verifying State (formerly M04)

Assertions are how your tests decide whether the application is working correctly. In Playwright, assertions aren't just checks — they're *waiting* checks. This is what "web-first" means.

When you write:
```typescript
await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
```

Playwright doesn't just look at the DOM right now and pass or fail. It polls — repeatedly checking whether the heading is visible — until either the assertion passes or the timeout expires (default 5 seconds for assertions). This is the property that makes tests robust to animations, loading states, and async data fetches. The heading might not be visible *yet*, but if it becomes visible within the timeout, the assertion passes.

This is fundamentally different from Node.js `assert.ok(element)` — which is synchronous and checks state once, right now. Don't use `assert` for DOM state in Playwright tests.

#### The most common matchers

**Page-level:**
- `toHaveTitle(/regex/)` — matches the document `<title>`
- `toHaveURL(/regex/)` — matches the current URL

**Locator-level:**
- `toBeVisible()` — attached + not hidden + non-zero size
- `toBeEnabled()` / `toBeDisabled()` — for form controls
- `toBeChecked()` — for checkboxes and radio buttons
- `toHaveText('exact string')` or `toHaveText(/regex/)` — text content
- `toContainText('partial')` — substring match
- `toHaveValue('value')` — for inputs
- `toHaveCount(n)` — number of elements matching a locator
- `toHaveAttribute('href', '/path')` — DOM attribute value

#### Soft assertions

Normal assertions stop the test immediately on failure. Sometimes you want to check several independent things and get a report of *all* failures, not just the first.

```typescript
await expect.soft(page.getByRole('heading', { level: 1 })).toBeVisible();
await expect.soft(page).toHaveTitle(/Lumio/);
```

Both assertions run even if the first fails. The test is marked as failed after all soft assertions complete. Use soft assertions when the checks are truly independent — if check B depends on check A passing, use normal assertions.

#### `expect.poll()` for non-Playwright values

Playwright's built-in matchers know how to auto-retry locator state. But sometimes you're asserting a JavaScript value that changes asynchronously — a counter, a WebSocket message count, a custom flag.

```typescript
await expect.poll(() => apiCallCount, { timeout: 3000 }).toBeGreaterThan(0);
```

`expect.poll` calls the function repeatedly until the assertion passes or the timeout expires. You can use any Jest-compatible matcher after `.poll(fn)`.

#### Custom assertion messages

When an assertion fails, Playwright's error message tells you what was expected and what was found. You can add context with a second argument:

```typescript
await expect(page.getByRole('button'), 'submit button should be visible after form fills').toBeVisible();
```

### Part 6 — Navigation & Page State (formerly M05)

Most navigation in Playwright tests happens automatically. When you `click()` a link, Playwright waits for the resulting navigation to complete before moving to the next line. You don't need to `waitForURL` after every click — auto-wait handles it.

The explicit navigation APIs exist for situations where navigation is triggered by *non-Playwright code*: a JavaScript redirect after a timer fires, a WebSocket message that triggers a route change, or a server-side redirect that happens before the page returns.

#### `goto`, `reload`, `goBack`, `goForward`

These are the direct navigation methods. They all return a promise that resolves when the browser has loaded the new page (specifically, when the `load` event fires by default).

`page.goto(url, { waitUntil: 'domcontentloaded' })` is faster than the default if you don't need images and stylesheets to load before interacting. For Next.js apps like Lumio, the default `'load'` is usually fine.

#### `waitForURL`

Use `waitForURL` after actions that trigger client-side navigation when you want to explicitly assert the destination. It's also useful when the navigation happens indirectly — for example, a form submission that redirects to `/dashboard` after an API call succeeds:

```typescript
await page.getByRole('button', { name: 'Sign in' }).click();
await page.waitForURL(/dashboard/, { timeout: 10_000 });
```

The timeout here is generous (10 seconds) because network + auth + redirect can be slow in tests.

#### `waitForLoadState`

Three states to know:

- **`'domcontentloaded'`** — HTML is parsed, the DOM is ready, but images and external resources may still be loading. Fast.
- **`'load'`** — All resources (images, stylesheets, scripts) have loaded. This is the default for `page.goto`.
- **`'networkidle'`** — No outgoing network requests for 500ms. Useful for SPAs that load data asynchronously after the initial page load. Slower and potentially flaky if the app makes periodic requests.

Don't use `'networkidle'` unless you need it — it's slower and can cause intermittent timeouts if the app polls the server.

#### `waitForResponse`

`waitForResponse` lets you wait for a specific HTTP response, identified by URL pattern or a predicate function. The critical rule: **create the promise before the action that triggers the request.**

```typescript
const responsePromise = page.waitForResponse(/\/api\/auth/);
await page.getByRole('button', { name: 'Sign in' }).click();
const response = await responsePromise;
expect(response.status()).toBe(200);
```

If you create the promise after the action, the response may have already arrived and the promise never resolves.

## Lumio Context

See [lumio-context.md](./lumio-context.md).

## Step-by-Step Tasks

### Part 1 — Setup & Project Structure

#### TODO 1.1: Install Playwright browsers

Playwright bundles its own browser binaries (Chromium, Firefox, WebKit). They are not the same as your system Chrome. Run:

```bash
npx playwright install chromium
```

Verify installation: `~/.cache/ms-playwright/` (Linux/Mac) or `%APPDATA%\ms-playwright\` (Windows) should contain a `chromium-*` directory.

#### TODO 1.2: Complete the exercise

Open `exercise.spec.ts`. Complete the two TODOs.

#### TODO 1.3: Run the test

```bash
npx playwright test tests/module-00-foundations
```

All tests should pass. If Lumio is not running, start it first: `npm run dev --prefix lumio`

Validate this part only:
```bash
npx playwright test tests/module-00-foundations -g "Part 1 — Setup & Project Structure (formerly M00)"
```

### Part 3 — Locators — Finding Elements

Complete each TODO in `exercise.spec.ts` in order.
Run after each TODO:
```bash
npx playwright test tests/module-00-foundations --headed
```

Validate this part only:
```bash
npx playwright test tests/module-00-foundations -g "Locator strategies on Lumio landing page"
```

### Part 4 — Actions — Interacting with Elements

Complete each TODO in `exercise.spec.ts`.
```bash
npx playwright test tests/module-00-foundations --headed
```

Validate this part only:
```bash
npx playwright test tests/module-00-foundations -g "Actions on Lumio landing page"
```

### Part 5 — Assertions — Verifying State

Complete each TODO in order.
```bash
npx playwright test tests/module-00-foundations
```

Validate this part only:
```bash
npx playwright test tests/module-00-foundations -g "Assertions on Lumio landing page"
```

### Part 6 — Navigation & Page State

Complete each TODO in `exercise.spec.ts`.
```bash
npx playwright test tests/module-00-foundations --headed
```

Validate this part only:
```bash
npx playwright test tests/module-00-foundations -g "Navigation on Lumio public pages"
```

## Validate (full lesson)

```bash
npx playwright test tests/module-00-foundations
```

## Key Takeaways

### Part 1 — Setup & Project Structure

1. `@playwright/test` = `playwright-core` + test runner + assertions + fixtures. Use it for test suites.
2. `webServer` removes the "start the app first" manual step — it's the right default for test suites.
3. `npx playwright install` must be run on any new machine — browser binaries are not in `node_modules`.
4. `headless: true` is the default. `--headed` or `--ui` adds visibility for debugging.
5. Browser binaries are versioned with the Playwright release. After upgrading Playwright, re-run `npx playwright install`.

### Part 2 — How Playwright Works Internally

1. Each test runs in an isolated BrowserContext — tests can run in parallel without sharing state.
2. Auto-waiting means no `sleep()` and no `waitForSelector()` in 95% of cases.
3. `@playwright/test` = `playwright-core` + test runner + assertions + fixtures + CLI.
4. The Browser/Context/Page hierarchy maps to: process / profile / tab.
5. CDP is how Playwright talks to Chrome under the hood — relevant in Lesson 13 (formerly M62) (CDP deep dive).

### Part 3 — Locators — Finding Elements

1. `getByRole` is the most resilient locator — it survives CSS and DOM structure changes.
2. A locator is not an element — it's a recipe evaluated fresh on every action.
3. Chain locators (`container.getByRole(...)`) to scope searches to a region, not the whole page.
4. `.filter()` composes with any locator; `.nth()` picks by position. Both are lazy.
5. `data-testid` is appropriate when no semantic locator uniquely identifies the element.

### Part 4 — Actions — Interacting with Elements

1. Every action waits for the element to be actionable — no `waitForSelector` needed.
2. `fill()` clears + types atomically. `pressSequentially()` fires key events one at a time.
3. `press('Enter')` submits forms reliably regardless of whether there's a submit button.
4. `selectOption()` is only for native `<select>`. Custom dropdowns require click-based patterns.
5. `dragTo()` works for simple DnD; `page.mouse` is needed for libraries that ignore synthetic events (Lesson 04, formerly M23).

### Part 5 — Assertions — Verifying State

1. Playwright assertions auto-retry — they assert what the page SHOULD become.
2. `expect.soft()` collects failures without stopping — use for independent checks.
3. `expect.poll(() => value)` handles non-Playwright values that change asynchronously.
4. `toHaveText` does exact match; use a regex for partial match.
5. Custom assertion messages: `expect(locator, 'element should be visible after login').toBeVisible()`.

### Part 6 — Navigation & Page State

1. `click()` auto-waits for navigation — you don't need `waitForURL` after every click.
2. `waitForURL` is for navigation triggered by non-Playwright code (redirects, timers).
3. Prefer `'domcontentloaded'` for speed; use `'networkidle'` only when SPAs load data after render.
4. Create `waitForResponse` promises **before** the action that triggers the request.
5. `goBack()` and `goForward()` test browser history — relevant for multi-step flows.

## Going Deeper

### Part 1 — Setup & Project Structure

- [Playwright docs: Configuration](https://playwright.dev/docs/test-configuration)
- [Playwright docs: webServer](https://playwright.dev/docs/test-webserver)
- [playwright-core vs @playwright/test distinction](https://playwright.dev/docs/library)

### Part 2 — How Playwright Works Internally

- [Playwright docs: Browser contexts](https://playwright.dev/docs/browser-contexts)
- [Playwright docs: Auto-waiting](https://playwright.dev/docs/actionability)

### Part 3 — Locators — Finding Elements

- [Playwright docs: Locators](https://playwright.dev/docs/locators)
- [Playwright docs: Best practices](https://playwright.dev/docs/best-practices)

### Part 4 — Actions — Interacting with Elements

- [Playwright docs: Actions](https://playwright.dev/docs/input)

### Part 5 — Assertions — Verifying State

- [Playwright docs: Assertions](https://playwright.dev/docs/test-assertions)

### Part 6 — Navigation & Page State

- [Playwright docs: Navigation](https://playwright.dev/docs/navigations)
- [Playwright docs: waitForResponse](https://playwright.dev/docs/api/class-page#page-wait-for-response)
