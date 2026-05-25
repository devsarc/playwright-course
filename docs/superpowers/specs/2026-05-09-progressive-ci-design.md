# Progressive CI System — Single-Branch Design

**Date:** 2026-05-09
**Status:** Approved

## Overview

A single-branch (`main`) CI system for the Playwright learning platform that:
- Runs tests only for completed modules + the current module (not all 93)
- Automatically unlocks the next module when all tests pass
- Generates per-commit reports visible in GitHub Actions and a GitHub Pages dashboard
- Prevents automated commits from re-triggering CI
- Supports course developer updates without disrupting learner progress

---

## 1. Data Model

### `scripts/progress.json`

Single source of truth for learner state. Committed to the repo, visible in git history.

```json
{
  "completedModules": [
    { "id": "M00", "completedAt": "2026-05-01T10:00:00Z", "scaffoldHash": "a1b2c3" },
    { "id": "M01", "completedAt": "2026-05-02T14:20:00Z", "scaffoldHash": null }
  ],
  "currentModule": {
    "id": "M02",
    "unlockedAt": "2026-05-03T09:15:00Z",
    "scaffoldHash": "g7h8i9"
  },
  "lastUpdated": "2026-05-09T14:32:00Z",
  "lastCommitSha": "a3f91c2"
}
```

**Fields:**
- `completedModules` — ordered list of modules the learner has passed; each entry records when it was completed and the scaffold hash at unlock time
- `currentModule` — the one module currently in-progress; `null` if all 93 are complete
- `scaffoldHash` — hash of the scaffold source file at the time it was copied to `tests/`; `null` for awareness modules (no exercise file); used to detect developer updates
- `lastCommitSha` — the learner commit that triggered this state (not the CI automated commit)

**Module ID format:** `progress.json` uses the module's zero-padded number with an "M" prefix (e.g., `"M00"`, `"M42"`). This maps to `modules.config.ts` via `"M" + module.number` and to the directory via `module-${module.number}-${module.slug}`.

### Module lifecycle

```
locked → current → (testing) → completed
                       ↓ fail
                    current (unchanged)
```

- **locked** — exercise file does not exist in `tests/` yet; CI never references it
- **current** — exercise scaffold was copied to `tests/` by the previous CI run; learner is filling in TODOs
- **completed** — all tests passed; included in every future CI run as a regression guard
- **all complete** — `currentModule: null`; subsequent CI runs act as a pure regression suite

### Awareness modules (no exercise)

Modules where `hasExercise: false` in `modules.config.ts` are **auto-completed on unlock**:
- No exercise file is copied; no tests are run for them
- Immediately marked complete in `progress.json` with `scaffoldHash: null`
- The unlock cascades to the next module (repeating until a `hasExercise: true` module or `currentModule: null` is reached)
- Maximum cascade: all 93 modules could theoretically be awareness-only — the loop terminates when no further modules exist
- The report notes each auto-completed module: "M01 is an awareness module — auto-completed"

### Post-completion behaviour

When all 93 modules are done (`currentModule: null`), subsequent learner pushes trigger CI in **regression-only mode**:
- `PW_TEST_MATCH` covers all completed modules that have exercises
- `finalize` job skips the unlock step entirely
- Report shows: "All modules complete — regression suite passed/failed"
- No state changes occur on pass; failures are reported normally

### Cold start

If `progress.json` is missing (first ever push to a fresh fork):
1. CI detects absence, initialises `progress.json` with `completedModules: []` and `currentModule: { id: "M00", ... }`
2. If M00 has `hasExercise: true`: copies M00 scaffold from `scaffolds/module-00-*/` to `tests/module-00-*/`; if not, cascades to the first module that does
3. Commits both with `[skip ci]`
4. No tests run on this push — learner receives their first exercise file

---

## 2. Scaffold Architecture

### Directory layout

```
scaffolds/                        ← developer-owned; learner never edits
  module-00-setup/
    exercise.spec.ts
  module-01-navigation/
    exercise.spec.ts              ← awareness module: no file here for M01 if hasExercise=false
  ...
  module-92-advanced/
    exercise.spec.ts

tests/                            ← learner-owned; CI copies scaffold here on unlock
  module-00-setup/
    exercise.spec.ts              ← learner's working copy (may have TODOs filled in)
  ...                             ← only unlocked modules exist here
```

- `scaffolds/` is the source; learner never edits it; developer updates go here
- `tests/` is the working copy; CI copies scaffold → tests on unlock; learner fills in TODOs
- Learner's fork syncs `scaffolds/` cleanly from upstream (no conflicts); `tests/` stays theirs

---

## 3. CI Workflow Pipeline

**File:** `.github/workflows/progress.yml`

### Triggers

```yaml
on:
  push:
    branches: [main]
    paths-ignore:
      - 'docs/**'
      - 'scaffolds/**'
      - '*.md'
  workflow_dispatch:   # allows manual retry after transient failures without a dummy commit
```

`paths-ignore` (not `paths`) is used so new files trigger CI by default — no silent misses. `reports/` is NOT in paths-ignore because report artifacts live exclusively in the `gh-pages` branch, not `main`. The `[skip ci]` mechanism is the primary cycle guard; `paths-ignore` is an efficiency optimisation on top.

### Concurrency

```yaml
concurrency:
  group: progress-${{ github.ref }}
  cancel-in-progress: true
```

Cancels any in-progress run for the same branch when a new push arrives. This is the primary solution to the race condition where two rapid pushes could produce conflicting `progress.json` writes. The cancelled run is marked as "cancelled" not "failed" — no false alarm for the learner.

### Permissions (least-privilege, per-job)

```yaml
# Top-level default: read-only
permissions:
  contents: read

jobs:
  test:
    # test job only reads — inherits default read permissions
    ...

  finalize:
    permissions:
      contents: write   # needed: git commit + push to main and gh-pages
      pages: write      # needed: GitHub Pages deployment API (if using actions/deploy-pages)
      id-token: write   # needed: OIDC token for Pages deployment
    ...
```

`contents: write` is the minimum required for `git push`. `pages: write` + `id-token: write` are required if using the official `actions/deploy-pages` action; if pushing directly to `gh-pages` branch, only `contents: write` is needed.

### Job: `test`

1. `actions/checkout@v4`
2. Set up Node.js (pin version — e.g., `node-version: '20'`)
3. Install dependencies (`npm ci`)
4. Generate Prisma client (`npx prisma generate`)
5. Seed database (`npx prisma db push && npx prisma db seed`)
6. Read `progress.json` → get `completedModules` + `currentModule`
7. Filter to only modules where `hasExercise: true` (skip awareness modules from `PW_TEST_MATCH`)
8. Build `PW_TEST_MATCH`: comma-separated directory globs for all testable modules
   - Format: `tests/module-00-setup/**,tests/module-02-locators/**` (awareness modules excluded)
9. Configure JSON reporter output file via env var: `PLAYWRIGHT_JSON_OUTPUT_NAME=test-results/results.json`
10. Run `npx playwright test --reporter=json,html`
11. Upload `test-results/results.json` and `playwright-report/` as artifacts (`if: always()`)
    - If test job is **cancelled**: artifacts may be incomplete or missing; `finalize` must handle this gracefully

### Job: `finalize` (always runs — `if: always()`, depends on `test`)

1. `actions/checkout@v4` with `token: ${{ secrets.GITHUB_TOKEN }}`; configure git identity:
   ```bash
   git config user.name "github-actions[bot]"
   git config user.email "github-actions[bot]@users.noreply.github.com"
   ```
2. Download artifacts from `test` job
3. **If artifacts missing** (test job was cancelled): write "CI run cancelled" summary; exit without state change
4. Parse `test-results/results.json`:
   - Map test file paths → module IDs using `modules.config.ts`: `tests/module-{number}-{slug}/**` → `"M{number}"`
   - Produce per-module pass/fail map: `{ "M00": true, "M02": false, ... }`
5. Recompute scaffold hashes for all active modules; compare to `progress.json` stored hashes
6. **Decision logic:**

   | Condition | Action |
   |-----------|--------|
   | All tests pass, no regression | Mark current complete, unlock next module |
   | Any test fails (current or completed) | No state change, generate failure report |
   | Completed module fails + scaffold hash changed | Failure flagged as "likely due to developer update" |
   | `currentModule` is the last module and passes | Set `currentModule: null`; generate completion report |
   | `currentModule` is already `null` (post-completion) | Regression-only mode; no unlock step |

7. If unlocking next module:
   - Update `progress.json` (mark current complete, set new current, record scaffold hash)
   - Handle awareness module cascade (auto-complete consecutive `hasExercise: false` modules)
   - Copy next exercise scaffold from `scaffolds/` to `tests/`
8. Commit with `[skip ci]`: `progress.json` + new exercise file (if any)
   - `// TODO: add job-level condition [if: github.actor != 'github-actions[bot]'] as belt-and-suspenders guard`
9. Push to `main`:
   - On non-fast-forward rejection (edge case, concurrency group reduces likelihood): **retry once with rebase** (`git pull --rebase origin main && git push`); if second attempt fails, mark step as failed with clear message — no silent data loss
10. Publish HTML report to `gh-pages`:
    - Fetch/checkout `gh-pages` branch (create orphan branch on first run if it doesn't exist)
    - Copy `playwright-report/` to `reports/<sha>/`
    - Append entry to `reports/manifest.json` (lives in `gh-pages` only, not `main`)
    - Regenerate `index.html` from `manifest.json`
    - Commit and push to `gh-pages`
    - If Pages publish fails: **non-fatal** — log warning, proceed; Actions summary still written
11. Write Actions job summary to `$GITHUB_STEP_SUMMARY`

### `playwright.config.ts` integration

```typescript
// PW_TEST_MATCH is set by CI; unset means local dev (runs all unlocked exercise files)
testMatch: process.env.PW_TEST_MATCH
  ? process.env.PW_TEST_MATCH.split(',')
  : ['**/exercise.spec.ts', '**/exercise.spec.tsx'],
```

Local development runs all unlocked modules without any filter. The `PLAYWRIGHT_JSON_OUTPUT_NAME` env var is set by the CI workflow, not in config, so local runs produce no JSON file by default.

### Finalize script

The decision logic, hash computation, manifest update, and `index.html` generation are implemented as **`scripts/ci-finalize.ts`**, executed with `tsx` (no compile step, TypeScript-native). The workflow calls:
```bash
npx tsx scripts/ci-finalize.ts
```

The script reads its context from env vars set by the workflow step (artifact paths, commit SHA, `progress.json` path).

### Developer mode

A `FORCE_ALL_MODULES` GitHub Actions repository variable bypasses the `PW_TEST_MATCH` filter and runs all 93 modules. Intended for the course developer's own repo; has no effect on learner forks unless explicitly set.

---

## 4. Cycle Prevention

**Primary:** Every automated commit message includes `[skip ci]`. GitHub natively skips the workflow run — no runner is allocated.

**Belt-and-suspenders (TODO):** Add `if: github.actor != 'github-actions[bot]'` as the first job condition. Handles the edge case where a workflow is manually re-triggered (via `workflow_dispatch`) on an automated commit SHA.

---

## 5. Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| Regression in completed module | Fail, report identifies which module, no unlock, `progress.json` unchanged |
| Current module fails | No unlock, learner fixes and pushes again |
| Both completed + current fail | All failures listed in report |
| Last module (M92) completes | `currentModule: null`, "All modules complete!" report, no new file |
| Post-completion push | Regression-only mode; no unlock attempt; report shows full suite pass/fail |
| `progress.json` missing (cold start) | CI initialises, copies first exercise scaffold, commits with `[skip ci]`, no tests run |
| Learner manually edits `progress.json` | System trusts it — intentional design choice; allows rewind/skip at learner's own risk |
| Playwright runner times out | `finalize` job still runs (`if: always()`), treats as all-fail, reports "CI timeout" |
| Test job cancelled | `finalize` detects missing artifacts, writes "run cancelled" summary, exits cleanly |
| Pages publish fails | Non-fatal — logged as warning; Actions summary and state commit still proceed |
| Automated commit push fails (1st attempt) | Retry once with rebase; if 2nd fails, step fails with clear error — no silent data loss |
| Two rapid pushes | Concurrency group cancels the older run; one run completes cleanly |
| `workflow_dispatch` manual retry | Runs as a normal learner push; `[skip ci]` is not in the commit message so it runs normally |
| Docs-only push | `paths-ignore` skips CI — no runner cost |
| Awareness module at unlock | Auto-completed, cascades to next; report notes auto-completion |
| Multiple consecutive awareness modules | Cascade loop terminates at next `hasExercise: true` module or `null` |
| Scaffold updated (locked module) | Picked up automatically on next unlock — no action needed |
| Scaffold updated (current module) | Report warns learner; their in-progress work is never touched |
| Scaffold updated (completed module, still passes) | Noted in report: "scaffold updated, solution still passes" |
| Scaffold updated (completed module, now fails) | Flagged: "scaffold updated — solution may need review" |
| Branch protection on `main` | Incompatible with automated commit approach — document as known constraint; personal learning forks typically have no branch protection |
| `gh-pages` branch doesn't exist (first publish) | Finalize creates it as an orphan branch before first push |

---

## 6. Developer Update Flow

The course developer pushes changes to the upstream template repo. Learners sync via GitHub's "Sync fork" button (or `git fetch upstream && git merge upstream/main`).

**Why merges are clean:**
- `scaffolds/`, `lumio/`, `.github/`, `scripts/` — learner never edits these; merges cleanly
- `tests/module-XX-*/exercise.spec.ts` — upstream never touches these; no conflict
- `progress.json` — learner always keeps theirs; resolve with `git checkout --ours scripts/progress.json`

**Scaffold hash tracking** ensures the learner is notified in the next CI report when developer-updated scaffold versions differ from what was copied at unlock time — without ever overwriting the learner's work.

---

## 7. Dashboard

### Actions job summary (per-commit)

Written to `$GITHUB_STEP_SUMMARY` on every run. Example:

```
## Playwright Progress — commit a3f91c2

| Module | Status | Tests |
|--------|--------|-------|
| M00 setup | ✓ pass | 3/3 |
| M01 navigation | ↷ auto | awareness |
| M02 locators | ✗ FAIL | 4/6 |  ← current

Overall: FAIL — M02 has 2 failing tests. Fix and push again.

📊 Full report: https://<user>.github.io/<repo>/reports/a3f91c2/
```

### GitHub Pages (historical dashboard)

**Setup requirement:** GitHub Pages must be enabled in the repo's Settings → Pages (set source to `gh-pages` branch). The `gh-pages` branch is created automatically by CI on first publish. This is a one-time manual setup step per learner fork.

Published to `gh-pages` branch only. Structure:

```
index.html                  ← master run list, regenerated on every CI run
reports/
  a3f91c2/
    index.html              ← Playwright HTML report for this commit
  b1d2e3f/
    index.html
manifest.json               ← machine-readable run history (gh-pages only, not main)
```

`index.html` is a static page (no framework) generated by `ci-finalize.ts` from `manifest.json`. Shows: commit SHA, date, pass/fail, modules tested, link to full report.

**Note:** GitHub Pages is public on free-tier public repos. The learner's test history and exercise solutions will be publicly visible. Acceptable for a personal learning repo; document this in the platform README.

---

## 8. File Inventory

| File | Branch | Owner | Purpose |
|------|--------|-------|---------|
| `scripts/progress.json` | `main` | CI (auto-committed) | Canonical learner state |
| `scripts/modules.config.ts` | `main` | Developer | Source of truth for all 93 module IDs and metadata |
| `scripts/ci-finalize.ts` | `main` | Developer | Decision logic, hash computation, manifest + dashboard generation |
| `scaffolds/module-XX-*/exercise.spec.ts` | `main` | Developer | Exercise scaffold sources; never edited by learner |
| `tests/module-XX-*/exercise.spec.ts` | `main` | Learner | Working copies; CI copies scaffold here on unlock |
| `.github/workflows/progress.yml` | `main` | Developer | Main CI workflow |
| `playwright.config.ts` | `main` | Developer | Reads `PW_TEST_MATCH` for dynamic test filtering |
| `gh-pages/index.html` | `gh-pages` | CI (published) | Historical dashboard |
| `gh-pages/manifest.json` | `gh-pages` | CI (published) | Run history (not committed to main) |
| `gh-pages/reports/<sha>/` | `gh-pages` | CI (published) | Per-commit Playwright HTML reports |
