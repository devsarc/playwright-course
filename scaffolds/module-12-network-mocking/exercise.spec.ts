import { test, expect } from '../fixtures/fixtures';

// M12: Network Interception & Mocking
//
// page.route() intercepts requests matching a pattern BEFORE they reach the server.
// context.route() does the same but applies to ALL pages in the context.
// Use route() to: simulate error states, inject test data, speed up tests by
// bypassing slow APIs, and test UI behavior when the backend is unavailable.

test.describe('Network interception on Lumio', () => {
  test('route.fulfill: return a mocked project list', async ({ page }) => {
    // TODO 1: Intercept GET requests to /api/projects* and return a mocked response.
    // Use page.route(pattern, handler).
    // The handler should call route.fulfill() with:
    //   status: 200
    //   contentType: 'application/json'
    //   body: JSON.stringify([{ id: 'mock-1', name: 'Mocked Project', _count: { tasks: 5 } }])
    await page.route(/* TODO 1: '/api/projects*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 'mock-1', name: 'Mocked Project', _count: { tasks: 5 } }]),
      });
    } */);

    // Navigate to a page that calls /api/projects (requires auth — use M16's pattern)
    // For now, verify the route intercept is registered
    await page.goto('/');
    // The route is active — if /api/projects is called, it returns the mock
  });

  test('route.fulfill: simulate a 500 error on workspace API', async ({ page }) => {
    // TODO 2: Intercept POST requests to /api/workspaces and return a 500 error.
    await page.route('/api/workspaces', async (route) => {
      if (route.request().method() === 'POST') {
        // TODO 2: fulfill with status 500 and body { error: 'Internal server error' }
        await route./* TODO 2: fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Internal server error' }) }) */ continue();
      } else {
        await route.continue();
      }
    });

    await page.goto('/onboarding/workspace');
    await page.getByLabel('Workspace name').fill('Test');
    await page.getByLabel('URL slug').fill('test');
    await page.getByRole('button', { name: 'Create workspace' }).click();

    // TODO 3: Assert an error message is shown in the UI.
    await expect(page.getByRole('alert'))/* TODO 3: toBeVisible() */;
  });

  test('route.abort: simulate a network failure', async ({ page }) => {
    // TODO 4: Intercept all fetch requests to /api/* and abort them.
    // route.abort() simulates a network error (connection refused, DNS failure).
    await page.route('/api/*', async (route) => {
      await route./* TODO 4: abort() */;
    });

    await page.goto('/');
    // The landing page doesn't call /api/ so it should load fine
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('route.continue with modification: inject a request header', async ({ page }) => {
    // TODO 5: Intercept all API requests and add an X-Test-Request: true header.
    // route.continue({ headers: { ...existingHeaders, 'X-Test-Request': 'true' } })
    await page.route('/api/**', async (route) => {
      const headers = {
        ...route.request().headers(),
        // TODO 5: add 'X-Test-Request': 'true' to the headers
      };
      await route.continue(/* TODO 5: { headers } */);
    });

    await page.goto('/');
    // Verify interceptor is in place (no assertion needed — this is setup verification)
  });
});
