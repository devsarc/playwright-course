# M24: iFrame & Shadow DOM

## Learning Objectives

- Use `page.frameLocator()` for auto-waiting, locator-scoped iframe access
- Use `page.frame()` for Frame-object-level operations
- Interact with TipTap (contenteditable) using `fill()` and keyboard shortcuts
- Navigate nested iframes using chained `frameLocator()` calls: `page.frameLocator('#outer').frameLocator('#inner')`
- Interact with Shadow DOM using `locator.locator(':shadow *')` piercing syntax
- Explain cross-origin iframe limitations: Playwright cannot interact with a cross-origin iframe's DOM; describe the workaround (route the iframe origin via `page.route()` or use `addInitScript` on the outer page)

## Concept

**`page.frameLocator(selector)`** — recommended for most work:
```typescript
const frame = page.frameLocator('iframe');
await frame.getByRole('button').click();
```

**`page.frame({ name })`** — when you need Frame methods:
```typescript
const frame = page.frame({ name: 'my-frame' });
await frame.evaluate(() => window.scrollTo(0, 0));
```

**contenteditable (TipTap)** — not an iframe:
```typescript
await page.getByRole('textbox').fill('content');
await page.keyboard.press('Control+B');
```

**Shadow DOM:**
```typescript
// Pierce into a shadow root
const shadowInput = page.locator('my-custom-element').locator('input');
// Playwright automatically pierces open shadow roots for locator queries
await shadowInput.fill('value');
```
Playwright pierces **open** shadow roots automatically. Closed shadow roots (`mode: 'closed'`) are inaccessible by design — no workaround exists.

## Key Takeaways

1. `frameLocator` is the modern, auto-waiting API — prefer it.
2. `page.frame()` is needed for Frame-specific methods like `evaluate()`.
3. TipTap is a contenteditable div — `fill()` and keyboard shortcuts work normally.
4. Control+B, Control+I apply formatting inside contenteditable elements.

## Going Deeper

- [Playwright docs: Frames](https://playwright.dev/docs/frames)
