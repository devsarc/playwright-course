import { test, expect } from '../fixtures/fixtures';

// M03: Actions — Interacting with Elements
//
// Every action in Playwright waits for the element to be "actionable" before
// proceeding — attached, visible, stable, enabled, editable. This is the
// auto-wait mechanism from M01. You almost never need explicit waits.

test.describe('Actions on Lumio landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('click: navigate to the pricing page', async ({ page }) => {
    // TODO 1: Click the "Pricing" nav link.
    // Use getByRole('link', { name: 'Pricing' }) — not page.click('a').
    // Why? Specificity: there are many links on the page; role + name is unambiguous.
    await page.getByRole(/* TODO 1: 'link', { name: 'Pricing' } */).click();

    // TODO 2: Assert the URL is now /pricing.
    await expect(page).toHaveURL(/* TODO 2: /\/pricing/ */);
  });

  test('hover: reveal a tooltip or dropdown', async ({ page }) => {
    // TODO 3: Hover over the "Sign in" nav link.
    // hover() triggers CSS :hover state — useful for testing dropdown menus and tooltips.
    await page.getByRole('link', { name: 'Sign in' })/* TODO 3: hover() */;

    // After hovering, assert the link still exists (smoke check — hover doesn't navigate)
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  });

  test('fill: type into a form input', async ({ page }) => {
    await page.goto('/login');

    // TODO 4: Fill the email input with 'test@lumio.dev'.
    // fill() clears the field first, then types the value atomically.
    // Use getByLabel to find the input — it matches the <label for="email"> association.
    await page.getByLabel(/* TODO 4: 'Email address' */).fill('test@lumio.dev');

    await expect(page.getByLabel('Email address')).toHaveValue('test@lumio.dev');
  });

  test('press: submit a form with Enter key', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email address').fill('test@lumio.dev');
    await page.getByLabel('Password').fill('TestPassword123!');

    // TODO 5: Press Enter to submit the form.
    // press() sends a key event to the currently focused element.
    await page.getByLabel('Password')/* TODO 5: press('Enter') */;

    // The form was submitted (either navigated away or showed an error)
    // Just assert the page is no longer in a loading state
    await expect(page).not.toHaveURL('/login/loading');
  });

  test('type: type character by character (for keyboard event testing)', async ({ page }) => {
    await page.goto('/login');

    // TODO 6: Use pressSequentially() to type 'hello' one character at a time.
    // pressSequentially fires keydown/keypress/input/keyup events for each character.
    // Use this when the app listens to individual key events (autocomplete, hotkeys).
    // For most inputs, fill() is faster and more reliable — use pressSequentially only when needed.
    await page.getByLabel('Email address')/* TODO 6: pressSequentially('hello') */;

    await expect(page.getByLabel('Email address')).toHaveValue('hello');
  });

  test('selectOption: select from a dropdown', async ({ page }) => {
    await page.goto('/onboarding/workspace');

    // The workspace form doesn't have a <select> in our current implementation,
    // so we test selectOption on a hypothetical priority dropdown.
    // This exercises the API even though the result isn't meaningful here.
    // TODO 7: Understand when to use selectOption vs click() on a custom dropdown.
    // selectOption() only works on native <select> elements.
    // For Radix UI Select (a custom dropdown), you'd click() the trigger, then click() the option.
    // Write a comment explaining this distinction and mark the test as fixme until
    // Lumio's task creation form (added in M20) has a native priority select.
    test.fixme(true, 'Lumio uses Radix Select, not a native <select>. Revisit in M20.');
    // (This test will be skipped — test.fixme() with true marks it as expected-to-fail)
  });
});
