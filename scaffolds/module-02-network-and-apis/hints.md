# Lesson 02 Hints

## Part 1 — Network Interception & Mocking (formerly M12)

### TODO 1.1 — `route.fulfill` with mocked project list

```typescript
await page.route('/api/projects*', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([{ id: 'mock-1', name: 'Mocked Project', _count: { tasks: 5 } }]),
  });
});
```

The `*` glob matches any query string: `/api/projects`, `/api/projects?workspaceId=abc`, etc.

### TODO 1.2 — `route.fulfill` with 500 error

```typescript
await route.fulfill({
  status: 500,
  contentType: 'application/json',
  body: JSON.stringify({ error: 'Internal server error' }),
});
```

### TODO 1.3 — Assert error alert

```typescript
await expect(page.getByRole('alert')).toBeVisible();
```

### TODO 1.4 — `route.abort()`

```typescript
await route.abort();
```

`abort()` simulates a network-level failure — the browser sees this as
`net::ERR_FAILED`. The app should handle it gracefully.

### TODO 1.5 — `route.continue` with modified headers

```typescript
await page.route('/api/**', async (route) => {
  const headers = {
    ...route.request().headers(),
    'X-Test-Request': 'true',
  };
  await route.continue({ headers });
});
```

`route.continue()` passes the request through to the server with optional modifications.
You can modify headers, postData, or url.

## Part 2 — Advanced Network Patterns (formerly M13)

### TODO 2.1 — `addInitScript`

```typescript
await page.addInitScript(() => {
  (window as any).__lumioFlags = { aiSuggestions: true };
});
```

`addInitScript` runs BEFORE the page's own scripts. The flag is available
when React initializes — simulating a server-configured feature flag.

### TODO 2.2 — `page.evaluate()`

```typescript
const flags = await page.evaluate(() => (window as any).__lumioFlags);
```

`page.evaluate` runs a function in the browser context and returns the result
to Node.js. The return value must be JSON-serializable.

### TODO 2.3 — `page.on('request', ...)`

```typescript
page.on('request', (request) => {
  if (request.url().includes('/api/')) {
    apiRequests.push(request.url());
  }
});
```

Register the listener BEFORE the action that triggers the requests.

### TODO 2.4 — Assert API request was made

```typescript
expect(apiRequests.some((url) => url.includes('/api/auth'))).toBe(true);
```

### TODO 2.5 — `context.setOffline(true)`

```typescript
await context.setOffline(true);
```

This is a network-level simulation — all TCP connections fail. Unlike `route.abort()`,
it affects ALL network activity (not just requests matching a pattern).

### TODO 2.6 — Restore online

```typescript
await context.setOffline(false);
```

## Part 3 — API Testing with request Fixture (formerly M14)

### TODO 3.1 — Unauthenticated GET

```typescript
const response = await request.get('/api/projects?workspaceId=test-workspace');
expect(response.status()).toBe(401);
```

### TODO 3.2 — POST body with title

```typescript
const response = await request.post('/api/tasks', {
  data: {
    title: 'API-created task',
    projectId: 'seed-project-001',
  },
  headers: { Cookie: authCookie },
});
```

### TODO 3.3 — Assert 201

```typescript
expect(response.status()).toBe(201);
```

### TODO 3.4 — Assert response body title

```typescript
const body = await response.json();
expect(body.title).toBe('API-created task');
```

### TODO 3.5 — DELETE with dynamic ID

```typescript
const deleteRes = await request.delete(`/api/tasks/${id}`, {
  headers: { Cookie: authCookie },
});
```

The backtick template literal interpolates the `id` from the create response.

## Part 4 — HAR Recording & Network Analysis (formerly M15)

### TODO 4.2 — Navigate to '/'

```typescript
await page.goto('/');
```

With `update: true` set on `routeFromHAR`, all network requests are captured
to `HAR_PATH` during this navigation. The HAR file is written when the context closes.

### TODO 4.3 — Replay mode url pattern

```typescript
await context.routeFromHAR(HAR_PATH, {
  update: false,
  url: /localhost:3000/,
});
```

In replay mode (`update: false`), requests matching the `url` pattern are served
from the HAR file. Requests that don't match pass through to the server.

If you run the replay test without first running the record test, the HAR file
won't exist and the test will fail. Run the record test first:

```bash
npx playwright test tests/module-02-network-and-apis/exercise.spec.ts -g "record"
```

Then run the replay test:
```bash
npx playwright test tests/module-02-network-and-apis/exercise.spec.ts -g "replay"
```
