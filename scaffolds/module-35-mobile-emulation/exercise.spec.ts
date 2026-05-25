import { test, expect, devices } from '../fixtures/fixtures';

// M35: Mobile Emulation & Responsive Testing
//
// These tests use Playwright's device emulation to verify Lumio's responsive design.
// They run on Chromium in emulated mobile mode — for Safari-engine bugs, use the WebKit project (M34).

test.describe('M35 — Mobile Emulation', () => {

  // Test 1: iPhone 14 viewport — hamburger menu appears
  test('hamburger menu is visible on iPhone 14', async ({ browser }) => {
    // TODO 1: Create a new browser context using the iPhone 14 device preset.
    // Why newContext() instead of test.use()? test.use() applies to all tests in the file.
    // newContext() lets you set the device for a single test, keeping other tests unaffected.
    const context = await browser.newContext(/* TODO 1: { ...devices['iPhone 14'] } */);
    const page = await context.newPage();

    await page.goto('/');

    // TODO 2: Assert that the full desktop nav links are NOT visible at this viewport.
    // At 390px wide, the desktop nav should be hidden by CSS.
    await expect(page.getByTestId(/* TODO 2: 'desktop-nav' */)).not.toBeVisible();

    // TODO 3: Assert that the hamburger menu button IS visible.
    // The button has aria role 'button' and an accessible name containing 'menu'.
    await expect(page.getByRole(/* TODO 3: 'button', { name: /menu/i } */)).toBeVisible();

    await context.close();
  });

  // Test 2: Hamburger menu opens to reveal nav links
  test('hamburger menu opens nav links on mobile', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPhone 14'] });
    const page = await context.newPage();
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: /menu/i });
    await menuButton.click();

    // TODO 4: Assert that the nav links are now visible after clicking the hamburger button.
    // Use getByRole('navigation') to scope to the nav element, then check a known link inside it.
    const nav = page.getByRole(/* TODO 4: 'navigation' */);
    await expect(nav.getByRole(/* TODO 4: 'link', { name: 'Pricing' } */)).toBeVisible();

    await context.close();
  });

  // Test 3: Dark mode via emulateMedia
  test('dark mode renders Lumio with correct color scheme', async ({ page }) => {
    await page.goto('/');

    // TODO 5: Activate dark mode using page.emulateMedia().
    // Why emulateMedia() instead of CSS class toggling? emulateMedia() simulates the OS-level
    // preference — it tests the actual prefers-color-scheme media query, not a manual theme toggle.
    await page.emulateMedia(/* TODO 5: { colorScheme: 'dark' } */);

    // TODO 6: Assert that the page body has the dark color scheme applied.
    // Use page.evaluate() to read the computed background color of the body.
    const bgColor = await page.evaluate(/* TODO 6: () => getComputedStyle(document.body).backgroundColor */);
    // Dark mode should NOT be white (rgb(255, 255, 255))
    expect(bgColor).not.toBe(/* TODO 6: 'rgb(255, 255, 255)' */);
  });

  // Test 4: Print stylesheet via emulateMedia
  test('print stylesheet hides navigation', async ({ page }) => {
    await page.goto('/');

    // TODO 7: Switch to print media type.
    // Why? Print stylesheets (@media print) often hide navigation, sidebars, and decorative
    // elements. Verifying this ensures the app prints cleanly for users who print pages.
    await page.emulateMedia(/* TODO 7: { media: 'print' } */);

    // In print mode, the nav should be hidden via @media print { nav { display: none } }
    // TODO 8: Assert the desktop navigation is not visible in print mode.
    await expect(page.getByTestId(/* TODO 8: 'desktop-nav' */)).not.toBeVisible();
  });

  // Test 5: Orientation change mid-test
  test('layout adjusts when rotating from portrait to landscape', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPhone 14'] });
    const page = await context.newPage();
    await page.goto('/');

    // Portrait: 390×844
    const portraitViewport = page.viewportSize();
    expect(portraitViewport!.width).toBeLessThan(portraitViewport!.height);

    // TODO 9: Switch to landscape orientation by calling page.setViewportSize().
    // Landscape iPhone 14: width=844, height=390.
    // Why setViewportSize() vs context? setViewportSize() changes the viewport mid-test
    // without reloading — media queries respond immediately, like rotating a real device.
    await page.setViewportSize(/* TODO 9: { width: 844, height: 390 } */);

    const landscapeViewport = page.viewportSize();
    expect(landscapeViewport!.width).toBeGreaterThan(/* TODO 9: landscapeViewport!.height */);

    await context.close();
  });

});
