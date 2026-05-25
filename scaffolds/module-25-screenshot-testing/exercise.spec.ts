import { test, expect } from '../fixtures/fixtures';
import fs from 'fs';
import path from 'path';

// M25: Screenshot Testing
//
// This module is about CAPTURING screenshots — saving images to disk for
// documentation, debugging, and CI artifact generation.
//
// It does NOT use toHaveScreenshot(). That method compares against a stored
// baseline (pixel-diffing) and is the subject of M26 (Visual Regression Testing).
//
// Auth note: these tests navigate to /dashboard, which is a protected route.
// Auth setup (storageState, global setup) is covered in M16. Here we focus
// entirely on the screenshot API. If your environment requires auth, add:
//   test.use({ storageState: 'tests/fixtures/auth-state-user.json' });
// before the describe block.

// Ensure the output directory exists before any test runs.
const screenshotsDir = path.join(process.cwd(), 'test-results', 'screenshots');
fs.mkdirSync(screenshotsDir, { recursive: true });

test.describe('Screenshot capture — Lumio dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard before each test.
    // Auth is out of scope for this module (see M16). If the app redirects to
    // /login, the screenshot tests will still run — they will capture the login
    // page instead of the dashboard, which is fine for practising the API.
    await page.goto('/dashboard');
  });

  test('full-page screenshot of the dashboard', async ({ page }) => {
    // TODO 1: Call page.screenshot() with fullPage: true and a path option.
    // fullPage captures the entire document height, not just the visible viewport.
    // This is important for pages with content below the fold.
    const buffer = await page.screenshot(/* TODO 1: {
      fullPage: true,
      path: path.join(screenshotsDir, 'dashboard-full.png'),
    } */);

    // TODO 2: Assert the returned buffer is truthy.
    // page.screenshot() always returns a Buffer — asserting it confirms the
    // capture completed without throwing. This is the minimal assertion for
    // documentation screenshots (we are capturing, not comparing).
    expect(/* TODO 2: buffer */).toBeTruthy();
  });

  test('viewport-only screenshot of the dashboard', async ({ page }) => {
    // TODO 3: Call page.screenshot() WITHOUT fullPage.
    // The default behaviour captures only the visible viewport at the current
    // scroll position. Compare the resulting image size with the full-page PNG.
    const buffer = await page.screenshot(/* TODO 3: {
      path: path.join(screenshotsDir, 'dashboard-viewport.png'),
    } */);

    // TODO 4: Assert the buffer is truthy.
    // Viewport screenshots are faster than full-page ones and are the right
    // choice when you only care about what is currently visible on screen.
    expect(/* TODO 4: buffer */).toBeTruthy();
  });

  test('element-level screenshot of a task card', async ({ page }) => {
    // Locate the first task card on the kanban board.
    const taskCard = page.getByTestId('task-card').first();

    // TODO 5: Call locator.screenshot() on taskCard and save the image.
    // locator.screenshot() scrolls the element into view, waits for it to be
    // stable, then captures exactly its bounding box — no surrounding page chrome.
    // This is ideal for component-level documentation.
    const buffer = await taskCard.screenshot(/* TODO 5: {
      path: path.join(screenshotsDir, 'task-card.png'),
    } */);

    // TODO 6: Assert the buffer has a non-zero byte length.
    // buffer.length > 0 confirms that pixels were actually captured.
    // An empty buffer would indicate the element was invisible or zero-sized.
    expect(/* TODO 6: buffer.length */).toBeGreaterThan(0);
  });

  test('clip region — header only', async ({ page }) => {
    // TODO 7: Use the clip option to capture just the header region.
    // clip accepts { x, y, width, height } in CSS pixels measured from the
    // top-left corner of the page. This is useful when the region you want
    // does not map cleanly to a single DOM element (e.g. a sticky header
    // that overlaps multiple layout layers).
    const buffer = await page.screenshot(/* TODO 7: {
      clip: { x: 0, y: 0, width: 1280, height: 80 },
      path: path.join(screenshotsDir, 'header-clip.png'),
    } */);

    // TODO 8: Assert the buffer is truthy.
    // After completing this TODO, open test-results/screenshots/header-clip.png
    // and confirm it shows only the top 80px of the dashboard — the header bar.
    expect(/* TODO 8: buffer */).toBeTruthy();
  });
});
