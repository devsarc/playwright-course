// Lesson 00: Foundations
// Combines former modules: M00 (Setup & Project Structure), M01 (How Playwright Works
// Internally — awareness module, no exercise), M02 (Locators — Finding Elements),
// M03 (Actions — Interacting with Elements), M04 (Assertions — Verifying State),
// M05 (Navigation & Page State).
//
// Each Part below is the original module's test.describe block, unchanged
// except TODO numbers are prefixed with the Part number to stay unique in
// this file (a TODO originally numbered N in the M02 module becomes TODO
// 3.N here, matching Part 3's prefix).
// Part 2 (M01) is an awareness module with no exercise.spec.ts, so there is
// no Part 2 test.describe block in this file — Part numbers 1, 3, 4, 5, 6
// map directly to M00, M02, M03, M04, M05.

import { test, expect } from '../fixtures/fixtures';

test.describe('Part 1 — Setup & Project Structure (formerly M00)', () => {
  // M00: Your first Playwright test.
  // Goal: prove the environment works — Playwright can launch a browser,
  // navigate to Lumio, and make an assertion.

  test('Lumio landing page loads and has a title', async ({ page }) => {
    // TODO 1.1: Navigate to Lumio's landing page.
    // Use page.goto() with the path '/' — the baseURL from playwright.config.ts
    // will prepend http://localhost:3000 automatically.
    // Why baseURL? It lets you change environments (staging, prod) without
    // touching individual tests.
    await /* TODO 1.1: page.goto('/') */ undefined;

    // TODO 1.2: Assert the page has a <title> tag that is not empty.
    // Use expect(page).toHaveTitle() with a regex that matches any non-empty string.
    // Why a regex? A hard-coded title string would break every time marketing
    // renames the product. A regex tests the concept (title exists) not the copy.
    await expect(page).toHaveTitle(/* TODO 1.2: /\w+/ */);
  });

  test('Lumio landing page has a visible heading', async ({ page }) => {
    await page.goto('/');

    // TODO 1.3: Find the main heading on the landing page using getByRole.
    // Role: 'heading', level: 1 (the <h1>).
    // Why getByRole over page.locator('h1')? getByRole tests semantic meaning —
    // it finds the same element a screen reader would announce as the page heading,
    // regardless of what HTML tag or class is used.
    const heading = page.getByRole(/* TODO 1.3: 'heading', { level: 1 } */);

    // TODO 1.4: Assert the heading is visible (in the viewport, not hidden by CSS).
    await expect(heading)/* TODO 1.4: .toBeVisible() */;
  });
});

test.describe('Part 3 — Locators — Finding Elements (formerly M02)', () => {
  // M02: Locators — Finding Elements
  //
  // A locator describes HOW to find an element, not WHICH element it is right now.
  // Playwright re-evaluates locators on every interaction, which is why they stay
  // valid even when the DOM re-renders between steps.

  test.describe('Locator strategies on Lumio landing page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test('getByRole: find the primary CTA button', async ({ page }) => {
      // TODO 3.1: Find the "Get started free" button using getByRole.
      // Role: 'link' (it's an <a> tag). Name: 'Get started free' (the visible text).
      // Why getByRole over page.locator('a')? It distinguishes interactive roles —
      // a button and a link are different roles even if they look the same visually.
      const cta = page.getByRole(/* TODO 3.1: 'link', { name: 'Get started free' } */);

      await expect(cta).toBeVisible();
    });

    test('getByRole: find a heading by level', async ({ page }) => {
      // TODO 3.2: Find the main h1 heading using getByRole with level: 1.
      const heading = page.getByRole(/* TODO 3.2: 'heading', { level: 1 } */);

      await expect(heading).toBeVisible();
    });

    test('getByText: find a nav link by exact text', async ({ page }) => {
      // TODO 3.3: Find the "Pricing" nav link using getByText.
      // Use exact: true to avoid matching "Pricing" inside "View pricing details".
      const pricingLink = page.getByText(/* TODO 3.3: 'Pricing', { exact: true } */);

      await expect(pricingLink).toBeVisible();
    });

    test('getByRole: find all pricing card headings', async ({ page }) => {
      // TODO 3.4: Find the three pricing tier headings (Free, Pro, Enterprise).
      // Use getByRole('heading', { level: 3 }) — the tier names are <h3> elements.
      // Then assert the locator resolves to exactly 3 elements.
      const tierHeadings = page.getByRole(/* TODO 3.4: 'heading', { level: 3 } */);

      // TODO 3.5: Assert there are exactly 3 tier headings.
      // Use .toHaveCount() — not .toBeVisible(), which only checks the first match.
      await expect(tierHeadings)/* TODO 3.5: toHaveCount(3) */;
    });

    test('locator chaining: find a button inside a specific pricing card', async ({ page }) => {
      // TODO 3.6: Find the Pro tier pricing card using data-testid.
      // The card has data-testid="pricing-card-pro".
      const proCard = page.getByTestId(/* TODO 3.6: 'pricing-card-pro' */);

      // TODO 3.7: Within the Pro card, find the CTA button using getByRole.
      // Chaining narrows the search scope — getByRole on a locator searches only within it.
      const proButton = proCard.getByRole(/* TODO 3.7: 'link' */);

      await expect(proButton).toBeVisible();
    });

    test('nth(): select a specific item from a list', async ({ page }) => {
      // TODO 3.8: Get the second feature card (index 1) using .nth().
      // The feature cards have data-testid="feature-card".
      const secondCard = page.getByTestId('feature-card').nth(/* TODO 3.8: 1 */);

      await expect(secondCard).toBeVisible();
    });

    test('filter(): narrow a locator by visible text', async ({ page }) => {
      // TODO 3.9: Find the feature card whose heading contains "Kanban" using .filter().
      // .filter({ hasText: '...' }) is applied AFTER the initial locator match.
      // It's more composable than embedding the text directly in the original locator.
      const kanbanCard = page.getByTestId('feature-card').filter(/* TODO 3.9: { hasText: 'Kanban' } */);

      await expect(kanbanCard).toBeVisible();
    });
  });
});

test.describe('Part 4 — Actions — Interacting with Elements (formerly M03)', () => {
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
      // TODO 4.1: Click the "Pricing" nav link.
      // Use getByRole('link', { name: 'Pricing' }) — not page.click('a').
      // Why? Specificity: there are many links on the page; role + name is unambiguous.
      await page.getByRole(/* TODO 4.1: 'link', { name: 'Pricing' } */).click();

      // TODO 4.2: Assert the URL is now /pricing.
      await expect(page).toHaveURL(/* TODO 4.2: /\/pricing/ */);
    });

    test('hover: reveal a tooltip or dropdown', async ({ page }) => {
      // TODO 4.3: Hover over the "Sign in" nav link.
      // hover() triggers CSS :hover state — useful for testing dropdown menus and tooltips.
      await page.getByRole('link', { name: 'Sign in' })/* TODO 4.3: hover() */;

      // After hovering, assert the link still exists (smoke check — hover doesn't navigate)
      await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
    });

    test('fill: type into a form input', async ({ page }) => {
      await page.goto('/login');

      // TODO 4.4: Fill the email input with 'test@lumio.dev'.
      // fill() clears the field first, then types the value atomically.
      // Use getByLabel to find the input — it matches the <label for="email"> association.
      await page.getByLabel(/* TODO 4.4: 'Email address' */).fill('test@lumio.dev');

      await expect(page.getByLabel('Email address')).toHaveValue('test@lumio.dev');
    });

    test('press: submit a form with Enter key', async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel('Email address').fill('test@lumio.dev');
      await page.getByLabel('Password').fill('TestPassword123!');

      // TODO 4.5: Press Enter to submit the form.
      // press() sends a key event to the currently focused element.
      await page.getByLabel('Password')/* TODO 4.5: press('Enter') */;

      // The form was submitted (either navigated away or showed an error)
      // Just assert the page is no longer in a loading state
      await expect(page).not.toHaveURL('/login/loading');
    });

    test('type: type character by character (for keyboard event testing)', async ({ page }) => {
      await page.goto('/login');

      // TODO 4.6: Use pressSequentially() to type 'hello' one character at a time.
      // pressSequentially fires keydown/keypress/input/keyup events for each character.
      // Use this when the app listens to individual key events (autocomplete, hotkeys).
      // For most inputs, fill() is faster and more reliable — use pressSequentially only when needed.
      await page.getByLabel('Email address')/* TODO 4.6: pressSequentially('hello') */;

      await expect(page.getByLabel('Email address')).toHaveValue('hello');
    });

    test('selectOption: select from a dropdown', async ({ page }) => {
      await page.goto('/onboarding/workspace');

      // The workspace form doesn't have a <select> in our current implementation,
      // so we test selectOption on a hypothetical priority dropdown.
      // This exercises the API even though the result isn't meaningful here.
      // TODO 4.7: Understand when to use selectOption vs click() on a custom dropdown.
      // selectOption() only works on native <select> elements.
      // For Radix UI Select (a custom dropdown), you'd click() the trigger, then click() the option.
      // Write a comment explaining this distinction and mark the test as fixme until
      // Lumio's task creation form (added in M20) has a native priority select.
      test.fixme(true, 'Lumio uses Radix Select, not a native <select>. Revisit in M20.');
      // (This test will be skipped — test.fixme() with true marks it as expected-to-fail)
    });
  });
});

test.describe('Part 5 — Assertions — Verifying State (formerly M04)', () => {
  // M04: Assertions — Verifying State
  //
  // Playwright's expect() assertions are "web-first": they auto-retry until the
  // assertion passes or the timeout expires. This means you're asserting what the
  // page SHOULD become, not what it IS right now.

  test.describe('Assertions on Lumio landing page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test('toHaveTitle: assert the page title', async ({ page }) => {
      // TODO 5.1: Assert the page title matches the regex /Lumio/.
      // toHaveTitle auto-retries until the <title> tag matches or timeout expires.
      await expect(page)/* TODO 5.1: toHaveTitle(/Lumio/) */;
    });

    test('toHaveURL: assert the current URL', async ({ page }) => {
      // TODO 5.2: Assert the URL contains 'localhost:3000'.
      await expect(page)/* TODO 5.2: toHaveURL(/localhost:3000/) */;
    });

    test('toBeVisible: assert element is in the viewport', async ({ page }) => {
      // TODO 5.3: Assert the h1 heading is visible.
      // toBeVisible checks: attached to DOM + not hidden by CSS + non-zero size.
      await expect(page.getByRole('heading', { level: 1 }))/* TODO 5.3: toBeVisible() */;
    });

    test('toHaveText: assert element text content', async ({ page }) => {
      // TODO 5.4: Find the "Free" pricing card heading and assert its text is exactly "Free".
      // toHaveText with a string does exact match on the trimmed text content.
      const freeCard = page.getByTestId('pricing-card-free');
      const freeHeading = freeCard.getByRole('heading', { level: 3 });

      await expect(freeHeading)/* TODO 5.4: toHaveText('Free') */;
    });

    test('toHaveCount: assert number of matching elements', async ({ page }) => {
      // TODO 5.5: Assert the page has exactly 4 feature cards.
      await expect(page.getByTestId('feature-card'))/* TODO 5.5: toHaveCount(4) */;
    });

    test('toHaveAttribute: assert an element attribute value', async ({ page }) => {
      // TODO 5.6: Assert that the "Get started free" link has href="/signup".
      const ctaLink = page.getByRole('link', { name: 'Get started free' }).first();
      await expect(ctaLink)/* TODO 5.6: toHaveAttribute('href', '/signup') */;
    });

    test('soft assertions: collect multiple failures', async ({ page }) => {
      // Soft assertions do NOT stop the test on failure — they collect all failures
      // and report them together at the end. Use when you want to check multiple
      // independent properties in one test without short-circuiting on the first miss.

      // TODO 5.7: Write a soft assertion that the h1 is visible.
      // Use expect.soft() instead of expect().
      await expect.soft(page.getByRole('heading', { level: 1 }))/* TODO 5.7: toBeVisible() */;

      // TODO 5.8: Write a soft assertion that the page title contains 'Lumio'.
      await expect.soft(page)/* TODO 5.8: toHaveTitle(/Lumio/) */;

      // If either soft assertion fails, the test continues but is reported as failed
      // after all assertions are collected.
    });

    test('expect.poll: assert a non-Playwright value eventually becomes true', async ({ page }) => {
      // expect.poll() is for asserting JavaScript values that change asynchronously —
      // values that don't come from a Playwright locator.
      // Example: waiting for a global counter to reach a value.

      let counter = 0;
      setTimeout(() => { counter = 5; }, 100);

      // TODO 5.9: Use expect.poll() to assert that `counter` becomes 5 within 2 seconds.
      // expect.poll() takes a function and retries it until the assertion passes.
      await expect.poll(/* TODO 5.9: () => counter */ (() => 0), { timeout: 2000 }).toBe(5);
    });
  });
});

test.describe('Part 6 — Navigation & Page State (formerly M05)', () => {
  // M05: Navigation & Page State
  //
  // Most navigation in Playwright is handled by auto-wait after actions like click().
  // The explicit navigation APIs (waitForURL, waitForLoadState, waitForResponse) are
  // needed for scenarios where navigation is triggered by non-Playwright code (redirects,
  // timers, WebSocket messages, etc.) or when you need to assert about load state.

  test.describe('Navigation on Lumio public pages', () => {
    test('goto: navigate directly to a page', async ({ page }) => {
      // TODO 6.1: Navigate to the Lumio docs page using page.goto('/docs').
      // Assert the page loaded by checking for an h1.
      await page.goto(/* TODO 6.1: '/docs' */);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('reload: refresh the page and assert content persists', async ({ page }) => {
      await page.goto('/');

      // TODO 6.2: Reload the page using page.reload().
      // After reload, assert the h1 is still visible (basic smoke check).
      await page./* TODO 6.2: reload() */ evaluate(() => void 0);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('goBack / goForward: browser history navigation', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('link', { name: 'Pricing' }).click();
      await expect(page).toHaveURL(/\/pricing/);

      // TODO 6.3: Navigate back to the landing page using page.goBack().
      await page./* TODO 6.3: goBack() */;
      await expect(page).toHaveURL('http://localhost:3000/');

      // TODO 6.4: Navigate forward to /pricing using page.goForward().
      await page./* TODO 6.4: goForward() */;
      await expect(page).toHaveURL(/\/pricing/);
    });

    test('waitForURL: assert URL after client-side navigation', async ({ page }) => {
      await page.goto('/login');
      // Sign in with the test user credentials
      await page.getByLabel('Email address').fill(process.env.TEST_USER_EMAIL!);
      await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD!);
      await page.getByRole('button', { name: 'Sign in' }).click();

      // TODO 6.5: Wait for the URL to change to /dashboard after login.
      // waitForURL waits for the browser to navigate to a URL matching the pattern.
      // Use a regex to match any URL containing 'dashboard'.
      await page./* TODO 6.5: waitForURL(/dashboard/, { timeout: 10_000 }) */;

      await expect(page).toHaveURL(/dashboard/);
    });

    test('waitForLoadState: wait for network to settle', async ({ page }) => {
      // TODO 6.6: Navigate to the landing page and wait for 'domcontentloaded'.
      // 'domcontentloaded' fires when HTML is parsed but before images and stylesheets load.
      // 'load' fires after all resources. 'networkidle' fires when no requests for 500ms.
      // Use 'domcontentloaded' for fast pages; 'networkidle' for SPAs with dynamic content.
      await page.goto('/');
      await page./* TODO 6.6: waitForLoadState('domcontentloaded') */;
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('waitForResponse: intercept a specific API response', async ({ page }) => {
      // waitForResponse returns a promise that resolves when a matching response arrives.
      // Create the promise BEFORE the action that triggers the request.

      // TODO 6.7: Create a promise that waits for a response whose URL contains '/api/'.
      // Use page.waitForResponse() with a URL pattern.
      // Trigger it by navigating to /login and submitting the form — which calls /api/auth.
      const responsePromise = page./* TODO 6.7: waitForResponse(/\/api\//) */;
      await page.goto('/login');

      const response = await responsePromise;
      // Assert the response was received (status could be anything — we just verify it arrived)
      expect(response.status()).toBeGreaterThanOrEqual(0);
    });
  });
});
