# M12: Network Interception & Mocking

## Learning Objectives

- Intercept requests with `page.route()` and respond with `route.fulfill()`
- Simulate network errors with `route.abort()`
- Pass requests through with `route.continue()` and optional modifications
- Know when to use `page.route` vs `context.route`

## Concept

Network interception is one of Playwright's most powerful features. It lets you control what the browser sends and receives, enabling tests that would otherwise require a running backend, a seeded database, or specific server-side error states.

The core API is `page.route(pattern, handler)`. The pattern can be a URL string, a glob, or a regex. The handler receives a `Route` object and must call one of three methods:

**`route.fulfill(options)`** — respond with a custom response. No network request is made to the server.

```typescript
await route.fulfill({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify({ data: 'mocked' }),
});
```

**`route.abort()`** — simulate a network failure. The browser sees `net::ERR_FAILED`. Use this to test error handling when the network is unreachable.

**`route.continue(options)`** — pass the request to the server, optionally modifying headers, body, or URL. Use this to inject auth headers, add test flags, or modify requests without fully mocking them.

### When to use network mocking

- **Simulate error states** — 500 errors, network failures, timeouts — impossible to test reliably against a real server
- **Isolate UI tests** — test the UI's response to an API result without hitting the database
- **Speed up tests** — mock slow third-party API calls (Stripe, SendGrid) to avoid network latency
- **Deterministic data** — mock an API that returns random or time-dependent data to get stable test results

### When NOT to use network mocking

- When you're testing the full stack (UI + API + database) — mocking defeats the purpose
- When the API contract is what you want to verify — use `request` fixture tests instead

### Route priority and cleanup

Routes are matched in registration order — the first handler whose pattern matches wins, and subsequent handlers are skipped. You can remove a specific route mid-test with `page.unroute(pattern)`, or clear all routes with `page.unrouteAll()`:

```typescript
await page.route('/api/tasks', mockHandler);
// Test runs with the mock in place
await page.unroute('/api/tasks');
// Subsequent requests to /api/tasks now reach the real server
```

This is useful when one part of a test needs mocked data and another part needs real responses — you can toggle the mock on and off rather than splitting the test.

### Inspecting requests without blocking them

`route.continue()` passes the request to the server unchanged, but you can still read what the browser sent before letting it through:

```typescript
await page.route('/api/**', async (route) => {
  const req = route.request();
  console.log(req.method(), await req.postData());
  await route.continue();
});
```

Use this pattern when you want to assert that the correct data is being sent — without mocking the response. It's also useful for debugging intermittent test failures caused by unexpected request bodies or headers.

### `context.route` vs `page.route`

`page.route` intercepts requests from one page. `context.route` intercepts requests from all pages sharing the same browser context (including popups and new tabs opened by the test). Use `context.route` when the action under test opens a new page, or when you need a global mock that applies across multiple navigations in a single test.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Complete each TODO in `exercise.spec.ts`.
```bash
npx playwright test tests/module-12-network-mocking --headed
```

## Key Takeaways

1. `route.fulfill()` responds without hitting the server — use for mocking data and errors.
2. `route.abort()` simulates network failure — use to test offline/error handling UI.
3. `route.continue({ headers })` modifies the request and passes it through.
4. `context.route` covers all pages in a context; `page.route` covers one page.
5. Routes are matched in registration order — first match wins.

## Going Deeper

- [Playwright docs: Network](https://playwright.dev/docs/network)
- [Playwright docs: Mock APIs](https://playwright.dev/docs/mock)
