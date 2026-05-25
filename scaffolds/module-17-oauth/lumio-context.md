# Lumio Context: M17

## GitHub OAuth in Lumio

Lumio's login page has a "Sign in with GitHub" button. Clicking it:
1. Calls NextAuth's `/api/auth/signin/github`
2. NextAuth redirects to `https://github.com/login/oauth/authorize?client_id=...`
3. The user authorizes on GitHub
4. GitHub redirects back to `/api/auth/callback/github?code=...`
5. NextAuth exchanges the code for a token, creates/finds the user, sets the session cookie
6. NextAuth redirects to `/dashboard`

Steps 3–6 involve GitHub's servers — we can't control them in tests. That's why mocking is preferred.

## The popup pattern

NextAuth opens GitHub's authorize page in a new window (popup), not the same tab.
Playwright handles popups with `context.waitForEvent('page')`.

## Why real OAuth automation is brittle

If you automate the real GitHub OAuth flow:
- GitHub may add CAPTCHA or 2FA requirements
- GitHub UI changes break your selectors
- Tests require real GitHub credentials in CI
- Rate limiting can cause failures
- Tests are slow (external network roundtrip)

The mock approach has none of these problems.

## The callback mock

The mock intercepts `/api/auth/callback/github*` and returns a 302 redirect.
This simulates what NextAuth would do after a successful OAuth exchange,
without actually contacting GitHub or creating a real session.

For a more complete mock (that actually creates a session), you'd need to
intercept the callback and return a valid NextAuth session response — covered
in advanced OAuth testing patterns beyond M17.
