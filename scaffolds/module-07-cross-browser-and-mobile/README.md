# Lesson 07: Cross-Browser & Mobile Testing

*Combines former modules M34–M37.*

## Learning Objectives

### Part 1 — Cross-Browser Testing Strategy (formerly M34)
- Configure Playwright's `projects` array to run the same tests across Chromium, Firefox, and WebKit
- Identify the most common browser-specific behavior differences and why they occur
- Decide which tests need to run on all three browsers vs. Chromium-only
- Diagnose and fix a test that passes on Chromium but fails on WebKit
- Apply strategies to manage WebKit's stricter security model and occasional timing differences

### Part 2 — Mobile Emulation & Responsive Testing (formerly M35)
- Apply Playwright's device presets to test Lumio on iPhone and iPad screen sizes
- Use `page.emulateMedia()` to test dark mode and print stylesheet behavior
- Assert that responsive breakpoints work correctly (e.g., hamburger menu appears below 768px)
- Test orientation changes between portrait and landscape
- Decide which mobile tests belong in the main suite vs. a dedicated mobile project

### Part 3 — Geolocation, Permissions & Device APIs (formerly M36)
- Grant, deny, and clear browser permissions in test contexts using `context.grantPermissions()`
- Set a fake geolocation to test location-aware features without physical movement
- Override the browser timezone and locale to test localization-sensitive behavior
- Assert the correct UI feedback when a permission is denied
- Decide when to grant permissions globally in context vs. per-test

### Part 4 — Offline, PWA & Service Workers (formerly M37)
- Wait for service worker registration with `context.waitForEvent('serviceworker')`
- List active service workers with `context.serviceWorkers()`
- Simulate offline mode with `context.setOffline(true/false)`
- Verify cached content is served when offline
- Test background sync behaviour: queue an action offline, go online, assert the action fires
- Verify PWA installability criteria: manifest present, service worker registered, HTTPS (or localhost)

## Concept

### Part 1 — Cross-Browser Testing Strategy (formerly M34)

This lesson is one of two in the course (the other being Lesson 01, which covers the multi-project config itself) whose branch installs all three Playwright browsers — Chromium, Firefox, and WebKit — rather than Chromium only, since this Part is specifically about cross-browser testing; make sure all three are installed before running the exercises below.

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

### Part 2 — Mobile Emulation & Responsive Testing (formerly M35)
Mobile emulation in Playwright is not running tests on a real iPhone. It is running a Chromium browser that pretends to be a mobile device — it sets the viewport size, device pixel ratio, user agent string, and touch event support to match a real device. For the vast majority of responsive design testing, this is exactly what you need.

**Device presets.** Playwright ships with a `devices` dictionary containing presets for dozens of real devices. `devices['iPhone 14']` sets viewport to 390×844, device pixel ratio to 3, user agent to Safari on iOS, and enables touch events. `devices['iPad Pro']` sets a tablet-sized viewport with the appropriate UA string. You spread these into a project's `use` block or into `test.use()` for a single test file. The mechanics look the same as a regular test — you still call `page.goto()`, `locator.click()`, `expect()` — but the page renders as if it were on the target device.

**What emulation does and does not cover.** Emulation faithfully tests CSS media queries, responsive layouts, and touch event handling. It does not test native mobile browser rendering engines — WebKit-on-iPhone behavior is only testable with the WebKit Playwright project, not with Chromium in iPhone emulation mode. For layout and responsive behavior testing, Chromium emulation is accurate enough. For Safari-specific rendering bugs, use the WebKit project (Part 1 of this lesson, formerly M34).

**`page.emulateMedia()`** is the tool for testing media queries that are not about screen size. Dark mode support in CSS is controlled by the `prefers-color-scheme` media feature. `page.emulateMedia({ colorScheme: 'dark' })` tells the page that the user prefers dark mode, regardless of the OS setting. Similarly, `{ media: 'print' }` activates `@media print` stylesheets — useful for testing that print layouts hide navigation and format content for paper. These can be called at any point during a test, not just at startup.

**Hamburger menus and breakpoints.** Lumio's navigation collapses to a hamburger menu below 768px. At full desktop width, the nav links are visible. At mobile width, they are hidden behind a menu button. Testing this requires asserting that the nav links are hidden at mobile viewport, that the hamburger button is visible, clicking it, and asserting the nav links appear. This is a pattern you will encounter in almost every responsive app. The key locators are semantic: `getByRole('navigation')`, `getByRole('button', { name: /menu/i })`.

**Orientation changes.** `page.setViewportSize()` can be called mid-test to simulate rotating a device. Switching from portrait (390×844) to landscape (844×390) may affect layout and reveal orientation-specific bugs. After calling `setViewportSize`, Playwright re-renders the page without reloading it — media queries based on `(orientation: landscape)` update immediately.

**Organizing mobile tests.** The cleanest approach is a dedicated mobile project in `playwright.config.ts` — `{ name: 'mobile-chrome', use: { ...devices['iPhone 14'] } }`. This runs your entire test suite (or a tagged subset) on mobile. For a smaller codebase, `test.use({ ...devices['iPhone 14'] })` at the top of a specific test file applies the device for that file only without creating a project. Both are valid; projects scale better for large suites.

### Part 3 — Geolocation, Permissions & Device APIs (formerly M36)
Browsers gate access to powerful device APIs behind permission prompts: geolocation, camera, microphone, clipboard, notifications. In production these prompts appear when a user visits your site. In tests you need to decide the outcome of those prompts upfront — you cannot click "Allow" or "Deny" on a native browser dialog from Playwright in the normal way. Instead, Playwright gives you `context.grantPermissions()` and its counterpart `context.clearPermissions()` to set the state programmatically before any user action triggers the prompt.

**`context.grantPermissions()`** takes an array of permission strings and an optional `{ origin }` option to scope the grant to a specific origin. The permission strings match the names defined in the Permissions API spec: `'geolocation'`, `'notifications'`, `'camera'`, `'microphone'`, `'clipboard-read'`, `'clipboard-write'`. Granting before the page loads means the browser never shows a prompt — your code runs as if the user already said "Allow". This is the right approach for the happy path.

**Testing the denied path** is equally important. Denying a geolocation request should trigger fallback UI — a message, a default location, or an error state. `context.clearPermissions()` resets all grants to the browser's default, which is "deny" in headless contexts. After clearing, when your app calls `navigator.geolocation.getCurrentPosition()`, the browser calls the error callback rather than the success callback. Your test can then assert the correct error UI appears.

**Fake geolocation.** `context.setGeolocation({ latitude: 48.8566, longitude: 2.3522 })` pins the browser's location to Paris. Any call to `navigator.geolocation.getCurrentPosition()` returns these coordinates. This is how you test location-aware features (nearest office finder, timezone detection, weather widgets) without physically traveling to Paris. The coordinates update immediately — you can call `setGeolocation()` multiple times in a test to simulate movement.

**Timezone override.** `context.setTimezone('America/New_York')` tells the browser that the user is in New York, regardless of the machine's real timezone. This affects `new Date().toLocaleTimeString()`, `Intl.DateTimeFormat`, and any JavaScript that reads the local timezone. Use it to test features like "show tasks due in your timezone" without setting your machine's timezone manually. Unlike geolocation, timezone is set at context creation time in Playwright — if you need a different timezone mid-test, create a new context.

**Locale override.** `context.setLocale('fr-FR')` sets the locale for `Intl.*` APIs, number formatting, and `Accept-Language` headers sent to the server. Combined with timezone, it lets you simulate a French user in Paris without changing your system settings.

**When to set permissions globally.** If most of your tests in a file need geolocation, set it in `test.beforeAll()` at the context level using worker-scoped fixtures, or configure it in your project's `use` block in `playwright.config.ts`. Setting permissions inside individual tests is fine for one-off scenarios. The tradeoff: global grants are faster but can hide tests that should be testing the deny path.

### Part 4 — Offline, PWA & Service Workers (formerly M37)
Service workers are BrowserContext-scoped, not Page-scoped. All pages within
the same context share the same service worker registration.

> **Note — Lesson 02 (formerly M13) vs M37:** Lesson 02 (formerly M13) uses `context.setOffline()` to simulate network failure in the context of API testing. M37 applies the same API specifically to PWA offline behaviour: the intent is to verify the service worker cache and offline fallback page, not to test error handling in API calls.

**Offline simulation:**
```typescript
await context.setOffline(true);   // disconnect network
await page.reload();               // SW serves cached response
await context.setOffline(false);  // reconnect
```

`setOffline(true)` is more realistic than mocking individual requests because
it also sets `navigator.onLine = false`, which many apps check directly.

## Lumio Context

See [lumio-context.md](./lumio-context.md).

## Step-by-Step Tasks

### Part 1 — Cross-Browser Testing Strategy
Complete each TODO in `exercise.spec.ts` in order.
Run after each TODO:
```bash
npx playwright test tests/module-07-cross-browser-and-mobile --project chromium
```

To run all three browsers:
```bash
npx playwright test tests/module-07-cross-browser-and-mobile
```

Validate this part only:
```bash
npx playwright test tests/module-07-cross-browser-and-mobile -g "Part 1 — Cross-Browser Testing Strategy (formerly M34)"
```

### Part 2 — Mobile Emulation & Responsive Testing
Complete each TODO in `exercise.spec.ts` in order.
Run after each TODO:
```bash
npx playwright test tests/module-07-cross-browser-and-mobile --headed
```

Validate this part only:
```bash
npx playwright test tests/module-07-cross-browser-and-mobile -g "Part 2 — Mobile Emulation & Responsive Testing (formerly M35)"
```

### Part 3 — Geolocation, Permissions & Device APIs
Complete each TODO in `exercise.spec.ts` in order.
Run after each TODO:
```bash
npx playwright test tests/module-07-cross-browser-and-mobile --headed
```

Validate this part only:
```bash
npx playwright test tests/module-07-cross-browser-and-mobile -g "Part 3 — Geolocation, Permissions & Device APIs (formerly M36)"
```

### Part 4 — Offline, PWA & Service Workers

Validate this part only:
```bash
npx playwright test tests/module-07-cross-browser-and-mobile -g "Part 4 — Offline, PWA & Service Workers (formerly M37)"
```

## Validate (full lesson)

```bash
npx playwright test tests/module-07-cross-browser-and-mobile
```

## Key Takeaways

### Part 1 — Cross-Browser Testing Strategy (formerly M34)
1. Each `projects` entry in `playwright.config.ts` runs your entire test suite — filter by `--project` for speed during development.
2. The most common cross-browser gap is date input format: `fill('2024-01-15')` works on Chromium, but WebKit may need a different approach.
3. `test.skip(({ browserName }) => ...)` is the correct way to skip a test for a specific browser — not a conditional `if` inside the test body.
4. Visual regression snapshots are browser-specific by design — maintain three baseline directories, not one.
5. WebKit in CI on Ubuntu requires `npx playwright install --with-deps webkit` to get the system libraries it needs.

### Part 2 — Mobile Emulation & Responsive Testing (formerly M35)
1. Playwright's `devices` dictionary sets viewport, DPI, user agent, and touch support — spread it into `test.use()` or a project config.
2. Mobile emulation in Chromium tests CSS/layout behavior; WebKit emulation is needed for Safari-engine-specific bugs.
3. `page.emulateMedia({ colorScheme: 'dark' })` activates dark mode mid-test — call it before the assertion, not at page load.
4. Hamburger menu testing: assert nav is hidden → assert menu button is visible → click → assert nav appears.
5. `page.setViewportSize()` changes the viewport mid-test without reloading — use it to test orientation changes.

### Part 3 — Geolocation, Permissions & Device APIs (formerly M36)
1. `context.grantPermissions(['geolocation'])` must be called before the code that triggers the permission request — not after.
2. `context.clearPermissions()` resets to deny; use it to test what your app does when the user says "Block".
3. `context.setGeolocation({ latitude, longitude })` fakes GPS coordinates — combine it with `grantPermissions(['geolocation'])` or the browser will still deny access.
4. Timezone and locale affect `Intl.*` APIs — `context.setTimezone()` and `context.setLocale()` let you test date/time formatting without changing your machine.
5. Setting permissions in a project's `use` block applies them to every test in that project without boilerplate.

### Part 4 — Offline, PWA & Service Workers (formerly M37)
1. Use `Promise.all([context.waitForEvent('serviceworker'), page.goto('/')])` to capture the SW.
2. `context.setOffline(true)` disables ALL network requests for the context.
3. The SW must cache content before going offline — load the page online first.
4. `navigator.onLine` is set to false by `setOffline(true)` — apps that check it will show offline UI.
5. PWA installability requires `manifest.json` + registered service worker + HTTPS (or localhost). Playwright can verify the first two programmatically; HTTPS is an infrastructure concern.

## Going Deeper

### Part 1 — Cross-Browser Testing Strategy (formerly M34)
- [Playwright docs: Projects](https://playwright.dev/docs/test-projects)
- [Playwright docs: Browser-specific tests](https://playwright.dev/docs/api/class-testinfo#test-info-browser-name)
- [Playwright docs: Emulation (devices)](https://playwright.dev/docs/emulation)

### Part 2 — Mobile Emulation & Responsive Testing (formerly M35)
- [Playwright docs: Emulation](https://playwright.dev/docs/emulation)
- [Playwright docs: Device descriptors](https://playwright.dev/docs/api/class-playwright#playwright-devices)
- [Playwright docs: page.emulateMedia()](https://playwright.dev/docs/api/class-page#page-emulate-media)

### Part 3 — Geolocation, Permissions & Device APIs (formerly M36)
- [Playwright docs: Geolocation](https://playwright.dev/docs/geolocation)
- [Playwright docs: Permissions](https://playwright.dev/docs/api/class-browsercontext#browser-context-grant-permissions)
- [Playwright docs: Emulation (timezone, locale)](https://playwright.dev/docs/emulation#locale--timezone)

### Part 4 — Offline, PWA & Service Workers (formerly M37)
- [Playwright docs: Service Workers](https://playwright.dev/docs/service-workers-experimental)
- [web.dev: Service worker lifecycle](https://web.dev/articles/service-worker-lifecycle)
