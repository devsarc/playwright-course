# Lumio Context: Lesson 05

## Part 1 — Screenshot Testing (formerly M25)

### What Lumio looks like at M25

By module 25, Lumio has a fully functional dashboard with a kanban board, task
cards, and a protected admin panel. The application has auth, navigation,
project management, and rich UI components — exactly the kind of app where
screenshot capture is useful for documentation, debugging, and CI artifact
generation.

### Routes and areas covered in this module

| Route | What you'll see |
|-------|----------------|
| `/dashboard` | Kanban board with task columns and task cards |
| `/admin` | Admin panel with user management and settings |

### testid attributes

| Element | data-testid | Notes |
|---------|-------------|-------|
| Individual task cards | `task-card` | Repeated inside kanban columns |
| Admin panel wrapper | `admin-panel` | Wraps the full admin section |

### File tree

```
lumio/
└── app/
    └── (protected)/
        └── dashboard/
        │   └── page.tsx   ← kanban board with task cards
        └── admin/
            └── page.tsx   ← admin panel
```

### Why screenshot capture fits M25

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

### What this module does NOT cover

M25 does not use `toHaveScreenshot()`. That method compares a screenshot against
a stored baseline (pixel-diffing). That is the subject of M26 (Visual Regression
Testing). M25 is purely about the capture API: saving images to disk, scoping
to elements, clipping regions, and configuring format options.

## Part 2 — Visual Regression Testing (formerly M26)

### Visual areas under test

- **Landing page** (`/`) — hero, features grid, pricing section
- **Kanban board** (`/projects/demo/board`) — column layout, card appearance

### testid attributes for scoped screenshots

| Element | data-testid |
|---------|-------------|
| Hero section | `hero-section` |
| Feature cards | `feature-card` |
| Kanban column | `kanban-column-{status}` |
| Kanban card | `kanban-card` |

### Dark mode

Lumio uses Tailwind's `dark` class strategy. Adding `dark` to `<html>` switches
the entire page to dark mode without any localStorage or cookie setup.

### Screenshot storage

Playwright stores baselines at:
`tests/module-22-visual-regression/__screenshots__/`

Commit these PNG files to git. On CI, the same baselines are used for comparison.

## Part 3 — ARIA Snapshot Testing (formerly M27)

### State of the app at M27

Lumio's dashboard has a fully functional kanban board built with Radix UI
primitives. Because Radix UI components ship with correct ARIA roles by
default, the accessibility tree is rich and stable — a good target for
snapshot assertions.

### Pages and components under test

| Route | What to test |
|-------|-------------|
| `/dashboard` | Kanban board container — heading, list of columns, task cards |
| `/dashboard` (modal open) | Task creation dialog — form fields, labels, submit button |

### Key selectors

| Element | Locator strategy | Notes |
|---------|-----------------|-------|
| Kanban board root | `getByTestId('kanban-board')` | Wraps all columns |
| Board heading | `getByRole('heading', { name: 'Kanban Board' })` | `<h1>` inside the board |
| Kanban column list | `getByRole('list')` | Each column is a `<ul>` |
| Task card | `getByTestId('kanban-card')` → `getByRole('listitem')` | One per task |
| "Add task" button | `getByRole('button', { name: 'Add task' })` | Opens the creation modal |
| Task creation dialog | `getByRole('dialog')` | Radix Dialog root |
| Dialog title | `getByRole('heading', { name: 'New task' })` | Inside the dialog |
| Task name input | `getByRole('textbox', { name: 'Task name' })` | Required field |
| Priority select | `getByRole('combobox', { name: 'Priority' })` | Radix Select |
| Save button | `getByRole('button', { name: 'Save task' })` | Submits the form |

### Relevant source files

```
lumio/
├── app/
│   └── (protected)/
│       └── dashboard/
│           └── page.tsx        ← kanban board with "Add task" button
└── components/
    └── board/
        └── TaskModal.tsx       ← the task creation dialog (Radix Dialog)
```

### Why Radix UI matters for ARIA snapshots

Radix UI manages ARIA attributes (role, aria-modal, aria-label, aria-expanded,
etc.) automatically. This means the accessibility tree is intentional and
meaningful — changes to it usually signal a real semantic regression, not a
cosmetic tweak. ARIA snapshots are therefore highly reliable here: a false
positive almost always means something genuinely changed in how the component
communicates with assistive technology.

## Part 4 — Accessibility Testing (formerly M28)

### Pages under test

- `/` — landing page (hero, features, pricing)
- `/projects/demo/board` — kanban board (interactive cards, drag handles)

### Known accessibility targets in Lumio

| Element | Expected role | data-testid |
|---------|---------------|-------------|
| Primary CTA | `link` | — |
| Pricing section | `region` | `pricing-section` |
| Kanban card | `listitem` | `kanban-card` |
| Delete button | `button` | `card-delete-btn` |

### axe-core installation

```bash
cd lumio && npm install --save-dev @axe-core/playwright
```

axe-core is already listed in devDependencies after Part 1 setup. If the import
fails, run the install command above.

## Part 5 — Performance Testing & Measurement (formerly M29)

### Performance targets for Lumio

| Metric | Target | Page |
|--------|--------|------|
| DOMContentLoaded | < 3000ms | Landing `/` |
| First Contentful Paint | < 2500ms | Landing `/` |
| Board columns visible | < 5000ms | `/projects/demo/board` |
| Card creation latency | < 1000ms | Board |
| Max JS bundle size | < 500 KB | Any page |

### Why these numbers?

These are conservative for a dev server with no CDN. In production with
Next.js's static optimization and a CDN, FCP should be < 1000ms.

### Performance debugging in Lumio

If a test fails a performance budget:
1. Run `npx next build && npx next start` and re-test — dev server is slower
2. Check bundle analyzer: `cd lumio && ANALYZE=true npm run build`
3. Look for large client-side data fetches on load

## Part 6 — HAR & DevTools Deep Analysis (formerly M30)

### Dashboard API calls

At M30, Lumio's dashboard page (`/dashboard`) makes three API calls on load:

| Endpoint | Purpose |
|----------|---------|
| `/api/workspaces` | Fetch the user's workspaces list |
| `/api/projects` | Fetch recent projects for the active workspace |
| `/api/tasks` | Fetch the user's assigned tasks across all projects |

These three calls are realistic bottleneck candidates. In a real app, `/api/tasks`
aggregates data across projects and tends to be the slowest — it is the primary
target for timing analysis in these exercises.

### HAR file location

The HAR generated in exercise 1 is written to:

```
test-results/dashboard.har
```

This path is under `test-results/`, which is already in `.gitignore`. Do not move
or commit the file — HAR files contain session cookies, auth tokens, and request
bodies and must never be checked into source control.

### What the HAR contains at M30

Because the dashboard is a protected route, the HAR will capture:
- The authenticated `GET /dashboard` document request
- All static assets (JS chunks, CSS, fonts) loaded for the dashboard shell
- The three API calls listed above, including full request headers (cookies,
  Authorization) and response bodies
- Redirect chains if the session was expired

The timing data in each HAR entry (`entry.timings`) breaks down into:
`dns`, `connect`, `ssl`, `send`, `wait` (TTFB), and `receive` (download).
`wait` is almost always the dominant cost for API requests — it is the time
the server spent generating the response.

### CDP throttling and Lumio

When you apply CDP network throttling in exercise 3 (simulating 3G conditions),
the dashboard load slows dramatically because all three API calls are affected.
LCP becomes largely determined by how quickly `/api/tasks` returns — it is
typically the last piece of data needed to render the dashboard's task list.

### Trace Viewer and curl generation

If you open a Playwright trace (`.zip`) in Trace Viewer and navigate to the
Network panel, you can right-click any request entry to copy it as a `curl`
command. Exercise 4 demonstrates reconstructing this programmatically from HAR
data. The practical benefit: you can paste the curl command into your terminal
and reproduce the exact API call — same URL, same headers, same cookies — outside
of any test.

### File tree reference

```
lumio/
└── app/
    └── (protected)/
        └── dashboard/
            └── page.tsx   ← issues fetch('/api/workspaces'), fetch('/api/projects'),
                              fetch('/api/tasks') in parallel on mount
```
