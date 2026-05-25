import { test, expect } from '../fixtures/fixtures';

// M70: Broken Link & Navigation Monitoring
// Two complementary tools: page.on('response') for passive monitoring during navigation,
// and the request fixture for active status checks without loading a full browser page.

test.describe('M70 — Broken Link & Navigation Monitoring', () => {

  // Test 1: Passive 404 detection using page.on('response').
  test('landing page loads without any 404 responses', async ({ page }) => {
    const found404s: string[] = [];
    page.on('response', response => {
      if (response.status() === 404) found404s.push(response.url());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // TODO 1: Assert found404s has length 0 — no resource loaded with a 404 status.
    // The default 999 always fails: a healthy page loads far fewer than 999 broken resources.
    expect(found404s).toHaveLength(/* TODO 1: 0 */ 999);
  });

  // Test 2: Active link checking via the request fixture (no browser overhead).
  test('key marketing pages respond with 2xx or 3xx status', async ({ request }) => {
    const links = ['/pricing', '/docs', '/blog'];

    for (const link of links) {
      // TODO 2: Use request.get(link) to fetch each link and assert the status is less than 400.
      // The default '/PLACEHOLDER' returns 404, which is not < 400 — the test fails as expected.
      const response = await request.get(/* TODO 2: link */ '/PLACEHOLDER');
      expect(response.status()).toBeLessThan(400);
    }
  });

  // Test 3: Counting internal nav links — verifies the nav rendered correctly.
  test('header navigation contains at least 3 internal links', async ({ page }) => {
    await page.goto('/');
    // [href^="/"] selects only internal links — excludes external URLs and mailto: addresses.
    const navLinks = page.locator('nav a[href^="/"]');
    const count = await navLinks.count();

    // TODO 3: Assert count is greater than or equal to 3.
    // The default 999 always fails — Lumio's nav has far fewer than 999 links.
    expect(count).toBeGreaterThanOrEqual(/* TODO 3: 3 */ 999);
  });

  // Test 4: Redirect chain — page.goto() follows all redirects and reflects the final URL.
  test('navigating to /dashboard without auth redirects to /login', async ({ page }) => {
    // page.goto() follows all redirects automatically and updates page.url() to the final destination.
    await page.goto('/dashboard');

    // TODO 4: Assert the page landed on a URL matching /login/ using toHaveURL.
    await expect(page).toHaveURL(/* TODO 4: /login/ */ /PLACEHOLDER/);
  });

  // Test 5: response.url() gives the final URL after the full redirect chain.
  test('response.url() reflects the final destination after redirect', async ({ page }) => {
    // page.goto() returns the Response of the final request after all redirects.
    const response = await page.goto('/dashboard');

    // response.url() is the URL of the last response — not the originally requested URL.
    // TODO 5: Assert response.url() contains the string 'login'.
    expect(response!.url()).toContain(/* TODO 5: 'login' */ 'PLACEHOLDER');
  });

  // Test 6: Anchor fragment validation — each #fragment link must have a matching target element.
  test('anchor links on the pricing page point to existing elements', async ({ page }) => {
    await page.goto('/pricing');

    // Collect all anchor links (href="#something") from the pricing page.
    const anchorHrefs = await page.locator('a[href^="#"]').evaluateAll(
      links => links.map(l => l.getAttribute('href')!)
    );

    for (const href of anchorHrefs) {
      const fragment = href.slice(1); // strip the leading '#'
      // TODO 6: Assert that the element with id=fragment is attached to the DOM.
      // Use toBeAttached() — the element may be off-screen but must exist.
      await expect(page.locator(`#${fragment}`))./* TODO 6: toBeAttached() */ toBeHidden();
    }
  });

  // Test 7: Footer links in bulk — check every footer link returns a non-error status.
  test('all footer links respond with a non-error status', async ({ page, request }) => {
    await page.goto('/');

    const footerHrefs = await page.locator('footer a[href^="/"]').evaluateAll(
      links => links.map(l => l.getAttribute('href')!)
    );

    for (const href of footerHrefs) {
      const response = await request.get(href);
      // TODO 7: Assert response.status() is less than 400 (accepts 2xx and 3xx, rejects 4xx and 5xx).
      expect(response.status()).toBeLessThan(/* TODO 7: 400 */ 0);
    }
  });

  // Test 8: A nonexistent page must return a proper 404 status code.
  test('a nonexistent page returns status 404', async ({ request }) => {
    // Some frameworks return 200 with an error page body — search engines then index the error page.
    // TODO 8: Use request.get('/this-page-does-not-exist-xyz') to check a nonexistent path.
    // The default '/' returns 200, not 404 — change it to a path that doesn't exist.
    const response = await request.get(/* TODO 8: '/this-page-does-not-exist-xyz' */ '/');
    expect(response.status()).toBe(404);
  });

});
