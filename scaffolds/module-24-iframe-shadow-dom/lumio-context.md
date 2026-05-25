# Lumio Context: M24

## iFrames in Lumio

| Page | iframe | Selector |
|------|--------|----------|
| Card detail panel | Preview of card content | `[data-testid="card-preview-frame"]` |
| Embed form page | Third-party form embed | `name="embed-form-frame"` |

## TipTap editor

Location: `lumio/components/editor/TipTapEditor.tsx`

TipTap renders a `contenteditable` div, not an iframe. Access via:

```
[data-testid="tiptap-editor"] -> [role="textbox"]
```

Keyboard shortcuts: Control+B bold, Control+I italic, Control+Z undo.
