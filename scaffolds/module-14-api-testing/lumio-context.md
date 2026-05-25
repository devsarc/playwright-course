# Lumio Context: M14

## API endpoints tested

| Endpoint | Method | Auth | Expected status |
|----------|--------|------|----------------|
| `/api/projects?workspaceId=test-workspace` | GET | None | 401 |
| `/api/tasks` | POST | Cookie | 201 |
| `/api/tasks/:id` | DELETE | Cookie | 200 |

## Auth approach at M14

At M14, we get an auth cookie by posting to NextAuth's credentials endpoint:

```typescript
await request.post('/api/auth/callback/credentials', {
  form: { email, password, callbackUrl: '/dashboard' },
});
```

This is a lower-level approach than M16's `storageState` pattern. It works but
requires extracting the session cookie from the `set-cookie` header manually.
M16 replaces this with `page.context().storageState()` — much simpler.

## Seed data dependency

The POST and DELETE tests use `projectId: 'seed-project-001'`. This project
ID must exist in the test database. It's created by `npm run db:seed --prefix lumio`.

If the seed hasn't been run, the POST will return 404 (project not found).

## `request` vs `page`

The `request` fixture sends HTTP requests without a browser. It's:
- **Fast** — no browser overhead, no rendering
- **Direct** — tests API contracts without UI involvement
- **Appropriate for setup** — create test data via API in `beforeAll`, not via UI

Use `page` when you need to test UI behavior. Use `request` when you're
testing the API itself or setting up state efficiently.
