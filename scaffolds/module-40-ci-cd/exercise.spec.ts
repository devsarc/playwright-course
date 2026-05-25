import { test, expect } from '../fixtures/fixtures';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

// M40: CI/CD Pipeline Setup
//
// Unlike most modules, M40's primary deliverable is a GitHub Actions workflow file,
// not a Playwright test spec. The tests here validate CONFIG, not app behavior.
// They verify that your playwright.config.ts and CI workflow are correctly set up.

test.describe('M40 — CI/CD Configuration', () => {

  test('playwright.config.ts has CI-appropriate settings', async () => {
    // Read the root playwright.config.ts and validate key CI settings
    const configPath = join(process.cwd(), 'playwright.config.ts');
    // TODO 1: Assert that playwright.config.ts exists using existsSync.
    // Why check this here? This module teaches config changes — verifying the file
    // exists confirms the test runner is pointed at the right repo root.
    expect(existsSync(/* TODO 1: configPath */)).toBe(true);

    const configContent = readFileSync(configPath, 'utf-8');

    // TODO 2: Assert that the config contains 'forbidOnly' to prevent test.only() from
    // accidentally being committed. The pattern: forbidOnly: !!process.env.CI
    // Why? A committed test.only() skips all other tests in CI, silently hiding failures.
    expect(configContent).toContain(/* TODO 2: 'forbidOnly' */);

    // TODO 3: Assert that the config contains 'retries' configuration.
    // CI environments have more timing variability than local dev — retries catch transient failures.
    expect(configContent).toContain(/* TODO 3: 'retries' */);
  });

  test('GitHub Actions workflow file exists and is valid', async () => {
    const workflowPath = join(process.cwd(), '.github', 'workflows', 'module-check.yml');
    // TODO 4: Assert the workflow file exists.
    expect(existsSync(/* TODO 4: workflowPath */)).toBe(true);

    const workflowContent = readFileSync(workflowPath, 'utf-8');

    // TODO 5: Assert the workflow uploads artifacts (uses actions/upload-artifact).
    // Why? Without artifact upload, failed CI runs produce no diagnosable output.
    expect(workflowContent).toContain(/* TODO 5: 'upload-artifact' */);

    // TODO 6: Assert the workflow installs Playwright browsers (npx playwright install).
    expect(workflowContent).toContain(/* TODO 6: 'playwright install' */);
  });

  test('reporters include github annotations for CI', async () => {
    const configPath = join(process.cwd(), 'playwright.config.ts');
    const configContent = readFileSync(configPath, 'utf-8');

    // TODO 7: Assert the config references the 'github' reporter somewhere.
    // The 'github' reporter posts inline PR annotations — it's the primary CI reporter.
    // It may be inside a ternary: process.env.CI ? [['github'], ['html']] : [['html']]
    expect(configContent).toContain(/* TODO 7: 'github' */);
  });

  test('environment-specific config separates local from CI', async () => {
    // This test documents the expected pattern — it does not run tests against the app.
    // In playwright.config.ts, CI-only settings should be gated on process.env.CI:
    //   workers: process.env.CI ? 1 : undefined
    //   retries: process.env.CI ? 2 : 0
    //   forbidOnly: !!process.env.CI

    const configPath = join(process.cwd(), 'playwright.config.ts');
    const configContent = readFileSync(configPath, 'utf-8');

    // TODO 8: Assert the config uses process.env.CI somewhere to branch behavior.
    // This confirms CI-specific settings are not applied locally (which would slow development).
    expect(configContent).toContain(/* TODO 8: 'process.env.CI' */);
  });

});
