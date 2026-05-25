# M34 Hints

## TODO 1 — Navigate and annotate with browserName

```typescript
await page.goto('/');
await test.info().annotations.push({ type: 'browser', description: browserName });
```

`browserName` is injected by Playwright from the active project configuration. Its value is `'chromium'`, `'firefox'`, or `'webkit'`.

## TODO 2 — Assert title across browsers

```typescript
await expect(page).toHaveTitle(/Lumio/);
```

A regex match is more resilient than an exact string — the title may vary slightly (e.g., "Lumio — Team Productivity" vs "Lumio") but the brand name will always be present.

## TODO 3 — Skip on non-Chromium browsers

```typescript
test.skip(browserName !== 'chromium', 'page.pdf() is Chromium-only');
```

`test.skip(condition, reason)` marks the test as skipped in the HTML report with the reason visible. Using `if (browserName !== 'chromium') return;` would instead show the test as passed, hiding the intentional skip.

## TODO 4 — Assert PDF buffer

```typescript
expect(pdfBuffer).toBeTruthy();
expect(pdfBuffer.length).toBeGreaterThan(0);
```

`page.pdf()` returns a `Buffer`. A buffer with length > 0 confirms the PDF was generated.

## TODO 5 — Fill date input

```typescript
await dueDateInput.fill('2025-06-15');
```

The ISO 8601 format `YYYY-MM-DD` is what `<input type="date">` stores internally, regardless of how the browser displays it (e.g., `06/15/2025` in the US locale).

## TODO 6 — Assert date value

```typescript
await expect(dueDateInput).toHaveValue('2025-06-15');
```

If this fails on WebKit, the workaround is to use `page.evaluate()` to set the value directly:
```typescript
if (browserName === 'webkit') {
  await page.evaluate(([el, val]) => {
    (el as HTMLInputElement).value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, [await dueDateInput.elementHandle(), '2025-06-15']);
}
```
This bypasses WebKit's stricter date input parsing.

## TODO 7 — Grant clipboard permissions

```typescript
await context.grantPermissions(['clipboard-read', 'clipboard-write']);
```

`context.grantPermissions()` sets permissions for the entire browser context before any page navigation. Call it before `page.goto()`. Chromium ignores redundant grants; WebKit and Firefox enforce them.

## TODO 8 — Read clipboard text

```typescript
const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
expect(clipboardText).toContain('task');
```

`navigator.clipboard.readText()` is async and returns a Promise — `page.evaluate()` automatically awaits it. The permission granted in TODO 7 is what allows this to succeed on WebKit.
