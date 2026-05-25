# M24 Hints

## TODO 1 — FrameLocator

```typescript
const previewFrame = page.frameLocator('[data-testid="card-preview-frame"]');
```

## TODO 2 — heading inside frame

```typescript
await expect(previewFrame.getByRole('heading')).toBeVisible();
```

## TODO 3 — named frame

```typescript
const frame = page.frame({ name: 'embed-form-frame' });
await frame!.getByLabel('Comment').fill('Hello from iframe');
await frame!.getByRole('button', { name: 'Submit' }).click();
await expect(frame!.getByText('Submitted')).toBeVisible();
```

## TODO 4 — TipTap fill

```typescript
const editor = page.getByTestId('tiptap-editor').getByRole('textbox');
await editor.fill('Hello TipTap');
await expect(editor).toHaveText('Hello TipTap');
```

## TODO 5 — bold formatting

```typescript
await editor.fill('Bold me');
await editor.press('Control+A');
await editor.press('Control+B');
await expect(editor.locator('strong')).toBeVisible();
```

## FrameLocator vs page.frame()

| | FrameLocator | page.frame() |
|---|---|---|
| Auto-waiting | Yes | No |
| When to use | Querying/asserting | evaluate(), goto(), events |
