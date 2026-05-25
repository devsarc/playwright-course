# Lumio Context: M31

## Real-time collaboration in Lumio

Lumio uses WebSocket presence events to sync board state across sessions.
When User A adds a card, the server broadcasts a board_updated event and
all connected clients re-fetch or patch their local state.

## Auth state files

The fixture auth files at `tests/fixtures/auth/` are created by the global
setup script (M08). For multi-user tests you need two separate saved states:

- `user-a.json` — logged in as alice@lumio.test
- `user-b.json` — logged in as bob@lumio.test

If these don't exist, add a second user to the global setup.

## Key testids

| Element | data-testid |
|---------|-------------|
| Add card button | `add-card-button` |
| New card input | `new-card-input` |
| Kanban card | `kanban-card` |
| Presence avatar | `presence-avatar` |

## Context vs Page

| | BrowserContext | Page |
|---|---|---|
| Analogy | Browser profile | Browser tab |
| Cookies shared | Within same context | N/A |
| Auth state | Per context | Inherits from context |
| Create via | `browser.newContext()` | `context.newPage()` |
