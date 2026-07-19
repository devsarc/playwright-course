import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';

const pwTestMatch = process.env.PW_TEST_MATCH;

dotenv.config({ path: path.resolve(__dirname, '.env.test') });

export default defineConfig({
  testDir: './tests',

  // CT modules require their own config (playwright-ct.config.ts / playwright-ct-vue.config.ts).
  // Exclude them here so the regular runner doesn't try to load their CT-specific imports.
  testIgnore: [
    '**/module-11-*/**',
  ],

  ...(pwTestMatch && pwTestMatch.length > 0
    ? { testMatch: pwTestMatch.split(',') }
    : {}),

  // Run test files in parallel; tests within a file run sequentially by default
  fullyParallel: true,

  // Fail fast in CI if test.only() is accidentally committed
  forbidOnly: !!process.env.CI,

  // Retry failed tests twice in CI; no retries locally
  retries: process.env.CI ? 2 : 0,

  // Limit parallelism in CI to avoid resource contention on shared runners
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  use: {
    // All tests hit Lumio's dev server by default; override per-module as needed
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',

    // Capture trace on first retry so failures in CI are diagnosable
    trace: 'on-first-retry',

    // Screenshot on failure for quick visual diagnosis
    screenshot: 'only-on-failure',

    // Video retained when a test fails
    video: 'retain-on-failure',
  },

  projects: [
    // Default: Chromium only. Lesson 01 (test-runner-organization, which
    // includes the former M07 multi-project config exercise) and Lesson 07
    // (cross-browser-and-mobile) expand this to Firefox + WebKit.
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    // Starts Lumio's Next.js dev server before tests run.
    // Lesson 08 (scale-and-cicd, Part 4, formerly M41) teaches all the
    // options available here.
    command: 'npm run dev --prefix lumio',
    url: 'http://localhost:3000',
    // Reuse an already-running server locally; always start fresh in CI
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
