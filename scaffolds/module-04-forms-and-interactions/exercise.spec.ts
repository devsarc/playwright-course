// Lesson 04: Forms, Dialogs & Advanced Interactions
// Combines former modules: M20 (Form Automation & Validation), M21 (Dialog & Alert Handling),
// M22 (File Upload, Download & PDF), M23 (Advanced Input & Interactions), M24 (iFrame & Shadow DOM)
//
// Each Part below is the original module's test.describe block, unchanged
// except TODO numbers are prefixed with the Part number to stay unique in
// this file (a TODO originally numbered N in the M22 module becomes TODO
// 3.N here, matching Part 3's prefix).

import { test, expect } from '../fixtures/fixtures';
import path from 'path';

test.describe('Part 1 — Form Automation & Validation (formerly M20)', () => {
  // TODO 1.1: Navigate to the workspace creation form before each test.
  // Why beforeEach? Because every test in this suite starts from the same URL.
  // Repeating navigation inside each test creates noise and hides the real intent.
  test.beforeEach(async ({ page }) => {
    await page.goto(/* TODO 1.1: 'the workspace creation URL' */);
  });

  test('should render the workspace creation form', async ({ page }) => {
    // TODO 1.2: Assert that the workspace name input is visible on the page.
    // Why visibility over existence? An element can be in the DOM but hidden
    // behind a loading state or off-screen. toBeVisible() confirms the user
    // can actually see and interact with the element.
    await expect(
      page.getByTestId(/* TODO 1.2: 'the workspace name input testid' */)
    ).toBeVisible();
  });

  test('should show validation errors when form is submitted empty', async ({ page }) => {
    // TODO 1.3: Click the submit button without filling in any fields.
    // Why click submit rather than press Enter here? Clicking the submit button
    // exercises the most common user path and confirms the button itself
    // triggers HTML5 / custom validation — not just keyboard submission.
    await page.getByTestId(/* TODO 1.3: 'the submit button testid' */).click();

    // TODO 1.4: Assert that at least one alert role element is visible.
    // Why getByRole('alert') instead of a CSS selector? role="alert" is the
    // ARIA-correct pattern for surfacing validation errors. Querying by role
    // keeps the test decoupled from class names and component internals that
    // change during visual refactors.
    await expect(
      page.getByRole(/* TODO 1.4: the ARIA role for validation error messages */)
    ).toBeVisible();
  });

  test('should fill all fields and submit the form successfully', async ({ page }) => {
    // TODO 1.5: Fill the workspace name input with a unique workspace name.
    // Why fill() over type()? fill() is atomic — it clicks, selects all, and
    // replaces the value in one operation. type() fires per-keystroke events,
    // which is slower and only needed when you're testing autocomplete or
    // character-level keyboard behavior.
    await page.getByTestId('workspace-name-input').fill(/* TODO 1.5: 'a workspace name string' */);

    // The slug input auto-generates from the workspace name.
    // Wait for it to populate before interacting with the plan selector.
    await expect(page.getByTestId('workspace-slug-input')).not.toHaveValue('');

    // TODO 1.6: Open the Radix Select dropdown and choose the 'pro' plan.
    // Why NOT page.selectOption()? The Radix Select is a custom component built
    // from divs and spans — it is not a native <select>. selectOption() only
    // works on native selects. For custom dropdowns, you must click the trigger
    // to open the floating panel, then click the option inside that panel.
    await page.getByTestId('workspace-plan-select').click();
    await page.getByTestId(/* TODO 1.6: 'the testid for the pro plan option' */).click();

    // Submit the form and assert a successful redirect.
    await page.getByTestId('workspace-submit-button').click();

    // After successful submission Lumio redirects to the invite step.
    await expect(page).toHaveURL(/* TODO 1.7: 'the post-submit redirect URL' */);
  });

  test('should show a server-side error for a duplicate slug', async ({ page }) => {
    // Fill the form with a slug that already exists in the system.
    await page.getByTestId('workspace-name-input').fill('Existing Workspace');
    await page.getByTestId('workspace-slug-input').fill('existing-workspace');
    await page.getByTestId('workspace-plan-select').click();
    await page.getByTestId('workspace-plan-option-free').click();

    // TODO 1.8: Submit the form and assert the duplicate-slug error appears.
    // Why await the assertion rather than reading the DOM synchronously?
    // The server round-trip takes time. toBeVisible() retries until the element
    // appears or the timeout expires — synchronous reads will always see the
    // pre-response DOM and fail intermittently.
    await page.getByTestId('workspace-submit-button').click();
    await expect(
      page.getByRole('alert').filter({ hasText: /* TODO 1.8: 'fragment of the duplicate slug error text' */ '' })
    ).toBeVisible();
  });
});

test.describe('Part 2 — Dialog & Alert Handling (formerly M21)', () => {
  // Navigate to the workspace settings page before each test.
  // All four tests in this suite start from the same URL.
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/settings/workspace');
  });

  test('should accept the delete workspace confirm dialog and redirect', async ({ page }) => {
    // TODO 2.1: Register a dialog handler using page.once() BEFORE clicking the
    // delete button.
    // Why before? The dialog event fires the instant the button triggers
    // window.confirm(). If you register after the click, the event has already
    // fired (and been auto-dismissed) — your handler will never run.
    page.once('dialog', async (dialog) => {
      /* TODO 2.1: accept the dialog */
    });

    // TODO 2.2: Click the "Delete workspace" button to trigger the confirm dialog.
    await page.getByTestId(/* TODO 2.2: 'delete-workspace-button' */).click();

    // TODO 2.3: Assert that the page redirected to /dashboard after accepting.
    // Why a URL assertion here? Accepting the delete dialog should destroy the
    // workspace — the expected outcome is a redirect, not a success message on
    // the same page.
    await expect(page).toHaveURL(/* TODO 2.3: 'http://localhost:3000/dashboard' */);
  });

  test('should dismiss the delete workspace confirm dialog and stay on the page', async ({ page }) => {
    // TODO 2.4: Register a dialog handler that DISMISSES the confirm dialog.
    // Dismissing simulates the user clicking "Cancel" — the workspace should
    // NOT be deleted and the user should remain on the settings page.
    page.once('dialog', async (dialog) => {
      /* TODO 2.4: dismiss the dialog */
    });

    await page.getByTestId('delete-workspace-button').click();

    // TODO 2.5: Assert that the settings page is still visible — the user was NOT
    // redirected. The workspace name input still being visible is a reliable
    // signal that the page did not navigate away.
    await expect(
      page.getByTestId(/* TODO 2.5: 'workspace-settings-name-input' */)
    ).toBeVisible();
  });

  test('should assert the confirm dialog message contains the expected text', async ({ page }) => {
    // TODO 2.6: Register a dialog handler that reads dialog.message() and stores
    // it, then accepts the dialog so the test can continue.
    // Why assert the message? You want to confirm the app is showing the correct
    // copy — not just that a dialog appeared. dialog.message() is the only way
    // to read the text of a native browser dialog.
    let capturedMessage = '';
    page.once('dialog', async (dialog) => {
      capturedMessage = /* TODO 2.6: dialog.message() */ '';
      await dialog.accept();
    });

    await page.getByTestId('delete-workspace-button').click();

    // Wait for the redirect to confirm the dialog was handled, then assert.
    await expect(page).toHaveURL('http://localhost:3000/dashboard');

    // TODO 2.7: Assert that capturedMessage contains the expected warning text.
    // Use expect().toContain() rather than strict equality so the test stays
    // resilient to minor copy changes around the core message.
    expect(capturedMessage).toContain(/* TODO 2.7: 'Are you sure' */);
  });

  test('should show a beforeunload dialog when navigating away from a dirty form', async ({ page }) => {
    // Make the settings form "dirty" by typing in the workspace name field.
    // This causes the app to register a beforeunload listener.
    await page.getByTestId('workspace-settings-name-input').fill('Changed Name');

    // TODO 2.8: Register a dialog handler that captures the beforeunload message
    // and then accepts it (allowing navigation to proceed).
    // Why page.once() and not page.on()? beforeunload fires exactly once per
    // navigation — once() is cleaner and prevents the handler from being
    // re-used accidentally on a subsequent navigation in the same test.
    let beforeunloadMessage = '';
    page.once('dialog', async (dialog) => {
      beforeunloadMessage = dialog.message();
      /* TODO 2.8: accept the dialog so navigation is allowed to complete */
    });

    // TODO 2.9: Click a navigation link that will trigger the beforeunload event.
    // Navigating via a real click is more reliable than page.goto() for
    // triggering beforeunload because it goes through the browser's own
    // navigation lifecycle rather than bypassing it.
    await page.getByTestId(/* TODO 2.9: 'nav-dashboard-link' */).click();

    // TODO 2.10: Assert the beforeunload message matches the expected warning text.
    // The app sets this message in its beforeunload handler — asserting it
    // confirms the guard is wired up correctly, not just that some dialog appeared.
    expect(beforeunloadMessage).toContain(
      /* TODO 2.10: 'You have unsaved changes. Are you sure you want to leave?' */
    );

    // Assert that navigation succeeded after accepting the dialog.
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
  });
});

test.describe('Part 3 — File Upload, Download & PDF (formerly M22)', () => {
  // Playwright handles file inputs via locator.setInputFiles() — no OS dialog appears.
  // The method sets the FileList directly on <input type="file">, bypassing the picker.
  //
  // For drag-and-drop upload zones (no <input>), construct a DataTransfer in the
  // browser via page.evaluateHandle() and dispatch a 'drop' event.

  test.beforeEach(async ({ page }) => {
    await page.goto('/projects/demo/board');
    await page.getByTestId('kanban-card').first().click();
    await expect(page.getByTestId('card-detail-panel')).toBeVisible();
  });

  test('upload a single file via input', async ({ page }) => {
    // TODO 3.1: Locate the file input using data-testid="attachment-input".
    const fileInput = page.getByTestId(/* TODO 3.1: 'attachment-input' */);

    // TODO 3.2: Upload sample.txt using setInputFiles().
    // Use path.join(__dirname, 'fixtures', 'sample.txt') for the file path.
    // __dirname resolves relative to this spec file, not the cwd.
    await fileInput.setInputFiles(/* TODO 3.2: path.join(__dirname, 'fixtures', 'sample.txt') */);

    // TODO 3.3: Assert an attachment row appears containing "sample.txt".
    // data-testid="attachment-item"
    await expect(
      page.getByTestId(/* TODO 3.3: 'attachment-item' */).filter({ hasText: 'sample.txt' })
    ).toBeVisible();
  });

  test('upload multiple files at once', async ({ page }) => {
    // TODO 3.4: Pass an array of two paths to setInputFiles().
    // Arrays let you simulate multi-file selection in a single picker operation.
    const fileInput = page.getByTestId('attachment-input');
    await fileInput.setInputFiles(/* TODO 3.4: [
      path.join(__dirname, 'fixtures', 'sample.txt'),
      path.join(__dirname, 'fixtures', 'sample2.txt'),
    ] */);

    // TODO 3.5: Assert two attachment-item rows are visible.
    await expect(page.getByTestId('attachment-item'))/* TODO 3.5: toHaveCount(2) */;
  });

  test('clear file input', async ({ page }) => {
    // TODO 3.6: Upload a file, then pass [] to setInputFiles to clear the input.
    // Clearing simulates the user cancelling their selection before submit.
    const fileInput = page.getByTestId('attachment-input');
    await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'sample.txt'));
    await fileInput.setInputFiles(/* TODO 3.6: [] */);
    await expect(page.getByTestId('attachment-item'))/* TODO 3.6: toHaveCount(0) */;
  });

  test('upload via drag-and-drop zone', async ({ page }) => {
    // TODO 3.7: The panel also has a drop zone at data-testid="attachment-dropzone".
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
      /* TODO 3.7: '[data-testid="attachment-dropzone"]' */ 'body',
      'drop',
      { dataTransfer }
    );
    await expect(
      page.getByTestId('attachment-item').filter({ hasText: 'dropped.txt' })
    ).toBeVisible();
  });
});

test.describe('Part 4 — Advanced Input & Interactions (formerly M23)', () => {
  // Playwright supports drag-and-drop via two APIs:
  //   1. locator.dragTo(target) — high-level, works for mouse-event-based libraries
  //   2. page.dragAndDrop(source, target) — CSS-selector-based shorthand
  //   3. page.mouse API — for full manual control when high-level APIs fail
  //
  // Lumio's kanban uses @hello-pangea/dnd (react-beautiful-dnd fork).
  // It listens to mouse events, not the HTML5 drag API, so locator.dragTo() works.

  test.beforeEach(async ({ page }) => {
    await page.goto('/projects/demo/board');
  });

  test('drag card from To Do to In Progress', async ({ page }) => {
    // TODO 4.1: Get the first card in the "todo" column.
    // Column: data-testid="kanban-column-todo"
    // Card: data-testid="kanban-card" (first one, .first())
    const sourceCard = page
      .getByTestId(/* TODO 4.1: 'kanban-column-todo' */)
      .getByTestId(/* TODO 4.1: 'kanban-card' */)
      .first();

    // TODO 4.2: Get the "in-progress" column as the drop target.
    const targetColumn = page.getByTestId(/* TODO 4.2: 'kanban-column-in-progress' */);

    // TODO 4.3: Read the card title before dragging — the element moves DOM position,
    // so reading text afterward from the original locator may return stale data.
    const cardTitle = await sourceCard.textContent();

    // TODO 4.4: Drag the source card to the target column using locator.dragTo().
    // dragTo() fires mousedown -> mousemove -> mouseup, which is what the library needs.
    await sourceCard.dragTo(/* TODO 4.4: targetColumn */);

    // TODO 4.5: Assert the card now appears in the in-progress column.
    await expect(
      targetColumn.getByTestId('kanban-card').filter({ hasText: cardTitle! })
    )/* TODO 4.5: toBeVisible() */;
  });

  test('drag card from In Progress to Done', async ({ page }) => {
    // TODO 4.6: Move a card from in-progress to done.
    // Source: first card in kanban-column-in-progress
    // Target: kanban-column-done
    const sourceCard = page
      .getByTestId(/* TODO 4.6: 'kanban-column-in-progress' */)
      .getByTestId('kanban-card')
      .first();
    const targetColumn = page.getByTestId(/* TODO 4.6: 'kanban-column-done' */);
    const cardTitle = await sourceCard.textContent();
    await sourceCard.dragTo(targetColumn);
    await expect(
      targetColumn.getByTestId('kanban-card').filter({ hasText: cardTitle! })
    ).toBeVisible();
  });

  test('drag card back to To Do (revert flow)', async ({ page }) => {
    // TODO 4.7: Move a card from done back to todo to verify bidirectional DnD.
    // This catches a common bug where the library only supports forward drops.
    /* TODO 4.7 */
  });

  test('drag with steps option for slow-motion libraries', async ({ page }) => {
    // TODO 4.8: Pass { steps: 20 } to dragTo().
    // steps: N inserts N intermediate mousemove events — some DnD libraries
    // need these intermediate events to trigger their drag detection logic.
    const sourceCard = page
      .getByTestId('kanban-column-todo')
      .getByTestId('kanban-card')
      .first();
    const targetColumn = page.getByTestId('kanban-column-in-progress');
    await sourceCard.dragTo(targetColumn, /* TODO 4.8: { steps: 20 } */);
    const cardTitle = await targetColumn.getByTestId('kanban-card').first().textContent();
    expect(cardTitle).toBeTruthy();
  });
});

test.describe('Part 5 — iFrame & Shadow DOM (formerly M24)', () => {
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
      // TODO 5.1: Get a FrameLocator for data-testid="card-preview-frame".
      // page.frameLocator('[data-testid="card-preview-frame"]') scopes all
      // subsequent .getBy* calls to that iframe document.
      const previewFrame = page.frameLocator(/* TODO 5.1: '[data-testid="card-preview-frame"]' */);

      // TODO 5.2: Within the frame, find the first heading and assert it is visible.
      await expect(previewFrame.getByRole(/* TODO 5.2: 'heading' */))/* TODO 5.2: toBeVisible() */;
    });

    test('interact with a form inside a named iframe', async ({ page }) => {
      // TODO 5.3: Navigate to /projects/demo/embed-form — it has iframe name="embed-form-frame".
      // Use page.frame({ name: 'embed-form-frame' }) to get the Frame object.
      // Fill the form and assert the success message.
      await page.goto('/projects/demo/embed-form');
      const frame = page.frame(/* TODO 5.3: { name: 'embed-form-frame' } */);
      await frame!.getByLabel(/* TODO 5.3: 'Comment' */).fill('Hello from iframe');
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
      // TODO 5.4: TipTap renders a contenteditable div with role="textbox".
      // Scope with getByTestId('tiptap-editor').getByRole('textbox') and call fill().
      // contenteditable elements accept fill() exactly like textarea elements.
      const editor = page.getByTestId('tiptap-editor').getByRole(/* TODO 5.4: 'textbox' */);
      await editor.fill(/* TODO 5.4: 'Hello TipTap' */);
      await expect(editor).toHaveText(/* TODO 5.4: 'Hello TipTap' */);
    });

    test('apply bold formatting via keyboard shortcut', async ({ page }) => {
      // TODO 5.5: Fill the editor, select all with Control+A, apply bold with Control+B,
      // then assert a <strong> element is inside the editor.
      // Keyboard shortcuts on contenteditable elements work the same as in a real browser.
      const editor = page.getByTestId('tiptap-editor').getByRole('textbox');
      await editor.fill('Bold me');
      await editor.press(/* TODO 5.5: 'Control+A' */);
      await editor.press(/* TODO 5.5: 'Control+B' */);
      await expect(editor.locator('strong'))/* TODO 5.5: toBeVisible() */;
    });
  });
});
