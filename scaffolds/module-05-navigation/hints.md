# M05 Hints

## TODO 1 — `page.goto('/docs')`
```typescript
await page.goto('/docs');
```

## TODO 2 — `page.reload()`
```typescript
await page.reload();
```

## TODO 3 — `page.goBack()`
```typescript
await page.goBack();
```

## TODO 4 — `page.goForward()`
```typescript
await page.goForward();
```

## TODO 5 — `waitForURL`
```typescript
await page.waitForURL(/dashboard/, { timeout: 10_000 });
```
Note: the login test requires the test database to be seeded with test@lumio.dev.
Run `npm run db:seed --prefix lumio` if you haven't already.

## TODO 6 — `waitForLoadState`
```typescript
await page.waitForLoadState('domcontentloaded');
```

## TODO 7 — `waitForResponse`
```typescript
const responsePromise = page.waitForResponse(/\/api\//);
```
Create the promise BEFORE the navigation — not after. If created after,
the response may have already arrived and the promise will never resolve.
