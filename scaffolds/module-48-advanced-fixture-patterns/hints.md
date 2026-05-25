# M48 Hints

## TODO 1 — Create a new browser context

```typescript
const context = await browser.newContext({});
```

Common options you'd add in a real authenticated fixture:
```typescript
const context = await browser.newContext({
  storageState: 'auth.json',  // restores cookies/localStorage from a saved state
  baseURL: 'http://localhost:3000',
});
```

## TODO 2 — Call use(context)

```typescript
await use(context);
```

The test receives `context` as the fixture value. Code after this line runs as teardown — guaranteed to execute even if the test throws.

## TODO 3 — Close the context in teardown

```typescript
await context.close();
```

Teardown in a fixture replaces `afterEach`. The advantage: if the fixture's setup throws, Playwright knows not to run teardown for that fixture (since setup never completed). `afterEach` doesn't have this guarantee.

## TODO 4 — Create a page from isolatedContext

```typescript
const page = await isolatedContext.newPage();
```

No options needed — the context already has all the settings (baseURL, storageState, etc.). The page inherits them automatically.

## TODO 5 — Call use(data)

```typescript
await use(data);
```

In a real data fixture, the pattern would be:
```typescript
const response = await request.post('/api/tasks', { data: { title: 'Test task' } });
const task = await response.json();
await use(task);
await request.delete(`/api/tasks/${task.id}`);  // teardown: clean up
```

## TODO 6 — Assert fresh context has no pages

```typescript
expect(isolatedContext.pages()).toHaveLength(0);
```

`context.pages()` returns an array of all open pages in the context. A fresh context has none.

## TODO 7 — Navigate isolatedPage to dashboard

```typescript
await isolatedPage.goto('/dashboard');
```

The page uses whatever `baseURL` is configured in `playwright.config.ts`. The fixture doesn't need to know the URL — it comes from config.

## TODO 8 — Assert taskData.title is a string

```typescript
expect(typeof taskData.title).toBe('string');
```

## TODO 9 — Assert taskData.column equals 'todo'

```typescript
expect(taskData.column).toBe('todo');
```

## TODO 10 — Assert both scope arrays have items

```typescript
expect(workerScopedUseCases.length).toBeGreaterThan(0);
expect(testScopedUseCases.length).toBeGreaterThan(0);
```

---

## Building an authenticated page fixture

This is the real-world authenticated fixture pattern:

```typescript
const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Login via the UI
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('secret');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL('/dashboard');

    // Save auth state for reuse (worker-scoped optimization)
    await context.storageState({ path: 'auth.json' });

    await use(page);
    await context.close();
  },
});
```

For worker-scoped auth (faster):
```typescript
const test = base.extend<{}, { authState: string }>({
  authState: [async ({ browser }, use) => {
    // Runs once per worker — login once, share across tests
    const context = await browser.newContext();
    const page = await context.newPage();
    // ... login ...
    await context.storageState({ path: 'auth.json' });
    await context.close();
    await use('auth.json');
  }, { scope: 'worker' }],

  authenticatedPage: async ({ browser, authState }, use) => {
    const context = await browser.newContext({ storageState: authState });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});
```
