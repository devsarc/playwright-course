# Lumio Context: M61

## What's in Lumio at this point

Lumio uses SSE for its activity feed — a sidebar panel on the dashboard that shows a chronological stream of project events: task creations, status changes, comments, and member joins. The SSE endpoint is `GET /api/activity-stream`.

The activity feed component (`components/ActivityFeed.tsx`) creates an `EventSource` pointing at `/api/activity-stream` and appends a new list item on each message. Each item carries `data-task-id` and `data-event-type` attributes for test targeting.

## The SSE/WebSocket split in Lumio

Lumio uses both SSE and WebSocket for different purposes:

| Feature | Protocol | Reason |
|---------|----------|--------|
| Activity feed | SSE | Push-only, HTTP-compatible, auto-reconnect |
| Board collaboration (cursor presence, card moves) | WebSocket | Bidirectional — client sends cursor position |
| In-app notifications | WebSocket | Triggered by user action + server confirmation needed |

## Reconnect behavior

`EventSource` reconnects automatically after a network drop or server close. The default reconnect delay is 3 seconds (overridable by the server via `retry:` lines in the stream). When reconnecting, the browser sends the `Last-Event-ID` header so the server can resume the stream from the last received event — preventing missed events during brief disconnections.

The Lumio SSE server respects `Last-Event-ID` and replays events from that point using its in-memory event buffer (last 100 events).
