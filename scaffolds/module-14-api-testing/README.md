# M14: API Testing with request Fixture

## Learning Objectives

- Use the `request` fixture to make HTTP calls without a browser
- Make GET, POST, and DELETE requests with auth headers
- Assert response status codes and JSON body content
- Use `beforeAll` with `request` for efficient test state setup

## Concept

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

At M14, we extract a session cookie from NextAuth's callback endpoint. At M16, you'll learn a cleaner approach using `storageState`. Both work — the M16 approach is better because it doesn't require parsing cookie headers manually.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Complete each TODO. Make sure the test database is seeded first:
```bash
npm run db:seed --prefix lumio
```

Then run:
```bash
npx playwright test tests/module-14-api-testing
```

## Key Takeaways

1. The `request` fixture sends HTTP without a browser — use it for fast state setup.
2. `beforeAll` with `request` is the right place to create shared test fixtures.
3. Always `await response.json()` — it's an async method, not a property.
4. M16's `storageState` pattern replaces manual cookie extraction for auth.
5. API tests and UI tests are complementary — use both, not one or the other.

## Going Deeper

- [Playwright docs: API testing](https://playwright.dev/docs/api-testing)
