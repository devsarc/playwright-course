# Lumio Context: M25

## What Lumio looks like at M25

By module 25, Lumio has a fully functional dashboard with a kanban board, task
cards, and a protected admin panel. The application has auth, navigation,
project management, and rich UI components — exactly the kind of app where
screenshot capture is useful for documentation, debugging, and CI artifact
generation.

## Routes and areas covered in this module

| Route | What you'll see |
|-------|----------------|
| `/dashboard` | Kanban board with task columns and task cards |
| `/admin` | Admin panel with user management and settings |

## testid attributes

| Element | data-testid | Notes |
|---------|-------------|-------|
| Individual task cards | `task-card` | Repeated inside kanban columns |
| Admin panel wrapper | `admin-panel` | Wraps the full admin section |

## File tree

```
lumio/
└── app/
    └── (protected)/
        └── dashboard/
        │   └── page.tsx   ← kanban board with task cards
        └── admin/
            └── page.tsx   ← admin panel
```

## Why screenshot capture fits M25

Taking screenshots for documentation, debugging, and CI artifacts is a distinct
skill from visual regression comparison. At this stage of learning Playwright,
students have already built and tested most of Lumio's features. Capturing the
app at this milestone serves three real-world purposes:

1. **CI artifact documentation** — attach PNGs to pull request pipelines so
   reviewers can see what the UI looks like without running locally.
2. **Manual layout debugging** — `fullPage: true` catches overflow issues and
   scroll-dependent layout bugs that viewport-only screenshots miss.
3. **Marketing and demo generation** — automated screenshot pipelines let teams
   regenerate product screenshots every release without manual effort.

## What this module does NOT cover

M25 does not use `toHaveScreenshot()`. That method compares a screenshot against
a stored baseline (pixel-diffing). That is the subject of M26 (Visual Regression
Testing). M25 is purely about the capture API: saving images to disk, scoping
to elements, clipping regions, and configuring format options.
