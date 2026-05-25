# M83 Hints

## TODO 1 — toBeVisible() assertion

```typescript
await expect(firstCard).toBeVisible();
```

`toBeHidden()` fails because the first task card IS visible on the kanban board. The comparison point: Playwright auto-waits for the element to be visible before the assertion runs — you don't need to call `waitForSelector` first. In Puppeteer, you'd write `await page.waitForSelector('[role="article"]', { visible: true })` before accessing the element.

## TODO 2 — intercepted is true

```typescript
expect(intercepted).toBe(true);
```

`false` always fails. `page.route()` intercepts the matching request and sets `intercepted = true`. In Puppeteer's equivalent, you'd enable request interception globally with `page.setRequestInterception(true)`, which blocks ALL requests until explicitly continued — requiring more careful management to avoid hanging requests.

## TODO 3 — Cookies greater than 0

```typescript
expect(cookies.length).toBeGreaterThan(0);
```

`999` always fails. The login in `beforeEach` sets a session cookie. In Playwright, each test gets a fresh `BrowserContext` with isolated cookies and storage. In Puppeteer, you manually create an incognito context or manage cookie state between tests — there's no automatic test isolation.

## TODO 4 — Browser engine regex

```typescript
expect(browserName).toMatch(/chromium|firefox|webkit/);
```

`/PLACEHOLDER/` won't match any engine name. This is the critical Playwright advantage over Puppeteer: the same test runs on three browser engines without code changes. In Puppeteer, `browserName` doesn't exist — you're always in Chromium.

## TODO 5 — Buffer instance

```typescript
expect(pdfBuffer).toBeInstanceOf(Buffer);
```

`Array` is not the same as `Buffer`. `page.pdf()` returns a Node.js `Buffer` containing the raw PDF bytes. This is Chromium-only in both Playwright and Puppeteer — the API is identical in both tools, making this one area where Puppeteer and Playwright are completely interchangeable.

## TODO 6 — Links length greater than 0

```typescript
expect(links.length).toBeGreaterThan(0);
```

`999` always fails — the nav has a small number of links (4–6). The `evaluateAll()` method is Playwright's equivalent of Puppeteer's `$$eval()`. The main difference: Playwright's version is scoped to a locator (`nav a`), while Puppeteer's is called on `page` with a full selector string.
