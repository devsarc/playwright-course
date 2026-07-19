// Lesson 11: Component Testing: React & Vue
// Combines former modules: M51 (Component Testing Foundations), M52 (React
// Component Testing), M54 (Network Mocking in Component Tests).
//
// Part 3 (M53, Vue Component Testing) lives in the sibling file
// exercise.vue.spec.tsx instead of here — Vue CT uses
// @playwright/experimental-ct-vue and a mount fixture that is not
// interchangeable with the @playwright/experimental-ct-react fixture used
// by every Part in this file.
//
// Each Part below is the original module's test.describe block, unchanged
// except TODO numbers are prefixed with the Part number to stay unique in
// this file (a TODO originally numbered N in the M52 module becomes TODO
// 2.N here, matching Part 2's prefix). Part numbers 1, 2, and 4 are used
// (not 1, 2, 3) so the numbering matches this lesson's four Parts overall —
// Part 3 is reserved for M53 in the sibling Vue file.

import { test, expect } from '@playwright/experimental-ct-react';
import KanbanCard from '../../lumio/components/kanban/KanbanCard';

test.describe('Part 1 — Component Testing Foundations (formerly M51)', () => {
  // ⚠️  This module requires two extra setup steps before tests will run:
  //   1. Install CT packages: npm install --save-dev @playwright/experimental-ct-react @vitejs/plugin-react
  //   2. lumio/components/kanban/KanbanCard does not exist — create it (a basic card component)
  //      or update the import to point to lumio/components/board/task-card.tsx.
  // Run CT tests with: npx playwright test --config playwright-ct.config.ts

  // @ts-nocheck — CT imports differ from normal playwright/test

  // M51: Component Testing Foundations
  //
  // Playwright CT mounts a React component in a real Chromium browser tab —
  // no jsdom, no mocking the DOM. This means CSS, hover states, animations,
  // and focus rings all behave exactly as they would in production.
  //
  // CT is best for: visual states, user interactions on isolated components,
  // edge-case prop combinations that are hard to reach through full-page tests.

  test.use({ viewport: { width: 400, height: 300 } });

  test('renders card title', async ({ mount }) => {
    // TODO 1.1: Mount <KanbanCard title="Buy groceries" /> and assert the
    // rendered text "Buy groceries" is visible.
    // mount() returns a Locator to the mounted component root.
    const component = await mount(/* TODO 1.1 */);
    await expect(component).toContainText(/* TODO 1.1: 'Buy groceries' */);
  });

  test('calls onDelete when delete button clicked', async ({ mount }) => {
    // TODO 1.2: Mount the KanbanCard with an onDelete prop that records whether
    // it was called. Use a let variable and a closure:
    //   let deleted = false;
    //   mount(<KanbanCard title="..." onDelete={() => { deleted = true; }} />)
    // Then click the delete button (data-testid="card-delete-btn") and
    // assert deleted === true.
    let deleted = false;
    const component = await mount(/* TODO 1.2 */);
    await component.getByTestId(/* TODO 1.2: 'card-delete-btn' */).click();
    expect(deleted).toBe(/* TODO 1.2: true */);
  });

  test('shows "completed" style when done prop is true', async ({ mount }) => {
    // TODO 1.3: Mount KanbanCard with done={true}. Assert the component has
    // the CSS class "line-through" or data-testid="card-completed-badge".
    // Why CT here? CSS class assertions on live-rendered components are
    // more reliable than unit-testing className strings.
    const component = await mount(/* TODO 1.3 */);
    await expect(component).toHaveClass(/* TODO 1.3 */);
  });

  test('update props via component.update()', async ({ mount }) => {
    // TODO 1.4: Mount KanbanCard with title="Before". Then call
    // component.update(<KanbanCard title="After" />) and assert "After" is visible.
    // update() re-renders with new props — simulates a parent state change.
    const component = await mount(/* TODO 1.4 */);
    await component.update(/* TODO 1.4 */);
    await expect(component).toContainText(/* TODO 1.4: 'After' */);
  });
});

test.describe('Part 2 — React Component Testing (formerly M52)', () => {

  // M52: React Component Testing
  //
  // Component tests use a separate CT config and mount() instead of page.goto().
  // Run with:
  //   npx playwright test --config playwright-ct.config.ts tests/module-11-component-testing/exercise.spec.tsx
  //
  // These exercises are conceptual scaffolds — the actual component files would be
  // imported from lumio/components/. The TODOs teach the CT API patterns.

  // ─── Simulated component types ────────────────────────────────────────────────
  // In a real setup these would be imported from Lumio:
  //   import TaskCard from '../../lumio/components/TaskCard';
  //   import NotificationBadge from '../../lumio/components/NotificationBadge';

  // Test 1: Mount a component with props and assert rendered text
  test('TaskCard renders title and priority', async ({ mount }) => {
    // TODO 2.1: Mount a TaskCard component with props: title='Fix login bug', priority='high'.
    // In a real test:
    //   const component = await mount(<TaskCard title="Fix login bug" priority="high" />);
    // For this exercise, assert the pattern conceptually.
    // Why? mount() type-checks props at compile time — missing required props fail before running.
    const taskTitle = 'Fix login bug';
    const priority = 'high';

    // Simulated: in a real CT test you'd mount and use the locator API.
    // TODO 2.1: Set this to true once you understand the mount() API.
    const mountUnderstood = /* TODO 2.1: true */ false;
    expect(mountUnderstood).toBe(true);
    expect(taskTitle).toBe('Fix login bug');
    expect(priority).toBe('high');
  });

  // Test 2: Assert on rendered output using the locator API
  test('component locator uses standard Playwright API', async ({ mount, page }) => {
    // After mounting, the returned locator is the component root.
    // All standard locator methods work:
    //   await expect(component).toContainText('Fix login bug');
    //   await expect(component.getByRole('button')).toBeVisible();
    //   await expect(component).toHaveAttribute('data-priority', 'high');

    // TODO 2.2: Set the correct locator method for asserting text content.
    // Which expect method checks that a locator's text includes a substring?
    const textAssertionMethod = /* TODO 2.2: 'toContainText' */ '';
    expect(textAssertionMethod).toBe('toContainText');
  });

  // Test 3: Assert on component events (callback props)
  test('component events fire when triggered', async ({ mount }) => {
    // Pattern for event testing:
    //   let deleteCallCount = 0;
    //   const component = await mount(
    //     <TaskCard title="Test" onDelete={() => { deleteCallCount++ }} />
    //   );
    //   await component.getByRole('button', { name: 'Delete' }).click();
    //   expect(deleteCallCount).toBe(1);

    // TODO 2.3: What value should deleteCallCount be after one button click?
    const expectedCallCount = /* TODO 2.3: 1 */ 0;
    expect(expectedCallCount).toBe(1);
  });

  // Test 4: NotificationBadge — conditional rendering
  test('NotificationBadge shows count when greater than zero', async ({ mount }) => {
    // A notification badge has two states:
    //   count=0  → badge hidden (or shows nothing)
    //   count=5  → badge shows '5'
    //
    // Testing both states in one component test file is cleaner than
    // navigating to a page that happens to show a notification.

    // TODO 2.4: For count=0, what visibility assertion would you use?
    const hiddenAssertion = /* TODO 2.4: 'not.toBeVisible' */ '';
    expect(hiddenAssertion).toBe('not.toBeVisible');

    // TODO 2.5: For count=5, what text assertion would you use?
    const textAssertion = /* TODO 2.5: 'toContainText' */ '';
    expect(textAssertion).toBe('toContainText');
  });

  // Test 5: beforeMount for provider wrapping
  test('BoardView requires ThemeProvider via beforeMount', async ({ mount }) => {
    // Components that consume React Context crash without their providers.
    // The beforeMount hook in playwright/index.tsx wraps every mount() call:
    //
    //   beforeMount(async ({ App, hooksConfig }) => {
    //     return (
    //       <ThemeProvider theme={hooksConfig?.theme ?? 'light'}>
    //         <App />
    //       </ThemeProvider>
    //     );
    //   });
    //
    // Then in the test:
    //   const component = await mount(<BoardView />, {
    //     hooksConfig: { theme: 'dark' }
    //   });
    //   await expect(component).toHaveAttribute('data-theme', 'dark');

    // TODO 2.6: Which hook wraps components with providers in CT?
    const providerHookName = /* TODO 2.6: 'beforeMount' */ '';
    expect(providerHookName).toBe('beforeMount');
  });

  // Test 6: afterMount for post-render assertions
  test('afterMount accesses component instance after render', async ({ mount }) => {
    // afterMount fires after the component renders.
    // In the beforeMount/afterMount hooks file:
    //   afterMount(async ({ instance }) => {
    //     // instance is the component's React ref (if using forwardRef)
    //   });
    //
    // More commonly used in Vue CT (to access the component instance).
    // In React CT, afterMount is useful for checking initial render state.

    // TODO 2.7: Which hook fires AFTER the component renders (as opposed to beforeMount)?
    const postRenderHookName = /* TODO 2.7: 'afterMount' */ '';
    expect(postRenderHookName).toBe('afterMount');
  });

  // Test 7: CT vs e2e — know when to use each
  test('understands when component tests are appropriate', async ({}) => {
    const bestForComponentTests = [
      'Conditional rendering based on props',
      'Event handler callback firing',
      'Provider context consumption',
      'Component edge states (loading, empty, error)',
    ];

    const bestForE2eTests = [
      'Multi-component workflows',
      'Authentication flows',
      'Database state verification',
      'Cross-page navigation',
    ];

    // TODO 2.8: Assert both arrays have length greater than 0.
    // Why? Understanding the boundary between CT and e2e prevents misusing either tool —
    // component tests that span multiple pages are fragile; e2e tests of single components are slow.
    expect(bestForComponentTests.length).toBeGreaterThan(/* TODO 2.8: 0 */);
    expect(bestForE2eTests.length).toBeGreaterThan(0);
  });

});

test.describe('Part 4 — Network Mocking in Component Tests (formerly M54)', () => {

  // M54: Network Mocking in Component Tests
  //
  // This module teaches CT network interception — testing components in loading,
  // populated, and error states without a real API server.
  //
  // Run with:
  //   npx playwright test --config playwright-ct.config.ts tests/module-11-component-testing/exercise.spec.tsx

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

    // TODO 4.1: What class handles network mocking in Playwright CT?
    const routerClassName = /* TODO 4.1: 'Router' */ '';
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

    // TODO 4.2: To test the loading state, the mocked route handler should...
    // Set to 'never-fulfill' to indicate the route should not respond.
    const loadingTestPattern = /* TODO 4.2: 'never-fulfill' */ '';
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

    // TODO 4.3: What method on route returns a successful JSON response?
    const fulfillMethod = /* TODO 4.3: 'fulfill' */ '';
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

    // TODO 4.4: What HTTP status code represents an internal server error?
    const errorStatusCode = /* TODO 4.4: 500 */ 0;
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

    // TODO 4.5: MSW intercepts requests at which layer?
    const mswLayer = /* TODO 4.5: 'Service Worker' */ '';
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

    // TODO 4.6: What MSW function passes a request through to the real server?
    const bypassFunctionName = /* TODO 4.6: 'bypass' */ '';
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

    // TODO 4.7: CT network mocking is best used for testing component _____.
    const ctBestFor = /* TODO 4.7: 'states' */ '';
    expect(ctBestFor).toBe('states');

    // TODO 4.8: e2e page.route() is best used for controlling _____ during workflows.
    const e2eBestFor = /* TODO 4.8: 'API behavior' */ '';
    expect(e2eBestFor).toBe('API behavior');
  });

  // Test 8: Three required states for any data-fetching component
  test('three states must be tested for every data-fetching component', async ({}) => {
    const requiredStates = [
      /* TODO 4.9: 'loading' */  '',  // Request in-flight
      /* TODO 4.10: 'populated' */ '', // Request succeeded with data
      'error',                        // Request failed
    ];

    // TODO 4.9: Set index 0 to 'loading'.
    // TODO 4.10: Set index 1 to 'populated'.
    expect(requiredStates[0]).toBe('loading');
    expect(requiredStates[1]).toBe('populated');
    expect(requiredStates[2]).toBe('error');
  });

});
