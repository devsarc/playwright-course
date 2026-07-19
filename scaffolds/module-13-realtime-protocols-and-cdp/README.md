# Lesson 13: WebSocket, SSE & CDP Deep Dive

*Combines former modules M60–M62.*

## Learning Objectives

### Part 1 — WebSocket Deep Dive (formerly M60)

- Assert the exact JSON payload of a Lumio WebSocket collaboration event
- Mock the WebSocket server with `page.routeWebSocket()` for deterministic edge-case testing
- Use `page.evaluate()` to send WebSocket messages from the browser context
- Test connection drop and reconnect sequences in isolation

### Part 2 — SSE & Streaming (formerly M61)

- Intercept and assert Server-Sent Events from Lumio's activity feed
- Assert event ordering from an SSE stream
- Test SSE reconnection behavior after connection drop
- Understand when to choose SSE over WebSocket in architecture decisions

### Part 3 — CDP Direct Access (formerly M62)

- Open a CDP session on a Playwright page and call CDP methods directly
- Collect JavaScript and CSS coverage via CDP on the Lumio dashboard
- Throttle the network to 3G via CDP and measure the LCP impact
- Understand when to reach for CDP instead of Playwright's built-in APIs

## Concept

### Part 1 — WebSocket Deep Dive (formerly M60)

Lesson 06 (formerly M32) introduced WebSocket testing at the delivery level: you asserted that a notification arrived within a timeout. That's the right starting point — delivery is the most common failure mode. M60 goes a level deeper: **payload correctness and protocol edge cases**.

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

### Part 2 — SSE & Streaming (formerly M61)

Server-Sent Events (SSE) is HTTP's built-in streaming mechanism: a single long-lived GET request over which the server pushes newline-delimited text events. The browser's `EventSource` API receives them. Unlike WebSocket, SSE is strictly one-directional — server to client — which makes it simpler, more cache-friendly, and better suited for push-only scenarios like activity feeds, live notifications, and progress updates.

**The SSE wire format.**

SSE uses a plain text protocol over HTTP. Each event is a block of lines separated by a blank line:

```
id: evt-1
event: task.created
data: {"taskId":"task-abc","title":"Fix login bug"}

id: evt-2
event: task.updated
data: {"taskId":"task-abc","status":"in_progress"}

```

The `event:` line names the event type. The `data:` line carries the payload. The `id:` line provides the last event ID — used by `EventSource` to request missed events after a reconnect via the `Last-Event-ID` request header.

**Testing SSE with Playwright.**

Playwright's `page.route()` intercepts HTTP requests, including the SSE endpoint. You can fulfill the request with a manually crafted SSE response:

```typescript
await page.route('**/api/activity-stream', route => {
  route.fulfill({
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
    body: [
      'id: 1\nevent: task.created\ndata: {"taskId":"t1"}\n\n',
      'id: 2\nevent: task.updated\ndata: {"taskId":"t1","status":"done"}\n\n',
    ].join(''),
  });
});
```

This replaces the live SSE endpoint with a deterministic mock, giving you full control over the event sequence, ordering, and timing.

**Event ordering assertions.**

Order matters in activity feeds: a "task created" event must arrive before a "task updated" event for the same task, or the client renders stale state. Mock SSE lets you assert order explicitly:

```typescript
const events: string[] = [];
page.on('response', response => {
  if (response.url().includes('/api/activity-stream')) {
    response.body().then(body => {
      // parse the event types from the body
    });
  }
});
```

Or, more directly, assert the DOM order after the events are rendered — "does the first item in the activity feed correspond to the first SSE event?"

**SSE reconnection.**

`EventSource` reconnects automatically after a connection drop. The browser sends `Last-Event-ID` on the reconnect request, and a well-implemented server resumes from that point. You can test this by:

1. Fulfilling the first request with a short event stream followed by a 200 response that doesn't close immediately
2. Intercepting the reconnect request and asserting the `Last-Event-ID` header value

```typescript
let reconnectLastEventId = '';

await page.route('**/api/activity-stream', route => {
  reconnectLastEventId = route.request().headers()['last-event-id'] ?? '';
  route.fulfill({ /* ... */ });
});
```

After the initial stream ends, `EventSource` reconnects and the second request carries the last seen event ID.

**SSE vs WebSocket: the decision framework.**

The choice is architectural, not technical — both can deliver real-time data:

| Factor | SSE | WebSocket |
|--------|-----|-----------|
| Direction | Server→client only | Bidirectional |
| Protocol | HTTP/1.1+ | Separate WS protocol |
| Reconnect | Automatic (EventSource) | Manual, app-level |
| Proxy/CDN support | Excellent | Requires WS upgrade support |
| Use case | Push feeds, progress bars, notifications | Chat, collaboration cursors, gaming |

Lumio uses SSE for the activity feed (server pushes events, no client messages needed) and WebSocket for real-time board collaboration (bidirectional: client sends cursor position, server broadcasts).

### Part 3 — CDP Direct Access (formerly M62)

The Chrome DevTools Protocol (CDP) is the wire protocol that the Chrome DevTools UI uses internally — and that Playwright uses to drive Chromium. Most of the time Playwright wraps CDP calls in high-level APIs (`page.goto()`, `page.evaluate()`, `page.route()`). But for capabilities that Playwright hasn't wrapped yet — or where you need finer control than the wrapper provides — you can open a CDP session and call the protocol directly.

**When CDP is the right tool.**

CDP is an escape hatch. Before reaching for it, check whether Playwright has a built-in API. CDP access is Chromium-only, which breaks cross-browser runs. The common cases where CDP adds genuine value:

- **Coverage data at the protocol level.** `page.coverage` (Lesson 05 (formerly M29)) was the concept; CDP is the mechanism — `Profiler.enable` + `Profiler.startPreciseCoverage` collect per-function JS coverage; `CSS.startRuleUsageTracking` collects CSS rule usage.
- **Network conditions.** CDP's `Network.emulateNetworkConditions` can simulate any combination of bandwidth, latency, and packet loss — more granular than `context.setOffline()`.
- **CDP events not exposed by Playwright.** Raw `Page.frameNavigated` events, `Network.webSocketFrameSent`, low-level JavaScript debugger events.

**Opening a CDP session.**

```typescript
const client = await page.context().newCDPSession(page);
```

`newCDPSession()` returns a `CDPSession` object. You call CDP domains and methods via `client.send(method, params)`:

```typescript
await client.send('Profiler.enable');
await client.send('Profiler.startPreciseCoverage', { callCount: false, detailed: true });

// ...navigate and interact...

const coverage = await client.send('Profiler.takePreciseCoverage');
await client.send('Profiler.stopPreciseCoverage');
await client.send('Profiler.disable');
```

The return value is typed — `coverage.result` is an array of `ScriptCoverage` objects. Each contains `url` (the script origin) and `functions` (coverage per function and range).

**CSS coverage.**

CSS coverage tracks which CSS rules were applied during a page's lifetime — useful for identifying dead CSS that ships to users:

```typescript
await client.send('CSS.enable');
await client.send('CSS.startRuleUsageTracking');

// ...navigate and interact...

const { ruleUsage } = await client.send('CSS.takeCoverageDelta');
await client.send('CSS.stopRuleUsageTracking');
```

`ruleUsage` is an array of `RuleUsage` records with `used: boolean` per rule.

**Network throttling via CDP.**

Playwright's `context.setOffline()` is binary — online or offline. CDP's `Network.emulateNetworkConditions` supports granular throttling:

```typescript
await client.send('Network.enable');
await client.send('Network.emulateNetworkConditions', {
  offline: false,
  downloadThroughput: 375 * 1024 / 8,  // 375 kbps = slow 3G
  uploadThroughput: 125 * 1024 / 8,
  latency: 100,
});
```

This is useful for performance testing under simulated mobile network conditions — throttle to 3G, navigate to the dashboard, collect LCP, assert it stays under budget.

**page.coverage vs CDP coverage.**

Lesson 05 (formerly M29) introduced `page.coverage.startJSCoverage()` and `stopJSCoverage()` — Playwright's built-in coverage API. Under the hood, this wraps exactly the CDP calls shown above. The Playwright wrapper is simpler; the CDP calls are necessary when you need the raw `Profiler.takePreciseCoverage` output format, or when you're running coverage alongside other CDP domains in the same session without interference.

**CDP is Chromium-only.**

Firefox and WebKit don't implement CDP. If you use `newCDPSession()` in a cross-browser project config, the test will fail on non-Chromium browsers. Guard CDP tests explicitly:

```typescript
test('coverage via CDP', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'CDP is Chromium-only');
  // ...
});
```

## Lumio Context

See [lumio-context.md](./lumio-context.md).

## Step-by-Step Tasks

### Part 1 — WebSocket Deep Dive

Validate this part only:
```bash
npx playwright test tests/module-13-realtime-protocols-and-cdp -g "Part 1 — WebSocket Deep Dive (formerly M60)"
```

### Part 2 — SSE & Streaming

Validate this part only:
```bash
npx playwright test tests/module-13-realtime-protocols-and-cdp -g "Part 2 — SSE & Streaming (formerly M61)"
```

### Part 3 — CDP Direct Access

Validate this part only:
```bash
npx playwright test tests/module-13-realtime-protocols-and-cdp -g "Part 3 — CDP Direct Access (formerly M62)"
```

## Validate (full lesson)

```bash
npx playwright test tests/module-13-realtime-protocols-and-cdp
```

## Key Takeaways

### Part 1 — WebSocket Deep Dive

1. `ws.on('framereceived')` collects server→browser frames; parse as JSON to assert payload structure.
2. `page.routeWebSocket(pattern, handler)` mocks the server — same glob-pattern API as `page.route()`.
3. `ws.onMessage(handler)` in a route handler receives browser→server frames for bidirectional protocol testing.
4. `page.evaluate()` is the only bridge from Node.js test code to the browser's WebSocket object.
5. Calling `ws.close()` in a `routeWebSocket` handler triggers and tests the app's reconnect logic.

### Part 2 — SSE & Streaming

1. SSE uses `Content-Type: text/event-stream` — intercept with `page.route()` and fulfill manually.
2. Each SSE event block ends with a blank line; the `data:` field carries the payload.
3. Assert event ordering via rendered DOM order — the first card in the activity feed should match the first event.
4. `EventSource` reconnects automatically; the reconnect request carries `Last-Event-ID`.
5. Use SSE for server→client push; use WebSocket when the client also needs to send messages.

### Part 3 — CDP Direct Access

1. `page.context().newCDPSession(page)` opens a raw CDP session — Playwright's escape hatch for Chrome DevTools Protocol access.
2. `client.send(method, params)` calls any CDP domain method and returns typed results.
3. `Profiler.startPreciseCoverage` / `takePreciseCoverage` collects JS function coverage directly via CDP.
4. `Network.emulateNetworkConditions` throttles bandwidth and latency — more granular than `setOffline()`.
5. CDP is Chromium-only — always guard with `test.skip(browserName !== 'chromium')`.

## Going Deeper

### Part 1 — WebSocket Deep Dive

- [Playwright docs: page.routeWebSocket()](https://playwright.dev/docs/api/class-page#page-route-web-socket)
- [Playwright docs: WebSocket](https://playwright.dev/docs/api/class-websocket)
- [Playwright docs: WebSocketRoute](https://playwright.dev/docs/api/class-websocketroute)

### Part 2 — SSE & Streaming

- [MDN: Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
- [Playwright docs: page.route()](https://playwright.dev/docs/api/class-page#page-route)
- [MDN: EventSource.onerror and reconnection](https://developer.mozilla.org/en-US/docs/Web/API/EventSource/error_event)

### Part 3 — CDP Direct Access

- [Playwright docs: CDPSession](https://playwright.dev/docs/api/class-cdpsession)
- [Chrome DevTools Protocol: Profiler domain](https://chromedevtools.github.io/devtools-protocol/tot/Profiler/)
- [Chrome DevTools Protocol: Network domain](https://chromedevtools.github.io/devtools-protocol/tot/Network/)
