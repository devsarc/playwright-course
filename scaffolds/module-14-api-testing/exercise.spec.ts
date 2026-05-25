import { test, expect } from '../fixtures/fixtures';

// M14: API Testing with request Fixture
//
// The 'request' fixture sends HTTP requests WITHOUT a browser.
// It's faster than UI-based state setup and can test backend logic directly.
// Best practice: use API calls in beforeEach to create test state fast,
// then use the browser (page) only for the UI assertions that need it.

test.describe('Lumio REST API — tasks', () => {
  // We need auth for these API calls. At M14, we use the test user's credentials
  // directly. M16 teaches the proper storageState pattern.
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
    // TODO 1: Make an unauthenticated GET request to /api/projects?workspaceId=test.
    // Assert the response status is 401.
    const response = await request.get(/* TODO 1: '/api/projects?workspaceId=test-workspace' */);
    expect(response.status())/* TODO 1b: toBe(401) */;
  });

  test('POST /api/tasks: create a task via API', async ({ request }) => {
    // TODO 2: Make a POST request to /api/tasks with:
    //   title: 'API-created task'
    //   projectId: 'seed-project-001'
    // Include the auth cookie in headers.
    const response = await request.post('/api/tasks', {
      data: {
        title: /* TODO 2: 'API-created task' */ '' as any,
        projectId: 'seed-project-001',
      },
      headers: {
        Cookie: authCookie,
      },
    });

    // TODO 3: Assert the response status is 201.
    expect(response.status())/* TODO 3: toBe(201) */;

    // TODO 4: Assert the response body has 'title' equal to 'API-created task'.
    const body = await response.json();
    expect(body.title)/* TODO 4: toBe('API-created task') */;
  });

  test('DELETE /api/tasks/:id: delete the task via API', async ({ request }) => {
    // First create a task to delete
    const createRes = await request.post('/api/tasks', {
      data: { title: 'Task to delete', projectId: 'seed-project-001' },
      headers: { Cookie: authCookie },
    });
    const { id } = await createRes.json();

    // TODO 5: Delete the task using DELETE /api/tasks/{id}.
    const deleteRes = await request.delete(/* TODO 5: `/api/tasks/${id}` */, {
      headers: { Cookie: authCookie },
    });

    expect(deleteRes.status()).toBe(200);
    const deleteBody = await deleteRes.json();
    expect(deleteBody.deleted).toBe(true);
  });
});
