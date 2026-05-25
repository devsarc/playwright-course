import { test, expect } from '../fixtures/fixtures';
import { chromium } from '@playwright/test';
import path from 'path';

// M71: Browser Extension Testing
// Extensions require a persistent context with special Chrome flags.
// The standard 'page' fixture cannot be used — all tests share the context set up in beforeAll.

const extensionPath = path.join(__dirname, '../../lumio/extension');

test.describe('M71 — Browser Extension Testing', () => {
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
    // TODO 1: Navigate to the popup using the extensionId.
    // Extension popup pages are served at: chrome-extension://{extensionId}/popup.html
    await page.goto(/* TODO 1: `chrome-extension://${extensionId}/popup.html` */ 'about:blank');

    await expect(page.getByRole('heading', { name: 'Quick Add Task' })).toBeVisible();
    await page.close();
  });

  // Test 2: Fill and submit the quick-add form in the extension popup.
  test('quick-add form submits a task and shows a success confirmation', async () => {
    const page = await browserContext.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    await page.getByLabel('Task title').fill('Extension-created task');
    // TODO 2: Click the submit button with the accessible name 'Add Task'.
    await page.getByRole('button', { name: /* TODO 2: 'Add Task' */ 'PLACEHOLDER' }).click();

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
    // TODO 3: Navigate to '/dashboard' to verify the task appears in the Lumio app.
    // Both pages share the same browser profile and Lumio session.
    await appPage.goto(/* TODO 3: '/dashboard' */ '/PLACEHOLDER');
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
    // TODO 4: Assert the element with data-testid="lumio-task-highlight" is attached to the DOM.
    // Use toBeAttached() — the element is injected into the body, not necessarily visible.
    await expect(page.locator('[data-testid="lumio-task-highlight"]'))./* TODO 4: toBeAttached() */ toBeHidden();
    await page.close();
  });

  // Test 5: Access chrome.storage.local via page.evaluate() from an extension page context.
  test('chrome.storage.local is accessible via page.evaluate() on the popup page', async () => {
    const page = await browserContext.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    // chrome.* APIs are only available in extension page contexts.
    // page.evaluate() runs in the page's JavaScript context, which on popup.html has chrome.* APIs.
    // TODO 5: Call chrome.storage.local.get('recentTasks') inside page.evaluate().
    const stored = await page.evaluate(/* TODO 5: () => chrome.storage.local.get('recentTasks') */ () => Promise.resolve(null));
    expect(stored).not.toBeNull();
    await page.close();
  });

  // Test 6: Background service worker is registered and active in the persistent context.
  test('background service worker is registered in the persistent context', async () => {
    const workers = browserContext.serviceWorkers();

    // TODO 6: Assert that at least 1 service worker is registered.
    // The default 999 always fails — a single extension registers exactly 1 service worker.
    expect(workers.length).toBeGreaterThanOrEqual(/* TODO 6: 1 */ 999);
  });

  // Test 7: Chrome extension IDs are 32 lowercase Latin letters assigned by the browser.
  test('extension ID matches the Chrome extension ID format', async () => {
    // Chrome assigns IDs deterministically based on the extension's public key.
    // In dev mode (no key), the ID is randomly generated but always follows the 32-char format.
    // TODO 7: Assert extensionId matches the regex /^[a-z]{32}$/.
    expect(extensionId).toMatch(/* TODO 7: /^[a-z]{32}$/ */ /PLACEHOLDER/);
  });

});
