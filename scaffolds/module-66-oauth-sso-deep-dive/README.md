# M66: OAuth & SSO Deep Dive

## Learning Objectives

- Automate the full OAuth2 authorization code flow with PKCE in Lumio
- Test the refresh token flow without a real identity provider
- Mock an OAuth provider to simulate token expiry and revocation edge cases
- Understand the difference between M17 (happy path automation) and M66 (protocol edge cases)

## Concept

M17 automated Lumio's GitHub OAuth login: click the button, handle the popup, assert you end up logged in. That covers the happy path. M66 tests the protocol — the full OAuth2 authorization code flow with PKCE, refresh token behavior, and the edge cases that only appear when tokens expire or are revoked mid-session.

**The OAuth2 authorization code flow with PKCE.**

PKCE (Proof Key for Code Exchange) is the recommended OAuth2 flow for browser-based and native apps. It prevents authorization code interception attacks. The flow:

1. App generates a random `code_verifier`, hashes it to produce `code_challenge`
2. App redirects to the provider with `code_challenge` and `response_type=code`
3. User authenticates at the provider
4. Provider redirects back with an authorization `code`
5. App exchanges the `code` + `code_verifier` for `access_token` + `refresh_token`
6. App uses `access_token` for API calls; when it expires, uses `refresh_token` to get a new one

Testing this flow end-to-end against a real provider (GitHub, Google) is fragile — the provider UI changes, rate limits apply, and test accounts accumulate. The standard solution is a mock OAuth provider.

**Mocking the OAuth provider.**

`page.route()` intercepts all HTTP requests — including the authorization endpoint and token endpoint of the OAuth provider:

```typescript
// Intercept the authorization endpoint redirect
await page.route('https://github.com/login/oauth/authorize*', route => {
  // Instead of showing GitHub's login UI, redirect directly with a test code
  const callbackUrl = new URL('http://localhost:3000/api/auth/callback/github');
  callbackUrl.searchParams.set('code', 'test-auth-code-123');
  callbackUrl.searchParams.set('state', new URL(route.request().url()).searchParams.get('state') ?? '');
  route.fulfill({ status: 302, headers: { Location: callbackUrl.toString() } });
});

// Intercept the token endpoint
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
```

With these two routes in place, clicking "Sign in with GitHub" completes the OAuth flow without ever leaving localhost. The state parameter is forwarded to prevent CSRF-in-OAuth validation failures.

**Testing the refresh token flow.**

After `access_token` expiry, the app should silently refresh using `refresh_token`. To test this:

1. Mock the token endpoint to return a short-lived access token (`expires_in: 1`)
2. Wait for expiry
3. Assert the app calls the refresh endpoint and continues functioning
4. Mock the refresh endpoint to return a new access token

Or more practically: mock the token refresh endpoint to return an error (simulating a revoked refresh token) and assert the app redirects to login rather than freezing.

**Token expiry handling.**

The most important OAuth edge case is what happens when the refresh token is also expired or revoked (e.g., the user revoked app access from their GitHub settings). The app must detect the 401 from the refresh endpoint and log the user out gracefully:

```typescript
await page.route('**/api/auth/session', route => {
  route.fulfill({
    status: 401,
    body: JSON.stringify({ error: 'RefreshAccessTokenError' }),
  });
});

await page.goto('/dashboard');
await expect(page).toHaveURL(/.*login.*/);
```

**Contrast with M17.**

M17 automates the OAuth happy path: the real popup, the real provider redirect, storing the resulting session. It tests the user experience. M66 tests the protocol: PKCE parameter passing, token exchange, expiry handling. These are complementary — M17 catches UX regressions; M66 catches security protocol regressions.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-66-oauth-sso-deep-dive
```

## Key Takeaways

1. Mock OAuth providers with `page.route()` — intercept both the authorization endpoint (returns `code`) and the token endpoint (returns tokens).
2. Forward the `state` parameter from the authorization request to prevent CSRF validation failures in the callback.
3. Test refresh token expiry by mocking `/api/auth/session` to return 401 and asserting the redirect to login.
4. PKCE adds `code_challenge` + `code_challenge_method` to the authorization URL — assert these are present.
5. M17 tests UX (does login work?); M66 tests protocol (are tokens handled correctly?).

## Going Deeper

- [OAuth 2.0 RFC: Authorization Code Flow](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1)
- [OAuth 2.0 RFC: PKCE](https://datatracker.ietf.org/doc/html/rfc7636)
- [NextAuth.js docs: Refresh Token Rotation](https://authjs.dev/guides/refresh-token-rotation)
