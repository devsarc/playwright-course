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
  execution. Reconciled during this task by reverting Lessons 00–04's 11
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
    path) — **RESOLVED, see "Post-reorg audit fixes" below.** (The original
    note here — "a disclosed, reviewed judgment call... fixing it would pull
    in an unrelated, still-in-progress scaffold from a different lesson" —
    was itself inaccurate: `module-47-page-object-model` was not
    "unrelated" or "still-in-progress," it was this same reorg's own former
    name for what is now the complete `module-10-architecture-and-patterns`.
    The import broke because the reorg renamed/merged that directory and
    this one cross-reference was never updated. Left as a real defect by
    this spec's original author; fixed in the audit pass below.)
- **Latent `devices` export gap** (found during Lesson 19's merge review,
  not fixed here — pre-dates this reorg and is unrelated to it): **RESOLVED,
  see "Post-reorg audit fixes" below.** Both Lesson 07
  (`module-07-cross-browser-and-mobile`, from the original M35) and Lesson 19
  (`module-19-capstone`, from the original M91) have `exercise.spec.ts` files
  that import `devices` from `'../fixtures/fixtures'`, but the real
  `tests/fixtures/fixtures.ts` only exported `test`/`expect`, not `devices`.
  Confirmed this already existed in the original M35 module before this
  reorg began, so it was a pre-existing course-content gap, not something
  this project introduced.

## Post-reorg audit fixes (2026-07-19)

An independent, skeptical audit (verifying against actual file state and
real command output, not commit messages or this spec's own claims) found
several defects this spec did not disclose, plus confirmed the two items
above. All are fixed as of this section.

- **`module-13-realtime-protocols-and-cdp/exercise.spec.ts`** (lines 21, 120,
  147) **and `module-14-specialized-testing-types/exercise.spec.ts`**
  (line 505): a `**/PLACEHOLDER`-style glob literal was quoted inside a
  `/* TODO N.N: ... */` block comment. Since the glob itself contains the
  `*/` token, it closed the comment early, leaving the rest as unparseable
  code (confirmed via `tsc`: TS1005/TS1161/TS1128). Pre-dates this reorg —
  present in the original M67 module (`git show` against the initial
  commit). Fixed by dropping the unsafe literal from the four inline
  markers (each answer was already stated safely in the `//` comment
  directly above, so no information was lost) — e.g. `/* TODO 5.5: replace
  '**/PLACEHOLDER' with the chat API glob */` became `/* TODO 5.5 */`.
- **A broader, related bug class**: TODOs of the form
  `receiver./* TODO N.N: methodCall() */;` — where the *entire* answer
  (method name and args, not just an argument) sits inside the comment with
  no placeholder left in real code — are invalid syntax (`receiver.` must
  be followed by a property name; a comment doesn't count as one). This is
  distinct from the codebase's working convention of putting only the
  *argument* inside the comment and leaving a valid-but-wrong placeholder
  call in code (e.g. `.toBeVisible()` swapped for `.toBeHidden()`). A full
  `tsc --ignoreConfig` sweep of every scaffold's exercise/page file (filtered
  to genuine parse-error codes, not the expected `--ignoreConfig` noise)
  found 23 occurrences of this pattern across
  `module-00-foundations` (5, including the materialized copy under
  `tests/`), `module-02-network-and-apis` (1), `module-03-auth-and-sessions`
  (4), `module-05-visual-a11y-performance` (1),
  `module-07-cross-browser-and-mobile` (4),
  `module-10-architecture-and-patterns/exercise.spec.ts` (5) and its
  `pages/KanbanPage.ts` (3), and `module-12-specialized-automation` (1).
  All pre-date this reorg (confirmed pre-existing for the ones checked
  against the initial commit) and were undetected because `scaffolds/` is
  outside `tsconfig.json`'s `include`, so nothing gates it. Each was fixed
  by adding a syntactically valid, type-compatible, deliberately-wrong
  placeholder after the comment (e.g. `page.goBack()` → `page.waitForTimeout(0)`;
  `context.clearCookies()` → `context.cookies()`; `hasText: title` →
  `hasText: 'PLACEHOLDER'`), matching the file's own established
  wrong-placeholder convention rather than inventing a new one. Since
  `module-00` is the one currently-materialized lesson, this bug was live —
  `npx playwright test --list` failed with a `SyntaxError` and found 0 tests
  in the file before the fix.
- **`module-19-capstone/exercise.spec.ts:12`**: `KanbanPage` import fixed
  from `../module-47-page-object-model/pages/KanbanPage` (nonexistent) to
  `../module-10-architecture-and-patterns/pages/KanbanPage` (real, and safe
  to depend on cross-lesson: progression is strictly sequential and
  materialized lesson directories are never deleted, so by the time a
  learner reaches the capstone, Lesson 10 is already materialized).
- **`tests/fixtures/fixtures.ts`**: added `export { devices }` and
  `export type { BrowserContext }` (both re-exported from
  `@playwright/test`), closing the gap for Lesson 06
  (`type BrowserContext`, also undisclosed by this spec), Lesson 07, and
  Lesson 19 (`devices`).
- **Vue component-testing toolchain was never installed.**
  `playwright-ct-vue.config.ts` has existed since the initial commit, but
  `vue`, `@vitejs/plugin-vue`, and `@playwright/experimental-ct-vue` were
  never added to `package.json` — `npx playwright test
  --config=playwright-ct-vue.config.ts` crashed with `Cannot find module
  '@playwright/experimental-ct-vue'`. Not disclosed anywhere. Fixed by
  adding all three (pinned to versions matching the existing
  `@playwright/test@1.59.1`/`@playwright/experimental-ct-react@1.59.1`
  toolchain, to avoid a duplicate-`playwright`-version conflict) and running
  `npm install`.
- **`scripts/progress.json`**: the cold-start reset (commit `c7f5c3d`) set
  `scaffoldHash: null` and `lastCommitSha: null`. `null` scaffoldHash is a
  real sentinel in `computeActiveScaffoldChanges()` meaning "awareness-only
  module, skip tamper detection" — wrong for M00, which `hasExercise: true`.
  `lastCommitSha: null` also violates its own `ProgressState.lastCommitSha:
  string` (non-nullable) type. Fixed to match what `initProgress()` itself
  would have produced: `scaffoldHash` set to the real sha256 hash (first 12
  hex chars) of the current `scaffolds/module-00-foundations/exercise.spec.ts`,
  and `lastCommitSha: 'local'` (the same fallback `state.ts` uses everywhere
  else when `GITHUB_SHA` isn't set).
