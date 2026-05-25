# M32 Hints

## TODO 1 — race-safe websocket capture

```typescript
const [, ws] = await Promise.all([
  page.goto('/projects/demo/board'),
  page.waitForEvent('websocket'),
]);
```

## TODO 2 — URL assertion

```typescript
expect(ws.url()).toContain('presence');
```

## TODO 3 — presence indicator

```typescript
await expect(page.getByTestId('presence-indicator')).toBeVisible();
```

## TODO 4 — framereceived

```typescript
const frame = await ws.waitForEvent('framereceived');
```

## TODO 5 — parse payload

```typescript
const message = JSON.parse(frame.payload as string);
expect(message).toHaveProperty('type');
```

## TODO 6 — routeWebSocket mock

```typescript
await page.routeWebSocket(/presence/, (ws) => {
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'user_joined', userId: 'u999', name: 'Alice' }));
  };
});
```

## TODO 7 — presence avatar

```typescript
await expect(page.getByTestId('presence-avatar')).toBeVisible();
```

## TODO 8 — reconnect banner

```typescript
await page.routeWebSocket(/presence/, (ws) => {
  ws.onopen = () => ws.close();
});
await page.goto('/projects/demo/board');
await expect(page.getByTestId('ws-reconnect-banner')).toBeVisible();
```
