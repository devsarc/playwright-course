import { test, expect } from '../fixtures/fixtures';

// M83: Playwright vs Puppeteer & Others
// This module compares Playwright to Puppeteer and other tools through practical exercises.
// Each test demonstrates a Playwright pattern and notes the equivalent (or lack thereof) in other tools.

test.describe('M83 — Playwright vs Puppeteer & Others', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  // Test 1: Auto-waiting — Playwright built-in; Puppeteer requires manual waitForSelector.
  // Puppeteer: await page.waitForSelector('.task-list', { visible: true });
  //            const el = await page.$('.task-list');
  // Playwright: auto-wait is part of every locator action.
  test('auto-wait: locator waits for element without manual waitForSelector', async ({ page }) => {
    await page.goto('/projects/test-project');
    const firstCard = page.getByRole('article').first();

    // Playwright auto-waits for the element — no manual waitForSelector needed.
    // In Puppeteer, you'd call page.waitForSelector('[role="article"]') first.
    // TODO 1: Assert the firstCard is visible (demonstrates auto-wait, no manual wait needed).
    await expect(firstCard)./* TODO 1: toBeVisible() */ toBeHidden();
  });

  // Test 2: Network interception API comparison.
  // Puppeteer: await page.setRequestInterception(true); page.on('request', req => req.abort());
  // Playwright: page.route() — cleaner, no need to enable interception globally.
  test('network interception: page.route() is cleaner than Puppeteer setRequestInterception', async ({ page }) => {
    let intercepted = false;
    await page.route('**/api/tasks**', async route => {
      intercepted = true;
      await route.continue();
    });

    await page.goto('/projects/test-project');
    await page.waitForLoadState('networkidle');

    // TODO 2: Assert intercepted is true (the route was triggered).
    expect(intercepted).toBe(/* TODO 2: true */ false);

    await page.unroute('**/api/tasks**');
  });

  // Test 3: BrowserContext isolation — Playwright's core isolation unit; Puppeteer requires manual.
  // In Puppeteer: you manage incognito contexts manually with browser.createIncognitoBrowserContext().
  // In Playwright: every test gets a fresh BrowserContext automatically via the fixture.
  test('context isolation: each test has a fresh browser context', async ({ page, context }) => {
    // In a Playwright test, 'context' is the fresh BrowserContext for this test.
    // In Puppeteer, you'd need to manually call browser.createIncognitoBrowserContext()
    // and manage its lifecycle in beforeEach/afterEach.

    const cookies = await context.cookies();
    // At the start of a test (after beforeEach login), the session cookie exists.
    // TODO 3: Assert cookies.length is greater than 0 (session cookie was set during login).
    expect(cookies.length).toBeGreaterThan(/* TODO 3: 0 */ 999);
  });

  // Test 4: Multi-browser — Playwright runs the same test on Chromium, Firefox, WebKit.
  // Puppeteer: Chrome/Chromium only (Firefox support is experimental and limited).
  test('multi-browser: browserName identifies the current engine', async ({ browserName }) => {
    // In Puppeteer, there is no browserName — it's always Chromium.
    // In Playwright, browserName can be 'chromium', 'firefox', or 'webkit'.
    // TODO 4: Assert browserName matches the regex /chromium|firefox|webkit/.
    expect(browserName).toMatch(/* TODO 4: /chromium|firefox|webkit/ */ /PLACEHOLDER/);
  });

  // Test 5: PDF generation — Lumio uses Puppeteer server-side; Playwright on Chromium also supports it.
  // page.pdf() is available in Playwright (Chromium only) and Puppeteer.
  test('PDF generation: page.pdf() works on Chromium for server-side PDF export', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'page.pdf() is Chromium-only — matches Puppeteer behavior');

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Both Playwright and Puppeteer support page.pdf() on Chromium with identical APIs.
    const pdfBuffer = await page.pdf({ format: 'A4' });

    // TODO 5: Assert pdfBuffer is an instance of Buffer (pdf() returns a Buffer).
    expect(pdfBuffer).toBeInstanceOf(/* TODO 5: Buffer */ Array);
  });

  // Test 6: Scraping — Playwright's evaluateAll pattern vs Puppeteer's $$eval.
  // Puppeteer: await page.$$eval('a', links => links.map(l => l.href))
  // Playwright: await page.locator('a').evaluateAll(links => links.map(l => l.href))
  test('scraping pattern: evaluateAll extracts data from multiple elements', async ({ page }) => {
    await page.goto('/');

    // Playwright: locator.evaluateAll() — scoped, chainable, type-safe.
    // Puppeteer: page.$$eval() — page-level, slightly less structured.
    const links = await page.locator('nav a').evaluateAll(
      els => els.map(el => el.getAttribute('href'))
    );

    // TODO 6: Assert links.length is greater than 0 (nav has at least one link).
    expect(links.length).toBeGreaterThan(/* TODO 6: 0 */ 999);
  });

});
