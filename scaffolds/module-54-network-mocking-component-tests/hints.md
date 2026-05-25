# M54 Hints

## TODO 1 — CT Router class name

```typescript
const routerClassName = 'Router';
```

Import from the CT package:
```typescript
import { Router } from '@playwright/experimental-ct-react';
```

## TODO 2 — Loading state pattern

```typescript
const loadingTestPattern = 'never-fulfill';
```

Implementation:
```typescript
router.get('/api/tasks', async (route) => {
  await new Promise(() => {}); // Hangs forever — component stays in loading state
});
```

Add a test timeout to prevent the test from hanging indefinitely:
```typescript
test('loading state', async ({ mount }) => {
  test.setTimeout(5_000); // Fast timeout — we only need to check initial render
  // ...mount and assert loading spinner...
});
```

## TODO 3 — Fulfilled JSON response method

```typescript
const fulfillMethod = 'fulfill';
```

```typescript
await route.fulfill({
  status: 200,
  json: [{ id: 1, title: 'Test task' }],
});
```

The `json` shorthand sets `Content-Type: application/json` and serializes the object automatically.

## TODO 4 — Error HTTP status code

```typescript
const errorStatusCode = 500;
```

For other error states:
- `404` — resource not found (useful for "no tasks exist")
- `401` — unauthorized (session expired)
- `503` — service unavailable

## TODO 5 — MSW interception layer

```typescript
const mswLayer = 'Service Worker';
```

MSW uses the browser's Service Worker API to intercept `fetch()` and `XMLHttpRequest` calls. This means the request actually leaves the JavaScript context, gets handled by the service worker, and returns a mocked response — matching the full fetch lifecycle more accurately than simple stub functions.

## TODO 6 — MSW bypass function name

```typescript
const bypassFunctionName = 'bypass';
```

```typescript
import { bypass } from 'msw';

http.get('/api/tasks', async ({ request }) => {
  const realResponse = await bypass(request);
  return realResponse;
});
```

`bypass()` is also useful for logging: intercept the request, log it, let it through.

## TODO 7 — CT mocking is best for states

```typescript
const ctBestFor = 'states';
```

## TODO 8 — e2e mocking is best for API behavior

```typescript
const e2eBestFor = 'API behavior';
```

## TODO 9 — loading state

```typescript
'loading',
```

## TODO 10 — populated state

```typescript
'populated',
```

---

## Complete three-state test example

```typescript
import { Router } from '@playwright/experimental-ct-react';
import { mount } from '@playwright/experimental-ct-react';
import TaskList from '../../lumio/components/TaskList';

const mockTasks = [
  { id: 1, title: 'Fix login bug', priority: 'high' },
  { id: 2, title: 'Write API docs', priority: 'medium' },
];

test('loading state', async ({ mount }) => {
  const router = new Router();
  router.get('/api/tasks', () => new Promise(() => {}));

  const component = await mount(<TaskList />, { router });
  await expect(component.getByTestId('loading-spinner')).toBeVisible();
});

test('populated state', async ({ mount }) => {
  const router = new Router();
  router.get('/api/tasks', async (route) => {
    await route.fulfill({ json: mockTasks });
  });

  const component = await mount(<TaskList />, { router });
  await expect(component.getByTestId('task-card')).toHaveCount(2);
  await expect(component).toContainText('Fix login bug');
});

test('error state', async ({ mount }) => {
  const router = new Router();
  router.get('/api/tasks', async (route) => {
    await route.fulfill({ status: 500 });
  });

  const component = await mount(<TaskList />, { router });
  await expect(component.getByRole('alert')).toContainText('Failed to load');
});
```
