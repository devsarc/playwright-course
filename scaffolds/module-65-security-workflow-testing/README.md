# M65: Security Workflow Testing

## Learning Objectives

- Test that unauthenticated users are redirected away from protected routes
- Verify that CSRF tokens are present on form submissions
- Assert that XSS payloads are sanitized and not rendered as HTML
- Mask sensitive values in test artifacts to prevent credential leaks

## Concept

M19 covered the access control layer: RBAC testing, unauthorized route protection (403 flows), and the CAPTCHA strategy. M65 goes deeper into specific security primitives — the mechanisms that prevent the most common web vulnerabilities: CSRF, XSS, and information leakage in test artifacts.

**CSRF token verification.**

Cross-Site Request Forgery (CSRF) attacks trick an authenticated user's browser into making unwanted requests to an application. The defense is a token: the server embeds a unique, secret value in the form; when the form is submitted, the server checks that the token matches. A malicious cross-site page can't read the token from another origin, so it can't forge a valid request.

In tests, verify CSRF protection by asserting the token exists before submission:

```typescript
const csrfToken = await page.locator('input[name="csrf_token"]').inputValue();
expect(csrfToken).toBeTruthy();
expect(csrfToken.length).toBeGreaterThan(10); // not an empty placeholder
```

Or by intercepting the form submission request and asserting the token header:

```typescript
const [request] = await Promise.all([
  page.waitForRequest(req => req.url().includes('/api/settings')),
  page.getByRole('button', { name: 'Save' }).click(),
]);
expect(request.headers()['x-csrf-token']).toBeTruthy();
```

**XSS sanitization testing.**

Cross-Site Scripting (XSS) attacks inject malicious scripts into page content that other users then execute. Modern React applications are resistant to reflected XSS by default (JSX doesn't render raw HTML), but stored XSS is still a risk — user input stored in the database and rendered later.

The test pattern: enter a script injection string, submit, navigate to where the content is rendered, assert it's escaped rather than executed:

```typescript
const xssPayload = '<script>window.__xssExecuted = true</script>';
await page.getByLabel('Task title').fill(xssPayload);
await page.getByRole('button', { name: 'Create' }).click();

// Navigate to where the task title renders
await page.goto('/dashboard');

// Assert the script was not executed
const xssExecuted = await page.evaluate(() => (window as any).__xssExecuted);
expect(xssExecuted).toBeUndefined();

// Assert the raw text is visible (escaped, not rendered as HTML)
await expect(page.getByText('<script>')).toBeVisible();
```

This tests both that the script didn't run (`__xssExecuted` is undefined) and that the escaped text is visible.

**Unauthenticated route protection.**

M19 covered RBAC (member vs admin). M65 tests the authentication boundary: what happens when an unauthenticated user tries to access a protected route? The expected behavior is a redirect to the login page, not a 403 or a blank screen.

```typescript
// In a fresh context with no auth
const freshContext = await browser.newContext(); // no storageState
const freshPage = await freshContext.newPage();
await freshPage.goto('/dashboard');
await expect(freshPage).toHaveURL(/.*login.*/);
```

**Masking sensitive data in test artifacts.**

Playwright's HTML reports and trace files can contain screenshots, network logs, and console output — all of which may include sensitive data (auth tokens, API keys, personal information). Three masking techniques:

1. **`page.screenshot({ mask: [locator] })`** — replaces matched elements with a solid color box in screenshots.
2. **Trace masking is not automatic** — avoid storing real credentials in cookies or localStorage in tests; use test-specific dummy values.
3. **Reporter sanitization** — the `JSON reporter` output may contain request headers. Strip `Authorization` and `Cookie` headers before uploading reports to shared artifact storage.

```typescript
await page.screenshot({
  path: 'artifacts/settings-page.png',
  mask: [page.getByTestId('api-key-value'), page.getByTestId('user-email')],
});
```

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-65-security-workflow-testing
```

## Key Takeaways

1. Assert CSRF tokens exist and are non-trivial before form submission — both the hidden input and the request header.
2. Test XSS by entering a payload and asserting `window.__xssExecuted` is `undefined` after render.
3. Test unauthenticated access in a `newContext()` with no `storageState` — assert redirect to login URL.
4. `page.screenshot({ mask: [locator] })` prevents sensitive values from appearing in visual artifacts.
5. Security tests belong in the same suite as functional tests — run them on every PR, not just security audits.

## Going Deeper

- [OWASP: CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP: XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Playwright docs: page.screenshot() mask option](https://playwright.dev/docs/api/class-page#page-screenshot-option-mask)
