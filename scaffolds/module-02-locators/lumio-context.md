# Lumio Context: M02

## What's in Lumio at M02

The landing page (/) with:
- `<h1>` hero heading
- Navigation links: Pricing, Docs, Blog
- "Get started free" CTA link (renders as `<a>` wrapping a `<Button>`)
- Feature cards with `data-testid="feature-card"` — Kanban, Rich text, Team presence, Notifications
- Pricing section with three cards: `data-testid="pricing-card-free"`, `"pricing-card-pro"`, `"pricing-card-enterprise"`
- Each pricing card has an `<h3>` (tier name) and a CTA `<a>` link

## Where to find these elements in the code

```
lumio/app/page.tsx
  → FEATURES array → <div data-testid="feature-card"> × 4
  → PRICING_TIERS array → <div data-testid="pricing-card-{name}"> × 3
lumio/components/layout/navbar.tsx
  → NAV_LINKS → <Link> elements in <ul>
```

## Why `data-testid` on some elements?

`data-testid` attributes exist specifically for automation — they don't affect
styling or semantics. They're the right choice when no accessible name
(role + label) uniquely identifies the element. Feature cards and pricing cards
don't have distinct roles that distinguish them from each other, so `data-testid`
is appropriate here.

For the CTA button and nav links, `getByRole` is more appropriate because
those elements have distinct accessible roles and names.
