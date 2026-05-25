# M17 Hints

## TODO 1 — `context.waitForEvent('page')`

```typescript
const popupPromise = page.context().waitForEvent('page');
```

Create this promise BEFORE clicking the button that opens the popup.
If created after, the popup may have already opened and the event is missed.

## TODO 2 — `.click()` on GitHub button

```typescript
await page.getByRole('button', { name: /GitHub/i }).click();
```

## TODO 3 — Await the popup

```typescript
const popup = await popupPromise;
```

The popup is a new `Page` object. You can use all Playwright APIs on it.

## TODO 4 — `waitForURL` on popup

```typescript
await popup.waitForURL(/github\.com\/login\/oauth/, { timeout: 10_000 });
```

GitHub's OAuth authorize page has multiple redirects. `waitForURL` waits until
the final URL matches the pattern.

## TODO 5 — Mock the callback with a redirect

```typescript
await route.fulfill({
  status: 302,
  headers: { Location: '/dashboard' },
});
```

A 302 redirect tells the browser to navigate to `/dashboard`. NextAuth's callback
normally processes the OAuth code from GitHub, but our mock skips that and redirects
directly — simulating what a successful OAuth flow would do.
