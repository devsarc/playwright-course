# M71: Browser Extension Testing

## Learning Objectives

- Launch a browser with a Chrome extension loaded using `launchPersistentContext`
- Retrieve the browser-assigned extension ID from the service worker URL
- Test an extension popup page using the `chrome-extension://` URL scheme
- Verify cross-context behavior: task created in the popup appears in the main Lumio app
- Access `chrome.*` extension APIs via `page.evaluate()` from an extension page context

## Concept

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

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-71-browser-extension-testing
```

## Key Takeaways

1. Extensions require `chromium.launchPersistentContext()` — standard contexts cannot load extensions.
2. Two Chrome flags are required: `--load-extension` and `--disable-extensions-except`.
3. The extension ID is embedded in the service worker URL — extract it with `.split('/')[2]`.
4. Extension popup pages are testable at `chrome-extension://{id}/popup.html` using all standard Playwright APIs.
5. Cross-context extension testing: submit from the popup, assert in the app — both pages share the same session.

## Going Deeper

- [Playwright docs: Chrome extensions](https://playwright.dev/docs/chrome-extensions)
- [Chrome docs: chrome.storage API](https://developer.chrome.com/docs/extensions/reference/api/storage)
- [Chrome docs: Service workers in extensions](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers)
- [Playwright docs: launchPersistentContext](https://playwright.dev/docs/api/class-browsertype#browser-type-launch-persistent-context)
