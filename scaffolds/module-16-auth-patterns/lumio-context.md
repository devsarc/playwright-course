# Lumio Context: M16

## The auth state file

`.auth-state-member.json` is written by `exercise.spec.ts` (the setup step).
It contains:

```json
{
  "cookies": [
    { "name": "next-auth.session-token", "value": "...", "domain": "localhost", ... }
  ],
  "origins": [
    { "origin": "http://localhost:3000", "localStorage": [] }
  ]
}
```

The `next-auth.session-token` cookie is what authenticates the user. When Playwright
loads this storageState, it injects the cookie into the browser context before
any navigation — the app sees an authenticated user immediately.

## Why this is faster than logging in every test

A login flow takes ~500–2000ms (network round trip + NextAuth processing + redirect).
With `storageState`, the overhead is a single file read — microseconds.

For a suite with 50 authenticated tests, this saves 25–100 seconds per run.

## Setup project pattern (production approach)

In a real project, the auth setup is a Playwright "setup project":

```typescript
// playwright.config.ts
projects: [
  { name: 'setup', testMatch: '**/global.setup.ts' },
  {
    name: 'authenticated',
    use: { storageState: '.auth/member.json' },
    dependencies: ['setup'],
  },
]
```

The setup project runs first, saves the auth state. The authenticated project
depends on setup — it runs after and reuses the saved state.

## The admin auth state

M19 references `.auth-state-admin.json`. This file would be created by an
additional setup step that logs in as an admin user. The admin setup is not
implemented in M16 (which focuses on the member flow) — it's referenced in M19
to show the access control pattern.
