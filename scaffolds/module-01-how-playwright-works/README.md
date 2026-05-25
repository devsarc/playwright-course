# M01: How Playwright Works Internally

> **Awareness module** — no exercise. Read this before M02.

## Learning Objectives

- Explain the Browser/BrowserContext/Page hierarchy and why it matters for test isolation
- Describe what "auto-waiting" means and why tests don't need `sleep()` calls
- Explain the difference between `playwright-core` and `@playwright/test`
- Understand at a high level how Playwright communicates with browsers (CDP / BiDi)

## Concept

### The hierarchy

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

### Auto-waiting

Playwright waits for elements to be:
- Attached to the DOM
- Visible (not hidden, not zero-size)
- Stable (not animating)
- Enabled (not disabled)
- Editable (for fill/type actions)

Before performing any action. This is why you almost never need `await page.waitForSelector()` or `sleep()`. Auto-waiting has a timeout (default 30 seconds, configurable per action) after which it throws a `TimeoutError`.

### How communication works (conceptual)

Playwright talks to browsers via two protocols:
- **CDP** (Chrome DevTools Protocol) — used for Chromium
- **WebKit debug protocol** — used for WebKit/Safari
- **Firefox Remote Debugging Protocol / BiDi** — used for Firefox

These are low-level socket-based protocols. Playwright's Node.js process is the "client"; the browser process is the "server". Every `click()`, `fill()`, `goto()` you call is translated into protocol messages that the browser executes and confirms.

You will never interact with these protocols directly in most testing. They matter when you reach for `page.evaluate()`, CDP sessions (M62), or when debugging why auto-wait didn't work.

## Key Takeaways

1. Each test runs in an isolated BrowserContext — tests can run in parallel without sharing state.
2. Auto-waiting means no `sleep()` and no `waitForSelector()` in 95% of cases.
3. `@playwright/test` = `playwright-core` + test runner + assertions + fixtures + CLI.
4. The Browser/Context/Page hierarchy maps to: process / profile / tab.
5. CDP is how Playwright talks to Chrome under the hood — relevant in M62 (CDP deep dive).

## Going Deeper

- [Playwright docs: Browser contexts](https://playwright.dev/docs/browser-contexts)
- [Playwright docs: Auto-waiting](https://playwright.dev/docs/actionability)
