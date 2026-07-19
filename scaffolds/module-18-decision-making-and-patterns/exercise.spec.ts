// Lesson 18: Decision-Making & Real-World Patterns
// Combines former modules: M81 (Playwright vs Selenium), M82 (Playwright vs Cypress),
// M83 (Playwright vs Puppeteer & Others), M84 (Flakiness Root Cause Analysis),
// M85 (Test Maintenance & Long-term Strategy), M86 (CI/CD Pipeline Optimization),
// M87 (Secrets & Security in Tests), M88 (Test Health Observability)
//
// Each Part below is the original module's test.describe block, unchanged
// except TODO numbers are prefixed with the Part number to stay unique in
// this file (a TODO originally numbered N in the M83 module becomes TODO
// 3.N here, matching Part 3's prefix).

import { test, expect } from '../fixtures/fixtures';
import * as path from 'path';

test.describe('Part 1 — Playwright vs Selenium (formerly M81)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  // Test 1: Auto-waiting — Playwright waits for element readiness; Selenium requires explicit waits.
  // In Selenium: WebDriverWait(driver, 10).until(EC.visibility_of_element_located(...))
  // In Playwright: auto-wait is built into every locator action.
  test('auto-wait: locator action waits for element without explicit wait code', async ({ page }) => {
    await page.goto('/projects/test-project');
    // getByRole waits for the element to be visible and stable before clicking.
    // No WebDriverWait equivalent is needed.
    // TODO 1.1: Click 'New task' — Playwright auto-waits; assert the dialog appears.
    await page.getByRole('button', { name: /* TODO 1.1: 'New task' */ 'PLACEHOLDER' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
  });

  // Test 2: Network interception — built into Playwright; Selenium requires BrowserMob Proxy.
  // In Selenium: requires a separate proxy server process and complex setup.
  // In Playwright: page.route() is a first-class API.
  test('network mocking: page.route() intercepts API calls without a proxy', async ({ page }) => {
    // Mock the projects API to return an empty list — no external proxy needed.
    await page.route('**/api/projects**', async route => {
      await route.fulfill({ status: 200, json: [] });
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // TODO 1.2: Assert the text 'No projects' is visible (empty state from mocked API).
    await expect(page.getByText(/* TODO 1.2: 'No projects' */ 'PLACEHOLDER')).toBeVisible();

    // Remove the route so subsequent tests are not affected.
    await page.unroute('**/api/projects**');
  });

  // Test 3: Multi-tab — Playwright's context.waitForEvent is clean; Selenium switches window handles.
  // In Selenium: driver.getWindowHandles(), driver.switchTo().window(handle), then switch back.
  // In Playwright: context.waitForEvent('page') captures the new page directly.
  test('multi-tab: open new tab and assert its URL', async ({ page, context }) => {
    await page.goto('/');
    // Open a link that navigates in a new tab (target="_blank").
    const [newPage] = await Promise.all([
      // TODO 1.3: Use context.waitForEvent('page') to capture the new tab.
      context.waitForEvent(/* TODO 1.3: 'page' */ 'request'),
      page.getByRole('link', { name: 'Documentation' }).click(),
    ]);

    await newPage.waitForLoadState();
    await expect(newPage).toHaveURL(/docs/);
    await newPage.close();
  });

  // Test 4: Shadow DOM — Playwright has first-class support; Selenium uses JavascriptExecutor hacks.
  // In Selenium: driver.executeScript("return document.querySelector('...').shadowRoot.querySelector('...')")
  // In Playwright: locator chaining through shadow roots works natively.
  test('shadow DOM: locator pierces shadow roots without JavaScript hacks', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    // The theme toggle is a custom web component that uses a shadow DOM.
    // Playwright's locator() pierces shadow DOM boundaries automatically.
    // TODO 1.4: Use page.locator() with a CSS selector for the theme-toggle web component's button.
    const themeButton = page.locator(/* TODO 1.4: 'theme-toggle button' */ 'PLACEHOLDER');
    await expect(themeButton).toBeVisible();
  });

  // Test 5: API alongside UI — request fixture allows API calls in the same test as UI assertions.
  // In Selenium: no equivalent built-in; requires a separate HTTP client library.
  test('API + UI: create task via API then verify it appears in the UI', async ({ page, request }) => {
    // Create the task via API (faster than UI) — this is idiomatic Playwright.
    const response = await request.post('/api/tasks', {
      data: { title: 'Selenium-comparison task', projectId: 'test-project-id' },
    });
    // TODO 1.5: Assert the API response status is 201 (created).
    expect(response.status()).toBe(/* TODO 1.5: 201 */ 0);

    await page.goto('/projects/test-project');
    await expect(page.getByText('Selenium-comparison task')).toBeVisible();
  });

  // Test 6: Semantic locators — Playwright encourages role/label selectors; Selenium defaults to CSS/XPath.
  // This test demonstrates the Playwright way vs the Selenium way for the same button.
  test('semantic locator: getByRole is more stable than CSS or XPath selectors', async ({ page }) => {
    await page.goto('/projects/test-project');

    // Selenium way (brittle): driver.findElement(By.cssSelector('#create-task-btn'))
    // Selenium way (also brittle): driver.findElement(By.xpath("//button[@class='btn-primary']"))

    // Playwright way (stable):
    // TODO 1.6: Use getByRole('button', { name: 'New task' }) — semantic, survives CSS refactoring.
    const createBtn = page.getByRole('button', { name: /* TODO 1.6: 'New task' */ 'PLACEHOLDER' });
    await expect(createBtn).toBeVisible();
  });

});

test.describe('Part 2 — Playwright vs Cypress (formerly M82)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  // Test 1: Multi-tab — Cypress cannot access a second browser tab at all.
  // Playwright: context.waitForEvent('page') captures the new tab.
  test('multi-tab: open task in new tab and assert its title', async ({ page, context }) => {
    await page.goto('/projects/test-project');

    const [newTab] = await Promise.all([
      // TODO 2.1: Use context.waitForEvent('page') to capture the new tab.
      // In Cypress, this test cannot be written — there is no multi-tab API.
      context.waitForEvent(/* TODO 2.1: 'page' */ 'request'),
      page.getByText('Design mockups').click({ modifiers: ['Meta'] }), // Ctrl+click opens new tab
    ]);

    await newTab.waitForLoadState();
    await expect(newTab.getByRole('heading', { name: /Design mockups/ })).toBeVisible();
    await newTab.close();
  });

  // Test 2: Cross-origin navigation — Cypress blocks by default; Playwright has no restriction.
  // This test navigates from the Lumio app to the Lumio docs (same origin, but simulates multi-origin).
  test('cross-origin navigation: navigate between the app and public docs', async ({ page }) => {
    // In Cypress (with default settings), navigating to a different origin in the same test fails.
    // In Playwright, page.goto() can navigate to any URL at any time.
    await page.goto('/docs'); // public docs

    // TODO 2.2: Assert the docs page title contains 'Documentation'.
    await expect(page).toHaveTitle(/* TODO 2.2: /Documentation/ */ /PLACEHOLDER/);

    // Navigate back to the app — no cross-origin restriction.
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard/);
  });

  // Test 3: WebKit testing — Cypress doesn't support WebKit; Playwright does.
  // This test uses browserName to demonstrate browser-specific testing.
  test('browser-specific assertion: browserName is available for conditional logic', async ({ page, browserName }) => {
    await page.goto('/projects/test-project');

    // In Playwright, browserName gives you the current engine.
    // In Cypress, there's no WebKit support — this scenario is untestable on Safari.
    // TODO 2.3: Assert browserName matches /chromium|firefox|webkit/.
    expect(browserName).toMatch(/* TODO 2.3: /chromium|firefox|webkit/ */ /PLACEHOLDER/);
  });

  // Test 4: Network interception — both tools support it, but with different APIs.
  // Playwright: page.route(). Cypress: cy.intercept().
  test('network mock: page.route() equivalent to cy.intercept()', async ({ page }) => {
    // Playwright:
    await page.route('**/api/dashboard/stats**', route =>
      route.fulfill({ status: 200, json: { tasks: 99, members: 5 } })
    );

    await page.reload();
    await page.waitForLoadState('networkidle');

    // TODO 2.4: Assert the text '99' is visible (the mocked task count from the API).
    await expect(page.getByText(/* TODO 2.4: '99' */ 'PLACEHOLDER')).toBeVisible();

    await page.unroute('**/api/dashboard/stats**');
  });

  // Test 5: Async/await vs chainable commands — the biggest migration friction from Cypress to Playwright.
  // Cypress: cy.get('button').click().should('be.visible')  [synchronous chain]
  // Playwright: await locator.click(); await expect(locator).toBeVisible();  [async/await]
  test('async pattern: use the correct assertion method for a visible button', async ({ page }) => {
    await page.goto('/projects/test-project');

    const btn = page.getByRole('button', { name: 'New task' });

    // In Cypress: btn.should('be.visible') — synchronous chain.
    // In Playwright: await expect(btn).toBeVisible() — async/await, explicit method call.
    // TODO 2.5: Replace toBeHidden() with toBeVisible() — the correct assertion for a visible button.
    await expect(btn)./* TODO 2.5: toBeVisible() */ toBeHidden();
  });

  // Test 6: File download — Playwright first-class; Cypress requires workarounds.
  test('file download: waitForEvent captures the download object', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Playwright: page.waitForEvent('download') captures the download synchronously.
    // Cypress: requires intercepting the XHR and reading response body — no native download event.
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      // TODO 2.6: Click the export button using getByRole('button', { name: 'Export CSV' }).
      page.getByRole('button', { name: /* TODO 2.6: 'Export CSV' */ 'PLACEHOLDER' }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/\.csv$/);
  });

});

test.describe('Part 3 — Playwright vs Puppeteer & Others (formerly M83)', () => {

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
    // TODO 3.1: Assert the firstCard is visible (demonstrates auto-wait, no manual wait needed).
    await expect(firstCard)./* TODO 3.1: toBeVisible() */ toBeHidden();
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

    // TODO 3.2: Assert intercepted is true (the route was triggered).
    expect(intercepted).toBe(/* TODO 3.2: true */ false);

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
    // TODO 3.3: Assert cookies.length is greater than 0 (session cookie was set during login).
    expect(cookies.length).toBeGreaterThan(/* TODO 3.3: 0 */ 999);
  });

  // Test 4: Multi-browser — Playwright runs the same test on Chromium, Firefox, WebKit.
  // Puppeteer: Chrome/Chromium only (Firefox support is experimental and limited).
  test('multi-browser: browserName identifies the current engine', async ({ browserName }) => {
    // In Puppeteer, there is no browserName — it's always Chromium.
    // In Playwright, browserName can be 'chromium', 'firefox', or 'webkit'.
    // TODO 3.4: Assert browserName matches the regex /chromium|firefox|webkit/.
    expect(browserName).toMatch(/* TODO 3.4: /chromium|firefox|webkit/ */ /PLACEHOLDER/);
  });

  // Test 5: PDF generation — Lumio uses Puppeteer server-side; Playwright on Chromium also supports it.
  // page.pdf() is available in Playwright (Chromium only) and Puppeteer.
  test('PDF generation: page.pdf() works on Chromium for server-side PDF export', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'page.pdf() is Chromium-only — matches Puppeteer behavior');

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Both Playwright and Puppeteer support page.pdf() on Chromium with identical APIs.
    const pdfBuffer = await page.pdf({ format: 'A4' });

    // TODO 3.5: Assert pdfBuffer is an instance of Buffer (pdf() returns a Buffer).
    expect(pdfBuffer).toBeInstanceOf(/* TODO 3.5: Buffer */ Array);
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

    // TODO 3.6: Assert links.length is greater than 0 (nav has at least one link).
    expect(links.length).toBeGreaterThan(/* TODO 3.6: 0 */ 999);
  });

});

test.describe('Part 4 — Flakiness Root Cause Analysis (formerly M84)', () => {

  // Test 1: Timing flakiness prevention — replace waitForTimeout with condition-based wait.
  // Antipattern: await page.waitForTimeout(2000); // breaks on slow CI
  // Fix: wait for the element's state directly.
  test('timing fix: condition-based wait instead of hardcoded timeout', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Timing antipattern: await page.waitForTimeout(2000); // flaky!
    // Correct: wait for the navigation signal — deterministic, no timing assumption.
    // TODO 4.1: Wait for the URL to contain 'dashboard' using waitForURL.
    await page.waitForURL(/* TODO 4.1: /dashboard/ */ /PLACEHOLDER/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  // Test 2: Data flakiness prevention — use unique test data to avoid conflicts in parallel runs.
  // Antipattern: hardcoded task name — two parallel tests create the same task, causing a 409 conflict.
  // Fix: append a unique suffix to test data.
  test('data fix: unique test data prevents parallel test conflicts', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);

    await page.goto('/projects/test-project');
    await page.getByRole('button', { name: 'New task' }).click();

    // Data antipattern: 'My task' — two parallel tests both try to create 'My task', causing conflicts.
    // Correct: unique suffix ensures no two tests share the same task name.
    // TODO 4.2: Use a unique task name by appending Date.now() to the string 'Unique task '.
    const uniqueTitle = /* TODO 4.2: `Unique task ${Date.now()}` */ 'My task';
    await page.getByLabel('Task title').fill(uniqueTitle);
    await page.getByRole('button', { name: 'Create task' }).click();
    await expect(page.getByText(uniqueTitle)).toBeVisible();
  });

  // Test 3: Selector flakiness prevention — use a specific scoped locator instead of index-based.
  // Antipattern: page.getByRole('button').nth(0) — the first button changes when UI is reordered.
  // Fix: use accessible name to uniquely identify the element.
  test('selector fix: use accessible name instead of positional nth()', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);

    await page.goto('/projects/test-project');

    // Selector antipattern: page.getByRole('button').nth(0) — breaks when a new button is added.
    // Correct: use the accessible name — stable regardless of DOM order.
    // TODO 4.3: Use getByRole('button', { name: 'New task' }) instead of a positional nth() locator.
    const createBtn = page.getByRole('button', { name: /* TODO 4.3: 'New task' */ 'PLACEHOLDER' });
    await expect(createBtn).toBeVisible();
  });

  // Test 4: Environment flakiness prevention — set explicit timeout for slow CI environments.
  // Antipattern: relying on the default test timeout (which may be too short in slow CI).
  // Fix: set explicit timeouts for tests that are legitimately slow.
  test('environment fix: explicit timeout accommodates slow CI environments', async ({ page }, testInfo) => {
    // Environment-sensitive tests need explicit timeouts — CI runners are often 2-3× slower.
    // TODO 4.4: Set the test timeout to 60000ms using testInfo.setTimeout().
    testInfo.setTimeout(/* TODO 4.4: 60000 */ 0); // 0ms timeout causes immediate failure

    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  // Test 5: Retry detection — use testInfo.retry to attach diagnostics on flaky reruns.
  test('retry awareness: attach diagnostic screenshot when a test is retried', async ({ page }, testInfo) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);

    // testInfo.retry is 0 on first run, 1 on first retry, 2 on second retry.
    // On retry, attach a screenshot for post-mortem analysis.
    if (testInfo.retry > 0) {
      await testInfo.attach('retry-state-screenshot', {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
    }

    // TODO 4.5: Assert testInfo.retry is less than 2 (should not need more than 1 retry).
    expect(testInfo.retry).toBeLessThan(/* TODO 4.5: 2 */ 0);
  });

  // Test 6: Network-based wait — use waitForResponse instead of waitForTimeout after form submit.
  // Antipattern: submit form, then waitForTimeout(1000) hoping the API call completes.
  // Fix: intercept the specific API call and wait for its response.
  test('network wait: waitForResponse replaces timeout after task creation', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);

    await page.goto('/projects/test-project');
    await page.getByRole('button', { name: 'New task' }).click();
    await page.getByLabel('Task title').fill('Network wait task');

    // Set up the response waiter BEFORE triggering the action.
    const responsePromise = page.waitForResponse(resp =>
      resp.url().includes('/api/tasks') && resp.status() === 201
    );

    await page.getByRole('button', { name: 'Create task' }).click();

    // TODO 4.6: Await the responsePromise to wait for the API call to complete.
    const response = await /* TODO 4.6: responsePromise */ Promise.resolve(null);
    expect(response).not.toBeNull();
  });

});

test.describe('Part 5 — Test Maintenance & Long-term Strategy (formerly M85)', () => {

  // Test 1: Role locator outperforms CSS class and placeholder-based selectors.
  // Smell: page.getByPlaceholder('Enter your email') — breaks on copy edits.
  // Fix: getByLabel — tied to the semantic <label>, rarely changes.
  test('selector resilience: getByLabel survives placeholder text changes', async ({ page }) => {
    await page.goto('/login');
    // Brittle antipattern: page.getByPlaceholder('Enter your email') — copy editors break this.
    // Resilient: getByLabel is backed by the <label> element, which tracks form field intent.
    // TODO 5.1: Replace 'PLACEHOLDER' with 'Email' to use the label-based locator.
    const emailInput = page.getByLabel(/* TODO 5.1: 'Email' */ 'PLACEHOLDER');
    await expect(emailInput).toBeVisible();
  });

  // Test 2: Named role locator outlasts positional nth() when button order changes.
  // Smell: page.getByRole('button').nth(0) — DOM order changes when new buttons are added.
  // Fix: getByRole with accessible name — stable regardless of DOM position.
  test('selector resilience: named button role survives DOM reordering', async ({ page }) => {
    await page.goto('/login');
    // Brittle: page.getByRole('button').nth(0) — shifts when a nav button is added above.
    // Resilient: accessible name scopes the match to exactly one element.
    // TODO 5.2: Replace 'PLACEHOLDER' with 'Sign in' to use an accessible-name locator.
    const signInBtn = page.getByRole('button', { name: /* TODO 5.2: 'Sign in' */ 'PLACEHOLDER' });
    await expect(signInBtn).toBeEnabled();
  });

  // Test 3: Scoped locator prevents strict mode violations.
  // Smell: page.getByRole('link', { name: 'Features' }) — might match navbar AND footer.
  // Fix: scope the locator to its parent container.
  test('selector resilience: scoped locator avoids strict mode violation', async ({ page }) => {
    await page.goto('/');
    // Unscoped: page.getByRole('link', { name: 'Features' }) — strict mode fails if it matches twice.
    // Scoped: nav.getByRole('link', ...) — limited to the navigation context.
    const nav = page.getByRole('navigation');
    // TODO 5.3: Replace 'PLACEHOLDER' with 'Features' to find the nav link by accessible name.
    const featuresLink = nav.getByRole('link', { name: /* TODO 5.3: 'Features' */ 'PLACEHOLDER' });
    await expect(featuresLink).toBeVisible();
  });

  // Test 4: Annotate tests with issue tracker links for traceability.
  // Without annotations, a test failure in CI requires digging into history to understand why the test exists.
  // With annotations, the HTML report links directly to the bug report it was written for.
  test('documentation: annotate test with issue link for traceability', async ({ page }, testInfo) => {
    // TODO 5.4: Replace 'PLACEHOLDER' with 'issue' — the annotation type used to link a test to a bug report.
    testInfo.annotations.push({
      type: /* TODO 5.4: 'issue' */ 'PLACEHOLDER',
      description: 'https://linear.app/lumio/issue/LUM-234',
    });
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    // Verify the annotation was attached with the correct type.
    const issueAnnotation = testInfo.annotations.find(a => a.type === 'issue');
    expect(issueAnnotation).not.toBeUndefined();
  });

  // Test 5: Tag tests to track coverage tiers.
  // Smoke tests run on every push — tagging them identifies which tests belong to which CI tier.
  test('documentation: tag test with smoke coverage tier annotation', async ({ page }, testInfo) => {
    // TODO 5.5: Replace 'PLACEHOLDER' with 'tag' — the annotation type for coverage tier markers.
    testInfo.annotations.push({
      type: /* TODO 5.5: 'tag' */ 'PLACEHOLDER',
      description: '@smoke',
    });
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    // Verify the smoke tag annotation is present and has the correct type.
    const smokeAnnotation = testInfo.annotations.find(a => a.description === '@smoke');
    expect(smokeAnnotation?.type).toBe('tag');
  });

  // Test 6: Overcoupling smell — assert visible state, not CSS implementation.
  // Smell: expect(await page.locator('.sidebar-nav--active').count()).toBe(1)
  //        — breaks on any CSS rename; doesn't test user-visible behavior.
  // Fix: assert what the user sees (the nav is visible) rather than the CSS class that implements it.
  test('decoupling: assert visible state, not CSS class name', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);
    // Overcoupled: locator('.sidebar-nav--active') — any CSS rename breaks this.
    // Decoupled: assert the navigation role is visible — it tests what the user sees.
    // TODO 5.6: Replace 'PLACEHOLDER' with 'navigation' to assert the sidebar is visible by role.
    const sidebar = page.getByRole(/* TODO 5.6: 'navigation' */ 'PLACEHOLDER' as Parameters<typeof page.getByRole>[0]);
    await expect(sidebar).toBeVisible();
  });

  // Test 7: expect.soft() surfaces all failures in one run — useful for suite-wide audits.
  // A maintenance audit should reveal ALL broken assertions, not just the first one.
  // expect.soft() continues execution after failure and collects errors in testInfo.errors.
  test('maintenance: expect.soft collects all assertion failures for holistic diagnosis', async ({ page }, testInfo) => {
    await page.goto('/login');
    // TODO 5.7: Replace /PLACEHOLDER/ with /Lumio/ to assert the page title matches the brand name.
    await expect.soft(page).toHaveTitle(/* TODO 5.7: /Lumio/ */ /PLACEHOLDER/);
    // This heading assertion always runs even if the title check above failed.
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    // With /PLACEHOLDER/ as the title pattern, the soft assertion fails but testInfo.errors captures it.
  });

});

test.describe('Part 6 — CI/CD Pipeline Optimization (formerly M86)', () => {

  // Test 1: Per-test timeout override for slow CI environments.
  // CI runners are 2-4x slower than localhost — per-test timeout prevents spurious failures.
  // testInfo.setTimeout() overrides the config timeout for the current test only.
  test('timeout: per-test timeout accommodates slow CI without raising global config', async ({ page }, testInfo) => {
    // TODO 6.1: Add the CI latency buffer (30000ms) to the current timeout using testInfo.setTimeout().
    // testInfo.timeout is the current config timeout; adding 30000 gives CI runners extra headroom.
    testInfo.setTimeout(/* TODO 6.1: testInfo.timeout + 30_000 */ 0);
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  // Test 2: testInfo.retry — behave differently on CI retry attempts.
  // A test that attaches diagnostics on retry surfaces more context for CI post-mortem analysis.
  test('retries: attach diagnostic screenshot on retry attempt', async ({ page }, testInfo) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);

    if (testInfo.retry > 0) {
      await testInfo.attach('ci-retry-screenshot', {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
    }

    // testInfo.retry is 0 on first attempt, 1 on first retry, etc.
    // CI config sets retries: 2. A test that needed retry index 2+ is unacceptably flaky.
    // TODO 6.2: Assert testInfo.retry is less than 2 — the test should not need more than 1 retry.
    expect(testInfo.retry).toBeLessThan(/* TODO 6.2: 2 */ 0);
  });

  // Test 3: testInfo.workerIndex — detect resource conflicts between parallel workers.
  // Each worker gets a unique index (0, 1, 2...). Tests can use it to segment test data.
  test('parallelism: workerIndex enables unique per-worker test data', async ({ page }, testInfo) => {
    // In parallel CI runs, workerIndex distinguishes which worker is running this test.
    // Using it in test data (e.g., `worker${testInfo.workerIndex}@lumio.test`) prevents conflicts.
    await page.goto('/login');
    // workerIndex is always a non-negative integer — workers are numbered from 0.
    // TODO 6.3: Assert testInfo.workerIndex is greater than or equal to 0.
    expect(testInfo.workerIndex).toBeGreaterThanOrEqual(/* TODO 6.3: 0 */ 999);
  });

  // Test 4: testInfo.project — behave differently per browser project.
  // CI matrix runs tests across Chromium, Firefox, and WebKit in parallel projects.
  test('parallelism: project name identifies which browser the test is running in', async ({ page }, testInfo) => {
    await page.goto('/login');
    // testInfo.project.name matches the project name from playwright.config.ts (e.g., 'chromium').
    // Useful for skipping known browser-specific bugs or for conditional assertions.
    // TODO 6.4: Assert the project name matches the regex /chromium|firefox|webkit/i.
    expect(testInfo.project.name).toMatch(/* TODO 6.4: /chromium|firefox|webkit/i */ /PLACEHOLDER/);
  });

  // Test 5: testInfo.outputDir — store CI artifacts per test for artifact upload.
  // GitHub Actions uploads the entire test-results/ folder — outputDir is where this test's files land.
  test('artifacts: outputDir is defined and points to the test-results directory', async ({ page }, testInfo) => {
    await page.goto('/login');
    // testInfo.outputDir is the per-test output path — traces, screenshots, and attachments go here.
    // It is always a non-empty string pointing inside the test-results/ directory.
    // TODO 6.5: Assert testInfo.outputDir is not an empty string (truthy).
    expect(testInfo.outputDir).toBeTruthy();
    // TODO 6.5b: Assert it contains 'test-results' to confirm artifacts land in the right directory.
    expect(testInfo.outputDir).toContain(/* TODO 6.5b: 'test-results' */ 'PLACEHOLDER');
  });

  // Test 6: Selective run with grep — smoke-tagged tests run in under 60 seconds.
  // Tests annotated with @smoke are included in the per-push CI check; others run nightly.
  test('grep: smoke annotation marks this test for per-push CI inclusion @smoke', async ({ page }, testInfo) => {
    // '@smoke' in the test title makes this matchable by --grep "@smoke".
    // Additionally, attach a tag annotation for the HTML report and JSON reporter consumers.
    // TODO 6.6: Push an annotation with type 'tag' and description '@smoke'.
    testInfo.annotations.push({
      type: /* TODO 6.6: 'tag' */ 'PLACEHOLDER',
      description: '@smoke',
    });
    await page.goto('/');
    await expect(page).toHaveTitle(/Lumio/);
    const smokeTag = testInfo.annotations.find(a => a.description === '@smoke');
    expect(smokeTag?.type).toBe('tag');
  });

  // Test 7: testInfo.duration — validate that the test ran within the performance budget.
  // CI pipelines have per-step time budgets. A test that takes > 30s is a CI bottleneck.
  test('performance: test duration is measurable via testInfo after completion', async ({ page }, testInfo) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    // testInfo.duration is set AFTER the test body completes — check it in afterEach, not here.
    // During the test body, duration reflects time elapsed so far (always >= 0).
    // TODO 6.7: Assert testInfo.duration is greater than or equal to 0 (it's always non-negative mid-test).
    expect(testInfo.duration).toBeGreaterThanOrEqual(/* TODO 6.7: 0 */ 999999);
  });

});

test.describe('Part 7 — Secrets & Security in Tests (formerly M87)', () => {

  // Test 1: Credentials come from environment variables, not string literals.
  // Reading from process.env at runtime keeps secrets out of source control.
  test('secrets: credentials are loaded from environment variables', async ({ page }) => {
    // Hardcoding passwords in test files is a security violation.
    // process.env.TEST_PASSWORD is set in .env.test (gitignored) or CI secrets.
    // TODO 7.1: Replace 'PLACEHOLDER' with process.env.TEST_PASSWORD ?? 'password123'
    // (The fallback 'password123' is safe here because this is a test-only seed account.)
    const password = /* TODO 7.1: process.env.TEST_PASSWORD ?? 'password123' */ 'PLACEHOLDER';
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  // Test 2: process.env values must be defined — fail fast, never silently use empty string.
  // An empty string credential would let the test "pass" against an auth system that skips blank passwords.
  test('secrets: missing env var triggers a clear error, not a silent empty string', async ({ page }) => {
    // The pattern: read the env var, then assert it is truthy before using it.
    // An empty-string password that passes auth is a worse outcome than a thrown error.
    const email = process.env.TEST_EMAIL ?? 'admin@lumio.test';
    // TODO 7.2: Replace '' with 'admin@lumio.test' — assert that email is truthy (non-empty).
    expect(email).toBeTruthy();
    expect(email).not.toBe(/* TODO 7.2: '' */ 'SHOULD_NOT_BE_THIS');
    await page.goto('/login');
    await expect(page.getByLabel('Email')).toBeVisible();
  });

  // Test 3: Screenshot masking — sensitive UI values are blurred in captured images.
  // The password field must not appear in plain text in any test artifact.
  test('masking: password field is masked in screenshots', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');

    // page.screenshot({ mask }) blurs the matched elements in the captured PNG.
    // Attach the masked screenshot to demonstrate the masking is applied.
    // TODO 7.3: Replace page.getByLabel('Email') with page.getByLabel('Password')
    // — the password field is the sensitive element that must be masked.
    const maskedField = page.getByLabel(/* TODO 7.3: 'Password' */ 'Email');
    const screenshot = await page.screenshot({ mask: [maskedField] });
    await test.info().attach('masked-login-screenshot', {
      body: screenshot,
      contentType: 'image/png',
    });
    expect(screenshot.byteLength).toBeGreaterThan(0);
  });

  // Test 4: API keys must not appear in test step labels or annotation descriptions.
  // testInfo.annotations stores metadata — values here appear in HTML reports.
  test('masking: API key is not exposed in annotation descriptions', async ({ page }, testInfo) => {
    const apiKey = process.env.TEST_API_KEY ?? 'test-key-abc123';
    // Safe annotation: record that an API key was used, but NOT the key value itself.
    // TODO 7.4: Replace 'PLACEHOLDER' with 'api-key-present' to annotate presence without exposing value.
    testInfo.annotations.push({
      type: 'security',
      description: /* TODO 7.4: 'api-key-present' */ 'PLACEHOLDER',
    });
    await page.goto('/login');
    // The annotation must describe presence, not the value.
    const annotation = testInfo.annotations.find(a => a.type === 'security');
    expect(annotation?.description).not.toBe(apiKey);
    expect(annotation?.description).toBe('api-key-present');
  });

  // Test 5: Database URL must point at a test instance, not production.
  // This test verifies the env var convention is followed in the test environment.
  test('isolation: DATABASE_URL points at a test instance, not production', async ({ page }) => {
    const dbUrl = process.env.DATABASE_URL ?? '';
    // A production database URL should never contain 'prod', 'production', or a cloud hostname.
    // The test DB URL should contain 'localhost', '127.0.0.1', or 'test' in the database name.
    // TODO 7.5: Replace /PLACEHOLDER/ with /localhost|127\.0\.0\.1|lumio_test/
    // — assert the DATABASE_URL matches a known safe pattern.
    if (dbUrl) {
      expect(dbUrl).toMatch(/* TODO 7.5: /localhost|127\.0\.0\.1|lumio_test/ */ /PLACEHOLDER/);
    }
    await page.goto('/');
    await expect(page).toHaveTitle(/Lumio/);
  });

  // Test 6: Authorization headers in network requests are not logged in plain text.
  // Intercepting the request lets us verify the header exists without logging its value.
  test('masking: Authorization header is present but its value is not asserted as a literal', async ({ page }) => {
    let authHeaderFound = false;

    // Intercept all API requests to check for Authorization header presence.
    await page.route('/api/**', async route => {
      const headers = route.request().headers();
      if (headers['authorization']) {
        authHeaderFound = true;
      }
      await route.continue();
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(/dashboard/);

    // After login, dashboard API calls should include an Authorization header.
    // TODO 7.6: Replace false with true — after login, API calls carry auth headers.
    expect(authHeaderFound).toBe(/* TODO 7.6: true */ false);
  });

  // Test 7: Sensitive output directories are not world-readable — outputDir is local only.
  // This test verifies the outputDir path does not reference a shared or cloud mount.
  test('isolation: test artifacts are written to a local output directory', async ({ page }, testInfo) => {
    // testInfo.outputDir is the per-test artifact directory — must be under the local project root.
    // It must not reference a cloud share, NFS mount, or production path.
    // TODO 7.7: Replace 'PLACEHOLDER' with 'test-results' — artifacts must land in test-results/.
    expect(testInfo.outputDir).toContain(/* TODO 7.7: 'test-results' */ 'PLACEHOLDER');
    await page.goto('/');
    await expect(page).toHaveTitle(/Lumio/);
  });

});

test.describe('Part 8 — Test Health Observability (formerly M88)', () => {

  // Test 1: testInfo.retry indicates whether this run is a retry attempt.
  // Flakiness rate = (tests that needed retry / total passed tests).
  // A retry count of 0 means the test passed on the first attempt — healthy baseline.
  test('flakiness: testInfo.retry is 0 on a stable first-attempt test @smoke', async ({ page }, testInfo) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    // testInfo.retry is 0 when the test passes on its first run.
    // Asserting this in a stable test verifies that the suite health tracking is correct.
    // TODO 8.1: Replace 999 with 0 — a first-attempt pass has retry === 0.
    expect(testInfo.retry).toBe(/* TODO 8.1: 0 */ 999);
  });

  // Test 2: testInfo.duration is always non-negative — the raw signal for duration trending.
  // Feed this into a time-series dashboard to detect when tests start slowing down.
  test('duration: testInfo.duration is non-negative mid-test', async ({ page }, testInfo) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Lumio/);
    // duration reflects elapsed milliseconds at the time of this assertion.
    // In afterEach it reflects the complete test duration — use that for budget enforcement.
    // TODO 8.2: Replace -1 with 0 — duration is always >= 0.
    expect(testInfo.duration).toBeGreaterThanOrEqual(/* TODO 8.2: 0 */ -1);
  });

  // Test 3: Attach a health metadata annotation for the JSON reporter.
  // The JSON reporter serializes annotations — a post-processing script reads them to classify tests.
  test('metadata: annotate test with coverage tier tag @smoke', async ({ page }, testInfo) => {
    // TODO 8.3: Replace 'PLACEHOLDER' with 'tag' — the correct annotation type for coverage tier markers.
    testInfo.annotations.push({
      type: /* TODO 8.3: 'tag' */ 'PLACEHOLDER',
      description: '@smoke',
    });
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    const tagAnnotation = testInfo.annotations.find(a => a.description === '@smoke');
    expect(tagAnnotation?.type).toBe('tag');
  });

  // Test 4: Annotate with flakiness risk level — signals to the health dashboard what to watch.
  // Tests touching real-time features or network-dependent assertions should be flagged.
  test('metadata: annotate test with flakiness risk level', async ({ page }, testInfo) => {
    testInfo.annotations.push({
      type: 'flakiness-risk',
      // TODO 8.4: Replace 'PLACEHOLDER' with 'low' — a stable, network-independent test is low risk.
      description: /* TODO 8.4: 'low' */ 'PLACEHOLDER',
    });
    await page.goto('/');
    await expect(page).toHaveTitle(/Lumio/);
    const riskAnnotation = testInfo.annotations.find(a => a.type === 'flakiness-risk');
    expect(riskAnnotation?.description).toBe('low');
  });

  // Test 5: testInfo.testId uniquely identifies this test run — use as a key in a metrics store.
  // A metrics database keyed on testId can track duration trends per test over time.
  test('metadata: testInfo.testId is a non-empty string', async ({ page }, testInfo) => {
    await page.goto('/login');
    // testInfo.testId is a hash-like unique identifier for this specific test.
    // It is stable across runs for the same test (same title + file), making it a reliable DB key.
    // TODO 8.5: Replace '' with a truthy check — testId is always a non-empty string.
    expect(testInfo.testId).toBeTruthy();
    expect(testInfo.testId).not.toBe(/* TODO 8.5: '' */ 'definitely-not-empty');
  });

  // Test 6: testInfo.title contains the test name — extract @tags for coverage distribution analysis.
  // Parsing the title for @tags lets you count how many tests cover each feature tier.
  test('metadata: title contains the @smoke tag for grep-based filtering @smoke', async ({ page }, testInfo) => {
    // '@smoke' in the title makes the test matchable by: npx playwright test --grep "@smoke"
    // TODO 8.6: Replace /PLACEHOLDER/ with /@smoke/ to assert the title contains the smoke tag.
    expect(testInfo.title).toMatch(/* TODO 8.6: /@smoke/ */ /PLACEHOLDER/);
    await page.goto('/');
    await expect(page).toHaveTitle(/Lumio/);
  });

  // Test 7: Attach a structured JSON payload to carry health metrics in the test report.
  // The attachment appears in the HTML report and the JSON reporter output under 'attachments'.
  test('reporting: attach structured health metrics as a JSON attachment', async ({ page }, testInfo) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();

    const healthMetrics = {
      retry: testInfo.retry,
      workerIndex: testInfo.workerIndex,
      project: testInfo.project.name,
      // duration is finalized after test completion — this captures the in-progress value.
      durationMs: testInfo.duration,
    };

    // TODO 8.7: Replace 'PLACEHOLDER_CONTENT_TYPE' with 'application/json'
    // — attachments must declare their MIME type so report viewers render them correctly.
    await testInfo.attach('health-metrics', {
      body: Buffer.from(JSON.stringify(healthMetrics)),
      contentType: /* TODO 8.7: 'application/json' */ 'PLACEHOLDER_CONTENT_TYPE',
    });

    // Verify the attachment was registered.
    expect(testInfo.attachments).toHaveLength(1);
    expect(testInfo.attachments[0].name).toBe('health-metrics');
    expect(testInfo.attachments[0].contentType).toBe('application/json');
  });

});
