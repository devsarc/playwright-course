# Lesson 19: Capstone: Full Suite Organization & Review

*Combines former modules M89–M92.*

## Learning Objectives

### Part 1 — Smoke Suite for Lumio (formerly M89)

- Define what makes a test suitable for a smoke suite vs. regression
- Tag tests with `@smoke` and select them with `--grep` in CI
- Design a smoke suite that runs in under 60 seconds
- Understand the smoke suite as a merge gate: fail here → don't merge
- Write annotations that make smoke suite membership traceable in reports

### Part 2 — Full Regression Suite Organization (formerly M90)

- Classify tests into the four tiers: smoke, sanity, regression, and full
- Tag all existing tests by tier using `testInfo.annotations` and title-embedded tags
- Configure different CI triggers for each tier (per-push, per-PR, nightly, release)
- Use `--grep` and `--grep-invert` to select tier-specific subsets
- Understand the tradeoff between coverage breadth and CI feedback time

### Part 3 — Production Incident Reproduction (formerly M91)

- Translate a user-facing bug report into a targeted Playwright test
- Use mobile emulation and WebKit to isolate browser/OS-specific bugs
- Write a failing reproduction test before attempting the fix
- Confirm the fix with the same test without modifying the test assertions
- Convert the reproduction test into a permanent regression guard

### Part 4 — End-to-End Review & Capstone (formerly M92)

- Combine POM, accessibility, drag-and-drop, multi-user, and performance in one suite
- Use `test.step()` to document sub-actions within a long test
- Write a realistic user journey from signup to active board use
- Debug integration failures that don't appear in isolated module tests

## Concept

### Part 1 — Smoke Suite for Lumio (formerly M89)

A smoke suite answers one question: *is the application fundamentally broken?* It does not verify every feature. It verifies that the critical paths — the ones that, if broken, make the app unusable for all users — still work. A smoke suite that takes more than 60 seconds is not a smoke suite; it is a partial regression suite that nobody runs.

**Selecting smoke tests.**

The selection criteria: if this test fails in production, every user is affected. That means:
- The marketing landing page loads and the brand is visible
- The login form works for a credential-based user
- A logged-in user can reach the dashboard
- A logged-in user can create a task (the core feature)
- The navigation between main sections works

What is NOT a smoke test:
- "The date picker shows the correct month" — affects a small subset of users in specific flows
- "The French locale shows the correct translation" — important, but not critical-path for all users
- "The admin panel paginates correctly" — affects only admin users

**Tagging and selecting.**

Add `@smoke` directly to the test title:

```typescript
test('login: credential user can sign in @smoke', async ({ page }) => { ... });
```

Then run only smoke tests:
```bash
npx playwright test --grep "@smoke"
```

In CI, configure a separate job that runs only `--grep "@smoke"` on every push, with a timeout budget:
```yaml
- name: Smoke tests
  run: npx playwright test --grep "@smoke" --timeout 15000
```

**Speed strategies.**

Reaching 60 seconds total for 8 tests on Chromium only:
- Use `storageState` to skip login for tests that don't test auth
- Assert the minimum: one heading, one URL, one visible element — not the full page state
- Skip `trace: 'on'` for smoke (only `on-first-retry`) — tracing adds latency
- Run smoke on Chromium only in CI; cross-browser runs on the nightly job

**Smoke as a merge gate.**

A smoke gate blocks PRs that break critical paths without running the full suite. The tradeoff: some regressions slip through (non-smoke features). The mitigation: nightly regression run catches them before the next release. The key insight: a fast gate that catches 80% of critical regressions is more valuable than a slow gate that catches 100% but is disabled because developers bypass it.

### Part 2 — Full Regression Suite Organization (formerly M90)

A test suite without tiers is a binary choice: run everything (slow, expensive) or run nothing (fast, dangerous). The solution is a tiered strategy where different subsets run at different frequencies, giving fast feedback on critical paths while still catching regressions in lower-priority flows.

**The four tiers.**

| Tier | Count | Trigger | Time budget | Coverage |
|------|-------|---------|-------------|----------|
| Smoke | 8–12 | Every push | < 60 s | Critical user paths |
| Sanity | 20–30 | Every PR merge | < 5 min | Feature completeness per module |
| Regression | 60–90 | Nightly | < 30 min | All automated scenarios |
| Full | All | Pre-release | Unlimited | + cross-browser, visual, i18n |

**Tagging strategy.**

Tags live in two places that complement each other:
1. **Test title** — makes `--grep "@smoke"` work without config changes
2. **`testInfo.annotations`** — makes the tag queryable from JSON reporter output for dashboards

```typescript
test('login: credential user can sign in @smoke', async ({ page }, testInfo) => {
  testInfo.annotations.push({ type: 'tag', description: '@smoke' });
  // ...
});
```

Tests can belong to multiple tiers: a test tagged `@smoke @sanity` runs in both the per-push check and the per-PR job. Use this for tests that are both fast and important.

**CI configuration.**

```yaml
# Per-push: smoke only
smoke:
  run: npx playwright test --grep "@smoke"

# Per-PR merge: smoke + sanity
sanity:
  run: npx playwright test --grep "@smoke|@sanity"

# Nightly: full regression (no filter)
regression:
  run: npx playwright test

# Pre-release: full suite including cross-browser
full:
  run: npx playwright test --project=chromium --project=firefox --project=webkit
```

**Prioritizing which tier a test belongs to.**

The tier decision comes from two factors:
- **Criticality** — how many users are affected if this breaks?
- **Speed** — how long does this test take to run?

A test that takes 30 seconds and only affects admin users is `@regression`. A test that takes 2 seconds and affects every user at login is `@smoke`.

**Managing tier drift.**

As a suite grows, tests accumulate in the regression tier without being promoted or cleaned up. Signs of tier drift:
- The nightly regression run takes 2 hours (time to shard or delete)
- The smoke suite has 40 tests (time to demote)
- 15% of tests have no tier tag (time to audit)

A quarterly suite review — checking tag distribution, average duration per tier, and pass rates — keeps the tiers meaningful.

**`test.fixme()` for known failures.**

Tests that represent known bugs should be tagged `test.fixme()` rather than deleted or skipped silently. `fixme` marks the test as expected to fail; it shows up in the report as "fixme" rather than "failed", preserving the regression intent without polluting the failure count.

```typescript
test.fixme('task date picker: shows incorrect month in Firefox', async ({ page }) => {
  // known bug — LUM-789
});
```

### Part 3 — Production Incident Reproduction (formerly M91)

When a production incident occurs, the first engineering task is not to fix it — it's to reproduce it in a controlled environment. A test that reproduces a bug does three things: it confirms you understand the failure mode, it makes the fix verifiable, and it becomes a permanent regression guard so the bug can never silently recur.

**The bug-to-test workflow.**

The workflow for every production incident:

1. **Read the bug report** — understand the user action, the expected outcome, and the observed outcome.
2. **Identify the environment** — browser, OS, viewport, auth state.
3. **Write the reproduction test** — it must fail before the fix.
4. **Fix the bug** — change application code only, not the test.
5. **Confirm the test passes** — the same test that was failing now passes.
6. **Tag the test** — add `@regression` and link to the incident in an annotation.

**The incident: task status update not persisting on mobile WebKit.**

Bug report:
> On iPhone 14 (Safari/WebKit), updating a task status from "Todo" to "In Progress" appears to succeed (the UI updates), but after refreshing the page, the status reverts to "Todo". Reproducible consistently on iOS. Works correctly on Chrome/Android.

What this tells us:
- **Environment:** mobile WebKit (iPhone 14 preset)
- **User action:** change task status via the kanban dropdown
- **Expected:** status persists across page reload
- **Observed:** status reverts after reload
- **Platform-specific:** not reproducible on Chromium

How to write the reproduction test:
1. Use the `iPhone 14` device preset for the browser context
2. Navigate to the task
3. Change the status
4. Reload the page
5. Assert the status is still "In Progress" (this assertion will fail before the fix)

**Why platform-specific bugs are hard to catch.**

Most CI pipelines run on Linux Chromium only for speed. WebKit on mobile emulation is left for nightly runs. Bugs like this slip through because the code path that saves status may use a fetch API or a form submission pattern that behaves differently when Safari's HTTP cache or cookie handling is involved.

**Playwright's role in incident response.**

Playwright is uniquely positioned for this because:
- It can emulate specific devices with realistic viewport, user agent, and touch events
- It can run WebKit on Linux (no macOS required)
- The same test code runs locally and in CI
- Trace Viewer captures the full request/response cycle, including the status save request and its response headers

**Making the test a permanent regression guard.**

After the fix, the reproduction test becomes a regression test. Tag it, annotate it with the incident ID, and move it to the test suite where it belongs (typically the feature's test file). Don't leave it in the reproduction module — it should travel with the feature.

### Part 4 — End-to-End Review & Capstone (formerly M92)

The capstone is a synthesis test — it validates that techniques learned
in isolation still work together in a realistic workflow.

**`test.step()` for readable long tests:**
```typescript
test('full journey', async ({ page }) => {
  await test.step('Sign up', async () => { ... });
  await test.step('Create project', async () => { ... });
  await test.step('Add cards', async () => { ... });
});
```
Steps appear in the Trace Viewer timeline and in CI failure messages.
A step failure tells you exactly which phase of the journey broke.

**What you've learned (reorganized module positions):**

| Old draft # | New spec # | Technique |
|-------------|------------|-----------|
| M20 | M47 | Page Object Model |
| M21 | M51 | Component Testing Foundations |
| M22 | M26 | Visual Regression Testing |
| M23 | M28 | Accessibility Testing |
| M24 | M23 | Advanced Input & Interactions (drag-drop, keyboard, clipboard) |
| M25 | M22 | File Upload, Download & PDF |
| M26 | M24 | iFrame & Shadow DOM |
| M27 | M32 | WebSocket & SSE Testing |
| M28 | M31 | Multi-Tab & Popup Management |
| M29 | M37 | Offline, PWA & Service Workers |
| M30 | M72 | Electron App Testing |
| M31 | M43 | Tracing & Trace Viewer |
| M32 | M39 | Sharding for Large Suites |
| M33 | M29 | Performance Testing & Measurement |
| M34 | M63 | Localization & i18n Testing |

> **Note:** This capstone was written against the draft curriculum (M20–M35 era). It will be revisited and expanded once M36–M91 are complete to cover the full set of techniques taught throughout the course.

## Lumio Context

See [lumio-context.md](./lumio-context.md).

## Step-by-Step Tasks

### Part 1 — Smoke Suite for Lumio

Validate this part only:
```bash
npx playwright test tests/module-19-capstone -g "Part 1 — Smoke Suite for Lumio (formerly M89)"
```

### Part 2 — Full Regression Suite Organization

Validate this part only:
```bash
npx playwright test tests/module-19-capstone -g "Part 2 — Full Regression Suite Organization (formerly M90)"
```

### Part 3 — Production Incident Reproduction

Validate this part only:
```bash
npx playwright test tests/module-19-capstone -g "Part 3 — Production Incident Reproduction (formerly M91)"
```

### Part 4 — End-to-End Review & Capstone

Validate this part only:
```bash
npx playwright test tests/module-19-capstone -g "Part 4 — End-to-End Review & Capstone (formerly M92)"
```

## Validate (full lesson)

```bash
npx playwright test tests/module-19-capstone
```

## Key Takeaways

### Part 1 — Smoke Suite for Lumio

1. A smoke test covers paths where failure affects every user — not edge cases or admin flows.
2. `@smoke` in the test title makes it selectable with `--grep "@smoke"` without any config changes.
3. The smoke suite must run in under 60 seconds on CI — if it's slower, it won't be the merge gate.
4. Use `storageState` to skip login UI for non-auth smoke tests — browser-level auth reuse is the main speed lever.
5. Run smoke on one browser only per push; cross-browser is a nightly concern.

### Part 2 — Full Regression Suite Organization

1. Four tiers — smoke, sanity, regression, full — map to four CI triggers with different speed and coverage tradeoffs.
2. Tags in the test title enable `--grep` filtering without any config changes.
3. `testInfo.annotations` makes tags queryable from the JSON reporter for dashboard use.
4. `test.fixme()` preserves regression intent for known bugs without failing the CI count.
5. Tier drift is inevitable — schedule a quarterly suite review to rebalance tag distribution.

### Part 3 — Production Incident Reproduction

1. Write the reproduction test first — it must fail before the fix to be a valid regression guard.
2. Use mobile device presets and WebKit to isolate platform-specific bugs without needing a real device.
3. The test doesn't change when the fix is applied — only the application code changes.
4. Annotate the reproduction test with the incident ID so future engineers understand why it exists.
5. A test that catches the same bug twice justifies its existence forever.

### Part 4 — End-to-End Review & Capstone

1. `test.step()` turns a long test into a readable story with named phases.
2. Integration tests surface bugs that unit and isolated tests miss.
3. A capstone with accessibility + performance assertions is a regression safety net.
4. Multi-user collaboration tests require two independent BrowserContexts.

## Going Deeper

### Part 1 — Smoke Suite for Lumio

- [Playwright docs: Test tags](https://playwright.dev/docs/test-annotations#tag-tests)
- [Playwright docs: grep filtering](https://playwright.dev/docs/test-cli#reference)
- [Playwright docs: storageState](https://playwright.dev/docs/auth)
- [Google Testing Blog: Testing Pyramid](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html)

### Part 2 — Full Regression Suite Organization

- [Playwright docs: Tag tests](https://playwright.dev/docs/test-annotations#tag-tests)
- [Playwright docs: test.fixme()](https://playwright.dev/docs/api/class-test#test-fixme)
- [Playwright docs: CLI --grep](https://playwright.dev/docs/test-cli)
- [Google Testing Blog: Test Sizes](https://testing.googleblog.com/2010/12/test-sizes.html)

### Part 3 — Production Incident Reproduction

- [Playwright docs: Emulation](https://playwright.dev/docs/emulation)
- [Playwright docs: devices](https://playwright.dev/docs/api/class-playwright#playwright-devices)
- [Playwright docs: Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [Google SRE Book: Incident Management](https://sre.google/sre-book/managing-incidents/)

### Part 4 — End-to-End Review & Capstone

- [Playwright docs: test.step()](https://playwright.dev/docs/api/class-test#test-step)
- [Playwright docs: Best practices](https://playwright.dev/docs/best-practices)
