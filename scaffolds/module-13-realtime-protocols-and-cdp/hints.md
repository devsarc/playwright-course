# Lesson 13 Hints

## Part 1 — WebSocket Deep Dive (formerly M60)

## TODO 1.1 — routeWebSocket URL pattern

```typescript
await page.routeWebSocket('**/ws', ws => {
  ws.send(JSON.stringify({ type: 'task.created', taskId: 'task-1' }));
});
```

`'**/ws'` is a glob that matches any host with the path `/ws` — the same syntax as `page.route()`. The handler fires as soon as the page opens the WebSocket connection, before any frames are exchanged.

## TODO 1.2 — Assert at least one frame received

```typescript
expect(received.length).toBeGreaterThan(0);
```

The mock sends one frame immediately on connection. After the `waitForTimeout`, at least one frame should be in the array.

## TODO 1.3 — Assert event type field

```typescript
expect(lastFrame?.type).toBe('task.created');
```

`JSON.parse(frame.payload as string)` turns the raw string into a JS object. The `?.` optional chain handles the case where parsing failed (lastFrame remains null).

## TODO 1.4 — Register onMessage handler

```typescript
ws.onMessage(message => {
  serverReceived.push(message as string);
});
```

`ws.onMessage()` is the route handler's counterpart to the page's `ws.on('framesent')`. It receives browser→server messages — the bidirectional complement to `ws.send()`.

## TODO 1.5 — Assert messages received

```typescript
expect(serverReceived.length).toBeGreaterThan(0);
```

Lumio sends a `subscribe` message when the WS connection opens. The 500ms wait is enough for this initial handshake.

## TODO 1.6 — Bridge API name

```typescript
const bridgeApi = 'page.evaluate';
```

`page.evaluate()` serializes a function, sends it into the browser's V8 context, executes it, and returns the serialized result. It's the only way to invoke browser-side JavaScript objects (like `window.__ws`) from Node.js test code.

## TODO 1.7 — Capture WS URL

```typescript
wsUrl = ws.url();
```

`ws.url()` returns the full WebSocket URL, e.g. `ws://localhost:3000/ws`. The `page.on('websocket')` handler fires before any frames are exchanged — a good place to capture the URL.

## TODO 1.8 — Assert URL contains path

```typescript
expect(wsUrl).toContain('/ws');
```

## TODO 1.9 — routeWebSocket URL for reconnect test

```typescript
await page.routeWebSocket('**/ws', ws => {
  connectionCount++;
  ws.close();
});
```

`ws.close()` sends a WebSocket close frame with the default 1000 (Normal Closure) code. This triggers the app's `onclose` handler, which starts the reconnect timer.

## TODO 1.10 — Assert connectionCount > 1

```typescript
expect(connectionCount).toBeGreaterThan(1);
```

The Lumio WS client retries after a close event with exponential backoff. After 3 seconds, the client will have made at least one reconnect attempt — so `connectionCount` should be 2 or more.

## Part 2 — SSE & Streaming (formerly M61)

## TODO 2.1 — Route the SSE endpoint

```typescript
await page.route('**/api/activity-stream', route => {
  route.fulfill({
    status: 200,
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    body: SSE_BODY,
  });
});
```

`page.route()` intercepts any HTTP request matching the glob. SSE is just HTTP with a long-lived body — `route.fulfill()` with `Content-Type: text/event-stream` is all you need to simulate an SSE server.

## TODO 2.2 — Assert feed item count

```typescript
await expect(feedItems).toHaveCount(3);
```

SSE_BODY contains three events (two `task.created`, one `task.updated`). The activity feed should render one item per event — three total.

## TODO 2.3 — Assert first item text

```typescript
await expect(firstItem).toContainText('Fix login bug');
```

The first event in `SSE_BODY` has `title: "Fix login bug"`. Asserting the first feed item matches this verifies the ordering is preserved.

## TODO 2.4 — Assert Content-Type

```typescript
expect(contentType).toContain('text/event-stream');
```

The browser's `EventSource` silently refuses responses that don't carry `text/event-stream`. If the app sends events but nothing shows up, always check this header first.

## TODO 2.5 — Capture Last-Event-ID header

```typescript
lastEventId = route.request().headers()['last-event-id'] ?? '';
```

Header names in Playwright are lowercased. The spec says the browser sends `Last-Event-ID` but Playwright normalizes headers to lowercase, so use `'last-event-id'`.

## TODO 2.6 — Assert last event ID value

```typescript
expect(lastEventId).toBe('3');
```

The last `id:` line in `SSE_BODY` is `id: 3`. After the stream ends and `EventSource` reconnects, it sends `Last-Event-ID: 3` so the server can resume from the next event.

## TODO 2.7 — SSE browser API

```typescript
const sseApi = 'EventSource';
```

`EventSource` is the browser's built-in SSE client. It automatically handles reconnection, parses the `id:/event:/data:` format, and fires DOM events (`message`, `error`, and named event types).

## TODO 2.8 — Assert taskId in array

```typescript
expect(taskIds).toContain('t1');
```

`evaluateAll()` runs the callback for every matched element and returns a serializable value. Checking that the array `includes` the expected value is more resilient than asserting index position.

## Part 3 — CDP Direct Access (formerly M62)

## TODO 3.1 — Open a CDP session

```typescript
const client = await page.context().newCDPSession(page);
```

`newCDPSession()` opens a raw Chrome DevTools Protocol session scoped to a specific page. It returns a `CDPSession` object whose only method you'll use is `send(method, params?)`.

## TODO 3.2 — Assert client type

```typescript
expect(typeof client).toBe('object');
```

## TODO 3.3 — Enable the Profiler domain

```typescript
await client.send('Profiler.enable');
```

CDP is organized into domains (Network, Profiler, CSS, Page…). Each domain must be enabled before you can call its methods. Failing to enable a domain produces a "Domain not enabled" protocol error.

## TODO 3.4 — Start precise coverage

```typescript
await client.send('Profiler.startPreciseCoverage', { callCount: false, detailed: true });
```

`detailed: true` gives you per-function coverage ranges (start/end character positions). `callCount: false` skips per-invocation counts — cheaper if you only need used/unused.

## TODO 3.5 — Take precise coverage

```typescript
const { result } = await client.send('Profiler.takePreciseCoverage');
```

`result` is an array of `ScriptCoverage` objects. Each has a `url` (script origin) and `functions` array with `ranges` showing used vs unused character ranges.

## TODO 3.6 — Assert result length

```typescript
expect(result.length).toBeGreaterThan(0);
```

## TODO 3.7 — Start CSS rule usage tracking

```typescript
await client.send('CSS.startRuleUsageTracking');
```

The CSS domain must be enabled first (`CSS.enable`). Usage tracking captures which CSS rules were applied to the DOM during the session.

## TODO 3.8 — Assert ruleUsage length

```typescript
expect(ruleUsage.length).toBeGreaterThan(0);
```

## TODO 3.9 — Emulate 3G network conditions

```typescript
await client.send('Network.emulateNetworkConditions', {
  offline: false,
  downloadThroughput: 375 * 1024 / 8,  // 375 kbps
  uploadThroughput: 125 * 1024 / 8,
  latency: 100,
});
```

The throughput values are in bytes per second. 375 kbps / 8 converts kilobits to bytes. These values approximate the "Slow 3G" preset in Chrome DevTools.

## TODO 3.10 — Assert load time under throttle

```typescript
expect(loadTime).toBeGreaterThan(100);
```

Even the 100ms latency in the emulated conditions will push `domcontentloaded` past 100ms. On a real slow network, expect 2–5 seconds.

## TODO 3.11 — CDP guard browser name

```typescript
const cdpBrowser = 'chromium';
```

Always guard CDP tests with `test.skip(browserName !== 'chromium', 'CDP is Chromium-only')`. Firefox uses its own DevTools protocol; WebKit uses a different automation interface. Calling `newCDPSession()` on either will throw.
