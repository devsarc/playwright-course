# M32: WebSocket & SSE Testing

## Learning Objectives

- Capture a WebSocket connection with `page.waitForEvent('websocket')`
- Listen for frames with `ws.waitForEvent('framereceived')`
- Mock the server with `page.routeWebSocket()`
- Simulate connection errors to test reconnect UI
- Test SSE (EventSource) streams: intercept with `page.on('response')` and assert event data
- Assert that a real-time notification (WebSocket or SSE) arrives within a time budget using `waitForEvent` with a timeout

## Concept

| Strategy | When to use | API |
|----------|-------------|-----|
| Real WS | Integration tests, happy path | `waitForEvent('websocket')` |
| Mocked WS | Edge cases, error states | `page.routeWebSocket()` |

Race-safe capture pattern:
```typescript
const [, ws] = await Promise.all([
  page.goto('/board'),
  page.waitForEvent('websocket'),
]);
```
Starting the listener before goto() ensures no frame is missed.

## Key Takeaways

1. `Promise.all([goto, waitForEvent('websocket')])` prevents race conditions.
2. `ws.waitForEvent('framereceived')` blocks until the next frame.
3. `page.routeWebSocket()` intercepts before the server — great for error simulation.
4. Parse `frame.payload` — it arrives as a raw string or Buffer, not a JS object.

> **Note — M32 vs M60/M61:** M32 introduces the basic patterns for both WebSocket and SSE delivery testing. M60 (WebSocket Deep Dive) covers payload content assertions and mock WebSocket servers for edge cases. M61 (SSE & Streaming) covers SSE reconnection, ordering, and the SSE vs WebSocket decision framework.

> **SSE testing pattern:**
> ```typescript
> const sseResponse = await page.waitForResponse(res =>
>   res.url().includes('/api/activity') && res.headers()['content-type']?.includes('text/event-stream')
> );
> // EventSource uses repeated response chunks — assert on page state rather than raw frames
> ```

## Going Deeper

- [Playwright docs: WebSocket mocking](https://playwright.dev/docs/network#websocket-mocking)
