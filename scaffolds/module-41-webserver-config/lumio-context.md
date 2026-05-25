# Lumio Context: M41

## What's in Lumio at this point

At M41, Lumio is fully built. This module focuses entirely on the Playwright configuration layer — how the test runner connects to the Lumio server. No new Lumio features are introduced.

## The webServer relationship

Lumio runs as a Next.js dev server on `http://localhost:3000`. The `webServer` block in `playwright.config.ts` owns starting and stopping this process:

```typescript
webServer: {
  command: 'npm run dev --prefix lumio',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
  timeout: 120_000,
}
```

Lumio also has a custom WebSocket server (`lumio/server.ts`) that starts alongside Next.js. In a production setup, a second entry in the `webServer` array would manage it:

```typescript
webServer: [
  { command: 'npm run dev --prefix lumio', url: 'http://localhost:3000', timeout: 120_000 },
  { command: 'npx tsx lumio/server.ts', url: 'http://localhost:3001/health', timeout: 15_000 },
]
```

## Environment variables flow

```
.env.test             → loaded by dotenv in playwright.config.ts
playwright.config.ts  → passes DATABASE_URL, NEXTAUTH_SECRET etc. to webServer.env
lumio/                → reads environment variables to connect to test DB and configure auth
```

## Key files

```
playwright-course/
├── playwright.config.ts     ← webServer config lives here
├── .env.test                ← gitignored, holds real test credentials
└── .env.test.example        ← committed, documents required variables
```

## Why this separation matters

The `lumio/` directory has its own `.env` (for local development) and ignores the repo-root `.env.test`. This separation ensures that running `npm run dev` inside `lumio/` uses development credentials, while the Playwright-managed server process uses test credentials — they never mix.
