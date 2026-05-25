# M72 Hints

## TODO 1 — electron.launch()

```typescript
const app = await electron.launch({ args: [ELECTRON_APP] });
```

## TODO 2 — firstWindow()

```typescript
const window = await electronApp.firstWindow();
```

## TODO 3 — login heading

```typescript
await expect(window.getByRole('heading', { name: 'Sign in' })).toBeVisible();
```

## TODO 4 — window title

```typescript
await expect(window).toHaveTitle(/Lumio/);
```

## TODO 5 — main process evaluate

```typescript
const platform = await electronApp.evaluate(async ({ app }) => {
  return process.platform;
});
expect(['darwin', 'win32', 'linux']).toContain(platform);
```

## TODO 6 — screenshot

```typescript
const screenshot = await window.screenshot({ path: 'electron-window.png' });
expect(screenshot).toBeTruthy();
```

## Electron vs Browser API differences

| Feature | Browser test | Electron test |
|---------|-------------|---------------|
| Launch | `browser.newContext()` | `electron.launch()` |
| Top-level object | `Browser` | `ElectronApplication` |
| Pages | `context.newPage()` | `app.firstWindow()` / `app.windows()` |
| Main process | N/A | `app.evaluate({ app, ipcMain })` |
| Renderer process | `page.evaluate()` | `window.evaluate()` |
