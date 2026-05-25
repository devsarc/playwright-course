# M73: Android Device Automation (Awareness)

> **Awareness module.** This module contains no exercise. Read the concept and lumio-context.md to build your mental model before moving to Phase 18.

## Learning Objectives

- Understand what Playwright's Android automation supports and where it stops
- Compare Playwright Android with Appium: what each does well and when to reach for each
- Understand the ADB architecture and how Playwright communicates with Android devices
- Know when "mobile web" testing (M35 emulation) is sufficient vs when a real device is needed

## Concept

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

**The M35 mobile emulation vs real device distinction.**

M35 covered `devices['iPhone 14']` — viewport emulation, user agent spoofing, and touch event simulation in a desktop Chrome process. That's fast, cheap, and sufficient for responsive layout testing and most mobile UX scenarios.

Real Android automation is appropriate when you need:
- Actual mobile browser rendering (not Chromium desktop pretending to be mobile)
- Real touch gesture physics
- PWA installation and offline behavior on actual Android Chrome
- Performance benchmarks on mobile hardware (emulation doesn't replicate CPU/GPU/memory constraints)

For Lumio's test suite, M35 covers the primary mobile testing scenarios. Android device automation would be used for PWA installation verification and real-hardware performance benchmarks — scheduled monitoring jobs rather than per-PR tests.

## Lumio Context

See `lumio-context.md`.

## Key Takeaways

1. Playwright Android automates Chrome and WebViews via ADB + CDP — not native Android UI.
2. ADB provides the physical transport; CDP provides the automation protocol — the same CDP used for desktop.
3. Choose Playwright Android for mobile web/PWA; choose Appium when you need native UI or iOS.
4. Mobile emulation (M35) is sufficient for layout and UX testing; real device automation adds hardware fidelity.
5. Playwright Android setup is: connect device → ADB → `android.devices()` → `device.launchBrowser()` → standard Page API.

## Going Deeper

- [Playwright docs: Android](https://playwright.dev/docs/api/class-android)
- [Android Debug Bridge (ADB) overview](https://developer.android.com/tools/adb)
- [Appium: when to use](https://appium.io/docs/en/latest/intro/appium-vs-alternatives/)
- [Chrome on Android: DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
