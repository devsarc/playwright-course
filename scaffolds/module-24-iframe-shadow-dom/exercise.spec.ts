import { test, expect } from '../fixtures/fixtures';

// M24: iFrame & Shadow DOM
//
// Playwright exposes two iframe APIs:
//   page.frameLocator(selector) — FrameLocator; all locator methods scoped to the frame.
//     Supports auto-waiting. Recommended for most work.
//   page.frame({ name | url }) — returns a Frame object.
//     Use when you need frame.evaluate(), frame.goto(), or frame-level events.
//
// TipTap renders a contenteditable div (not a true iframe). It behaves like
// a textarea for fill() and keyboard shortcuts.

test.describe('iFrame — embedded preview pane', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects/demo/board');
    await page.getByTestId('kanban-card').first().click();
    await expect(page.getByTestId('card-detail-panel')).toBeVisible();
  });

  test('find content inside the preview iframe', async ({ page }) => {
    // TODO 1: Get a FrameLocator for data-testid="card-preview-frame".
    // page.frameLocator('[data-testid="card-preview-frame"]') scopes all
    // subsequent .getBy* calls to that iframe document.
    const previewFrame = page.frameLocator(/* TODO 1: '[data-testid="card-preview-frame"]' */);

    // TODO 2: Within the frame, find the first heading and assert it is visible.
    await expect(previewFrame.getByRole(/* TODO 2: 'heading' */))/* TODO 2: toBeVisible() */;
  });

  test('interact with a form inside a named iframe', async ({ page }) => {
    // TODO 3: Navigate to /projects/demo/embed-form — it has iframe name="embed-form-frame".
    // Use page.frame({ name: 'embed-form-frame' }) to get the Frame object.
    // Fill the form and assert the success message.
    await page.goto('/projects/demo/embed-form');
    const frame = page.frame(/* TODO 3: { name: 'embed-form-frame' } */);
    await frame!.getByLabel(/* TODO 3: 'Comment' */).fill('Hello from iframe');
    await frame!.getByRole('button', { name: 'Submit' }).click();
    await expect(frame!.getByText('Submitted')).toBeVisible();
  });
});

test.describe('TipTap editor — contenteditable', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects/demo/board');
    await page.getByTestId('kanban-card').first().click();
    await expect(page.getByTestId('tiptap-editor')).toBeVisible();
  });

  test('type text into the editor', async ({ page }) => {
    // TODO 4: TipTap renders a contenteditable div with role="textbox".
    // Scope with getByTestId('tiptap-editor').getByRole('textbox') and call fill().
    // contenteditable elements accept fill() exactly like textarea elements.
    const editor = page.getByTestId('tiptap-editor').getByRole(/* TODO 4: 'textbox' */);
    await editor.fill(/* TODO 4: 'Hello TipTap' */);
    await expect(editor).toHaveText(/* TODO 4: 'Hello TipTap' */);
  });

  test('apply bold formatting via keyboard shortcut', async ({ page }) => {
    // TODO 5: Fill the editor, select all with Control+A, apply bold with Control+B,
    // then assert a <strong> element is inside the editor.
    // Keyboard shortcuts on contenteditable elements work the same as in a real browser.
    const editor = page.getByTestId('tiptap-editor').getByRole('textbox');
    await editor.fill('Bold me');
    await editor.press(/* TODO 5: 'Control+A' */);
    await editor.press(/* TODO 5: 'Control+B' */);
    await expect(editor.locator('strong'))/* TODO 5: toBeVisible() */;
  });
});
