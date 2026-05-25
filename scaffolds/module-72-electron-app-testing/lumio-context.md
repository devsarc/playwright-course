# Lumio Context: M72

## Lumio Electron client

Location: `lumio-electron/` — a separate Electron wrapper around the Lumio web app.

The Electron app embeds a Chromium renderer that loads the bundled Next.js export.
It does NOT connect to the running Next.js dev server — it loads a static export.

## Build before testing

```bash
cd lumio-electron
npm run build    # produces out/lumio-electron
```

Set `ELECTRON_APP_PATH` env var if the binary is elsewhere.

## Key windows

| Window | Shows when |
|--------|------------|
| Login window | App starts, no session saved |
| Board window | Logged in, project selected |

## Preload script

`lumio-electron/preload.js` exposes safe IPC APIs to the renderer.
In tests, you can assert IPC calls via `electronApp.evaluate({ ipcMain })`.
