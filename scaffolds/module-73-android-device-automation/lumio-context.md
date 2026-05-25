# Lumio Context: M73

## Lumio's mobile presence

Lumio is a PWA (Progressive Web App) built with Next.js. Its mobile story has two layers:

1. **Mobile web** — the responsive Next.js app running in any mobile browser, tested via M35 (emulation) and the Android automation pattern described in this module
2. **PWA installability** — Lumio can be added to the Android home screen, where it runs in standalone mode (no browser chrome) inside an Android WebView

## Where Android automation would apply to Lumio

| Scenario | Tool |
|---|---|
| Responsive layout on real Android Chrome | Playwright Android → `device.launchBrowser()` |
| PWA installed on Android, running in standalone mode | Playwright Android → `device.launchBrowser()` or WebView automation |
| Task creation flow on mobile | M35 emulation (sufficient for most cases) |
| Push notification handling on Android | Appium (native notification drawer) |
| In-app purchase or system dialog | Appium |

## Why the PWA distinction matters

When Lumio is installed as a PWA on Android, it runs inside an Android WebView rather than Chrome. The WebView's behavior is slightly different from Chrome — JavaScript APIs (like `navigator.serviceWorker`) behave identically, but rendering quirks and some CSS features differ. Testing Lumio in the installed PWA state requires Android device automation, not desktop emulation.

## What you would not test with Playwright Android in Lumio

Lumio has no native Android app — only the PWA. There are no native UI elements to automate, no `RecyclerView` lists, no native dialogs outside of the browser. The entire Lumio UI on Android is the web layer. This makes Playwright Android a good fit — and Appium unnecessary — for the current Lumio tech stack.

## Setup prereqs for Android automation (not exercised here)

To run `playwright.android` against a real device or emulator:
1. Install Android SDK and ADB
2. Enable USB debugging on the device (or create an AVD emulator)
3. Connect the device: `adb devices` should show it
4. Unlock the screen and accept the ADB authorization prompt on the device

For CI, use an Android emulator image (e.g., `emulator-5554`) with a pre-authorized ADB connection baked into the base image.
