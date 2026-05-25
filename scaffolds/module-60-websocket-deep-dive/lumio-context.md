# Lumio Context: M60

## What's in Lumio at this point

M60's branch adds WebSocket mock server infrastructure alongside the existing real-time implementation. The app's WebSocket client (`lib/ws-client.ts`) exposes its connection as `window.__ws` so tests can reach it via `page.evaluate()`. The Lumio backend WebSocket handler lives at `/ws`.

**On connect**, the client sends a subscribe message:
```json
{ "type": "subscribe", "channel": "board:<boardId>" }
```

**Server-to-client event types used by the app:**

| Event type | Payload fields | UI effect |
|------------|---------------|-----------|
| `task.created` | `taskId`, `boardId`, `title` | New card appears on board |
| `card.moved` | `cardId`, `fromColumn`, `toColumn` | Card animates between columns |
| `presence.update` | `userId`, `status` | Avatar indicator updates |
| `notification` | `id`, `message` | Toast notification appears |

## Why frame assertions here

In M32, you tested that a notification appeared in the UI within 2 seconds. That test is correct and valuable. M60's frame assertions serve a different purpose: verifying the wire format contract between the frontend and backend teams.

When the backend renames `taskId` to `id` in the event payload, the UI might still work if the frontend is lenient — but a frame assertion test fails immediately at the contract boundary. Frame tests are the equivalent of API contract tests for WebSocket protocols.

## Reconnect behavior

Lumio's WS client uses exponential backoff: after the first disconnect, it retries after 1 second, then 2 seconds, then 4 seconds. In the reconnect test, `page.routeWebSocket()` closes every connection immediately, so after 3 seconds the client will have made 2–3 attempts. This is testable without modifying the server or controlling network conditions.
