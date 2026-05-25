# M22: File Upload, Download & PDF

## Learning Objectives

- Upload files without OS dialogs using `locator.setInputFiles()`
- Upload multiple files in one call and clear with `[]`
- Simulate file drag-and-drop using `DataTransfer` + `page.evaluateHandle()`
- Intercept a file download with `page.waitForEvent('download')` and save it to disk for assertion
- Assert downloaded file content: read the saved file with `fs.readFileSync` and verify size or content
- Generate a PDF with `page.pdf()` (Chromium only): understand when to use it and its limitations (no WebKit/Firefox support, requires headful or `--headless=new`)

## Concept

**`<input type="file">` — use `setInputFiles()`:**
```typescript
await page.getByTestId('file-input').setInputFiles('/path/to/file.txt');
```

**Drag-and-drop zone — use `DataTransfer`:**
```typescript
const dt = await page.evaluateHandle(() => {
  const dt = new DataTransfer();
  dt.items.add(new File(['content'], 'file.txt', { type: 'text/plain' }));
  return dt;
});
await page.dispatchEvent('[data-testid="dropzone"]', 'drop', { dataTransfer: dt });
```

**File download:**
```typescript
const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.getByRole('button', { name: 'Export CSV' }).click(),
]);
const path = await download.path(); // temp file path
const content = fs.readFileSync(path, 'utf-8');
expect(content).toContain('task-id,title');
```

**PDF generation (`page.pdf()`):**
```typescript
// Chromium only — not supported in Firefox or WebKit
const pdf = await page.pdf({ path: 'report.pdf', format: 'A4' });
expect(pdf.length).toBeGreaterThan(0); // at minimum, assert non-empty
```
`page.pdf()` renders the current page to PDF server-side. It requires Chromium (`chromium` project) and throws in other browsers. Use it when you're testing the PDF export feature itself — not as a general assertion tool.

## Key Takeaways

1. `setInputFiles()` bypasses the OS picker — always prefer it for `<input type="file">`.
2. `[]` clears the input — useful for testing pre-submit cancellation.
3. `evaluateHandle()` creates browser-side objects that cannot be serialised from Node.js.
4. Use `__dirname` for file paths so tests work regardless of cwd.

## Going Deeper

- [Playwright docs: setInputFiles](https://playwright.dev/docs/api/class-locator#locator-set-input-files)
