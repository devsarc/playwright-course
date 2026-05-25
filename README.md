# Learn Playwright — GitHub Skills-Style Learning Platform

A hands-on, project-based course for learning [Playwright](https://playwright.dev/) end-to-end testing.
You write tests against **Lumio**, a real Next.js project-management app, so every concept lands in
realistic context — not toy examples.

## What is Lumio?

Lumio is a Kanban-style project management app built with Next.js 14, Prisma, and PostgreSQL.
It includes authentication, a drag-and-drop board, a rich-text editor, file uploads, WebSocket
presence, a REST API, and a PWA service worker — enough surface area to cover every major
Playwright topic across 93 modules.

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | ≥ 20 |
| npm | ≥ 10 |
| PostgreSQL | ≥ 15 (local instance) |

## Quickstart

```bash
# 1. Install root dependencies (Playwright + test tooling)
npm install

# 2. Install Playwright browsers
npx playwright install

# 3. Install Lumio's dependencies
cd lumio && npm install && cd ..

# 4. Configure environment variables
cp lumio/.env.example lumio/.env
#    Edit lumio/.env — set DATABASE_URL to your local Postgres connection string

# 5. Push the schema and seed the database
npm run db:push --prefix lumio
npm run db:seed --prefix lumio

# 6. Verify everything works — run the M00 smoke test
npx playwright test tests/module-00-setup --headed
```

> The Lumio dev server starts automatically before tests run (configured in `playwright.config.ts`).
> You do not need to start it manually.

## Course Structure

All 93 modules live under `tests/`. See **[tests/README.md](tests/README.md)** for the full module
index with topics, learning objectives, and file lists.

Each module folder contains:

| File | Purpose |
|---|---|
| `exercise.spec.ts` | TODOs for you to complete |
| `hints.md` | Exact answers — open only when stuck |
| `lumio-context.md` | Which Lumio routes/features are under test |
| `README.md` | Concept explanation and key takeaways |

### Running a single module

```bash
npx playwright test tests/module-NN-slug
```

### Running all modules

```bash
npx playwright test
```

### Viewing the HTML report

```bash
npx playwright show-report
```

## Repository Layout

```
playwright-course/
├── lumio/                  # The test target — Next.js app
│   ├── app/                # Next.js App Router pages
│   ├── components/         # React components
│   ├── prisma/             # Schema + seed
│   └── server.ts           # Custom HTTP + WebSocket server
├── tests/
│   ├── fixtures/           # Shared Playwright fixtures
│   ├── module-00-setup/
│   ├── module-01-*/
│   └── …                   # M00 – M92
├── playwright.config.ts
├── playwright-ct.config.ts     # React component-testing config (M51–M52, M54)
├── playwright-ct-vue.config.ts # Vue component-testing config (M53)
└── tsconfig.json
```

## License

MIT
