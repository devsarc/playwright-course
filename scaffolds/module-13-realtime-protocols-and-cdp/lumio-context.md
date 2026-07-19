# Lumio Context: Lesson 13

## Part 1 — WebSocket Deep Dive (formerly M60)

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

## Part 2 — SSE & Streaming (formerly M61)

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

## Part 3 — CDP Direct Access (formerly M62)

## What's in Lumio at this point

M62 uses the full Lumio dashboard as its target. The dashboard is JS-heavy (React, Recharts, TipTap) and loads several CSS files (Tailwind, Radix UI primitives). This makes it a realistic target for coverage and performance measurement.

## Coverage use case

The Lumio team wants to identify dead CSS before a major UI refactor. By running CSS rule usage tracking on a full user journey (dashboard → create task → open task detail), they can identify which Tailwind utilities are never applied and prune them from the bundle. JS function coverage on the same journey reveals which utility functions in `lib/` are never invoked.

## Performance use case

Before deploying a performance improvement to the dashboard (lazy-loading charts), the team uses CDP network throttling to simulate 3G conditions and establish a baseline LCP. After the optimization, they rerun under the same conditions and compare. CDP's precise throttle parameters make the comparison reproducible — unlike real network variability.

## CDP vs page.coverage

`page.coverage.startJSCoverage()` is Playwright's convenience wrapper for the exact same CDP calls. Use `page.coverage` for simple JS coverage collection. Use `client.send('Profiler...')` directly when:
- You need to run coverage in the same CDP session as other domains (e.g., CSS coverage at the same time)
- You need the raw `Profiler` output format (Istanbul-compatible source maps, per-range coverage)
- You're collecting coverage data that `page.coverage` doesn't expose
