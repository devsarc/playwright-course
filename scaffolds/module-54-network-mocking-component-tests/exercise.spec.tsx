import { test, expect } from '@playwright/experimental-ct-react';

// M54: Network Mocking in Component Tests
//
// This module teaches CT network interception — testing components in loading,
// populated, and error states without a real API server.
//
// Run with:
//   npx playwright test --config playwright-ct.config.ts tests/module-54-network-mocking-component-tests

test.describe('M54 — Network Mocking in Component Tests', () => {

  // Test 1: Understand the CT Router API
  // CT uses a Router class (different from e2e's page.route()).
  test('CT Router intercepts component fetch calls', async ({}) => {
    // In a real CT test with network mocking:
    //
    //   import { Router } from '@playwright/experimental-ct-react';
    //
    //   const router = new Router();
    //   router.get('/api/tasks', async (route) => {
    //     await route.fulfill({ json: [{ id: 1, title: 'Test task' }] });
    //   });
    //
    //   const component = await mount(<TaskList />, { router });
    //   await expect(component.getByTestId('task-card')).toBeVisible();

    // TODO 1: What class handles network mocking in Playwright CT?
    const routerClassName = /* TODO 1: 'Router' */ '';
    expect(routerClassName).toBe('Router');
  });

  // Test 2: Loading state — the request never resolves
  test('loading state keeps the spinner visible', async ({}) => {
    // Pattern for testing the loading state:
    //
    //   router.get('/api/tasks', async (route) => {
    //     await new Promise(() => {}); // Never resolves
    //   });
    //   const component = await mount(<TaskList />, { router });
    //   await expect(component.getByTestId('loading-spinner')).toBeVisible();
    //
    // The component's useEffect calls fetch(); the fetch never resolves;
    // the component stays in its loading state.

    // TODO 2: To test the loading state, the mocked route handler should...
    // Set to 'never-fulfill' to indicate the route should not respond.
    const loadingTestPattern = /* TODO 2: 'never-fulfill' */ '';
    expect(loadingTestPattern).toBe('never-fulfill');
  });

  // Test 3: Populated state — return mock data
  test('populated state renders task cards from mocked API', async ({}) => {
    // Pattern for populated state:
    //
    //   const mockTasks = [
    //     { id: 1, title: 'Fix login bug', priority: 'high' },
    //     { id: 2, title: 'Write API docs', priority: 'medium' },
    //   ];
    //   router.get('/api/tasks', async (route) => {
    //     await route.fulfill({ json: mockTasks });
    //   });
    //   const component = await mount(<TaskList />, { router });
    //   await expect(component.getByTestId('task-card')).toHaveCount(2);

    // TODO 3: What method on route returns a successful JSON response?
    const fulfillMethod = /* TODO 3: 'fulfill' */ '';
    expect(fulfillMethod).toBe('fulfill');
  });

  // Test 4: Error state — return a 500 status
  test('error state shows error message on 500 response', async ({}) => {
    // Pattern for error state:
    //
    //   router.get('/api/tasks', async (route) => {
    //     await route.fulfill({ status: 500, body: 'Internal Server Error' });
    //   });
    //   const component = await mount(<TaskList />, { router });
    //   await expect(component.getByRole('alert')).toContainText('Failed to load tasks');

    // TODO 4: What HTTP status code represents an internal server error?
    const errorStatusCode = /* TODO 4: 500 */ 0;
    expect(errorStatusCode).toBe(500);
  });

  // Test 5: MSW (Mock Service Worker) integration
  // MSW intercepts at the Service Worker level — more realistic than route.fulfill().
  test('MSW provides Service Worker level interception', async ({}) => {
    // MSW integration in CT:
    //   1. Install MSW: npm install msw --save-dev
    //   2. Create handlers: handlers.ts defining request mocks
    //   3. Setup server: mswServer.ts using setupWorker (browser) or setupServer (Node)
    //   4. Integrate with CT via beforeMount hook
    //
    //   beforeMount(async ({ hooksConfig }) => {
    //     mswServer.use(...hooksConfig?.handlers ?? []);
    //   });
    //
    //   In the test:
    //     const component = await mount(<TaskList />, {
    //       hooksConfig: {
    //         handlers: [
    //           http.get('/api/tasks', () => HttpResponse.json(mockTasks)),
    //         ],
    //       },
    //     });

    // TODO 5: MSW intercepts requests at which layer?
    const mswLayer = /* TODO 5: 'Service Worker' */ '';
    expect(mswLayer).toBe('Service Worker');
  });

  // Test 6: bypass() — let specific requests through to the real server
  test('bypass allows passthrough to real endpoints', async ({}) => {
    // MSW bypass pattern:
    //   import { bypass } from 'msw';
    //
    //   http.get('/api/tasks', async ({ request }) => {
    //     // Let this specific request hit the real server
    //     const response = await bypass(request);
    //     return response;
    //   });
    //
    // Use case: mock most endpoints but let one call the real API for integration testing.

    // TODO 6: What MSW function passes a request through to the real server?
    const bypassFunctionName = /* TODO 6: 'bypass' */ '';
    expect(bypassFunctionName).toBe('bypass');
  });

  // Test 7: CT mocking vs e2e page.route()
  test('understands the difference between CT and e2e network mocking', async ({}) => {
    // CT Router / MSW:
    //   - Runs inside the browser (service worker or component harness)
    //   - Scoped to the mounted component's fetch calls
    //   - Best for: loading/error/populated state testing
    //
    // e2e page.route():
    //   - Runs in Node.js (intercepts before requests reach the browser)
    //   - Scoped to all requests for a page
    //   - Best for: controlling API behavior during a full workflow

    // TODO 7: CT network mocking is best used for testing component _____.
    const ctBestFor = /* TODO 7: 'states' */ '';
    expect(ctBestFor).toBe('states');

    // TODO 8: e2e page.route() is best used for controlling _____ during workflows.
    const e2eBestFor = /* TODO 8: 'API behavior' */ '';
    expect(e2eBestFor).toBe('API behavior');
  });

  // Test 8: Three required states for any data-fetching component
  test('three states must be tested for every data-fetching component', async ({}) => {
    const requiredStates = [
      /* TODO 9: 'loading' */  '',  // Request in-flight
      /* TODO 10: 'populated' */ '', // Request succeeded with data
      'error',                        // Request failed
    ];

    // TODO 9: Set index 0 to 'loading'.
    // TODO 10: Set index 1 to 'populated'.
    expect(requiredStates[0]).toBe('loading');
    expect(requiredStates[1]).toBe('populated');
    expect(requiredStates[2]).toBe('error');
  });

});
