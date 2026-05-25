# M71 Hints

## TODO 1 — Extension popup URL

```typescript
await page.goto(`chrome-extension://${extensionId}/popup.html`);
```

Chrome extension pages are served at `chrome-extension://{id}/{page}.html`. The `extensionId` variable is extracted from the service worker URL in `beforeAll`. `about:blank` is the failing default — it loads a blank page with no extension UI, so the `getByRole('heading')` assertion fails.

## TODO 2 — Submit button name

```typescript
await page.getByRole('button', { name: 'Add Task' }).click();
```

`getByRole('button', { name: 'Add Task' })` matches the submit button by its accessible name. `'PLACEHOLDER'` finds no button (no button is labeled "PLACEHOLDER"), so Playwright times out waiting for it. This is the same locator pattern you'd use for any form submission button.

## TODO 3 — Dashboard navigation

```typescript
await appPage.goto('/dashboard');
```

After the popup submits a task to Lumio's API, the task is stored in the database. Navigating to `/dashboard` in a new page within the same `browserContext` shares the same authentication session, so the freshly created task appears without re-logging in. `'/PLACEHOLDER'` navigates to a 404 page, and the task text won't be found there.

## TODO 4 — toBeAttached() for injected elements

```typescript
await expect(page.locator('[data-testid="lumio-task-highlight"]')).toBeAttached();
```

The content script injects elements into the page's DOM — they exist but may not be in the viewport. `toBeAttached()` verifies DOM presence without requiring visibility. `toBeHidden()` fails because the element is attached and rendered (even if scrolled off-screen), and Playwright considers off-screen elements as not hidden.

## TODO 5 — chrome.storage.local.get via evaluate

```typescript
const stored = await page.evaluate(() => chrome.storage.local.get('recentTasks'));
```

`chrome.storage.local` is only available in extension page contexts. When `page.evaluate()` runs on `popup.html` (a `chrome-extension://` URL), the JavaScript environment has the full `chrome.*` API surface. `Promise.resolve(null)` is the failing default — `null` is not `.not.toBeNull()`, so the assertion fails immediately.

## TODO 6 — Minimum service worker count

```typescript
expect(workers.length).toBeGreaterThanOrEqual(1);
```

A single loaded extension registers exactly one background service worker. The default `999` always fails. If this assertion fails, the extension's background script has crashed or the extension didn't load — useful as a health check before running the rest of the extension tests.

## TODO 7 — Extension ID regex

```typescript
expect(extensionId).toMatch(/^[a-z]{32}$/);
```

Chrome extension IDs are exactly 32 lowercase Latin letters (a–z). The `^` and `$` anchors ensure the entire string matches — not just a substring. `/PLACEHOLDER/` won't match a real extension ID, so the test fails. This assertion also guards against the ID extraction logic breaking (e.g., if the service worker URL format changes).
