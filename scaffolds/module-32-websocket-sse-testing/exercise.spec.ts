// ⚠️  Lumio does not implement a /presence WebSocket endpoint on the board route.
// The "real connection" tests (test.describe 1) are illustrative — they will fail
// unless you add a presence WS to Lumio. The "mocked server" tests (test.describe 2)
// use page.routeWebSocket() and do not require a real WS server.

import { test, expect } from '../fixtures/fixtures';

// M32: WebSocket & SSE Testing
//
// Two strategies:
//   Real WS: page.waitForEvent('websocket') + ws.waitForEvent('framereceived')
//     — tests the full stack; requires a running WS server
//   Mocked WS: page.routeWebSocket(pattern, handler)
//     — intercepts before reaching the server; fast, isolated

test.describe('WebSocket — real connection', () => {
  test('presence indicator appears when WS connects', async ({ page }) => {
    // TODO 1: Use Promise.all to start navigation and wait for the WS simultaneously.
    // This prevents a race condition where the WS opens before waitForEvent is called.
    const [, ws] = await Promise.all([
      page.goto('/projects/demo/board'),
      page.waitForEvent(/* TODO 1: 'websocket' */),
    ]);

    // TODO 2: Assert the WS URL contains 'presence'.
    expect(ws.url()).toContain(/* TODO 2: 'presence' */);

    // TODO 3: Assert the presence indicator is visible.
    await expect(page.getByTestId(/* TODO 3: 'presence-indicator' */)).toBeVisible();
  });

  test('receives a frame from the server', async ({ page }) => {
    const [, ws] = await Promise.all([
      page.goto('/projects/demo/board'),
      page.waitForEvent('websocket'),
    ]);

    // TODO 4: Wait for one incoming frame using ws.waitForEvent('framereceived').
    // The event resolves with { payload: string | Buffer }.
    const frame = await ws.waitForEvent(/* TODO 4: 'framereceived' */);

    // TODO 5: Parse the JSON payload and assert it has a 'type' property.
    const message = JSON.parse(frame.payload as string);
    expect(message).toHaveProperty(/* TODO 5: 'type' */);
  });
});

test.describe('WebSocket — mocked server', () => {
  test('inject a user_joined event via routeWebSocket', async ({ page }) => {
    // TODO 6: Use page.routeWebSocket() to intercept the presence WS and
    // immediately send a fake user_joined message on open.
    // routeWebSocket(urlPattern, handler) — handler receives a WebSocketRoute.
    await page.routeWebSocket(/presence/, (ws) => {
      ws.onopen = () => {
        ws.send(/* TODO 6: JSON.stringify({ type: 'user_joined', userId: 'u999', name: 'Alice' }) */);
      };
    });

    await page.goto('/projects/demo/board');

    // TODO 7: Assert a presence-avatar appears (rendered when user_joined is received).
    await expect(page.getByTestId(/* TODO 7: 'presence-avatar' */)).toBeVisible();
  });

  test('simulate connection close and verify reconnect UI', async ({ page }) => {
    // TODO 8: Route the WS to close immediately on open, then assert the
    // reconnect banner (data-testid="ws-reconnect-banner") appears.
    // Why test reconnect? WS connections drop in production; the UI must degrade gracefully.
    await page.routeWebSocket(/presence/, (ws) => {
      ws.onopen = () => ws.close();
    });

    await page.goto('/projects/demo/board');
    await expect(page.getByTestId(/* TODO 8: 'ws-reconnect-banner' */)).toBeVisible();
  });
});
