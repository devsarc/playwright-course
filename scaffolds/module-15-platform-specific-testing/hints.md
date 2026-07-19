# Lesson 15 Hints

## Part 1 — Browser Extension Testing (formerly M71)

## TODO 1.1 — Extension popup URL

```typescript
await page.goto(`chrome-extension://${extensionId}/popup.html`);
```

Chrome extension pages are served at `chrome-extension://{id}/{page}.html`. The `extensionId` variable is extracted from the service worker URL in `beforeAll`. `about:blank` is the failing default — it loads a blank page with no extension UI, so the `getByRole('heading')` assertion fails.

## TODO 1.2 — Submit button name

```typescript
await page.getByRole('button', { name: 'Add Task' }).click();
```

`getByRole('button', { name: 'Add Task' })` matches the submit button by its accessible name. `'PLACEHOLDER'` finds no button (no button is labeled "PLACEHOLDER"), so Playwright times out waiting for it. This is the same locator pattern you'd use for any form submission button.

## TODO 1.3 — Dashboard navigation

```typescript
await appPage.goto('/dashboard');
```

After the popup submits a task to Lumio's API, the task is stored in the database. Navigating to `/dashboard` in a new page within the same `browserContext` shares the same authentication session, so the freshly created task appears without re-logging in. `'/PLACEHOLDER'` navigates to a 404 page, and the task text won't be found there.

## TODO 1.4 — toBeAttached() for injected elements

```typescript
await expect(page.locator('[data-testid="lumio-task-highlight"]')).toBeAttached();
```

The content script injects elements into the page's DOM — they exist but may not be in the viewport. `toBeAttached()` verifies DOM presence without requiring visibility. `toBeHidden()` fails because the element is attached and rendered (even if scrolled off-screen), and Playwright considers off-screen elements as not hidden.

## TODO 1.5 — chrome.storage.local.get via evaluate

```typescript
const stored = await page.evaluate(() => chrome.storage.local.get('recentTasks'));
```

`chrome.storage.local` is only available in extension page contexts. When `page.evaluate()` runs on `popup.html` (a `chrome-extension://` URL), the JavaScript environment has the full `chrome.*` API surface. `Promise.resolve(null)` is the failing default — `null` is not `.not.toBeNull()`, so the assertion fails immediately.

## TODO 1.6 — Minimum service worker count

```typescript
expect(workers.length).toBeGreaterThanOrEqual(1);
```

A single loaded extension registers exactly one background service worker. The default `999` always fails. If this assertion fails, the extension's background script has crashed or the extension didn't load — useful as a health check before running the rest of the extension tests.

## TODO 1.7 — Extension ID regex

```typescript
expect(extensionId).toMatch(/^[a-z]{32}$/);
```

Chrome extension IDs are exactly 32 lowercase Latin letters (a–z). The `^` and `$` anchors ensure the entire string matches — not just a substring. `/PLACEHOLDER/` won't match a real extension ID, so the test fails. This assertion also guards against the ID extraction logic breaking (e.g., if the service worker URL format changes).

## Part 2 — Electron App Testing (formerly M72)

## TODO 2.1 — electron.launch()

```typescript
const app = await electron.launch({ args: [ELECTRON_APP] });
```

## TODO 2.2 — firstWindow()

```typescript
const window = await electronApp.firstWindow();
```

## TODO 2.3 — login heading

```typescript
await expect(window.getByRole('heading', { name: 'Sign in' })).toBeVisible();
```

## TODO 2.4 — window title

```typescript
await expect(window).toHaveTitle(/Lumio/);
```

## TODO 2.5 — main process evaluate

```typescript
const platform = await electronApp.evaluate(async ({ app }) => {
  return process.platform;
});
expect(['darwin', 'win32', 'linux']).toContain(platform);
```

## TODO 2.6 — screenshot

```typescript
const screenshot = await window.screenshot({ path: 'electron-window.png' });
expect(screenshot).toBeTruthy();
```

## Electron vs Browser API differences

| Feature | Browser test | Electron test |
|---------|-------------|---------------|
| Launch | `browser.newContext()` | `electron.launch()` |
| Top-level object | `Browser` | `ElectronApplication` |
| Pages | `context.newPage()` | `app.firstWindow()` / `app.windows()` |
| Main process | N/A | `app.evaluate({ app, ipcMain })` |
| Renderer process | `page.evaluate()` | `window.evaluate()` |
