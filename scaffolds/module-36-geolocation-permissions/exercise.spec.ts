import { test, expect } from '../fixtures/fixtures';

// M36: Geolocation, Permissions & Device APIs
//
// These tests exercise Playwright's permission and device API overrides.
// All permission grants happen on the context — before page navigation.

test.describe('M36 — Geolocation & Permissions', () => {

  // Test 1: Workspace timezone detection with geolocation granted
  test('detects workspace timezone from geolocation when permitted', async ({ context, page }) => {
    // TODO 1: Grant the geolocation permission for this context.
    // This must happen BEFORE page.goto() — granting after the page loads
    // won't affect permission checks that already ran on navigation.
    await context.grantPermissions(/* TODO 1: ['geolocation'] */);

    // TODO 2: Set a fake geolocation to Paris, France.
    // Latitude: 48.8566, Longitude: 2.3522
    // Why fake it? Tests must be deterministic — a real geolocation would vary
    // by machine and CI runner location, making assertions impossible.
    await context.setGeolocation(/* TODO 2: { latitude: 48.8566, longitude: 2.3522 } */);

    await page.goto('/onboarding/workspace');

    // Lumio's workspace creation form auto-detects timezone from geolocation.
    // After granting geolocation and setting coordinates to Paris, the timezone
    // field should be pre-filled with 'Europe/Paris'.
    const timezoneInput = page.getByTestId('workspace-timezone-input');
    // TODO 3: Assert the timezone input has value 'Europe/Paris'.
    await expect(timezoneInput).toHaveValue(/* TODO 3: 'Europe/Paris' */);
  });

  // Test 2: Geolocation denied — fallback UI appears
  test('shows location error state when geolocation is denied', async ({ context, page }) => {
    // TODO 4: Clear all permissions so geolocation is denied by default.
    // In headless Playwright, clearPermissions() restores the "deny" default.
    await context.clearPermissions(/* TODO 4 */);

    await page.goto('/onboarding/workspace');

    // Trigger the geolocation detection
    await page.getByRole('button', { name: /detect location/i }).click();

    // TODO 5: Assert that a geolocation error message is visible.
    // Lumio shows an alert with text 'Location access denied' when geolocation fails.
    await expect(page.getByRole(/* TODO 5: 'alert' */)).toContainText(/* TODO 5: 'Location access denied' */);
  });

  // Test 3: Timezone context override
  test('Lumio date display respects the context timezone', async ({ browser }) => {
    // TODO 6: Create a new context with timezone set to 'America/New_York'.
    // This affects how JavaScript's Intl.DateTimeFormat formats dates in the page.
    const context = await browser.newContext(/* TODO 6: { timezoneId: 'America/New_York' } */);
    const page = await context.newPage();

    await page.goto('/dashboard');

    // Lumio's dashboard shows a "Today" header with the current date in the user's timezone.
    // With timezone set to New York, the displayed date should match what New York's midnight is.
    const todayHeader = page.getByTestId('dashboard-today-header');
    const displayedDate = await todayHeader.textContent();

    // TODO 7: Assert the displayed date is a non-empty string (basic sanity check).
    // A full assertion would compare the date to new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York' }).format(new Date())
    expect(displayedDate?.trim())./* TODO 7: toBeTruthy() */ toBeDefined();

    await context.close();
  });

  // Test 4: Camera permission prompt appears and is handled
  test('camera permission prompt is handled gracefully', async ({ context, page }) => {
    // TODO 8: Grant the camera permission.
    // Lumio's admin panel has a profile photo upload that can optionally use the camera.
    await context.grantPermissions(/* TODO 8: ['camera'] */);

    await page.goto('/settings/profile');

    // Lumio shows a "Take photo" option when camera permission is granted.
    const takePhotoButton = page.getByRole('button', { name: /take photo/i });

    // TODO 9: Assert the "Take photo" button is visible when camera permission is granted.
    await expect(takePhotoButton)./* TODO 9: toBeVisible() */;
  });

});
