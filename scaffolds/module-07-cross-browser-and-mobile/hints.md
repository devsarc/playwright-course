# Lesson 07 Hints

## Part 1 — Cross-Browser Testing Strategy (formerly M34)

### TODO 1.1 — Navigate and annotate with browserName

```typescript
await page.goto('/');
await test.info().annotations.push({ type: 'browser', description: browserName });
```

`browserName` is injected by Playwright from the active project configuration. Its value is `'chromium'`, `'firefox'`, or `'webkit'`.

### TODO 1.2 — Assert title across browsers

```typescript
await expect(page).toHaveTitle(/Lumio/);
```

A regex match is more resilient than an exact string — the title may vary slightly (e.g., "Lumio — Team Productivity" vs "Lumio") but the brand name will always be present.

### TODO 1.3 — Skip on non-Chromium browsers

```typescript
test.skip(browserName !== 'chromium', 'page.pdf() is Chromium-only');
```

`test.skip(condition, reason)` marks the test as skipped in the HTML report with the reason visible. Using `if (browserName !== 'chromium') return;` would instead show the test as passed, hiding the intentional skip.

### TODO 1.4 — Assert PDF buffer

```typescript
expect(pdfBuffer).toBeTruthy();
expect(pdfBuffer.length).toBeGreaterThan(0);
```

`page.pdf()` returns a `Buffer`. A buffer with length > 0 confirms the PDF was generated.

### TODO 1.5 — Fill date input

```typescript
await dueDateInput.fill('2025-06-15');
```

The ISO 8601 format `YYYY-MM-DD` is what `<input type="date">` stores internally, regardless of how the browser displays it (e.g., `06/15/2025` in the US locale).

### TODO 1.6 — Assert date value

```typescript
await expect(dueDateInput).toHaveValue('2025-06-15');
```

If this fails on WebKit, the workaround is to use `page.evaluate()` to set the value directly:
```typescript
if (browserName === 'webkit') {
  await page.evaluate(([el, val]) => {
    (el as HTMLInputElement).value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, [await dueDateInput.elementHandle(), '2025-06-15']);
}
```
This bypasses WebKit's stricter date input parsing.

### TODO 1.7 — Grant clipboard permissions

```typescript
await context.grantPermissions(['clipboard-read', 'clipboard-write']);
```

`context.grantPermissions()` sets permissions for the entire browser context before any page navigation. Call it before `page.goto()`. Chromium ignores redundant grants; WebKit and Firefox enforce them.

### TODO 1.8 — Read clipboard text

```typescript
const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
expect(clipboardText).toContain('task');
```

`navigator.clipboard.readText()` is async and returns a Promise — `page.evaluate()` automatically awaits it. The permission granted in TODO 1.7 is what allows this to succeed on WebKit.

## Part 2 — Mobile Emulation & Responsive Testing (formerly M35)

### TODO 2.1 — Create iPhone 14 context

```typescript
const context = await browser.newContext({ ...devices['iPhone 14'] });
```

`devices['iPhone 14']` expands to `{ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: '...Safari...' }`. Spreading it into `newContext()` applies all these settings at once.

### TODO 2.2 — Assert desktop nav is hidden

```typescript
await expect(page.getByTestId('desktop-nav')).not.toBeVisible();
```

`not.toBeVisible()` passes if the element is hidden by CSS (`display: none`, `visibility: hidden`, or `opacity: 0`) or if it is outside the viewport. At 390px, the desktop nav uses `display: none` via Tailwind's responsive prefix (`md:flex` → hidden below `md`).

### TODO 2.3 — Assert hamburger button is visible

```typescript
await expect(page.getByRole('button', { name: /menu/i })).toBeVisible();
```

The regex `/menu/i` matches "Menu", "Open menu", "Toggle menu", etc. — resilient to copy changes.

### TODO 2.4 — Assert nav links visible after clicking hamburger

```typescript
const nav = page.getByRole('navigation');
await expect(nav.getByRole('link', { name: 'Pricing' })).toBeVisible();
```

Chaining `getByRole` on `nav` scopes the search to inside the `<nav>` element. This prevents false matches if "Pricing" text appears elsewhere on the page (e.g., pricing section headings).

### TODO 2.5 — Activate dark mode

```typescript
await page.emulateMedia({ colorScheme: 'dark' });
```

Call this after `page.goto()` so the page is loaded before the media query changes. The browser recalculates styles immediately — no reload needed.

### TODO 2.6 — Read computed background color

```typescript
const bgColor = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
expect(bgColor).not.toBe('rgb(255, 255, 255)');
```

`getComputedStyle()` returns resolved values. In dark mode Lumio uses a dark background (e.g., `rgb(15, 23, 42)` for Tailwind's `slate-950`). The assertion is intentionally loose — checking "not white" is more resilient than hardcoding the exact dark color, which may change with design updates.

### TODO 2.7 — Switch to print media

```typescript
await page.emulateMedia({ media: 'print' });
```

`media: 'print'` activates `@media print` stylesheets. `media: 'screen'` switches back to normal. Both can be called multiple times in the same test.

### TODO 2.8 — Assert nav hidden in print mode

```typescript
await expect(page.getByTestId('desktop-nav')).not.toBeVisible();
```

Lumio's print stylesheet sets `nav { display: none }` to avoid printing navigation chrome. This is the same assertion as TODO 2.2 but triggered by print media rather than viewport width.

### TODO 2.9 — Rotate to landscape

```typescript
await page.setViewportSize({ width: 844, height: 390 });
const landscapeViewport = page.viewportSize();
expect(landscapeViewport!.width).toBeGreaterThan(landscapeViewport!.height);
```

The non-null assertion `!` is needed because `viewportSize()` can theoretically return `null` (in headless contexts without a set viewport). After `setViewportSize()`, it is guaranteed non-null.

## Part 3 — Geolocation, Permissions & Device APIs (formerly M36)

### TODO 3.1 — Grant geolocation permission

```typescript
await context.grantPermissions(['geolocation']);
```

The permission string `'geolocation'` matches the Permissions API name. You can also scope it to a specific origin: `context.grantPermissions(['geolocation'], { origin: 'http://localhost:3000' })`.

### TODO 3.2 — Set fake geolocation

```typescript
await context.setGeolocation({ latitude: 48.8566, longitude: 2.3522 });
```

`setGeolocation` requires `grantPermissions(['geolocation'])` to have been called first — otherwise the browser still returns a permission denied error even with coordinates set.

### TODO 3.3 — Assert timezone value

```typescript
await expect(timezoneInput).toHaveValue('Europe/Paris');
```

Lumio derives the IANA timezone string (`Europe/Paris`) from the coordinates via a server-side reverse geocoding call or a client-side timezone library like `geotz`.

### TODO 3.4 — Clear permissions

```typescript
await context.clearPermissions();
```

`clearPermissions()` takes no arguments — it resets ALL permissions for the context to their default (denied in headless mode). Call it before the action that triggers the permission check.

### TODO 3.5 — Assert error message

```typescript
await expect(page.getByRole('alert')).toContainText('Location access denied');
```

Lumio shows the error in a `role="alert"` element that appears after the failed geolocation call. `toContainText` is more resilient than `toHaveText` — it passes as long as the string appears anywhere in the element, even if surrounding text changes.

### TODO 3.6 — Create context with timezone

```typescript
const context = await browser.newContext({ timezoneId: 'America/New_York' });
```

`timezoneId` takes an IANA timezone string. Unlike `setGeolocation`, timezone is set at context creation time and cannot be changed mid-context. If you need a different timezone, create a new context.

### TODO 3.7 — Assert date is truthy

```typescript
expect(displayedDate?.trim()).toBeTruthy();
```

For a more precise assertion, compare to today's date formatted in New York timezone:
```typescript
const expected = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  year: 'numeric', month: 'long', day: 'numeric'
}).format(new Date());
expect(displayedDate?.trim()).toBe(expected);
```

### TODO 3.8 — Grant camera permission

```typescript
await context.grantPermissions(['camera']);
```

For camera + microphone together (e.g., video call features): `context.grantPermissions(['camera', 'microphone'])`.

### TODO 3.9 — Assert button is visible

```typescript
await expect(takePhotoButton).toBeVisible();
```

The `Take photo` button is conditionally rendered only when the browser reports that camera access is available. Without the permission grant, the button would not appear in the DOM.

## Part 4 — Offline, PWA & Service Workers (formerly M37)

### TODO 4.1 — waitForEvent('serviceworker')

```typescript
const [sw] = await Promise.all([
  context.waitForEvent('serviceworker'),
  page.goto('/'),
]);
```

### TODO 4.2 — assert SW URL

```typescript
expect(sw.url()).toContain('sw.js');
```

### TODO 4.3 — serviceWorkers list

```typescript
const workers = context.serviceWorkers();
expect(workers.length).toBeGreaterThan(0);
```

### TODO 4.4 — go offline

```typescript
await context.setOffline(true);
```

### TODO 4.5 — offline banner

```typescript
await page.reload();
await expect(page.getByTestId('offline-banner')).toBeVisible();
```

### TODO 4.6 — cached content still visible

```typescript
await page.goto('/projects/demo/board');
await page.waitForTimeout(1000);
await context.setOffline(true);
await page.reload();
await expect(page.getByTestId('kanban-column-todo')).toBeVisible();
```

### TODO 4.7 — back online

```typescript
await context.setOffline(false);
await page.reload();
await expect(page.getByTestId('offline-banner')).not.toBeVisible();
```
