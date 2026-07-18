// Lesson 02: Network & APIs
// Combines former modules: M12 (Network Interception & Mocking), M13 (Advanced
// Network Patterns), M14 (API Testing with request Fixture), M15 (HAR
// Recording & Network Analysis).
//
// Each Part below is the original module's test.describe block, unchanged
// except TODO numbers are prefixed with the Part number to stay unique in
// this file (a TODO originally numbered N in the M14 module becomes TODO
// 3.N here, matching Part 3's prefix).

import { test, expect } from '../fixtures/fixtures';
import path from 'path';

test.describe('Part 1 — Network Interception & Mocking (formerly M12)', () => {
  // M12: Network Interception & Mocking
  //
  // page.route() intercepts requests matching a pattern BEFORE they reach the server.
  // context.route() does the same but applies to ALL pages in the context.
  // Use route() to: simulate error states, inject test data, speed up tests by
  // bypassing slow APIs, and test UI behavior when the backend is unavailable.

  test('route.fulfill: return a mocked project list', async ({ page }) => {
    // TODO 1.1: Intercept GET requests to /api/projects* and return a mocked response.
    // Use page.route(pattern, handler).
    // The handler should call route.fulfill() with:
    //   status: 200
    //   contentType: 'application/json'
    //   body: JSON.stringify([{ id: 'mock-1', name: 'Mocked Project', _count: { tasks: 5 } }])
    await page.route(/* TODO 1.1: '/api/projects*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 'mock-1', name: 'Mocked Project', _count: { tasks: 5 } }]),
      });
    } */);

    // Navigate to a page that calls /api/projects (requires auth — use Lesson 03 (formerly M16)'s pattern)
    // For now, verify the route intercept is registered
    await page.goto('/');
    // The route is active — if /api/projects is called, it returns the mock
  });

  test('route.fulfill: simulate a 500 error on workspace API', async ({ page }) => {
    // TODO 1.2: Intercept POST requests to /api/workspaces and return a 500 error.
    await page.route('/api/workspaces', async (route) => {
      if (route.request().method() === 'POST') {
        // TODO 1.2: fulfill with status 500 and body { error: 'Internal server error' }
        await route./* TODO 1.2: fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Internal server error' }) }) */ continue();
      } else {
        await route.continue();
      }
    });

    await page.goto('/onboarding/workspace');
    await page.getByLabel('Workspace name').fill('Test');
    await page.getByLabel('URL slug').fill('test');
    await page.getByRole('button', { name: 'Create workspace' }).click();

    // TODO 1.3: Assert an error message is shown in the UI.
    await expect(page.getByRole('alert'))/* TODO 1.3: toBeVisible() */;
  });

  test('route.abort: simulate a network failure', async ({ page }) => {
    // TODO 1.4: Intercept all fetch requests to /api/* and abort them.
    // route.abort() simulates a network error (connection refused, DNS failure).
    await page.route('/api/*', async (route) => {
      await route./* TODO 1.4: abort() */;
    });

    await page.goto('/');
    // The landing page doesn't call /api/ so it should load fine
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('route.continue with modification: inject a request header', async ({ page }) => {
    // TODO 1.5: Intercept all API requests and add an X-Test-Request: true header.
    // route.continue({ headers: { ...existingHeaders, 'X-Test-Request': 'true' } })
    await page.route('/api/**', async (route) => {
      const headers = {
        ...route.request().headers(),
        // TODO 1.5: add 'X-Test-Request': 'true' to the headers
      };
      await route.continue(/* TODO 1.5: { headers } */);
    });

    await page.goto('/');
    // Verify interceptor is in place (no assertion needed — this is setup verification)
  });
});

test.describe('Part 2 — Advanced Network Patterns (formerly M13)', () => {
  // M13: Advanced Network Patterns
  //
  // addInitScript injects JS that runs before any page script — useful for overriding
  // globals, mocking browser APIs, or injecting test flags without hitting the DB.
  // context.setOffline() simulates a network failure at the OS level (not just API interception).

  test('addInitScript: inject a feature flag before page load', async ({ page }) => {
    // TODO 2.1: Use page.addInitScript() to inject window.__lumioFlags = { aiSuggestions: true }
    // before the page loads. This simulates a feature flag being enabled without
    // hitting the database.
    await page.addInitScript(/* TODO 2.1: () => {
      (window as any).__lumioFlags = { aiSuggestions: true };
    } */);

    await page.goto('/');

    // TODO 2.2: Use page.evaluate() to read window.__lumioFlags and assert it's set.
    const flags = await page.evaluate(/* TODO 2.2: () => (window as any).__lumioFlags */);
    expect(flags).toEqual({ aiSuggestions: true });
  });

  test('page.on request: monitor outgoing API calls', async ({ page }) => {
    const apiRequests: string[] = [];

    // TODO 2.3: Listen to page's 'request' event and collect all API request URLs.
    // Use page.on('request', handler). The handler receives a Request object;
    // call request.url() to get the URL.
    page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        apiRequests.push(/* TODO 2.3: request.url() */);
      }
    });

    await page.goto('/login');
    await page.getByLabel('Email address').fill('test@lumio.dev');
    await page.getByLabel('Password').fill('TestPassword123!');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Wait for navigation or error
    await page.waitForLoadState('networkidle');

    // TODO 2.4: Assert that at least one request was made to /api/auth/callback/credentials.
    expect(apiRequests.some((url) => url.includes('/api/auth')))/* TODO 2.4: toBe(true) */;
  });

  test('context.setOffline: simulate network failure', async ({ context, page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // TODO 2.5: Set the browser context offline using context.setOffline(true).
    // After going offline, any new network request will fail with a network error.
    await context./* TODO 2.5: setOffline(true) */ setOffline(false);

    // Try to navigate to a new page — it will fail with net::ERR_INTERNET_DISCONNECTED
    // Wrap in try/catch to handle the navigation error gracefully in the test
    try {
      await page.goto('/pricing', { timeout: 3000 });
    } catch {
      // Expected — network is offline
    }

    // TODO 2.6: Restore online status and verify navigation works again.
    await context.setOffline(/* TODO 2.6: false */);
    await page.goto('/pricing');
    await expect(page).toHaveURL(/\/pricing/);
  });
});

test.describe('Part 3 — API Testing with request Fixture (formerly M14)', () => {
  // M14: API Testing with request Fixture
  //
  // The 'request' fixture sends HTTP requests WITHOUT a browser.
  // It's faster than UI-based state setup and can test backend logic directly.
  // Best practice: use API calls in beforeEach to create test state fast,
  // then use the browser (page) only for the UI assertions that need it.

  // We need auth for these API calls. At M14, we use the test user's credentials
  // directly. Lesson 03 (formerly M16) teaches the proper storageState pattern.
  let authCookie: string;

  test.beforeAll(async ({ request }) => {
    // Sign in via the NextAuth credentials endpoint to get a session cookie
    const res = await request.post('/api/auth/callback/credentials', {
      form: {
        email: process.env.TEST_USER_EMAIL!,
        password: process.env.TEST_USER_PASSWORD!,
        callbackUrl: '/dashboard',
      },
    });
    // Extract the session cookie from the response headers
    const setCookie = res.headers()['set-cookie'];
    authCookie = setCookie ? setCookie.split(';')[0] : '';
  });

  test('GET /api/projects: returns 401 without auth', async ({ request }) => {
    // TODO 3.1: Make an unauthenticated GET request to /api/projects?workspaceId=test.
    // Assert the response status is 401.
    const response = await request.get(/* TODO 3.1: '/api/projects?workspaceId=test-workspace' */);
    expect(response.status())/* TODO 3.1b: toBe(401) */;
  });

  test('POST /api/tasks: create a task via API', async ({ request }) => {
    // TODO 3.2: Make a POST request to /api/tasks with:
    //   title: 'API-created task'
    //   projectId: 'seed-project-001'
    // Include the auth cookie in headers.
    const response = await request.post('/api/tasks', {
      data: {
        title: /* TODO 3.2: 'API-created task' */ '' as any,
        projectId: 'seed-project-001',
      },
      headers: {
        Cookie: authCookie,
      },
    });

    // TODO 3.3: Assert the response status is 201.
    expect(response.status())/* TODO 3.3: toBe(201) */;

    // TODO 3.4: Assert the response body has 'title' equal to 'API-created task'.
    const body = await response.json();
    expect(body.title)/* TODO 3.4: toBe('API-created task') */;
  });

  test('DELETE /api/tasks/:id: delete the task via API', async ({ request }) => {
    // First create a task to delete
    const createRes = await request.post('/api/tasks', {
      data: { title: 'Task to delete', projectId: 'seed-project-001' },
      headers: { Cookie: authCookie },
    });
    const { id } = await createRes.json();

    // TODO 3.5: Delete the task using DELETE /api/tasks/{id}.
    const deleteRes = await request.delete(/* TODO 3.5: `/api/tasks/${id}` */, {
      headers: { Cookie: authCookie },
    });

    expect(deleteRes.status()).toBe(200);
    const deleteBody = await deleteRes.json();
    expect(deleteBody.deleted).toBe(true);
  });
});

const HAR_PATH = path.join(__dirname, 'lumio-landing.har');

test.describe('Part 4 — HAR Recording & Network Analysis (formerly M15)', () => {
  // M15: HAR Recording & Network Analysis
  //
  // A HAR (HTTP Archive) file captures all network requests and responses
  // during a browser session. Uses: debugging, performance analysis, and
  // replay-based mocking (run tests without a live backend).

  test('record: capture landing page network traffic to HAR', async ({ page, context }) => {
    // TODO 4.1: Start recording a HAR file to HAR_PATH.
    // Use context.routeFromHAR() in record mode OR page.goto with recordHar option.
    // The simplest approach: pass recordHar to the browser context (done in playwright.config.ts
    // or per-test via test.use()). Here, record directly via context options.
    // Note: This requires creating the context with recordHar. Since we're using the
    // test-provided 'page', we instead use a manual approach: launch a new context.

    // For the exercise, use page.context() and show the concept:
    await context.routeFromHAR(HAR_PATH, {
      update: true, // record mode: update the HAR file
      url: /localhost:3000/,
    });

    // TODO 4.2: Navigate to the landing page.
    await page.goto(/* TODO 4.2: '/' */);

    // The HAR was recorded to HAR_PATH automatically
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('replay: serve landing page from HAR without a live server', async ({ page, context }) => {
    // TODO 4.3: Configure the context to replay requests from the recorded HAR file.
    // Use context.routeFromHAR() in replay mode (update: false).
    // Requests that match the HAR will be served from it; others pass through.
    await context.routeFromHAR(HAR_PATH, {
      update: false,
      // TODO 4.3: Set url pattern to match the landing page
      url: /* TODO 4.3: /localhost:3000/ */ /^$/ as any,
    });

    await page.goto('/');
    // The landing page should load from the HAR — even if the server is down
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
