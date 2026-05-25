# Lumio Context: M39

## CI requirements for Lumio tests

- Lumio dev server must be running during tests (or use webServer in config)
- Database must be seeded (prisma db push + prisma db seed)
- Auth fixtures must exist (global setup creates them)

## playwright.config.ts CI settings

```typescript
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['blob'], ['github']]
    : [['html', { open: 'on-failure' }]],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
```

## Sharding strategy

For ~100 tests, 4 shards is reasonable:
- Shard 1/4: M20-M23 (POM, CT, visual, a11y)
- Shard 2/4: M24-M27 (DnD, upload, iframe, WS)
- Shard 3/4: M28-M31 (multi-user, SW, Electron, trace)
- Shard 4/4: M39-M35 (CI, perf, i18n, capstone)
