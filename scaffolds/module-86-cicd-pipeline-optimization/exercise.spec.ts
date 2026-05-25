import { test, expect } from '../fixtures/fixtures';

// M86: CI/CD Pipeline Optimization
// Each test exercises a configuration or runtime pattern that reduces CI time or improves reliability.

test.describe('M86 — CI/CD Pipeline Optimization', () => {

  // Test 1: Per-test timeout override for slow CI environments.
  // CI runners are 2-4x slower than localhost — per-test timeout prevents spurious failures.
  // testInfo.setTimeout() overrides the config timeout for the current test only.
  test('timeout: per-test timeout accommodates slow CI without raising global config', async ({ page }, testInfo) => {
    // TODO 1: Add the CI latency buffer (30000ms) to the current timeout using testInfo.setTimeout().
    // testInfo.timeout is the current config timeout; adding 30000 gives CI runners extra headroom.
    testInfo.setTimeout(/* TODO 1: testInfo.timeout + 30_000 */ 0);
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  // Test 2: testInfo.retry — behave differently on CI retry attempts.
  // A test that attaches diagnostics on retry surfaces more context for CI post-mortem analysis.
  test('retries: attach diagnostic screenshot on retry attempt', async ({ page }, testInfo) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);

    if (testInfo.retry > 0) {
      await testInfo.attach('ci-retry-screenshot', {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
    }

    // testInfo.retry is 0 on first attempt, 1 on first retry, etc.
    // CI config sets retries: 2. A test that needed retry index 2+ is unacceptably flaky.
    // TODO 2: Assert testInfo.retry is less than 2 — the test should not need more than 1 retry.
    expect(testInfo.retry).toBeLessThan(/* TODO 2: 2 */ 0);
  });

  // Test 3: testInfo.workerIndex — detect resource conflicts between parallel workers.
  // Each worker gets a unique index (0, 1, 2...). Tests can use it to segment test data.
  test('parallelism: workerIndex enables unique per-worker test data', async ({ page }, testInfo) => {
    // In parallel CI runs, workerIndex distinguishes which worker is running this test.
    // Using it in test data (e.g., `worker${testInfo.workerIndex}@lumio.test`) prevents conflicts.
    await page.goto('/login');
    // workerIndex is always a non-negative integer — workers are numbered from 0.
    // TODO 3: Assert testInfo.workerIndex is greater than or equal to 0.
    expect(testInfo.workerIndex).toBeGreaterThanOrEqual(/* TODO 3: 0 */ 999);
  });

  // Test 4: testInfo.project — behave differently per browser project.
  // CI matrix runs tests across Chromium, Firefox, and WebKit in parallel projects.
  test('parallelism: project name identifies which browser the test is running in', async ({ page }, testInfo) => {
    await page.goto('/login');
    // testInfo.project.name matches the project name from playwright.config.ts (e.g., 'chromium').
    // Useful for skipping known browser-specific bugs or for conditional assertions.
    // TODO 4: Assert the project name matches the regex /chromium|firefox|webkit/i.
    expect(testInfo.project.name).toMatch(/* TODO 4: /chromium|firefox|webkit/i */ /PLACEHOLDER/);
  });

  // Test 5: testInfo.outputDir — store CI artifacts per test for artifact upload.
  // GitHub Actions uploads the entire test-results/ folder — outputDir is where this test's files land.
  test('artifacts: outputDir is defined and points to the test-results directory', async ({ page }, testInfo) => {
    await page.goto('/login');
    // testInfo.outputDir is the per-test output path — traces, screenshots, and attachments go here.
    // It is always a non-empty string pointing inside the test-results/ directory.
    // TODO 5: Assert testInfo.outputDir is not an empty string (truthy).
    expect(testInfo.outputDir).toBeTruthy();
    // TODO 5b: Assert it contains 'test-results' to confirm artifacts land in the right directory.
    expect(testInfo.outputDir).toContain(/* TODO 5b: 'test-results' */ 'PLACEHOLDER');
  });

  // Test 6: Selective run with grep — smoke-tagged tests run in under 60 seconds.
  // Tests annotated with @smoke are included in the per-push CI check; others run nightly.
  test('grep: smoke annotation marks this test for per-push CI inclusion @smoke', async ({ page }, testInfo) => {
    // '@smoke' in the test title makes this matchable by --grep "@smoke".
    // Additionally, attach a tag annotation for the HTML report and JSON reporter consumers.
    // TODO 6: Push an annotation with type 'tag' and description '@smoke'.
    testInfo.annotations.push({
      type: /* TODO 6: 'tag' */ 'PLACEHOLDER',
      description: '@smoke',
    });
    await page.goto('/');
    await expect(page).toHaveTitle(/Lumio/);
    const smokeTag = testInfo.annotations.find(a => a.description === '@smoke');
    expect(smokeTag?.type).toBe('tag');
  });

  // Test 7: testInfo.duration — validate that the test ran within the performance budget.
  // CI pipelines have per-step time budgets. A test that takes > 30s is a CI bottleneck.
  test('performance: test duration is measurable via testInfo after completion', async ({ page }, testInfo) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    // testInfo.duration is set AFTER the test body completes — check it in afterEach, not here.
    // During the test body, duration reflects time elapsed so far (always >= 0).
    // TODO 7: Assert testInfo.duration is greater than or equal to 0 (it's always non-negative mid-test).
    expect(testInfo.duration).toBeGreaterThanOrEqual(/* TODO 7: 0 */ 999999);
  });

});
