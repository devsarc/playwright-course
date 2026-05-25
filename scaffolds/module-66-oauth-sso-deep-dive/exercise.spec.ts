import { test, expect } from '../fixtures/fixtures';

// M66: OAuth & SSO Deep Dive

test.describe('M66 — OAuth & SSO Deep Dive', () => {

  // Test 1: Assert PKCE parameters in the authorization URL
  test('authorization request includes PKCE code_challenge', async ({ page }) => {
    let authUrl = '';

    // Capture the GitHub OAuth authorization URL before it redirects
    page.on('request', req => {
      if (req.url().includes('github.com/login/oauth/authorize')) {
        authUrl = req.url();
      }
    });

    // Navigate to the login page and click the GitHub OAuth button
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in with github/i }).click();
    await page.waitForTimeout(500);

    const params = new URL(authUrl).searchParams;

    // TODO 1: Assert that params.get('code_challenge') is truthy.
    // Why? PKCE requires code_challenge in the authorization request — its absence is a security flaw.
    expect(params.get(/* TODO 1: 'code_challenge' */ 'PLACEHOLDER')).toBeTruthy();
  });

  // Test 2: Mock OAuth provider authorization endpoint
  test('mock OAuth provider skips the real provider UI', async ({ page }) => {
    // TODO 2: Use page.route() to intercept 'https://github.com/login/oauth/authorize*'.
    // Fulfill with a 302 redirect to:
    //   http://localhost:3000/api/auth/callback/github?code=test-code&state=<forwarded-state>
    // Why? Mocking the authorization endpoint skips GitHub's login UI entirely.
    await page.route(/* TODO 2: 'https://github.com/login/oauth/authorize*' */ 'https://PLACEHOLDER*', route => {
      const state = new URL(route.request().url()).searchParams.get('state') ?? '';
      const callbackUrl = new URL('http://localhost:3000/api/auth/callback/github');
      callbackUrl.searchParams.set('code', 'test-auth-code');
      callbackUrl.searchParams.set('state', state);
      route.fulfill({ status: 302, headers: { Location: callbackUrl.toString() } });
    });

    // Also mock the token endpoint
    await page.route('https://github.com/login/oauth/access_token', route => {
      route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          token_type: 'Bearer',
        }),
      });
    });

    await page.goto('/login');
    await page.getByRole('button', { name: /sign in with github/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 5000 });

    // TODO 3: Assert the page URL includes '/dashboard' (OAuth flow completed).
    expect(page.url()).toContain(/* TODO 3: '/dashboard' */ '/PLACEHOLDER');
  });

  // Test 3: Token endpoint returns access + refresh tokens
  test('token endpoint mock returns access and refresh tokens', async ({ page }) => {
    let tokenResponseBody = '';

    await page.route('https://github.com/login/oauth/authorize*', route => {
      const state = new URL(route.request().url()).searchParams.get('state') ?? '';
      const callbackUrl = new URL('http://localhost:3000/api/auth/callback/github');
      callbackUrl.searchParams.set('code', 'test-code');
      callbackUrl.searchParams.set('state', state);
      route.fulfill({ status: 302, headers: { Location: callbackUrl.toString() } });
    });

    // TODO 4: Route 'https://github.com/login/oauth/access_token' to capture the
    // request body and fulfill with { access_token, refresh_token, expires_in: 3600, token_type: 'Bearer' }.
    await page.route('https://github.com/login/oauth/access_token', async route => {
      const responseBody = {
        access_token: /* TODO 4: 'mock-access-token' */ '',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      };
      tokenResponseBody = JSON.stringify(responseBody);
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: tokenResponseBody,
      });
    });

    await page.goto('/login');
    await page.getByRole('button', { name: /sign in with github/i }).click();
    await page.waitForTimeout(1000);

    // TODO 5: Assert that tokenResponseBody includes 'access_token'.
    expect(tokenResponseBody).toContain(/* TODO 5: 'access_token' */ 'PLACEHOLDER');
  });

  // Test 4: Refresh token expiry redirects to login
  test('expired refresh token triggers logout redirect', async ({ page }) => {
    // Simulate a session where the refresh token has been revoked
    // TODO 6: Route '**/api/auth/session' to return { status: 401,
    //   body: { error: 'RefreshAccessTokenError' } }.
    // Why? The app calls this endpoint to validate the session — a 401 means tokens are invalid.
    await page.route('**/api/auth/session', route => {
      route.fulfill({
        status: /* TODO 6: 401 */ 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'RefreshAccessTokenError' }),
      });
    });

    await page.goto('/dashboard');

    // TODO 7: Assert that the page URL matches /.*login.*/ (user was logged out).
    await expect(page).toHaveURL(/* TODO 7: /.*login.*/ /.*PLACEHOLDER.*/ );
  });

  // Test 5: State parameter is forwarded to prevent CSRF
  test('OAuth callback forwards the state parameter', async ({ page }) => {
    let capturedState = '';

    page.on('request', req => {
      if (req.url().includes('github.com/login/oauth/authorize')) {
        capturedState = new URL(req.url()).searchParams.get('state') ?? '';
      }
    });

    await page.goto('/login');
    await page.getByRole('button', { name: /sign in with github/i }).click();
    await page.waitForTimeout(300);

    // TODO 8: Assert that capturedState is truthy (state parameter was sent in the authorization request).
    // Why? state is the CSRF protection mechanism in OAuth2 — its absence is a security vulnerability.
    expect(capturedState)./* TODO 8: toBeTruthy() */ toBeFalsy();
  });

  // Test 6: Conceptual — PKCE vs implicit flow
  test('PKCE prevents authorization code interception attacks', async ({}) => {
    // PKCE adds a code_verifier (random string) + code_challenge (hash of verifier) to the flow.
    // An attacker who intercepts the authorization code cannot exchange it for tokens
    // because they don't have the code_verifier.

    // TODO 9: What is the name of the hashing method used to generate code_challenge from code_verifier?
    const pkceMethod = /* TODO 9: 'S256' */ '';
    expect(pkceMethod).toBe('S256'); // SHA-256 is the PKCE standard method
  });

});
