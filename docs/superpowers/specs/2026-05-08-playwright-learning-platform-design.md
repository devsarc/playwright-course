# Design: Playwright Learning Platform (GitHub Skills Style)

**Date:** 2026-05-08
**Status:** Approved

---

## Overview

A GitHub Skills-style learning platform that teaches Playwright comprehensively — not just testing, but the full spectrum of browser automation use cases. Learners build **Lumio**, a real-world SaaS productivity app (Linear + Notion hybrid), incrementally across 93 modules while writing the corresponding Playwright automation at every step.

The platform is a single GitHub monorepo with one branch per module. GitHub Actions validates each module's exercises and posts structured feedback on commits.

---

## Target Audience

Developers with basic programming understanding. Focus throughout is on **conceptual knowledge, patterns, practices, and decision-making** — not syntax memorization.

---

## The Target Application: Lumio

Lumio is a team productivity SaaS built with **Next.js 14 (App Router) + TypeScript**. Every feature exists because a later module needs to automate it.

### Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js v5 (credentials + GitHub OAuth) |
| Real-time | Native WebSocket server + SSE endpoints |
| Rich text | TipTap (ProseMirror-based, renders in iframe) |
| Drag & drop | @dnd-kit |
| Charts | Recharts |
| i18n | next-intl (English + French) |
| Feature flags | DB-backed custom implementation |
| PDF export | Puppeteer server-side PDF generation |
| PWA | Custom service worker + manifest.json |
| CSS | Tailwind CSS + Radix UI |
| Desktop | Electron client |
| Extension | Chrome MV3 extension |

### App Sections

- **Marketing** — landing, pricing, docs (public), blog, changelog, SEO-rich public project directory
- **Auth** — login (credential + GitHub OAuth), signup, forgot/reset password, email verification
- **Onboarding** — workspace creation, team invite, first project
- **App (protected)** — dashboard (charts/analytics), kanban projects (drag-drop), task detail (TipTap rich text in iframe, file attachments, comments), docs/wiki, members (presence indicators), settings, notifications (WebSocket + SSE)
- **Admin panel** — user management (sortable/filterable/paginated table), workspace management, feature flags (on/off toggle), analytics, media upload
- **Chat panel** — AI assistant interface (send/receive messages, typing indicators)
- **REST API** — key-authenticated endpoints for all resources, WebSocket upgrade, SSE stream, PDF export

### Package Structure

The repo root holds Playwright tooling. The Lumio app lives inside `lumio/`. These are deliberately separate: root `package.json` owns `@playwright/test` and all test dependencies; `lumio/package.json` owns Next.js and all app dependencies. `playwright.config.ts` at the root uses `webServer` to start Lumio before tests run.

```
repo-root/
├── lumio/                        The Next.js application
│   ├── app/                      App Router pages and layouts
│   ├── components/               UI, board, editor, charts, notifications, layout
│   ├── lib/                      db.ts, auth.ts, ws.ts, flags.ts, pdf.ts
│   ├── prisma/                   schema.prisma + seed.ts
│   ├── messages/                 en.json, fr.json
│   ├── public/                   manifest.json, sw.js, static assets
│   ├── extension/                Chrome MV3 extension (present from M71 branch onward)
│   ├── electron/                 Electron client — main.ts, preload.ts, tray.ts (from M72 onward)
│   └── package.json              App dependencies only (Next.js, React, Prisma, etc.)
│
├── tests/                        All Playwright test files (NOT inside lumio/)
│   ├── fixtures/                 Shared fixtures file — grows each module
│   ├── solved/                   Pre-committed solutions for all previous modules
│   │                             (read-only reference — learner does not modify)
│   └── module-XX-topic/          Current module's exercise files
│       ├── README.md
│       ├── exercise.spec.ts
│       ├── lumio-context.md
│       └── hints.md
│
├── playwright.config.ts          Root-level Playwright config (owns testDir, webServer, projects)
├── package.json                  Test tooling only (@playwright/test, axe-core, etc.)
├── .env.test                     Test environment variables
└── .github/
    └── workflows/
        └── module-check.yml
```

> **Why tests outside `lumio/`:** Playwright tests are not part of the Next.js build. Keeping them at the repo root makes the `playwright.config.ts` the single authority over test configuration and avoids conflating app dependencies with test dependencies.

---

## Layered Learning Strategy

Several topics appear in an introductory module early in the curriculum and then again in a dedicated deep-dive module later. This is intentional — not duplication. The principle:

- **Introduction module:** teaches the concept exists, demonstrates the most common use, exercises the basic case
- **Deep-dive module:** teaches edge cases, advanced patterns, decision-making, and the mechanism behind the abstraction

The following topic pairs follow this pattern and should be implemented accordingly:

| Topic | Introduction | Deep Dive |
|-------|-------------|-----------|
| frameLocator / iframes | M02 (listed in locator taxonomy, not exercised) | M24 (taught and exercised in full) |
| `context.setOffline()` | M13 (as network failure simulation in API tests) | M37 (as PWA offline behavior testing) |
| `page.addInitScript()` | M13 (concept introduced) | M64 (applied for feature flag injection) |
| `dragTo` vs mouse drag | M03 (`dragTo` high-level API) | M23 (`page.mouse` low-level for dnd-kit which ignores synthetic events) |
| `page.coverage` | M29 (concept: what coverage data is and why) | M62 (mechanism: how CDP exposes it) |
| WebSocket + SSE | M32 (basic assertions, delivery testing) | M60, M61 (frame-level analysis, mock servers, protocol decisions) |
| OAuth flows | M17 (redirect automation, popup handling, mock OAuth) | M66 (full OAuth2 code flow, SAML, refresh tokens) |
| `webServer` config | M00 (basic setup: point at dev server, first passing test) | M41 (all options: command/url/reuseExistingServer/timeout, multiple instances, env-specific config) |
| HAR files | M15 (recording and replay-based mocking) | M30 (in-depth timing analysis, bottleneck identification, curl generation from Trace Viewer) |
| Security workflow | M19 (RBAC, 403 unauthorized flows, CAPTCHA strategy, MFA, API key management) | M65 (CSRF token verification, XSS sanitization, sensitive data masking in test artifacts) |

---

## Note on M09 and Authentication

M09 (Global Setup & Teardown) teaches `globalSetup`/`globalTeardown` using a Prisma seed script. At M09, learners have not yet covered authentication (`storageState`, auth-aware global setup in M16). Therefore:

- M09's seed script only creates non-auth data: a test workspace, projects, and tasks — using a **pre-seeded test user baked into the database migration**, not created dynamically in the setup script.
- Auth-aware global setup (logging in once and saving `storageState` for reuse) is introduced explicitly in M16, which revisits `globalSetup` in that context.

---

## Note on M53 (Vue Component Testing)

Lumio is a React/Next.js application and does not contain Vue components. M53 uses a minimal standalone **`vue-demo/`** component bundled on that branch (a simple task form built in Vue). The lesson explains: in the real world, you encounter Vue components in Vue projects or as embedded third-party widgets in hybrid apps. The exercises against `vue-demo/` are sufficient to transfer to either scenario. The Lumio context for M53 is "understanding the CT toolchain for Vue so you can apply it when you encounter Vue components in the wild."

---

## Note on Developer Tooling Module Ordering

Watch mode (M10) is taught in Phase 2 before learners have written many tests. Inspector and codegen (M42) are taught in Phase 11 after learners have 41 modules of experience writing tests manually. This ordering is deliberate: learners who write tests by hand first develop a stronger mental model of locators and assertions; codegen then becomes a productivity accelerator rather than a crutch. If introduced too early, learners never develop the reasoning skills that make them effective when codegen produces wrong or brittle output.

---

## Curriculum: 93 Modules, 21 Phases

All 59 use cases from requirements and all topics from both source docs (`research.md` + `playwright.md`) are covered.

Each module row shows: **module number**, **title**, **Lumio task** (what gets built in Lumio and what the learner tests), and **key concepts**.

---

### Phase 0 — Environment & How Playwright Works

| # | Module | Lumio Task | Key Concepts |
|---|--------|------------|-------------|
| 00 | Setup & Project Structure | Configure `playwright.config.ts` with `webServer` pointing to Lumio dev server; run first test against landing page | `playwright-core` vs `@playwright/test` distinction, `webServer` config, headless vs headed, `npx playwright install`, first passing test |
| 01 | How Playwright Works Internally | Awareness module — no exercise | Browser/BrowserContext/Page hierarchy, auto-waiting mechanism, isolation model, client-server architecture (conceptual, not internals) |

---

### Phase 1 — Locators & Actions

| # | Module | Lumio Task | Key Concepts |
|---|--------|------------|-------------|
| 02 | Locators — Finding Elements | Find every interactive element on Lumio's landing page: heading, CTA, nav links, pricing cards, footer links | `getByRole`, `getByLabel`, `getByText`, `getByPlaceholder`, `getByAltText`, `getByTitle`, `getByTestId`, CSS/XPath (when to use, when not to), chaining, `.filter()`, `.nth()`. `frameLocator()` is introduced as part of the locator taxonomy but exercised fully in M24. |
| 03 | Actions — Interacting with Elements | Interact with Lumio's navbar, mobile menu, hero CTA, and feature tabs | `click`, `dblclick`, `hover`, `focus`, `fill`, `type`, `clear`, `press`, `pressSequentially`, `setChecked`, `selectOption`, `tap`. `dragTo` is introduced as a high-level drag action; the low-level `page.mouse` drag approach for complex DnD libraries is covered in M23. |
| 04 | Assertions — Verifying State | Assert Lumio landing page content, pricing card states, active nav link, URL after CTA click | All `toHave*` / `toBe*` matchers, soft assertions (`expect.soft()`), `expect.poll()` for non-Playwright values, custom assertion error messages |
| 05 | Navigation & Page State | Navigate between all Lumio public pages; assert correct load state after each transition | `goto`, `reload`, `goBack`, `goForward`, `waitForURL`, `waitForLoadState` (load/domcontentloaded/networkidle), `waitForResponse`, `waitForRequest`, `waitForFunction`, when to use each vs relying on auto-wait |

---

### Phase 2 — Test Runner & Organization

| # | Module | Lumio Task | Key Concepts |
|---|--------|------------|-------------|
| 06 | Test Runner Fundamentals | Organize Lumio landing page and pricing tests into describe blocks; conditionally skip a test on WebKit | `test.describe`, `beforeEach/afterEach/beforeAll/afterAll`, `test.only`, `test.skip`, `test.fixme`, `test.fail`, `test.slow`, custom annotations, `@tags`, conditional skipping by browser/OS |
| 07 | Configuration Deep Dive | Set up a multi-project Lumio config with Chromium, Firefox, WebKit, and a mobile project | Full `playwright.config.ts` structure, `use`, `projects`, timeout hierarchy (test vs expect vs navigation), `testDir`, `outputDir`, env vars in config |
| 08 | Fixtures & Dependency Injection | Build a reusable `lumioPage` fixture that navigates to Lumio and a `loggedInPage` fixture that reuses stored auth | Built-in fixtures (`page`, `context`, `browser`, `browserName`, `request`), `test.extend()`, fixture scopes (test vs worker), fixture composition, overriding built-in fixtures |
| 09 | Global Setup & Teardown | Seed Lumio's database before the test suite with a test workspace and projects; clean up after | `globalSetup`, `globalTeardown`, seeding via Prisma in setup, sharing state to tests via JSON file. Note: M09 seeds non-auth data only; a pre-seeded test user comes from the migration. Auth-aware global setup is introduced in M16. |
| 10 | Watch Mode & Developer Workflow | Use `--watch` mode while iteratively developing a Lumio signup form validation test; filter to just the failing test | `npx playwright test --watch`, `--ui` mode (UI Mode), filtering by file/name/project/grep, VS Code Playwright extension integration |
| 11 | Retries & Flakiness Management | Add retries to a Lumio test that checks a success toast appears briefly after a login action; diagnose why retries alone don't fix flakiness | `retries` config, `test.retry()`, `test.info().retry` for adaptive behavior, flakiness categories (timing/data/environment/selector), when to retry vs fix root cause |

---

### Phase 3 — Network & APIs

| # | Module | Lumio Task | Key Concepts |
|---|--------|------------|-------------|
| 12 | Network Interception & Mocking | Mock Lumio's project list API to return an empty state; simulate a 500 error to test the error boundary; modify a response to inject extra data | `page.route()` vs `context.route()` (scope distinction), `route.fulfill()`, `route.abort()`, `route.continue()`, URL pattern/glob/regex matching, modifying request and response bodies |
| 13 | Advanced Network Patterns | Inject a test flag via `addInitScript` to enable a hidden Lumio feature; monitor all outgoing API calls; simulate a failed upload request | `page.addInitScript()` (concept introduced here; applied for feature flags in M64), simulating slow networks, `page.on('request')`, `page.on('response')`, `page.on('requestfailed')`, `context.setOffline()` as network failure simulation (PWA context covered in M37) |
| 14 | API Testing with `request` Fixture | Test all Lumio REST endpoints directly: create workspace, create task, get tasks, delete task; verify API key auth | `context.request`, all HTTP verbs, setting headers and auth tokens, asserting status/headers/body, using API calls in `beforeEach` to set up test state faster than UI, `baseURL` config |
| 15 | HAR Recording & Network Analysis | Record a HAR file of the Lumio dashboard load; replay it to run dashboard tests without a live backend | Recording HAR files via Playwright, `page.routeFromHAR()` for replay-based mocking, analyzing request timings, HAR vs manual mocking decision framework |

---

### Phase 4 — Authentication & Sessions

| # | Module | Lumio Task | Key Concepts |
|---|--------|------------|-------------|
| 16 | Authentication Patterns | Log into Lumio once in `globalSetup`, save `storageState`, reuse across all tests; create separate state files for admin and member roles | Credential login flow, `storageState` save/reuse, auth-aware `globalSetup` (revisiting M09 with auth context), multiple role state files, clearing auth between tests when isolation is needed |
| 17 | OAuth & SSO Flows | Automate Lumio's GitHub OAuth login flow including the popup window; mock the OAuth provider to skip the real GitHub redirect in CI | OAuth redirect automation, `context.waitForEvent('page')` for OAuth popups, storing OAuth tokens, mock OAuth provider pattern for speed and CI reliability |
| 18 | Cookie, Storage & Session Management | Test that Lumio's theme preference persists in localStorage across page reloads; test that session expires correctly; manipulate cookies to simulate a returning user | Reading/writing cookies, `localStorage`/`sessionStorage` manipulation, `context.addCookies()`, `context.clearCookies()`, `context.storageState()` snapshots, testing session expiry |
| 19 | Security Workflow Testing | Test that a Lumio member cannot access admin routes; test that an unauthenticated user is redirected to login; test CAPTCHA bypass strategy for test environments | RBAC (role-based access control) testing, unauthorized access (403 flows), CAPTCHA strategy (why you disable it in test environments and how), MFA flow automation, API key management testing |

---

### Phase 5 — Forms & Interactions

| # | Module | Lumio Task | Key Concepts |
|---|--------|------------|-------------|
| 20 | Form Automation & Validation | Test Lumio's workspace creation form: fill all fields, test validation errors on empty submit, test slug uniqueness error, submit successfully | All input types (text, password, email, number), custom dropdowns (Radix Select), date pickers, range sliders, validation error messages, required field errors, submitting via Enter key |
| 21 | Dialog & Alert Handling | Test Lumio's "delete workspace" confirm dialog; test the "unsaved changes" prompt when navigating away from a partially filled form | `page.on('dialog')` for native browser dialogs, handling alert/confirm/prompt, auto-dismissing, `beforeunload` dialogs, dialogs triggered by specific user actions |
| 22 | File Upload, Download & PDF | Upload an avatar image in Lumio settings; attach a PDF to a task; trigger the report PDF export and assert the downloaded file | `setInputFiles()`, drag-and-drop file upload, download event listener, saving downloaded files for assertion, `page.pdf()` (Chromium-only, how and when to use), testing PDF exports |
| 23 | Advanced Input & Interactions | Reorder Lumio kanban cards via mouse drag (dnd-kit does not respond to `dragTo`); copy a task share link via clipboard; test tooltip appearance on hover | `page.keyboard` (press/down/up/type), `page.mouse` (move/click/dblclick/wheel), **low-level drag-drop via `page.mouse`** for DnD libraries that ignore synthetic events (contrast with `dragTo` in M03), clipboard read/write via `page.evaluate()`, touch events, hover/tooltip state assertions |
| 24 | iFrame & Shadow DOM | Test Lumio's TipTap rich text editor (which renders inside an iframe); interact with a shadow DOM input inside a custom Radix component | `frameLocator()` in depth, `page.frame()` by name/URL, nested iframes, shadow DOM with `:shadow` pseudo-selector, cross-origin iframe limitations and workarounds |

---

### Phase 6 — Visual Testing

| # | Module | Lumio Task | Key Concepts |
|---|--------|------------|-------------|
| 25 | Screenshot Testing | Capture full-page screenshots of Lumio's dashboard, task card component, and admin panel for documentation purposes | `page.screenshot()` (full page vs viewport), `locator.screenshot()` for element-level capture, clip region, automatic screenshots on test failure, `page.pdf()` for PDF snapshots |
| 26 | Visual Regression Testing | Establish visual baselines for Lumio's dashboard, kanban board, and task modal; intentionally change a CSS value and detect it; practice the rebaselining workflow | `toHaveScreenshot()`, baseline creation and storage, pixel diff tolerance thresholds, **snapshot rebaselining workflow** (`--update-snapshots` flag, git patch approach, conflict markers), per-platform snapshot directories, masking dynamic content (timestamps, avatars) |
| 27 | ARIA Snapshot Testing | Assert the accessibility tree structure of Lumio's task creation modal and kanban board; use the InspectorTab in Trace Viewer to generate the initial ARIA snapshot | `toMatchAriaSnapshot()`, reading the accessibility tree as YAML, using Trace Viewer InspectorTab to generate snapshots, when ARIA snapshots are more appropriate than visual snapshots, updating ARIA snapshots after intentional UI changes |

---

### Phase 7 — Accessibility & Performance

| # | Module | Lumio Task | Key Concepts |
|---|--------|------------|-------------|
| 28 | Accessibility Testing | Run axe audit on all major Lumio pages; test keyboard navigation through the task creation flow end-to-end; assert focus management after modal open/close | `@axe-core/playwright`, axe scan configuration, WCAG level filtering (A/AA/AAA), keyboard navigation testing, tab order assertions, focus management, ARIA roles/labels, color contrast detection via axe |
| 29 | Performance Testing & Measurement | Measure Lumio dashboard LCP and TTFB; collect JS/CSS coverage on the login page; assert that dashboard load is under a budget threshold | Navigation Timing API via `page.evaluate()`, LCP/FID/CLS/TTFB collection, CDP performance metrics, `page.coverage` (concept: what coverage data is and why — CDP mechanism covered in M62), performance budget assertions, tracking regressions over time |
| 30 | HAR & DevTools Deep Analysis | Record a full HAR of Lumio's dashboard load; identify the three slowest requests; generate a curl command from the Trace Viewer network tab to reproduce an API call | HAR analysis in depth, request timing breakdown, identifying bottlenecks, generating curl/fetch from Trace Viewer network tab, CDP network throttling for controlled perf testing |

---

### Phase 8 — Multi-Tab, Real-Time & Complex Flows

| # | Module | Lumio Task | Key Concepts |
|---|--------|------------|-------------|
| 31 | Multi-Tab & Popup Management | Open a Lumio task in a new tab from the dashboard; handle the GitHub OAuth popup within the login flow | `context.waitForEvent('page')` for new tab events, popup window handling, OAuth in popups, coordinating assertions across tabs, closing and switching tabs |
| 32 | WebSocket & SSE Testing | Assert that a Lumio real-time notification arrives within 2 seconds of a task being created by another user; assert the SSE-powered activity feed updates | `page.on('websocket')`, WebSocket frame monitoring, SSE (EventSource) testing, asserting real-time data delivery within a timeout, reconnection behavior. Note: this introduces basic patterns; M60/M61 go deeper into mock servers and frame-level analysis. |
| 33 | User Journey Simulation | Automate the complete Lumio new-user journey: signup → email verification → create workspace → invite member → create project → assign a task → verify assignee sees it | Multi-step journey scripting, maintaining state across steps, branching on condition, simulating two simultaneous users with separate browser contexts |

---

### Phase 9 — Cross-Browser & Mobile

| # | Module | Lumio Task | Key Concepts |
|---|--------|------------|-------------|
| 34 | Cross-Browser Testing Strategy | Run the Lumio auth and dashboard test suite across Chromium, Firefox, and WebKit; identify and fix a WebKit-specific date input issue | Chromium vs Firefox vs WebKit behavior differences, browser-specific CSS quirks, `projects` config for all browsers, WebKit flakiness patterns and mitigations |
| 35 | Mobile Emulation & Responsive Testing | Test Lumio on iPhone 14 and iPad presets; assert the nav collapses to a hamburger menu; test dark mode rendering and print stylesheet | `devices[]` presets (iPhone, Android, iPad), custom viewport + user agent, touch event emulation, `page.emulateMedia()` for dark/light mode and print stylesheets, responsive breakpoint assertions, orientation changes |
| 36 | Geolocation, Permissions & Device APIs | Test Lumio's workspace timezone detection feature; test that the camera permission prompt appears and is handled | `context.grantPermissions()`, `context.setGeolocation()`, `context.setTimezone()`, `context.setLocale()`, testing permission-denied flows and their UI feedback |
| 37 | Offline, PWA & Service Workers | Test that Lumio's offline fallback page shows when network is cut; test that previously loaded tasks are served from service worker cache offline | `context.setOffline()` in PWA context (contrast with network simulation use in M13), service worker caching verification, offline fallback page, background sync behavior, PWA installability criteria |

---

### Phase 10 — Scale & CI/CD

| # | Module | Lumio Task | Key Concepts |
|---|--------|------------|-------------|
| 38 | Parallel Execution & Test Isolation | Run the full Lumio test suite with `fullyParallel: true`; diagnose and fix a test that fails only in parallel due to shared data | `fullyParallel`, `workers` configuration, fresh BrowserContext per test as the isolation boundary, avoiding shared mutable state, worker-scoped fixtures for expensive shared setup |
| 39 | Sharding for Large Suites | Shard the Lumio suite across 4 shards in a GitHub Actions matrix; merge blob reports into a single HTML report | `--shard` flag (1/4, 2/4…), CI matrix configuration for sharding, blob reporter for capturing per-shard output, `createMergedReport()` for combining sharded results into one report |
| 40 | CI/CD Pipeline Setup | Build a complete GitHub Actions pipeline for Lumio: parallel matrix across browsers, cached binaries, uploaded artifacts, PR annotations, JUnit output for a Jenkins consumer | Full GitHub Actions workflow, browser binary caching, uploading HTML reports + traces as artifacts, matrix builds, **GitHub annotations reporter** (displays failures inline in PRs), **JUnit reporter** for CI systems (Jenkins, GitLab), **JSON reporter** for programmatic processing, Docker container execution pattern, cloud grid execution (BrowserStack/Sauce Labs) — when and why |
| 41 | WebServer Config & Test Environment | Configure `webServer` to start Lumio's Next.js dev server before tests and tear it down after; set up `.env.test` with test-specific database URL | `webServer` config options (command, url, reuseExistingServer, timeout), multiple `webServer` instances, environment-specific `playwright.config.ts`, `.env.test` management |

---

### Phase 11 — Debugging & Reporting

| # | Module | Lumio Task | Key Concepts |
|---|--------|------------|-------------|
| 42 | Playwright Inspector & Codegen | Use `codegen` to record a Lumio task creation flow; use the Inspector's locator picker to find a robust selector for the kanban column header; generate assertions from the Inspector UI | `npx playwright codegen`, Inspector locator picker, assertion generation from Inspector, `page.pause()` for mid-test debugging, `PWDEBUG=1` mode, multi-language codegen awareness (JS/Python/C#/Java — same tool, different output). Note: codegen is taught after M41 modules of manual practice so learners understand what it produces and when it's wrong. |
| 43 | Tracing & Trace Viewer | Capture a trace of a failing Lumio multi-step form test; analyze all Trace Viewer tabs to find the root cause; configure `trace: 'on-first-retry'` in CI | `context.tracing.start()` / `stop()` / `stopChunk()`, trace config options, Trace Viewer: action list, console tab, network tab, filmstrip, inspector tab (ARIA snapshots), annotations tab, attachments tab, log tab, live trace viewer during development, `trace: 'on-first-retry'` strategy, generating curl commands from trace network data |
| 44 | Reporters Deep Dive | Configure Lumio's CI to output HTML + JUnit + GitHub annotations simultaneously; understand how blob reports merge across shards; review the Reporter interface to understand what a custom reporter would need to implement | HTML, dot, line, list reporters, JSON reporter, JUnit reporter, GitHub annotations reporter, blob reporter, `createMergedReport`, configuring multiple reporters simultaneously. **Custom reporter:** M44 teaches the `Reporter` interface shape and lifecycle events conceptually — learners understand what a custom reporter does and how to build one, but writing a full production reporter from scratch is an optional extension, not a required exercise. |
| 45 | Debugging Strategies | Diagnose a Lumio test that intermittently fails by combining trace analysis, `page.on('console')` listener, and `locator.highlight()` to verify selector correctness | Post-mortem analysis with Trace Viewer, automatic screenshots on failure, video recording on failure, `page.on('console')` for monitoring browser console output in tests, `locator.highlight()` and `locator.count()` for selector debugging, systematic approach to reproducing production browser bugs |
| 46 | `test.step()` & Runtime Attachments | Add descriptive steps to Lumio's checkout flow test so the Trace Viewer and HTML report show a readable action history; attach a screenshot at a specific assertion point | `test.step()` for grouping actions (improves trace readability and report output), `test.info()`, `testInfo.attach()` for adding screenshots/files to reports at runtime, `testInfo.annotations` for tagging test runs with metadata |

---

### Phase 12 — Architecture & Patterns

| # | Module | Lumio Task | Key Concepts |
|---|--------|------------|-------------|
| 47 | Page Object Model | Refactor Lumio auth tests into `LoginPage`, `DashboardPage`, `TaskModal` POMs | POM rationale (when it helps, when it over-engineers), POM implementation, component objects (sub-POM for reusable UI fragments), POM combined with fixtures |
| 48 | Advanced Fixture Patterns | Build `authenticatedPage` (logged-in page fixture), `adminContext` (admin browser context), and `seededTask` (task pre-created via API) fixtures | Fixture composition, teardown in fixtures, worker-scoped vs test-scoped (when to use each), parameterized fixtures, fixture for pre-seeded database state |
| 49 | Data-Driven Testing | Run Lumio's task creation test across 10 data combinations (different priorities, labels, assignees) from a JSON file | `test.describe()` + loop for parametrized tests, external JSON/CSV data files, when data-driven tests add value vs adding noise, naming parametrized tests clearly |
| 50 | Test Organization & Suite Architecture | Tag all 50+ Lumio tests written so far: `@smoke`, `@regression`, `@e2e`, `@accessibility`, `@visual`; set up `test.fixme()` for three known bugs | Folder/file structure conventions for large suites, shared `fixtures.ts`, organizing by feature vs by type (tradeoffs), full tagging strategy, `test.fixme()` workflow for tracking known failures without deleting tests |

---

### Phase 13 — Component Testing

| # | Module | Lumio Task | Key Concepts |
|---|--------|------------|-------------|
| 51 | Component Testing Foundations | Set up `playwright-ct.config.ts` for Lumio's React component library; mount the `Button` component and assert its variants | CT vs E2E (when each is appropriate), `@playwright/experimental-ct-react` setup, `playwright-ct.config.ts`, `mount` fixture, `unmount`, `update`, microfrontend testing rationale |
| 52 | React Component Testing | Mount and test Lumio's `TaskCard` (props, click events), `NotificationBadge` (count display), and `BoardView` (with theme provider via `beforeMount`) | `defineConfig` for React (Vite + plugin-react), mounting with typed props, asserting component events, `beforeMount` hook for wrapping with providers (ThemeProvider, QueryClientProvider), `afterMount` for post-render assertions |
| 53 | Vue Component Testing | Mount and test a standalone `vue-demo/TaskForm.vue` component (a minimal Vue form bundled on this branch, not part of Lumio) | `defineConfig` for Vue (Vite + plugin-vue), Vue-specific: slots, component events, `ComponentProps<T>`, `beforeMount` for Vue App setup, `afterMount` for accessing `ComponentPublicInstance`. Lesson framing: "Lumio is React-only, but you'll encounter Vue in hybrid codebases or third-party widgets — this is how you'd test them." |
| 54 | Network Mocking in Component Tests | Test Lumio's `TaskList` component in three states: loading, populated (mocked API), and error (mocked 500) using MSW | Router class in CT, custom `RequestHandler`, **MSW (Mock Service Worker) integration** and `bypass()` for passthrough, testing components under different API response conditions, why CT network mocking differs from E2E `page.route()` |

---

### Phase 14 — Specialized Automation

| # | Module | Lumio Task | Key Concepts |
|---|--------|------------|-------------|
| 55 | Web Scraping Fundamentals | Scrape Lumio's public project directory: extract project names, descriptions, and member counts into a structured JSON output | `page.evaluate()` as the core primitive for DOM querying (first in-depth treatment), structured data extraction, handling pagination, waiting for dynamic content, `page.exposeFunction()` for Node.js–browser communication, ethical scraping patterns |
| 56 | Advanced Scraping & Data Extraction | Scrape Lumio project data behind login; handle the "load more" infinite scroll; save results to a CSV | Scraping behind authentication, infinite scroll handling, anti-scraping patterns and how to work around them legitimately, saving extracted data (JSON/CSV), rate limiting and delays |
| 57 | Web Crawling & Link Monitoring | Crawl all pages in Lumio's public docs site; detect all 404 responses; build a site map JSON | Recursive link following, network response status monitoring, 404 detection, site map building, crawl depth limiting, robots.txt awareness |
| 58 | Automated Form Filling & Bots | Build a bot that reads task data from a CSV and auto-fills Lumio's task creation form for each row | Multi-step form automation from a data source, handling dynamic form fields (fields that appear based on prior selections), CAPTCHA strategy (test-env bypass and the ethical/practical rationale), responsible bot patterns (rate limiting, user-agent disclosure) |
| 59 | Screenshot & Demo Generation | Write a scripted Playwright flow that captures a full walkthrough of creating a Lumio project, recording a video and per-step screenshots for a product demo | Video recording of scripted flows, per-step screenshot capture, assembling a demo walkthrough, Playwright as a visual documentation/marketing tool, automated demo generation pattern |

---

### Phase 15 — Real-Time & Advanced Protocols

| # | Module | Lumio Task | Key Concepts |
|---|--------|------------|-------------|
| 60 | WebSocket Deep Dive | Assert the exact JSON payload of a Lumio collaboration event over WebSocket; set up a mock WebSocket server to test edge cases without a live backend | WebSocket frame content assertions, sending WS messages via `page.evaluate()`, mock WebSocket server setup for isolated testing, testing disconnect/reconnect sequences. Contrast with M32: where M32 tests delivery, M60 tests payload content and protocol edge cases. |
| 61 | SSE & Streaming | Assert that Lumio's SSE activity feed delivers events in correct order; test SSE reconnection after the connection drops | EventSource stream testing in depth, event ordering assertions, SSE reconnection behavior, SSE vs WebSocket decision framework (when to choose each in architecture) |
| 62 | CDP Direct Access | Collect JS and CSS coverage on the Lumio dashboard via CDP; throttle the network to 3G and measure the LCP impact | CDP session connection, `page.coverage` via CDP (mechanism behind M29's concept), network throttling via CDP, when to reach for CDP vs Playwright built-in APIs, CDP as an escape hatch |

---

### Phase 16 — Specialized Testing Types

| # | Module | Lumio Task | Key Concepts |
|---|--------|------------|-------------|
| 63 | Localization & i18n Testing | Test Lumio in French locale: assert translated nav labels, French date format on task due dates, correct currency symbol in billing | `locale` context option, translated string assertions, RTL layout testing (set up for a hypothetical Arabic locale), number/date format assertions, multi-language regression strategy |
| 64 | Feature Flag & A/B Testing | Test Lumio with the new "AI suggestions" flag on vs off; assert the correct variant UI renders for each; inject flags via `addInitScript()` without hitting the DB | Cookie-based and URL-param-based flag mechanisms, testing both flag variants, `page.addInitScript()` applied for flag injection (see M13 for concept introduction), CI strategy for flag coverage |
| 65 | Security Workflow Testing | Test that a Lumio member cannot access `/admin`; test CSRF token is present on form submissions; test that XSS input is sanitized and not rendered as HTML | Authenticated vs unauthenticated route testing, permission boundary verification, CSRF token handling, XSS input sanitization (basic flow: enter `<script>` tag, assert it does not execute), sensitive data masking in test artifacts |
| 66 | OAuth & SSO Deep Dive | Automate the full Lumio OAuth2 authorization code flow including PKCE; test the refresh token flow; mock the OAuth provider to test token expiry handling | Full OAuth2 code flow with PKCE, mocking OAuth provider responses for edge cases (expired token, revoked access), SSO/SAML (conceptual pattern + practical approach), refresh token flow automation. Contrast with M17: where M17 automates the happy path, M66 tests edge cases and the full protocol. |
| 67 | Chatbot & Rich UI Interaction | Test Lumio's AI chat panel: type a message, assert the streaming response appears, test the typing indicator | Rich text editor automation (TipTap/ProseMirror/contenteditable), chat interface automation (send message, assert response), streaming text assertion patterns, complex custom component interactions |
| 68 | CMS & Admin Panel Automation | Test Lumio's admin user table: sort by email, filter by role, paginate, bulk-delete three users, upload a workspace logo | Admin CRUD automation, data table sorting/filtering/pagination patterns, bulk operation flows, media upload in admin context |
| 69 | SEO & Meta Verification | Assert all Lumio landing and marketing pages have correct title tags, meta descriptions, OG tags, JSON-LD structured data, and canonical URLs | Title tags, meta descriptions, Open Graph (OG) tags, JSON-LD structured data (parse and assert), canonical URL assertions, robots.txt presence and content, sitemap.xml validation |
| 70 | Broken Link & Navigation Monitoring | Crawl all Lumio in-app navigation links and footer links; assert no 404s; follow all redirect chains and assert the final destination | Automated link checking via network response monitoring, response status assertions, redirect chain following (301/302), anchor link validation, navigation integrity across all pages |

---

### Phase 17 — Platform-Specific Testing

| # | Module | Lumio Task | Key Concepts |
|---|--------|------------|-------------|
| 71 | Browser Extension Testing | Test Lumio's Chrome extension: open the popup, fill the quick-add form, assert the task appears in Lumio; test the content script that highlights Lumio tasks on any web page | `launchPersistentContext` with `--load-extension` and `--disable-extensions-except`, testing extension popup HTML, content script behavior on a host page, background service worker state, `chrome.storage` via `page.evaluate()` |
| 72 | Electron App Testing | Test Lumio's Electron desktop client: launch the app, assert the main window loads, test native tray menu, evaluate code in the main process | Electron automation is built into the base `playwright` package — imported via `import { _electron as electron } from 'playwright'` (no separate package). `electron.launch()` with `executablePath`, `ElectronApplication` API, mapping `BrowserWindow` to Playwright `Page`, `evaluate()` in Electron main process (accessing `app`, `BrowserWindow`, Electron APIs), `loader.ts` startup coordination (conceptual), native menu and dialog testing, app lifecycle (open/close/minimize) |
| 73 | Android Device Automation (Awareness) | Awareness module — no exercise | What Playwright Android automation supports vs Appium, when to choose each, ADB architecture (conceptual), WebView automation on Android, decision framework for mobile native vs mobile web |

---

### Phase 18 — Monitoring & Synthetic

| # | Module | Lumio Task | Key Concepts |
|---|--------|------------|-------------|
| 74 | Synthetic Monitoring Fundamentals | Write a synthetic monitor script for Lumio's critical login journey; understand how it differs from a test | Synthetic monitoring vs RUM (Real User Monitoring), Playwright as a synthetic monitoring engine, key journey selection criteria, integration with monitoring services (Elastic Synthetics, Azure Application Insights, Datadog) |
| 75 | Scheduled Bots & Cron Tasks | Set up a GitHub Actions cron workflow to run the Lumio login monitor every 15 minutes; send a Slack alert on failure | GitHub Actions `schedule` cron trigger, health check bot pattern, Slack/email failure notifications, long-running monitoring loop patterns, automated data collection bots |
| 76 | Uptime & Performance Monitoring | Track Lumio dashboard LCP across 10 deployments; assert LCP stays under 2.5s; compare before/after a simulated performance regression | LCP/load time trending over time, performance budget enforcement in CI, before/after deployment comparison pattern, integrating Playwright metrics with Datadog/Grafana dashboards |

---

### Phase 19 — AI & Modern Tooling

| # | Module | Lumio Task | Key Concepts |
|---|--------|------------|-------------|
| 77 | AI Test Planning (`playwright-test-planner`) | Use the `playwright-test-planner` agent to explore Lumio's kanban board and produce a structured test plan | `playwright-test-planner` agent mechanics, browser exploration for test plan creation, AI-assisted user flow discovery, evaluating and refining AI-generated test plans |
| 78 | AI Test Code Generation (`playwright-test-generator`) | Use the `playwright-test-generator` agent to generate Playwright tests for Lumio's task creation flow from the plan produced in M77 | `playwright-test-generator` agent mechanics, translating browser actions into test code, evaluating generated test quality (robustness of locators, assertion coverage), refining AI output |
| 79 | AI Test Healing (`playwright-test-healer`) | Intentionally break three Lumio tests by changing selectors; use the `playwright-test-healer` agent to auto-diagnose and fix them | `playwright-test-healer` agent mechanics, automated run→inspect→fix cycle, when healing is appropriate vs manual intervention, human-in-the-loop review of healed tests |
| 80 | MCP Server & Agent Integration | Connect Playwright's MCP server to an AI coding agent; use the exposed browser tools to automate a Lumio task creation flow via natural language instructions | Playwright MCP server setup, available browser tools via MCP, agent-driven browser automation, use cases for MCP-based Playwright integration |

---

### Phase 20 — Decision-Making & Real-World Patterns

| # | Module | Lumio Task | Key Concepts |
|---|--------|------------|-------------|
| 81 | Playwright vs Selenium | Analyze which Lumio tests would be harder or easier in Selenium; evaluate migration cost | WebDriver vs CDP/BiDi architecture, speed and flakiness tradeoffs, language support breadth, legacy/enterprise compatibility, when Selenium is the right choice, migration path for existing suites |
| 82 | Playwright vs Cypress | Compare Playwright and Cypress for Lumio's SPA dashboard testing scenario | Multi-browser/multi-tab support differences, developer experience comparison, component testing approaches, when Cypress is a better fit (simpler SPA, DX priority), Playwright migration patterns |
| 83 | Playwright vs Puppeteer & Others | Choose the right tool for Lumio's scraping bot and monitoring scripts | Puppeteer for Chrome-only automation, TestCafe, WebdriverIO, Nightwatch tradeoffs, polyglot team considerations (Python/Java/C# Playwright bindings) |
| 84 | Flakiness Root Cause Analysis | Take 5 real flaky Lumio tests and systematically diagnose the root cause of each using traces, retry counts, and environment analysis | Flakiness categories (timing/data/environment/selector), systematic diagnosis process, using Trace Viewer to isolate root cause, flakiness metrics and tracking, prevention strategies vs retry masking |
| 85 | Test Maintenance & Long-term Strategy | Review the full Lumio test suite for selector brittleness, dead tests, and overcoupled tests; refactor three | Refactoring signals (test that breaks on every UI change is a smell), when to delete tests, coverage vs maintenance cost tradeoff, selector resilience strategy, test documentation standards |
| 86 | CI/CD Pipeline Optimization | Reduce Lumio CI runtime by 40% using changed-file detection, optimized parallelism, and caching | Playwright VCS integration (`detectChangedTestFiles`), selective test runs, optimal worker count, caching strategies for browsers and npm, artifact management at scale |
| 87 | Secrets & Security in Tests | Audit the Lumio test suite for credential exposure; mask secrets in traces and reports; isolate test environment from production | Credential management (env vars vs secrets managers), avoiding credential leaks in HTML reports and trace viewer, masking sensitive values, test environment isolation from production data |
| 88 | Test Health Observability | Build a Lumio test health dashboard showing pass rate trend, flakiness counts, and duration percentiles over the last 30 runs | Test pass rates, duration trends, flakiness counts and trends, coverage metrics, integrating with Allure report, Datadog custom metrics, Grafana dashboards |

---

### Phase 21 — Bringing It All Together

| # | Module | Lumio Task | Key Concepts |
|---|--------|------------|-------------|
| 89 | Smoke Suite for Lumio | Tag and run Lumio's 8 most critical-path tests as `@smoke`; integrate into CI to run on every push in under 60 seconds | Smoke test selection criteria, `@smoke` tagging, running by tag in CI, smoke pass/fail as a merge gate, balancing speed vs coverage |
| 90 | Full Regression Suite Organization | Organize all 90+ Lumio tests into smoke / sanity / regression / full tiers; configure different CI triggers for each tier | Test taxonomy (smoke < sanity < regression < full), nightly vs per-PR vs per-release triggers, test prioritization strategy, managing a growing suite |
| 91 | Production Incident Reproduction | Given a bug report from a simulated Lumio production incident (task status update not persisting on mobile WebKit), write a Playwright test that reproduces it, then fix the bug | Bug-to-test workflow, translating a user report into automation steps, using Playwright to isolate browser/OS-specific bugs, from failing reproduction test to passing regression |
| 92 | End-to-End Review & Capstone | Review the complete Lumio test suite: identify any coverage gaps, refactor two POM classes, confirm all CI jobs are green, write the retrospective | Coverage gap analysis using tag distribution, final refactoring pass, CI/CD integration verification, retrospective on tool and architecture decisions made throughout the course |

---

## Repo & Branch Structure

### Branch Naming

```
module-{2-digit-number}-{kebab-case-topic}           ← learner works here
module-{2-digit-number}-{kebab-case-topic}-solution  ← reference solution
main                                                  ← fully finished state
```

### Awareness Modules

M01 and M73 contain only `README.md` and `lumio-context.md`. They have no `exercise.spec.ts` and no GitHub Actions validation step. They are conceptual reading modules positioned before a hands-on phase opens.

### `tests/solved/` Maintenance Strategy

`tests/solved/` on each branch is **pre-committed** — it contains the solved implementations of all previous modules. This is managed by a **generation script** (`scripts/build-branches.ts`) that builds branches sequentially: branch N is created from branch N-1, with the prior module's solution committed to `tests/solved/module-N-1/` and the new module's scaffold added to `tests/module-N-topic/`. When a solution changes, the script regenerates all downstream branches from that point forward.

### Lumio Growth Schedule

| Modules | What Gets Added to Lumio |
|---------|--------------------------|
| M00–M01 | Landing page, pricing, static marketing pages |
| M02–M11 | Auth pages, onboarding forms |
| M12–M19 | Full REST API, auth complete, API key management |
| M20–M24 | Dashboard, task detail, TipTap rich text editor (iframe), file upload, kanban board (dnd-kit) |
| M25–M30 | Admin panel (with sortable/filterable user table), charts, PDF export |
| M31–M33 | WebSocket notifications, SSE activity feed, presence indicators |
| M34–M37 | PWA service worker, dark mode (emulateMedia), i18n (en + fr), mobile-responsive layout |
| M38–M46 | No new app features — CI workflows, reporter configuration, and tracing infrastructure finalized alongside existing Lumio app |
| M47–M50 | No new Lumio features — Lumio is fully built. These modules refactor existing tests. |
| M51–M54 | Component test config added alongside existing React component library |
| M55–M59 | Public project directory page (scrapable), scripted video recording config |
| M60–M62 | WebSocket mock server infrastructure, CDP hooks |
| M63–M70 | Feature flags admin UI, chat panel (AI assistant), SEO meta on all pages, RTL stylesheet, A/B variant pages |
| M71–M72 | Chrome extension polished, Electron client with tray |
| M73–M88 | No new features — Lumio is complete. Monitoring scripts and AI agent scaffolds added alongside. |
| M89–M92 | No new features — capstone review and integration only |

---

## Lesson Format

Each `tests/module-XX-topic/README.md` follows this structure:

1. **Learning objectives** — what you'll understand (not what you'll code), framed as decisions and mental models
2. **Concept section** — WHY and mental model, patterns, tradeoffs (400–800 words, no code)
3. **Lumio context** — which Lumio feature is being tested and why it's a realistic scenario for this concept
4. **Step-by-step tasks** — numbered steps, each ending with a local validation command
5. **Validate** — command to run before pushing: `npx playwright test tests/module-XX-topic`
6. **Key takeaways** — 3–5 decision patterns to carry forward
7. **Going deeper** — optional Playwright docs links for advanced reading

## Test Scaffold Format

TODOs state precisely **what** to implement, never **how**. Comments explain the reasoning behind the concept.

```typescript
// TODO 2: Use getByRole to locate the primary CTA button ("Get started free").
// Why getByRole? It reflects how assistive technologies navigate the page —
// and it stays valid even when CSS classes or DOM structure changes.
const cta = /* TODO 2 */;
```

---

## GitHub Actions Validation

Each module branch has `.github/workflows/module-check.yml`:

1. Triggers on push to `module-XX-topic` only
2. Installs Node 20, root deps, Lumio deps, Playwright browsers (Chromium for most modules; all three for M07 and M34)
3. Runs: `npx playwright test tests/module-XX-topic --reporter=github --reporter=json:test-results.json`
4. On **success** → posts commit comment naming the specific skills demonstrated + `git checkout` command for the next module
5. On **failure** → reads `test-results.json`, posts which specific TODO failed with a targeted conceptual hint (not a syntax hint)
6. Always uploads HTML report + traces as artifacts with 7-day retention

---

## Coverage Verification

| Source | Status |
|--------|--------|
| All 59 use cases from requirements | ✅ Covered |
| All concepts, architectures, pitfalls, APIs, and metrics from `research.md` | ✅ Covered |
| All user-facing features from `playwright.md`: assertion library (including soft assertions, `expect.poll`, `toMatchAriaSnapshot`), all reporters (dot/line/list/HTML/JSON/JUnit/GitHub/blob/merged), AI agents (planner/generator/healer), component testing (React + Vue, `beforeMount`/`afterMount`, MSW), Electron, all Trace Viewer tabs, Inspector, watch mode, snapshot rebaselining, `webServer` plugin, global setup/teardown, retries, `test.step`, VCS integration (`detectChangedTestFiles`), CDP, MCP server, multi-language codegen awareness, Android automation awareness | ✅ Covered |
| `playwright.md` internal architecture (protocol, serialization, dispatcher, ChannelOwner internals) | ✅ Treated as conceptual overview in M01 — implementation details are not taught |
