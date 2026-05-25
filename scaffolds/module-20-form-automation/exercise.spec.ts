import { test, expect } from '../fixtures/fixtures';

// Module 20: Form Automation & Validation
// Goal: Test Lumio's workspace creation form end-to-end, covering navigation,
// client-side validation, custom dropdown interaction, and server-side errors.

test.describe('M20 — Workspace Creation Form', () => {
  // TODO 1: Navigate to the workspace creation form before each test.
  // Why beforeEach? Because every test in this suite starts from the same URL.
  // Repeating navigation inside each test creates noise and hides the real intent.
  test.beforeEach(async ({ page }) => {
    await page.goto(/* TODO 1: 'the workspace creation URL' */);
  });

  test('should render the workspace creation form', async ({ page }) => {
    // TODO 2: Assert that the workspace name input is visible on the page.
    // Why visibility over existence? An element can be in the DOM but hidden
    // behind a loading state or off-screen. toBeVisible() confirms the user
    // can actually see and interact with the element.
    await expect(
      page.getByTestId(/* TODO 2: 'the workspace name input testid' */)
    ).toBeVisible();
  });

  test('should show validation errors when form is submitted empty', async ({ page }) => {
    // TODO 3: Click the submit button without filling in any fields.
    // Why click submit rather than press Enter here? Clicking the submit button
    // exercises the most common user path and confirms the button itself
    // triggers HTML5 / custom validation — not just keyboard submission.
    await page.getByTestId(/* TODO 3: 'the submit button testid' */).click();

    // TODO 4: Assert that at least one alert role element is visible.
    // Why getByRole('alert') instead of a CSS selector? role="alert" is the
    // ARIA-correct pattern for surfacing validation errors. Querying by role
    // keeps the test decoupled from class names and component internals that
    // change during visual refactors.
    await expect(
      page.getByRole(/* TODO 4: the ARIA role for validation error messages */)
    ).toBeVisible();
  });

  test('should fill all fields and submit the form successfully', async ({ page }) => {
    // TODO 5: Fill the workspace name input with a unique workspace name.
    // Why fill() over type()? fill() is atomic — it clicks, selects all, and
    // replaces the value in one operation. type() fires per-keystroke events,
    // which is slower and only needed when you're testing autocomplete or
    // character-level keyboard behavior.
    await page.getByTestId('workspace-name-input').fill(/* TODO 5: 'a workspace name string' */);

    // The slug input auto-generates from the workspace name.
    // Wait for it to populate before interacting with the plan selector.
    await expect(page.getByTestId('workspace-slug-input')).not.toHaveValue('');

    // TODO 6: Open the Radix Select dropdown and choose the 'pro' plan.
    // Why NOT page.selectOption()? The Radix Select is a custom component built
    // from divs and spans — it is not a native <select>. selectOption() only
    // works on native selects. For custom dropdowns, you must click the trigger
    // to open the floating panel, then click the option inside that panel.
    await page.getByTestId('workspace-plan-select').click();
    await page.getByTestId(/* TODO 6: 'the testid for the pro plan option' */).click();

    // Submit the form and assert a successful redirect.
    await page.getByTestId('workspace-submit-button').click();

    // After successful submission Lumio redirects to the invite step.
    await expect(page).toHaveURL(/* TODO 7: 'the post-submit redirect URL' */);
  });

  test('should show a server-side error for a duplicate slug', async ({ page }) => {
    // Fill the form with a slug that already exists in the system.
    await page.getByTestId('workspace-name-input').fill('Existing Workspace');
    await page.getByTestId('workspace-slug-input').fill('existing-workspace');
    await page.getByTestId('workspace-plan-select').click();
    await page.getByTestId('workspace-plan-option-free').click();

    // TODO 8: Submit the form and assert the duplicate-slug error appears.
    // Why await the assertion rather than reading the DOM synchronously?
    // The server round-trip takes time. toBeVisible() retries until the element
    // appears or the timeout expires — synchronous reads will always see the
    // pre-response DOM and fail intermittently.
    await page.getByTestId('workspace-submit-button').click();
    await expect(
      page.getByRole('alert').filter({ hasText: /* TODO 8: 'fragment of the duplicate slug error text' */ '' })
    ).toBeVisible();
  });
});
