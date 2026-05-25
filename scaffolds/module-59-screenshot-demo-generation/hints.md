# M59 Hints

## TODO 1 — Numbered step screenshot path

```typescript
await page.screenshot({
  path: `${DEMO_DIR}/step-${String(++step).padStart(2, '0')}-${label}.png`,
});
```

`padStart(2, '0')` produces `01`, `02`, ..., `09`, `10` — correct alphabetical sort order.

## TODO 2 — Assert step equals 3

```typescript
expect(step).toBe(3);
```

## TODO 3 — Full page screenshot

```typescript
await page.screenshot({ path: screenshotPath, fullPage: true });
```

## TODO 4 — Mask sensitive areas

```typescript
await page.screenshot({
  path: screenshotPath,
  mask: [page.getByTestId('user-avatar')],
});
```

The masked element is replaced with a solid magenta box in the screenshot output. Use this to hide usernames, email addresses, or test credentials.

## TODO 5 — Video recording option key

```typescript
const videoOption = 'recordVideo';
```

Full context setup:
```typescript
const context = await browser.newContext({
  recordVideo: {
    dir: 'demo-videos/',
    size: { width: 1280, height: 720 },
  },
  slowMo: 500,
});
```

## TODO 6 — Recommended slowMo for demo

```typescript
const slowMoMs = 500;
```

500ms is a good baseline — it's slow enough to see each action but fast enough that a 2-minute flow produces a 3-minute video rather than a 10-minute one.

## TODO 7 — Assert waitForLoadState is a function

```typescript
expect(typeof page.waitForLoadState).toBe('function');
```
