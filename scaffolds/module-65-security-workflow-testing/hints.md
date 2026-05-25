# M65 Hints

## TODO 1 — Fresh browser context

```typescript
const freshContext = await browser.newContext();
```

Omit `storageState` entirely (don't set it to `undefined` explicitly — just don't pass it). A context with no `storageState` has no cookies, no localStorage, and no session tokens. It's the cleanest way to simulate an unauthenticated visitor.

## TODO 2 — Assert redirect to login

```typescript
await expect(freshPage).toHaveURL(/.*login.*/);
```

The regex `/.*login.*/` matches any URL containing "login" — e.g. `/login`, `/auth/login`, `/login?redirect=/dashboard`.

## TODO 3 — Assert URL does not contain /admin

```typescript
expect(page.url()).not.toContain('/admin');
```

A member redirected from `/admin` lands on `/dashboard` or gets a 403 page — either way, the URL no longer contains `/admin`.

## TODO 4 — CSRF token locator

```typescript
const csrfToken = await page.locator('input[name="csrf_token"]').inputValue();
```

Lumio embeds the CSRF token as a hidden input inside each form. `locator('input[name="csrf_token"]')` finds it by its `name` attribute.

## TODO 5 — Assert token length

```typescript
expect(csrfToken.length).toBeGreaterThan(10);
```

A real CSRF token is typically 32–64 characters (base64-encoded random bytes). Asserting length > 10 is a minimal sanity check that it's not an empty string or placeholder.

## TODO 6 — Capture CSRF header

```typescript
capturedCsrfHeader = req.headers()['x-csrf-token'] ?? '';
```

Playwright lowercases all header names. The Lumio client sends the CSRF token as `X-CSRF-Token` — access it as `x-csrf-token`.

## TODO 7 — Assert header is truthy

```typescript
expect(capturedCsrfHeader).toBeTruthy();
```

## TODO 8 — page.evaluate to read window property

```typescript
const xssExecuted = await page.evaluate(() => (window as any).__xssExecuted);
```

`page.evaluate()` runs in the browser context and returns a serializable value. If the `<script>` tag executed, `window.__xssExecuted` would be `true`. If sanitized correctly, the property doesn't exist and returns `undefined`.

## TODO 9 — Assert XSS not executed

```typescript
expect(xssExecuted).toBe(undefined);
```

`undefined` (not `null`, not `false`) — if the property was never set, `evaluate()` returns `undefined` from JavaScript.

## TODO 10 — Assert onerror not fired

```typescript
expect(imgErrorFired).toBe(undefined);
```

If React's JSX rendering sanitized the `<img>` tag (rendering it as escaped text rather than an actual `<img>` element), the `onerror` attribute never runs.

## TODO 11 — Screenshot mask

```typescript
mask: [page.getByTestId('api-key-value')],
```

`mask` accepts an array of `Locator` objects. Playwright replaces each matched element with a solid magenta rectangle in the screenshot. The element is still in the DOM — only the visual output is masked.
