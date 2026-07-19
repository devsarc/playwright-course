# Lesson 15: Platform-Specific Testing: Extensions, Electron & Android

*Combines former modules M71–M73.*

## Learning Objectives

### Part 1 — Browser Extension Testing (formerly M71)

- Launch a browser with a Chrome extension loaded using `launchPersistentContext`
- Retrieve the browser-assigned extension ID from the service worker URL
- Test an extension popup page using the `chrome-extension://` URL scheme
- Verify cross-context behavior: task created in the popup appears in the main Lumio app
- Access `chrome.*` extension APIs via `page.evaluate()` from an extension page context

### Part 2 — Electron App Testing (formerly M72)

- Launch an Electron app with `electron.launch()`
- Get windows via `electronApp.firstWindow()` and interact like a normal Page
- Run code in the main process with `electronApp.evaluate()`
- Take screenshots of Electron windows
- Test native menus: open a menu via `app.evaluate()` and assert the correct item is present
- Test native dialogs: intercept `dialog` events triggered by Electron's `dialog.showOpenDialog`
- Test app lifecycle: minimize, restore, and close the window; assert `app.windows()` length

### Part 3 — Android Device Automation (formerly M73)

> **Awareness module.** This module contains no exercise. Read the concept and lumio-context.md to build your mental model before moving to Phase 18.

- Understand what Playwright's Android automation supports and where it stops
- Compare Playwright Android with Appium: what each does well and when to reach for each
- Understand the ADB architecture and how Playwright communicates with Android devices
- Know when "mobile web" testing (Lesson 07 (formerly M35) emulation) is sufficient vs when a real device is needed

## Concept

### Part 1 — Browser Extension Testing (formerly M71)

Chrome extensions cannot be loaded into a standard `BrowserContext` — they require a _persistent context_, the equivalent of a real user profile. Playwright's `chromium.launchPersistentContext()` creates this profile and allows passing Chrome flags to load your extension.

**Why a persistent context?**

A standard `browser.newContext()` is a fresh, isolated profile with no extensions, cookies, or local storage. Chrome's extension system requires a persistent profile to install and run extensions — the same reason installing an extension in Incognito requires explicit permission. `launchPersistentContext` creates a real profile (a temp directory when given `''` as the path) that persists extensions across pages within the session.

**Loading the extension.**

Two Chrome flags are required:

```typescript
const context = await chromium.launchPersistentContext('', {
  headless: false,
  args: [
    `--disable-extensions-except=${extensionPath}`,
    `--load-extension=${extensionPath}`,
  ],
});
```

`--disable-extensions-except` prevents any other extensions from loading — keeping the test environment clean. `--load-extension` tells Chrome to install your extension from the given directory. Pass `''` as the profile path for a temporary profile that Playwright cleans up after the session.

Note: extensions require `headless: false` in most Chrome versions. Headless mode in older Chrome didn't support extensions; newer Chrome headless (the `--headless=new` mode used by recent Playwright versions) does support them, but `headless: false` is the safest default until this stabilizes.

**Getting the extension ID.**

Chrome assigns an extension ID at install time based on the extension's public key. In automated tests, retrieve it from the service worker's URL:

```typescript
let [serviceWorker] = context.serviceWorkers();
if (!serviceWorker) serviceWorker = await context.waitForEvent('serviceworker');
const extensionId = serviceWorker.url().split('/')[2];
// URL format: chrome-extension://{extensionId}/background.js
```

The service worker URL is `chrome-extension://{extensionId}/...`. Splitting by `'/'` and taking index `2` extracts the ID.

**Testing the extension popup.**

The popup HTML page is served at `chrome-extension://{extensionId}/popup.html`. Navigate to it like any other URL:

```typescript
const page = await context.newPage();
await page.goto(`chrome-extension://${extensionId}/popup.html`);
await expect(page.getByRole('heading', { name: 'Quick Add Task' })).toBeVisible();
```

All standard Playwright locator and assertion APIs work on extension pages.

**Cross-context assertions.**

A key pattern in extension testing is verifying that an action in the extension affects the host app. Create the action in one page, then verify it in another page within the same context:

```typescript
// Step 1: Submit a task via the extension popup
const popup = await context.newPage();
await popup.goto(`chrome-extension://${extensionId}/popup.html`);
await popup.getByLabel('Task title').fill('New task');
await popup.getByRole('button', { name: 'Add Task' }).click();
await popup.close();

// Step 2: Verify the task appears in the main app
const app = await context.newPage();
await app.goto('/dashboard');
await expect(app.getByText('New task')).toBeVisible();
```

Both pages share the same browser profile and Lumio session, so the task created in step 1 is immediately visible in step 2.

**Accessing chrome.* APIs.**

`chrome.*` APIs are available in extension page contexts (popup, background, options). Use `page.evaluate()` to call them:

```typescript
const page = await context.newPage();
await page.goto(`chrome-extension://${extensionId}/popup.html`);
const data = await page.evaluate(() => chrome.storage.local.get('recentTasks'));
```

`chrome.storage.local.get()` is only available on extension pages — not on regular web pages — because the extension's content security policy grants it.

### Part 2 — Electron App Testing (formerly M72)

Playwright's Electron support wraps the same Chromium DevTools Protocol used
for browser tests. From Playwright's perspective, an Electron window IS a Page.

```typescript
const app = await electron.launch({ args: ['./app'] });
const window = await app.firstWindow();
await expect(window.getByRole('heading')).toBeVisible(); // same as web tests
```

> **Import note:** Electron support is part of the base `playwright` package, not `@playwright/test`. Import it as:
> ```typescript
> import { _electron as electron } from 'playwright';
> ```
> No separate package install is needed if you already have `playwright` in your dependencies.

The unique addition is `app.evaluate()` which runs in the **main process** with
access to Node.js APIs, `ipcMain`, Electron's `app` object, etc.

### Part 3 — Android Device Automation (formerly M73)

Playwright's Android support (`playwright.android`) lets you automate **Chrome for Android** and **WebView** inside Android apps — the web layer only. It does not automate native Android UI elements (buttons, text fields rendered by the Android framework). This scope distinction is the single most important thing to understand about Playwright on Android.

**What ADB is and why it matters.**

Android Debug Bridge (ADB) is a command-line tool that provides a communication channel between a development machine and an Android device (physical or emulator). ADB handles file transfer, shell commands, port forwarding, and app lifecycle management.

Playwright Android works by:
1. Connecting to the device via ADB
2. Forwarding a port to Chrome's DevTools Protocol (CDP) endpoint on the device
3. Communicating with Chrome via CDP — the same protocol used for all Playwright browser automation

This means Playwright's Android automation is architecturally identical to its desktop automation: same CDP protocol, same Page API, same locators. The difference is the physical layer: instead of a local Chrome process, you're talking to Chrome running on Android hardware.

**What Playwright Android supports.**

```typescript
import { android } from 'playwright';

const [device] = await android.devices();
await device.shell('am start -n com.android.chrome/org.chromium.chrome.browser.ChromeTabbedActivity');

const context = await device.launchBrowser();
const page = await context.newPage();
await page.goto('https://lumio.io');
// All standard Playwright APIs work from here
```

Use cases where Playwright Android is appropriate:
- Testing your web app's responsive layout on a real Android device (not emulation)
- Verifying that a PWA installed on Android works correctly
- Testing a WebView embedded inside an Android app (the web layer only)
- Running performance measurements on real mobile hardware
- Automating Chrome on Android for scraping or monitoring tasks

**What Playwright Android does NOT support.**

- Native Android UI: `EditText`, `Button`, `RecyclerView`, native dialogs — these are not accessible via CDP
- Android-specific gestures: swipe navigation, back gesture, notification drawer — the `page.mouse` API operates within the WebView, not the Android system
- Multiple apps: you automate the browser or one WebView at a time
- iOS: Playwright has no iOS automation support

**Playwright Android vs Appium.**

| Capability | Playwright Android | Appium |
|---|---|---|
| Protocol | CDP (web only) | UIAutomator2 / XCUITest |
| Native Android UI | No | Yes |
| iOS automation | No | Yes |
| Web automation quality | Excellent | Good (via Chromedriver) |
| Setup complexity | Low (just ADB + device) | High (Appium server, drivers, capabilities) |
| Test speed | Fast | Slower (proxy overhead) |
| Selector model | Playwright selectors | XPath / Accessibility ID / UIAutomator |

**Decision framework.**

Choose Playwright Android when:
- You're testing a mobile web app or PWA on real hardware
- You need CDP-level access (coverage, performance, network throttling) on mobile
- You want to reuse existing Playwright tests with minimal changes
- The app's "mobile" layer is a WebView wrapping your web app

Choose Appium when:
- You need to test native Android UI (onboarding flows, permission dialogs, in-app purchases)
- You need to test iOS alongside Android in the same test suite
- Your automation spans multiple native apps (e.g., handling a system-level authentication dialog)
- Your team already has an Appium infrastructure

**The Lesson 07 (formerly M35) mobile emulation vs real device distinction.**

Lesson 07 (formerly M35) covered `devices['iPhone 14']` — viewport emulation, user agent spoofing, and touch event simulation in a desktop Chrome process. That's fast, cheap, and sufficient for responsive layout testing and most mobile UX scenarios.

Real Android automation is appropriate when you need:
- Actual mobile browser rendering (not Chromium desktop pretending to be mobile)
- Real touch gesture physics
- PWA installation and offline behavior on actual Android Chrome
- Performance benchmarks on mobile hardware (emulation doesn't replicate CPU/GPU/memory constraints)

For Lumio's test suite, Lesson 07 (formerly M35) covers the primary mobile testing scenarios. Android device automation would be used for PWA installation verification and real-hardware performance benchmarks — scheduled monitoring jobs rather than per-PR tests.

## Lumio Context

See [lumio-context.md](./lumio-context.md).

## Step-by-Step Tasks

### Part 1 — Browser Extension Testing

```bash
npx playwright test tests/module-15-platform-specific-testing
```

Validate this part only:
```bash
npx playwright test tests/module-15-platform-specific-testing -g "M71 — Browser Extension Testing"
```

### Part 2 — Electron App Testing

Validate this part only:
```bash
npx playwright test tests/module-15-platform-specific-testing -g "Part 2 — Electron App Testing (formerly M72)"
```

## Validate (full lesson)

```bash
npx playwright test tests/module-15-platform-specific-testing
```

## Key Takeaways

### Part 1 — Browser Extension Testing

1. Extensions require `chromium.launchPersistentContext()` — standard contexts cannot load extensions.
2. Two Chrome flags are required: `--load-extension` and `--disable-extensions-except`.
3. The extension ID is embedded in the service worker URL — extract it with `.split('/')[2]`.
4. Extension popup pages are testable at `chrome-extension://{id}/popup.html` using all standard Playwright APIs.
5. Cross-context extension testing: submit from the popup, assert in the app — both pages share the same session.

### Part 2 — Electron App Testing

1. `electron.launch()` returns `ElectronApplication` — not `Browser`.
2. `app.firstWindow()` returns `Page` — all locator/assertion APIs apply.
3. `app.evaluate()` runs in the main process — access Node.js and Electron APIs.
4. Build the Electron app before running tests — there is no dev server.

### Part 3 — Android Device Automation

1. Playwright Android automates Chrome and WebViews via ADB + CDP — not native Android UI.
2. ADB provides the physical transport; CDP provides the automation protocol — the same CDP used for desktop.
3. Choose Playwright Android for mobile web/PWA; choose Appium when you need native UI or iOS.
4. Mobile emulation (Lesson 07, formerly M35) is sufficient for layout and UX testing; real device automation adds hardware fidelity.
5. Playwright Android setup is: connect device → ADB → `android.devices()` → `device.launchBrowser()` → standard Page API.

## Going Deeper

### Part 1 — Browser Extension Testing

- [Playwright docs: Chrome extensions](https://playwright.dev/docs/chrome-extensions)
- [Chrome docs: chrome.storage API](https://developer.chrome.com/docs/extensions/reference/api/storage)
- [Chrome docs: Service workers in extensions](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers)
- [Playwright docs: launchPersistentContext](https://playwright.dev/docs/api/class-browsertype#browser-type-launch-persistent-context)

### Part 2 — Electron App Testing

- [Playwright docs: Electron](https://playwright.dev/docs/api/class-electron)

### Part 3 — Android Device Automation

- [Playwright docs: Android](https://playwright.dev/docs/api/class-android)
- [Android Debug Bridge (ADB) overview](https://developer.android.com/tools/adb)
- [Appium: when to use](https://appium.io/docs/en/latest/intro/appium-vs-alternatives/)
- [Chrome on Android: DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
