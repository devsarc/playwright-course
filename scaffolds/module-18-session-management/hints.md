# M18 Hints

## TODO 1 — `localStorage.setItem` via `evaluate`

```typescript
await page.evaluate(() => localStorage.setItem('theme', 'dark'));
```

## TODO 2 — `page.reload()`

```typescript
await page.reload();
```

localStorage persists across page reloads (same origin). Reloading verifies the app
reads the stored value on startup.

## TODO 3 — Read from localStorage

```typescript
const theme = await page.evaluate(() => localStorage.getItem('theme'));
expect(theme).toBe('dark');
```

## TODO 4 — `context.addCookies()`

```typescript
await context.addCookies([{
  name: 'test-session',
  value: 'abc123',
  domain: 'localhost',
  path: '/',
}]);
```

All four fields (name, value, domain, path) are required. For `localhost`, use
`'localhost'` as the domain — not `'http://localhost:3000'`.

## TODO 5 — `context.cookies()`

```typescript
const cookies = await context.cookies();
```

`context.cookies()` returns all cookies for all domains in the context.
Pass a URL to filter: `context.cookies('http://localhost:3000')`.

## TODO 6 — `context.storageState()`

```typescript
const snapshot = await context.storageState();
```

Returns `{ cookies: Cookie[], origins: { origin: string, localStorage: [...] }[] }`.

## TODO 7 — `context.clearCookies()`

```typescript
await context.clearCookies();
```

## TODO 8 — `toHaveLength(0)`

```typescript
expect(cookies).toHaveLength(0);
```
