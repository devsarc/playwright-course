# M41: WebServer Config & Test Environment

## Learning Objectives

- Configure every `webServer` option (`command`, `url`, `reuseExistingServer`, `timeout`, `env`, `stdout`, `stderr`) and explain what each controls
- Run multiple `webServer` instances for a frontend + backend split architecture
- Manage test environment variables with `.env.test` and `dotenv` in `playwright.config.ts`
- Decide when `reuseExistingServer: true` is appropriate and when it is dangerous
- Override the base URL per test or per project without touching `playwright.config.ts`

## Concept

`webServer` is Playwright's way of owning the full lifecycle of your application during tests — start the server before tests run, tear it down after. M00 introduced the basic configuration. M41 goes deep on every option, the edge cases, and the patterns for more complex architectures.

**`command` and `url`.** The `command` is a shell command Playwright spawns as a child process. The `url` is the address Playwright polls with HTTP GET requests every 1 second. When the URL returns any 2xx response, Playwright considers the server ready and starts running tests. This polling is why you need a `/` route or a `/health` endpoint — Playwright needs something to hit. If the URL never responds within `timeout`, the entire run fails before any test executes.

**`timeout`.** The default timeout is 60 seconds. Next.js on a cold start with TypeScript compilation can take 30–45 seconds, especially the first time. Set `timeout: 120_000` for Next.js projects. For production builds (`next start` instead of `next dev`), compilation happens at build time and startup is faster — but building takes longer upfront.

**`reuseExistingServer`.** When `true`, Playwright checks whether the `url` is already responding before starting the `command`. If it is, Playwright skips the start and uses the running server. This is the right setting for local development: if you already have `npm run dev` running, tests use it immediately without a restart. In CI, set this to `false` (or `!process.env.CI`) — CI runners have no pre-existing server and silently skipping the start command would produce connection refused errors.

**`env`.** Additional environment variables to inject into the server process. If your Next.js app reads `DATABASE_URL` from the environment, pass it here: `env: { DATABASE_URL: process.env.DATABASE_URL }`. This is separate from the test process's environment — the server process does not automatically inherit all of the test process's env vars.

**`stdout` and `stderr`.** By default Playwright suppresses server output. Set `stdout: 'pipe'` to capture it for debugging. During development, `stdout: 'pipe'` combined with Playwright's `DEBUG=pw:api` flag gives you full visibility into both the test framework and the server.

**Multiple servers.** `webServer` accepts an array. A common pattern for Next.js + a separate WebSocket server: `webServer: [{ command: 'npm run dev --prefix lumio', url: 'http://localhost:3000' }, { command: 'node lumio/server.ts', url: 'http://localhost:3001/health' }]`. Playwright starts both, waits for both to be ready, and tears both down after the run.

**`.env.test` management.** The test database URL, auth secrets, and credentials belong in `.env.test` — not in `.env` (which is for development) and not in the repository (committed secrets are a security incident). The pattern: `.env.test.example` is committed (with placeholder values), `.env.test` is gitignored. `dotenv.config({ path: '.env.test' })` in `playwright.config.ts` loads these values for both the test process and (via `env:` in `webServer`) the server process.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Complete each TODO in `exercise.spec.ts` in order.
Run after each TODO:
```bash
npx playwright test tests/module-41-webserver-config
```

## Key Takeaways

1. `webServer.url` is polled until it responds — your app needs a root or health route that returns 2xx quickly.
2. `reuseExistingServer: !process.env.CI` is the correct default — reuse locally, always start fresh in CI.
3. `webServer` accepts an array for multi-process architectures (frontend + API + WebSocket server).
4. Put secrets in `.env.test`, load with `dotenv` in config, pass to server via `webServer.env`.
5. `timeout: 120_000` is sensible for Next.js — cold-start TypeScript compilation takes time.

## Going Deeper

- [Playwright docs: webServer](https://playwright.dev/docs/test-webserver)
- [Playwright docs: Configuration](https://playwright.dev/docs/test-configuration)
- [Playwright docs: Environment variables](https://playwright.dev/docs/test-parameterize#env-files)
