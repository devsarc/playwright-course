import { test, expect } from '../fixtures/fixtures';

// M85: Test Maintenance & Long-term Strategy
// Each test demonstrates one maintenance pattern — how to recognize a smell and apply the fix.

test.describe('M85 — Test Maintenance & Long-term Strategy', () => {

  // Test 1: Role locator outperforms CSS class and placeholder-based selectors.
  // Smell: page.getByPlaceholder('Enter your email') — breaks on copy edits.
  // Fix: getByLabel — tied to the semantic <label>, rarely changes.
  test('selector resilience: getByLabel survives placeholder text changes', async ({ page }) => {
    await page.goto('/login');
    // Brittle antipattern: page.getByPlaceholder('Enter your email') — copy editors break this.
    // Resilient: getByLabel is backed by the <label> element, which tracks form field intent.
    // TODO 1: Replace 'PLACEHOLDER' with 'Email' to use the label-based locator.
    const emailInput = page.getByLabel(/* TODO 1: 'Email' */ 'PLACEHOLDER');
    await expect(emailInput).toBeVisible();
  });

  // Test 2: Named role locator outlasts positional nth() when button order changes.
  // Smell: page.getByRole('button').nth(0) — DOM order changes when new buttons are added.
  // Fix: getByRole with accessible name — stable regardless of DOM position.
  test('selector resilience: named button role survives DOM reordering', async ({ page }) => {
    await page.goto('/login');
    // Brittle: page.getByRole('button').nth(0) — shifts when a nav button is added above.
    // Resilient: accessible name scopes the match to exactly one element.
    // TODO 2: Replace 'PLACEHOLDER' with 'Sign in' to use an accessible-name locator.
    const signInBtn = page.getByRole('button', { name: /* TODO 2: 'Sign in' */ 'PLACEHOLDER' });
    await expect(signInBtn).toBeEnabled();
  });

  // Test 3: Scoped locator prevents strict mode violations.
  // Smell: page.getByRole('link', { name: 'Features' }) — might match navbar AND footer.
  // Fix: scope the locator to its parent container.
  test('selector resilience: scoped locator avoids strict mode violation', async ({ page }) => {
    await page.goto('/');
    // Unscoped: page.getByRole('link', { name: 'Features' }) — strict mode fails if it matches twice.
    // Scoped: nav.getByRole('link', ...) — limited to the navigation context.
    const nav = page.getByRole('navigation');
    // TODO 3: Replace 'PLACEHOLDER' with 'Features' to find the nav link by accessible name.
    const featuresLink = nav.getByRole('link', { name: /* TODO 3: 'Features' */ 'PLACEHOLDER' });
    await expect(featuresLink).toBeVisible();
  });

  // Test 4: Annotate tests with issue tracker links for traceability.
  // Without annotations, a test failure in CI requires digging into history to understand why the test exists.
  // With annotations, the HTML report links directly to the bug report it was written for.
  test('documentation: annotate test with issue link for traceability', async ({ page }, testInfo) => {
    // TODO 4: Replace 'PLACEHOLDER' with 'issue' — the annotation type used to link a test to a bug report.
    testInfo.annotations.push({
      type: /* TODO 4: 'issue' */ 'PLACEHOLDER',
      description: 'https://linear.app/lumio/issue/LUM-234',
    });
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    // Verify the annotation was attached with the correct type.
    const issueAnnotation = testInfo.annotations.find(a => a.type === 'issue');
    expect(issueAnnotation).not.toBeUndefined();
  });

  // Test 5: Tag tests to track coverage tiers.
  // Smoke tests run on every push — tagging them identifies which tests belong to which CI tier.
  test('documentation: tag test with smoke coverage tier annotation', async ({ page }, testInfo) => {
    // TODO 5: Replace 'PLACEHOLDER' with 'tag' — the annotation type for coverage tier markers.
    testInfo.annotations.push({
      type: /* TODO 5: 'tag' */ 'PLACEHOLDER',
      description: '@smoke',
    });
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    // Verify the smoke tag annotation is present and has the correct type.
    const smokeAnnotation = testInfo.annotations.find(a => a.description === '@smoke');
    expect(smokeAnnotation?.type).toBe('tag');
  });

  // Test 6: Overcoupling smell — assert visible state, not CSS implementation.
  // Smell: expect(await page.locator('.sidebar-nav--active').count()).toBe(1)
  //        — breaks on any CSS rename; doesn't test user-visible behavior.
  // Fix: assert what the user sees (the nav is visible) rather than the CSS class that implements it.
  test('decoupling: assert visible state, not CSS class name', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);
    // Overcoupled: locator('.sidebar-nav--active') — any CSS rename breaks this.
    // Decoupled: assert the navigation role is visible — it tests what the user sees.
    // TODO 6: Replace 'PLACEHOLDER' with 'navigation' to assert the sidebar is visible by role.
    const sidebar = page.getByRole(/* TODO 6: 'navigation' */ 'PLACEHOLDER' as Parameters<typeof page.getByRole>[0]);
    await expect(sidebar).toBeVisible();
  });

  // Test 7: expect.soft() surfaces all failures in one run — useful for suite-wide audits.
  // A maintenance audit should reveal ALL broken assertions, not just the first one.
  // expect.soft() continues execution after failure and collects errors in testInfo.errors.
  test('maintenance: expect.soft collects all assertion failures for holistic diagnosis', async ({ page }, testInfo) => {
    await page.goto('/login');
    // TODO 7: Replace /PLACEHOLDER/ with /Lumio/ to assert the page title matches the brand name.
    await expect.soft(page).toHaveTitle(/* TODO 7: /Lumio/ */ /PLACEHOLDER/);
    // This heading assertion always runs even if the title check above failed.
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    // With /PLACEHOLDER/ as the title pattern, the soft assertion fails but testInfo.errors captures it.
  });

});
