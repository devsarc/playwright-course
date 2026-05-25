# M43 Hints

## TODO 1 — start tracing

```typescript
await context.tracing.start({ screenshots: true, snapshots: true });
```

## TODO 2 — stop tracing

```typescript
await context.tracing.stop({ path: 'test-results/traces/board-interaction.zip' });
```

View the trace:
```bash
npx playwright show-trace test-results/traces/board-interaction.zip
```

## TODO 3 — console listener

```typescript
const messages: string[] = [];
page.on('console', msg => messages.push(msg.text()));
```

## TODO 4 — evaluate console.log

```typescript
await page.evaluate(() => console.log('debug-marker-12345'));
expect(messages.some(m => m.includes('debug-marker-12345'))).toBe(true);
```

## TODO 5 — pageerror listener

```typescript
const errors: Error[] = [];
page.on('pageerror', err => errors.push(err));
```

## TODO 6 — assert no errors

```typescript
expect(errors).toHaveLength(0);
```

## TODO 7 — screenshot on failure

```typescript
try {
  await expect(page.getByTestId('non-existent-element')).toBeVisible({ timeout: 1000 });
} catch (err) {
  await page.screenshot({ path: 'test-results/screenshots/failure-screenshot.png' });
  throw err;
}
```

## Enabling tracing in config (recommended for CI)

In `playwright.config.ts`:
```typescript
use: {
  trace: 'on-first-retry',    // capture trace only when test is retried
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```
