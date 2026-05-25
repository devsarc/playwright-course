# Lumio Context: M34

## What's in Lumio at this point

At M34, Lumio is a fully functional SaaS app: landing page, auth, onboarding, dashboard with kanban board, task management, and an admin panel. All features are built and tested. M34 is the first time these features are deliberately run across all three browser engines.

## Routes used in this module

| Route | Purpose |
|-------|---------|
| `/` | Landing page — cross-browser smoke test |
| `/dashboard` | Kanban board — date input and clipboard tests |

## data-testid values

| testid | Element |
|--------|---------|
| `task-card` | Individual task card in the kanban board |
| `task-due-date` | Date input inside the task creation modal |
| `task-title-input` | Task title field inside the task creation modal |
| `task-submit` | Submit button inside the task creation modal |

## Playwright project configuration for M34

To run all three browsers, `playwright.config.ts` at the repo root needs all three projects configured:

```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
]
```

M07 introduced the multi-project config. M34 is where learners first encounter real browser-specific behavior differences in a feature they have already tested on Chromium.

## Where these files live

```
lumio/
├── app/
│   ├── page.tsx                          ← landing page
│   └── (protected)/
│       └── dashboard/
│           └── page.tsx                  ← kanban board
└── components/
    └── board/
        └── TaskModal.tsx                 ← task creation dialog with due-date input
```

## Why cross-browser testing is realistic here

Lumio's date input (`<input type="date">`) is a real WebKit pain point — Safari's date input behavior has historically differed from Chrome's. The clipboard API test exercises a permission boundary that Chromium handles leniently but WebKit enforces strictly. Both are patterns learners will encounter in production web apps.
