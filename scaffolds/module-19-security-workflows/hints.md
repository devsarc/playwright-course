# M19 Hints

## TODO 1 — Unauthenticated redirect to /login

```typescript
await expect(page).toHaveURL(/\/login/);
```

The app's middleware redirects unauthenticated requests for protected routes to `/login`.

## TODO 2 — Admin redirect to /login when unauthenticated

```typescript
await expect(page).toHaveURL(/\/login/);
```

Same pattern as TODO 1 — unauthenticated users can't access `/admin`.

## TODO 3 — 401 on /api/workspaces

```typescript
const res = await request.get('/api/workspaces');
expect(res.status()).toBe(401);
```

## TODO 4 — Member redirect from /admin to /dashboard

```typescript
await expect(page).toHaveURL(/\/dashboard/);
```

The app distinguishes between unauthenticated (→ /login) and unauthorized (→ /dashboard).
A logged-in member accessing `/admin` is redirected to `/dashboard`, not to `/login`.

## TODO 5 — 403 on admin API endpoint

```typescript
const res = await request.get('/api/admin/users');
expect(res.status()).toBe(403);
```

Note: The `request` fixture doesn't automatically inherit the page's session cookie.
The `await page.goto('/dashboard')` before this call is intentional — it ensures
the context has the auth cookies loaded. However, the `request` fixture is a separate
context. For authenticated `request` calls, use `page.request` instead:

```typescript
const res = await page.request.get('/api/admin/users');
```

`page.request` shares the same cookies as the page, so it uses the member's session.
