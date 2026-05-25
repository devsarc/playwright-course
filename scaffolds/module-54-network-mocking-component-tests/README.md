# M54: Network Mocking in Component Tests

## Learning Objectives

- Mock API responses inside a CT test using the `Router` class from `@playwright/experimental-ct-react`
- Test a component in three distinct states: loading, populated, and error
- Understand the difference between CT network mocking and e2e `page.route()` mocking
- Use MSW (Mock Service Worker) integration with CT for more realistic network simulation

## Concept

A component that fetches data has three states that matter: loading (the request is in-flight), populated (the request succeeded), and error (the request failed). End-to-end tests reach these states by controlling the server — slow the server to test loading, return a 500 to test error. Component tests control network responses directly, without a server, using either the CT router or MSW.

**CT network routing.** Playwright CT exposes a `Router` class for intercepting requests inside the component test environment. Unlike e2e's `page.route()`, which intercepts all requests to a URL pattern, CT routing is scoped to the component harness:

```typescript
import { Router } from '@playwright/experimental-ct-react';

test('shows loaded tasks', async ({ mount }) => {
  const router = new Router();
  router.get('/api/tasks', async (route) => {
    await route.fulfill({
      json: [{ id: 1, title: 'Test task' }],
    });
  });

  const component = await mount(<TaskList />, { router });
  await expect(component.getByTestId('task-card')).toBeVisible();
});
```

The component makes its normal `fetch('/api/tasks')` call; CT intercepts it and returns the mocked response. No server involved.

**Testing the loading state.** To test loading state, don't fulfill the route — return a response that never resolves, or add a delay:

```typescript
router.get('/api/tasks', async (route) => {
  await new Promise(() => {}); // Never resolves — keeps component in loading state
});
const component = await mount(<TaskList />, { router });
await expect(component.getByTestId('loading-spinner')).toBeVisible();
```

**Testing the error state.** Return a non-200 status code:

```typescript
router.get('/api/tasks', async (route) => {
  await route.fulfill({ status: 500, body: 'Internal Server Error' });
});
const component = await mount(<TaskList />, { router });
await expect(component.getByRole('alert')).toContainText('Failed to load tasks');
```

**MSW integration.** Mock Service Worker (MSW) is a browser-native request interception library that works at the Service Worker level. It integrates with Playwright CT to provide a more realistic mock — the network request actually leaves the JavaScript runtime, is intercepted by a service worker, and returns a mocked response. This catches issues that a simple `route.fulfill()` bypass might miss, because the full fetch API lifecycle runs.

MSW's `bypass()` function lets specific requests pass through to a real server while others are mocked — useful when the component fetches from multiple endpoints and you only want to mock some of them.

**Why CT mocking differs from e2e `page.route()`.** In e2e, `page.route()` runs in the Node.js test process and intercepts requests at the network level before they reach the browser. In CT, the component and its `fetch()` calls run in the browser — the Router runs in a service worker or browser process, not in Node.js. This means CT routing is closer to how MSW works than how e2e routing works.

The practical implication: CT network mocking is more appropriate for simulating component-level states (loading, error, empty, populated). E2e network mocking is more appropriate for controlling the entire application's API behavior during a workflow. Use each where it belongs.

**`bypass()` for passthrough.** MSW's `bypass()` creates a request handler that allows the request through to the real endpoint. This is useful when: you want most requests mocked but one to hit the real server, you're testing error recovery (mock the first request to fail, let the retry hit the real server), or you're running in an environment where some endpoints have real data.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Complete each TODO in `exercise.spec.tsx` in order.
These exercises teach CT network mocking patterns conceptually:
```bash
npx playwright test --config playwright-ct.config.ts tests/module-54-network-mocking-component-tests
```

## Key Takeaways

1. CT network mocking intercepts `fetch()` calls inside the component harness without a real server.
2. Testing three states (loading, populated, error) is the baseline for any data-fetching component.
3. MSW integration provides more realistic request interception at the Service Worker level.
4. `bypass()` passes specific requests through to real endpoints — useful for mixed mock/real testing.
5. CT mocking is for component states; e2e `page.route()` is for application-level API control.

## Going Deeper

- [Playwright docs: CT network routing](https://playwright.dev/docs/test-components#handling-network-requests)
- [MSW docs](https://mswjs.io/docs/)
- [MSW + Playwright CT guide](https://mswjs.io/docs/integrations/playwright)
