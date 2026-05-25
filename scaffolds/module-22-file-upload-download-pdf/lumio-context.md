# Lumio Context: M22

## File upload in Lumio

Route: Card detail panel (opens on card click).

| Element | data-testid | Type |
|---------|-------------|------|
| File input | `attachment-input` | `<input type="file" multiple>` |
| Drop zone | `attachment-dropzone` | `<div>` listening to drop event |
| Attachment row | `attachment-item` | rendered after upload |

## Where to find this in the code

```
lumio/components/kanban/CardDetailPanel.tsx
  -> AttachmentInput    (input[type=file])
  -> AttachmentDropzone (div + drop handler)
  -> AttachmentList -> AttachmentItem x N
```

## Test fixtures

Create small files under `tests/module-25-file-upload/fixtures/`:
- `sample.txt` — any plain text
- `sample2.txt` — second file for multi-upload test
