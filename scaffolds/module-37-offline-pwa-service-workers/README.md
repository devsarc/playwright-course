# M37: Offline, PWA & Service Workers

## Learning Objectives

- Wait for service worker registration with `context.waitForEvent('serviceworker')`
- List active service workers with `context.serviceWorkers()`
- Simulate offline mode with `context.setOffline(true/false)`
- Verify cached content is served when offline
- Test background sync behaviour: queue an action offline, go online, assert the action fires
- Verify PWA installability criteria: manifest present, service worker registered, HTTPS (or localhost)

## Concept

Service workers are BrowserContext-scoped, not Page-scoped. All pages within
the same context share the same service worker registration.

> **Note — M13 vs M37:** M13 uses `context.setOffline()` to simulate network failure in the context of API testing. M37 applies the same API specifically to PWA offline behaviour: the intent is to verify the service worker cache and offline fallback page, not to test error handling in API calls.

**Offline simulation:**
```typescript
await context.setOffline(true);   // disconnect network
await page.reload();               // SW serves cached response
await context.setOffline(false);  // reconnect
```

`setOffline(true)` is more realistic than mocking individual requests because
it also sets `navigator.onLine = false`, which many apps check directly.

## Key Takeaways

1. Use `Promise.all([context.waitForEvent('serviceworker'), page.goto('/')])` to capture the SW.
2. `context.setOffline(true)` disables ALL network requests for the context.
3. The SW must cache content before going offline — load the page online first.
4. `navigator.onLine` is set to false by `setOffline(true)` — apps that check it will show offline UI.
5. PWA installability requires `manifest.json` + registered service worker + HTTPS (or localhost). Playwright can verify the first two programmatically; HTTPS is an infrastructure concern.

## Going Deeper

- [Playwright docs: Service Workers](https://playwright.dev/docs/service-workers-experimental)
- [web.dev: Service worker lifecycle](https://web.dev/articles/service-worker-lifecycle)
