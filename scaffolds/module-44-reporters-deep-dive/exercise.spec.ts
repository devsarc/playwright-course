import { test, expect } from '../fixtures/fixtures';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

// M44: Reporters Deep Dive
//
// This module is a mix of configuration inspection and runtime exercises.
// Several TODOs involve reading playwright.config.ts to verify your changes.
// The final TODO is a live browser test to confirm the HTML report artifact is produced.

const configPath = path.resolve(__dirname, '../../playwright.config.ts');

test.describe('M44 — Reporters Deep Dive', () => {

  // Test 1: Verify the config uses an array of reporters
  // A production config uses multiple reporters simultaneously.
  // The reporter key accepts a single string name OR an array of [name, options] tuples.
  test('playwright.config.ts uses an array of reporters', async () => {
    const configContent = readFileSync(configPath, 'utf-8');

    // TODO 1: Assert that the config uses the list reporter.
    // Why? list is the standard terminal reporter — all configs should have it.
    expect(configContent).toContain(/* TODO 1: 'list' */);

    // TODO 2: Assert that the config uses the html reporter.
    // Why? html is the primary debugging artifact for failed test investigation.
    expect(configContent).toContain(/* TODO 2: 'html' */);
  });

  // Test 2: JUnit reporter produces machine-readable XML
  // CI systems (Jenkins, CircleCI, GitHub Actions) parse JUnit XML to display test results.
  test('config documents junit reporter for CI', async () => {
    const configContent = readFileSync(configPath, 'utf-8');

    // TODO 3: Assert that the config references 'junit'.
    // Why? JUnit is the universal format that CI systems parse natively — no plugins needed.
    expect(configContent).toContain(/* TODO 3: 'junit' */);
  });

  // Test 3: Blob reporter for sharded runs
  // Each shard writes a blob; merge-reports combines them into one HTML report.
  test('understands blob reporter purpose', async () => {
    // This test documents the blob reporter workflow through code comments.
    // No assertion needed — read the comments and run the commands in a terminal.

    // Step 1: Run with blob reporter (inside a shard):
    //   npx playwright test --shard=1/3 --reporter=blob
    //
    // Step 2: After all shards complete, merge:
    //   npx playwright merge-reports --reporter html ./blob-results
    //
    // TODO 4: Set blobExpected to true once you understand the workflow above.
    // Why? Understanding blob + merge is required for any sharded CI pipeline.
    const blobExpected = /* TODO 4: true */ false;
    expect(blobExpected).toBe(true);
  });

  // Test 4: GitHub annotations reporter
  // Outputs ::error:: log lines that GitHub Actions converts to inline PR comments.
  test('github reporter produces PR annotations', async () => {
    const configContent = readFileSync(configPath, 'utf-8');

    // TODO 5: Assert that the config references 'github' in the CI reporter array.
    // Why? The github reporter is a no-configuration option for PR comment integration.
    // It only works inside a GitHub Actions environment — add it behind process.env.CI.
    const hasGithubReporter = configContent.includes(/* TODO 5: 'github' */ '');
    expect(hasGithubReporter).toBe(true);
  });

  // Test 5: Reporter interface lifecycle events
  // Custom reporters implement: onBegin, onTestBegin, onTestEnd, onEnd.
  test('identifies Reporter interface lifecycle events', async () => {
    // The Reporter interface methods, in order:
    const lifecycleEvents = [
      /* TODO 6: 'onBegin' */    '',   // fires once: suite tree available
      /* TODO 7: 'onTestBegin' */ '',  // fires before each test
      /* TODO 8: 'onTestEnd' */   '',  // fires after each test: result available
      /* TODO 9: 'onEnd' */       '',  // fires once: full run complete
    ];

    // A custom reporter only needs to implement the events it cares about.
    // All events are optional — a reporter that only cares about failures
    // would implement onTestEnd and check result.status === 'failed'.
    expect(lifecycleEvents.every(e => typeof e === 'string')).toBe(true);
  });

  // Test 6: Live test — run with HTML reporter and verify output
  test('html reporter output folder exists after a run', async ({ page }) => {
    // The html reporter writes to playwright-report/ by default.
    // Run: npx playwright test tests/module-44-reporters-deep-dive --reporter=html
    // Then open: npx playwright show-report
    await page.goto('/dashboard');

    // TODO 10: Assert the page has the title containing 'Lumio'.
    // Why? This confirms a real browser run happened — the HTML report will capture it.
    await expect(page).toHaveTitle(/* TODO 10: /Lumio/ */);
  });

});
