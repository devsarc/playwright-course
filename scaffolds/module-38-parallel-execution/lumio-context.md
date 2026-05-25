# Lumio Context: M38

## What's in Lumio at this point

At M38, Lumio is fully built. This module does not introduce new Lumio features — it focuses on how to run the *existing* Lumio test suite safely in parallel. The workspace creation flow is used as the test subject because workspace slugs must be globally unique, making it an ideal case study in data isolation.

## Why workspace creation illustrates parallel isolation

Lumio enforces that workspace slugs are unique across the system. If two parallel tests both create a workspace with the slug `test-workspace`, the second creation will return a 409 Conflict error. This is not a Playwright bug — it is a data isolation failure. The fix is to generate unique names per test (using `Date.now()` or a UUID), so each test creates a distinct record and neither conflicts with the other.

## Routes used in this module

| Route | Purpose |
|-------|---------|
| `/onboarding/workspace` | Workspace creation form |
| `/dashboard` | Dashboard — asserts workspace name is shown |

## data-testid values

| testid | Element |
|--------|---------|
| `workspace-name-input` | Workspace name field |
| `workspace-submit-button` | Submit button |

## Playwright configuration context

At this point in the curriculum, `playwright.config.ts` uses the default `fullyParallel: false` (tests within a file run sequentially). M38 introduces `test.describe.configure({ mode: 'parallel' })` as an opt-in mechanism for files that are designed for intra-file parallelism. The global config change (`fullyParallel: true`) is deferred to M40 where CI/CD pipeline setup is the focus.

## Where these files live

```
lumio/
└── app/
    └── (onboarding)/
        └── onboarding/
            └── workspace/
                └── page.tsx  ← workspace creation with unique slug enforcement
```
