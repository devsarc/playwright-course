# M61: SSE & Streaming

## Learning Objectives

- Intercept and assert Server-Sent Events from Lumio's activity feed
- Assert event ordering from an SSE stream
- Test SSE reconnection behavior after connection drop
- Understand when to choose SSE over WebSocket in architecture decisions

## Concept

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

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-61-sse-streaming
```

## Key Takeaways

1. SSE uses `Content-Type: text/event-stream` — intercept with `page.route()` and fulfill manually.
2. Each SSE event block ends with a blank line; the `data:` field carries the payload.
3. Assert event ordering via rendered DOM order — the first card in the activity feed should match the first event.
4. `EventSource` reconnects automatically; the reconnect request carries `Last-Event-ID`.
5. Use SSE for server→client push; use WebSocket when the client also needs to send messages.

## Going Deeper

- [MDN: Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
- [Playwright docs: page.route()](https://playwright.dev/docs/api/class-page#page-route)
- [MDN: EventSource.onerror and reconnection](https://developer.mozilla.org/en-US/docs/Web/API/EventSource/error_event)
