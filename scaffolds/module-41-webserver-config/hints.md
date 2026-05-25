# M41 Hints

## TODO 1 — Assert webServer key

```typescript
expect(configContent).toContain('webServer');
```

## TODO 2 — Assert Lumio command

```typescript
expect(configContent).toContain('lumio');
```

The full command in `playwright.config.ts` is `'npm run dev --prefix lumio'`. The string `'lumio'` is a substring match that's resilient to minor formatting changes.

## TODO 3 — Assert reuseExistingServer

```typescript
expect(configContent).toContain('reuseExistingServer');
```

The correct production value in `playwright.config.ts`:
```typescript
webServer: {
  command: 'npm run dev --prefix lumio',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
  timeout: 120_000,
}
```

## TODO 4 — Assert .env.test.example exists

```typescript
expect(existsSync(examplePath)).toBe(true);
```

## TODO 5 — Assert DATABASE_URL documented

```typescript
expect(exampleContent).toContain('DATABASE_URL');
```

The `.env.test.example` should include:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lumio_test
```

## TODO 6 — Assert BASE_URL documented

```typescript
expect(exampleContent).toContain('BASE_URL');
```

The `.env.test.example` should include:
```
BASE_URL=http://localhost:3000
```

## TODO 7 — Navigate and assert title

```typescript
await page.goto('/');
await expect(page).toHaveTitle(/Lumio/);
```

`page.goto('/')` uses the `baseURL` from `playwright.config.ts`, which reads `process.env.BASE_URL ?? 'http://localhost:3000'`. Changing `BASE_URL` in `.env.test` changes where all tests point without modifying any test code.

## TODO 8 — Assert timeout value

```typescript
const hasTimeout = configContent.includes('120_000') || configContent.includes('120000');
expect(hasTimeout).toBe(true);
```

Both `120_000` (with numeric separator) and `120000` are valid JavaScript. The underscore is a readability convention — it does not affect the value.
