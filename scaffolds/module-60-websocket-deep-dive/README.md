# M60: WebSocket Deep Dive

## Learning Objectives

- Assert the exact JSON payload of a Lumio WebSocket collaboration event
- Mock the WebSocket server with `page.routeWebSocket()` for deterministic edge-case testing
- Use `page.evaluate()` to send WebSocket messages from the browser context
- Test connection drop and reconnect sequences in isolation

## Concept

M32 introduced WebSocket testing at the delivery level: you asserted that a notification arrived within a timeout. That's the right starting point — delivery is the most common failure mode. M60 goes a level deeper: **payload correctness and protocol edge cases**.

**Two questions, two test layers.**

Delivery testing asks: did the event reach the client? It uses a broad assertion — `await page.getByTestId('notification').waitFor()` — and tests the full stack from server logic through transport to UI rendering. Protocol testing asks: was the payload correct, and does the client behave correctly when the protocol misbehaves? It uses frame-level assertions and a mock server. These two layers fail for different reasons and are best kept separate.

**Frame assertions.**

Playwright's `page.on('websocket')` fires when the page opens a WebSocket connection. The callback receives a `WebSocket` object that emits two frame events:

- `framereceived` — a frame sent by the server to the browser
- `framesent` — a frame sent by the browser to the server

Each frame carries a `payload` property (string or Buffer). Collect frames before navigating, then parse and assert:

```typescript
const frames: string[] = [];
page.on('websocket', ws => {
  ws.on('framereceived', frame => {
    frames.push(frame.payload as string);
  });
});

await page.goto('/dashboard');
// ...trigger real-time event...

const event = frames.map(f => JSON.parse(f)).find(f => f.type === 'task.created');
expect(event?.taskId).toBe('task-abc123');
```

This asserts the wire format — not just that a UI element updated, but that the server sent the correct data structure. A backend team can change a field name from `taskId` to `id` and the UI might still work if the frontend handles both shapes. A frame assertion fails immediately at the contract boundary.

**Mocking with page.routeWebSocket().**

Added in Playwright 1.46, `page.routeWebSocket()` intercepts WebSocket connections by URL pattern — the same mental model as `page.route()` for HTTP. You get a `WebSocketRoute` object that represents the server side of the connection:

```typescript
await page.routeWebSocket('**/ws', ws => {
  ws.onMessage(message => {
    const parsed = JSON.parse(message as string);
    if (parsed.type === 'subscribe') {
      ws.send(JSON.stringify({ type: 'subscribed', channel: parsed.channel }));
    }
  });

  // Proactively push an event to the browser
  ws.send(JSON.stringify({ type: 'task.created', taskId: 'task-1' }));
});
```

The mock runs entirely in Node.js — no separate server process, no port binding, no authentication required. Edge cases that are difficult to reproduce with a real server (sending two events simultaneously, dropping a message silently, closing the connection mid-stream) become trivially controllable.

**Sending messages from the browser.**

The app's WebSocket client is a JavaScript object living inside the browser context. You cannot call `ws.send()` on it from Node.js test code — but you can cross the boundary with `page.evaluate()`:

```typescript
await page.evaluate(() => {
  const ws = (window as any).__ws; // app exposes its WS reference here
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'ping' }));
  }
});
```

This technique is useful when you need to simulate the browser sending a specific message — a heartbeat, an acknowledgment, or a subscription request — without driving through the full UI flow.

**Disconnect and reconnect testing.**

Most production WebSocket clients implement reconnect logic: on close, wait N seconds, try again. Testing this against a real server is unreliable (you'd need to kill and restart the server mid-test). With `page.routeWebSocket()`, you close the mock connection programmatically:

```typescript
let connectionCount = 0;
await page.routeWebSocket('**/ws', ws => {
  connectionCount++;
  ws.close(); // force the client to reconnect
});
```

After `page.goto()` and a wait, `connectionCount > 1` confirms the app reconnected. No server involvement, no timing dependency.

**When frame assertions are the right choice.**

Frame assertions have higher maintenance cost than UI assertions — they're coupled to the wire format, not the user experience. Use them when: the server sends data the UI doesn't directly render (background sync, acknowledgments, presence pings), you're implementing a custom protocol and need contract validation, or you need to verify that a backend change doesn't silently break the client. For user-visible behavior, UI assertions remain the primary tool. Frame tests are a contract boundary layer, not a replacement.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-60-websocket-deep-dive
```

## Key Takeaways

1. `ws.on('framereceived')` collects server→browser frames; parse as JSON to assert payload structure.
2. `page.routeWebSocket(pattern, handler)` mocks the server — same glob-pattern API as `page.route()`.
3. `ws.onMessage(handler)` in a route handler receives browser→server frames for bidirectional protocol testing.
4. `page.evaluate()` is the only bridge from Node.js test code to the browser's WebSocket object.
5. Calling `ws.close()` in a `routeWebSocket` handler triggers and tests the app's reconnect logic.

## Going Deeper

- [Playwright docs: page.routeWebSocket()](https://playwright.dev/docs/api/class-page#page-route-web-socket)
- [Playwright docs: WebSocket](https://playwright.dev/docs/api/class-websocket)
- [Playwright docs: WebSocketRoute](https://playwright.dev/docs/api/class-websocketroute)
