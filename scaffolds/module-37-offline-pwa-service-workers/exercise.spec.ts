import { test, expect } from '../fixtures/fixtures';

// M37: Offline, PWA & Service Workers
//
// Playwright can:
//   - Wait for the service worker to be active: context.waitForEvent('serviceworker')
//   - Intercept fetch requests routed through the SW
//   - Simulate offline mode: context.setOffline(true)
//
// Service workers are registered per BrowserContext, not per Page.
// Use context.serviceWorkers() to list active workers.

test.describe('Service Worker registration', () => {
  test('service worker is registered and active', async ({ context, page }) => {
    // TODO 1: Navigate to the app root to trigger SW registration.
    // Then wait for the service worker to be created using context.waitForEvent.
    // Use Promise.all to avoid a race between goto() and the SW creation event.
    const [sw] = await Promise.all([
      context.waitForEvent(/* TODO 1: 'serviceworker' */),
      page.goto('/'),
    ]);

    // TODO 2: Assert the service worker URL contains 'sw.js'.
    expect(sw.url()).toContain(/* TODO 2: 'sw.js' */);
  });

  test('service worker list is not empty after navigation', async ({ context, page }) => {
    await page.goto('/');
    // TODO 3: Wait briefly for SW activation, then call context.serviceWorkers().
    // Assert the returned array has at least one entry.
    // context.serviceWorkers() returns all currently active workers synchronously.
    await page.waitForTimeout(1000); // SW activation is async
    const workers = context.serviceWorkers();
    expect(workers.length).toBeGreaterThan(/* TODO 3: 0 */);
  });
});

test.describe('Offline mode', () => {
  test('app shows offline banner when network is disconnected', async ({ context, page }) => {
    await page.goto('/projects/demo/board');
    // Wait for SW to be active so caching is ready
    await page.waitForTimeout(1000);

    // TODO 4: Set the context to offline mode using context.setOffline(true).
    // This disables all network requests for all pages in the context.
    // It simulates the device losing connectivity, not a server error.
    await context.setOffline(/* TODO 4: true */);

    // TODO 5: Reload the page (offline) and assert the offline banner appears.
    // data-testid="offline-banner"
    // The SW should serve cached assets; the banner appears because the app
    // detects the absence of a network connection via navigator.onLine.
    await page.reload();
    await expect(page.getByTestId(/* TODO 5: 'offline-banner' */)).toBeVisible();
  });

  test('cached board content is still visible when offline', async ({ context, page }) => {
    // TODO 6: Load the board online first (SW caches it), then go offline and
    // reload. Assert that kanban column content is still visible.
    // Why: The PWA's SW caches app-shell and API responses. Users should be
    // able to view (though not edit) their board without a connection.
    await page.goto('/projects/demo/board');
    await page.waitForTimeout(1000); // allow SW to cache

    await context.setOffline(true);
    await page.reload();

    // TODO 6: Assert at least one kanban column is visible after offline reload.
    await expect(page.getByTestId(/* TODO 6: 'kanban-column-todo' */)).toBeVisible();
  });

  test('goes back online after setOffline(false)', async ({ context, page }) => {
    await page.goto('/projects/demo/board');
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByTestId('offline-banner')).toBeVisible();

    // TODO 7: Restore network connectivity with context.setOffline(false).
    // Then reload and assert the offline banner is gone.
    await context.setOffline(/* TODO 7: false */);
    await page.reload();
    await expect(page.getByTestId('offline-banner'))/* TODO 7: not.toBeVisible() */;
  });
});
