# M70 Hints

## TODO 1 — Array length 0 assertion

```typescript
expect(found404s).toHaveLength(0);
```

`toHaveLength(0)` asserts the array is empty — no resources loaded with a 404 status. The default `999` always fails because a healthy page will never load 999 broken resources. If this assertion fails, `found404s` contains the URLs of every broken resource, making diagnosis straightforward.

## TODO 2 — request.get with the loop variable

```typescript
const response = await request.get(link);
```

Pass the `link` variable — not a hardcoded string. The `request` fixture sends a plain HTTP request without opening a browser page, making it ~10× faster than `page.goto()` for bulk link checking. The default `'/PLACEHOLDER'` returns a 404, which is not `< 400`, so the test fails.

## TODO 3 — Minimum nav link count

```typescript
expect(count).toBeGreaterThanOrEqual(3);
```

`3` is a reasonable minimum for a functioning navigation. The default `999` always fails because no site has 999 nav links. This test catches rendering failures where the nav collapses to 0 links due to a hydration error or CSS bug.

## TODO 4 — Redirect destination regex

```typescript
await expect(page).toHaveURL(/login/);
```

`/login/` matches any URL containing "login". `page.goto()` follows all redirects automatically; `toHaveURL()` asserts where the redirect chain ended. The default `/PLACEHOLDER/` won't match the actual login URL, so the test fails.

## TODO 5 — 'login' in final URL

```typescript
expect(response!.url()).toContain('login');
```

`response.url()` returns the URL of the final response after all redirects — not the originally requested `/dashboard` URL. This is complementary to `toHaveURL()`: use `response.url()` when you want the URL value before asserting other things on the page.

## TODO 6 — toBeAttached() for fragment targets

```typescript
await expect(page.locator(`#${fragment}`)).toBeAttached();
```

`toBeAttached()` verifies the element with the fragment ID exists in the DOM. Using `toBeVisible()` would fail for off-screen sections (e.g., the FAQ section below the fold). `toBeAttached()` is the correct check: the element must exist, but it doesn't need to be in the viewport.

## TODO 7 — Status less than 400

```typescript
expect(response.status()).toBeLessThan(400);
```

`< 400` accepts 200 (OK), 301 (Moved Permanently), and 302 (Found) — all valid responses for footer links. Using `=== 200` would incorrectly fail on redirected links. The default `0` always fails because no HTTP status code is less than 0.

## TODO 8 — Nonexistent page path

```typescript
const response = await request.get('/this-page-does-not-exist-xyz');
```

This test verifies that Lumio's 404 handler returns the correct HTTP status code. Some frameworks accidentally return 200 with an HTML error page in the body — search engines then index the error page as a valid content page. The default `'/'` returns 200, which is not equal to 404, so the test fails. Change it to a path that doesn't exist to verify the 404 handler is working correctly.
