# Lumio Context: M36

## What's in Lumio at this point

At M36, Lumio is complete. The onboarding flow (workspace creation) includes an optional geolocation-based timezone detection feature: when a user clicks "Detect location", the browser requests geolocation permission and, if granted, uses the coordinates to set the workspace timezone automatically.

The settings/profile page has a profile photo upload that optionally offers a camera capture option when camera permission is available.

## Routes used in this module

| Route | Purpose |
|-------|---------|
| `/onboarding/workspace` | Workspace creation form with timezone detection |
| `/dashboard` | Dashboard with date/timezone-sensitive headers |
| `/settings/profile` | Profile settings with photo upload / camera |

## data-testid values

| testid | Element |
|--------|---------|
| `workspace-timezone-input` | Timezone field in workspace creation form (auto-filled from geolocation) |
| `dashboard-today-header` | "Today" date header shown on the kanban board |

## ARIA roles

| Role | Usage |
|------|-------|
| `button` with name `/detect location/i` | Triggers geolocation permission request in workspace form |
| `alert` | Error message shown when geolocation is denied |
| `button` with name `/take photo/i` | Camera capture button on profile page (shown only when camera is granted) |

## Where these files live

```
lumio/
├── app/
│   ├── (onboarding)/
│   │   └── onboarding/
│   │       └── workspace/
│   │           └── page.tsx      ← timezone detection + grantPermissions logic
│   └── (protected)/
│       ├── dashboard/
│       │   └── page.tsx          ← today's date formatted in workspace timezone
│       └── settings/
│           └── profile/
│               └── page.tsx      ← camera upload option
└── lib/
    └── geo.ts                    ← coordinate-to-timezone conversion utility
```

## Why these features are good for learning

Geolocation and camera permissions are among the most commonly mishandled APIs in test suites. Many teams skip testing them because they don't know how to control browser permissions programmatically. `context.grantPermissions()` and `context.setGeolocation()` are direct, effective solutions — and this module is where learners build that muscle memory.
