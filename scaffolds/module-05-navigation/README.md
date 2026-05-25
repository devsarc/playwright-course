# M05: Navigation & Page State

## Learning Objectives

- Navigate programmatically with `goto`, `reload`, `goBack`, `goForward`
- Explain when `waitForURL` is needed vs when click-based navigation is sufficient
- Choose between `'domcontentloaded'`, `'load'`, and `'networkidle'` for `waitForLoadState`
- Use `waitForResponse` to synchronize tests with specific API calls

## Concept

Most navigation in Playwright tests happens automatically. When you `click()` a link, Playwright waits for the resulting navigation to complete before moving to the next line. You don't need to `waitForURL` after every click — auto-wait handles it.

The explicit navigation APIs exist for situations where navigation is triggered by *non-Playwright code*: a JavaScript redirect after a timer fires, a WebSocket message that triggers a route change, or a server-side redirect that happens before the page returns.

### `goto`, `reload`, `goBack`, `goForward`

These are the direct navigation methods. They all return a promise that resolves when the browser has loaded the new page (specifically, when the `load` event fires by default).

`page.goto(url, { waitUntil: 'domcontentloaded' })` is faster than the default if you don't need images and stylesheets to load before interacting. For Next.js apps like Lumio, the default `'load'` is usually fine.

### `waitForURL`

Use `waitForURL` after actions that trigger client-side navigation when you want to explicitly assert the destination. It's also useful when the navigation happens indirectly — for example, a form submission that redirects to `/dashboard` after an API call succeeds:

```typescript
await page.getByRole('button', { name: 'Sign in' }).click();
await page.waitForURL(/dashboard/, { timeout: 10_000 });
```

The timeout here is generous (10 seconds) because network + auth + redirect can be slow in tests.

### `waitForLoadState`

Three states to know:

- **`'domcontentloaded'`** — HTML is parsed, the DOM is ready, but images and external resources may still be loading. Fast.
- **`'load'`** — All resources (images, stylesheets, scripts) have loaded. This is the default for `page.goto`.
- **`'networkidle'`** — No outgoing network requests for 500ms. Useful for SPAs that load data asynchronously after the initial page load. Slower and potentially flaky if the app makes periodic requests.

Don't use `'networkidle'` unless you need it — it's slower and can cause intermittent timeouts if the app polls the server.

### `waitForResponse`

`waitForResponse` lets you wait for a specific HTTP response, identified by URL pattern or a predicate function. The critical rule: **create the promise before the action that triggers the request.**

```typescript
const responsePromise = page.waitForResponse(/\/api\/auth/);
await page.getByRole('button', { name: 'Sign in' }).click();
const response = await responsePromise;
expect(response.status()).toBe(200);
```

If you create the promise after the action, the response may have already arrived and the promise never resolves.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Complete each TODO in `exercise.spec.ts`.
```bash
npx playwright test tests/module-05-navigation --headed
```

## Key Takeaways

1. `click()` auto-waits for navigation — you don't need `waitForURL` after every click.
2. `waitForURL` is for navigation triggered by non-Playwright code (redirects, timers).
3. Prefer `'domcontentloaded'` for speed; use `'networkidle'` only when SPAs load data after render.
4. Create `waitForResponse` promises **before** the action that triggers the request.
5. `goBack()` and `goForward()` test browser history — relevant for multi-step flows.

## Going Deeper

- [Playwright docs: Navigation](https://playwright.dev/docs/navigations)
- [Playwright docs: waitForResponse](https://playwright.dev/docs/api/class-page#page-wait-for-response)
