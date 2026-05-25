import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// TODO 1: Add a 'firefox' project to this config.
// Copy the chromium project and change 'name' to 'firefox' and
// 'use' to { ...devices['Desktop Firefox'] }.

// TODO 2: Add a 'webkit' project for Safari.

// TODO 3: Add a 'mobile-chrome' project using devices['Pixel 5'].

export default defineConfig({
  testDir: '.',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // TODO 1: Add firefox project here
    // TODO 2: Add webkit project here
    // TODO 3: Add mobile-chrome project here
  ],
  webServer: {
    command: 'npm run dev --prefix ../../lumio',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
