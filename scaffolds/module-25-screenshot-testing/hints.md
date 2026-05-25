# M25 Hints

## TODO 1 — full-page screenshot with path

```typescript
const buffer = await page.screenshot({
  fullPage: true,
  path: path.join(screenshotsDir, 'dashboard-full.png'),
});
```

## TODO 2 — assert buffer is truthy

```typescript
expect(buffer).toBeTruthy();
```

## TODO 3 — viewport-only screenshot with path

```typescript
const buffer = await page.screenshot({
  path: path.join(screenshotsDir, 'dashboard-viewport.png'),
});
```

## TODO 4 — assert buffer is truthy

```typescript
expect(buffer).toBeTruthy();
```

## TODO 5 — element-level screenshot

```typescript
const buffer = await taskCard.screenshot({
  path: path.join(screenshotsDir, 'task-card.png'),
});
```

## TODO 6 — assert buffer byte length

```typescript
expect(buffer.length).toBeGreaterThan(0);
```

## TODO 7 — clip region

```typescript
const buffer = await page.screenshot({
  clip: { x: 0, y: 0, width: 1280, height: 80 },
  path: path.join(screenshotsDir, 'header-clip.png'),
});
```

## TODO 8 — assert buffer is truthy

```typescript
expect(buffer).toBeTruthy();
```

## Bonus: JPEG format with quality

To produce a smaller file, use `type: 'jpeg'` and set a `quality` value:

```typescript
const buffer = await page.screenshot({
  clip: { x: 0, y: 0, width: 1280, height: 80 },
  path: path.join(screenshotsDir, 'header-clip.jpg'),
  type: 'jpeg',
  quality: 80,
});
expect(buffer).toBeTruthy();
```

Compare the file sizes of `header-clip.png` and `header-clip.jpg` — JPEG is
typically 3–10× smaller for photographic content.

## Bonus: automatic screenshots on failure

Add this to the `use` block in `playwright.config.ts` to capture a screenshot
whenever a test fails:

```typescript
use: {
  screenshot: 'only-on-failure',
},
```

Playwright saves the image to `test-results/` and attaches it to the HTML
report automatically — no manual `page.screenshot()` call needed.

## Bonus: PDF export (Chromium only)

```typescript
await page.pdf({
  path: path.join(screenshotsDir, 'dashboard.pdf'),
  format: 'A4',
  printBackground: true,
});
```

Note: `page.pdf()` throws in Firefox and WebKit. Only use it in Chromium
projects or guard it with `test.skip(browserName !== 'chromium', '...')`.
