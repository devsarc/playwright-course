import { test, expect } from '@playwright/experimental-ct-react';

// M52: React Component Testing
//
// Component tests use a separate CT config and mount() instead of page.goto().
// Run with:
//   npx playwright test --config playwright-ct.config.ts tests/module-52-react-component-testing
//
// These exercises are conceptual scaffolds — the actual component files would be
// imported from lumio/components/. The TODOs teach the CT API patterns.

// ─── Simulated component types ────────────────────────────────────────────────
// In a real setup these would be imported from Lumio:
//   import TaskCard from '../../lumio/components/TaskCard';
//   import NotificationBadge from '../../lumio/components/NotificationBadge';

test.describe('M52 — React Component Testing', () => {

  // Test 1: Mount a component with props and assert rendered text
  test('TaskCard renders title and priority', async ({ mount }) => {
    // TODO 1: Mount a TaskCard component with props: title='Fix login bug', priority='high'.
    // In a real test:
    //   const component = await mount(<TaskCard title="Fix login bug" priority="high" />);
    // For this exercise, assert the pattern conceptually.
    // Why? mount() type-checks props at compile time — missing required props fail before running.
    const taskTitle = 'Fix login bug';
    const priority = 'high';

    // Simulated: in a real CT test you'd mount and use the locator API.
    // TODO 1: Set this to true once you understand the mount() API.
    const mountUnderstood = /* TODO 1: true */ false;
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

    // TODO 2: Set the correct locator method for asserting text content.
    // Which expect method checks that a locator's text includes a substring?
    const textAssertionMethod = /* TODO 2: 'toContainText' */ '';
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

    // TODO 3: What value should deleteCallCount be after one button click?
    const expectedCallCount = /* TODO 3: 1 */ 0;
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

    // TODO 4: For count=0, what visibility assertion would you use?
    const hiddenAssertion = /* TODO 4: 'not.toBeVisible' */ '';
    expect(hiddenAssertion).toBe('not.toBeVisible');

    // TODO 5: For count=5, what text assertion would you use?
    const textAssertion = /* TODO 5: 'toContainText' */ '';
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

    // TODO 6: Which hook wraps components with providers in CT?
    const providerHookName = /* TODO 6: 'beforeMount' */ '';
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

    // TODO 7: Which hook fires AFTER the component renders (as opposed to beforeMount)?
    const postRenderHookName = /* TODO 7: 'afterMount' */ '';
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

    // TODO 8: Assert both arrays have length greater than 0.
    // Why? Understanding the boundary between CT and e2e prevents misusing either tool —
    // component tests that span multiple pages are fragile; e2e tests of single components are slow.
    expect(bestForComponentTests.length).toBeGreaterThan(/* TODO 8: 0 */);
    expect(bestForE2eTests.length).toBeGreaterThan(0);
  });

});
