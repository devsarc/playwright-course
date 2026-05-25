import { test, expect } from '../fixtures/fixtures';

// M81: Playwright vs Selenium
// Each test demonstrates a Playwright capability where Selenium requires more work.
// Understanding these differences informs the "migrate or keep?" decision for existing Selenium suites.

test.describe('M81 — Playwright vs Selenium: Architectural Differences', () => {

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
    // TODO 1: Click 'New task' — Playwright auto-waits; assert the dialog appears.
    await page.getByRole('button', { name: /* TODO 1: 'New task' */ 'PLACEHOLDER' }).click();
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

    // TODO 2: Assert the text 'No projects' is visible (empty state from mocked API).
    await expect(page.getByText(/* TODO 2: 'No projects' */ 'PLACEHOLDER')).toBeVisible();

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
      // TODO 3: Use context.waitForEvent('page') to capture the new tab.
      context.waitForEvent(/* TODO 3: 'page' */ 'request'),
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
    // TODO 4: Use page.locator() with a CSS selector for the theme-toggle web component's button.
    const themeButton = page.locator(/* TODO 4: 'theme-toggle button' */ 'PLACEHOLDER');
    await expect(themeButton).toBeVisible();
  });

  // Test 5: API alongside UI — request fixture allows API calls in the same test as UI assertions.
  // In Selenium: no equivalent built-in; requires a separate HTTP client library.
  test('API + UI: create task via API then verify it appears in the UI', async ({ page, request }) => {
    // Create the task via API (faster than UI) — this is idiomatic Playwright.
    const response = await request.post('/api/tasks', {
      data: { title: 'Selenium-comparison task', projectId: 'test-project-id' },
    });
    // TODO 5: Assert the API response status is 201 (created).
    expect(response.status()).toBe(/* TODO 5: 201 */ 0);

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
    // TODO 6: Use getByRole('button', { name: 'New task' }) — semantic, survives CSS refactoring.
    const createBtn = page.getByRole('button', { name: /* TODO 6: 'New task' */ 'PLACEHOLDER' });
    await expect(createBtn).toBeVisible();
  });

});
