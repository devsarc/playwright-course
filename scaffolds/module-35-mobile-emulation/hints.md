# M35 Hints

## TODO 1 — Create iPhone 14 context

```typescript
const context = await browser.newContext({ ...devices['iPhone 14'] });
```

`devices['iPhone 14']` expands to `{ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: '...Safari...' }`. Spreading it into `newContext()` applies all these settings at once.

## TODO 2 — Assert desktop nav is hidden

```typescript
await expect(page.getByTestId('desktop-nav')).not.toBeVisible();
```

`not.toBeVisible()` passes if the element is hidden by CSS (`display: none`, `visibility: hidden`, or `opacity: 0`) or if it is outside the viewport. At 390px, the desktop nav uses `display: none` via Tailwind's responsive prefix (`md:flex` → hidden below `md`).

## TODO 3 — Assert hamburger button is visible

```typescript
await expect(page.getByRole('button', { name: /menu/i })).toBeVisible();
```

The regex `/menu/i` matches "Menu", "Open menu", "Toggle menu", etc. — resilient to copy changes.

## TODO 4 — Assert nav links visible after clicking hamburger

```typescript
const nav = page.getByRole('navigation');
await expect(nav.getByRole('link', { name: 'Pricing' })).toBeVisible();
```

Chaining `getByRole` on `nav` scopes the search to inside the `<nav>` element. This prevents false matches if "Pricing" text appears elsewhere on the page (e.g., pricing section headings).

## TODO 5 — Activate dark mode

```typescript
await page.emulateMedia({ colorScheme: 'dark' });
```

Call this after `page.goto()` so the page is loaded before the media query changes. The browser recalculates styles immediately — no reload needed.

## TODO 6 — Read computed background color

```typescript
const bgColor = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
expect(bgColor).not.toBe('rgb(255, 255, 255)');
```

`getComputedStyle()` returns resolved values. In dark mode Lumio uses a dark background (e.g., `rgb(15, 23, 42)` for Tailwind's `slate-950`). The assertion is intentionally loose — checking "not white" is more resilient than hardcoding the exact dark color, which may change with design updates.

## TODO 7 — Switch to print media

```typescript
await page.emulateMedia({ media: 'print' });
```

`media: 'print'` activates `@media print` stylesheets. `media: 'screen'` switches back to normal. Both can be called multiple times in the same test.

## TODO 8 — Assert nav hidden in print mode

```typescript
await expect(page.getByTestId('desktop-nav')).not.toBeVisible();
```

Lumio's print stylesheet sets `nav { display: none }` to avoid printing navigation chrome. This is the same assertion as TODO 2 but triggered by print media rather than viewport width.

## TODO 9 — Rotate to landscape

```typescript
await page.setViewportSize({ width: 844, height: 390 });
const landscapeViewport = page.viewportSize();
expect(landscapeViewport!.width).toBeGreaterThan(landscapeViewport!.height);
```

The non-null assertion `!` is needed because `viewportSize()` can theoretically return `null` (in headless contexts without a set viewport). After `setViewportSize()`, it is guaranteed non-null.
