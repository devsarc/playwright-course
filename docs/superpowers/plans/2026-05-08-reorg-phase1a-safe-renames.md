# Curriculum Reorganization — Phase 1A: Safe Renames (9 Modules)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename 9 existing module folders to their spec-correct positions using `git mv`, then update each module's README to align with the spec title, learning objectives, and cross-references. These 9 moves target numbers outside the existing M20–M35 range, so there are no ordering constraints — each can be done independently.

**Architecture:** Each task is one `git mv` on the whole folder + targeted README edits + one commit. No exercise.spec.ts rewrites — only prose alignment. The `tests/solved/` directory is not touched; it will be rebuilt in a future branch-generation pass.

**Tech Stack:** Git (PowerShell), Markdown

---

> **Critical note on ordering:** Phase 1A modules all move to numbers outside the M20–M35 range (M29, M37, M43, M47, M51, M63, M72, M92). No destination conflicts exist. Do all 9 tasks in any order — they are fully independent.
>
> Do NOT start Phase 1B until Phase 1A is complete, because Phase 1B moves modules within the M22–M32 range and depends on Phase 1A having vacated M29, M31, M32, M43.

---

## Task 1: module-20 → module-47 (Page Object Model)

**Files:**
- Rename: `tests/module-20-page-object-model/` → `tests/module-47-page-object-model/`
- Modify: `tests/module-47-page-object-model/README.md`

- [ ] **Step 1: Rename the folder**

```powershell
git mv tests/module-20-page-object-model tests/module-47-page-object-model
```

Expected: no output, exit 0.

- [ ] **Step 2: Update README heading and title**

In `tests/module-47-page-object-model/README.md`, change the first line:

```markdown
# M20: Page Object Model
```
→
```markdown
# M47: Page Object Model
```

- [ ] **Step 3: Append missing learning objectives**

The spec adds two objectives not in the current README. Append to the end of the `## Learning Objectives` list:

```markdown
- Build component objects (sub-POMs) for reusable UI fragments like a modal or a nav bar
- Combine POMs with fixtures so tests receive a fully-navigated page object, not a raw page
```

- [ ] **Step 4: Check exercise.spec.ts and other files for stale M20 references**

Search the module folder for any occurrence of `M20` in comments or prose:

```powershell
Select-String -Path "tests/module-47-page-object-model/*" -Pattern "M20" -Recurse
```

Replace any found instances with `M47`.

- [ ] **Step 5: Commit**

```powershell
git add tests/module-47-page-object-model
git commit -m "refactor(curriculum): rename module-20-pom to module-47 per spec

Moves Page Object Model from its draft position (M20) to its
spec-correct position (M47, Phase 12). Updates README heading and
appends two missing learning objectives (component objects, fixture
composition)."
```

---

## Task 2: module-21 → module-51 (Component Testing Foundations)

**Files:**
- Rename: `tests/module-21-component-testing/` → `tests/module-51-component-testing-foundations/`
- Modify: `tests/module-51-component-testing-foundations/README.md`

- [ ] **Step 1: Rename the folder**

```powershell
git mv tests/module-21-component-testing tests/module-51-component-testing-foundations
```

- [ ] **Step 2: Update README heading**

```markdown
# M21: Component Testing
```
→
```markdown
# M51: Component Testing Foundations
```

- [ ] **Step 3: Append missing learning objectives**

```markdown
- Explain when CT is appropriate vs E2E: CT for exhaustive prop/state coverage, E2E for user workflows
- Unmount a component with `component.unmount()` and assert cleanup behaviour
- Explain the microfrontend rationale: CT lets you test a widget in isolation before embedding it
```

- [ ] **Step 4: Add scope note to Key Takeaways**

Append to the `## Key Takeaways` section:

```markdown
5. CT tests are not a subset of E2E — they run against a Vite dev server, not the full Next.js app. A bug that only appears in the full app context will not be caught by CT.
```

- [ ] **Step 5: Check for stale M21 references**

```powershell
Select-String -Path "tests/module-51-component-testing-foundations/*" -Pattern "M21" -Recurse
```

Replace any found with `M51`.

- [ ] **Step 6: Commit**

```powershell
git add tests/module-51-component-testing-foundations
git commit -m "refactor(curriculum): rename module-21-component-testing to module-51 per spec

Moves Component Testing Foundations from draft position (M21) to
spec-correct position (M51, Phase 13). Appends three missing objectives
(CT vs E2E decision, unmount, microfrontend rationale)."
```

---

## Task 3: module-29 → module-37 (Offline, PWA & Service Workers)

**Files:**
- Rename: `tests/module-29-service-worker-pwa/` → `tests/module-37-offline-pwa-service-workers/`
- Modify: `tests/module-37-offline-pwa-service-workers/README.md`

- [ ] **Step 1: Rename the folder**

```powershell
git mv tests/module-29-service-worker-pwa tests/module-37-offline-pwa-service-workers
```

- [ ] **Step 2: Update README heading**

```markdown
# M29: Service Worker / PWA Offline Mode
```
→
```markdown
# M37: Offline, PWA & Service Workers
```

- [ ] **Step 3: Append missing learning objectives**

```markdown
- Test background sync behaviour: queue an action offline, go online, assert the action fires
- Verify PWA installability criteria: manifest present, service worker registered, HTTPS (or localhost)
```

- [ ] **Step 4: Add contrast note with M13 in the Concept section**

After the first paragraph of `## Concept`, add:

```markdown
> **Note — M13 vs M37:** M13 uses `context.setOffline()` to simulate network failure in the context of API testing. M37 applies the same API specifically to PWA offline behaviour: the intent is to verify the service worker cache and offline fallback page, not to test error handling in API calls.
```

- [ ] **Step 5: Append PWA installability takeaway**

```markdown
5. PWA installability requires `manifest.json` + registered service worker + HTTPS (or localhost). Playwright can verify the first two programmatically; HTTPS is an infrastructure concern.
```

- [ ] **Step 6: Check for stale M29 references**

```powershell
Select-String -Path "tests/module-37-offline-pwa-service-workers/*" -Pattern "M29" -Recurse
```

Replace any found with `M37`.

- [ ] **Step 7: Commit**

```powershell
git add tests/module-37-offline-pwa-service-workers
git commit -m "refactor(curriculum): rename module-29-service-worker-pwa to module-37 per spec

Moves Offline/PWA/Service Workers from draft position (M29) to
spec-correct position (M37, Phase 9). Adds M13 contrast note,
background sync objective, and PWA installability takeaway."
```

---

## Task 4: module-30 → module-72 (Electron App Testing)

**Files:**
- Rename: `tests/module-30-electron/` → `tests/module-72-electron-app-testing/`
- Modify: `tests/module-72-electron-app-testing/README.md`

- [ ] **Step 1: Rename the folder**

```powershell
git mv tests/module-30-electron tests/module-72-electron-app-testing
```

- [ ] **Step 2: Update README heading**

```markdown
# M30: Electron Testing
```
→
```markdown
# M72: Electron App Testing
```

- [ ] **Step 3: Add import clarification to Concept section**

Append to the opening paragraph of `## Concept` (after the code block):

```markdown
> **Import note:** Electron support is part of the base `playwright` package, not `@playwright/test`. Import it as:
> ```typescript
> import { _electron as electron } from 'playwright';
> ```
> No separate package install is needed if you already have `playwright` in your dependencies.
```

- [ ] **Step 4: Append missing learning objectives**

```markdown
- Test native menus: open a menu via `app.evaluate()` and assert the correct item is present
- Test native dialogs: intercept `dialog` events triggered by Electron's `dialog.showOpenDialog`
- Test app lifecycle: minimize, restore, and close the window; assert `app.windows()` length
```

- [ ] **Step 5: Check for stale M30 references**

```powershell
Select-String -Path "tests/module-72-electron-app-testing/*" -Pattern "M30" -Recurse
```

Replace any found with `M72`.

- [ ] **Step 6: Commit**

```powershell
git add tests/module-72-electron-app-testing
git commit -m "refactor(curriculum): rename module-30-electron to module-72 per spec

Moves Electron App Testing from draft position (M30) to spec-correct
position (M72, Phase 17). Adds import clarification and three missing
objectives (native menus, dialogs, lifecycle)."
```

---

## Task 5: module-31 → module-43 (Tracing & Trace Viewer)

**Files:**
- Rename: `tests/module-31-tracing-debugging/` → `tests/module-43-tracing-trace-viewer/`
- Modify: `tests/module-43-tracing-trace-viewer/README.md`

- [ ] **Step 1: Rename the folder**

```powershell
git mv tests/module-31-tracing-debugging tests/module-43-tracing-trace-viewer
```

- [ ] **Step 2: Update README heading**

```markdown
# M31: Tracing and Debugging
```
→
```markdown
# M43: Tracing & Trace Viewer
```

- [ ] **Step 3: Append missing learning objectives**

```markdown
- Use `context.tracing.stopChunk()` to capture a trace snapshot mid-test without stopping the full trace
- Navigate all Trace Viewer tabs: action list, console, network, filmstrip, inspector (ARIA snapshots), annotations, attachments, log
- Generate a curl command from the Trace Viewer network tab to reproduce an API call outside Playwright
- Use the live Trace Viewer (`--ui` mode) during development to inspect tests as they run
```

- [ ] **Step 4: Add scope boundary note**

At the end of `## Key Takeaways`, add:

```markdown
5. Debugging strategies (console/pageerror listeners, `locator.highlight()`, `locator.count()` for selector verification) are covered in M45 (Debugging Strategies). M43 focuses on the tracing infrastructure and Trace Viewer navigation.
```

- [ ] **Step 5: Check for stale M31 references**

```powershell
Select-String -Path "tests/module-43-tracing-trace-viewer/*" -Pattern "M31" -Recurse
```

Replace any found with `M43`.

- [ ] **Step 6: Commit**

```powershell
git add tests/module-43-tracing-trace-viewer
git commit -m "refactor(curriculum): rename module-31-tracing-debugging to module-43 per spec

Moves Tracing & Trace Viewer from draft position (M31) to spec-correct
position (M43, Phase 11). Adds stopChunk, all Trace Viewer tabs,
curl generation, and live viewer objectives."
```

---

## Task 6: module-32 → module-39 (Sharding for Large Suites)

**Files:**
- Rename: `tests/module-32-ci-cd/` → `tests/module-39-sharding-large-suites/`
- Modify: `tests/module-39-sharding-large-suites/README.md`

- [ ] **Step 1: Rename the folder**

```powershell
git mv tests/module-32-ci-cd tests/module-39-sharding-large-suites
```

- [ ] **Step 2: Update README heading**

```markdown
# M32: CI/CD Integration
```
→
```markdown
# M39: Sharding for Large Suites
```

- [ ] **Step 3: Refocus learning objectives**

Replace the existing `## Learning Objectives` list with:

```markdown
## Learning Objectives

- Split a test suite across N parallel CI jobs with `--shard=1/4`, `--shard=2/4`, etc.
- Configure a GitHub Actions matrix to run one shard per job
- Use the `blob` reporter to capture per-shard output that can be merged later
- Combine shard results into a single HTML report with `npx playwright merge-reports`
- Understand `fullyParallel` vs sharding: workers parallelize within one machine; sharding distributes across machines
```

- [ ] **Step 4: Add M40 boundary note**

After the `## Key Takeaways` section, add:

```markdown
> **Note — M39 vs M40:** This module focuses on sharding: splitting suites horizontally across CI machines. M40 (CI/CD Pipeline Setup) covers the full GitHub Actions workflow structure, reporter configuration (github annotations, JUnit, JSON reporters), browser binary caching, artifact upload, Docker container execution, and cloud grid integration. Some of that content currently lives in this module and will be formally moved when M40 is created.
```

- [ ] **Step 5: Check for stale M32 references**

```powershell
Select-String -Path "tests/module-39-sharding-large-suites/*" -Pattern "M32" -Recurse
```

Replace any found with `M39`.

- [ ] **Step 6: Commit**

```powershell
git add tests/module-39-sharding-large-suites
git commit -m "refactor(curriculum): rename module-32-ci-cd to module-39 per spec

Moves Sharding for Large Suites from draft position (M32) to
spec-correct position (M39, Phase 10). Refocuses learning objectives
on sharding specifically; adds M40 boundary note for CI/CD pipeline
content that will be split when M40 is created."
```

---

## Task 7: module-33 → module-29 (Performance Testing & Measurement)

**Files:**
- Rename: `tests/module-33-performance/` → `tests/module-29-performance-testing-measurement/`
- Modify: `tests/module-29-performance-testing-measurement/README.md`

> **Dependency:** Task 3 (module-29 → module-37) must be complete before this task, otherwise the destination `module-29` is occupied. Verify with:
> ```powershell
> Test-Path tests/module-29-service-worker-pwa
> ```
> If it still exists, complete Task 3 first.

- [ ] **Step 1: Rename the folder**

```powershell
git mv tests/module-33-performance tests/module-29-performance-testing-measurement
```

- [ ] **Step 2: Update README heading**

```markdown
# M33: Performance Testing
```
→
```markdown
# M29: Performance Testing & Measurement
```

- [ ] **Step 3: Append missing learning objectives**

```markdown
- Collect LCP, TTFB, FID, and CLS via `PerformanceObserver` inside `page.evaluate()`
- Read CDP performance metrics with `cdpSession.send('Performance.getMetrics')`
- Understand `page.coverage` at a conceptual level: what coverage data is and what it measures (CDP mechanism is in M62)
- Track performance regressions over time by writing results to a JSON file and comparing runs
```

- [ ] **Step 4: Add M62 and M76 forward-references**

Append to `## Going Deeper`:

```markdown
- M62 (CDP Direct Access) covers how `page.coverage` works under the hood via a raw CDP session
- M76 (Uptime & Performance Monitoring) covers long-term LCP trend tracking across deployments
```

- [ ] **Step 5: Check for stale M33 references**

```powershell
Select-String -Path "tests/module-29-performance-testing-measurement/*" -Pattern "M33" -Recurse
```

Replace any found with `M29`.

- [ ] **Step 6: Commit**

```powershell
git add tests/module-29-performance-testing-measurement
git commit -m "refactor(curriculum): rename module-33-performance to module-29 per spec

Moves Performance Testing & Measurement from draft position (M33) to
spec-correct position (M29, Phase 7). Adds LCP/TTFB/FID/CLS objectives,
CDP metrics, page.coverage concept, and regression tracking objective."
```

---

## Task 8: module-34 → module-63 (Localization & i18n Testing)

**Files:**
- Rename: `tests/module-34-internationalization/` → `tests/module-63-localization-i18n-testing/`
- Modify: `tests/module-63-localization-i18n-testing/README.md`

- [ ] **Step 1: Rename the folder**

```powershell
git mv tests/module-34-internationalization tests/module-63-localization-i18n-testing
```

- [ ] **Step 2: Update README heading**

```markdown
# M34: Internationalization Testing
```
→
```markdown
# M63: Localization & i18n Testing
```

- [ ] **Step 3: Append missing learning objectives**

```markdown
- Set the browser locale via `context` options (`locale: 'fr-FR'`) so `Intl.*` APIs return locale-aware output
- Test RTL layout: verify `dir="rtl"` on `<html>` and assert that the layout mirrors correctly for a hypothetical Arabic locale
- Build a multi-language regression strategy: parametric tests that cover all supported locales from a single data file
```

- [ ] **Step 4: Add context-locale note to Concept section**

After the closing bullet list of the `## Concept` section, add:

```markdown
**Browser-level locale (affects `Intl.*` APIs):**
```typescript
const context = await browser.newContext({ locale: 'fr-FR' });
```
This sets what `Intl.DateTimeFormat`, `Intl.NumberFormat`, and `Intl.RelativeTimeFormat` return — independently of the URL locale prefix. Use both together for complete coverage.
```

- [ ] **Step 5: Check for stale M34 references**

```powershell
Select-String -Path "tests/module-63-localization-i18n-testing/*" -Pattern "M34" -Recurse
```

Replace any found with `M63`.

- [ ] **Step 6: Commit**

```powershell
git add tests/module-63-localization-i18n-testing
git commit -m "refactor(curriculum): rename module-34-i18n to module-63 per spec

Moves Localization & i18n Testing from draft position (M34) to
spec-correct position (M63, Phase 16). Adds context locale option,
RTL testing objective, multi-language regression strategy, and
browser-level locale code example."
```

---

## Task 9: module-35 → module-92 (End-to-End Review & Capstone)

**Files:**
- Rename: `tests/module-35-capstone/` → `tests/module-92-end-to-end-review-capstone/`
- Modify: `tests/module-92-end-to-end-review-capstone/README.md`

- [ ] **Step 1: Rename the folder**

```powershell
git mv tests/module-35-capstone tests/module-92-end-to-end-review-capstone
```

- [ ] **Step 2: Update README heading**

```markdown
# M35: End-to-End Capstone
```
→
```markdown
# M92: End-to-End Review & Capstone
```

- [ ] **Step 3: Update the "what you've learned" module-number table**

Find the table under `## What you've learned across M20-M35` and replace it entirely:

```markdown
## What you've learned (reorganized module positions)

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
```

- [ ] **Step 4: Update the section heading**

```markdown
## What you've learned across M20-M35
```
→
```markdown
## What you've learned (reorganized module positions)
```

(Already handled in Step 3 — confirm it matches.)

- [ ] **Step 5: Add interim note**

After the `## Key Takeaways` section, add:

```markdown
> **Note:** This capstone was written against the draft curriculum (M20–M35 era). It will be revisited and expanded once M36–M91 are complete to cover the full set of techniques taught throughout the course.
```

- [ ] **Step 6: Check for stale M35 references**

```powershell
Select-String -Path "tests/module-92-end-to-end-review-capstone/*" -Pattern "M35" -Recurse
```

Replace any found with `M92`.

- [ ] **Step 7: Commit**

```powershell
git add tests/module-92-end-to-end-review-capstone
git commit -m "refactor(curriculum): rename module-35-capstone to module-92 per spec

Moves End-to-End Review & Capstone from draft position (M35) to
spec-correct final position (M92). Updates the module-number reference
table and adds interim note flagging expansion when M36-M91 are built."
```

---

## Phase 1A Verification

After all 9 tasks are complete, verify the folder state:

```powershell
Get-ChildItem tests -Directory | Select-Object Name | Sort-Object Name
```

Expected folders after Phase 1A:
- `module-00` through `module-19` — unchanged
- `module-22` through `module-28` — still in original positions (Phase 1B moves these)
- `module-29`, `module-37`, `module-39`, `module-43`, `module-47`, `module-51`, `module-63`, `module-72`, `module-92` — newly placed by Phase 1A

The following folders should be **gone** after Phase 1A: `module-20`, `module-21`, `module-29` (original), `module-30`, `module-31`, `module-32`, `module-33`, `module-34`, `module-35`.

If any of `module-20`, `module-21`, `module-30`–`module-35` still appear, that task is incomplete.

Proceed to Phase 1B only after this check passes.
