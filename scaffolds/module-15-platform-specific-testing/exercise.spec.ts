// Lesson 15: Platform-Specific Testing: Extensions, Electron & Android
// Combines former modules: M71 (Browser Extension Testing), M72 (Electron App
// Testing), M73 (Android Device Automation — awareness module, no exercise).
//
// Each Part below is the original module's test.describe block, unchanged
// except TODO numbers are prefixed with the Part number to stay unique in
// this file (a TODO originally numbered N in the M72 module becomes TODO
// 2.N here, matching Part 2's prefix).
// Part 3 (M73) is an awareness module with no exercise.spec.ts, so there is
// no Part 3 test.describe block in this file — Part numbers 1 and 2 map
// directly to M71 and M72.

import { test, expect } from '../fixtures/fixtures';
import { chromium, test as base } from '@playwright/test';
import path from 'path';
import { _electron as electron, type ElectronApplication } from 'playwright';

const extensionPath = path.join(__dirname, '../../lumio/extension');

test.describe('Part 1 — Browser Extension Testing (formerly M71)', () => {
  let browserContext: Awaited<ReturnType<typeof chromium.launchPersistentContext>>;
  let extensionId: string;

  test.beforeAll(async () => {
    // launchPersistentContext loads the extension into a real browser profile.
    // '--disable-extensions-except' prevents other extensions from interfering.
    browserContext = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });

    // The extension ID is embedded in the service worker's URL.
    // Wait for the service worker to register if it hasn't already.
    let [serviceWorker] = browserContext.serviceWorkers();
    if (!serviceWorker) serviceWorker = await browserContext.waitForEvent('serviceworker');
    extensionId = serviceWorker.url().split('/')[2];
  });

  test.afterAll(async () => {
    await browserContext?.close();
  });

  // Test 1: Navigate to the extension popup page using its chrome-extension:// URL.
  test('extension popup page loads at the chrome-extension:// URL', async () => {
    const page = await browserContext.newPage();
    // TODO 1.1: Navigate to the popup using the extensionId.
    // Extension popup pages are served at: chrome-extension://{extensionId}/popup.html
    await page.goto(/* TODO 1.1: `chrome-extension://${extensionId}/popup.html` */ 'about:blank');

    await expect(page.getByRole('heading', { name: 'Quick Add Task' })).toBeVisible();
    await page.close();
  });

  // Test 2: Fill and submit the quick-add form in the extension popup.
  test('quick-add form submits a task and shows a success confirmation', async () => {
    const page = await browserContext.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    await page.getByLabel('Task title').fill('Extension-created task');
    // TODO 1.2: Click the submit button with the accessible name 'Add Task'.
    await page.getByRole('button', { name: /* TODO 1.2: 'Add Task' */ 'PLACEHOLDER' }).click();

    await expect(page.getByText('Task added!')).toBeVisible();
    await page.close();
  });

  // Test 3: Cross-context verification — task created in popup must appear in the Lumio app.
  test('task created in the popup appears in the Lumio dashboard', async () => {
    const popup = await browserContext.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.getByLabel('Task title').fill('Cross-context verification task');
    await popup.getByRole('button', { name: 'Add Task' }).click();
    await popup.close();

    const appPage = await browserContext.newPage();
    // TODO 1.3: Navigate to '/dashboard' to verify the task appears in the Lumio app.
    // Both pages share the same browser profile and Lumio session.
    await appPage.goto(/* TODO 1.3: '/dashboard' */ '/PLACEHOLDER');
    await expect(appPage.getByText('Cross-context verification task')).toBeVisible();
    await appPage.close();
  });

  // Test 4: Content script injects UI elements into pages matching the extension's host permissions.
  test('content script injects task highlight elements on Lumio pages', async () => {
    const page = await browserContext.newPage();
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // The content script runs on all pages matching lumio.io/* and injects highlight spans
    // around task reference patterns (e.g., "TASK-123" strings in page text).
    // TODO 1.4: Assert the element with data-testid="lumio-task-highlight" is attached to the DOM.
    // Use toBeAttached() — the element is injected into the body, not necessarily visible.
    await expect(page.locator('[data-testid="lumio-task-highlight"]'))./* TODO 1.4: toBeAttached() */ toBeHidden();
    await page.close();
  });

  // Test 5: Access chrome.storage.local via page.evaluate() from an extension page context.
  test('chrome.storage.local is accessible via page.evaluate() on the popup page', async () => {
    const page = await browserContext.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    // chrome.* APIs are only available in extension page contexts.
    // page.evaluate() runs in the page's JavaScript context, which on popup.html has chrome.* APIs.
    // TODO 1.5: Call chrome.storage.local.get('recentTasks') inside page.evaluate().
    const stored = await page.evaluate(/* TODO 1.5: () => chrome.storage.local.get('recentTasks') */ () => Promise.resolve(null));
    expect(stored).not.toBeNull();
    await page.close();
  });

  // Test 6: Background service worker is registered and active in the persistent context.
  test('background service worker is registered in the persistent context', async () => {
    const workers = browserContext.serviceWorkers();

    // TODO 1.6: Assert that at least 1 service worker is registered.
    // The default 999 always fails — a single extension registers exactly 1 service worker.
    expect(workers.length).toBeGreaterThanOrEqual(/* TODO 1.6: 1 */ 999);
  });

  // Test 7: Chrome extension IDs are 32 lowercase Latin letters assigned by the browser.
  test('extension ID matches the Chrome extension ID format', async () => {
    // Chrome assigns IDs deterministically based on the extension's public key.
    // In dev mode (no key), the ID is randomly generated but always follows the 32-char format.
    // TODO 1.7: Assert extensionId matches the regex /^[a-z]{32}$/.
    expect(extensionId).toMatch(/* TODO 1.7: /^[a-z]{32}$/ */ /PLACEHOLDER/);
  });

});

// ⚠️  Lumio does not ship a pre-built Electron binary.
// These tests require building the app first:
//   cd lumio && npx tsc electron/main.ts --outDir out && npx electron out/main.js
// Until then, all tests in this file will fail to launch the Electron process.
// The exercises are illustrative — study the API patterns, then build the app to run them.

test.describe('Part 2 — Electron App Testing (formerly M72)', () => {
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
      // TODO 2.1: Launch the Electron app using electron.launch().
      // Pass { args: [ELECTRON_APP] } to specify the app path.
      // electron.launch() returns an ElectronApplication — not a Browser.
      const app = await electron.launch(/* TODO 2.1: { args: [ELECTRON_APP] } */);
      await use(app);
      await app.close();
    },
  });

  test('app window opens and shows the login screen', async ({ electronApp }) => {
    // TODO 2.2: Get the first window from the Electron app.
    // electronApp.firstWindow() returns a Page — the same API as browser tests.
    const window = await electronApp.firstWindow(/* TODO 2.2 */);

    // TODO 2.3: Wait for the window to load, then assert the login heading is visible.
    await window.waitForLoadState('domcontentloaded');
    await expect(window.getByRole('heading', { name: /* TODO 2.3: 'Sign in' */ '' })).toBeVisible();
  });

  test('window title matches the app name', async ({ electronApp }) => {
    const window = await electronApp.firstWindow();

    // TODO 2.4: Assert the page title contains 'Lumio'.
    // window.title() works the same as page.title() in browser tests.
    await expect(window).toHaveTitle(/* TODO 2.4: /Lumio/ */);
  });

  test('evaluate runs in the main process', async ({ electronApp }) => {
    // TODO 2.5: Use electronApp.evaluate() to run code in Electron's main process.
    // This is unique to Electron — you can access Node.js APIs like process.platform.
    // Assert the platform is one of 'darwin', 'win32', or 'linux'.
    const platform = await electronApp.evaluate(async ({ app }) => {
      /* TODO 2.5: return process.platform */
    });
    expect(['darwin', 'win32', 'linux']).toContain(/* TODO 2.5: platform */);
  });

  test('take a screenshot of the Electron window', async ({ electronApp }) => {
    const window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');

    // TODO 2.6: Take a screenshot of the Electron window.
    // window.screenshot() works identically to page.screenshot() in web tests.
    const screenshot = await window.screenshot(/* TODO 2.6: { path: 'electron-window.png' } */);
    expect(screenshot).toBeTruthy();
  });
});
