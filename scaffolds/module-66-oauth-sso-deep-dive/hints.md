# M66 Hints

## TODO 1 — Assert code_challenge in URL params

```typescript
expect(params.get('code_challenge')).toBeTruthy();
```

Also check `code_challenge_method` — it should be `'S256'` (SHA-256). An authorization URL without `code_challenge` is using the non-PKCE flow, which is insecure for browser apps.

## TODO 2 — Route authorization endpoint

```typescript
await page.route('https://github.com/login/oauth/authorize*', route => {
  const state = new URL(route.request().url()).searchParams.get('state') ?? '';
  const callbackUrl = new URL('http://localhost:3000/api/auth/callback/github');
  callbackUrl.searchParams.set('code', 'test-auth-code');
  callbackUrl.searchParams.set('state', state);
  route.fulfill({ status: 302, headers: { Location: callbackUrl.toString() } });
});
```

The trailing `*` in the pattern matches the query string (GitHub's authorize URL has many params). Forwarding the `state` value is essential — NextAuth validates that the callback `state` matches the original request's `state`.

## TODO 3 — Assert redirect to dashboard

```typescript
expect(page.url()).toContain('/dashboard');
```

## TODO 4 — access_token value in mock response

```typescript
access_token: 'mock-access-token',
```

## TODO 5 — Assert tokenResponseBody contains access_token

```typescript
expect(tokenResponseBody).toContain('access_token');
```

## TODO 6 — 401 status for expired refresh token

```typescript
route.fulfill({
  status: 401,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ error: 'RefreshAccessTokenError' }),
});
```

NextAuth catches this response and clears the session, triggering a redirect to the login page. The `RefreshAccessTokenError` string is the NextAuth convention for this specific error.

## TODO 7 — Assert redirect to login

```typescript
await expect(page).toHaveURL(/.*login.*/);
```

## TODO 8 — Assert state is truthy

```typescript
expect(capturedState).toBeTruthy();
```

The `state` parameter should be a random opaque value (typically a UUID or base64-encoded random bytes). NextAuth generates this automatically. Its purpose: when the callback arrives, NextAuth checks that `state` matches what it sent — preventing CSRF attacks in the OAuth flow.

## TODO 9 — PKCE hash method

```typescript
const pkceMethod = 'S256';
```

`S256` means SHA-256. The `code_verifier` is a random 43–128 character string; `code_challenge = BASE64URL(SHA256(code_verifier))`. An attacker who steals the `code` cannot exchange it for tokens without the original `code_verifier`.
