# M22 Hints

## TODO 1 — file input locator

```typescript
const fileInput = page.getByTestId('attachment-input');
```

## TODO 2 — single file

```typescript
await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'sample.txt'));
```

## TODO 3 — assert attachment visible

```typescript
await expect(
  page.getByTestId('attachment-item').filter({ hasText: 'sample.txt' })
).toBeVisible();
```

## TODO 4 — multiple files

```typescript
await fileInput.setInputFiles([
  path.join(__dirname, 'fixtures', 'sample.txt'),
  path.join(__dirname, 'fixtures', 'sample2.txt'),
]);
```

## TODO 5 — count

```typescript
await expect(page.getByTestId('attachment-item')).toHaveCount(2);
```

## TODO 6 — clear

```typescript
await fileInput.setInputFiles([]);
await expect(page.getByTestId('attachment-item')).toHaveCount(0);
```

## TODO 7 — drag-and-drop zone

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
