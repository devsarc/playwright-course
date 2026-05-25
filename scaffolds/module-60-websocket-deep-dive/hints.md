# M60 Hints

## TODO 1 — routeWebSocket URL pattern

```typescript
await page.routeWebSocket('**/ws', ws => {
  ws.send(JSON.stringify({ type: 'task.created', taskId: 'task-1' }));
});
```

`'**/ws'` is a glob that matches any host with the path `/ws` — the same syntax as `page.route()`. The handler fires as soon as the page opens the WebSocket connection, before any frames are exchanged.

## TODO 2 — Assert at least one frame received

```typescript
expect(received.length).toBeGreaterThan(0);
```

The mock sends one frame immediately on connection. After the `waitForTimeout`, at least one frame should be in the array.

## TODO 3 — Assert event type field

```typescript
expect(lastFrame?.type).toBe('task.created');
```

`JSON.parse(frame.payload as string)` turns the raw string into a JS object. The `?.` optional chain handles the case where parsing failed (lastFrame remains null).

## TODO 4 — Register onMessage handler

```typescript
ws.onMessage(message => {
  serverReceived.push(message as string);
});
```

`ws.onMessage()` is the route handler's counterpart to the page's `ws.on('framesent')`. It receives browser→server messages — the bidirectional complement to `ws.send()`.

## TODO 5 — Assert messages received

```typescript
expect(serverReceived.length).toBeGreaterThan(0);
```

Lumio sends a `subscribe` message when the WS connection opens. The 500ms wait is enough for this initial handshake.

## TODO 6 — Bridge API name

```typescript
const bridgeApi = 'page.evaluate';
```

`page.evaluate()` serializes a function, sends it into the browser's V8 context, executes it, and returns the serialized result. It's the only way to invoke browser-side JavaScript objects (like `window.__ws`) from Node.js test code.

## TODO 7 — Capture WS URL

```typescript
wsUrl = ws.url();
```

`ws.url()` returns the full WebSocket URL, e.g. `ws://localhost:3000/ws`. The `page.on('websocket')` handler fires before any frames are exchanged — a good place to capture the URL.

## TODO 8 — Assert URL contains path

```typescript
expect(wsUrl).toContain('/ws');
```

## TODO 9 — routeWebSocket URL for reconnect test

```typescript
await page.routeWebSocket('**/ws', ws => {
  connectionCount++;
  ws.close();
});
```

`ws.close()` sends a WebSocket close frame with the default 1000 (Normal Closure) code. This triggers the app's `onclose` handler, which starts the reconnect timer.

## TODO 10 — Assert connectionCount > 1

```typescript
expect(connectionCount).toBeGreaterThan(1);
```

The Lumio WS client retries after a close event with exponential backoff. After 3 seconds, the client will have made at least one reconnect attempt — so `connectionCount` should be 2 or more.
