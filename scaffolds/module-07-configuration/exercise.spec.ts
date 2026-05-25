import { test, expect } from '@playwright/test';

// M07: Configuration Deep Dive
//
// Run this module's tests with the local config:
// npx playwright test tests/module-07-configuration --config=tests/module-07-configuration/playwright-m07.config.ts

test('landing page loads on all configured browsers', async ({ page, browserName }) => {
  await page.goto('/');
  // TODO 4: Assert the heading is visible.
  // When this test runs across multiple projects (chromium, firefox, webkit),
  // Playwright runs it once per project. The browserName fixture tells you which one.
  await expect(page.getByRole('heading', { level: 1 }))/* TODO 4: toBeVisible() */;

  // TODO 5: Add a custom annotation recording which browser this ran on.
  // Use test.info().annotations.push({ type: 'browser', description: browserName }).
  test.info()/* TODO 5: annotations.push({ type: 'browser', description: browserName }) */;
});

test('mobile viewport renders hamburger menu', async ({ page, browserName }) => {
  // This test only makes sense on the mobile-chrome project (Pixel 5 device preset)
  // TODO 6: Skip this test unless the browserName is 'chromium' (mobile-chrome uses chromium).
  // Actually, use page.viewportSize() to check — skip if viewport width > 768px.
  const viewport = page.viewportSize();
  test.skip(/* TODO 6: (viewport?.width ?? 1280) > 768, 'Only meaningful on mobile viewports' */);

  await page.goto('/');
  const mobileMenuButton = page.getByRole('button', { name: 'Open mobile menu' });
  await expect(mobileMenuButton).toBeVisible();
});
