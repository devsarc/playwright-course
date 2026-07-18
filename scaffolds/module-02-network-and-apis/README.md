# Lesson 02: Network & APIs

*Combines former modules M12–M15.*

## Learning Objectives

### Part 1 — Network Interception & Mocking (formerly M12)

- Intercept requests with `page.route()` and respond with `route.fulfill()`
- Simulate network errors with `route.abort()`
- Pass requests through with `route.continue()` and optional modifications
- Know when to use `page.route` vs `context.route`

### Part 2 — Advanced Network Patterns (formerly M13)

- Inject JavaScript before page load with `page.addInitScript()`
- Monitor outgoing requests with `page.on('request', handler)`
- Simulate complete network failure with `context.setOffline(true)`
- Distinguish between `setOffline` and `route.abort` for offline testing

### Part 3 — API Testing with request Fixture (formerly M14)

- Use the `request` fixture to make HTTP calls without a browser
- Make GET, POST, and DELETE requests with auth headers
- Assert response status codes and JSON body content
- Use `beforeAll` with `request` for efficient test state setup

### Part 4 — HAR Recording & Network Analysis (formerly M15)

- Record network traffic to a HAR file with `context.routeFromHAR({ update: true })`
- Replay a HAR file to serve requests without a live server
- Understand what use cases HAR replay is appropriate for
- Know what data HAR files contain and why they shouldn't be committed

## Concept

### Part 1 — Network Interception & Mocking (formerly M12)

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

### Part 2 — Advanced Network Patterns (formerly M13)

Part 1 of this lesson (formerly M12) covered the core interception API. M13 covers three patterns that go beyond request/response mocking.

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

### Part 3 — API Testing with request Fixture (formerly M14)

Every test suite eventually needs to create, read, update, and delete data. You can do this through the UI — navigate to the form, fill it out, submit — or you can do it through the API. The API is almost always faster and more reliable.

Playwright's `request` fixture gives you an `APIRequestContext` that sends HTTP requests without opening a browser. It shares the `baseURL` from your config and supports all HTTP methods:

```typescript
const response = await request.get('/api/tasks');
const response = await request.post('/api/tasks', { data: { title: 'New task' } });
const response = await request.delete(`/api/tasks/${id}`);
```

### Why `request` in `beforeAll`

A common pattern is to use `request` in `beforeAll` to create test fixtures, then use `page` in each test to assert UI behavior:

```typescript
test.beforeAll(async ({ request }) => {
  const res = await request.post('/api/projects', {
    data: { name: 'Test project' },
    headers: { Cookie: authCookie },
  });
  projectId = (await res.json()).id;
});

test('project appears in the list', async ({ page }) => {
  await page.goto(`/dashboard`);
  await expect(page.getByText('Test project')).toBeVisible();
});
```

Creating data via API in `beforeAll` is 10–100× faster than creating it through the UI in `beforeEach`.

### Asserting API responses

`response.status()` returns the HTTP status code. `await response.json()` parses the response body. Don't forget the `await` on `response.json()` — it's async.

```typescript
expect(response.status()).toBe(201);
const body = await response.json();
expect(body.title).toBe('My task');
```

### Auth with the `request` fixture

At M14, we extract a session cookie from NextAuth's callback endpoint. At Lesson 03 (formerly M16), you'll learn a cleaner approach using `storageState`. Both work — the Lesson 03 (formerly M16) approach is better because it doesn't require parsing cookie headers manually.

### Part 4 — HAR Recording & Network Analysis (formerly M15)

A HAR (HTTP Archive) file is a JSON snapshot of every network request and response during a browser session — URLs, headers, bodies, timing, cookies, everything.

Playwright can both record HAR files and replay them. Replaying a HAR means serving recorded responses without making real network requests. This is called "mocking from HAR."

### Recording

```typescript
await context.routeFromHAR('./path/to/recording.har', {
  update: true,  // record mode
  url: /your-domain.com/,
});
await page.goto('/');
// Navigate, interact — all requests are captured
// HAR is written when the context closes (end of test)
```

### Replaying

```typescript
await context.routeFromHAR('./path/to/recording.har', {
  update: false,  // replay mode
  url: /your-domain.com/,
});
await page.goto('/');
// Requests matching 'url' are served from the HAR
// Other requests go to the real server
```

### When to use HAR replay

HAR replay is useful when:
- You want to snapshot a third-party API response that changes over time (or that you're billed per call)
- You're doing performance analysis and want consistent network conditions
- You want to test specific server response sequences that are hard to reproduce

For most test suites, `route.fulfill()` (Part 1 of this lesson, formerly M12) is simpler and more maintainable than HAR replay. HAR replay is best for capturing complex, many-endpoint page loads.

### HAR files and sensitive data

HAR files capture cookies, auth tokens, and request bodies. They can expose:
- Session cookies
- API keys in headers
- Personally identifiable information in form submissions

Always add `.har` files to `.gitignore`. Never commit them to source control.

## Lumio Context

See [lumio-context.md](./lumio-context.md).

## Step-by-Step Tasks

### Part 1 — Network Interception & Mocking

Complete each TODO in `exercise.spec.ts`.
```bash
npx playwright test tests/module-02-network-and-apis --headed
```

Validate this part only:
```bash
npx playwright test tests/module-02-network-and-apis -g "Part 1 — Network Interception & Mocking (formerly M12)"
```

### Part 2 — Advanced Network Patterns

Complete each TODO in `exercise.spec.ts`.
```bash
npx playwright test tests/module-02-network-and-apis --headed
```

Validate this part only:
```bash
npx playwright test tests/module-02-network-and-apis -g "Part 2 — Advanced Network Patterns (formerly M13)"
```

### Part 3 — API Testing with request Fixture

Complete each TODO. Make sure the test database is seeded first:
```bash
npm run db:seed --prefix lumio
```

Then run:
```bash
npx playwright test tests/module-02-network-and-apis
```

Validate this part only:
```bash
npx playwright test tests/module-02-network-and-apis -g "Part 3 — API Testing with request Fixture (formerly M14)"
```

### Part 4 — HAR Recording & Network Analysis

Run the record test first, then the replay test:
```bash
# Step 1: record
npx playwright test tests/module-02-network-and-apis -g "record"

# Step 2: replay
npx playwright test tests/module-02-network-and-apis -g "replay"
```

Validate this part only:
```bash
npx playwright test tests/module-02-network-and-apis -g "Part 4 — HAR Recording & Network Analysis (formerly M15)"
```

## Validate (full lesson)

```bash
npx playwright test tests/module-02-network-and-apis
```

## Key Takeaways

### Part 1 — Network Interception & Mocking

1. `route.fulfill()` responds without hitting the server — use for mocking data and errors.
2. `route.abort()` simulates network failure — use to test offline/error handling UI.
3. `route.continue({ headers })` modifies the request and passes it through.
4. `context.route` covers all pages in a context; `page.route` covers one page.
5. Routes are matched in registration order — first match wins.

### Part 2 — Advanced Network Patterns

1. `addInitScript` runs before the page's own scripts — inject flags and mocks before React.
2. `page.on('request')` observes outgoing requests without intercepting them.
3. `context.setOffline(true)` fails ALL network — use for PWA/service worker testing.
4. `setOffline` is OS-level; `route.abort` is pattern-matched. Different tools for different needs.
5. Register event listeners before the actions that trigger the events.

### Part 3 — API Testing with request Fixture

1. The `request` fixture sends HTTP without a browser — use it for fast state setup.
2. `beforeAll` with `request` is the right place to create shared test fixtures.
3. Always `await response.json()` — it's an async method, not a property.
4. Lesson 03 (formerly M16)'s `storageState` pattern replaces manual cookie extraction for auth.
5. API tests and UI tests are complementary — use both, not one or the other.

### Part 4 — HAR Recording & Network Analysis

1. `routeFromHAR({ update: true })` records; `{ update: false }` replays.
2. HAR replay serves recorded responses without hitting the server.
3. Add `*.har` to `.gitignore` — HAR files contain session cookies and other sensitive data.
4. `route.fulfill()` is simpler for most cases; HAR is best for complex multi-resource captures.
5. The `url` pattern in `routeFromHAR` scopes which requests are recorded/replayed.

## Going Deeper

### Part 1 — Network Interception & Mocking

- [Playwright docs: Network](https://playwright.dev/docs/network)
- [Playwright docs: Mock APIs](https://playwright.dev/docs/mock)

### Part 2 — Advanced Network Patterns

- [Playwright docs: Evaluate scripts](https://playwright.dev/docs/evaluating)
- [Playwright docs: Network events](https://playwright.dev/docs/network#network-events)

### Part 3 — API Testing with request Fixture

- [Playwright docs: API testing](https://playwright.dev/docs/api-testing)

### Part 4 — HAR Recording & Network Analysis

- [Playwright docs: Mock APIs with HAR](https://playwright.dev/docs/mock#record-and-replay-requests)
