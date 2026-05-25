# Lumio Context: M66

## What's in Lumio at this point

Lumio's authentication stack uses NextAuth.js v5 with the GitHub OAuth provider configured in `lumio/lib/auth.ts`. NextAuth handles:
- The authorization redirect to `github.com/login/oauth/authorize`
- The callback route at `/api/auth/callback/github`
- The token exchange via `github.com/login/oauth/access_token`
- Session storage (JWT containing `access_token` and `refresh_token`)
- Refresh token rotation on session access

## Why PKCE matters for Lumio

Lumio is a browser-based SPA — there's no client secret that can be kept confidential in the browser. PKCE replaces the client secret with a per-request challenge/verifier pair. Without PKCE, an attacker who intercepts the authorization code (via a malicious redirect URI or browser extension) could exchange it for tokens. With PKCE, the code is useless without the `code_verifier` that was only ever in the legitimate app.

## Refresh token rotation

NextAuth rotates refresh tokens on each use — when the access token expires, the refresh token is exchanged for a new access token + new refresh token. The old refresh token is invalidated. If a user revokes access from their GitHub account settings, the next refresh attempt returns `RefreshAccessTokenError` — NextAuth clears the session and logs the user out.

## M17 vs M66 distinction

- **M17**: Automates the user experience of the OAuth login. Tests that clicking "Sign in with GitHub", completing the provider flow, and landing on `/dashboard` works end-to-end. Requires either a real test account or a stub provider.
- **M66**: Tests the OAuth protocol implementation. Verifies PKCE parameters, token response handling, refresh token rotation, and error recovery. Uses `page.route()` to mock the provider entirely — no test account needed.
