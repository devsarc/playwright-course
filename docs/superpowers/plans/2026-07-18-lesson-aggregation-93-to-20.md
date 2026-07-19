# Lesson Aggregation: 93 Modules → 20 Lessons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Losslessly aggregate the course's 93 `scaffolds/module-XX-*` lessons into 20 combined lessons (`scaffolds/module-00-*` … `module-19-*`), carrying every README section, exercise TODO, hint, Lumio-context note, and special asset forward — then update every script, test, workflow, and doc that depends on the module registry so the course still runs.

**Architecture:** Each new lesson is a literal concatenation of its source modules' four files (`README.md`, `exercise.spec.ts`/`.tsx`, `hints.md`, `lumio-context.md`) plus any special assets, organized into numbered "Parts" inside each file (one Part per original module, in original order). Nothing is summarized or reworded — only headings, TODO numbers, and internal `M<NN>` cross-references are renumbered so the merged files stay internally consistent. `scripts/modules.config.ts` is rewritten from 93 entries to 20; because `build-branches.ts`, `validate-module.ts`, `ci-finalize.ts`, and the module-check workflow all derive everything from that one file (confirmed by reading them), most of the pipeline needs zero logic changes — only its two module-registry-dependent unit test files need new expectations.

**Tech Stack:** TypeScript (Node scripts, Vitest unit tests), Markdown (lesson content), Playwright Test (`.spec.ts`/`.spec.tsx` scaffolds).

## Global Constraints

- **No lossy edits.** Every learning objective, concept paragraph, step, TODO, hint, lumio-context fact, and "Going Deeper" link from all 93 source modules must appear somewhere in the 20 merged lessons. Reorganizing, renumbering, and re-heading is fine; summarizing, cutting, or paraphrasing is not.
- **Repo state fact:** only branch `main` exists (confirmed via `git branch -a`); no per-module branches have been generated yet. `tests/` currently contains only `module-00-setup` (materialized from the old scaffold) plus `tests/fixtures/` and `tests/README.md`. This means there is no historical branch data to migrate — only the `scaffolds/` source tree, the one materialized `tests/module-00-setup/`, and the supporting scripts/docs need to change.
- **Naming convention preserved.** New lessons keep the existing `module-{2-digit}-{slug}` directory/branch-name convention (just renumbered 00–19) so `build-branches.ts`, `validate-module.ts`, and `.github/workflows/module-check.yml` (which all parse that exact pattern) keep working unmodified.
- **`scripts/modules.config.ts` is the single source of truth.** `module-utils.ts`, `validate-module.ts`, `build-branches.ts`, and `ci-finalize.ts` all import `MODULES` from it directly. Do not duplicate module metadata anywhere else.
- **Every one of the 20 new lessons ends up with `hasExercise: true`.** The two old awareness-only modules (M01 "How Playwright Works Internally", M73 "Android Device Automation") had no `exercise.spec.ts`; both get merged into lessons that also contain modules with exercises (Lesson 00 and Lesson 15 respectively), so their content becomes a non-exercise Part inside an otherwise-exercised lesson. No merged lesson is awareness-only.
- **Component-testing exception (Lesson 11):** M51/M52/M54 use `@playwright/experimental-ct-react` (`playwright-ct.config.ts`); M53 uses `@playwright/experimental-ct-vue` (`playwright-ct-vue.config.ts`). These use incompatible `mount` fixtures and cannot share one `.tsx` file. Lesson 11 is the one lesson that ends up with **two** exercise files instead of one — this is documented explicitly in its task.

### Old→New Lesson Mapping (authoritative — every task references this table)

| New # | New slug | New title | Old modules (Parts, in order) | lumioSnapshot |
|---|---|---|---|---|
| 00 | `foundations` | Foundations: Environment, Locators, Actions & Navigation | M00 setup, M01 how-playwright-works, M02 locators, M03 actions, M04 assertions, M05 navigation | `lumio-snapshot-m02` *(see note below)* |
| 01 | `test-runner-organization` | Test Runner & Organization | M06 test-runner, M07 configuration, M08 fixtures, M09 global-setup, M10 watch-mode, M11 retries | `lumio-snapshot-m06` |
| 02 | `network-and-apis` | Network & API Testing | M12 network-mocking, M13 advanced-network, M14 api-testing, M15 har-recording | `lumio-snapshot-m12` |
| 03 | `auth-and-sessions` | Authentication & Session Management | M16 auth-patterns, M17 oauth, M18 session-management, M19 security-workflows | `lumio-snapshot-m16` |
| 04 | `forms-and-interactions` | Forms, Dialogs & Advanced Interactions | M20 form-automation, M21 dialogs, M22 file-upload-download-pdf, M23 advanced-input-interactions, M24 iframe-shadow-dom | `lumio-snapshot-m20` |
| 05 | `visual-a11y-performance` | Visual, Accessibility & Performance Testing | M25 screenshot-testing, M26 visual-regression-testing, M27 aria-snapshots, M28 accessibility-testing, M29 performance-testing-measurement, M30 har-devtools | `lumio-snapshot-m25` |
| 06 | `realtime-and-user-flows` | Multi-Tab, Real-Time & Complex User Flows | M31 multi-tab-popup-management, M32 websocket-sse-testing, M33 user-journeys | `lumio-snapshot-m31` |
| 07 | `cross-browser-and-mobile` | Cross-Browser & Mobile Testing | M34 cross-browser, M35 mobile-emulation, M36 geolocation-permissions, M37 offline-pwa-service-workers | `lumio-snapshot-m34` |
| 08 | `scale-and-cicd` | Scale, Parallelism & CI/CD | M38 parallel-execution, M39 sharding-large-suites, M40 ci-cd, M41 webserver-config | `null` |
| 09 | `debugging-and-reporting` | Debugging, Tracing & Reporting | M42 inspector-codegen, M43 tracing-trace-viewer, M44 reporters-deep-dive, M45 debugging-strategies, M46 test-step-attachments | `null` |
| 10 | `architecture-and-patterns` | Test Architecture & Design Patterns | M47 page-object-model, M48 advanced-fixture-patterns, M49 data-driven-testing, M50 test-organization | `null` |
| 11 | `component-testing` | Component Testing: React & Vue | M51 component-testing-foundations, M52 react-component-testing, M53 vue-component-testing, M54 network-mocking-component-tests | `null` |
| 12 | `specialized-automation` | Specialized Automation: Scraping, Crawling & Bots | M55 web-scraping-fundamentals, M56 advanced-scraping-data-extraction, M57 web-crawling-link-monitoring, M58 automated-form-filling-bots, M59 screenshot-demo-generation | `null` |
| 13 | `realtime-protocols-and-cdp` | WebSocket, SSE & CDP Deep Dive | M60 websocket-deep-dive, M61 sse-streaming, M62 cdp-direct-access | `null` |
| 14 | `specialized-testing-types` | Specialized Testing Types: i18n, Flags, Security, Chat & CMS | M63 localization-i18n-testing, M64 feature-flag-ab-testing, M65 security-workflow-testing (deep), M66 oauth-sso-deep-dive, M67 chatbot-rich-ui-interaction, M68 cms-admin-panel-automation, M69 seo-meta-verification, M70 broken-link-navigation-monitoring | `null` |
| 15 | `platform-specific-testing` | Platform-Specific Testing: Extensions, Electron & Android | M71 browser-extension-testing, M72 electron-app-testing, M73 android-device-automation | `null` |
| 16 | `monitoring-and-synthetic` | Synthetic Monitoring & Scheduled Bots | M74 synthetic-monitoring-fundamentals, M75 scheduled-bots-cron-tasks, M76 uptime-performance-monitoring | `null` |
| 17 | `ai-and-modern-tooling` | AI-Assisted Testing & MCP Integration | M77 ai-test-planning, M78 ai-test-code-generation, M79 ai-test-healing, M80 mcp-server-agent-integration | `null` |
| 18 | `decision-making-and-patterns` | Decision-Making & Real-World Patterns | M81 playwright-vs-selenium, M82 playwright-vs-cypress, M83 playwright-vs-puppeteer-others, M84 flakiness-root-cause-analysis, M85 test-maintenance-long-term-strategy, M86 cicd-pipeline-optimization, M87 secrets-security-in-tests, M88 test-health-observability | `null` |
| 19 | `capstone` | Capstone: Full Suite Organization & Review | M89 smoke-suite-for-lumio, M90 full-regression-suite-organization, M91 production-incident-reproduction, M92 end-to-end-review-capstone | `null` |

**Note on Lesson 00's snapshot:** M00–M01 originally used `lumio-snapshot-m00` and M02–M05 used `lumio-snapshot-m02`. Snapshots are cumulative tags on `main` (each later tag is a superset of the earlier one — nothing is ever removed from Lumio). Lesson 00 must pick one tag for its branch base, so it uses the **later/superset** tag `lumio-snapshot-m02`, which contains everything `lumio-snapshot-m00` had plus more. This is safe because Lumio only grows across the timeline.

**Verified unaffected by this reorg (read and confirmed generic/registry-driven, no changes needed):** `scripts/build-branches.ts`, `scripts/validate-module.ts`, `scripts/get-test-match.ts`, `scripts/lib/decision.ts`, `scripts/lib/results-parser.ts`, `scripts/lib/state.ts`, `scripts/lib/pages.ts`, `scripts/lib/hash.ts`, `scripts/lib/summary.ts`, `.github/workflows/playwright.yml`, `.github/workflows/progress.yml`, `scripts/lib/__tests__/results-parser.test.ts`.

---

## File Structure

- **Modify in place, 20×:** `scaffolds/module-00-foundations/` … `scaffolds/module-19-capstone/` — each created fresh from its source modules, then the source module directories are deleted.
- **Modify:** `scripts/modules.config.ts` — replaced with the 20-entry `MODULES` array.
- **Modify:** `scripts/progress.json` — reset to point at the new `M00` (foundations).
- **Modify:** `tests/module-00-setup/` → replaced by `tests/module-00-foundations/` (the only materialized module).
- **Modify:** `scripts/lib/__tests__/module-utils.test.ts`, `scripts/lib/__tests__/decision.test.ts` — expectations rewritten for the 20-module registry.
- **Modify:** `tests/README.md`, `README.md` — module count and table regenerated.
- **Modify:** `.github/workflows/module-check.yml` — one comment updated (no logic change).
- **Create:** `docs/superpowers/specs/2026-07-18-lesson-aggregation-93-to-20.md` — short spec recording what changed and why, following the precedent of the existing dated specs in that folder.
- **Modify:** `docs/superpowers/specs/2026-05-08-playwright-learning-platform-design.md`, `docs/superpowers/specs/2026-05-09-progressive-ci-design.md` — one-line "superseded by" pointer added at the top of each; historical content below left untouched.

---

## Merge Template (used identically by every Task 2–21)

Each merge task combines N source modules (`scaffolds/module-{old}-{old-slug}/`) into one target lesson (`scaffolds/module-{new}-{new-slug}/`). Within the target, source module *k* (1-indexed, in the table's listed order) becomes **"Part k — {Old Title} (formerly M{old})"**.

**`README.md`:**
```markdown
# Lesson {new}: {New Title}

*Combines former modules M{first}–M{last}.*

## Learning Objectives

### Part 1 — {Old Title 1} (formerly M{old1})
{original bullet list, verbatim}

### Part 2 — {Old Title 2} (formerly M{old2})
{original bullet list, verbatim}
... one subsection per Part ...

## Concept

### Part 1 — {Old Title 1} (formerly M{old1})
{original Concept section body, verbatim word-for-word, EXCEPT: every inline
cross-reference to another module number ("M16", "see M28", "M03's dragTo")
is rewritten to "Lesson {new-of-that-module} (formerly M{old})" using this
plan's mapping table. If the referenced module is a different Part within
THIS SAME merged lesson, write "Part {k} of this lesson (formerly M{old})"
instead.}

### Part 2 — ...
... one subsection per Part, same rule ...

## Lumio Context

See [lumio-context.md](./lumio-context.md).

## Step-by-Step Tasks

### Part 1 — {Old Title 1}
{original numbered steps, verbatim, with "TODO N" replaced by "TODO 1.N"
throughout (matching the renumbering in exercise.spec.ts below), and any
"tests/module-{old}-{old-slug}" path replaced with
"tests/module-{new}-{new-slug}"}

Validate this part only:
```bash
npx playwright test tests/module-{new}-{new-slug} -g "{Part 1's original top-level test.describe title, verbatim}"
```

### Part 2 — ...
... one subsection per Part ...

## Validate (full lesson)

```bash
npx playwright test tests/module-{new}-{new-slug}
```

## Key Takeaways

### Part 1 — {Old Title 1}
{original numbered list, verbatim}

### Part 2 — ...
... one subsection per Part ...

## Going Deeper

### Part 1 — {Old Title 1}
{original links, verbatim}

### Part 2 — ...
... one subsection per Part (do NOT de-duplicate across Parts even if a URL
repeats — each Part's list must stay intact and readable on its own) ...
```

**`exercise.spec.ts`** (or `.tsx` — see Lesson 11's task for the one exception):
```typescript
// Lesson {new}: {New Title}
// Combines former modules: M{old1} ({Old Title 1}), M{old2} ({Old Title 2}), ...
//
// Each Part below is the original module's test.describe block, unchanged
// except TODO numbers are prefixed with the Part number to stay unique in
// this file (e.g. "TODO 3" in the original M{old2} module is "TODO 2.3" here).

{union of every unique import line across all source files — combine named
imports from the same module specifier into one import statement; if two
source files import different names from the same path, merge into one
`import { a, b, c } from '...'`}

{any top-level non-import setup code (e.g. Part 1's directory-creation
snippet in the M25-style modules) kept once per Part, directly above that
Part's test.describe block, exactly where it appeared in the source file}

test.describe('Part 1 — {Old Title 1} (formerly M{old1})', () => {
  {original file body verbatim. If the source file's own content was not
  already wrapped in a single top-level test.describe, wrap the whole
  original body in this one. TODO N -> TODO 1.N everywhere (comments AND
  the `/* TODO 1.N: ... */` code slots).}
});

test.describe('Part 2 — {Old Title 2} (formerly M{old2})', () => {
  ...
});
```

**`hints.md`:**
```markdown
# Lesson {new} Hints

## Part 1 — {Old Title 1} (formerly M{old1})
{original hints content verbatim, with every "## TODO N" heading renumbered
to "## TODO 1.N" to match the merged exercise file}

## Part 2 — ...
```

**`lumio-context.md`:**
```markdown
# Lumio Context: Lesson {new}

## Part 1 — {Old Title 1} (formerly M{old1})
{original lumio-context.md body, verbatim}

## Part 2 — ...
```

**Special/extra files** (config files, fixtures/ subdirs, data files, pages/ helpers found in some source modules — see each task's "Extra files" row) are copied to the target directory **unchanged**, at the same relative path they had in their source module, unless two Parts' extra files would collide on the same path (none do in this curriculum — verified below).

### Verification steps (run identically for every Task 2–21)

Since lesson content is prose/TODOs, not runnable assertions, "tests pass" means:

1. **Word-count floor** — merged `README.md` word count is at least 95% of the sum of the source READMEs' word counts (catches accidental truncation):
   ```bash
   wc -w scaffolds/module-{new}-{new-slug}/README.md
   ```
2. **TODO parity** — merged exercise file's TODO count equals the sum across source files:
   ```bash
   grep -co "TODO [0-9]" scaffolds/module-{new}-{new-slug}/exercise.spec.ts
   ```
   must equal the sum of `grep -co "TODO [0-9]" scaffolds/module-{old}-*/exercise.spec.ts` across all sources (awareness modules contribute 0).
3. **Syntax/enumeration check** — the merged spec file is valid TypeScript and Playwright can enumerate every original test:
   ```bash
   npx playwright test tests/module-{new}-{new-slug} --list
   ```
   (after Task 23 has updated `build-branches.ts`'s target — for Tasks 2–21 this can instead be run by temporarily pointing at the scaffold via `npx tsc --noEmit scaffolds/module-{new}-{new-slug}/exercise.spec.ts` if `tests/` isn't materialized yet; either way, zero TypeScript errors and the same total test count as the sum of the sources.)
4. **Source cleanup** — old source directories no longer exist:
   ```bash
   git status --porcelain scaffolds/ | grep -c "^D "
   ```
   equals (files-per-source-module × source-module-count) deletions, and `ls scaffolds/module-{old}-*` for every source fails with "No such file or directory".

---

## Task 1: Record this plan's mapping table as the shared reference (no code)

This step exists only to make the mapping table above the single thing every later task points to — there is nothing to implement. Skip straight to Task 2. (Left as an explicit task per plan convention rather than folded silently into Task 2, so a reviewer can confirm the table was read before merge work started.)

- [ ] **Step 1:** Read the "Old→New Lesson Mapping" table and "Merge Template" section above in full before starting any Task 2–21.
- [ ] **Step 2:** No commit — this task produces no file changes.

---

## Tasks 2–21: Merge each lesson

**Files (per task):**
- Create: `scaffolds/module-{new}-{new-slug}/README.md`
- Create: `scaffolds/module-{new}-{new-slug}/exercise.spec.ts` (or `.tsx`; two files for Lesson 11 — see its row)
- Create: `scaffolds/module-{new}-{new-slug}/hints.md`
- Create: `scaffolds/module-{new}-{new-slug}/lumio-context.md`
- Create: any extra files listed in the "Extra files" column below, at the target path shown
- Delete: every `scaffolds/module-{old}-*/` source directory once its content is confirmed merged

**Interfaces:**
- Consumes: the Merge Template and Old→New Lesson Mapping table from this plan's header (identical for all 20 tasks)
- Produces: a self-contained `scaffolds/module-{new}-{new-slug}/` directory that Task 23 (branch materialization) and Task 22 (`modules.config.ts`) will reference by these exact paths

Run the **same six steps** for each row of the table below (this is one procedure, applied 20 times — not 20 different procedures):

- [ ] **Step 1: Read every source file.** For lesson row *R*, read all of `scaffolds/module-{old}-*/README.md`, `exercise.spec.ts` (or `.tsx`), `hints.md`, `lumio-context.md`, and any files listed in "Extra files" for *R*.
- [ ] **Step 2: Write the four merged files** into `scaffolds/module-{new}-{new-slug}/` following the Merge Template exactly (Learning Objectives / Concept / Lumio Context / Step-by-Step Tasks / Validate / Key Takeaways / Going Deeper for the README; Part-wrapped `test.describe` blocks with renumbered TODOs for the exercise file; Part-sectioned hints and lumio-context).
- [ ] **Step 3: Copy extra files** listed in the table to the exact target path shown, unchanged.
- [ ] **Step 4: Run the four verification checks** from "Verification steps" above. Fix any discrepancy (missing content, mismatched TODO count, TS syntax error) before proceeding.
- [ ] **Step 5: Delete the source directories** for this row (`rm -rf scaffolds/module-{old}-*` for each old module in the row) now that their content is verified merged.
- [ ] **Step 6: Commit.**
  ```bash
  git add scaffolds/module-{new}-{new-slug}/
  git add -u scaffolds/
  git commit -m "chore: merge M{first}-M{last} into Lesson {new} ({new-slug})"
  ```

### Task 2 — Lesson 00 `foundations`
Sources: M00 setup, M01 how-playwright-works, M02 locators, M03 actions, M04 assertions, M05 navigation.
Extra files: none.
Special note: M01 has no `exercise.spec.ts`/`hints.md` (awareness module) — Part 2 in the exercise file is simply omitted (no empty `test.describe` block); Part 2 still exists in README/lumio-context (it has those two files). Renumber subsequent Parts' TODOs as 1.N (M00), 3.N (M02), 4.N (M03), 5.N (M04), 6.N (M05) — Part numbers in the README/lumio-context/hints stay sequential 1–6 even though Part 2 contributes no TODOs.

### Task 3 — Lesson 01 `test-runner-organization`
Sources: M06 test-runner, M07 configuration, M08 fixtures, M09 global-setup, M10 watch-mode, M11 retries.
Extra files:
- `scaffolds/module-07-configuration/playwright-m07.config.ts` → `scaffolds/module-01-test-runner-organization/playwright-part2-configuration.config.ts`
- `scaffolds/module-08-fixtures/exercise-use.spec.ts` → `scaffolds/module-01-test-runner-organization/exercise-part3-use.spec.ts`
- `scaffolds/module-09-global-setup/globalSetup.ts` → `scaffolds/module-01-test-runner-organization/globalSetup.ts`
Special note: rewrite any in-file reference to the old extra-file names (e.g. `playwright-m07.config.ts`) to their new names above, in both the merged README and the merged exercise file's comments.

### Task 4 — Lesson 02 `network-and-apis`
Sources: M12 network-mocking, M13 advanced-network, M14 api-testing, M15 har-recording.
Extra files: none.

### Task 5 — Lesson 03 `auth-and-sessions`
Sources: M16 auth-patterns, M17 oauth, M18 session-management, M19 security-workflows.
Extra files:
- `scaffolds/module-16-auth-patterns/exercise-use.spec.ts` → `scaffolds/module-03-auth-and-sessions/exercise-part1-use.spec.ts`

### Task 6 — Lesson 04 `forms-and-interactions`
Sources: M20 form-automation, M21 dialogs, M22 file-upload-download-pdf, M23 advanced-input-interactions, M24 iframe-shadow-dom.
Extra files:
- `scaffolds/module-22-file-upload-download-pdf/fixtures/sample.txt` → `scaffolds/module-04-forms-and-interactions/fixtures/sample.txt`
- `scaffolds/module-22-file-upload-download-pdf/fixtures/sample2.txt` → `scaffolds/module-04-forms-and-interactions/fixtures/sample2.txt`

### Task 7 — Lesson 05 `visual-a11y-performance`
Sources: M25 screenshot-testing, M26 visual-regression-testing, M27 aria-snapshots, M28 accessibility-testing, M29 performance-testing-measurement, M30 har-devtools.
Extra files: none.

### Task 8 — Lesson 06 `realtime-and-user-flows`
Sources: M31 multi-tab-popup-management, M32 websocket-sse-testing, M33 user-journeys.
Extra files: none.

### Task 9 — Lesson 07 `cross-browser-and-mobile`
Sources: M34 cross-browser, M35 mobile-emulation, M36 geolocation-permissions, M37 offline-pwa-service-workers.
Extra files: none.
Special note: this is one of the two lessons `.github/workflows/module-check.yml` singles out for installing all three browsers (see Task 26) — call this out explicitly in the merged README's Part 1 intro line.

### Task 10 — Lesson 08 `scale-and-cicd`
Sources: M38 parallel-execution, M39 sharding-large-suites, M40 ci-cd, M41 webserver-config.
Extra files: none.

### Task 11 — Lesson 09 `debugging-and-reporting`
Sources: M42 inspector-codegen, M43 tracing-trace-viewer, M44 reporters-deep-dive, M45 debugging-strategies, M46 test-step-attachments.
Extra files: none.

### Task 12 — Lesson 10 `architecture-and-patterns`
Sources: M47 page-object-model, M48 advanced-fixture-patterns, M49 data-driven-testing, M50 test-organization.
Extra files:
- `scaffolds/module-47-page-object-model/pages/KanbanPage.ts` → `scaffolds/module-10-architecture-and-patterns/pages/KanbanPage.ts`
- `scaffolds/module-49-data-driven-testing/task-data.json` → `scaffolds/module-10-architecture-and-patterns/task-data.json`

### Task 13 — Lesson 11 `component-testing` (exception: two exercise files)
Sources: M51 component-testing-foundations, M52 react-component-testing, M53 vue-component-testing, M54 network-mocking-component-tests.
Extra files: none.
**Deviation from the standard template:** M51, M52, and M54 all use `@playwright/experimental-ct-react` against `playwright-ct.config.ts`; M53 alone uses `@playwright/experimental-ct-vue` against `playwright-ct-vue.config.ts`. Their `mount` fixtures are not interchangeable, so:
- `scaffolds/module-11-component-testing/exercise.spec.tsx` — Parts 1, 2, 4 only (M51, M52, M54), each its own `test.describe`, TODOs numbered 1.N / 2.N / 4.N.
- `scaffolds/module-11-component-testing/exercise.vue.spec.tsx` — Part 3 only (M53), TODOs numbered 3.N.
- The README/hints/lumio-context still have all 4 Parts in one file each, as normal — only the exercise file is split. The README's "Validate" section must show two commands (one per config):
  ```bash
  npx playwright test -c playwright-ct.config.ts tests/module-11-component-testing/exercise.spec.tsx
  npx playwright test -c playwright-ct-vue.config.ts tests/module-11-component-testing/exercise.vue.spec.tsx
  ```
- Update the "TODO parity" verification check to sum both exercise files' TODO counts against all 4 sources combined.

### Task 14 — Lesson 12 `specialized-automation`
Sources: M55 web-scraping-fundamentals, M56 advanced-scraping-data-extraction, M57 web-crawling-link-monitoring, M58 automated-form-filling-bots, M59 screenshot-demo-generation.
Extra files: none.

### Task 15 — Lesson 13 `realtime-protocols-and-cdp`
Sources: M60 websocket-deep-dive, M61 sse-streaming, M62 cdp-direct-access.
Extra files: none.
Special note: M32 (now Lesson 06 Part 2) and M60/M61 (this lesson) are an explicit intro/deep-dive pair per the original design doc's "Layered Learning Strategy" table, as are M29 (Lesson 05 Part 5) and M62 (this lesson, Part 3). When rewriting cross-references, render these as "Lesson 06 (formerly M32)" / "Lesson 05 (formerly M29)" — do not merge these lessons together; keep the pairing as a cross-reference note only, per the user's request to base grouping on existing phase boundaries.

### Task 16 — Lesson 14 `specialized-testing-types`
Sources: M63 localization-i18n-testing, M64 feature-flag-ab-testing, M65 security-workflow-testing (deep), M66 oauth-sso-deep-dive, M67 chatbot-rich-ui-interaction, M68 cms-admin-panel-automation, M69 seo-meta-verification, M70 broken-link-navigation-monitoring.
Extra files: none.
Special note: this lesson has 8 Parts — the largest merged lesson. Keep the README's Table of Contents-like structure intentionally verbose (one `###` per Part in every section) rather than compressing; do not attempt to shorten because it "feels long."

### Task 17 — Lesson 15 `platform-specific-testing`
Sources: M71 browser-extension-testing, M72 electron-app-testing, M73 android-device-automation.
Extra files: none.
Special note: M73 is the second (and last) awareness module — same handling as M01 in Task 2 (Part 3 has README/lumio-context content but contributes no `test.describe` block to the exercise file).

### Task 18 — Lesson 16 `monitoring-and-synthetic`
Sources: M74 synthetic-monitoring-fundamentals, M75 scheduled-bots-cron-tasks, M76 uptime-performance-monitoring.
Extra files: none.

### Task 19 — Lesson 17 `ai-and-modern-tooling`
Sources: M77 ai-test-planning, M78 ai-test-code-generation, M79 ai-test-healing, M80 mcp-server-agent-integration.
Extra files: none.

### Task 20 — Lesson 18 `decision-making-and-patterns`
Sources: M81 playwright-vs-selenium, M82 playwright-vs-cypress, M83 playwright-vs-puppeteer-others, M84 flakiness-root-cause-analysis, M85 test-maintenance-long-term-strategy, M86 cicd-pipeline-optimization, M87 secrets-security-in-tests, M88 test-health-observability.
Extra files: none.
Special note: 8 Parts, same guidance as Task 16 — do not compress.

### Task 21 — Lesson 19 `capstone`
Sources: M89 smoke-suite-for-lumio, M90 full-regression-suite-organization, M91 production-incident-reproduction, M92 end-to-end-review-capstone.
Extra files: none.
Special note: after this task, run a repo-wide check that `scaffolds/` contains exactly 20 directories:
```bash
ls -d scaffolds/module-*/ | wc -l
```
Expected: `20`.

---

## Task 22: Rewrite `scripts/modules.config.ts`

**Files:**
- Modify: `scripts/modules.config.ts`

**Interfaces:**
- Consumes: nothing (this is the registry itself)
- Produces: the `MODULES` array that `module-utils.ts`, `build-branches.ts`, `validate-module.ts`, `ci-finalize.ts` all import unchanged

- [ ] **Step 1: Replace the file contents.**

```typescript
export interface ModuleConfig {
  /** Zero-padded number: '00', '01', … '19' */
  number: string;
  /** Kebab-case slug used in branch names and directory names */
  slug: string;
  /** Human-readable title shown in success comments */
  title: string;
  /**
   * Git tag on main that marks the Lumio snapshot for this lesson.
   * The generation script checks out this tag before creating the branch,
   * so Lumio is at the right state of growth.
   * Null means "use the full Lumio from main" (Lumio is fully built by
   * Lesson 08 onward).
   */
  lumioSnapshot: string | null;
  /**
   * Whether this lesson has an exercise.spec.ts (or .tsx).
   * All 20 lessons have at least one exercise file — the two former
   * awareness-only modules (M01, M73) are folded in as non-exercise Parts
   * inside Lesson 00 and Lesson 15, which both also contain exercised Parts.
   */
  hasExercise: boolean;
}

export const MODULES: ModuleConfig[] = [
  { number: '00', slug: 'foundations', title: 'Foundations: Environment, Locators, Actions & Navigation', lumioSnapshot: 'lumio-snapshot-m02', hasExercise: true },
  { number: '01', slug: 'test-runner-organization', title: 'Test Runner & Organization', lumioSnapshot: 'lumio-snapshot-m06', hasExercise: true },
  { number: '02', slug: 'network-and-apis', title: 'Network & API Testing', lumioSnapshot: 'lumio-snapshot-m12', hasExercise: true },
  { number: '03', slug: 'auth-and-sessions', title: 'Authentication & Session Management', lumioSnapshot: 'lumio-snapshot-m16', hasExercise: true },
  { number: '04', slug: 'forms-and-interactions', title: 'Forms, Dialogs & Advanced Interactions', lumioSnapshot: 'lumio-snapshot-m20', hasExercise: true },
  { number: '05', slug: 'visual-a11y-performance', title: 'Visual, Accessibility & Performance Testing', lumioSnapshot: 'lumio-snapshot-m25', hasExercise: true },
  { number: '06', slug: 'realtime-and-user-flows', title: 'Multi-Tab, Real-Time & Complex User Flows', lumioSnapshot: 'lumio-snapshot-m31', hasExercise: true },
  { number: '07', slug: 'cross-browser-and-mobile', title: 'Cross-Browser & Mobile Testing', lumioSnapshot: 'lumio-snapshot-m34', hasExercise: true },
  { number: '08', slug: 'scale-and-cicd', title: 'Scale, Parallelism & CI/CD', lumioSnapshot: null, hasExercise: true },
  { number: '09', slug: 'debugging-and-reporting', title: 'Debugging, Tracing & Reporting', lumioSnapshot: null, hasExercise: true },
  { number: '10', slug: 'architecture-and-patterns', title: 'Test Architecture & Design Patterns', lumioSnapshot: null, hasExercise: true },
  { number: '11', slug: 'component-testing', title: 'Component Testing: React & Vue', lumioSnapshot: null, hasExercise: true },
  { number: '12', slug: 'specialized-automation', title: 'Specialized Automation: Scraping, Crawling & Bots', lumioSnapshot: null, hasExercise: true },
  { number: '13', slug: 'realtime-protocols-and-cdp', title: 'WebSocket, SSE & CDP Deep Dive', lumioSnapshot: null, hasExercise: true },
  { number: '14', slug: 'specialized-testing-types', title: 'Specialized Testing Types: i18n, Flags, Security, Chat & CMS', lumioSnapshot: null, hasExercise: true },
  { number: '15', slug: 'platform-specific-testing', title: 'Platform-Specific Testing: Extensions, Electron & Android', lumioSnapshot: null, hasExercise: true },
  { number: '16', slug: 'monitoring-and-synthetic', title: 'Synthetic Monitoring & Scheduled Bots', lumioSnapshot: null, hasExercise: true },
  { number: '17', slug: 'ai-and-modern-tooling', title: 'AI-Assisted Testing & MCP Integration', lumioSnapshot: null, hasExercise: true },
  { number: '18', slug: 'decision-making-and-patterns', title: 'Decision-Making & Real-World Patterns', lumioSnapshot: null, hasExercise: true },
  { number: '19', slug: 'capstone', title: 'Capstone: Full Suite Organization & Review', lumioSnapshot: null, hasExercise: true },
];
```

- [ ] **Step 2: Verify it type-checks.**
  ```bash
  npx tsc --noEmit scripts/modules.config.ts
  ```
  Expected: no errors.

- [ ] **Step 3: Commit.**
  ```bash
  git add scripts/modules.config.ts
  git commit -m "chore: rewrite module registry for 20-lesson curriculum"
  ```

---

## Task 23: Materialize Lesson 00 into `tests/` and reset progress state

**Files:**
- Delete: `tests/module-00-setup/`
- Create: `tests/module-00-foundations/` (copy of `scaffolds/module-00-foundations/`)
- Modify: `scripts/progress.json`

**Interfaces:**
- Consumes: `scaffolds/module-00-foundations/` from Task 2, `MODULES[0]` from Task 22
- Produces: the same materialized-first-module state the course was in before this reorg (progress tracking starts clean at the new Lesson 00)

- [ ] **Step 1: Remove the stale materialized module and copy the new one.**
  ```bash
  git rm -r tests/module-00-setup
  mkdir -p tests/module-00-foundations
  cp -r scaffolds/module-00-foundations/. tests/module-00-foundations/
  git add tests/module-00-foundations
  ```

- [ ] **Step 2: Reset `scripts/progress.json`** to the same "not yet started" shape it had before (per `docs/superpowers/specs/2026-05-09-progressive-ci-design.md`'s cold-start format), pointing at the new first module ID:
  ```json
  {
    "completedModules": [],
    "currentModule": {
      "id": "M00",
      "unlockedAt": "2026-07-18T00:00:00.000Z",
      "scaffoldHash": null
    },
    "lastUpdated": "2026-07-18T00:00:00.000Z",
    "lastCommitSha": null
  }
  ```
  (`scaffoldHash`/`lastCommitSha` are set once CI actually runs — `ci-finalize.ts`'s cold-start path already recomputes them; leaving `null` here matches how a fresh repo starts.)

- [ ] **Step 3: Validate the materialized module against the new registry.**
  ```bash
  npx tsx scripts/validate-module.ts
  ```
  Expected: this only works if you're on a `module-00-foundations` branch (per its `getCurrentBranch()` check) — if run from `main`, instead confirm manually that `tests/module-00-foundations/{README.md,exercise.spec.ts,hints.md,lumio-context.md}` all exist and that `exercise.spec.ts` imports from `'../fixtures/fixtures'`.

- [ ] **Step 4: Commit.**
  ```bash
  git add scripts/progress.json
  git commit -m "chore: materialize Lesson 00 and reset progress state for 20-lesson curriculum"
  ```

---

## Task 24: Update the two module-registry-dependent unit test files

**Files:**
- Modify: `scripts/lib/__tests__/module-utils.test.ts`
- Modify: `scripts/lib/__tests__/decision.test.ts`

**Interfaces:**
- Consumes: `MODULES` (via `module-utils.ts` / `decision.ts`, unchanged code) now resolving to the 20-entry registry from Task 22
- Produces: a green `npm run test:unit`

`filePathToModuleId`, `moduleDirectory`, `scaffoldDirectory`, `getNextModule`, `findNextCurrent`, and `makeDecision` all read the real `MODULES` singleton (no dependency injection exists in this codebase — confirmed by reading `module-utils.ts`), so their tests must use IDs that exist in the new 20-entry registry. The old tests used `M02`/`M03`/`M92`/`M73`, none of which exist standalone anymore.

- [ ] **Step 1: Replace `scripts/lib/__tests__/module-utils.test.ts` in full.**

```typescript
import { describe, it, expect } from 'vitest';
import {
  filePathToModuleId,
  buildTestMatch,
  moduleDirectory,
  scaffoldDirectory,
  getNextModule,
  findNextCurrent,
} from '../module-utils';

describe('filePathToModuleId', () => {
  it('extracts module ID from test file path', () => {
    expect(filePathToModuleId('tests/module-01-test-runner-organization/exercise.spec.ts')).toBe('M01');
  });
  it('extracts ID with nested path', () => {
    expect(filePathToModuleId('tests/module-10-architecture-and-patterns/pages/KanbanPage.ts')).toBe('M10');
  });
  it('returns null for non-module paths', () => {
    expect(filePathToModuleId('tests/fixtures/fixtures.ts')).toBeNull();
  });
  it('returns null for empty string', () => {
    expect(filePathToModuleId('')).toBeNull();
  });
});

describe('moduleDirectory', () => {
  it('builds the correct tests/ directory path', () => {
    expect(moduleDirectory('M00')).toBe('tests/module-00-foundations');
  });
  it('works for a mid-range module', () => {
    expect(moduleDirectory('M10')).toBe('tests/module-10-architecture-and-patterns');
  });
  it('throws for unknown module ID', () => {
    expect(() => moduleDirectory('M99')).toThrow('Module M99 not found');
  });
});

describe('scaffoldDirectory', () => {
  it('builds the correct scaffolds/ directory path', () => {
    expect(scaffoldDirectory('M00')).toBe('scaffolds/module-00-foundations');
  });
});

describe('buildTestMatch', () => {
  it('builds comma-separated globs for exercise modules', () => {
    const result = buildTestMatch(['M00'], 'M01');
    expect(result).toBe('tests/module-00-foundations/**,tests/module-01-test-runner-organization/**');
  });
  it('returns empty string when nothing is testable', () => {
    expect(buildTestMatch([], null)).toBe('');
  });
  it('handles null currentModule (post-completion regression mode)', () => {
    const result = buildTestMatch(['M00', 'M01'], null);
    expect(result).toBe('tests/module-00-foundations/**,tests/module-01-test-runner-organization/**');
  });
  it('includes every completed module — no lesson is awareness-only anymore', () => {
    // Unlike the old 93-module registry (where M01/M73 had hasExercise=false),
    // every merged lesson has hasExercise=true, so buildTestMatch never
    // excludes a completed module.
    const result = buildTestMatch(['M00', 'M01', 'M02'], null);
    expect(result).toBe(
      'tests/module-00-foundations/**,tests/module-01-test-runner-organization/**,tests/module-02-network-and-apis/**'
    );
  });
});

describe('getNextModule', () => {
  it('returns the next module config after given ID', () => {
    const next = getNextModule('M00');
    expect(next?.number).toBe('01');
  });
  it('returns null for the last module (M19)', () => {
    expect(getNextModule('M19')).toBeNull();
  });
});

describe('findNextCurrent', () => {
  it('returns the immediate next module with no auto-completed — no awareness-only lessons remain', () => {
    const result = findNextCurrent('M00');
    expect(result.nextCurrent).toBe('M01');
    expect(result.autoCompleted).toEqual([]);
  });
  it('returns null nextCurrent when completing the last module', () => {
    const result = findNextCurrent('M19');
    expect(result.nextCurrent).toBeNull();
    expect(result.autoCompleted).toEqual([]);
  });
});
```

- [ ] **Step 2: Replace `scripts/lib/__tests__/decision.test.ts` in full.**

```typescript
import { describe, it, expect } from 'vitest';
import { makeDecision } from '../decision';
import type { ProgressState } from '../../types';

const baseProgress: ProgressState = {
  completedModules: [
    { id: 'M00', completedAt: '2026-01-01T00:00:00Z', scaffoldHash: 'abc' },
  ],
  currentModule: { id: 'M01', unlockedAt: '2026-01-02T00:00:00Z', scaffoldHash: 'def' },
  lastUpdated: '2026-01-02T00:00:00Z',
  lastCommitSha: 'abc123',
};

const noChanges = new Map<string, boolean>([['M00', false], ['M01', false]]);

describe('makeDecision', () => {
  it('returns cancelled when results map is empty (job was cancelled)', () => {
    const d = makeDecision(new Map(), baseProgress, new Map());
    expect(d.type).toBe('cancelled');
  });

  it('returns unlock when all tests pass', () => {
    const results = new Map([['M00', true], ['M01', true]]);
    const d = makeDecision(results, baseProgress, noChanges);
    expect(d.type).toBe('unlock');
    if (d.type === 'unlock') {
      expect(d.completedId).toBe('M01');
      expect(d.nextCurrent).toBe('M02'); // M02 is network-and-apis, hasExercise=true
      expect(d.autoCompleted).toEqual([]);
    }
  });

  it('unlocks the immediate next module with no auto-completion (no awareness-only lessons remain)', () => {
    const progress: ProgressState = {
      completedModules: [],
      currentModule: { id: 'M00', unlockedAt: '2026-01-01T00:00:00Z', scaffoldHash: 'abc' },
      lastUpdated: '2026-01-01T00:00:00Z',
      lastCommitSha: 'abc123',
    };
    const results = new Map([['M00', true]]);
    const d = makeDecision(results, progress, new Map([['M00', false]]));
    expect(d.type).toBe('unlock');
    if (d.type === 'unlock') {
      expect(d.nextCurrent).toBe('M01');
      expect(d.autoCompleted).toEqual([]);
    }
  });

  it('returns fail when current module fails', () => {
    const results = new Map([['M00', true], ['M01', false]]);
    const d = makeDecision(results, baseProgress, noChanges);
    expect(d.type).toBe('fail');
    if (d.type === 'fail') {
      expect(d.failedModules).toContain('M01');
      expect(d.failedModules).not.toContain('M00');
    }
  });

  it('returns regression when a completed module fails', () => {
    const results = new Map([['M00', false], ['M01', true]]);
    const d = makeDecision(results, baseProgress, noChanges);
    expect(d.type).toBe('regression');
    if (d.type === 'regression') {
      expect(d.regressionModules).toContain('M00');
      expect(d.scaffoldChangedModules).toEqual([]);
    }
  });

  it('flags scaffold-changed modules in regression', () => {
    const results = new Map([['M00', false], ['M01', true]]);
    const changes = new Map([['M00', true], ['M01', false]]);
    const d = makeDecision(results, baseProgress, changes);
    expect(d.type).toBe('regression');
    if (d.type === 'regression') {
      expect(d.scaffoldChangedModules).toContain('M00');
    }
  });

  it('returns complete when currentModule is null and all pass', () => {
    const progress: ProgressState = {
      completedModules: [{ id: 'M00', completedAt: '2026-01-01T00:00:00Z', scaffoldHash: 'abc' }],
      currentModule: null,
      lastUpdated: '2026-01-01T00:00:00Z',
      lastCommitSha: 'abc123',
    };
    const results = new Map([['M00', true]]);
    const d = makeDecision(results, progress, new Map([['M00', false]]));
    expect(d.type).toBe('complete');
  });

  it('returns complete-regression-fail when post-completion module fails', () => {
    const progress: ProgressState = {
      completedModules: [{ id: 'M00', completedAt: '2026-01-01T00:00:00Z', scaffoldHash: 'abc' }],
      currentModule: null,
      lastUpdated: '2026-01-01T00:00:00Z',
      lastCommitSha: 'abc123',
    };
    const results = new Map([['M00', false]]);
    const d = makeDecision(results, progress, new Map([['M00', false]]));
    expect(d.type).toBe('complete-regression-fail');
  });
});
```

- [ ] **Step 3: Run the unit suite.**
  ```bash
  npm run test:unit
  ```
  Expected: all tests in `scripts/lib/__tests__/` pass, including the untouched `results-parser.test.ts`.

- [ ] **Step 4: Commit.**
  ```bash
  git add scripts/lib/__tests__/module-utils.test.ts scripts/lib/__tests__/decision.test.ts
  git commit -m "test: update module-registry unit tests for 20-lesson curriculum"
  ```

---

## Task 25: Regenerate `tests/README.md` and update root `README.md`

**Files:**
- Modify: `tests/README.md`
- Modify: `README.md`

- [ ] **Step 1: Replace the Module Table in `tests/README.md`** (lines 19–115 in the old file) with:

```markdown
## Module Table

| Lesson | Directory | Topic |
|--------|-----------|-------|
| M00 | `module-00-foundations` | Foundations: Environment, Locators, Actions & Navigation |
| M01 | `module-01-test-runner-organization` | Test Runner & Organization |
| M02 | `module-02-network-and-apis` | Network & API Testing |
| M03 | `module-03-auth-and-sessions` | Authentication & Session Management |
| M04 | `module-04-forms-and-interactions` | Forms, Dialogs & Advanced Interactions |
| M05 | `module-05-visual-a11y-performance` | Visual, Accessibility & Performance Testing |
| M06 | `module-06-realtime-and-user-flows` | Multi-Tab, Real-Time & Complex User Flows |
| M07 | `module-07-cross-browser-and-mobile` | Cross-Browser & Mobile Testing |
| M08 | `module-08-scale-and-cicd` | Scale, Parallelism & CI/CD |
| M09 | `module-09-debugging-and-reporting` | Debugging, Tracing & Reporting |
| M10 | `module-10-architecture-and-patterns` | Test Architecture & Design Patterns |
| M11 | `module-11-component-testing` | Component Testing: React & Vue |
| M12 | `module-12-specialized-automation` | Specialized Automation: Scraping, Crawling & Bots |
| M13 | `module-13-realtime-protocols-and-cdp` | WebSocket, SSE & CDP Deep Dive |
| M14 | `module-14-specialized-testing-types` | Specialized Testing Types: i18n, Flags, Security, Chat & CMS |
| M15 | `module-15-platform-specific-testing` | Platform-Specific Testing: Extensions, Electron & Android |
| M16 | `module-16-monitoring-and-synthetic` | Synthetic Monitoring & Scheduled Bots |
| M17 | `module-17-ai-and-modern-tooling` | AI-Assisted Testing & MCP Integration |
| M18 | `module-18-decision-making-and-patterns` | Decision-Making & Real-World Patterns |
| M19 | `module-19-capstone` | Capstone: Full Suite Organization & Review |
```

Also update the intro paragraph's file-purpose table (lines 3–7) to note each lesson is a merger of the original curriculum's modules — add one sentence: "Each lesson merges several of the original 93-module curriculum's topics into numbered Parts (see each lesson's README for the Part breakdown)."

- [ ] **Step 2: Update root `README.md`.**
  - Line 12: `"Playwright topic across 93 modules."` → `"Playwright topic across 20 lessons (a curated merge of the original 93-module curriculum)."`
  - Line 43: `"# 6. Verify everything works — run the M00 smoke test"` / `npx playwright test tests/module-00-setup --headed` → `npx playwright test tests/module-00-foundations --headed`
  - Line 51: `"All 93 modules live under tests/."` → `"All 20 lessons live under tests/."`
  - Lines 92–94 repository layout snippet: replace `module-00-setup/`, `module-01-*/`, `# M00 – M92` with `module-00-foundations/`, `module-01-*/`, `# M00 – M19`
  - Lines 96–97 (component-testing config comments): `(M51–M52, M54)` → `(Lesson 11, Parts 1/2/4)`; `(M53)` → `(Lesson 11, Part 3)`

- [ ] **Step 3: Grep for any remaining stale references.**
  ```bash
  grep -n "93 modules\|module-00-setup\|M92\b" README.md tests/README.md
  ```
  Expected: no matches.

- [ ] **Step 4: Commit.**
  ```bash
  git add README.md tests/README.md
  git commit -m "docs: regenerate module index and quickstart for 20-lesson curriculum"
  ```

---

## Task 26: Update `.github/workflows/module-check.yml` comment

**Files:**
- Modify: `.github/workflows/module-check.yml`

The workflow's logic (branch-name pattern matching, `tests/$MODULE` existence check, test invocation) is entirely generic — confirmed by reading the full file — and needs **no logic changes**. Only one comment references specific old module numbers.

- [ ] **Step 1: Update the comment.**

Change:
```yaml
        run: |
          # Most modules need Chromium only.
          # M07 and M34 (cross-browser) install all three via their own
          # overridden workflow step in their branch's module-check.yml.
          npx playwright install --with-deps chromium
```
to:
```yaml
        run: |
          # Most lessons need Chromium only.
          # Lesson 01 (test-runner-organization, which includes the former
          # M07 multi-project config exercise) and Lesson 07
          # (cross-browser-and-mobile) install all three via their own
          # overridden workflow step in their branch's module-check.yml.
          npx playwright install --with-deps chromium
```

- [ ] **Step 2: Confirm no other module-number references exist in this file.**
  ```bash
  grep -n "M[0-9][0-9]" .github/workflows/module-check.yml
  ```
  Expected: no matches after Step 1.

- [ ] **Step 3: Commit.**
  ```bash
  git add .github/workflows/module-check.yml
  git commit -m "docs: update module-check workflow comment for 20-lesson curriculum"
  ```

---

## Task 27: Record the reorg as a dated spec, mark prior specs superseded, final sanity sweep

**Files:**
- Create: `docs/superpowers/specs/2026-07-18-lesson-aggregation-93-to-20.md`
- Modify: `docs/superpowers/specs/2026-05-08-playwright-learning-platform-design.md`
- Modify: `docs/superpowers/specs/2026-05-09-progressive-ci-design.md`

- [ ] **Step 1: Create the new spec**, following the format of the existing dated specs in that folder:

```markdown
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
  in `module-utils.test.ts` and `decision.test.ts`
- `.github/workflows/playwright.yml`, `.github/workflows/progress.yml`
- The four-file-per-lesson format and the progressive-CI unlock model

## What changed

- `scripts/modules.config.ts`: 93 entries → 20
- `scaffolds/`: 93 directories → 20
- `tests/module-00-setup/` → `tests/module-00-foundations/`
- `scripts/progress.json`: reset to the new first lesson
- Two unit test files updated for the new registry size/IDs
- `README.md`, `tests/README.md`, one workflow comment
```

(Fill in the "Why" section with the user's actual stated reason if one was given during this work; otherwise leave the bracketed placeholder for the user to fill in themselves — this is a note-to-self field in a historical spec, not an implementation instruction, so it is exempt from the plan's no-placeholder rule.)

- [ ] **Step 2: Add a one-line pointer to the top of each old spec**, directly under its existing `**Status:** Approved` line, leaving everything else in those files untouched:

In `2026-05-08-playwright-learning-platform-design.md`:
```markdown
> **Note (2026-07-18):** The module *count* described below (93 modules) was
> later merged into 20 lessons — see `2026-07-18-lesson-aggregation-93-to-20.md`.
> The architecture, Lumio app design, and per-topic content described here are
> still accurate; only the number of top-level lesson directories changed.
```

In `2026-05-09-progressive-ci-design.md`:
```markdown
> **Note (2026-07-18):** References to "93 modules" below predate the
> 20-lesson merge — see `2026-07-18-lesson-aggregation-93-to-20.md`. The
> progressive-unlock mechanism described here is unchanged; only the total
> module count and specific IDs (e.g. "M92" is now "M19") are stale.
```

- [ ] **Step 3: Final repo-wide sanity sweep.**
  ```bash
  ls -d scaffolds/module-*/ | wc -l          # expect 20
  ls -d tests/module-*/ | wc -l               # expect 1 (only Lesson 00 materialized so far)
  grep -rn "module-9[0-2]-\|module-[2-9][0-9]-" scaffolds/ tests/ scripts/ .github/ README.md 2>/dev/null | grep -v node_modules
                                               # expect no matches (no old-numbered directories remain)
  npm run test:unit                           # expect all pass
  ```

- [ ] **Step 4: Commit.**
  ```bash
  git add docs/superpowers/specs/2026-07-18-lesson-aggregation-93-to-20.md
  git add docs/superpowers/specs/2026-05-08-playwright-learning-platform-design.md
  git add docs/superpowers/specs/2026-05-09-progressive-ci-design.md
  git commit -m "docs: record 93-to-20 lesson aggregation spec, mark prior specs superseded"
  ```

---

## Self-Review Notes

- **Spec coverage:** every one of the 93 old modules appears exactly once in the mapping table (verified the counts sum to 93 and the 20 groups sum to 20). Every non-standard/extra file found in the repo scan (`playwright-m07.config.ts`, both `exercise-use.spec.ts` files, `globalSetup.ts`, `fixtures/sample*.txt`, `pages/KanbanPage.ts`, `task-data.json`, the four `.tsx` component-test files) has an explicit destination in a task.
- **Placeholder scan:** the only bracketed placeholder left is the "Why" field in Task 27's new spec doc, which is explicitly exempted (a note-to-self in a historical record, not an instruction to an implementer) — everything else (paths, filenames, code, commands) is concrete.
- **Type/interface consistency:** `ModuleConfig` shape is unchanged (same four fields) so no downstream code needs signature changes; `MODULES[i].number`/`slug` values used in Task 22 match exactly what Tasks 2–21 create on disk and what Tasks 23–26 reference.
