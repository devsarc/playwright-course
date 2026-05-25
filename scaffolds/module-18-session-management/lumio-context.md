# Lumio Context: M18

## localStorage in Lumio

Lumio uses localStorage for:
- **Theme preference** (`theme`: `'light'` | `'dark'`) — persists across sessions
- **Sidebar collapsed state** — UI preference
- **Draft content** — TipTap editor autosave (kanban card descriptions)

Testing that localStorage values persist across reloads is important for these
features — a dark mode toggle that resets on refresh would be a bug.

## Cookies in Lumio

The main cookie in Lumio is `next-auth.session-token` — the NextAuth session cookie
that authenticates the user. This is set by NextAuth after login and cleared on logout.

Other cookies:
- `next-auth.csrf-token` — CSRF protection for NextAuth endpoints
- `next-auth.callback-url` — where NextAuth redirects after login

## The `clearCookies` pattern for sign-out testing

To test the sign-out flow, you can:
1. Log in (use storageState from M16)
2. Clear cookies with `context.clearCookies()`
3. Navigate to `/dashboard`
4. Assert redirect to `/login`

This simulates what happens when a session expires — the cookie is gone, so the
app redirects to login. It's faster than clicking the sign-out button (which triggers
a NextAuth API call) and tests the same access control.

## `storageState()` vs `context.cookies()`

| | `storageState()` | `context.cookies()` |
|--|-----------------|-------------------|
| Returns | Cookies + localStorage | Cookies only |
| Use case | Snapshot for auth reuse (M16) | Inspect specific cookies |
| Takes path param | Yes (saves to file) | No |
