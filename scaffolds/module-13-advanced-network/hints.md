# M13 Hints

## TODO 1 — `addInitScript`

```typescript
await page.addInitScript(() => {
  (window as any).__lumioFlags = { aiSuggestions: true };
});
```

`addInitScript` runs BEFORE the page's own scripts. The flag is available
when React initializes — simulating a server-configured feature flag.

## TODO 2 — `page.evaluate()`

```typescript
const flags = await page.evaluate(() => (window as any).__lumioFlags);
```

`page.evaluate` runs a function in the browser context and returns the result
to Node.js. The return value must be JSON-serializable.

## TODO 3 — `page.on('request', ...)`

```typescript
page.on('request', (request) => {
  if (request.url().includes('/api/')) {
    apiRequests.push(request.url());
  }
});
```

Register the listener BEFORE the action that triggers the requests.

## TODO 4 — Assert API request was made

```typescript
expect(apiRequests.some((url) => url.includes('/api/auth'))).toBe(true);
```

## TODO 5 — `context.setOffline(true)`

```typescript
await context.setOffline(true);
```

This is a network-level simulation — all TCP connections fail. Unlike `route.abort()`,
it affects ALL network activity (not just requests matching a pattern).

## TODO 6 — Restore online

```typescript
await context.setOffline(false);
```
