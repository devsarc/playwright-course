import { test, expect } from '../fixtures/fixtures';

// M62: CDP Direct Access

test.describe('M62 — CDP Direct Access', () => {

  // All CDP tests require Chromium
  test.beforeEach(async ({ browserName }) => {
    test.skip(browserName !== 'chromium', 'CDP is Chromium-only');
  });

  // Test 1: Open a CDP session
  test('open a CDP session on the page', async ({ page }) => {
    // TODO 1: Open a CDP session using page.context().newCDPSession(page).
    // Assign the result to `client`.
    // Why? newCDPSession() gives you direct access to the Chrome DevTools Protocol —
    // Playwright's escape hatch for capabilities not wrapped in high-level APIs.
    const client = await page.context()./* TODO 1: newCDPSession(page) */ newCDPSession(
      /* TODO 1: page */ null as any
    );

    // TODO 2: Assert that client is an object (not null/undefined).
    expect(typeof client).toBe(/* TODO 2: 'object' */ '');
  });

  // Test 2: Enable the Profiler domain
  test('enable and disable the CDP Profiler domain', async ({ page }) => {
    const client = await page.context().newCDPSession(page);

    // TODO 3: Send 'Profiler.enable' via client.send().
    // Why? CDP domains must be enabled before their methods are callable.
    await client.send(/* TODO 3: 'Profiler.enable' */ 'PLACEHOLDER');

    // Profiler is enabled — no error means success
    expect(true).toBe(true);

    await client.send('Profiler.disable');
  });

  // Test 3: Collect JavaScript coverage via CDP
  test('collect JS coverage via CDP Profiler', async ({ page }) => {
    const client = await page.context().newCDPSession(page);

    await client.send('Profiler.enable');

    // TODO 4: Start precise coverage with { callCount: false, detailed: true }.
    // Why? Precise coverage tracks per-function usage — `detailed: true` gives range data.
    await client.send(/* TODO 4: 'Profiler.startPreciseCoverage' */ 'PLACEHOLDER', {
      callCount: false,
      detailed: true,
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // TODO 5: Call 'Profiler.takePreciseCoverage' and destructure `result` from the return value.
    const { result } = await client.send(/* TODO 5: 'Profiler.takePreciseCoverage' */ 'PLACEHOLDER' as any);

    await client.send('Profiler.stopPreciseCoverage');
    await client.send('Profiler.disable');

    // TODO 6: Assert that result.length is greater than 0 (at least one script was profiled).
    expect(result.length).toBeGreaterThan(/* TODO 6: 0 */ -1);
  });

  // Test 4: Collect CSS coverage via CDP
  test('collect CSS rule usage via CDP CSS domain', async ({ page }) => {
    const client = await page.context().newCDPSession(page);

    await client.send('CSS.enable');

    // TODO 7: Start CSS rule usage tracking via 'CSS.startRuleUsageTracking'.
    await client.send(/* TODO 7: 'CSS.startRuleUsageTracking' */ 'PLACEHOLDER');

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const { ruleUsage } = await client.send('CSS.takeCoverageDelta');
    await client.send('CSS.stopRuleUsageTracking');

    // TODO 8: Assert that ruleUsage.length is greater than 0.
    // Why? The dashboard loads Tailwind CSS — at least some rules will be used.
    expect(ruleUsage.length).toBeGreaterThan(/* TODO 8: 0 */ -1);
  });

  // Test 5: Throttle network conditions to 3G via CDP
  test('throttle network to 3G and navigate the dashboard', async ({ page }) => {
    const client = await page.context().newCDPSession(page);

    await client.send('Network.enable');

    // TODO 9: Use 'Network.emulateNetworkConditions' to simulate slow 3G:
    //   { offline: false, downloadThroughput: 375 * 1024 / 8, uploadThroughput: 125 * 1024 / 8, latency: 100 }
    // Why? CDP throttling is granular — offline:false with low throughput simulates a slow mobile network.
    await client.send(/* TODO 9: 'Network.emulateNetworkConditions' */ 'PLACEHOLDER', {
      offline: false,
      downloadThroughput: 375 * 1024 / 8,
      uploadThroughput: 125 * 1024 / 8,
      latency: 100,
    });

    const start = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - start;

    // Under 3G throttle, load takes longer than on a fast connection
    // TODO 10: Assert that loadTime is greater than 100 (throttle is adding latency).
    expect(loadTime).toBeGreaterThan(/* TODO 10: 100 */ 0);
  });

  // Test 6: CDP is Chromium-only — guard pattern
  test('CDP guard pattern uses browserName check', async ({}) => {
    // CDP tests must be guarded because CDP does not exist in Firefox or WebKit.
    // The guard pattern:
    //   test.skip(browserName !== 'chromium', 'CDP is Chromium-only');
    //
    // This test is already guarded by the beforeEach above.

    // TODO 11: What browserName value should you check for when guarding CDP tests?
    const cdpBrowser = /* TODO 11: 'chromium' */ '';
    expect(cdpBrowser).toBe('chromium');
  });

});
