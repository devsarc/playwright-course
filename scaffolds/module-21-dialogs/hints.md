# M21 Hints — Dialog & Alert Handling

## TODO 1 — Accept the confirm dialog

Inside the `page.once('dialog')` handler, call `dialog.accept()` to simulate the user clicking OK on the native confirm dialog.

```typescript
page.once('dialog', async (dialog) => {
  await dialog.accept();
});
```

---

## TODO 2 — Click the delete workspace button

Use `getByTestId()` with the button's `data-testid` to locate and click the delete trigger.

```typescript
await page.getByTestId('delete-workspace-button').click();
```

---

## TODO 3 — Assert redirect to /dashboard

After accepting the delete confirmation, Lumio redirects to the dashboard. Use `toHaveURL()` with the full expected path.

```typescript
await expect(page).toHaveURL('http://localhost:3000/dashboard');
```

---

## TODO 4 — Dismiss the confirm dialog

Call `dialog.dismiss()` to simulate the user clicking Cancel. This closes the dialog without confirming the destructive action.

```typescript
page.once('dialog', async (dialog) => {
  await dialog.dismiss();
});
```

---

## TODO 5 — Assert the settings page is still visible

The workspace name input being visible confirms the user was not redirected away. Use `getByTestId()` and `toBeVisible()`.

```typescript
await expect(page.getByTestId('workspace-settings-name-input')).toBeVisible();
```

---

## TODO 6 — Capture the dialog message

`dialog.message()` returns the string passed to `window.confirm()`. Assign it to the outer variable before accepting.

```typescript
page.once('dialog', async (dialog) => {
  capturedMessage = dialog.message();
  await dialog.accept();
});
```

---

## TODO 7 — Assert the captured message contains the expected text

Use `toContain()` to check for a fragment of the expected copy without coupling to the exact full string.

```typescript
expect(capturedMessage).toContain('Are you sure');
```

---

## TODO 8 — Accept the beforeunload dialog

Call `dialog.accept()` inside the handler to allow the navigation to continue. Without this, the browser blocks the navigation.

```typescript
page.once('dialog', async (dialog) => {
  beforeunloadMessage = dialog.message();
  await dialog.accept();
});
```

---

## TODO 9 — Click a navigation link to trigger beforeunload

Click the dashboard navigation link. The `beforeunload` event fires because the form is dirty, triggering the registered dialog handler before the navigation commits.

```typescript
await page.getByTestId('nav-dashboard-link').click();
```

---

## TODO 10 — Assert the beforeunload message

The app sets a specific message in its `beforeunload` handler. Assert it contains the expected copy to confirm the guard is correctly wired.

```typescript
expect(beforeunloadMessage).toContain('You have unsaved changes. Are you sure you want to leave?');
```
