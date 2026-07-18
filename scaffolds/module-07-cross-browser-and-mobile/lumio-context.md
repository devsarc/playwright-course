# Lumio Context: Lesson 07

## Part 1 — Cross-Browser Testing Strategy (formerly M34)

### What's in Lumio at this point

At M34, Lumio is a fully functional SaaS app: landing page, auth, onboarding, dashboard with kanban board, task management, and an admin panel. All features are built and tested. M34 is the first time these features are deliberately run across all three browser engines.

### Routes used in this module

| Route | Purpose |
|-------|---------|
| `/` | Landing page — cross-browser smoke test |
| `/dashboard` | Kanban board — date input and clipboard tests |

### data-testid values

| testid | Element |
|--------|---------|
| `task-card` | Individual task card in the kanban board |
| `task-due-date` | Date input inside the task creation modal |
| `task-title-input` | Task title field inside the task creation modal |
| `task-submit` | Submit button inside the task creation modal |

### Playwright project configuration for M34

To run all three browsers, `playwright.config.ts` at the repo root needs all three projects configured:

```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
]
```

M07 introduced the multi-project config. M34 is where learners first encounter real browser-specific behavior differences in a feature they have already tested on Chromium.

### Where these files live

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

### Why cross-browser testing is realistic here

Lumio's date input (`<input type="date">`) is a real WebKit pain point — Safari's date input behavior has historically differed from Chrome's. The clipboard API test exercises a permission boundary that Chromium handles leniently but WebKit enforces strictly. Both are patterns learners will encounter in production web apps.

## Part 2 — Mobile Emulation & Responsive Testing (formerly M35)

### What's in Lumio at this point

At M35, Lumio is fully built. The landing page, dashboard, and all protected routes are complete. Lumio is built with Tailwind CSS and uses responsive prefixes (`sm:`, `md:`, `lg:`) to control layout at different breakpoints. The navigation switches from a full desktop nav to a hamburger menu below Tailwind's `md` breakpoint (768px).

### Responsive behavior

| Viewport width | Nav behavior |
|---------------|-------------|
| ≥ 768px (md+) | Full horizontal nav links visible, hamburger hidden |
| < 768px | Nav links hidden, hamburger button visible |

### Dark mode

Lumio supports dark mode via the `prefers-color-scheme: dark` media query. The root layout applies a dark background and light text when dark mode is active. The Tailwind `dark:` variant is used throughout components.

### Print stylesheet

Lumio's global CSS includes `@media print { nav { display: none } }` to hide navigation chrome when printing.

### data-testid values

| testid | Element |
|--------|---------|
| `desktop-nav` | The horizontal desktop navigation bar |

### Where these files live

```
lumio/
├── app/
│   ├── layout.tsx         ← root layout, dark mode class applied here
│   ├── globals.css        ← @media print styles
│   └── page.tsx           ← landing page with responsive nav
└── components/
    └── layout/
        └── Navbar.tsx     ← desktop nav + hamburger menu toggle
```

### Device presets used in this module

| Device | Viewport | Scale | Touch |
|--------|----------|-------|-------|
| iPhone 14 | 390×844 | 3x | Yes |
| iPad Pro | 1024×1366 | 2x | Yes |

Available via `import { devices } from '@playwright/test'` or through the `devices` re-export in `tests/fixtures/fixtures.ts`.

## Part 3 — Geolocation, Permissions & Device APIs (formerly M36)

### What's in Lumio at this point

At M36, Lumio is complete. The onboarding flow (workspace creation) includes an optional geolocation-based timezone detection feature: when a user clicks "Detect location", the browser requests geolocation permission and, if granted, uses the coordinates to set the workspace timezone automatically.

The settings/profile page has a profile photo upload that optionally offers a camera capture option when camera permission is available.

### Routes used in this module

| Route | Purpose |
|-------|---------|
| `/onboarding/workspace` | Workspace creation form with timezone detection |
| `/dashboard` | Dashboard with date/timezone-sensitive headers |
| `/settings/profile` | Profile settings with photo upload / camera |

### data-testid values

| testid | Element |
|--------|---------|
| `workspace-timezone-input` | Timezone field in workspace creation form (auto-filled from geolocation) |
| `dashboard-today-header` | "Today" date header shown on the kanban board |

### ARIA roles

| Role | Usage |
|------|-------|
| `button` with name `/detect location/i` | Triggers geolocation permission request in workspace form |
| `alert` | Error message shown when geolocation is denied |
| `button` with name `/take photo/i` | Camera capture button on profile page (shown only when camera is granted) |

### Where these files live

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

### Why these features are good for learning

Geolocation and camera permissions are among the most commonly mishandled APIs in test suites. Many teams skip testing them because they don't know how to control browser permissions programmatically. `context.grantPermissions()` and `context.setGeolocation()` are direct, effective solutions — and this module is where learners build that muscle memory.

## Part 4 — Offline, PWA & Service Workers (formerly M37)

### Lumio PWA setup

Lumio is configured as a PWA using `next-pwa`:
- `public/sw.js` — the generated service worker
- `public/manifest.json` — the web app manifest
- The SW caches the app shell and recent board API responses

### Offline UI

When `navigator.onLine === false`, Lumio renders:
- `data-testid="offline-banner"` — a top banner indicating offline state

The SW serves cached assets so the board structure remains visible.
Write operations (add/move card) are queued and synced on reconnect.

### Where to find this in the code

```
lumio/next.config.js            -> next-pwa configuration
lumio/components/OfflineBanner.tsx -> data-testid="offline-banner"
public/sw.js                    -> generated; do not edit directly
```

### Service worker activation timing

After `page.goto('/')`, the SW may take 500-2000ms to activate. The
`context.waitForEvent('serviceworker')` pattern is the reliable way to
wait for it; `waitForTimeout` is used as a pragmatic fallback when the
event has already fired.
