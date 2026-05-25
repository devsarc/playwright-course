# M19: Security Workflow Testing

## Learning Objectives

- Test that unauthenticated users are redirected to the login page
- Test that authenticated members can't access admin routes
- Use `page.request` to make API calls that share the page's session cookies
- Explain why security tests are high-value regression tests

## Concept

Security tests verify your application's access control rules. They're among the highest-value tests you can write, because:

1. They're fast — a redirect or a 401 response is cheap to check
2. They catch regressions that could expose sensitive data or functionality
3. They document your access control policy as executable specifications

### Three categories of access control tests

**Unauthenticated access** — what happens when no one is logged in?
```typescript
test('protected route redirects to login', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
});
```

**Insufficient privileges** — what happens when a logged-in user doesn't have permission?
```typescript
test.use({ storageState: memberAuthFile });
test('member cannot access admin panel', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/dashboard/); // redirected, not to login
});
```

**API authorization** — are your API endpoints as protected as your UI routes?
```typescript
test('admin API returns 403 for members', async ({ page }) => {
  const res = await page.request.get('/api/admin/users');
  expect(res.status()).toBe(403);
});
```

### `page.request` vs `request` fixture

When you need authenticated API calls in a UI test, use `page.request` — it shares cookies with the page's browser context:

```typescript
// Authenticated — shares page's cookies
const res = await page.request.get('/api/admin/users');

// Separate context — no auth cookies unless explicitly provided
const res = await request.get('/api/admin/users');
```

For pure API tests (no page), use the `request` fixture and provide auth manually (as in M14).

### The 401 vs 403 distinction

- **401 Unauthorized** — no authentication at all. "Who are you?"
- **403 Forbidden** — authenticated but not authorized. "I know who you are, and you can't do this."

Your tests should verify the correct status code for each scenario. A 403 where a 401 was expected (or vice versa) can indicate a security misconfiguration.

### Defense in depth

Your application should enforce access control at multiple layers: middleware, server-side page logic, and API route handlers. Testing only the middleware is not enough. An API endpoint without its own auth check can be called directly — bypassing the browser, the middleware, and the UI entirely. Your test suite should verify each layer independently:

- Does the middleware redirect unauthenticated users? (UI test)
- Does the server-side page return nothing or redirect when called without a session? (server test)
- Does the API route return 401/403 when called with no auth or wrong role? (API test)

M19 covers all three layers for the Lumio app.

### Security tests as living documentation

A well-structured security test file is an executable specification of your access control policy. When a developer asks "can members see the admin panel?", the test file gives an authoritative, always-up-to-date answer. This is why security tests belong in version control alongside the features they protect — they document intent, not just behavior, and a failing test catches a regression that code review might miss.

### Running security tests in CI

Security tests should run on every pull request, not just before releases. A broken access control rule introduced by an otherwise-passing PR is easy to miss in manual review. A failing security test catches it automatically, before the code merges.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

First, ensure M16's auth state file exists:
```bash
npx playwright test tests/module-16-auth-patterns/exercise.spec.ts
```

Then complete M19:
```bash
npx playwright test tests/module-19-security-workflows
```

## Key Takeaways

1. Test every protected route and API endpoint — both UI redirects and HTTP status codes.
2. Distinguish 401 (unauthenticated) from 403 (authenticated but unauthorized).
3. Use `page.request` for API calls that need the page's session cookies.
4. Security tests are cheap to write and expensive to miss — prioritize them.
5. M19 tests serve as a living specification of your access control policy.

## Going Deeper

- [OWASP: Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
- [Playwright docs: API testing](https://playwright.dev/docs/api-testing)
