# M13: Advanced Network Patterns

## Learning Objectives

- Inject JavaScript before page load with `page.addInitScript()`
- Monitor outgoing requests with `page.on('request', handler)`
- Simulate complete network failure with `context.setOffline(true)`
- Distinguish between `setOffline` and `route.abort` for offline testing

## Concept

M12 covered the core interception API. M13 covers three patterns that go beyond request/response mocking.

### `page.addInitScript(fn)`

`addInitScript` injects a function that runs in the browser context *before any page script loads*. This is more powerful than `page.evaluate` — evaluate runs after the page is loaded, but `addInitScript` runs before React (or any framework) initializes.

Use cases:
- Inject feature flags as globals (`window.__flags = { feature: true }`)
- Override browser APIs (`window.navigator.geolocation = mockGeo`)
- Set up test doubles before the app code runs

```typescript
await page.addInitScript(() => {
  (window as any).__flags = { newFeature: true };
});
await page.goto('/dashboard'); // React sees __flags before first render
```

### `page.on('request', handler)`

Playwright emits `'request'` events for every outgoing request. Registering a listener lets you observe what the app sends — useful for verifying that certain API calls are made.

Register the listener *before* the action that triggers the request:

```typescript
const urls: string[] = [];
page.on('request', (req) => urls.push(req.url()));
await page.getByRole('button', { name: 'Save' }).click();
expect(urls.some((u) => u.includes('/api/tasks'))).toBe(true);
```

This is an observation pattern, not interception — the requests still go to the server.

### `context.setOffline(true/false)`

`setOffline` simulates a true network failure at the OS level. Every TCP connection fails with `net::ERR_INTERNET_DISCONNECTED`. This is different from `route.abort()`:

- `route.abort()` aborts specific matching requests — other requests proceed normally
- `setOffline(true)` fails ALL network activity — including DNS, WebSocket connections, and service worker fetches

For testing PWA offline behavior, `setOffline` is the correct tool.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Complete each TODO in `exercise.spec.ts`.
```bash
npx playwright test tests/module-13-advanced-network --headed
```

## Key Takeaways

1. `addInitScript` runs before the page's own scripts — inject flags and mocks before React.
2. `page.on('request')` observes outgoing requests without intercepting them.
3. `context.setOffline(true)` fails ALL network — use for PWA/service worker testing.
4. `setOffline` is OS-level; `route.abort` is pattern-matched. Different tools for different needs.
5. Register event listeners before the actions that trigger the events.

## Going Deeper

- [Playwright docs: Evaluate scripts](https://playwright.dev/docs/evaluating)
- [Playwright docs: Network events](https://playwright.dev/docs/network#network-events)
