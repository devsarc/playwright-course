# Lumio Context: Lesson 00

## Part 1 — Setup & Project Structure (formerly M00)

### Lumio Context (from M00's README)

At M00, Lumio has only a landing page. Your test navigates to it and asserts the page title exists. This is intentionally minimal — the goal is to prove your environment works, not to write a meaningful test.

### What's in Lumio at this point

At M00, Lumio has only a single page: the marketing landing page at `/`.

It has:
- A `<title>` in the HTML `<head>` (managed by Next.js App Router's `metadata` export)
- An `<h1>` heading visible in the viewport

That's it. No auth, no dashboard, no API. This is intentional — M00 is about
proving your Playwright environment works, not about testing real product behavior.

### Where these files live

```
lumio/
└── app/
    ├── layout.tsx       ← exports metadata (includes the page <title>)
    └── page.tsx         ← the landing page with the <h1>
```

### How Next.js serves the title

In App Router, page titles come from the `metadata` export in `layout.tsx` or `page.tsx`:

```typescript
// lumio/app/layout.tsx
export const metadata = {
  title: 'Lumio — Team Productivity',
};
```

Playwright's `toHaveTitle()` reads the `<title>` tag the browser renders.

## Part 2 — How Playwright Works Internally (formerly M01)

There is no Lumio interaction in M01. This module builds mental models before you
start writing tests.

When you do begin testing Lumio (from M02 onward), the Browser/Context/Page model
will be visible in how your tests are structured:

- Playwright's test runner creates a `BrowserContext` for each test — that's why
  logging in as one user in Test A doesn't affect Test B.
- The `page` fixture your tests receive is a `Page` object inside that context.
- When you add a `loggedInPage` fixture in M08, you're configuring the BrowserContext
  to pre-load saved auth state — which is fast precisely because contexts are cheap to create.

## Part 3 — Locators — Finding Elements (formerly M02)

### What's in Lumio at M02

The landing page (/) with:
- `<h1>` hero heading
- Navigation links: Pricing, Docs, Blog
- "Get started free" CTA link (renders as `<a>` wrapping a `<Button>`)
- Feature cards with `data-testid="feature-card"` — Kanban, Rich text, Team presence, Notifications
- Pricing section with three cards: `data-testid="pricing-card-free"`, `"pricing-card-pro"`, `"pricing-card-enterprise"`
- Each pricing card has an `<h3>` (tier name) and a CTA `<a>` link

### Where to find these elements in the code

```
lumio/app/page.tsx
  → FEATURES array → <div data-testid="feature-card"> × 4
  → PRICING_TIERS array → <div data-testid="pricing-card-{name}"> × 3
lumio/components/layout/navbar.tsx
  → NAV_LINKS → <Link> elements in <ul>
```

### Why `data-testid` on some elements?

`data-testid` attributes exist specifically for automation — they don't affect
styling or semantics. They're the right choice when no accessible name
(role + label) uniquely identifies the element. Feature cards and pricing cards
don't have distinct roles that distinguish them from each other, so `data-testid`
is appropriate here.

For the CTA button and nav links, `getByRole` is more appropriate because
those elements have distinct accessible roles and names.

## Part 4 — Actions — Interacting with Elements (formerly M03)

### Pages used in M03

- `/` — landing page (Pricing nav link, Sign in link)
- `/login` — login form (Email address + Password labels)
- `/onboarding/workspace` — workspace creation form (referenced but skipped)

### Action targets

| Element | Locator | Action tested |
|---------|---------|---------------|
| "Pricing" nav link | `getByRole('link', { name: 'Pricing' })` | `click()` |
| "Sign in" nav link | `getByRole('link', { name: 'Sign in' })` | `hover()` |
| Email input | `getByLabel('Email address')` | `fill()`, `pressSequentially()` |
| Password input | `getByLabel('Password')` | `press('Enter')` |

### Why the `selectOption` test is fixme

Lumio uses Radix UI's `<Select>` component, which renders as a custom div-based
dropdown — not a native `<select>` element. `selectOption()` only works on native
`<select>`. The correct pattern for Radix Select:

```typescript
// 1. Click the trigger to open the dropdown
await page.getByRole('combobox', { name: 'Priority' }).click();
// 2. Click the desired option
await page.getByRole('option', { name: 'High' }).click();
```

M20 introduces Lumio's task creation form with a Radix Select — that's where this
pattern is properly exercised.

## Part 5 — Assertions — Verifying State (formerly M04)

At M04, we're still testing the landing page. Key elements:

- Page `<title>`: "Lumio — Team Productivity"
- `<h1>` hero heading: visible
- 4 feature cards with `data-testid="feature-card"`
- 3 pricing cards with tier headings (Free, Pro, Enterprise) as `<h3>`
- "Get started free" `<a>` link with `href="/signup"`

The `expect.poll` test uses a JavaScript timer (not a DOM element) — this is
intentional to show that `expect.poll` handles non-Playwright values, whereas
`toBeVisible()` and other matchers handle Playwright locators.

## Part 6 — Navigation & Page State (formerly M05)

### Pages used in M05

- `/` — landing page (starting point for reload, goBack/goForward)
- `/pricing` — destination after clicking the Pricing nav link
- `/docs` — standalone docs page (has an h1)
- `/login` — used for waitForURL (login redirects to /dashboard) and waitForResponse

### Navigation targets

| Test | Action | Verification |
|------|--------|-------------|
| goto | `page.goto('/docs')` | h1 is visible |
| reload | `page.reload()` | h1 persists after reload |
| goBack/goForward | click Pricing → goBack → goForward | URL matches each destination |
| waitForURL | submit login form | URL changes to /dashboard |
| waitForLoadState | `page.goto('/')` + waitForLoadState | h1 visible after load event |
| waitForResponse | `page.waitForResponse(/\/api\//)` | response received on /login load |

### Important: `waitForResponse` setup order

The `waitForResponse` promise **must be created before** the action that triggers
the request. If you create it after `page.goto('/login')`, the response may have
already arrived and the promise will never resolve (causing a timeout).

```typescript
// Correct — promise created before navigation
const responsePromise = page.waitForResponse(/\/api\//);
await page.goto('/login');
const response = await responsePromise;

// Wrong — response may already be gone
await page.goto('/login');
const responsePromise = page.waitForResponse(/\/api\//); // may timeout
```
