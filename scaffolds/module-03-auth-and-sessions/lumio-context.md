# Lumio Context: Lesson 03

## Part 1 — Authentication Patterns (formerly M16)

### The auth state file

`.auth-state-member.json` is written by `exercise.spec.ts` (the setup step).
It contains:

```json
{
  "cookies": [
    { "name": "next-auth.session-token", "value": "...", "domain": "localhost", ... }
  ],
  "origins": [
    { "origin": "http://localhost:3000", "localStorage": [] }
  ]
}
```

The `next-auth.session-token` cookie is what authenticates the user. When Playwright
loads this storageState, it injects the cookie into the browser context before
any navigation — the app sees an authenticated user immediately.

### Why this is faster than logging in every test

A login flow takes ~500–2000ms (network round trip + NextAuth processing + redirect).
With `storageState`, the overhead is a single file read — microseconds.

For a suite with 50 authenticated tests, this saves 25–100 seconds per run.

### Setup project pattern (production approach)

In a real project, the auth setup is a Playwright "setup project":

```typescript
// playwright.config.ts
projects: [
  { name: 'setup', testMatch: '**/global.setup.ts' },
  {
    name: 'authenticated',
    use: { storageState: '.auth/member.json' },
    dependencies: ['setup'],
  },
]
```

The setup project runs first, saves the auth state. The authenticated project
depends on setup — it runs after and reuses the saved state.

### The admin auth state

M19 references `.auth-state-admin.json`. This
file would be created by an additional setup step that logs in as an admin
user. The admin setup is not implemented in M16 (which focuses on the member
flow) — it's referenced in M19 to show the
access control pattern.

## Part 2 — OAuth & SSO Flows (formerly M17)

### GitHub OAuth in Lumio

Lumio's login page has a "Sign in with GitHub" button. Clicking it:
1. Calls NextAuth's `/api/auth/signin/github`
2. NextAuth redirects to `https://github.com/login/oauth/authorize?client_id=...`
3. The user authorizes on GitHub
4. GitHub redirects back to `/api/auth/callback/github?code=...`
5. NextAuth exchanges the code for a token, creates/finds the user, sets the session cookie
6. NextAuth redirects to `/dashboard`

Steps 3–6 involve GitHub's servers — we can't control them in tests. That's why mocking is preferred.

### The popup pattern

NextAuth opens GitHub's authorize page in a new window (popup), not the same tab.
Playwright handles popups with `context.waitForEvent('page')`.

### Why real OAuth automation is brittle

If you automate the real GitHub OAuth flow:
- GitHub may add CAPTCHA or 2FA requirements
- GitHub UI changes break your selectors
- Tests require real GitHub credentials in CI
- Rate limiting can cause failures
- Tests are slow (external network roundtrip)

The mock approach has none of these problems.

### The callback mock

The mock intercepts `/api/auth/callback/github*` and returns a 302 redirect.
This simulates what NextAuth would do after a successful OAuth exchange,
without actually contacting GitHub or creating a real session.

For a more complete mock (that actually creates a session), you'd need to
intercept the callback and return a valid NextAuth session response — covered
in advanced OAuth testing patterns beyond M17.

## Part 3 — Cookie, Storage & Session Management (formerly M18)

### localStorage in Lumio

Lumio uses localStorage for:
- **Theme preference** (`theme`: `'light'` | `'dark'`) — persists across sessions
- **Sidebar collapsed state** — UI preference
- **Draft content** — TipTap editor autosave (kanban card descriptions)

Testing that localStorage values persist across reloads is important for these
features — a dark mode toggle that resets on refresh would be a bug.

### Cookies in Lumio

The main cookie in Lumio is `next-auth.session-token` — the NextAuth session cookie
that authenticates the user. This is set by NextAuth after login and cleared on logout.

Other cookies:
- `next-auth.csrf-token` — CSRF protection for NextAuth endpoints
- `next-auth.callback-url` — where NextAuth redirects after login

### The `clearCookies` pattern for sign-out testing

To test the sign-out flow, you can:
1. Log in (use storageState from Part 1 of this lesson, formerly M16)
2. Clear cookies with `context.clearCookies()`
3. Navigate to `/dashboard`
4. Assert redirect to `/login`

This simulates what happens when a session expires — the cookie is gone, so the
app redirects to login. It's faster than clicking the sign-out button (which triggers
a NextAuth API call) and tests the same access control.

### `storageState()` vs `context.cookies()`

| | `storageState()` | `context.cookies()` |
|--|-----------------|-------------------|
| Returns | Cookies + localStorage | Cookies only |
| Use case | Snapshot for auth reuse (Part 1 of this lesson, formerly M16) | Inspect specific cookies |
| Takes path param | Yes (saves to file) | No |

## Part 4 — Security Workflow Testing (formerly M19)

### Protected routes in Lumio

| Route | Unauthenticated | Member | Admin |
|-------|----------------|--------|-------|
| `/dashboard` | → /login | ✓ | ✓ |
| `/admin` | → /login | → /dashboard | ✓ |
| `/api/workspaces` (GET) | 401 | ✓ (own workspaces) | ✓ |
| `/api/admin/users` (GET) | 401 | 403 | ✓ |

### How Lumio enforces these rules

**Route-level protection** is in Next.js middleware (`lumio/middleware.ts`):
- If no session: redirect to `/login`
- If session but not admin and route matches `/admin/*`: redirect to `/dashboard`

**API-level protection** is in each route handler:
- Check `getServerSession()` — returns null if unauthenticated → return 401
- Check `session.user.role === 'admin'` — if not admin → return 403

### The `request` vs `page.request` distinction

When tests have `test.use({ storageState: MEMBER_AUTH })`, the page's context
has the session cookie. But the `request` fixture is a *separate* context —
it doesn't share cookies with the page by default.

To make authenticated API calls that share the page's session:
```typescript
// This uses the page's cookies:
const res = await page.request.get('/api/admin/users');

// This does NOT use the page's cookies (separate context):
const res = await request.get('/api/admin/users');
```

M19's test uses `page.request` implicitly — the hint clarifies this distinction.

### Why security tests matter

Security tests document your access control rules as executable specifications.
When a developer adds a new API endpoint or route, the security test suite tells
them immediately if they forgot to add authentication or authorization checks.
