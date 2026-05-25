import { test, expect } from '../fixtures/fixtures';

// M69: SEO & Meta Verification
// Playwright can validate the invisible contract that keeps Lumio discoverable in search engines.
// CSS attribute selectors, toHaveTitle, the request fixture, and JSON.parse form the toolkit.

test.describe('M69 — SEO & Meta Verification', () => {

  // Test 1: Title tag — the most basic but most visible SEO signal.
  test('landing page title contains "Lumio"', async ({ page }) => {
    await page.goto('/');
    // toHaveTitle retries until the title stabilizes — it handles SPA hydration correctly.
    // TODO 1: Pass a regex matching 'Lumio' to toHaveTitle.
    await expect(page).toHaveTitle(/* TODO 1: /Lumio/ */ /PLACEHOLDER/);
  });

  // Test 2: Meta description — sets the preview text in search engine results pages.
  test('landing page has a non-empty meta description', async ({ page }) => {
    await page.goto('/');
    // Meta tags have no ARIA role — CSS attribute selectors are the right locator strategy.
    // TODO 2: Locate meta[name="description"] using page.locator() with the correct CSS attribute selector.
    const metaDesc = page.locator(/* TODO 2: 'meta[name="description"]' */ 'meta[name="PLACEHOLDER"]');
    await expect(metaDesc).toHaveAttribute('content', /\S+/);
  });

  // Test 3: Open Graph tags — control link previews on Slack, LinkedIn, and Twitter/X.
  test('landing page has og:title, og:description, and og:image', async ({ page }) => {
    await page.goto('/');
    // OG tags use property="og:..." (not name="...") — the selector differs from standard meta.
    const ogTitle = page.locator('meta[property="og:title"]');
    // TODO 3: Assert ogTitle has a non-empty content attribute using the non-empty regex /\S+/.
    await expect(ogTitle).toHaveAttribute('content', /* TODO 3: /\S+/ */ '');

    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveAttribute('content', /\S+/);

    // TODO 4: Locate the og:image meta tag using the correct property attribute selector.
    const ogImage = page.locator(/* TODO 4: 'meta[property="og:image"]' */ 'meta[property="PLACEHOLDER"]');
    await expect(ogImage).toHaveAttribute('content', /\S+/);
  });

  // Test 4: JSON-LD structured data — machine-readable schema.org markup for search rich results.
  test('landing page has valid JSON-LD with @type SoftwareApplication', async ({ page }) => {
    await page.goto('/');
    // JSON-LD lives in <script type="application/ld+json"> — never visually rendered, but must be in the DOM.
    const jsonLd = page.locator('script[type="application/ld+json"]');

    // TODO 5: Replace toBeHidden() with toBeAttached() — the correct assertion for non-visual elements.
    // Script tags are never "visible" to the eye or screen readers; toBeAttached() checks DOM presence.
    await expect(jsonLd)./* TODO 5: toBeAttached() */ toBeHidden();

    const content = await jsonLd.textContent();
    const parsed = JSON.parse(content!);

    // TODO 6: Assert parsed['@type'] equals 'SoftwareApplication'.
    expect(parsed['@type']).toBe(/* TODO 6: 'SoftwareApplication' */ 'PLACEHOLDER');
  });

  // Test 5: Canonical URL — tells search engines the "true" URL to index for the page.
  test('landing page has a canonical URL tag pointing to the production domain', async ({ page }) => {
    await page.goto('/');
    // Canonical tags prevent duplicate-content penalties when the same content is at multiple URLs.
    const canonical = page.locator('link[rel="canonical"]');

    // TODO 7: Assert canonical has an 'href' attribute matching the regex /lumio\.io/.
    // The \. escapes the dot — in regex, an unescaped dot matches any character.
    await expect(canonical).toHaveAttribute('href', /* TODO 7: /lumio\.io/ */ /PLACEHOLDER/);
  });

  // Test 6: robots.txt — the access control list for search engine crawlers.
  test('robots.txt is present and does not block all crawlers', async ({ request }) => {
    // Use the request fixture — no browser page is needed for plain HTTP resources.
    const response = await request.get('/robots.txt');

    // TODO 8: Assert the response status is 200.
    expect(response.status()).toBe(/* TODO 8: 200 */ 0);

    const body = await response.text();
    // 'Disallow: /' blocks all crawlers from the entire site — a catastrophic misconfiguration.
    // TODO 9: Assert body does not contain 'Disallow: /'.
    // Note: the default '' always fails because every string contains the empty string.
    expect(body).not.toContain(/* TODO 9: 'Disallow: /' */ '');
  });

  // Test 7: sitemap.xml — the manifest of all URLs search engines should index.
  test('sitemap.xml is present and includes the Lumio domain', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);

    const body = await response.text();
    // TODO 10: Assert the sitemap body contains the string 'lumio.io'.
    // A sitemap pointing to localhost or a staging URL is a common deployment mistake.
    expect(body).toContain(/* TODO 10: 'lumio.io' */ 'PLACEHOLDER');
  });

  // Test 8: Unique page titles — duplicate titles split SEO link equity across pages.
  test('pricing page has a different title from the landing page', async ({ page }) => {
    await page.goto('/');
    const landingTitle = await page.title();

    await page.goto('/pricing');
    const pricingTitle = await page.title();

    // Each marketing page must have a unique title — duplicate titles confuse search engines.
    // TODO 11: Assert pricingTitle does not equal landingTitle using not.toBe().
    // The default pricingTitle always fails: a string is never not-equal to itself.
    expect(pricingTitle).not.toBe(/* TODO 11: landingTitle */ pricingTitle);
  });

});
