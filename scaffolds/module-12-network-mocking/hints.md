# M12 Hints

## TODO 1 — `route.fulfill` with mocked project list

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

## TODO 2 — `route.fulfill` with 500 error

```typescript
await route.fulfill({
  status: 500,
  contentType: 'application/json',
  body: JSON.stringify({ error: 'Internal server error' }),
});
```

## TODO 3 — Assert error alert

```typescript
await expect(page.getByRole('alert')).toBeVisible();
```

## TODO 4 — `route.abort()`

```typescript
await route.abort();
```

`abort()` simulates a network-level failure — the browser sees this as
`net::ERR_FAILED`. The app should handle it gracefully.

## TODO 5 — `route.continue` with modified headers

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
