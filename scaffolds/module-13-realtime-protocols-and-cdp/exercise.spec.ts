// Lesson 13: WebSocket, SSE & CDP Deep Dive
// Combines former modules: M60 (WebSocket Deep Dive), M61 (SSE & Streaming),
// M62 (CDP Direct Access).
//
// Each Part below is the original module's test.describe block, unchanged
// except TODO numbers are prefixed with the Part number to stay unique in
// this file (a TODO originally numbered N in the M61 module becomes TODO
// 2.N here, matching Part 2's prefix).

import { test, expect } from '../fixtures/fixtures';

test.describe('Part 1 — WebSocket Deep Dive (formerly M60)', () => {

  // Test 1: routeWebSocket intercepts and delivers a frame
  test('routeWebSocket intercepts the connection and sends a frame', async ({ page }) => {
    const received: string[] = [];

    // TODO 1.1: Use page.routeWebSocket() to intercept '**/ws'.
    // In the handler, send { type: 'task.created', taskId: 'task-1' } to the page.
    // Why? routeWebSocket replaces the server — send deterministic frames for reliable assertions.
    await page.routeWebSocket(/* TODO 1.1 */ '**/PLACEHOLDER', ws => {
      ws.send(JSON.stringify({ type: 'task.created', taskId: 'task-1' }));
    });

    page.on('websocket', ws => {
      ws.on('framereceived', frame => received.push(frame.payload as string));
    });

    await page.goto('/dashboard');
    await page.waitForTimeout(300);

    // TODO 1.2: Assert that received.length is greater than 0.
    expect(received.length).toBeGreaterThan(/* TODO 1.2: 0 */ -1);
  });

  // Test 2: Parse frame payload and assert JSON structure
  test('assert exact JSON payload of a received frame', async ({ page }) => {
    let lastFrame: { type?: string; taskId?: string } | null = null;

    await page.routeWebSocket('**/ws', ws => {
      ws.send(JSON.stringify({ type: 'task.created', taskId: 'task-abc' }));
    });

    page.on('websocket', ws => {
      ws.on('framereceived', frame => {
        try { lastFrame = JSON.parse(frame.payload as string); } catch {}
      });
    });

    await page.goto('/dashboard');
    await page.waitForTimeout(300);

    // TODO 1.3: Assert that lastFrame?.type equals 'task.created'.
    // Why? Frame payload assertions verify the wire format — not just that the UI updated.
    expect(lastFrame?.type).toBe(/* TODO 1.3: 'task.created' */ '');
  });

  // Test 3: ws.onMessage receives browser-to-server frames
  test('mock server receives browser messages via onMessage', async ({ page }) => {
    const serverReceived: string[] = [];

    await page.routeWebSocket('**/ws', ws => {
      // TODO 1.4: Register ws.onMessage() to push each incoming message (as string) into serverReceived.
      // Why? onMessage() exposes browser→server frames — test bidirectional protocol behavior.
      ws.onMessage(message => {
        serverReceived.push(/* TODO 1.4: message as string */ '');
      });
    });

    await page.goto('/dashboard');
    await page.waitForTimeout(500); // Lumio sends a subscribe frame on connect

    // TODO 1.5: Assert that serverReceived.length is greater than 0.
    expect(serverReceived.length).toBeGreaterThan(/* TODO 1.5: 0 */ -1);
  });

  // Test 4: page.evaluate is the bridge to browser-side WebSocket objects
  test('page.evaluate bridges test code to the browser WebSocket', async ({}) => {
    // The app's WebSocket lives inside the browser context (window.__ws).
    // From Node.js test code, you cannot call ws.send() directly.
    // page.evaluate() runs a function inside the browser — the only bridge.
    //
    // Pattern:
    //   await page.evaluate(() => {
    //     const ws = (window as any).__ws;
    //     if (ws?.readyState === WebSocket.OPEN) {
    //       ws.send(JSON.stringify({ type: 'ping' }));
    //     }
    //   });

    // TODO 1.6: What Playwright API runs JavaScript inside the browser context from Node.js?
    const bridgeApi = /* TODO 1.6: 'page.evaluate' */ '';
    expect(bridgeApi).toBe('page.evaluate');
  });

  // Test 5: Capture the WebSocket connection URL
  test('assert WebSocket connects to the correct endpoint URL', async ({ page }) => {
    let wsUrl = '';

    page.on('websocket', ws => {
      // TODO 1.7: Capture the WebSocket URL via ws.url() into wsUrl.
      // Why? Asserting the URL confirms the correct endpoint — not a stale dev URL.
      wsUrl = /* TODO 1.7: ws.url() */ '';
    });

    await page.goto('/dashboard');
    await page.waitForTimeout(300);

    // TODO 1.8: Assert that wsUrl contains '/ws'.
    expect(wsUrl).toContain(/* TODO 1.8: '/ws' */ 'PLACEHOLDER_WONT_MATCH');
  });

  // Test 6: Disconnecting the mock triggers the app's reconnect logic
  test('closing the mock connection triggers reconnect attempts', async ({ page }) => {
    let connectionCount = 0;

    // TODO 1.9: Use page.routeWebSocket('**/ws', handler).
    // In the handler: increment connectionCount and call ws.close() immediately.
    // Why? Closing forces the app's reconnect logic — test it without touching the real server.
    await page.routeWebSocket(/* TODO 1.9 */ '**/PLACEHOLDER', ws => {
      connectionCount++;
      ws.close();
    });

    await page.goto('/dashboard');
    await page.waitForTimeout(3000); // allow time for reconnect attempts

    // TODO 1.10: Assert that connectionCount is greater than 1.
    expect(connectionCount).toBeGreaterThan(/* TODO 1.10: 1 */ 0);
  });

});

const SSE_BODY = [
  'id: 1\nevent: task.created\ndata: {"taskId":"t1","title":"Fix login bug"}\n\n',
  'id: 2\nevent: task.updated\ndata: {"taskId":"t1","status":"in_progress"}\n\n',
  'id: 3\nevent: task.created\ndata: {"taskId":"t2","title":"Add dark mode"}\n\n',
].join('');

test.describe('Part 2 — SSE & Streaming (formerly M61)', () => {

  // Test 1: Mock the SSE endpoint and receive events
  test('mock SSE endpoint delivers events to the page', async ({ page }) => {
    // TODO 2.1: Use page.route() to intercept '**/api/activity-stream'.
    // Fulfill with: status 200, Content-Type 'text/event-stream', body SSE_BODY.
    // Why? Mocking SSE via page.route() gives full control over event sequence and timing.
    await page.route(/* TODO 2.1 */ '**/PLACEHOLDER', route => {
      route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
        body: SSE_BODY,
      });
    });

    await page.goto('/dashboard');
    await page.waitForTimeout(500);

    // The activity feed should have rendered at least two items from the mock events
    // TODO 2.2: Assert that the activity feed list has at least 2 items.
    const feedItems = page.getByTestId('activity-feed-item');
    await expect(feedItems).toHaveCount(/* TODO 2.2: 3 */ 0);
  });

  // Test 2: Assert event ordering in the rendered activity feed
  test('events render in the order they arrive in the stream', async ({ page }) => {
    await page.route('**/api/activity-stream', route => {
      route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
        body: SSE_BODY,
      });
    });

    await page.goto('/dashboard');
    await page.waitForTimeout(500);

    const firstItem = page.getByTestId('activity-feed-item').first();

    // TODO 2.3: Assert that the first activity feed item contains text 'Fix login bug'
    // (the title from the first SSE event).
    // Why? Event ordering matters — a feed that reverses events misleads the user about history.
    await expect(firstItem).toContainText(/* TODO 2.3: 'Fix login bug' */ 'PLACEHOLDER');
  });

  // Test 3: SSE Content-Type header is text/event-stream
  test('SSE endpoint uses the correct Content-Type header', async ({ page }) => {
    let contentType = '';

    page.on('response', response => {
      if (response.url().includes('/api/activity-stream')) {
        contentType = response.headers()['content-type'] ?? '';
      }
    });

    await page.goto('/dashboard');
    await page.waitForTimeout(300);

    // TODO 2.4: Assert that contentType includes 'text/event-stream'.
    // Why? The browser's EventSource only handles SSE responses with this Content-Type.
    expect(contentType).toContain(/* TODO 2.4: 'text/event-stream' */ 'PLACEHOLDER');
  });

  // Test 4: EventSource reconnects and sends Last-Event-ID
  test('EventSource sends Last-Event-ID on reconnect', async ({ page }) => {
    let lastEventId = '';
    let requestCount = 0;

    await page.route('**/api/activity-stream', route => {
      requestCount++;
      // TODO 2.5: On the second request (requestCount > 1), capture the 'last-event-id' header.
      if (requestCount > 1) {
        lastEventId = route.request().headers()[/* TODO 2.5: 'last-event-id' */ 'x-placeholder'] ?? '';
      }
      // First request: send two events then close; second request: send empty stream
      const body = requestCount === 1 ? SSE_BODY : '\n\n';
      route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
        body,
      });
    });

    await page.goto('/dashboard');
    await page.waitForTimeout(3000); // EventSource waits ~3s before reconnecting

    // TODO 2.6: Assert that lastEventId equals '3' (the last event ID from the initial stream).
    expect(lastEventId).toBe(/* TODO 2.6: '3' */ '');
  });

  // Test 5: SSE vs WebSocket — directional distinction
  test('SSE is server-to-client only; WebSocket is bidirectional', async ({}) => {
    // SSE uses a plain HTTP GET — the server streams text/event-stream.
    // The browser cannot send messages back over the same connection.
    // WebSocket upgrades the connection to a full-duplex channel.

    // TODO 2.7: What browser API does SSE use? (hint: it's not WebSocket)
    const sseApi = /* TODO 2.7: 'EventSource' */ '';
    expect(sseApi).toBe('EventSource');
  });

  // Test 6: Parse SSE data payload
  test('SSE data field contains valid JSON', async ({ page }) => {
    const payloads: Array<{ taskId: string; title?: string; status?: string }> = [];

    await page.route('**/api/activity-stream', route => {
      route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
        body: SSE_BODY,
      });
    });

    // Collect data payloads via page.evaluate after events render
    await page.goto('/dashboard');
    await page.waitForTimeout(500);

    // The activity feed items expose their taskId via data-task-id attribute
    const taskIds = await page.getByTestId('activity-feed-item').evaluateAll(
      els => els.map(el => el.getAttribute('data-task-id'))
    );

    // TODO 2.8: Assert that taskIds includes 't1' (the taskId from the first mock SSE event).
    expect(taskIds).toContain(/* TODO 2.8: 't1' */ 'PLACEHOLDER');
  });

});

test.describe('Part 3 — CDP Direct Access (formerly M62)', () => {

  // All CDP tests require Chromium
  test.beforeEach(async ({ browserName }) => {
    test.skip(browserName !== 'chromium', 'CDP is Chromium-only');
  });

  // Test 1: Open a CDP session
  test('open a CDP session on the page', async ({ page }) => {
    // TODO 3.1: Open a CDP session using page.context().newCDPSession(page).
    // Assign the result to `client`.
    // Why? newCDPSession() gives you direct access to the Chrome DevTools Protocol —
    // Playwright's escape hatch for capabilities not wrapped in high-level APIs.
    const client = await page.context()./* TODO 3.1: newCDPSession(page) */ newCDPSession(
      /* TODO 3.1: page */ null as any
    );

    // TODO 3.2: Assert that client is an object (not null/undefined).
    expect(typeof client).toBe(/* TODO 3.2: 'object' */ '');
  });

  // Test 2: Enable the Profiler domain
  test('enable and disable the CDP Profiler domain', async ({ page }) => {
    const client = await page.context().newCDPSession(page);

    // TODO 3.3: Send 'Profiler.enable' via client.send().
    // Why? CDP domains must be enabled before their methods are callable.
    await client.send(/* TODO 3.3: 'Profiler.enable' */ 'PLACEHOLDER');

    // Profiler is enabled — no error means success
    expect(true).toBe(true);

    await client.send('Profiler.disable');
  });

  // Test 3: Collect JavaScript coverage via CDP
  test('collect JS coverage via CDP Profiler', async ({ page }) => {
    const client = await page.context().newCDPSession(page);

    await client.send('Profiler.enable');

    // TODO 3.4: Start precise coverage with { callCount: false, detailed: true }.
    // Why? Precise coverage tracks per-function usage — `detailed: true` gives range data.
    await client.send(/* TODO 3.4: 'Profiler.startPreciseCoverage' */ 'PLACEHOLDER', {
      callCount: false,
      detailed: true,
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // TODO 3.5: Call 'Profiler.takePreciseCoverage' and destructure `result` from the return value.
    const { result } = await client.send(/* TODO 3.5: 'Profiler.takePreciseCoverage' */ 'PLACEHOLDER' as any);

    await client.send('Profiler.stopPreciseCoverage');
    await client.send('Profiler.disable');

    // TODO 3.6: Assert that result.length is greater than 0 (at least one script was profiled).
    expect(result.length).toBeGreaterThan(/* TODO 3.6: 0 */ -1);
  });

  // Test 4: Collect CSS coverage via CDP
  test('collect CSS rule usage via CDP CSS domain', async ({ page }) => {
    const client = await page.context().newCDPSession(page);

    await client.send('CSS.enable');

    // TODO 3.7: Start CSS rule usage tracking via 'CSS.startRuleUsageTracking'.
    await client.send(/* TODO 3.7: 'CSS.startRuleUsageTracking' */ 'PLACEHOLDER');

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const { ruleUsage } = await client.send('CSS.takeCoverageDelta');
    await client.send('CSS.stopRuleUsageTracking');

    // TODO 3.8: Assert that ruleUsage.length is greater than 0.
    // Why? The dashboard loads Tailwind CSS — at least some rules will be used.
    expect(ruleUsage.length).toBeGreaterThan(/* TODO 3.8: 0 */ -1);
  });

  // Test 5: Throttle network conditions to 3G via CDP
  test('throttle network to 3G and navigate the dashboard', async ({ page }) => {
    const client = await page.context().newCDPSession(page);

    await client.send('Network.enable');

    // TODO 3.9: Use 'Network.emulateNetworkConditions' to simulate slow 3G:
    //   { offline: false, downloadThroughput: 375 * 1024 / 8, uploadThroughput: 125 * 1024 / 8, latency: 100 }
    // Why? CDP throttling is granular — offline:false with low throughput simulates a slow mobile network.
    await client.send(/* TODO 3.9: 'Network.emulateNetworkConditions' */ 'PLACEHOLDER', {
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
    // TODO 3.10: Assert that loadTime is greater than 100 (throttle is adding latency).
    expect(loadTime).toBeGreaterThan(/* TODO 3.10: 100 */ 0);
  });

  // Test 6: CDP is Chromium-only — guard pattern
  test('CDP guard pattern uses browserName check', async ({}) => {
    // CDP tests must be guarded because CDP does not exist in Firefox or WebKit.
    // The guard pattern:
    //   test.skip(browserName !== 'chromium', 'CDP is Chromium-only');
    //
    // This test is already guarded by the beforeEach above.

    // TODO 3.11: What browserName value should you check for when guarding CDP tests?
    const cdpBrowser = /* TODO 3.11: 'chromium' */ '';
    expect(cdpBrowser).toBe('chromium');
  });

});
