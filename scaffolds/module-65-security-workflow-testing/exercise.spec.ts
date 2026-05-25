import { test, expect } from '../fixtures/fixtures';

// M65: Security Workflow Testing

test.describe('M65 — Security Workflow Testing', () => {

  // Test 1: Unauthenticated access redirects to login
  test('unauthenticated user is redirected from /dashboard to login', async ({ browser }) => {
    // Create a fresh context with no stored auth state
    // TODO 1: Create a fresh browser context using browser.newContext() (no storageState).
    // Why? A fresh context has no cookies or tokens — simulates a never-logged-in user.
    const freshContext = await browser./* TODO 1: newContext() */ newContext({
      storageState: /* TODO 1: undefined (omit this option entirely) */ undefined,
    });
    const freshPage = await freshContext.newPage();

    await freshPage.goto('/dashboard');

    // TODO 2: Assert that freshPage.url() matches /.*login.*/ (redirected to login page).
    await expect(freshPage).toHaveURL(/* TODO 2: /.*login.*/ /.*PLACEHOLDER.*/ );

    await freshContext.close();
  });

  // Test 2: Protected admin route blocks non-admin users
  test('member role cannot access /admin route', async ({ page, context }) => {
    // Log in as a member (non-admin) using stored member credentials
    await context.addCookies([{
      name: 'next-auth.session-token',
      value: process.env.TEST_MEMBER_SESSION ?? 'member-session-token',
      domain: 'localhost',
      path: '/',
    }]);

    await page.goto('/admin');

    // TODO 3: Assert that the page URL does NOT include '/admin'
    // (the member was redirected away from the admin route).
    expect(page.url()).not./* TODO 3: toContain('/admin') */ toContain('PLACEHOLDER');
  });

  // Test 3: CSRF token exists in form before submission
  test('settings form contains a CSRF token', async ({ page }) => {
    await page.goto('/settings');

    // TODO 4: Get the value of the hidden input[name="csrf_token"] on the settings form.
    // Assign it to csrfToken.
    const csrfToken = await page.locator(/* TODO 4: 'input[name="csrf_token"]' */ 'PLACEHOLDER').inputValue();

    // TODO 5: Assert that csrfToken.length is greater than 10 (non-trivial token).
    expect(csrfToken.length).toBeGreaterThan(/* TODO 5: 10 */ 0);
  });

  // Test 4: CSRF token is sent in request header
  test('CSRF token is included in settings save request', async ({ page }) => {
    await page.goto('/settings');

    let capturedCsrfHeader = '';

    page.on('request', req => {
      if (req.url().includes('/api/settings') && req.method() === 'POST') {
        // TODO 6: Capture req.headers()['x-csrf-token'] into capturedCsrfHeader.
        capturedCsrfHeader = req.headers()[/* TODO 6: 'x-csrf-token' */ 'x-placeholder'] ?? '';
      }
    });

    await page.getByLabel('Display name').fill('Updated Name');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(500);

    // TODO 7: Assert that capturedCsrfHeader is truthy (header was sent with the request).
    expect(capturedCsrfHeader)./* TODO 7: toBeTruthy() */ toBeFalsy();
  });

  // Test 5: XSS payload does not execute
  test('XSS payload in task title is sanitized and not executed', async ({ page }) => {
    await page.goto('/dashboard');

    const xssPayload = '<script>window.__xssExecuted = true</script>';

    await page.getByRole('button', { name: 'Add task' }).first().click();
    await page.getByTestId('task-title-input').fill(xssPayload);
    await page.getByRole('button', { name: 'Create' }).click();
    await page.waitForTimeout(500);

    // TODO 8: Use page.evaluate() to read window.__xssExecuted.
    // Assign it to xssExecuted.
    const xssExecuted = await page.evaluate(
      () => /* TODO 8: (window as any).__xssExecuted */ (window as any).__xssExecuted
    );

    // TODO 9: Assert that xssExecuted is undefined (the script tag was not executed).
    expect(xssExecuted).toBe(/* TODO 9: undefined */ 'executed');
  });

  // Test 6: XSS payload is visible as escaped text
  test('XSS payload renders as escaped text, not HTML', async ({ page }) => {
    await page.goto('/dashboard');

    const xssPayload = '<img src=x onerror="window.__imgError=true">';

    await page.getByRole('button', { name: 'Add task' }).first().click();
    await page.getByTestId('task-title-input').fill(xssPayload);
    await page.getByRole('button', { name: 'Create' }).click();
    await page.waitForTimeout(500);

    // Assert the onerror handler did not execute
    const imgErrorFired = await page.evaluate(() => (window as any).__imgError);
    // TODO 10: Assert that imgErrorFired is undefined (onerror handler was not executed).
    expect(imgErrorFired).toBe(/* TODO 10: undefined */ 'fired');
  });

  // Test 7: Screenshot masks sensitive data
  test('screenshot masks the API key value', async ({ page }) => {
    await page.goto('/settings/api');

    const screenshotBuffer = await page.screenshot({
      // TODO 11: Add mask: [page.getByTestId('api-key-value')] to hide the key.
      // Why? Unmasked API keys in screenshots can be exposed if artifacts are shared publicly.
      mask: /* TODO 11: [page.getByTestId('api-key-value')] */ [],
    });

    // A non-empty buffer confirms the screenshot was taken
    expect(screenshotBuffer.length).toBeGreaterThan(0);
  });

});
