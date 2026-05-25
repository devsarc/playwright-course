# Lumio Context: M19

## Protected routes in Lumio

| Route | Unauthenticated | Member | Admin |
|-------|----------------|--------|-------|
| `/dashboard` | → /login | ✓ | ✓ |
| `/admin` | → /login | → /dashboard | ✓ |
| `/api/workspaces` (GET) | 401 | ✓ (own workspaces) | ✓ |
| `/api/admin/users` (GET) | 401 | 403 | ✓ |

## How Lumio enforces these rules

**Route-level protection** is in Next.js middleware (`lumio/middleware.ts`):
- If no session: redirect to `/login`
- If session but not admin and route matches `/admin/*`: redirect to `/dashboard`

**API-level protection** is in each route handler:
- Check `getServerSession()` — returns null if unauthenticated → return 401
- Check `session.user.role === 'admin'` — if not admin → return 403

## The `request` vs `page.request` distinction

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

## Why security tests matter

Security tests document your access control rules as executable specifications.
When a developer adds a new API endpoint or route, the security test suite tells
them immediately if they forgot to add authentication or authorization checks.
