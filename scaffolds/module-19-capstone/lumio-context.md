# Lumio Context: Lesson 19

## Part 1 — Smoke Suite for Lumio (formerly M89)

### What Lumio feature is under test

The Lumio smoke suite covers the 8 critical paths that, if broken, affect every user regardless of their role or workflow: landing page visibility, login success, dashboard access, core navigation, unauthorized redirect, API health, and logout.

### Why this scenario is realistic

As a SaaS product, Lumio's most costly incidents are those where users cannot log in, cannot see their data, or encounter a blank page. A smoke suite that catches these scenarios in under 60 seconds on every push is the highest-ROI test investment the team can make. Fine-grained feature tests are valuable, but they don't replace the need for a fast, always-running gate.

### Relevant app details

- Lumio's CI runs smoke tests (`--grep "@smoke"`) on every push to `main` and every PR merge.
- The smoke suite runs on Chromium only; Firefox and WebKit run only on the nightly job.
- Target time: under 60 seconds total for all 8 tests combined.
- The `/api/health` endpoint returns `{ status: 'ok' }` with HTTP 200 when the server and database are reachable.
- Smoke test failures block the PR merge via a required GitHub Actions status check.
- `trace: 'on-first-retry'` is set for the smoke job — not `'on'` — to keep runtime low.

## Part 2 — Full Regression Suite Organization (formerly M90)

### What Lumio feature is under test

By M90, Lumio has 90+ tests organized across all four coverage tiers. This module exercises the tagging and CI trigger strategy that makes the full suite maintainable: smoke tests block merges, sanity tests validate PR integration, regression tests run nightly, and the full suite (including cross-browser and visual) runs before each release.

### Why this scenario is realistic

A suite of 90+ tests without tier organization becomes unmanageable. Developers start skipping CI when it takes 45 minutes, or the nightly job becomes so unreliable that nobody investigates failures. The four-tier model is the industry standard for managing this complexity — it trades some coverage latency (a regression might not be caught until the nightly run) for sustainable CI speed.

### Relevant app details

- Lumio's 90+ tests are tagged: 8 `@smoke`, 24 `@sanity`, 58+ `@regression`, 12 untagged (backlog).
- The CI workflow has three jobs: `smoke` (per push), `sanity` (per PR merge), `regression` (nightly 2am UTC).
- The `@slow` tag (visual regression, cross-browser, i18n exhaustive) is excluded from both smoke and sanity using `--grep-invert "@slow"`.
- Known bugs are tracked with `test.fixme()` rather than deleted — each includes a Linear issue reference in a comment.
- The quarterly suite review checks: tag distribution, tier duration trends, and untagged test count.

## Part 3 — Production Incident Reproduction (formerly M91)

### The Incident

**Incident ID:** LUM-INC-2024-11-15
**Severity:** P2 — core feature broken for a significant user segment
**Reported by:** 3 users on iPhone within 48 hours of the v2.4.0 release

**User report:**
> "When I change a task from 'Todo' to 'In Progress' on my iPhone, the card color changes and it looks like it saved, but when I refresh the page it's back to Todo. This has been happening since the update. Works fine on my MacBook."

### Root Cause (revealed after the fix)

The v2.4.0 release replaced the status update fetch call with a new `StatusPicker` component that used `onTouchEnd` instead of `onClick` for mobile compatibility. The touch event handler ran correctly but passed `e.preventDefault()` before the async save call, which on WebKit caused the browser to treat the interaction as cancelled and not fire the form submission that triggered the API call.

**Fix:** Remove `e.preventDefault()` from the `onTouchEnd` handler and use `onClick` for both touch and mouse events (Playwright's `tap()` fires `onClick` on mobile contexts, so the existing test infrastructure remains valid).

### Why this module exists

Production incidents caused by platform-specific behavior (WebKit vs. Chromium, iOS vs. Android, touch vs. mouse events) are among the hardest to catch before release. This module teaches the complete incident response workflow: read the report, identify the environment, write the failing reproduction test, fix the code, confirm the fix, and convert to a permanent regression guard.

### Relevant app details

- The kanban board uses `@dnd-kit` for drag-and-drop and custom `StatusPicker` dropdown components.
- Task status is saved via `PATCH /api/tasks/:id` with body `{ status: 'in-progress' }`.
- The Lumio test database has a seeded "Test Project" with at least 3 tasks in "Todo" state.
- On mobile WebKit, all click interactions must use `tap()` instead of `click()` to correctly simulate touch events.

## Part 4 — End-to-End Review & Capstone (formerly M92)

### User journey map

```
/signup
  -> /dashboard          (after successful signup)
  -> /projects/new       (via "New project" button)
  -> /projects/{id}      (after project creation)
  -> /projects/{id}/board (kanban board)
```

### Forms and inputs

| Form | Field | data-testid |
|------|-------|-------------|
| Signup | Name | `signup-name` |
| Signup | Email | `signup-email` |
| Signup | Password | `signup-password` |
| New project | Name | `project-name-input` |
| New project | Submit | Button: "Create" |

### Techniques integrated in this module

| Step | Technique | Taught in |
|------|-----------|-----------|
| Add cards | POM | M20 |
| Move card | Drag-and-drop | M24 |
| Accessibility audit | axe-core | M23 |
| Performance budget | Navigation timing | M33 |
| Multi-user sync | Multi-context | M28 |

### Why a capstone matters

Individual modules test one technique in isolation. The capstone reveals
integration problems: does the POM still work when the board was just created?
Does axe report violations that only appear after certain user actions?
Does performance degrade when the board has more cards?
