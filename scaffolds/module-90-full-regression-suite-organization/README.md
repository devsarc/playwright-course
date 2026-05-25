# M90: Full Regression Suite Organization

## Learning Objectives

- Classify tests into the four tiers: smoke, sanity, regression, and full
- Tag all existing tests by tier using `testInfo.annotations` and title-embedded tags
- Configure different CI triggers for each tier (per-push, per-PR, nightly, release)
- Use `--grep` and `--grep-invert` to select tier-specific subsets
- Understand the tradeoff between coverage breadth and CI feedback time

## Concept

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

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-90-full-regression-suite-organization
```

## Key Takeaways

1. Four tiers — smoke, sanity, regression, full — map to four CI triggers with different speed and coverage tradeoffs.
2. Tags in the test title enable `--grep` filtering without any config changes.
3. `testInfo.annotations` makes tags queryable from the JSON reporter for dashboard use.
4. `test.fixme()` preserves regression intent for known bugs without failing the CI count.
5. Tier drift is inevitable — schedule a quarterly suite review to rebalance tag distribution.

## Going Deeper

- [Playwright docs: Tag tests](https://playwright.dev/docs/test-annotations#tag-tests)
- [Playwright docs: test.fixme()](https://playwright.dev/docs/api/class-test#test-fixme)
- [Playwright docs: CLI --grep](https://playwright.dev/docs/test-cli)
- [Google Testing Blog: Test Sizes](https://testing.googleblog.com/2010/12/test-sizes.html)
