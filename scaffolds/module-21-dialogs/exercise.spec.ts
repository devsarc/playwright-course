import { test, expect } from '../fixtures/fixtures';

// Module 21: Dialog & Alert Handling
// Goal: Test Lumio's native browser dialogs — the "delete workspace" confirm
// dialog and the "unsaved changes" beforeunload prompt when navigating away
// from a partially-filled settings form.

test.describe('M21 — Dialog & Alert Handling', () => {
  // Navigate to the workspace settings page before each test.
  // All four tests in this suite start from the same URL.
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/settings/workspace');
  });

  test('should accept the delete workspace confirm dialog and redirect', async ({ page }) => {
    // TODO 1: Register a dialog handler using page.once() BEFORE clicking the
    // delete button.
    // Why before? The dialog event fires the instant the button triggers
    // window.confirm(). If you register after the click, the event has already
    // fired (and been auto-dismissed) — your handler will never run.
    page.once('dialog', async (dialog) => {
      /* TODO 1: accept the dialog */
    });

    // TODO 2: Click the "Delete workspace" button to trigger the confirm dialog.
    await page.getByTestId(/* TODO 2: 'delete-workspace-button' */).click();

    // TODO 3: Assert that the page redirected to /dashboard after accepting.
    // Why a URL assertion here? Accepting the delete dialog should destroy the
    // workspace — the expected outcome is a redirect, not a success message on
    // the same page.
    await expect(page).toHaveURL(/* TODO 3: 'http://localhost:3000/dashboard' */);
  });

  test('should dismiss the delete workspace confirm dialog and stay on the page', async ({ page }) => {
    // TODO 4: Register a dialog handler that DISMISSES the confirm dialog.
    // Dismissing simulates the user clicking "Cancel" — the workspace should
    // NOT be deleted and the user should remain on the settings page.
    page.once('dialog', async (dialog) => {
      /* TODO 4: dismiss the dialog */
    });

    await page.getByTestId('delete-workspace-button').click();

    // TODO 5: Assert that the settings page is still visible — the user was NOT
    // redirected. The workspace name input still being visible is a reliable
    // signal that the page did not navigate away.
    await expect(
      page.getByTestId(/* TODO 5: 'workspace-settings-name-input' */)
    ).toBeVisible();
  });

  test('should assert the confirm dialog message contains the expected text', async ({ page }) => {
    // TODO 6: Register a dialog handler that reads dialog.message() and stores
    // it, then accepts the dialog so the test can continue.
    // Why assert the message? You want to confirm the app is showing the correct
    // copy — not just that a dialog appeared. dialog.message() is the only way
    // to read the text of a native browser dialog.
    let capturedMessage = '';
    page.once('dialog', async (dialog) => {
      capturedMessage = /* TODO 6: dialog.message() */ '';
      await dialog.accept();
    });

    await page.getByTestId('delete-workspace-button').click();

    // Wait for the redirect to confirm the dialog was handled, then assert.
    await expect(page).toHaveURL('http://localhost:3000/dashboard');

    // TODO 7: Assert that capturedMessage contains the expected warning text.
    // Use expect().toContain() rather than strict equality so the test stays
    // resilient to minor copy changes around the core message.
    expect(capturedMessage).toContain(/* TODO 7: 'Are you sure' */);
  });

  test('should show a beforeunload dialog when navigating away from a dirty form', async ({ page }) => {
    // Make the settings form "dirty" by typing in the workspace name field.
    // This causes the app to register a beforeunload listener.
    await page.getByTestId('workspace-settings-name-input').fill('Changed Name');

    // TODO 8: Register a dialog handler that captures the beforeunload message
    // and then accepts it (allowing navigation to proceed).
    // Why page.once() and not page.on()? beforeunload fires exactly once per
    // navigation — once() is cleaner and prevents the handler from being
    // re-used accidentally on a subsequent navigation in the same test.
    let beforeunloadMessage = '';
    page.once('dialog', async (dialog) => {
      beforeunloadMessage = dialog.message();
      /* TODO 8: accept the dialog so navigation is allowed to complete */
    });

    // TODO 9: Click a navigation link that will trigger the beforeunload event.
    // Navigating via a real click is more reliable than page.goto() for
    // triggering beforeunload because it goes through the browser's own
    // navigation lifecycle rather than bypassing it.
    await page.getByTestId(/* TODO 9: 'nav-dashboard-link' */).click();

    // TODO 10: Assert the beforeunload message matches the expected warning text.
    // The app sets this message in its beforeunload handler — asserting it
    // confirms the guard is wired up correctly, not just that some dialog appeared.
    expect(beforeunloadMessage).toContain(
      /* TODO 10: 'You have unsaved changes. Are you sure you want to leave?' */
    );

    // Assert that navigation succeeded after accepting the dialog.
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
  });
});
