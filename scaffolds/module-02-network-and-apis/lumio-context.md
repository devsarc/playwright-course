# Lumio Context: Lesson 02

## Part 1 — Network Interception & Mocking (formerly M12)

### APIs intercepted in M12

| Pattern | Method | Test purpose |
|---------|--------|-------------|
| `/api/projects*` | GET | Return mocked project list |
| `/api/workspaces` | POST | Simulate 500 error |
| `/api/*` | ALL | Abort (network failure) |
| `/api/**` | ALL | Inject request header |

### The workspace creation form

`/onboarding/workspace` has:
- `<label>Workspace name</label>` + input
- `<label>URL slug</label>` + input
- `<button>Create workspace</button>`
- `<div role="alert">` rendered on API errors

When the POST to `/api/workspaces` returns 500, the form renders an alert
with an error message. That's what TODO 1.3 asserts.

### `page.route` vs `context.route`

- `page.route(pattern, handler)` — intercepts requests from this page only
- `context.route(pattern, handler)` — intercepts requests from ALL pages in the context

For most tests, `page.route` is sufficient. Use `context.route` when you have
multiple pages open (popup windows, new tabs) and want to intercept all of them.

### Route priority

Routes are matched in the order they were registered. The first matching route
handles the request. If no route matches, the request goes to the server normally.
Use `page.unroute(pattern)` to remove a route, or `page.unrouteAll()` to remove all.

## Part 2 — Advanced Network Patterns (formerly M13)

### Feature flags in Lumio

Lumio's AI chat feature (added in Part 4) is toggled by a server-side flag.
In production, this flag comes from the database. In tests, `addInitScript` lets
you inject the flag before the page loads — no database call needed.

This is a common pattern for feature-flag-heavy applications: test the UI in
both enabled and disabled states by injecting the flag, not by seeding the database.

### The login flow and `/api/auth`

The `page.on('request')` test triggers a login. NextAuth's credentials provider
makes a POST to `/api/auth/callback/credentials`. This is the request we're
monitoring.

The URL collected by the listener will look like:
```
http://localhost:3000/api/auth/callback/credentials
```

The `includes('/api/auth')` check matches this regardless of the exact path.

### `setOffline` vs `route.abort`

| | `context.setOffline(true)` | `route.abort()` |
|--|--------------------------|----------------|
| Scope | ALL network activity | Only matching routes |
| Level | OS-level simulation | Application-level interception |
| Use case | PWA offline mode, service worker testing | Specific API error simulation |

For Lumio's PWA/service worker (added in Part 4), `setOffline` is the right
tool to test offline behavior — it triggers the service worker's fetch event
just like a real network failure would.

## Part 3 — API Testing with request Fixture (formerly M14)

### API endpoints tested

| Endpoint | Method | Auth | Expected status |
|----------|--------|------|----------------|
| `/api/projects?workspaceId=test-workspace` | GET | None | 401 |
| `/api/tasks` | POST | Cookie | 201 |
| `/api/tasks/:id` | DELETE | Cookie | 200 |

### Auth approach at M14

At M14, we get an auth cookie by posting to NextAuth's credentials endpoint:

```typescript
await request.post('/api/auth/callback/credentials', {
  form: { email, password, callbackUrl: '/dashboard' },
});
```

This is a lower-level approach than M16's `storageState` pattern. It works but
requires extracting the session cookie from the `set-cookie` header manually.
M16 replaces this with `page.context().storageState()` — much simpler.

### Seed data dependency

The POST and DELETE tests use `projectId: 'seed-project-001'`. This project
ID must exist in the test database. It's created by `npm run db:seed --prefix lumio`.

If the seed hasn't been run, the POST will return 404 (project not found).

### `request` vs `page`

The `request` fixture sends HTTP requests without a browser. It's:
- **Fast** — no browser overhead, no rendering
- **Direct** — tests API contracts without UI involvement
- **Appropriate for setup** — create test data via API in `beforeAll`, not via UI

Use `page` when you need to test UI behavior. Use `request` when you're
testing the API itself or setting up state efficiently.

## Part 4 — HAR Recording & Network Analysis (formerly M15)

### What gets captured in the HAR

When you record the landing page (`/`), the HAR captures:
- The initial HTML document request
- All static assets (JS bundles, CSS, fonts, images)
- Any API calls made during page load

For Lumio's landing page, there are no authenticated API calls — it's a static
Next.js page. The HAR will mostly contain the document and asset requests.

### The HAR file location

The HAR is written to `tests/module-02-network-and-apis/lumio-landing.har`.
This file is excluded from git (add it to `.gitignore`) — it's a local artifact,
not part of the source code.

### When HAR replay is useful

HAR replay shines for:
- **Snapshots of third-party APIs** — record once, replay without network in CI
- **Performance baselines** — compare load times with and without certain resources
- **Offline development** — work on the app without a running backend for static pages

For Lumio specifically, HAR replay is less useful for authenticated pages because
the session cookie in the HAR is test-specific. It's most useful for public pages
(landing, pricing, docs) that don't change based on auth state.

### `.gitignore` recommendation

Add to `.gitignore`:
```
tests/**/*.har
```

HAR files can contain sensitive data (cookies, tokens in request headers) and
are often large. They should not be committed to source control.
