import { test, expect } from '../fixtures/fixtures';
import * as path from 'path';

// M87: Secrets & Security in Tests
// Each test demonstrates one credential-safety or artifact-masking pattern.

test.describe('M87 — Secrets & Security in Tests', () => {

  // Test 1: Credentials come from environment variables, not string literals.
  // Reading from process.env at runtime keeps secrets out of source control.
  test('secrets: credentials are loaded from environment variables', async ({ page }) => {
    // Hardcoding passwords in test files is a security violation.
    // process.env.TEST_PASSWORD is set in .env.test (gitignored) or CI secrets.
    // TODO 1: Replace 'PLACEHOLDER' with process.env.TEST_PASSWORD ?? 'password123'
    // (The fallback 'password123' is safe here because this is a test-only seed account.)
    const password = /* TODO 1: process.env.TEST_PASSWORD ?? 'password123' */ 'PLACEHOLDER';
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  // Test 2: process.env values must be defined — fail fast, never silently use empty string.
  // An empty string credential would let the test "pass" against an auth system that skips blank passwords.
  test('secrets: missing env var triggers a clear error, not a silent empty string', async ({ page }) => {
    // The pattern: read the env var, then assert it is truthy before using it.
    // An empty-string password that passes auth is a worse outcome than a thrown error.
    const email = process.env.TEST_EMAIL ?? 'admin@lumio.test';
    // TODO 2: Replace '' with 'admin@lumio.test' — assert that email is truthy (non-empty).
    expect(email).toBeTruthy();
    expect(email).not.toBe(/* TODO 2: '' */ 'SHOULD_NOT_BE_THIS');
    await page.goto('/login');
    await expect(page.getByLabel('Email')).toBeVisible();
  });

  // Test 3: Screenshot masking — sensitive UI values are blurred in captured images.
  // The password field must not appear in plain text in any test artifact.
  test('masking: password field is masked in screenshots', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');

    // page.screenshot({ mask }) blurs the matched elements in the captured PNG.
    // Attach the masked screenshot to demonstrate the masking is applied.
    // TODO 3: Replace page.getByLabel('Email') with page.getByLabel('Password')
    // — the password field is the sensitive element that must be masked.
    const maskedField = page.getByLabel(/* TODO 3: 'Password' */ 'Email');
    const screenshot = await page.screenshot({ mask: [maskedField] });
    await test.info().attach('masked-login-screenshot', {
      body: screenshot,
      contentType: 'image/png',
    });
    expect(screenshot.byteLength).toBeGreaterThan(0);
  });

  // Test 4: API keys must not appear in test step labels or annotation descriptions.
  // testInfo.annotations stores metadata — values here appear in HTML reports.
  test('masking: API key is not exposed in annotation descriptions', async ({ page }, testInfo) => {
    const apiKey = process.env.TEST_API_KEY ?? 'test-key-abc123';
    // Safe annotation: record that an API key was used, but NOT the key value itself.
    // TODO 4: Replace 'PLACEHOLDER' with 'api-key-present' to annotate presence without exposing value.
    testInfo.annotations.push({
      type: 'security',
      description: /* TODO 4: 'api-key-present' */ 'PLACEHOLDER',
    });
    await page.goto('/login');
    // The annotation must describe presence, not the value.
    const annotation = testInfo.annotations.find(a => a.type === 'security');
    expect(annotation?.description).not.toBe(apiKey);
    expect(annotation?.description).toBe('api-key-present');
  });

  // Test 5: Database URL must point at a test instance, not production.
  // This test verifies the env var convention is followed in the test environment.
  test('isolation: DATABASE_URL points at a test instance, not production', async ({ page }) => {
    const dbUrl = process.env.DATABASE_URL ?? '';
    // A production database URL should never contain 'prod', 'production', or a cloud hostname.
    // The test DB URL should contain 'localhost', '127.0.0.1', or 'test' in the database name.
    // TODO 5: Replace /PLACEHOLDER/ with /localhost|127\.0\.0\.1|lumio_test/
    // — assert the DATABASE_URL matches a known safe pattern.
    if (dbUrl) {
      expect(dbUrl).toMatch(/* TODO 5: /localhost|127\.0\.0\.1|lumio_test/ */ /PLACEHOLDER/);
    }
    await page.goto('/');
    await expect(page).toHaveTitle(/Lumio/);
  });

  // Test 6: Authorization headers in network requests are not logged in plain text.
  // Intercepting the request lets us verify the header exists without logging its value.
  test('masking: Authorization header is present but its value is not asserted as a literal', async ({ page }) => {
    let authHeaderFound = false;

    // Intercept all API requests to check for Authorization header presence.
    await page.route('/api/**', async route => {
      const headers = route.request().headers();
      if (headers['authorization']) {
        authHeaderFound = true;
      }
      await route.continue();
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@lumio.test');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(/dashboard/);

    // After login, dashboard API calls should include an Authorization header.
    // TODO 6: Replace false with true — after login, API calls carry auth headers.
    expect(authHeaderFound).toBe(/* TODO 6: true */ false);
  });

  // Test 7: Sensitive output directories are not world-readable — outputDir is local only.
  // This test verifies the outputDir path does not reference a shared or cloud mount.
  test('isolation: test artifacts are written to a local output directory', async ({ page }, testInfo) => {
    // testInfo.outputDir is the per-test artifact directory — must be under the local project root.
    // It must not reference a cloud share, NFS mount, or production path.
    // TODO 7: Replace 'PLACEHOLDER' with 'test-results' — artifacts must land in test-results/.
    expect(testInfo.outputDir).toContain(/* TODO 7: 'test-results' */ 'PLACEHOLDER');
    await page.goto('/');
    await expect(page).toHaveTitle(/Lumio/);
  });

});
