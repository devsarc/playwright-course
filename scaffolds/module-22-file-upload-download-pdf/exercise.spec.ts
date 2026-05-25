import { test, expect } from '../fixtures/fixtures';
import path from 'path';

// M22: File Upload, Download & PDF
//
// Playwright handles file inputs via locator.setInputFiles() — no OS dialog appears.
// The method sets the FileList directly on <input type="file">, bypassing the picker.
//
// For drag-and-drop upload zones (no <input>), construct a DataTransfer in the
// browser via page.evaluateHandle() and dispatch a 'drop' event.

test.describe('File upload — card attachments', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects/demo/board');
    await page.getByTestId('kanban-card').first().click();
    await expect(page.getByTestId('card-detail-panel')).toBeVisible();
  });

  test('upload a single file via input', async ({ page }) => {
    // TODO 1: Locate the file input using data-testid="attachment-input".
    const fileInput = page.getByTestId(/* TODO 1: 'attachment-input' */);

    // TODO 2: Upload sample.txt using setInputFiles().
    // Use path.join(__dirname, 'fixtures', 'sample.txt') for the file path.
    // __dirname resolves relative to this spec file, not the cwd.
    await fileInput.setInputFiles(/* TODO 2: path.join(__dirname, 'fixtures', 'sample.txt') */);

    // TODO 3: Assert an attachment row appears containing "sample.txt".
    // data-testid="attachment-item"
    await expect(
      page.getByTestId(/* TODO 3: 'attachment-item' */).filter({ hasText: 'sample.txt' })
    ).toBeVisible();
  });

  test('upload multiple files at once', async ({ page }) => {
    // TODO 4: Pass an array of two paths to setInputFiles().
    // Arrays let you simulate multi-file selection in a single picker operation.
    const fileInput = page.getByTestId('attachment-input');
    await fileInput.setInputFiles(/* TODO 4: [
      path.join(__dirname, 'fixtures', 'sample.txt'),
      path.join(__dirname, 'fixtures', 'sample2.txt'),
    ] */);

    // TODO 5: Assert two attachment-item rows are visible.
    await expect(page.getByTestId('attachment-item'))/* TODO 5: toHaveCount(2) */;
  });

  test('clear file input', async ({ page }) => {
    // TODO 6: Upload a file, then pass [] to setInputFiles to clear the input.
    // Clearing simulates the user cancelling their selection before submit.
    const fileInput = page.getByTestId('attachment-input');
    await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'sample.txt'));
    await fileInput.setInputFiles(/* TODO 6: [] */);
    await expect(page.getByTestId('attachment-item'))/* TODO 6: toHaveCount(0) */;
  });

  test('upload via drag-and-drop zone', async ({ page }) => {
    // TODO 7: The panel also has a drop zone at data-testid="attachment-dropzone".
    // Construct a DataTransfer with a File inside it using page.evaluateHandle(),
    // then dispatch a 'drop' event. Assert the attachment appears.
    // Why evaluateHandle()? DataTransfer must be constructed inside the browser
    // context — it cannot be serialised from Node.js.
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      dt.items.add(new File(['content'], 'dropped.txt', { type: 'text/plain' }));
      return dt;
    });
    await page.dispatchEvent(
      /* TODO 7: '[data-testid="attachment-dropzone"]' */ 'body',
      'drop',
      { dataTransfer }
    );
    await expect(
      page.getByTestId('attachment-item').filter({ hasText: 'dropped.txt' })
    ).toBeVisible();
  });
});
