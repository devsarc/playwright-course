# Lumio Context: M05

## Pages used in M05

- `/` — landing page (starting point for reload, goBack/goForward)
- `/pricing` — destination after clicking the Pricing nav link
- `/docs` — standalone docs page (has an h1)
- `/login` — used for waitForURL (login redirects to /dashboard) and waitForResponse

## Navigation targets

| Test | Action | Verification |
|------|--------|-------------|
| goto | `page.goto('/docs')` | h1 is visible |
| reload | `page.reload()` | h1 persists after reload |
| goBack/goForward | click Pricing → goBack → goForward | URL matches each destination |
| waitForURL | submit login form | URL changes to /dashboard |
| waitForLoadState | `page.goto('/')` + waitForLoadState | h1 visible after load event |
| waitForResponse | `page.waitForResponse(/\/api\//)` | response received on /login load |

## Important: `waitForResponse` setup order

The `waitForResponse` promise **must be created before** the action that triggers
the request. If you create it after `page.goto('/login')`, the response may have
already arrived and the promise will never resolve (causing a timeout).

```typescript
// Correct — promise created before navigation
const responsePromise = page.waitForResponse(/\/api\//);
await page.goto('/login');
const response = await responsePromise;

// Wrong — response may already be gone
await page.goto('/login');
const responsePromise = page.waitForResponse(/\/api\//); // may timeout
```
