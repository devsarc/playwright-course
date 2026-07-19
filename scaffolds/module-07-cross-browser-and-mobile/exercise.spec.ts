// Lesson 07: Cross-Browser & Mobile Testing
// Combines former modules: M34 (Cross-Browser Testing Strategy), M35 (Mobile
// Emulation & Responsive Testing), M36 (Geolocation, Permissions & Device
// APIs), M37 (Offline, PWA & Service Workers)
//
// Each Part below is the original module's test.describe block, unchanged
// except TODO numbers are prefixed with the Part number to stay unique in
// this file (a TODO originally numbered N in the M37 module becomes TODO
// 4.N here, matching Part 4's prefix).

import { test, expect, devices } from '../fixtures/fixtures';

// These tests run on Chromium, Firefox, and WebKit when all three projects
// are configured. Use `--project chromium` for speed during development.

test.describe('Part 1 — Cross-Browser Testing Strategy (formerly M34)', () => {

  // Test 1: Basic cross-browser smoke test
  // This test should pass identically on all three browsers.
  test('Lumio landing page loads on all browsers', async ({ page, browserName }) => {
    // TODO 1.1: Navigate to the Lumio landing page.
    // Why check browserName? You can log or annotate which browser is running —
    // useful in CI to trace which browser produced a failure.
    await page.goto(/* TODO 1.1: '/' */);
    await test.info().annotations.push({ type: 'browser', description: /* TODO 1.1: browserName */ '' as any });

    // TODO 1.2: Assert the page title contains 'Lumio'.
    // This should pass on all three browsers — the title is not browser-dependent.
    await expect(page).toHaveTitle(/* TODO 1.2: /Lumio/ */);
  });

  // Test 2: Demonstrate browser-specific skip
  // page.pdf() is a Chromium-only API. This test should be skipped on Firefox and WebKit.
  test('PDF generation is Chromium-only', async ({ page, browserName }) => {
    // TODO 1.3: Skip this test on any browser that is not Chromium.
    // Use test.skip() with a condition and a human-readable reason.
    // Why skip here rather than wrapping in if()? test.skip() marks the test
    // as skipped in the report — an if() would silently pass without running the assertion.
    test.skip(/* TODO 1.3: browserName !== 'chromium', 'page.pdf() is Chromium-only' */);

    await page.goto('/dashboard');
    const pdfBuffer = await page.pdf();

    // TODO 1.4: Assert the PDF buffer is truthy (has content).
    expect(pdfBuffer)./* TODO 1.4: toBeTruthy() */ toBeFalsy();
    expect(pdfBuffer.length).toBeGreaterThan(/* TODO 1.4: 0 */);
  });

  // Test 3: Date input cross-browser compatibility
  // WebKit handles <input type="date"> differently from Chromium and Firefox.
  test('date input fills correctly across browsers', async ({ page, browserName }) => {
    await page.goto('/dashboard');

    // Lumio's task creation modal has a due-date date input.
    await page.getByRole('button', { name: 'Add task' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    const dueDateInput = page.getByTestId('task-due-date');

    // TODO 1.5: Fill the date input with '2025-06-15' using fill().
    // Why not type()? fill() sets the value atomically — for date inputs it
    // avoids partial-entry bugs where only part of the date is entered.
    await dueDateInput./* TODO 1.5: fill('2025-06-15') */ clear();

    // TODO 1.6: Assert the input has the value '2025-06-15'.
    // Note: On WebKit, this may need to be verified differently — if this assertion
    // fails on WebKit, the hints.md explains the workaround.
    await expect(dueDateInput).toHaveValue(/* TODO 1.6: '2025-06-15' */);
  });

  // Test 4: Clipboard permission — WebKit requires explicit grant
  test('clipboard read requires permission on WebKit', async ({ page, context, browserName }) => {
    // TODO 1.7: Grant the clipboard-read permission before navigating.
    // Why grant permissions? Chromium grants clipboard-read implicitly in test
    // contexts, but WebKit follows the spec more strictly and requires explicit consent.
    await context.grantPermissions(/* TODO 1.7: ['clipboard-read', 'clipboard-write'] */);

    await page.goto('/dashboard');

    // Lumio has a "Copy share link" button on task cards.
    await page.getByRole('button', { name: 'Add task' }).click();
    await page.getByTestId('task-title-input').fill('Cross-browser task');
    await page.getByTestId('task-submit').click();

    const taskCard = page.getByTestId('task-card').first();
    await taskCard.getByRole('button', { name: 'Copy link' }).click();

    // TODO 1.8: Read the clipboard text and assert it contains 'lumio' or a task URL.
    // Use page.evaluate() to read navigator.clipboard.readText().
    const clipboardText = await page.evaluate(/* TODO 1.8: () => navigator.clipboard.readText() */);
    expect(clipboardText)./* TODO 1.8: toContain('task') */ toBeNull();
  });

});

// These tests use Playwright's device emulation to verify Lumio's responsive design.
// They run on Chromium in emulated mobile mode — for Safari-engine bugs, use the WebKit project (Part 1 of this lesson, formerly M34).

test.describe('Part 2 — Mobile Emulation & Responsive Testing (formerly M35)', () => {

  // Test 1: iPhone 14 viewport — hamburger menu appears
  test('hamburger menu is visible on iPhone 14', async ({ browser }) => {
    // TODO 2.1: Create a new browser context using the iPhone 14 device preset.
    // Why newContext() instead of test.use()? test.use() applies to all tests in the file.
    // newContext() lets you set the device for a single test, keeping other tests unaffected.
    const context = await browser.newContext(/* TODO 2.1: { ...devices['iPhone 14'] } */);
    const page = await context.newPage();

    await page.goto('/');

    // TODO 2.2: Assert that the full desktop nav links are NOT visible at this viewport.
    // At 390px wide, the desktop nav should be hidden by CSS.
    await expect(page.getByTestId(/* TODO 2.2: 'desktop-nav' */)).not.toBeVisible();

    // TODO 2.3: Assert that the hamburger menu button IS visible.
    // The button has aria role 'button' and an accessible name containing 'menu'.
    await expect(page.getByRole(/* TODO 2.3: 'button', { name: /menu/i } */)).toBeVisible();

    await context.close();
  });

  // Test 2: Hamburger menu opens to reveal nav links
  test('hamburger menu opens nav links on mobile', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPhone 14'] });
    const page = await context.newPage();
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: /menu/i });
    await menuButton.click();

    // TODO 2.4: Assert that the nav links are now visible after clicking the hamburger button.
    // Use getByRole('navigation') to scope to the nav element, then check a known link inside it.
    const nav = page.getByRole(/* TODO 2.4: 'navigation' */);
    await expect(nav.getByRole(/* TODO 2.4: 'link', { name: 'Pricing' } */)).toBeVisible();

    await context.close();
  });

  // Test 3: Dark mode via emulateMedia
  test('dark mode renders Lumio with correct color scheme', async ({ page }) => {
    await page.goto('/');

    // TODO 2.5: Activate dark mode using page.emulateMedia().
    // Why emulateMedia() instead of CSS class toggling? emulateMedia() simulates the OS-level
    // preference — it tests the actual prefers-color-scheme media query, not a manual theme toggle.
    await page.emulateMedia(/* TODO 2.5: { colorScheme: 'dark' } */);

    // TODO 2.6: Assert that the page body has the dark color scheme applied.
    // Use page.evaluate() to read the computed background color of the body.
    const bgColor = await page.evaluate(/* TODO 2.6: () => getComputedStyle(document.body).backgroundColor */);
    // Dark mode should NOT be white (rgb(255, 255, 255))
    expect(bgColor).not.toBe(/* TODO 2.6: 'rgb(255, 255, 255)' */);
  });

  // Test 4: Print stylesheet via emulateMedia
  test('print stylesheet hides navigation', async ({ page }) => {
    await page.goto('/');

    // TODO 2.7: Switch to print media type.
    // Why? Print stylesheets (@media print) often hide navigation, sidebars, and decorative
    // elements. Verifying this ensures the app prints cleanly for users who print pages.
    await page.emulateMedia(/* TODO 2.7: { media: 'print' } */);

    // In print mode, the nav should be hidden via @media print { nav { display: none } }
    // TODO 2.8: Assert the desktop navigation is not visible in print mode.
    await expect(page.getByTestId(/* TODO 2.8: 'desktop-nav' */)).not.toBeVisible();
  });

  // Test 5: Orientation change mid-test
  test('layout adjusts when rotating from portrait to landscape', async ({ browser }) => {
    const context = await browser.newContext({ ...devices['iPhone 14'] });
    const page = await context.newPage();
    await page.goto('/');

    // Portrait: 390×844
    const portraitViewport = page.viewportSize();
    expect(portraitViewport!.width).toBeLessThan(portraitViewport!.height);

    // TODO 2.9: Switch to landscape orientation by calling page.setViewportSize().
    // Landscape iPhone 14: width=844, height=390.
    // Why setViewportSize() vs context? setViewportSize() changes the viewport mid-test
    // without reloading — media queries respond immediately, like rotating a real device.
    await page.setViewportSize(/* TODO 2.9: { width: 844, height: 390 } */);

    const landscapeViewport = page.viewportSize();
    expect(landscapeViewport!.width).toBeGreaterThan(/* TODO 2.9: landscapeViewport!.height */);

    await context.close();
  });

});

// These tests exercise Playwright's permission and device API overrides.
// All permission grants happen on the context — before page navigation.

test.describe('Part 3 — Geolocation, Permissions & Device APIs (formerly M36)', () => {

  // Test 1: Workspace timezone detection with geolocation granted
  test('detects workspace timezone from geolocation when permitted', async ({ context, page }) => {
    // TODO 3.1: Grant the geolocation permission for this context.
    // This must happen BEFORE page.goto() — granting after the page loads
    // won't affect permission checks that already ran on navigation.
    await context.grantPermissions(/* TODO 3.1: ['geolocation'] */);

    // TODO 3.2: Set a fake geolocation to Paris, France.
    // Latitude: 48.8566, Longitude: 2.3522
    // Why fake it? Tests must be deterministic — a real geolocation would vary
    // by machine and CI runner location, making assertions impossible.
    await context.setGeolocation(/* TODO 3.2: { latitude: 48.8566, longitude: 2.3522 } */);

    await page.goto('/onboarding/workspace');

    // Lumio's workspace creation form auto-detects timezone from geolocation.
    // After granting geolocation and setting coordinates to Paris, the timezone
    // field should be pre-filled with 'Europe/Paris'.
    const timezoneInput = page.getByTestId('workspace-timezone-input');
    // TODO 3.3: Assert the timezone input has value 'Europe/Paris'.
    await expect(timezoneInput).toHaveValue(/* TODO 3.3: 'Europe/Paris' */);
  });

  // Test 2: Geolocation denied — fallback UI appears
  test('shows location error state when geolocation is denied', async ({ context, page }) => {
    // TODO 3.4: Clear all permissions so geolocation is denied by default.
    // In headless Playwright, clearPermissions() restores the "deny" default.
    await context.clearPermissions(/* TODO 3.4 */);

    await page.goto('/onboarding/workspace');

    // Trigger the geolocation detection
    await page.getByRole('button', { name: /detect location/i }).click();

    // TODO 3.5: Assert that a geolocation error message is visible.
    // Lumio shows an alert with text 'Location access denied' when geolocation fails.
    await expect(page.getByRole(/* TODO 3.5: 'alert' */)).toContainText(/* TODO 3.5: 'Location access denied' */);
  });

  // Test 3: Timezone context override
  test('Lumio date display respects the context timezone', async ({ browser }) => {
    // TODO 3.6: Create a new context with timezone set to 'America/New_York'.
    // This affects how JavaScript's Intl.DateTimeFormat formats dates in the page.
    const context = await browser.newContext(/* TODO 3.6: { timezoneId: 'America/New_York' } */);
    const page = await context.newPage();

    await page.goto('/dashboard');

    // Lumio's dashboard shows a "Today" header with the current date in the user's timezone.
    // With timezone set to New York, the displayed date should match what New York's midnight is.
    const todayHeader = page.getByTestId('dashboard-today-header');
    const displayedDate = await todayHeader.textContent();

    // TODO 3.7: Assert the displayed date is a non-empty string (basic sanity check).
    // A full assertion would compare the date to new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York' }).format(new Date())
    expect(displayedDate?.trim())./* TODO 3.7: toBeTruthy() */ toBeDefined();

    await context.close();
  });

  // Test 4: Camera permission prompt appears and is handled
  test('camera permission prompt is handled gracefully', async ({ context, page }) => {
    // TODO 3.8: Grant the camera permission.
    // Lumio's admin panel has a profile photo upload that can optionally use the camera.
    await context.grantPermissions(/* TODO 3.8: ['camera'] */);

    await page.goto('/settings/profile');

    // Lumio shows a "Take photo" option when camera permission is granted.
    const takePhotoButton = page.getByRole('button', { name: /take photo/i });

    // TODO 3.9: Assert the "Take photo" button is visible when camera permission is granted.
    await expect(takePhotoButton)./* TODO 3.9: toBeVisible() */ toBeHidden();
  });

});

// Playwright can:
//   - Wait for the service worker to be active: context.waitForEvent('serviceworker')
//   - Intercept fetch requests routed through the SW
//   - Simulate offline mode: context.setOffline(true)
//
// Service workers are registered per BrowserContext, not per Page.
// Use context.serviceWorkers() to list active workers.

test.describe('Part 4 — Offline, PWA & Service Workers (formerly M37)', () => {

  test.describe('Service Worker registration', () => {
    test('service worker is registered and active', async ({ context, page }) => {
      // TODO 4.1: Navigate to the app root to trigger SW registration.
      // Then wait for the service worker to be created using context.waitForEvent.
      // Use Promise.all to avoid a race between goto() and the SW creation event.
      const [sw] = await Promise.all([
        context.waitForEvent(/* TODO 4.1: 'serviceworker' */),
        page.goto('/'),
      ]);

      // TODO 4.2: Assert the service worker URL contains 'sw.js'.
      expect(sw.url()).toContain(/* TODO 4.2: 'sw.js' */);
    });

    test('service worker list is not empty after navigation', async ({ context, page }) => {
      await page.goto('/');
      // TODO 4.3: Wait briefly for SW activation, then call context.serviceWorkers().
      // Assert the returned array has at least one entry.
      // context.serviceWorkers() returns all currently active workers synchronously.
      await page.waitForTimeout(1000); // SW activation is async
      const workers = context.serviceWorkers();
      expect(workers.length).toBeGreaterThan(/* TODO 4.3: 0 */);
    });
  });

  test.describe('Offline mode', () => {
    test('app shows offline banner when network is disconnected', async ({ context, page }) => {
      await page.goto('/projects/demo/board');
      // Wait for SW to be active so caching is ready
      await page.waitForTimeout(1000);

      // TODO 4.4: Set the context to offline mode using context.setOffline(true).
      // This disables all network requests for all pages in the context.
      // It simulates the device losing connectivity, not a server error.
      await context.setOffline(/* TODO 4.4: true */);

      // TODO 4.5: Reload the page (offline) and assert the offline banner appears.
      // data-testid="offline-banner"
      // The SW should serve cached assets; the banner appears because the app
      // detects the absence of a network connection via navigator.onLine.
      await page.reload();
      await expect(page.getByTestId(/* TODO 4.5: 'offline-banner' */)).toBeVisible();
    });

    test('cached board content is still visible when offline', async ({ context, page }) => {
      // TODO 4.6: Load the board online first (SW caches it), then go offline and
      // reload. Assert that kanban column content is still visible.
      // Why: The PWA's SW caches app-shell and API responses. Users should be
      // able to view (though not edit) their board without a connection.
      await page.goto('/projects/demo/board');
      await page.waitForTimeout(1000); // allow SW to cache

      await context.setOffline(true);
      await page.reload();

      // TODO 4.6: Assert at least one kanban column is visible after offline reload.
      await expect(page.getByTestId(/* TODO 4.6: 'kanban-column-todo' */)).toBeVisible();
    });

    test('goes back online after setOffline(false)', async ({ context, page }) => {
      await page.goto('/projects/demo/board');
      await context.setOffline(true);
      await page.reload();
      await expect(page.getByTestId('offline-banner')).toBeVisible();

      // TODO 4.7: Restore network connectivity with context.setOffline(false).
      // Then reload and assert the offline banner is gone.
      await context.setOffline(/* TODO 4.7: false */);
      await page.reload();
      await expect(page.getByTestId('offline-banner'))/* TODO 4.7: not.toBeVisible() */;
    });
  });

});
