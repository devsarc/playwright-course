# Lumio Context: M12

## APIs intercepted in M12

| Pattern | Method | Test purpose |
|---------|--------|-------------|
| `/api/projects*` | GET | Return mocked project list |
| `/api/workspaces` | POST | Simulate 500 error |
| `/api/*` | ALL | Abort (network failure) |
| `/api/**` | ALL | Inject request header |

## The workspace creation form

`/onboarding/workspace` has:
- `<label>Workspace name</label>` + input
- `<label>URL slug</label>` + input
- `<button>Create workspace</button>`
- `<div role="alert">` rendered on API errors

When the POST to `/api/workspaces` returns 500, the form renders an alert
with an error message. That's what TODO 3 asserts.

## `page.route` vs `context.route`

- `page.route(pattern, handler)` — intercepts requests from this page only
- `context.route(pattern, handler)` — intercepts requests from ALL pages in the context

For most tests, `page.route` is sufficient. Use `context.route` when you have
multiple pages open (popup windows, new tabs) and want to intercept all of them.

## Route priority

Routes are matched in the order they were registered. The first matching route
handles the request. If no route matches, the request goes to the server normally.
Use `page.unroute(pattern)` to remove a route, or `page.unrouteAll()` to remove all.
