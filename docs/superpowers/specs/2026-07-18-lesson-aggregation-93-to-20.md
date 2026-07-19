# Design: Lesson Aggregation — 93 Modules → 20 Lessons

**Date:** 2026-07-18
**Status:** Approved
**Supersedes (module count only):** `2026-05-08-playwright-learning-platform-design.md`, `2026-05-09-progressive-ci-design.md`

---

## Overview

The original 93-module curriculum (see `2026-05-08-playwright-learning-platform-design.md`)
has been losslessly merged into 20 lessons. Every learning objective, concept
paragraph, exercise TODO, hint, and Lumio-context note from the original 93
modules survives — organized into numbered "Parts" within each of the 20
lessons' four files (`README.md`, `exercise.spec.ts`/`.tsx`, `hints.md`,
`lumio-context.md`).

## Why

[Fill in with the actual motivation once known — e.g. reduce onboarding
friction / fewer branch switches / shorter course]

## Mapping

See `docs/superpowers/plans/2026-07-18-lesson-aggregation-93-to-20.md` for
the full old-module → new-lesson table. Summary: lessons 00–07 map to the
original Phases 0–9 (with Phases 0+1 merged into Lesson 00 and Phases 6+7
merged into Lesson 05); lessons 08–19 map one-to-one with the original
Phases 10–21.

## What did not change

- The `module-{2-digit}-{slug}` branch/directory naming convention
- `scripts/build-branches.ts`, `validate-module.ts`, `get-test-match.ts`,
  `ci-finalize.ts`, and all of `scripts/lib/` except the unit test fixtures
  in `module-utils.test.ts` and `decision.test.ts` (and two stale "93
  modules" strings — a comment in `build-branches.ts` and a congratulations
  message in `lib/summary.ts` — updated to say "20 lessons" since they're
  user/developer-facing text made incorrect by this reorg)
- `.github/workflows/playwright.yml`, `.github/workflows/progress.yml`
- The four-file-per-lesson format and the progressive-CI unlock model

## What changed

- `scripts/modules.config.ts`: 93 entries → 20
- `scaffolds/`: 93 directories → 20
- `tests/module-00-setup/` → `tests/module-00-foundations/`
- `scripts/progress.json`: reset to the new first lesson
- Two unit test files updated for the new registry size/IDs
- `README.md`, `tests/README.md`, one workflow comment
- Two stale "93 modules" strings outside `scaffolds/`/`scripts/modules.config.ts`
  (see "What did not change" above)
- **Live component-testing config files** (not caught by the original plan,
  found during this task's final sanity sweep): `playwright.config.ts`'s
  `testIgnore` array and `playwright-ct.config.ts`/`playwright-ct-vue.config.ts`'s
  `testMatch` patterns hardcoded the old M51/M52/M53/M54 paths — these are
  live, functional config (not scaffold/doc content) that would have broken
  Lesson 11's component tests the moment `tests/module-11-component-testing/`
  gets materialized. Updated all three to match `module-11-*` /
  `exercise.spec.tsx` / `exercise.vue.spec.tsx`. Also updated two stale
  module-number comments in `playwright.config.ts` (the Chromium-only
  project note and the `webServer` options note) to the Lesson 01/07/08
  equivalents, matching Task 26's phrasing convention for the same kind of
  comment in `module-check.yml`. Also updated an actionable-but-stale
  `testMatch` example quoted in `scaffolds/module-11-component-testing/hints.md`
  to match, and three stale `npx playwright test tests/module-{old}-...`
  example commands in `scaffolds/module-09-debugging-and-reporting/exercise.spec.ts`
  and one in `scaffolds/module-17-ai-and-modern-tooling/README.md` (all four
  were literal copy-paste-and-run instructions that would have failed against
  a directory that no longer exists — distinct from purely illustrative/
  narrative old-module mentions, which were left as-is; see below).
- **Lumio-context.md cross-reference convention reconciled for Lessons 00-04**
  (see "Known follow-ups" below).

## Known follow-ups (out of scope for this reorg)

- **`lumio-context.md` cross-reference convention reconciled**: during
  execution, Lessons 00–04's `lumio-context.md` files initially rewrote
  inline module-number cross-references the same way the README's Concept
  section does (e.g. "Lesson 01 (formerly M08)"), while Lessons 05–19 left
  them bare (e.g. "M08"). Both readings were individually defensible against
  the merge brief's text, but the split was inconsistent across the plan's
  execution. Reconciled during this task by reverting Lessons 00–04's 10
  inline cross-references to the bare form, matching the majority
  convention already used by Lessons 05–19. The `## Part N — Title (formerly
  M{old})` section headers themselves are unaffected — that format is
  universal across all 20 lessons and was never part of the inconsistency.
- **A handful of old module-number mentions were deliberately left as-is**
  after the final sanity sweep, since they're illustrative/narrative rather
  than actionable, or pre-date this reorg entirely:
  - `scaffolds/module-04-forms-and-interactions/lumio-context.md:98` and
    `scaffolds/module-05-visual-a11y-performance/lumio-context.md:84` each
    reference a module number that doesn't even match the original course's
    own topic for that number (e.g. "module-25-file-upload" when M25 was
    "Screenshot Testing", not file upload) — confirmed via `git show` against
    this repo's very first commit that these mismatches already existed in
    the original 93-module source content, before this reorg began. Not
    fixed; out of scope (a pre-existing course-content bug, not a reorg
    defect).
  - `scaffolds/module-08-scale-and-cicd/lumio-context.md:102` (a repo
    structure diagram) and `scaffolds/module-16-monitoring-and-synthetic/lumio-context.md:76`
    (a YAML example explicitly marked "for reference, not built in this
    module") are illustrative, not copy-paste-and-run instructions — left
    verbatim per the same reasoning applied throughout Tasks 2-21.
  - `scaffolds/module-19-capstone/exercise.spec.ts:12` (`KanbanPage` import
    path) — a disclosed, reviewed judgment call from Task 21: fixing it
    would pull in an unrelated, still-in-progress scaffold from a different
    lesson.
- **Latent `devices` export gap** (found during Lesson 19's merge review,
  not fixed here — pre-dates this reorg and is unrelated to it): both
  Lesson 07 (`module-07-cross-browser-and-mobile`, from the original M35)
  and Lesson 19 (`module-19-capstone`, from the original M91) have
  `exercise.spec.ts` files that import `devices` from `'../fixtures/fixtures'`,
  but the real `tests/fixtures/fixtures.ts` only exports `test`/`expect`, not
  `devices`. This will surface as a compile error only once those lessons'
  `tests/` directories are materialized with the real fixtures file (it's
  currently masked because `scaffolds/` has no `tsconfig.json` inclusion, so
  the unresolved import widens to `any` and suppresses the missing-export
  check). Confirmed this already existed in the original M35 module before
  this reorg began, so it is a pre-existing course-content gap, not
  something this project introduced. Fixing it means adding `export {
  devices } from '@playwright/test';` to `tests/fixtures/fixtures.ts` — left
  for a separate, dedicated fix outside this reorg's scope.
