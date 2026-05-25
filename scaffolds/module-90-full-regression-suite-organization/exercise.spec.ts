import { test, expect } from '../fixtures/fixtures';

// M90: Full Regression Suite Organization
// Each test demonstrates one aspect of the four-tier tagging and CI trigger strategy.

test.describe('M90 — Full Regression Suite Organization', () => {

  // Test 1: Smoke tier — critical path, runs on every push, < 60 s total.
  // Tagging in both title and annotation ensures grep + dashboard both work.
  test('tier: login is tagged @smoke for per-push CI @smoke', async ({ page }, testInfo) => {
    // TODO 1: Push an annotation with type 'tag' and description '@smoke'.
    // The title already contains @smoke — this annotation adds it to the JSON reporter output.
    testInfo.annotations.push({
      type: 'tag',
      description: /* TODO 1: '@smoke' */ 'PLACEHOLDER',
    });
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    const smokeTag = testInfo.annotations.find(a => a.description === '@smoke');
    expect(smokeTag?.type).toBe('tag');
  });

  // Test 2: Sanity tier — feature-level check, runs on every PR merge.
  // Sanity tests are fast but not critical enough to block every push.
  test('tier: task creation is tagged @sanity for per-PR CI @sanity', async ({ page }, testInfo) => {
    // TODO 2: Replace 'PLACEHOLDER' with '@sanity' — the tier description for this annotation.
    testInfo.annotations.push({
      type: 'tag',
      description: /* TODO 2: '@sanity' */ 'PLACEHOLDER',
    });
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);
    const sanityTag = testInfo.annotations.find(a => a.description === '@sanity');
    expect(sanityTag?.type).toBe('tag');
  });

  // Test 3: Multi-tier tagging — a test can belong to both smoke and sanity tiers.
  // Running 'npx playwright test --grep "@smoke|@sanity"' includes this test.
  test('tier: login is in both @smoke and @sanity tiers @smoke @sanity', async ({ page }, testInfo) => {
    // Push both tier annotations so the JSON reporter captures both memberships.
    // TODO 3: Add BOTH annotations — push '@smoke' and '@sanity' tags.
    testInfo.annotations.push({ type: 'tag', description: '@smoke' });
    // TODO 3: Replace 'PLACEHOLDER' with '@sanity' to complete the multi-tier annotation.
    testInfo.annotations.push({ type: 'tag', description: /* TODO 3: '@sanity' */ 'PLACEHOLDER' });
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    const tags = testInfo.annotations.filter(a => a.type === 'tag').map(a => a.description);
    expect(tags).toContain('@smoke');
    expect(tags).toContain('@sanity');
  });

  // Test 4: test.fixme() for a known bug — preserves regression intent without failing CI.
  // 'fixme' appears in the report as an expected failure, not a surprise red.
  // This test is fixme'd because the date picker returns the wrong month in WebKit (LUM-789).
  test.fixme('tier: @regression date picker shows correct month in WebKit @regression', async ({ page }) => {
    // This test is intentionally marked fixme — it represents a known, tracked bug.
    // When LUM-789 is resolved, remove test.fixme() and the test will be re-enabled.
    // TODO 4: The body is intentionally empty — test.fixme() prevents it from running.
    // No implementation needed here; the purpose is to understand fixme semantics.
    await page.goto('/dashboard');
    expect(true).toBe(false); // Would fail if fixme were removed prematurely.
  });

  // Test 5: Regression tier annotation — identifies a test as belonging to the nightly run.
  // Regression tests don't need to be fast — they need to be thorough.
  test('tier: i18n French locale is tagged @regression for nightly CI @regression', async ({ page }, testInfo) => {
    testInfo.annotations.push({
      type: 'tag',
      // TODO 5: Replace 'PLACEHOLDER' with '@regression' — this test belongs to the nightly regression tier.
      description: /* TODO 5: '@regression' */ 'PLACEHOLDER',
    });
    await page.goto('/');
    await expect(page).toHaveTitle(/Lumio/);
    const regressionTag = testInfo.annotations.find(a => a.description === '@regression');
    expect(regressionTag?.type).toBe('tag');
  });

  // Test 6: Suite owner annotation — identifies which squad maintains this test.
  // The JSON reporter output includes annotations — a health script can alert the right team.
  test('documentation: test has an owner annotation for escalation routing', async ({ page }, testInfo) => {
    testInfo.annotations.push({
      // TODO 6: Replace 'PLACEHOLDER' with 'owner' — the annotation type for team ownership metadata.
      type: /* TODO 6: 'owner' */ 'PLACEHOLDER',
      description: 'platform-team',
    });
    await page.goto('/');
    await expect(page).toHaveTitle(/Lumio/);
    const ownerAnnotation = testInfo.annotations.find(a => a.type === 'owner');
    expect(ownerAnnotation?.description).toBe('platform-team');
  });

  // Test 7: --grep-invert excludes slow tests from per-push checks.
  // A test tagged @slow is excluded from per-push CI with: --grep-invert "@slow"
  test('tier: visual regression is tagged @slow to exclude from fast CI @slow', async ({ page }, testInfo) => {
    testInfo.annotations.push({
      type: 'tag',
      // TODO 7: Replace 'PLACEHOLDER' with '@slow' — the tag that --grep-invert "@slow" will exclude.
      description: /* TODO 7: '@slow' */ 'PLACEHOLDER',
    });
    await page.goto('/');
    await expect(page).toHaveTitle(/Lumio/);
    const slowTag = testInfo.annotations.find(a => a.description === '@slow');
    expect(slowTag?.type).toBe('tag');
  });

});
