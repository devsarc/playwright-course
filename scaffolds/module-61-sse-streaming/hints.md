# M61 Hints

## TODO 1 — Route the SSE endpoint

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

## TODO 2 — Assert feed item count

```typescript
await expect(feedItems).toHaveCount(3);
```

SSE_BODY contains three events (two `task.created`, one `task.updated`). The activity feed should render one item per event — three total.

## TODO 3 — Assert first item text

```typescript
await expect(firstItem).toContainText('Fix login bug');
```

The first event in `SSE_BODY` has `title: "Fix login bug"`. Asserting the first feed item matches this verifies the ordering is preserved.

## TODO 4 — Assert Content-Type

```typescript
expect(contentType).toContain('text/event-stream');
```

The browser's `EventSource` silently refuses responses that don't carry `text/event-stream`. If the app sends events but nothing shows up, always check this header first.

## TODO 5 — Capture Last-Event-ID header

```typescript
lastEventId = route.request().headers()['last-event-id'] ?? '';
```

Header names in Playwright are lowercased. The spec says the browser sends `Last-Event-ID` but Playwright normalizes headers to lowercase, so use `'last-event-id'`.

## TODO 6 — Assert last event ID value

```typescript
expect(lastEventId).toBe('3');
```

The last `id:` line in `SSE_BODY` is `id: 3`. After the stream ends and `EventSource` reconnects, it sends `Last-Event-ID: 3` so the server can resume from the next event.

## TODO 7 — SSE browser API

```typescript
const sseApi = 'EventSource';
```

`EventSource` is the browser's built-in SSE client. It automatically handles reconnection, parses the `id:/event:/data:` format, and fires DOM events (`message`, `error`, and named event types).

## TODO 8 — Assert taskId in array

```typescript
expect(taskIds).toContain('t1');
```

`evaluateAll()` runs the callback for every matched element and returns a serializable value. Checking that the array `includes` the expected value is more resilient than asserting index position.
