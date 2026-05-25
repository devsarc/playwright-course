# Lumio Context: M40

## What's in Lumio at this point

At M40, Lumio is fully built and the test suite has 40 modules of tests. M40 focuses on CI infrastructure — not new Lumio features. The goal is to make every push to a module branch automatically run the Playwright suite and report results inline on GitHub.

## The CI workflow

M40's primary deliverable is updating (or verifying) `.github/workflows/module-check.yml` to include:
- Browser binary caching
- The GitHub annotations reporter (`['github']`)
- Artifact upload with `if: always()`
- `process.env.CI` gating on `workers`, `retries`, and `forbidOnly`

## What the tests in this module validate

Unlike most modules where tests exercise app behavior, M40 tests exercise *configuration*. The `exercise.spec.ts` reads `playwright.config.ts` and `.github/workflows/module-check.yml` as text and asserts structural properties — a meta-testing pattern useful for enforcing configuration standards across a team.

## Key files

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

## Reporters and what they produce

| Reporter | Output | Primary consumer |
|----------|--------|-----------------|
| `github` | PR inline annotations | GitHub PR reviewers |
| `html` | `playwright-report/index.html` | Engineers debugging failures |
| `junit` | `results.xml` | Jenkins, GitLab CI, Azure DevOps |
| `json` | `test-results.json` | Custom dashboards, scripts |
| `blob` | `blob-report/` | Multi-shard merge (M39) |

## GitHub Actions environment variables

The CI workflow reads these secrets from GitHub repository settings:
- `secrets.TEST_DATABASE_URL` — connection string for the test PostgreSQL database
- `secrets.NEXTAUTH_SECRET` — NextAuth signing secret
- `secrets.TEST_USER_PASSWORD` — password for the seeded test user
- `secrets.TEST_ADMIN_PASSWORD` — password for the seeded admin user
- `vars.TEST_USER_EMAIL` — email for the seeded test user (non-secret, public variable)
- `vars.TEST_ADMIN_EMAIL` — email for the seeded admin user (non-secret, public variable)
