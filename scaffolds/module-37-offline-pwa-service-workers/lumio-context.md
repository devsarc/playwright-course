# Lumio Context: M37

## Lumio PWA setup

Lumio is configured as a PWA using `next-pwa`:
- `public/sw.js` — the generated service worker
- `public/manifest.json` — the web app manifest
- The SW caches the app shell and recent board API responses

## Offline UI

When `navigator.onLine === false`, Lumio renders:
- `data-testid="offline-banner"` — a top banner indicating offline state

The SW serves cached assets so the board structure remains visible.
Write operations (add/move card) are queued and synced on reconnect.

## Where to find this in the code

```
lumio/next.config.js            -> next-pwa configuration
lumio/components/OfflineBanner.tsx -> data-testid="offline-banner"
public/sw.js                    -> generated; do not edit directly
```

## Service worker activation timing

After `page.goto('/')`, the SW may take 500-2000ms to activate. The
`context.waitForEvent('serviceworker')` pattern is the reliable way to
wait for it; `waitForTimeout` is used as a pragmatic fallback when the
event has already fired.
