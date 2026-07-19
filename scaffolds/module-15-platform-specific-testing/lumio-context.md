# Lumio Context: Lesson 15

## Part 1 — Browser Extension Testing (formerly M71)

## What's in Lumio at this point

From M71 onward, the repo includes a Chrome MV3 extension at `lumio/extension/`. The extension is a companion tool that lets Lumio users add tasks without switching tabs.

## Extension structure

```
lumio/extension/
├── manifest.json          MV3 manifest (name, version, permissions, host_permissions)
├── popup.html             Quick-add task form (title, project select, priority)
├── popup.ts               Popup logic — submits to Lumio REST API on form submit
├── content.ts             Content script — highlights task reference patterns (TASK-123)
├── background.ts          Service worker — caches recent tasks in chrome.storage.local
└── icons/                 Extension icons (16, 48, 128px)
```

## Permissions

```json
{
  "permissions": ["storage", "activeTab"],
  "host_permissions": ["https://lumio.io/*", "http://localhost:3000/*"]
}
```

`storage` allows `chrome.storage.local` access. `host_permissions` includes `localhost:3000` so the content script runs in test environments against the local dev server.

## Extension popup (popup.html)

The popup renders a single-screen form:
- `<h1>` with accessible name "Quick Add Task"
- `<label>Task title</label>` wrapping a text input
- A project dropdown (select from workspaces the user has access to)
- A priority radio group (Low / Medium / High)
- A submit button with accessible name "Add Task"

On successful submission, the popup shows a `<p>Task added!</p>` confirmation for 2 seconds, then resets the form.

## Content script (content.ts)

Runs on all pages matching `http://localhost:3000/*` and `https://lumio.io/*`. Scans the page text for patterns matching `TASK-\d+` and wraps each match in a `<span data-testid="lumio-task-highlight">` with a tooltip linking to the task detail page.

## Background service worker (background.ts)

Listens for messages from the popup. When a task is created, it:
1. Appends the task to `chrome.storage.local` under the key `recentTasks` (max 10 items)
2. Updates the extension badge with the count of tasks created today

## Why extension testing with Playwright

Manual extension testing is tedious: install → open popup → submit → switch tabs → verify. Playwright's `launchPersistentContext` automates the full flow in CI, catching regressions in the popup form, the API call, and the cross-context data flow in a single test run.

## Part 2 — Electron App Testing (formerly M72)

## Lumio Electron client

Location: `lumio-electron/` — a separate Electron wrapper around the Lumio web app.

The Electron app embeds a Chromium renderer that loads the bundled Next.js export.
It does NOT connect to the running Next.js dev server — it loads a static export.

## Build before testing

```bash
cd lumio-electron
npm run build    # produces out/lumio-electron
```

Set `ELECTRON_APP_PATH` env var if the binary is elsewhere.

## Key windows

| Window | Shows when |
|--------|------------|
| Login window | App starts, no session saved |
| Board window | Logged in, project selected |

## Preload script

`lumio-electron/preload.js` exposes safe IPC APIs to the renderer.
In tests, you can assert IPC calls via `electronApp.evaluate({ ipcMain })`.

## Part 3 — Android Device Automation (formerly M73)

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
