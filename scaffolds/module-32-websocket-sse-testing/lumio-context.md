# Lumio Context: M32

## WebSocket in Lumio

Endpoint: `wss://localhost:3000/api/presence`

| Event | Direction | Payload |
|-------|-----------|---------|
| `user_joined` | Server to Client | `{ type, userId, name, boardId }` |
| `user_left` | Server to Client | `{ type, userId }` |
| `cursor_move` | Client to Server | `{ type, x, y }` |

## UI elements

| Element | data-testid | Trigger |
|---------|-------------|---------|
| Presence bar | `presence-indicator` | WS connected |
| User avatar | `presence-avatar` | user_joined received |
| Reconnect banner | `ws-reconnect-banner` | WS connection lost |

## Where to find this in the code

```
lumio/lib/presence/usePresence.ts      -> WS lifecycle hook
lumio/components/board/PresenceBar.tsx -> renders presence-indicator and avatars
```
