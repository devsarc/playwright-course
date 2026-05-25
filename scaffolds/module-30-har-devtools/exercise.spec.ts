import { test, expect } from '../fixtures/fixtures';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

// M30: HAR & DevTools Deep Analysis
//
// This module goes beyond HAR recording (M15) into analysis:
//   - Parse HAR timing data to rank requests by speed
//   - Apply CDP network throttling for reproducible perf testing
//   - Reconstruct a curl command from HAR data (same thing Trace Viewer does)
//
// Key distinction: M15 = recording + replay-based mocking
//                  M30 = timing analysis + bottleneck identification + CDP throttling
//
// HAR timing fields per entry:
//   dns | connect | ssl | send | wait (TTFB) | receive (download)
//
// CDP throttling is isolated to the browser context — it does NOT throttle the
// dev server or test runner, making results reproducible across machines.

const HAR_PATH = path.join(process.cwd(), 'test-results', 'dashboard.har');

// Helper: sum all timing values for a HAR entry
function totalDuration(entry: { timings: Record<string, number> }): number {
  return Object.values(entry.timings).reduce((sum, t) => sum + Math.max(t, 0), 0);
}

test.describe('HAR recording — dashboard', () => {
  test('record: capture dashboard network traffic to HAR', async ({ page, context }) => {
    // TODO 1: Configure the context to record all requests to a HAR file at HAR_PATH.
    // Use context.routeFromHAR() in update (record) mode.
    // Scope it to localhost so only local requests are captured.
    // Why: we want a full picture of the dashboard's network activity,
    // including the API calls, to analyze in the next test.
    await context.routeFromHAR(/* TODO 1: HAR_PATH, { update: true, url: /localhost/ } */);

    await page.goto('/dashboard');
    await page.getByTestId('dashboard-main').waitFor();

    // TODO 2: Assert that the HAR file was written to disk after the context closes.
    // The HAR is flushed when the browser context closes (end of test).
    // Use existsSync from 'fs'. Note: the file is written after this test's
    // afterEach teardown, so we assert on the path being defined here and
    // rely on the next test (which runs after context close) for file existence.
    expect(HAR_PATH).toBeTruthy(); /* TODO 2: replace with existsSync check in test 2 */
  });
});

test.describe('HAR analysis — slowest requests', () => {
  test('slowest: identify the 3 slowest requests in the dashboard HAR', async () => {
    // This test is intentionally not a browser test — it operates purely on file data.
    // No 'page' fixture needed: we read and parse the HAR JSON directly.

    // TODO 3: Read and parse the HAR file from HAR_PATH.
    // If the file doesn't exist, the record test above has not been run yet.
    // Use readFileSync + JSON.parse. Access har.log.entries for the request list.
    // Why: HAR is just JSON — you can process it with the same tools you use for any data.
    const harText = readFileSync(/* TODO 3: HAR_PATH, 'utf-8' */);
    const har = JSON.parse(/* TODO 3: harText */);
    const entries: Array<{
      request: { url: string; method: string; headers: Array<{ name: string; value: string }> };
      timings: Record<string, number>;
    }> = har.log.entries;

    // TODO 4: Sort entries by totalDuration() descending and take the top 3.
    // Then assert that all 3 were identified (array length === 3).
    // Why: programmatic sorting mirrors what you'd do manually in DevTools Network tab,
    // but this way the slowest endpoints are surfaced in test output automatically.
    const sorted = [...entries].sort(
      /* TODO 4: (a, b) => totalDuration(b) - totalDuration(a) */
    );
    const slowestThree = sorted.slice(/* TODO 4: 0, 3 */);

    expect(slowestThree).toHaveLength(/* TODO 4: 3 */);

    // Log the slowest requests so the learner can see them in test output
    for (const entry of slowestThree) {
      const total = totalDuration(entry).toFixed(1);
      const ttfb = Math.max(entry.timings.wait ?? 0, 0).toFixed(1);
      console.log(`[slow] ${entry.request.method} ${entry.request.url} — total: ${total}ms, TTFB: ${ttfb}ms`);
    }
  });
});

test.describe('CDP throttling — LCP under 3G', () => {
  test('throttle: measure dashboard LCP under simulated 3G network conditions', async ({ page }) => {
    // TODO 5: Open a CDP session on the current page context.
    // Use page.context().newCDPSession(page) to get a raw CDP session.
    // Why: CDP throttling is applied at the browser level only — it does not
    // affect the local dev server or test runner, making results reproducible.
    const client = await page.context().newCDPSession(/* TODO 5: page */);

    // TODO 6: Enable the CDP Network domain and apply 3G throttling conditions.
    // Parameters:
    //   offline: false
    //   downloadThroughput: 750 * 1024 / 8   (750 Kbps in bytes/sec)
    //   uploadThroughput:   250 * 1024 / 8   (250 Kbps in bytes/sec)
    //   latency: 100                          (100ms added round-trip latency)
    // Why these numbers: they match Chrome DevTools' "Slow 3G" preset,
    // giving a realistic baseline for mobile users on poor connections.
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', /* TODO 6: {
      offline: false,
      downloadThroughput: 750 * 1024 / 8,
      uploadThroughput: 250 * 1024 / 8,
      latency: 100,
    } */);

    const start = Date.now();
    await page.goto('/dashboard');
    await page.getByTestId('dashboard-main').waitFor();

    // TODO 7: Capture LCP using a PerformanceObserver inside page.evaluate().
    // Wait for the largest-contentful-paint entry and return its startTime.
    // Why: LCP is the most user-visible performance metric — it measures when the
    // largest element in the viewport becomes visible. Under throttling, LCP is
    // dominated by how long the slowest API call (typically /api/tasks) takes.
    const lcp = await page.evaluate(/* TODO 7: () =>
      new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          resolve(entries[entries.length - 1].startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      })
    */);

    const elapsed = Date.now() - start;
    console.log(`[throttle] Dashboard LCP under 3G: ${lcp}ms (total elapsed: ${elapsed}ms)`);

    // Under 3G, LCP should still complete — we assert it was recorded (> 0)
    // and that the full load finished within a generous 30s budget.
    expect(lcp).toBeGreaterThan(/* TODO 7: 0 */);
    expect(elapsed).toBeLessThan(30_000);

    // Clean up: restore normal network conditions before the context closes
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0,
    });
  });
});

test.describe('curl generation from HAR', () => {
  test('curl: reconstruct a curl command from the first API request in the HAR', async () => {
    // This test also operates on file data — no browser needed.

    const harText = readFileSync(HAR_PATH, 'utf-8');
    const har = JSON.parse(harText);
    const entries: Array<{
      request: {
        url: string;
        method: string;
        headers: Array<{ name: string; value: string }>;
        postData?: { text: string };
      };
      timings: Record<string, number>;
    }> = har.log.entries;

    // TODO 8: Find the first entry whose URL contains '/api/' — this is one of
    // Lumio's dashboard API calls. Then build a curl command string from it:
    //   curl -X <METHOD> '<URL>' \
    //     -H '<name>: <value>' \   (for each request header)
    //     [--data '<postData.text>']  (only if the request has a body)
    // Why: Trace Viewer's "Copy as curl" button does exactly this. Building it
    // from HAR data shows you what the button is doing under the hood, and
    // gives you the same capability programmatically in scripts or test output.
    const apiEntry = entries.find(/* TODO 8: (e) => e.request.url.includes('/api/') */);
    expect(apiEntry).toBeDefined();

    const { url, method, headers, postData } = apiEntry!.request;

    const headerFlags = headers
      .filter((h) => !['content-length', ':authority', ':method', ':path', ':scheme'].includes(h.name.toLowerCase()))
      .map((h) => `  -H '${h.name}: ${h.value}'`)
      .join(' \\\n');

    const dataFlag = postData?.text ? ` \\\n  --data '${postData.text}'` : '';

    const curlCommand = `curl -X ${method} '${url}' \\\n${headerFlags}${dataFlag}`;

    console.log('[curl]\n' + curlCommand);

    // Assert the generated command contains the essential parts
    expect(curlCommand).toContain(/* TODO 8: 'curl -X' */);
    expect(curlCommand).toContain(/* TODO 8: '/api/' */);
  });
});
