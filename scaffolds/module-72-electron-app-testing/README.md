# M72: Electron App Testing

## Learning Objectives

- Launch an Electron app with `electron.launch()`
- Get windows via `electronApp.firstWindow()` and interact like a normal Page
- Run code in the main process with `electronApp.evaluate()`
- Take screenshots of Electron windows
- Test native menus: open a menu via `app.evaluate()` and assert the correct item is present
- Test native dialogs: intercept `dialog` events triggered by Electron's `dialog.showOpenDialog`
- Test app lifecycle: minimize, restore, and close the window; assert `app.windows()` length

## Concept

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

## Key Takeaways

1. `electron.launch()` returns `ElectronApplication` — not `Browser`.
2. `app.firstWindow()` returns `Page` — all locator/assertion APIs apply.
3. `app.evaluate()` runs in the main process — access Node.js and Electron APIs.
4. Build the Electron app before running tests — there is no dev server.

## Going Deeper

- [Playwright docs: Electron](https://playwright.dev/docs/api/class-electron)
