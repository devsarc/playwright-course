// Lesson 08: Scale & CI/CD
// Combines former modules: M38 (Parallel Execution & Test Isolation), M39
// (Sharding for Large Suites), M40 (CI/CD Pipeline Setup), M41 (WebServer
// Config & Test Environment).
//
// Each Part below is the original module's test.describe block, unchanged
// except TODO numbers are prefixed with the Part number to stay unique in
// this file (a TODO originally numbered N in the M40 module becomes TODO
// 3.N here, matching Part 3's prefix).

import { test, expect } from '../fixtures/fixtures';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

test.describe('Part 1 — Parallel Execution & Test Isolation (formerly M38)', () => {
  // M38: Parallel Execution & Test Isolation
  //
  // These tests are explicitly designed to run in parallel safely.
  // Each test creates its own unique workspace to avoid shared-state conflicts.
  // Run with: npx playwright test tests/module-08-scale-and-cicd --workers 4

  // TODO 1.1: Add test.describe.configure({ mode: 'parallel' }) here to enable
  // intra-file parallelism for this describe block.
  // Why? By default, tests within a file run sequentially even with fullyParallel: true.
  // describe.configure({ mode: 'parallel' }) opts this specific describe block into
  // full parallel execution within the file.

  /* TODO 1.1: test.describe.configure({ mode: 'parallel' }); */

  // Helper: generate a unique workspace name to avoid conflicts between parallel tests
  function uniqueWorkspace(label: string): string {
    // TODO 1.2: Return a string that combines the label with Date.now() to guarantee uniqueness.
    // Why? If two parallel tests both try to create a workspace named 'test-workspace',
    // the second one will get a slug-uniqueness error. Unique names prevent this race condition.
    return /* TODO 1.2: `${label}-${Date.now()}` */;
  }

  test('parallel test A — creates and reads its own workspace', async ({ page }) => {
    const workspaceName = uniqueWorkspace('parallel-a');
    await page.goto('/onboarding/workspace');

    await page.getByTestId('workspace-name-input').fill(workspaceName);
    await page.getByTestId('workspace-submit-button').click();
    await expect(page).toHaveURL('/onboarding/invite');

    // Navigate to dashboard and assert the workspace name is shown
    await page.goto('/dashboard');
    // TODO 1.3: Assert the workspace name appears somewhere on the dashboard.
    await expect(page.getByText(/* TODO 1.3: workspaceName */)).toBeVisible();
  });

  test('parallel test B — creates and reads its own workspace', async ({ page }) => {
    const workspaceName = uniqueWorkspace('parallel-b');
    await page.goto('/onboarding/workspace');

    await page.getByTestId('workspace-name-input').fill(workspaceName);
    await page.getByTestId('workspace-submit-button').click();
    await expect(page).toHaveURL('/onboarding/invite');

    await page.goto('/dashboard');
    // TODO 1.4: Assert the workspace name appears on the dashboard (same pattern as test A).
    await expect(page.getByText(/* TODO 1.4: workspaceName */)).toBeVisible();
  });

  // This test intentionally demonstrates what happens when tests share state:
  // a shared counter that gets corrupted when two tests increment it simultaneously.
  // Read the code, complete the TODOs, and observe the race condition.
  test('demonstrates why shared mutable state breaks in parallel', async ({ page }) => {
    // Intentionally BAD pattern — shared state in test code
    // In a real parallel suite this would fail intermittently:
    // let sharedCounter = 0;
    // test A: sharedCounter++ (reads 0, writes 1)
    // test B: sharedCounter++ (also reads 0, writes 1 — lost update)

    // The CORRECT pattern: each test owns its own isolated state.
    // TODO 1.5: Declare a LOCAL counter variable (not shared) and assert it increments correctly.
    let localCounter = /* TODO 1.5: 0 */ 0;
    localCounter += 1;
    expect(localCounter).toBe(/* TODO 1.5: 1 */);

    // Navigate to dashboard to make this a real browser test
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/* TODO 1.6: '/dashboard' */);
  });

  // Demonstrates worker-scoped fixture concept (conceptual — actual implementation in Lesson 10 (formerly M48))
  test('expensive setup should use worker-scoped fixtures, not per-test setup', async ({ page }) => {
    // TODO 1.7: Navigate to /dashboard and assert the page has loaded by checking for a heading.
    // The comment here is the lesson: if this test needed a database seed, running that seed
    // once per WORKER (not once per test) via a worker-scoped fixture would be ~4x faster
    // with 4 workers than running it once per test.
    await page.goto(/* TODO 1.7: '/dashboard' */);
    await expect(page.getByRole(/* TODO 1.7: 'main' */)).toBeVisible();
  });

});

test.describe('Part 2 — Sharding for Large Suites (formerly M39)', () => {
  // M39: Sharding for Large Suites
  //
  // This module is primarily configuration-focused. The spec below verifies
  // that the CI-relevant Playwright features work: sharding, retries, and
  // artifact collection. Understanding these features makes the .yml file
  // in Step 5 meaningful rather than boilerplate.

  test.describe('CI smoke — board critical path', () => {
    // These tests represent the "must-pass" subset run in every CI pipeline.
    // They are tagged with @smoke so they can be selected with --grep @smoke.
    // In CI: npx playwright test --grep @smoke --workers=4

    test('landing page loads @smoke', async ({ page }) => {
      // TODO 2.1: Navigate to / and assert the main heading is visible.
      // This is the simplest possible smoke test — if it fails, the server is down.
      await page.goto('/');
      await expect(page.getByRole('heading', { level: 1 }))/* TODO 2.1: toBeVisible() */;
    });

    test('authenticated user reaches the board @smoke', async ({ page }) => {
      // TODO 2.2: Navigate to /projects/demo/board and assert all three kanban
      // columns are visible. This verifies auth, DB connection, and board rendering.
      await page.goto('/projects/demo/board');
      await expect(page.getByTestId('kanban-column-todo')).toBeVisible();
      await expect(page.getByTestId('kanban-column-in-progress'))/* TODO 2.2: toBeVisible() */;
      await expect(page.getByTestId('kanban-column-done'))/* TODO 2.2: toBeVisible() */;
    });
  });

  test.describe('Retry behaviour', () => {
    test('flaky test succeeds on retry', async ({ page }, testInfo) => {
      // TODO 2.3: Use testInfo.retry to assert this test passes on the second attempt.
      // testInfo.retry is 0 on the first run, 1 on the first retry, etc.
      // This test deliberately fails on attempt 0 to demonstrate the retry mechanism.
      // In playwright.config.ts set retries: 2 for CI.
      if (testInfo.retry === 0) {
        // First attempt: force a failure to demonstrate retry
        expect(testInfo.retry).toBe(/* TODO 2.3: 1 */ 99); // always fails on retry 0
      }
      // On retry 1+: passes normally
      await page.goto('/');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
  });

  test.describe('Sharding awareness', () => {
    test('shard index is available via env @smoke', async ({}) => {
      // TODO 2.4: Read process.env.CI and assert it is defined when running in CI.
      // When running locally this test is skipped via test.skip.
      // In CI, PLAYWRIGHT_SHARD_INDEX is set by the --shard flag.
      test.skip(!process.env.CI, 'shard env vars only exist in CI');
      expect(process.env.CI).toBeDefined();
    });
  });
});

test.describe('Part 3 — CI/CD Pipeline Setup (formerly M40)', () => {
  // M40: CI/CD Pipeline Setup
  //
  // Unlike most modules, M40's primary deliverable is a GitHub Actions workflow file,
  // not a Playwright test spec. The tests here validate CONFIG, not app behavior.
  // They verify that your playwright.config.ts and CI workflow are correctly set up.

  test('playwright.config.ts has CI-appropriate settings', async () => {
    // Read the root playwright.config.ts and validate key CI settings
    const configPath = join(process.cwd(), 'playwright.config.ts');
    // TODO 3.1: Assert that playwright.config.ts exists using existsSync.
    // Why check this here? This module teaches config changes — verifying the file
    // exists confirms the test runner is pointed at the right repo root.
    expect(existsSync(/* TODO 3.1: configPath */)).toBe(true);

    const configContent = readFileSync(configPath, 'utf-8');

    // TODO 3.2: Assert that the config contains 'forbidOnly' to prevent test.only() from
    // accidentally being committed. The pattern: forbidOnly: !!process.env.CI
    // Why? A committed test.only() skips all other tests in CI, silently hiding failures.
    expect(configContent).toContain(/* TODO 3.2: 'forbidOnly' */);

    // TODO 3.3: Assert that the config contains 'retries' configuration.
    // CI environments have more timing variability than local dev — retries catch transient failures.
    expect(configContent).toContain(/* TODO 3.3: 'retries' */);
  });

  test('GitHub Actions workflow file exists and is valid', async () => {
    const workflowPath = join(process.cwd(), '.github', 'workflows', 'module-check.yml');
    // TODO 3.4: Assert the workflow file exists.
    expect(existsSync(/* TODO 3.4: workflowPath */)).toBe(true);

    const workflowContent = readFileSync(workflowPath, 'utf-8');

    // TODO 3.5: Assert the workflow uploads artifacts (uses actions/upload-artifact).
    // Why? Without artifact upload, failed CI runs produce no diagnosable output.
    expect(workflowContent).toContain(/* TODO 3.5: 'upload-artifact' */);

    // TODO 3.6: Assert the workflow installs Playwright browsers (npx playwright install).
    expect(workflowContent).toContain(/* TODO 3.6: 'playwright install' */);
  });

  test('reporters include github annotations for CI', async () => {
    const configPath = join(process.cwd(), 'playwright.config.ts');
    const configContent = readFileSync(configPath, 'utf-8');

    // TODO 3.7: Assert the config references the 'github' reporter somewhere.
    // The 'github' reporter posts inline PR annotations — it's the primary CI reporter.
    // It may be inside a ternary: process.env.CI ? [['github'], ['html']] : [['html']]
    expect(configContent).toContain(/* TODO 3.7: 'github' */);
  });

  test('environment-specific config separates local from CI', async () => {
    // This test documents the expected pattern — it does not run tests against the app.
    // In playwright.config.ts, CI-only settings should be gated on process.env.CI:
    //   workers: process.env.CI ? 1 : undefined
    //   retries: process.env.CI ? 2 : 0
    //   forbidOnly: !!process.env.CI

    const configPath = join(process.cwd(), 'playwright.config.ts');
    const configContent = readFileSync(configPath, 'utf-8');

    // TODO 3.8: Assert the config uses process.env.CI somewhere to branch behavior.
    // This confirms CI-specific settings are not applied locally (which would slow development).
    expect(configContent).toContain(/* TODO 3.8: 'process.env.CI' */);
  });

});

test.describe('Part 4 — WebServer Config & Test Environment (formerly M41)', () => {
  // M41: WebServer Config & Test Environment
  //
  // Like Part 3 of this lesson (formerly M40), this module's exercises inspect
  // configuration files rather than app behavior. The tests validate that
  // playwright.config.ts and .env.test are correctly structured.

  test('playwright.config.ts has a webServer block with required options', async () => {
    const configPath = join(process.cwd(), 'playwright.config.ts');
    const configContent = readFileSync(configPath, 'utf-8');

    // TODO 4.1: Assert the config contains a 'webServer' key.
    // webServer is what allows Playwright to own the server lifecycle —
    // without it, learners must manually start Lumio before every test run.
    expect(configContent).toContain(/* TODO 4.1: 'webServer' */);

    // TODO 4.2: Assert the webServer block references the Lumio dev command.
    // The command should start Lumio's Next.js dev server.
    expect(configContent).toContain(/* TODO 4.2: 'lumio' */);

    // TODO 4.3: Assert reuseExistingServer is present.
    // The CI vs local distinction is what makes reuseExistingServer important to verify.
    expect(configContent).toContain(/* TODO 4.3: 'reuseExistingServer' */);
  });

  test('.env.test.example exists and documents required variables', async () => {
    const examplePath = join(process.cwd(), '.env.test.example');
    // TODO 4.4: Assert that .env.test.example exists.
    // The .example file is committed to the repo so new developers know what variables to set.
    expect(existsSync(/* TODO 4.4: examplePath */)).toBe(true);

    const exampleContent = readFileSync(examplePath, 'utf-8');

    // TODO 4.5: Assert the example file documents DATABASE_URL.
    // A test database URL is always required — tests must never run against production data.
    expect(exampleContent).toContain(/* TODO 4.5: 'DATABASE_URL' */);

    // TODO 4.6: Assert the example file documents BASE_URL.
    // BASE_URL allows the test suite to point at a different host (staging, prod-read-only).
    expect(exampleContent).toContain(/* TODO 4.6: 'BASE_URL' */);
  });

  test('baseURL is configurable via environment variable', async ({ page }) => {
    // Playwright's baseURL comes from playwright.config.ts, which reads process.env.BASE_URL.
    // This test verifies the pattern works: navigating to '/' uses baseURL automatically.

    // TODO 4.7: Navigate to '/' and assert the page title contains 'Lumio'.
    // If baseURL is set correctly in playwright.config.ts, this resolves to http://localhost:3000/
    await page.goto(/* TODO 4.7: '/' */);
    await expect(page).toHaveTitle(/* TODO 4.7: /Lumio/ */);
  });

  test('timeout is sufficient for Next.js cold start', async () => {
    // This test validates the webServer timeout configuration via config inspection.
    const configPath = join(process.cwd(), 'playwright.config.ts');
    const configContent = readFileSync(configPath, 'utf-8');

    // TODO 4.8: Assert the config contains a timeout value >= 60000 (60 seconds).
    // Next.js compilation takes 30-90 seconds on a cold start — 60s is the minimum.
    // Check for the string '120_000' or '120000' (both are valid).
    const hasTimeout = configContent.includes(/* TODO 4.8: '120_000' */) ||
                       configContent.includes(/* TODO 4.8: '120000' */);
    expect(hasTimeout).toBe(/* TODO 4.8: true */);
  });

});
