# Lumio Context: Lesson 14

## Part 1 — Localization & i18n Testing (formerly M63)

### i18n setup in Lumio

Library: `next-intl`
Strategy: URL prefix routing

| Locale | URL prefix | Language |
|--------|-----------|----------|
| en | / (default) | English |
| fr | /fr | French |
| es | /es | Spanish |

### Translation files

```
lumio/messages/
  en.json   -> English strings
  fr.json   -> French strings
  es.json   -> Spanish strings
```

### Key translated strings (for assertions)

| Key | en | fr | es |
|-----|----|----|-----|
| hero.heading | Organize your work | Organisez votre travail | Organiza tu trabajo |
| nav.projects | Projects | Projets | Proyectos |

### Language switcher testids

| Element | data-testid |
|---------|-------------|
| Switcher trigger | `language-switcher` |
| French option | `lang-option-fr` |
| Spanish option | `lang-option-es` |
| English option | `lang-option-en` |

### Where to find this in the code

```
lumio/i18n.ts                -> next-intl configuration
lumio/middleware.ts          -> locale routing middleware
lumio/messages/              -> translation files
lumio/components/LanguageSwitcher.tsx
```

## Part 2 — Feature Flag & A/B Testing (formerly M64)

### What's in Lumio at this point

M64's branch adds the feature flags admin UI and the "AI suggestions" panel — a sidebar widget on the dashboard that offers AI-generated task suggestions. The panel's visibility is controlled by the `aiSuggestions` flag in `window.__featureFlags`, which is seeded from the database by the Next.js server on each page load.

A second flag, `betaDashboard`, adds an in-progress dashboard redesign behind a banner. It can be activated by the URL parameter `?flags=beta_dashboard` for QA purposes.

### The flags system

Lumio's flag system is DB-backed. The server reads flags from a `feature_flags` table and injects them into the page via `<script>window.__featureFlags = {...}</script>` in the Next.js `layout.tsx`. This makes flags synchronously available in the browser without an extra API round trip.

Flags can also be overridden per-user via a cookie (`feature_*` cookies) — useful for gradual rollouts where the server checks the cookie first, then falls back to the global flag value.

### Why addInitScript is the right test tool here

The DB-backed flag approach means that to change a flag in a normal test, you'd need to: seed the database with the flag value, run the test, then clean up. This couples tests to database state and makes them slower.

`page.addInitScript()` sidesteps the database entirely: the script runs before Lumio's own `<script>` tag, overwriting whatever value the server injected. This makes flag tests fast, isolated, and safe to run in parallel — no shared state.

## Part 3 — Security Workflow Testing (formerly M65)

### What's in Lumio at this point

Lumio's security infrastructure (from earlier modules) includes:
- **NextAuth.js v5** session management with JWT tokens stored in `next-auth.session-token` cookie
- **CSRF protection** via `next-auth`'s built-in CSRF token mechanism (embedded in each form)
- **Route protection** via middleware in `lumio/middleware.ts` — redirects unauthenticated requests to `/login`
- **Admin-only routes** at `/admin/**` — redirect non-admin sessions to `/dashboard`
- **React rendering** with JSX (which HTML-escapes all interpolated values by default)

### The XSS situation in Lumio

React's JSX automatically escapes interpolated values — `{userInput}` renders the text, not the HTML. This prevents the most common stored XSS vector. The risk exists in two places:

1. **`dangerouslySetInnerHTML`** — used in the task description renderer when rendering Markdown. TipTap sanitizes HTML before passing it to `dangerouslySetInnerHTML`.
2. **SVG rendering** — SVG injection is a category React doesn't protect against out of the box.

The M65 exercises test the simpler title field, which uses standard JSX interpolation and should be immune to XSS by construction.

### API key page

`/settings/api` displays the user's Lumio API key. The key value is visible in the DOM (with a copy button) and has `data-testid="api-key-value"`. This is the target for the screenshot masking exercise — if a test screenshot is uploaded to a public artifact store, an unmasked key is a credential leak.

### CSRF in forms

Every Lumio form that performs a state-changing action (settings save, password change, workspace delete) includes:
- A hidden `<input name="csrf_token">` populated by the server
- The client reads the value and sends it as the `X-CSRF-Token` request header
- The server validates the header matches the session-bound token

## Part 4 — OAuth & SSO Deep Dive (formerly M66)

### What's in Lumio at this point

Lumio's authentication stack uses NextAuth.js v5 with the GitHub OAuth provider configured in `lumio/lib/auth.ts`. NextAuth handles:
- The authorization redirect to `github.com/login/oauth/authorize`
- The callback route at `/api/auth/callback/github`
- The token exchange via `github.com/login/oauth/access_token`
- Session storage (JWT containing `access_token` and `refresh_token`)
- Refresh token rotation on session access

### Why PKCE matters for Lumio

Lumio is a browser-based SPA — there's no client secret that can be kept confidential in the browser. PKCE replaces the client secret with a per-request challenge/verifier pair. Without PKCE, an attacker who intercepts the authorization code (via a malicious redirect URI or browser extension) could exchange it for tokens. With PKCE, the code is useless without the `code_verifier` that was only ever in the legitimate app.

### Refresh token rotation

NextAuth rotates refresh tokens on each use — when the access token expires, the refresh token is exchanged for a new access token + new refresh token. The old refresh token is invalidated. If a user revokes access from their GitHub account settings, the next refresh attempt returns `RefreshAccessTokenError` — NextAuth clears the session and logs the user out.

### M17 vs M66 distinction

- **M17**: Automates the user experience of the OAuth login. Tests that clicking "Sign in with GitHub", completing the provider flow, and landing on `/dashboard` works end-to-end. Requires either a real test account or a stub provider.
- **M66**: Tests the OAuth protocol implementation. Verifies PKCE parameters, token response handling, refresh token rotation, and error recovery. Uses `page.route()` to mock the provider entirely — no test account needed.

## Part 5 — Chatbot & Rich UI Interaction (formerly M67)

### What's in Lumio at this point

M67's branch adds Lumio's AI chat panel — a collapsible sidebar that lets users ask questions about their workspace ("What tasks are overdue?", "Summarize this week's activity"). The panel communicates with the `/api/chat` endpoint which streams tokens via SSE.

### Chat panel anatomy

```
[chat-panel]
  [chat-message-list]
    [chat-message]  (data-role="user" or data-role="assistant")
    [chat-message]
    ...
  [chat-typing-indicator]  (hidden when not streaming)
  [chat-input]            (contenteditable div, not a textarea)
  [chat-send-button]
```

The `chat-input` is a `contenteditable` div — rich text input is planned for a future sprint, so TipTap wasn't used here. The component dispatches a submit event on Enter keypress.

### TipTap editor context

The task detail panel's description field uses TipTap in an iframe (`[data-testid="tiptap-frame"]`). This matches the M24 pattern. The iframe approach isolates TipTap's CSS from the rest of the app.

### Streaming response format

The `/api/chat` endpoint streams using SSE with this format:

```
data: {"token":"word"}

data: [DONE]

```

The frontend accumulates tokens into the assistant message element. The `[DONE]` sentinel hides the typing indicator and marks the stream as complete.

### Testing considerations

- The real `/api/chat` endpoint calls an external AI provider (Claude API). Always mock this in tests to avoid latency, cost, and flakiness.
- The mock response body in `MOCK_CHAT_SSE` produces "You have 3 overdue tasks." — deterministic content suitable for `toContainText()` assertions.

## Part 6 — CMS & Admin Panel Automation (formerly M68)

### What's in Lumio at this point

Lumio's admin panel at `/admin` (introduced in M25–M30) includes:
- `/admin/users` — sortable, filterable, paginated user table (columns: Name, Email, Role, Joined, Status)
- `/admin/settings` — workspace name, logo upload, feature flag toggles
- `/admin/workspaces` — workspace management table
- `/admin/analytics` — charts and export

### User table structure

The user table is built with a custom React component (not a library like TanStack Table). It uses:
- `<th>` with `aria-sort` for sortable columns
- A filter input with `placeholder="Filter by email"` above the table
- Checkbox in each row's first cell for selection
- A `data-testid="bulk-actions-toolbar"` toolbar that appears when any checkbox is checked
- A `data-testid="pagination-status"` element showing "X–Y of Z users"
- "Previous page" / "Next page" buttons with those exact `aria-label` values

### Logo upload

`/admin/settings` has a workspace logo uploader. The UI shows a branded drop zone ("Click to upload or drag and drop"); clicking it reveals a hidden `<input type="file">`. The test uploads directly to the file input via `setInputFiles()`.

The fixture file `tests/fixtures/logo.png` is a small 32×32 PNG provided in the repo for upload tests (same file used in M22).

### Test data

The test database (seeded in `globalSetup`) creates 15 test users:
- 1 admin (`admin@lumio.test`)
- 14 members with emails like `member01@lumio.test` through `member14@lumio.test`

This gives predictable pagination (10 per page: page 1 has rows 1–10, page 2 has rows 11–15 plus header).

## Part 7 — SEO & Meta Verification (formerly M69)

### What's in Lumio at this point

By M69 (within the M63–M70 feature batch), Lumio's marketing pages have been fully instrumented with SEO metadata. Every public-facing page includes:

- A descriptive `<title>` unique to that page
- A `<meta name="description">` with a 150–160 character summary
- The three required Open Graph tags: `og:title`, `og:description`, `og:image`
- A `<link rel="canonical">` pointing to the canonical production URL

### Public marketing pages

| Path | Title |
|------|-------|
| `/` | Lumio — Team Productivity |
| `/pricing` | Pricing — Lumio |
| `/blog` | Blog — Lumio |
| `/docs` | Documentation — Lumio |
| `/changelog` | Changelog — Lumio |

Each page uses a different title to avoid the duplicate-title SEO penalty.

### JSON-LD on the landing page

The landing page (`/`) includes a `<script type="application/ld+json">` tag with a `SoftwareApplication` schema:

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Lumio",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web"
}
```

This enables search engines to display rich result cards with the app name and category.

### robots.txt

`/robots.txt` is served statically and allows all crawlers:

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Sitemap: https://lumio.io/sitemap.xml
```

The `/api/` and `/admin/` paths are intentionally blocked. Only the root `/` path is tested for "Disallow: /" — blocking `/api/` is fine and expected.

### sitemap.xml

`/sitemap.xml` is dynamically generated at build time and lists all public marketing and docs pages. Each `<loc>` entry uses the production domain `https://lumio.io/...`.

### Why test SEO with Playwright

Lumio's marketing team runs A/B tests on landing page copy and developers deploy new page variants frequently. Without automated SEO assertions, a misconfigured template could ship without `og:image` or with a placeholder title — and the regression would go unnoticed until search traffic data shows a drop weeks later.

## Part 8 — Broken Link & Navigation Monitoring (formerly M70)

### What's in Lumio at this point

By M70, Lumio is a fully built application with multiple navigation layers:

**Header navigation** (public, all pages):
- `/` — Landing
- `/pricing` — Pricing
- `/docs` — Documentation
- `/blog` — Blog
- `/changelog` — Changelog

**Footer links** (public):
- `/privacy` — Privacy Policy
- `/terms` — Terms of Service
- `/about` — About
- `/changelog` — Changelog
- `/docs/api` — API Reference

**In-app sidebar navigation** (protected, requires auth):
- `/dashboard` — Dashboard
- `/projects` — Projects
- `/members` — Members
- `/settings` — Settings
- `/notifications` — Notifications

### Redirect behavior

Unauthenticated access to any `/dashboard`, `/projects`, `/members`, `/settings`, or `/notifications` path triggers an automatic redirect to `/login`. The redirect is a server-side 302, so `page.goto('/dashboard')` lands on `/login` for unauthenticated test contexts.

### Anchor links on the pricing page

The pricing page (`/pricing`) includes several in-page anchor navigation links:
- `#features` — Feature comparison table
- `#faq` — Frequently asked questions
- `#enterprise` — Enterprise plan details

These anchor links appear in the pricing page's sticky side nav and are commonly clicked from the header navigation, making them critical to keep intact.

### 404 behavior

Lumio uses Next.js's built-in `not-found.tsx` page, which correctly returns HTTP status 404 for unknown routes. This is important — some Next.js misconfigurations return 200 with the error UI, which causes search engines to index the 404 page as content.

### Why link monitoring matters for Lumio

Lumio's marketing team frequently adds blog posts, updates docs URLs, and renames feature pages. Without automated link checking, a renamed `/docs/getting-started` to `/docs/quickstart` would leave broken links scattered across the marketing site, eroding both SEO and user trust.
