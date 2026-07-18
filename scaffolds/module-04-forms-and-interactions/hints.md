# Lesson 04 Hints

## Part 1 — Form Automation & Validation (formerly M20)

### TODO 1.1 — Navigate to the workspace creation form

`page.goto()` accepts any absolute URL. The Lumio workspace creation form lives at `/onboarding/workspace` on `localhost:3000`.

```typescript
await page.goto('http://localhost:3000/onboarding/workspace');
```

---

### TODO 1.2 — Assert the workspace name input is visible

`getByTestId()` looks up an element by its `data-testid` attribute. Chain it with `toBeVisible()` to confirm the element is rendered and not hidden.

```typescript
await expect(page.getByTestId('workspace-name-input')).toBeVisible();
```

---

### TODO 1.3 — Click the submit button without filling any fields

Use `getByTestId()` with the submit button's `data-testid` to locate the button, then call `.click()` on it.

```typescript
await page.getByTestId('workspace-submit-button').click();
```

---

### TODO 1.4 — Assert at least one validation alert is visible

`getByRole('alert')` matches any element with `role="alert"` in the DOM. When multiple validation errors are shown, this locator matches the first one by default — enough to confirm the form rejected the empty submission.

```typescript
await expect(page.getByRole('alert')).toBeVisible();
```

---

### TODO 1.5 — Fill the workspace name input

Pass a string value to `fill()`. Use something unique enough to avoid slug collisions with other tests, but it can be any human-readable workspace name.

```typescript
await page.getByTestId('workspace-name-input').fill('Acme Corp');
```

---

### TODO 1.6 — Select the 'pro' plan from the Radix Select dropdown

After clicking the trigger (`workspace-plan-select`), the floating panel renders the options into the DOM. Each option has a `data-testid` of `workspace-plan-option-{value}`. For the pro plan, that is `workspace-plan-option-pro`.

```typescript
await page.getByTestId('workspace-plan-select').click();
await page.getByTestId('workspace-plan-option-pro').click();
```

---

### TODO 1.7 — Assert the redirect URL after successful submission

After the form submits successfully, Lumio redirects to the next onboarding step. Use `toHaveURL()` with the full expected path.

```typescript
await expect(page).toHaveURL('http://localhost:3000/onboarding/invite');
```

---

### TODO 1.8 — Assert the duplicate slug error message

After submitting a duplicate slug, the server returns an error and the UI renders it inside a `role="alert"` element. Filter the alert by a fragment of the expected error copy to be specific without coupling to the exact full string.

```typescript
await expect(
  page.getByRole('alert').filter({ hasText: 'already taken' })
).toBeVisible();
```

## Part 2 — Dialog & Alert Handling (formerly M21)

### TODO 2.1 — Accept the confirm dialog

Inside the `page.once('dialog')` handler, call `dialog.accept()` to simulate the user clicking OK on the native confirm dialog.

```typescript
page.once('dialog', async (dialog) => {
  await dialog.accept();
});
```

---

### TODO 2.2 — Click the delete workspace button

Use `getByTestId()` with the button's `data-testid` to locate and click the delete trigger.

```typescript
await page.getByTestId('delete-workspace-button').click();
```

---

### TODO 2.3 — Assert redirect to /dashboard

After accepting the delete confirmation, Lumio redirects to the dashboard. Use `toHaveURL()` with the full expected path.

```typescript
await expect(page).toHaveURL('http://localhost:3000/dashboard');
```

---

### TODO 2.4 — Dismiss the confirm dialog

Call `dialog.dismiss()` to simulate the user clicking Cancel. This closes the dialog without confirming the destructive action.

```typescript
page.once('dialog', async (dialog) => {
  await dialog.dismiss();
});
```

---

### TODO 2.5 — Assert the settings page is still visible

The workspace name input being visible confirms the user was not redirected away. Use `getByTestId()` and `toBeVisible()`.

```typescript
await expect(page.getByTestId('workspace-settings-name-input')).toBeVisible();
```

---

### TODO 2.6 — Capture the dialog message

`dialog.message()` returns the string passed to `window.confirm()`. Assign it to the outer variable before accepting.

```typescript
page.once('dialog', async (dialog) => {
  capturedMessage = dialog.message();
  await dialog.accept();
});
```

---

### TODO 2.7 — Assert the captured message contains the expected text

Use `toContain()` to check for a fragment of the expected copy without coupling to the exact full string.

```typescript
expect(capturedMessage).toContain('Are you sure');
```

---

### TODO 2.8 — Accept the beforeunload dialog

Call `dialog.accept()` inside the handler to allow the navigation to continue. Without this, the browser blocks the navigation.

```typescript
page.once('dialog', async (dialog) => {
  beforeunloadMessage = dialog.message();
  await dialog.accept();
});
```

---

### TODO 2.9 — Click a navigation link to trigger beforeunload

Click the dashboard navigation link. The `beforeunload` event fires because the form is dirty, triggering the registered dialog handler before the navigation commits.

```typescript
await page.getByTestId('nav-dashboard-link').click();
```

---

### TODO 2.10 — Assert the beforeunload message

The app sets a specific message in its `beforeunload` handler. Assert it contains the expected copy to confirm the guard is correctly wired.

```typescript
expect(beforeunloadMessage).toContain('You have unsaved changes. Are you sure you want to leave?');
```

## Part 3 — File Upload, Download & PDF (formerly M22)

### TODO 3.1 — file input locator

```typescript
const fileInput = page.getByTestId('attachment-input');
```

### TODO 3.2 — single file

```typescript
await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'sample.txt'));
```

### TODO 3.3 — assert attachment visible

```typescript
await expect(
  page.getByTestId('attachment-item').filter({ hasText: 'sample.txt' })
).toBeVisible();
```

### TODO 3.4 — multiple files

```typescript
await fileInput.setInputFiles([
  path.join(__dirname, 'fixtures', 'sample.txt'),
  path.join(__dirname, 'fixtures', 'sample2.txt'),
]);
```

### TODO 3.5 — count

```typescript
await expect(page.getByTestId('attachment-item')).toHaveCount(2);
```

### TODO 3.6 — clear

```typescript
await fileInput.setInputFiles([]);
await expect(page.getByTestId('attachment-item')).toHaveCount(0);
```

### TODO 3.7 — drag-and-drop zone

```typescript
const dataTransfer = await page.evaluateHandle(() => {
  const dt = new DataTransfer();
  dt.items.add(new File(['content'], 'dropped.txt', { type: 'text/plain' }));
  return dt;
});
await page.dispatchEvent('[data-testid="attachment-dropzone"]', 'drop', { dataTransfer });
await expect(
  page.getByTestId('attachment-item').filter({ hasText: 'dropped.txt' })
).toBeVisible();
```

## Part 4 — Advanced Input & Interactions (formerly M23)

### TODO 4.1 — source card locator

```typescript
const sourceCard = page
  .getByTestId('kanban-column-todo')
  .getByTestId('kanban-card')
  .first();
```

### TODO 4.2 — target column

```typescript
const targetColumn = page.getByTestId('kanban-column-in-progress');
```

### TODO 4.3 — read title before drag

```typescript
const cardTitle = await sourceCard.textContent();
```

### TODO 4.4 — dragTo

```typescript
await sourceCard.dragTo(targetColumn);
```

### TODO 4.5 — assert position

```typescript
await expect(
  targetColumn.getByTestId('kanban-card').filter({ hasText: cardTitle! })
).toBeVisible();
```

### TODO 4.6 — in-progress to done

```typescript
const sourceCard = page.getByTestId('kanban-column-in-progress').getByTestId('kanban-card').first();
const targetColumn = page.getByTestId('kanban-column-done');
```

### TODO 4.7 — revert flow

```typescript
const sourceCard = page.getByTestId('kanban-column-done').getByTestId('kanban-card').first();
const targetColumn = page.getByTestId('kanban-column-todo');
const cardTitle = await sourceCard.textContent();
await sourceCard.dragTo(targetColumn);
await expect(
  targetColumn.getByTestId('kanban-card').filter({ hasText: cardTitle! })
).toBeVisible();
```

### TODO 4.8 — steps

```typescript
await sourceCard.dragTo(targetColumn, { steps: 20 });
```

### Manual mouse fallback

When dragTo fails, use page.mouse for precise control:

```typescript
const box = await sourceCard.boundingBox();
const tgt = await targetColumn.boundingBox();
await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
await page.mouse.down();
await page.mouse.move(tgt!.x + tgt!.width / 2, tgt!.y + 50, { steps: 20 });
await page.mouse.up();
```

## Part 5 — iFrame & Shadow DOM (formerly M24)

### TODO 5.1 — FrameLocator

```typescript
const previewFrame = page.frameLocator('[data-testid="card-preview-frame"]');
```

### TODO 5.2 — heading inside frame

```typescript
await expect(previewFrame.getByRole('heading')).toBeVisible();
```

### TODO 5.3 — named frame

```typescript
const frame = page.frame({ name: 'embed-form-frame' });
await frame!.getByLabel('Comment').fill('Hello from iframe');
await frame!.getByRole('button', { name: 'Submit' }).click();
await expect(frame!.getByText('Submitted')).toBeVisible();
```

### TODO 5.4 — TipTap fill

```typescript
const editor = page.getByTestId('tiptap-editor').getByRole('textbox');
await editor.fill('Hello TipTap');
await expect(editor).toHaveText('Hello TipTap');
```

### TODO 5.5 — bold formatting

```typescript
await editor.fill('Bold me');
await editor.press('Control+A');
await editor.press('Control+B');
await expect(editor.locator('strong')).toBeVisible();
```

### FrameLocator vs page.frame()

| | FrameLocator | page.frame() |
|---|---|---|
| Auto-waiting | Yes | No |
| When to use | Querying/asserting | evaluate(), goto(), events |
