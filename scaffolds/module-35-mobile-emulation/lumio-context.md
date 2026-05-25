# Lumio Context: M35

## What's in Lumio at this point

At M35, Lumio is fully built. The landing page, dashboard, and all protected routes are complete. Lumio is built with Tailwind CSS and uses responsive prefixes (`sm:`, `md:`, `lg:`) to control layout at different breakpoints. The navigation switches from a full desktop nav to a hamburger menu below Tailwind's `md` breakpoint (768px).

## Responsive behavior

| Viewport width | Nav behavior |
|---------------|-------------|
| ≥ 768px (md+) | Full horizontal nav links visible, hamburger hidden |
| < 768px | Nav links hidden, hamburger button visible |

## Dark mode

Lumio supports dark mode via the `prefers-color-scheme: dark` media query. The root layout applies a dark background and light text when dark mode is active. The Tailwind `dark:` variant is used throughout components.

## Print stylesheet

Lumio's global CSS includes `@media print { nav { display: none } }` to hide navigation chrome when printing.

## data-testid values

| testid | Element |
|--------|---------|
| `desktop-nav` | The horizontal desktop navigation bar |

## Where these files live

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

## Device presets used in this module

| Device | Viewport | Scale | Touch |
|--------|----------|-------|-------|
| iPhone 14 | 390×844 | 3x | Yes |
| iPad Pro | 1024×1366 | 2x | Yes |

Available via `import { devices } from '@playwright/test'` or through the `devices` re-export in `tests/fixtures/fixtures.ts`.
