import { test, expect } from '../fixtures/fixtures';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

// M41: WebServer Config & Test Environment
//
// Like M40, this module's exercises inspect configuration files rather than app behavior.
// The tests validate that playwright.config.ts and .env.test are correctly structured.

test.describe('M41 — WebServer Config', () => {

  test('playwright.config.ts has a webServer block with required options', async () => {
    const configPath = join(process.cwd(), 'playwright.config.ts');
    const configContent = readFileSync(configPath, 'utf-8');

    // TODO 1: Assert the config contains a 'webServer' key.
    // webServer is what allows Playwright to own the server lifecycle —
    // without it, learners must manually start Lumio before every test run.
    expect(configContent).toContain(/* TODO 1: 'webServer' */);

    // TODO 2: Assert the webServer block references the Lumio dev command.
    // The command should start Lumio's Next.js dev server.
    expect(configContent).toContain(/* TODO 2: 'lumio' */);

    // TODO 3: Assert reuseExistingServer is present.
    // The CI vs local distinction is what makes reuseExistingServer important to verify.
    expect(configContent).toContain(/* TODO 3: 'reuseExistingServer' */);
  });

  test('.env.test.example exists and documents required variables', async () => {
    const examplePath = join(process.cwd(), '.env.test.example');
    // TODO 4: Assert that .env.test.example exists.
    // The .example file is committed to the repo so new developers know what variables to set.
    expect(existsSync(/* TODO 4: examplePath */)).toBe(true);

    const exampleContent = readFileSync(examplePath, 'utf-8');

    // TODO 5: Assert the example file documents DATABASE_URL.
    // A test database URL is always required — tests must never run against production data.
    expect(exampleContent).toContain(/* TODO 5: 'DATABASE_URL' */);

    // TODO 6: Assert the example file documents BASE_URL.
    // BASE_URL allows the test suite to point at a different host (staging, prod-read-only).
    expect(exampleContent).toContain(/* TODO 6: 'BASE_URL' */);
  });

  test('baseURL is configurable via environment variable', async ({ page }) => {
    // Playwright's baseURL comes from playwright.config.ts, which reads process.env.BASE_URL.
    // This test verifies the pattern works: navigating to '/' uses baseURL automatically.

    // TODO 7: Navigate to '/' and assert the page title contains 'Lumio'.
    // If baseURL is set correctly in playwright.config.ts, this resolves to http://localhost:3000/
    await page.goto(/* TODO 7: '/' */);
    await expect(page).toHaveTitle(/* TODO 7: /Lumio/ */);
  });

  test('timeout is sufficient for Next.js cold start', async () => {
    // This test validates the webServer timeout configuration via config inspection.
    const configPath = join(process.cwd(), 'playwright.config.ts');
    const configContent = readFileSync(configPath, 'utf-8');

    // TODO 8: Assert the config contains a timeout value >= 60000 (60 seconds).
    // Next.js compilation takes 30-90 seconds on a cold start — 60s is the minimum.
    // Check for the string '120_000' or '120000' (both are valid).
    const hasTimeout = configContent.includes(/* TODO 8: '120_000' */) ||
                       configContent.includes(/* TODO 8: '120000' */);
    expect(hasTimeout).toBe(/* TODO 8: true */);
  });

});
