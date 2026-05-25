import { test, expect } from '../fixtures/fixtures';

// M60: WebSocket Deep Dive

test.describe('M60 — WebSocket Deep Dive', () => {

  // Test 1: routeWebSocket intercepts and delivers a frame
  test('routeWebSocket intercepts the connection and sends a frame', async ({ page }) => {
    const received: string[] = [];

    // TODO 1: Use page.routeWebSocket() to intercept '**/ws'.
    // In the handler, send { type: 'task.created', taskId: 'task-1' } to the page.
    // Why? routeWebSocket replaces the server — send deterministic frames for reliable assertions.
    await page.routeWebSocket(/* TODO 1: replace '**/PLACEHOLDER' with your WebSocket URL glob */ '**/PLACEHOLDER', ws => {
      ws.send(JSON.stringify({ type: 'task.created', taskId: 'task-1' }));
    });

    page.on('websocket', ws => {
      ws.on('framereceived', frame => received.push(frame.payload as string));
    });

    await page.goto('/dashboard');
    await page.waitForTimeout(300);

    // TODO 2: Assert that received.length is greater than 0.
    expect(received.length).toBeGreaterThan(/* TODO 2: 0 */ -1);
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

    // TODO 3: Assert that lastFrame?.type equals 'task.created'.
    // Why? Frame payload assertions verify the wire format — not just that the UI updated.
    expect(lastFrame?.type).toBe(/* TODO 3: 'task.created' */ '');
  });

  // Test 3: ws.onMessage receives browser-to-server frames
  test('mock server receives browser messages via onMessage', async ({ page }) => {
    const serverReceived: string[] = [];

    await page.routeWebSocket('**/ws', ws => {
      // TODO 4: Register ws.onMessage() to push each incoming message (as string) into serverReceived.
      // Why? onMessage() exposes browser→server frames — test bidirectional protocol behavior.
      ws.onMessage(message => {
        serverReceived.push(/* TODO 4: message as string */ '');
      });
    });

    await page.goto('/dashboard');
    await page.waitForTimeout(500); // Lumio sends a subscribe frame on connect

    // TODO 5: Assert that serverReceived.length is greater than 0.
    expect(serverReceived.length).toBeGreaterThan(/* TODO 5: 0 */ -1);
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

    // TODO 6: What Playwright API runs JavaScript inside the browser context from Node.js?
    const bridgeApi = /* TODO 6: 'page.evaluate' */ '';
    expect(bridgeApi).toBe('page.evaluate');
  });

  // Test 5: Capture the WebSocket connection URL
  test('assert WebSocket connects to the correct endpoint URL', async ({ page }) => {
    let wsUrl = '';

    page.on('websocket', ws => {
      // TODO 7: Capture the WebSocket URL via ws.url() into wsUrl.
      // Why? Asserting the URL confirms the correct endpoint — not a stale dev URL.
      wsUrl = /* TODO 7: ws.url() */ '';
    });

    await page.goto('/dashboard');
    await page.waitForTimeout(300);

    // TODO 8: Assert that wsUrl contains '/ws'.
    expect(wsUrl).toContain(/* TODO 8: '/ws' */ 'PLACEHOLDER_WONT_MATCH');
  });

  // Test 6: Disconnecting the mock triggers the app's reconnect logic
  test('closing the mock connection triggers reconnect attempts', async ({ page }) => {
    let connectionCount = 0;

    // TODO 9: Use page.routeWebSocket('**/ws', handler).
    // In the handler: increment connectionCount and call ws.close() immediately.
    // Why? Closing forces the app's reconnect logic — test it without touching the real server.
    await page.routeWebSocket(/* TODO 9: '**/ws' */ '**/PLACEHOLDER', ws => {
      connectionCount++;
      ws.close();
    });

    await page.goto('/dashboard');
    await page.waitForTimeout(3000); // allow time for reconnect attempts

    // TODO 10: Assert that connectionCount is greater than 1.
    expect(connectionCount).toBeGreaterThan(/* TODO 10: 1 */ 0);
  });

});
