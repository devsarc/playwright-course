// ⚠️  Lumio does not ship a pre-built Electron binary.
// These tests require building the app first:
//   cd lumio && npx tsc electron/main.ts --outDir out && npx electron out/main.js
// Until then, all tests in this file will fail to launch the Electron process.
// The exercises are illustrative — study the API patterns, then build the app to run them.

import { test as base, expect } from '@playwright/test';
import { _electron as electron, type ElectronApplication } from 'playwright';
import path from 'path';

// M72: Electron App Testing
//
// Playwright includes first-class Electron support via the `electron` launch API.
// electron.launch() starts the Electron process and returns an ElectronApplication.
// From there, you get Windows (equivalent to BrowserContext pages) to interact with.
//
// Key difference from web tests: there is no HTTP server — Electron loads a local
// file:// bundle or uses a bundled web server embedded in the app.

const ELECTRON_APP = process.env.ELECTRON_APP_PATH ?? path.join(__dirname, '../../lumio-electron/out/lumio-electron');

// Custom fixture that launches and tears down the Electron app per test
const test = base.extend<{ electronApp: ElectronApplication }>({
  electronApp: async ({}, use) => {
    // TODO 1: Launch the Electron app using electron.launch().
    // Pass { args: [ELECTRON_APP] } to specify the app path.
    // electron.launch() returns an ElectronApplication — not a Browser.
    const app = await electron.launch(/* TODO 1: { args: [ELECTRON_APP] } */);
    await use(app);
    await app.close();
  },
});

test('app window opens and shows the login screen', async ({ electronApp }) => {
  // TODO 2: Get the first window from the Electron app.
  // electronApp.firstWindow() returns a Page — the same API as browser tests.
  const window = await electronApp.firstWindow(/* TODO 2 */);

  // TODO 3: Wait for the window to load, then assert the login heading is visible.
  await window.waitForLoadState('domcontentloaded');
  await expect(window.getByRole('heading', { name: /* TODO 3: 'Sign in' */ '' })).toBeVisible();
});

test('window title matches the app name', async ({ electronApp }) => {
  const window = await electronApp.firstWindow();

  // TODO 4: Assert the page title contains 'Lumio'.
  // window.title() works the same as page.title() in browser tests.
  await expect(window).toHaveTitle(/* TODO 4: /Lumio/ */);
});

test('evaluate runs in the main process', async ({ electronApp }) => {
  // TODO 5: Use electronApp.evaluate() to run code in Electron's main process.
  // This is unique to Electron — you can access Node.js APIs like process.platform.
  // Assert the platform is one of 'darwin', 'win32', or 'linux'.
  const platform = await electronApp.evaluate(async ({ app }) => {
    /* TODO 5: return process.platform */
  });
  expect(['darwin', 'win32', 'linux']).toContain(/* TODO 5: platform */);
});

test('take a screenshot of the Electron window', async ({ electronApp }) => {
  const window = await electronApp.firstWindow();
  await window.waitForLoadState('domcontentloaded');

  // TODO 6: Take a screenshot of the Electron window.
  // window.screenshot() works identically to page.screenshot() in web tests.
  const screenshot = await window.screenshot(/* TODO 6: { path: 'electron-window.png' } */);
  expect(screenshot).toBeTruthy();
});
