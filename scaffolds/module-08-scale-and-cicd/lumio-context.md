# Lumio Context: Lesson 08

## Part 1 — Parallel Execution & Test Isolation (formerly M38)

### What's in Lumio at this point

At M38, Lumio is fully built. This module does not introduce new Lumio features — it focuses on how to run the *existing* Lumio test suite safely in parallel. The workspace creation flow is used as the test subject because workspace slugs must be globally unique, making it an ideal case study in data isolation.

### Why workspace creation illustrates parallel isolation

Lumio enforces that workspace slugs are unique across the system. If two parallel tests both create a workspace with the slug `test-workspace`, the second creation will return a 409 Conflict error. This is not a Playwright bug — it is a data isolation failure. The fix is to generate unique names per test (using `Date.now()` or a UUID), so each test creates a distinct record and neither conflicts with the other.

### Routes used in this module

| Route | Purpose |
|-------|---------|
| `/onboarding/workspace` | Workspace creation form |
| `/dashboard` | Dashboard — asserts workspace name is shown |

### data-testid values

| testid | Element |
|--------|---------|
| `workspace-name-input` | Workspace name field |
| `workspace-submit-button` | Submit button |

### Playwright configuration context

At this point in the curriculum, `playwright.config.ts` uses the default `fullyParallel: false` (tests within a file run sequentially). M38 introduces `test.describe.configure({ mode: 'parallel' })` as an opt-in mechanism for files that are designed for intra-file parallelism. The global config change (`fullyParallel: true`) is deferred to M40 where CI/CD pipeline setup is the focus.

### Where these files live

```
lumio/
└── app/
    └── (onboarding)/
        └── onboarding/
            └── workspace/
                └── page.tsx  ← workspace creation with unique slug enforcement
```

## Part 2 — Sharding for Large Suites (formerly M39)

### CI requirements for Lumio tests

- Lumio dev server must be running during tests (or use webServer in config)
- Database must be seeded (prisma db push + prisma db seed)
- Auth fixtures must exist (global setup creates them)

### playwright.config.ts CI settings

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

### Sharding strategy

For ~100 tests, 4 shards is reasonable:
- Shard 1/4: M20-M23 (POM, CT, visual, a11y)
- Shard 2/4: M24-M27 (DnD, upload, iframe, WS)
- Shard 3/4: M28-M31 (multi-user, SW, Electron, trace)
- Shard 4/4: M39-M35 (CI, perf, i18n, capstone)

## Part 3 — CI/CD Pipeline Setup (formerly M40)

### What's in Lumio at this point

At M40, Lumio is fully built and the test suite has 40 modules of tests. M40 focuses on CI infrastructure — not new Lumio features. The goal is to make every push to a module branch automatically run the Playwright suite and report results inline on GitHub.

### The CI workflow

M40's primary deliverable is updating (or verifying) `.github/workflows/module-check.yml` to include:
- Browser binary caching
- The GitHub annotations reporter (`['github']`)
- Artifact upload with `if: always()`
- `process.env.CI` gating on `workers`, `retries`, and `forbidOnly`

### What the tests in this module validate

Unlike most modules where tests exercise app behavior, M40 tests exercise *configuration*. The `exercise.spec.ts` reads `playwright.config.ts` and `.github/workflows/module-check.yml` as text and asserts structural properties — a meta-testing pattern useful for enforcing configuration standards across a team.

### Key files

```
playwright-course/                        ← repo root
├── playwright.config.ts                 ← what M40 exercises audit
├── .github/
│   └── workflows/
│       └── module-check.yml             ← what M40 exercises also audit
└── tests/
    └── module-40-ci-cd/
        └── exercise.spec.ts             ← reads and asserts on the above files
```

### Reporters and what they produce

| Reporter | Output | Primary consumer |
|----------|--------|-----------------|
| `github` | PR inline annotations | GitHub PR reviewers |
| `html` | `playwright-report/index.html` | Engineers debugging failures |
| `junit` | `results.xml` | Jenkins, GitLab CI, Azure DevOps |
| `json` | `test-results.json` | Custom dashboards, scripts |
| `blob` | `blob-report/` | Multi-shard merge (M39) |

### GitHub Actions environment variables

The CI workflow reads these secrets from GitHub repository settings:
- `secrets.TEST_DATABASE_URL` — connection string for the test PostgreSQL database
- `secrets.NEXTAUTH_SECRET` — NextAuth signing secret
- `secrets.TEST_USER_PASSWORD` — password for the seeded test user
- `secrets.TEST_ADMIN_PASSWORD` — password for the seeded admin user
- `vars.TEST_USER_EMAIL` — email for the seeded test user (non-secret, public variable)
- `vars.TEST_ADMIN_EMAIL` — email for the seeded admin user (non-secret, public variable)

## Part 4 — WebServer Config & Test Environment (formerly M41)

### What's in Lumio at this point

At M41, Lumio is fully built. This module focuses entirely on the Playwright configuration layer — how the test runner connects to the Lumio server. No new Lumio features are introduced.

### The webServer relationship

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

### Environment variables flow

```
.env.test             → loaded by dotenv in playwright.config.ts
playwright.config.ts  → passes DATABASE_URL, NEXTAUTH_SECRET etc. to webServer.env
lumio/                → reads environment variables to connect to test DB and configure auth
```

### Key files

```
playwright-course/
├── playwright.config.ts     ← webServer config lives here
├── .env.test                ← gitignored, holds real test credentials
└── .env.test.example        ← committed, documents required variables
```

### Why this separation matters

The `lumio/` directory has its own `.env` (for local development) and ignores the repo-root `.env.test`. This separation ensures that running `npm run dev` inside `lumio/` uses development credentials, while the Playwright-managed server process uses test credentials — they never mix.
