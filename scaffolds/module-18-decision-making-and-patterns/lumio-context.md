# Lumio Context: Lesson 18

## Part 1 — Playwright vs Selenium (formerly M81)

### Migration scenario

Lumio's engineering team inherited a 180-test Selenium (Python) suite from the previous contractor. The suite tests the admin panel and auth flows. The team is evaluating whether to migrate to Playwright or maintain the existing suite.

### What would be harder in Selenium

| Lumio feature | Playwright approach | Selenium equivalent |
|---|---|---|
| Multi-tab task links | `context.waitForEvent('page')` | `driver.getWindowHandles()` iteration |
| WebSocket notification delivery | `page.on('websocket')` | No built-in; requires proxy |
| Real-time API mocking | `page.route()` | BrowserMob Proxy setup |
| Shadow DOM in TipTap | `frameLocator().locator()` | `executeScript('shadowRoot...')` |
| Parallel browser contexts | One `test.describe` | Separate WebDriver instances |
| Network performance metrics | Navigation Timing via `evaluate()` | Same — no difference |
| GitHub Actions matrix for browsers | `projects` config | Selenium Grid or manual matrix |

### Migration cost estimate for Lumio

- **180 tests** across admin and auth
- **All locators** need rewrites (Selenium uses CSS/XPath; many use internal class names)
- **All explicit waits** (`WebDriverWait`, `time.sleep()`) must be removed
- **conftest.py** (Python fixtures) → `fixtures.ts`
- **Page objects** port relatively cleanly — method names change but structure survives
- **Estimated effort:** 3 weeks for one senior engineer

### When Selenium remains appropriate for Lumio

The existing Selenium suite covers a regression surface that would cost more to migrate than to maintain. For new test coverage of features added after M80, Playwright is used exclusively. The Selenium suite is in maintenance mode — no new tests are written in Selenium.

This is the most common enterprise decision: run both tools in parallel, add new coverage in the modern tool, and migrate legacy tests opportunistically when features change.

## Part 2 — Playwright vs Cypress (formerly M82)

### The comparison scenario

Lumio's dashboard is a React SPA — exactly the type of app where Cypress was initially designed to excel. The comparison is not hypothetical: the team evaluated both tools during M82's feature planning.

### Where Cypress would work fine for Lumio

| Lumio feature | Cypress compatible? |
|---|---|
| Dashboard charts and widgets | ✅ Single-origin SPA |
| Task creation form | ✅ Standard form interaction |
| Admin user table | ✅ Standard data table |
| Network mocking for API tests | ✅ `cy.intercept()` equivalent |
| Component testing (Button, TaskCard) | ✅ Cypress CT supported |
| Auth cookie/session management | ✅ `cy.session()` equivalent |

### Where Playwright is necessary for Lumio

| Lumio feature | Cypress compatible? |
|---|---|
| GitHub OAuth (cross-origin redirect) | ❌ Different origin mid-test |
| Open task in new tab | ❌ No multi-tab API |
| WebKit-specific date input bug | ❌ No WebKit support |
| Extension popup testing | ❌ No persistent context API |
| Electron desktop client | ❌ Not supported |
| PDF export download | ⚠️ Workaround required |

### The team's decision

Lumio uses Playwright exclusively because:
1. The GitHub OAuth flow (cross-origin) is tested in M17 and M66
2. The WebKit date input bug (M34) would be missed in Cypress
3. The extension tests (M71) require `launchPersistentContext`
4. The Electron client (M72) is Playwright-only

If Lumio had no OAuth, no extension, no Electron client, and no WebKit requirement — Cypress would be a viable choice with a better interactive debugging experience.

### Cypress → Playwright command reference

| Cypress | Playwright |
|---|---|
| `cy.visit('/path')` | `await page.goto('/path')` |
| `cy.get('selector')` | `page.locator('selector')` |
| `cy.contains('text')` | `page.getByText('text')` |
| `.should('be.visible')` | `await expect(loc).toBeVisible()` |
| `cy.intercept()` | `page.route()` |
| `cy.session()` | `storageState` fixture |
| `beforeEach(fn)` | `test.beforeEach(async ({ page }) => fn)` |

## Part 3 — Playwright vs Puppeteer & Others (formerly M83)

### Where Lumio uses Puppeteer alongside Playwright

Lumio's codebase uses two automation tools:

| Usage | Tool | Why |
|---|---|---|
| Test suite (this repo) | Playwright | Multi-browser, auto-wait, built-in test isolation |
| Server-side PDF export | Puppeteer | Chrome-only, embedded in Next.js API route, no test framework needed |
| Screenshot capture (server) | Puppeteer | Same: Chrome-only, embedded Node.js script |

The PDF export at `/api/export/pdf` uses `puppeteer` in headless mode on the server to render the task list and produce a PDF. This is a focused, Chrome-only task — no multi-browser, no auto-wait needed. Replacing it with Playwright would add unnecessary overhead.

### Tool comparison for Lumio's specific needs

| Requirement | Playwright | Puppeteer | Cypress | WDIO |
|---|---|---|---|---|
| Firefox/WebKit tests | ✅ | ❌ | Firefox only | ✅ |
| Multi-tab | ✅ | ✅ | ❌ | ✅ |
| Cross-origin OAuth | ✅ | ✅ | ❌ | ✅ |
| Extension testing | ✅ | ✅ | ❌ | ❌ |
| Electron testing | ✅ | ❌ | ❌ | ❌ |
| Built-in test isolation | ✅ | ❌ | ✅ | ❌ |
| Server-side PDF | ✅ (Chromium) | ✅ | ❌ | ❌ |
| Auto-waiting | ✅ | ❌ | ✅ | Partial |

### Polyglot team scenario

Lumio's QA team uses TypeScript (Playwright). A backend team writing integration tests in Python could use `playwright` (PyPI) against the same Lumio dev server — same locator patterns, same API. A Java team could use `com.microsoft.playwright:playwright`. All three teams run their tests against the same Next.js dev server defined in `playwright.config.ts`, collaborating on a shared test infrastructure without sharing language.

## Part 4 — Flakiness Root Cause Analysis (formerly M84)

### Known flaky tests in the Lumio suite

Before this module's fixes, these tests had intermittent failures in CI:

| Test | Failure rate | Root cause category | Fix |
|---|---|---|---|
| "login redirects to dashboard" | 8% | Timing | Replaced `waitForTimeout(1500)` with `waitForURL(/dashboard/)` |
| "task creation shows success toast" | 12% | Timing | Replaced `waitForTimeout(2000)` with `expect(toast).toBeVisible()` |
| "admin filter reduces row count" | 6% | Data | Added `Date.now()` suffix to test user emails |
| "bulk delete removes 3 rows" | 15% | Data | Added cleanup in `afterEach` to restore deleted rows |
| "kanban card first priority badge" | 4% | Selector | Changed `.nth(0)` to scoped `getByRole` with name |

### Flakiness tracking process

Lumio's CI reports flakiness metrics via the JSON reporter. A nightly job processes `test-results.json` from the last 30 runs and computes:
- Pass rate per test (target: > 99%)
- Retry rate per test (target: < 1%)
- P95 duration per test (for timing regression detection)

Tests with retry rate > 5% are added to the "flakiness backlog" in Linear with the "flaky-test" label. Engineers are expected to diagnose and fix flaky tests before adding new tests to the same file.

### Why retries don't fix flakiness

Retries hide flakiness from the dashboard but don't fix the underlying problem:
- A 15% flake rate with 2 retries appears as ~0.3% failure rate in CI — "green" but actually broken
- Retried tests slow CI (each retry runs the full test again)
- Retries don't protect against the case where all 3 attempts fail simultaneously

Lumio uses `retries: 2` in CI as a safety net for genuine transient infrastructure failures, not as a substitute for fixing flaky tests.

## Part 5 — Test Maintenance & Long-term Strategy (formerly M85)

### Lumio's selector maintenance history

Lumio's test suite accumulated brittleness over its first 40 modules. A refactor of the design system from custom CSS (`task-card`, `sidebar-nav`) to Tailwind utility classes broke 23 tests in a single PR — none of which tested behavior that had actually changed. Post-mortem revealed three root causes:

| Smell | Count | Example |
|---|---|---|
| CSS class selectors | 14 | `locator('.sidebar-nav--active')` broke when class was renamed to `data-state="active"` |
| `nth()` index selectors | 6 | `getByRole('button').nth(0)` shifted when a mobile menu toggle was added |
| Placeholder text selectors | 3 | `getByPlaceholder('Enter email')` broke when copy was changed to 'Your email' |

After the refactor, Lumio's team adopted the selector resilience hierarchy: role > label > text > testId > CSS.

### Lumio's annotation conventions

Lumio's CI reads the JSON reporter output to populate a Linear dashboard with test metadata. The team uses three annotation types:

| Type | Description | Example |
|---|---|---|
| `'issue'` | Link to the bug this test was written for | `https://linear.app/lumio/issue/LUM-NNN` |
| `'tag'` | Coverage tier (`@smoke`, `@sanity`, `@regression`) | `@smoke` |
| `'owner'` | Squad responsible for maintenance | `platform-team` |

Any test without an `'issue'` annotation is flagged in the nightly report as "undocumented" — it may be a dead test or an orphaned regression guard.

### Coverage tier distribution (as of M85)

| Tier | Test count | CI trigger |
|---|---|---|
| `@smoke` | 8 | Every push (< 60s target) |
| `@sanity` | 24 | Every PR merge |
| `@regression` | 58+ | Nightly |
| Untagged | 12 | Nightly (to be migrated) |

The 12 untagged tests are on the maintenance backlog — they need annotation before the next release freeze.

### When to delete a test

Lumio's rule: if a test has not caught a regression in 6 months AND the feature it covers has no user-facing risk, it is a deletion candidate. Deletion frees CI time and removes false confidence. Before deleting, check:

1. Is there a corresponding issue annotation? If yes, is that issue still open?
2. Does the test cover a path that's not covered by any other test in the file?
3. Is the test still testing the same behavior it was written for, or has the feature changed?

If all three answers suggest the test is stale, delete it — don't comment it out.

## Part 6 — CI/CD Pipeline Optimization (formerly M86)

### What Lumio feature is under test

The Lumio CI pipeline runs on GitHub Actions across three browser projects (Chromium, Firefox, WebKit) with two retry attempts on failure. The pipeline must complete within a 10-minute budget per push and a 30-minute budget for the nightly regression run.

### Why this scenario is realistic

Every production SaaS has a CI pipeline that evolves from "run everything" to a multi-tier strategy as the test suite grows. Lumio's suite has 90+ tests — running all of them sequentially on every push is not viable. This module teaches the `testInfo` primitives that enable adaptive behavior, selective execution, and artifact management at scale.

### Relevant app details

- Lumio's GitHub Actions workflow runs the `@smoke` suite on every push and the full suite nightly.
- `retries: 2` is set for CI only (`process.env.CI ? 2 : 0`).
- Per-test timeouts are raised by 30 seconds in CI to account for runner latency.
- Test artifacts (traces, screenshots) are uploaded to GitHub Actions on failure.
- Worker count is set to the number of available CPUs (`os.cpus().length`) in CI.

## Part 7 — Secrets & Security in Tests (formerly M87)

### What Lumio feature is under test

Lumio's test suite includes login flows, REST API calls with API key authentication, admin panel operations, and database seeding scripts. Each of these handles credentials that must never appear in source code, CI logs, or uploaded HTML report artifacts.

### Why this scenario is realistic

Most production test suites accumulate credential leaks over time: a test engineer hardcodes `password123` to get a test passing, a CI workflow echoes env vars for debugging and forgets to remove the step, a trace file is uploaded to GitHub Actions artifacts and contains a real API key in an Authorization header. This module teaches the defensive habits that prevent all three.

### Relevant app details

- Lumio test accounts are seeded by `prisma/seed.ts` against the `lumio_test` database — never the production DB.
- The test API key (`TEST_API_KEY`) is a workspace-scoped read-write key that only exists in the test workspace.
- `.env.test` holds `TEST_EMAIL`, `TEST_PASSWORD`, `TEST_API_KEY`, and `DATABASE_URL` — all pointing at local or CI-isolated resources.
- The Lumio admin UI displays the workspace API key on the Settings > API page — this page must have screenshot masking applied when captured in tests.

## Part 8 — Test Health Observability (formerly M88)

### What Lumio feature is under test

Lumio's engineering team tracks test suite health across nightly CI runs using a custom script that parses the JSON reporter output and posts metrics to a Grafana dashboard. The dashboard shows pass rate trend, flakiness counts per test, and P95 duration over the last 30 days.

### Why this scenario is realistic

Without active observability, test suites degrade silently: flakiness accumulates until CI becomes unreliable, duration creeps up until the pipeline takes 45 minutes, and coverage gaps grow as new features ship without tests. Instrumenting the test suite with `testInfo` metadata and structured annotations is the minimum viable step toward a health dashboard.

### Relevant app details

- Lumio's CI runs nightly with `reporter: [['json', { outputFile: 'results.json' }], ['html']]`.
- The `results.json` is uploaded as a GitHub Actions artifact and then fetched by a nightly Node.js script that posts metrics to InfluxDB.
- Tests annotated with `@smoke` are part of the per-push check; all others run only nightly.
- A flakiness threshold of 5% triggers a Slack alert to the `#test-health` channel.
- The Lumio health dashboard tracks test-level metrics using `testInfo.testId` as the stable DB key.
