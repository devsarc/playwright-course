# M35: Mobile Emulation & Responsive Testing

## Learning Objectives

- Apply Playwright's device presets to test Lumio on iPhone and iPad screen sizes
- Use `page.emulateMedia()` to test dark mode and print stylesheet behavior
- Assert that responsive breakpoints work correctly (e.g., hamburger menu appears below 768px)
- Test orientation changes between portrait and landscape
- Decide which mobile tests belong in the main suite vs. a dedicated mobile project

## Concept

Mobile emulation in Playwright is not running tests on a real iPhone. It is running a Chromium browser that pretends to be a mobile device — it sets the viewport size, device pixel ratio, user agent string, and touch event support to match a real device. For the vast majority of responsive design testing, this is exactly what you need.

**Device presets.** Playwright ships with a `devices` dictionary containing presets for dozens of real devices. `devices['iPhone 14']` sets viewport to 390×844, device pixel ratio to 3, user agent to Safari on iOS, and enables touch events. `devices['iPad Pro']` sets a tablet-sized viewport with the appropriate UA string. You spread these into a project's `use` block or into `test.use()` for a single test file. The mechanics look the same as a regular test — you still call `page.goto()`, `locator.click()`, `expect()` — but the page renders as if it were on the target device.

**What emulation does and does not cover.** Emulation faithfully tests CSS media queries, responsive layouts, and touch event handling. It does not test native mobile browser rendering engines — WebKit-on-iPhone behavior is only testable with the WebKit Playwright project, not with Chromium in iPhone emulation mode. For layout and responsive behavior testing, Chromium emulation is accurate enough. For Safari-specific rendering bugs, use the WebKit project (M34).

**`page.emulateMedia()`** is the tool for testing media queries that are not about screen size. Dark mode support in CSS is controlled by the `prefers-color-scheme` media feature. `page.emulateMedia({ colorScheme: 'dark' })` tells the page that the user prefers dark mode, regardless of the OS setting. Similarly, `{ media: 'print' }` activates `@media print` stylesheets — useful for testing that print layouts hide navigation and format content for paper. These can be called at any point during a test, not just at startup.

**Hamburger menus and breakpoints.** Lumio's navigation collapses to a hamburger menu below 768px. At full desktop width, the nav links are visible. At mobile width, they are hidden behind a menu button. Testing this requires asserting that the nav links are hidden at mobile viewport, that the hamburger button is visible, clicking it, and asserting the nav links appear. This is a pattern you will encounter in almost every responsive app. The key locators are semantic: `getByRole('navigation')`, `getByRole('button', { name: /menu/i })`.

**Orientation changes.** `page.setViewportSize()` can be called mid-test to simulate rotating a device. Switching from portrait (390×844) to landscape (844×390) may affect layout and reveal orientation-specific bugs. After calling `setViewportSize`, Playwright re-renders the page without reloading it — media queries based on `(orientation: landscape)` update immediately.

**Organizing mobile tests.** The cleanest approach is a dedicated mobile project in `playwright.config.ts` — `{ name: 'mobile-chrome', use: { ...devices['iPhone 14'] } }`. This runs your entire test suite (or a tagged subset) on mobile. For a smaller codebase, `test.use({ ...devices['iPhone 14'] })` at the top of a specific test file applies the device for that file only without creating a project. Both are valid; projects scale better for large suites.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Complete each TODO in `exercise.spec.ts` in order.
Run after each TODO:
```bash
npx playwright test tests/module-35-mobile-emulation --headed
```

## Key Takeaways

1. Playwright's `devices` dictionary sets viewport, DPI, user agent, and touch support — spread it into `test.use()` or a project config.
2. Mobile emulation in Chromium tests CSS/layout behavior; WebKit emulation is needed for Safari-engine-specific bugs.
3. `page.emulateMedia({ colorScheme: 'dark' })` activates dark mode mid-test — call it before the assertion, not at page load.
4. Hamburger menu testing: assert nav is hidden → assert menu button is visible → click → assert nav appears.
5. `page.setViewportSize()` changes the viewport mid-test without reloading — use it to test orientation changes.

## Going Deeper

- [Playwright docs: Emulation](https://playwright.dev/docs/emulation)
- [Playwright docs: Device descriptors](https://playwright.dev/docs/api/class-playwright#playwright-devices)
- [Playwright docs: page.emulateMedia()](https://playwright.dev/docs/api/class-page#page-emulate-media)
