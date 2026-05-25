import { test, expect } from '../fixtures/fixtures';
import { existsSync, mkdirSync, rmSync } from 'fs';
import path from 'path';

// M59: Screenshot & Demo Generation

const DEMO_DIR = path.join(__dirname, 'demo-output');

test.describe('M59 — Screenshot & Demo Generation', () => {

  test.beforeAll(() => {
    if (!existsSync(DEMO_DIR)) mkdirSync(DEMO_DIR, { recursive: true });
  });

  test.afterAll(() => {
    if (existsSync(DEMO_DIR)) rmSync(DEMO_DIR, { recursive: true });
  });

  // Test 1: Capture a step screenshot with sequential naming
  test('capture numbered step screenshots', async ({ page }) => {
    let step = 0;
    const capture = async (label: string) => {
      // TODO 1: Use page.screenshot() with path set to:
      //   `${DEMO_DIR}/step-${String(++step).padStart(2, '0')}-${label}.png`
      // Why? padStart(2, '0') zero-pads so '01' sorts before '10' in file explorers.
      await page.screenshot({
        path: /* TODO 1: `${DEMO_DIR}/step-${String(++step).padStart(2, '0')}-${label}.png` */ `${DEMO_DIR}/step.png`,
      });
    };

    await page.goto('/dashboard');
    await capture('dashboard');

    await page.getByRole('button', { name: 'Add task' }).first().click();
    await capture('dialog-open');

    await page.getByTestId('task-title-input').fill('Launch new feature');
    await capture('title-filled');

    // TODO 2: Assert that step equals 3 (three screenshots captured).
    expect(step).toBe(/* TODO 2: 3 */);
  });

  // Test 2: fullPage screenshot captures beyond the viewport
  test('fullPage option captures the complete scrollable page', async ({ page }) => {
    await page.goto('/dashboard');

    const screenshotPath = path.join(DEMO_DIR, 'full-page.png');

    // TODO 3: Take a full-page screenshot using { fullPage: true }.
    // Why? fullPage captures content below the fold — essential for long dashboard views.
    await page.screenshot({
      path: screenshotPath,
      fullPage: /* TODO 3: true */ false,
    });

    expect(existsSync(screenshotPath)).toBe(true);
  });

  // Test 3: Mask sensitive content in demo screenshots
  test('mask option obscures sensitive areas', async ({ page }) => {
    await page.goto('/dashboard');

    const screenshotPath = path.join(DEMO_DIR, 'masked.png');

    // TODO 4: Take a screenshot with the user avatar masked.
    // Use { mask: [page.getByTestId('user-avatar')] }
    // Why? Masking obscures test credentials or PII that would appear in a public demo.
    await page.screenshot({
      path: screenshotPath,
      mask: /* TODO 4: [page.getByTestId('user-avatar')] */ [],
    });

    expect(existsSync(screenshotPath)).toBe(true);
  });

  // Test 4: Video recording is configured at context level
  test('video recording option is understood', async ({}) => {
    // Video recording is configured when creating a context:
    //   const context = await browser.newContext({
    //     recordVideo: {
    //       dir: 'demo-videos/',
    //       size: { width: 1280, height: 720 },
    //     },
    //   });
    //
    // The video file appears in the dir after context.close().
    // Add slowMo for readable video: newContext({ ..., slowMo: 500 })

    // TODO 5: What option key on newContext() enables video recording?
    const videoOption = /* TODO 5: 'recordVideo' */ '';
    expect(videoOption).toBe('recordVideo');
  });

  // Test 5: slowMo paces interactions for readable video
  test('slowMo delays all actions for demo-quality video', async ({}) => {
    // slowMo is a launch or context option:
    //   await browser.newContext({ slowMo: 500 }); // 500ms between each action

    // TODO 6: What is the recommended slowMo value (in ms) for a demo video?
    const slowMoMs = /* TODO 6: 500 */ 0;
    expect(slowMoMs).toBeGreaterThan(0);
  });

  // Test 6: Demo script uses waitForLoadState instead of assertions
  test('demo scripts use waitForLoadState for stability', async ({ page }) => {
    // In a test: await expect(page).toHaveURL('/dashboard');
    // In a demo script: await page.waitForLoadState('networkidle');
    //
    // Assertions stop the demo on failure. waitForLoadState waits
    // for the page to stabilize without requiring a specific outcome.

    await page.goto('/dashboard');

    // TODO 7: Assert that page.waitForLoadState is a function.
    expect(typeof /* TODO 7: page.waitForLoadState */).toBe('function');
  });

});
