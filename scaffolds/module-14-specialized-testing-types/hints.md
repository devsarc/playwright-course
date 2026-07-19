# Lesson 14 Hints

## Part 1 — Localization & i18n Testing (formerly M63)

## TODO 1.1 — locale URL

```typescript
const url = code === 'en' ? '/' : `/${code}`;
await page.goto(url);
```

## TODO 1.2 — translated heading

```typescript
await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
```

## TODO 1.3 — open language switcher

```typescript
await page.getByTestId('language-switcher').click();
```

## TODO 1.4 — select French

```typescript
await page.getByTestId('lang-option-fr').click();
```

## TODO 1.5 — URL assertion

```typescript
await expect(page).toHaveURL(/\/fr/);
```

## TODO 1.6 — French heading

```typescript
await expect(page.getByRole('heading', { level: 1 })).toHaveText('Organisez votre travail');
```

## TODO 1.7 — locale persists

```typescript
await page.goto('/fr');
await page.getByRole('link', { name: 'Projets' }).click();
await expect(page).toHaveURL(/^\/fr/);
```

## TODO 1.8 — date format

```typescript
const dateText = await page.getByTestId('card-due-date').first().textContent();
expect(dateText).not.toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
```

## TODO 1.9 — price text truthy

```typescript
expect(priceText?.length).toBeGreaterThan(0);
```

## Parametric locale tests

The `for...of` loop over LOCALES generates one test per locale automatically:
- "en locale shows correct hero heading"
- "fr locale shows correct hero heading"
- "es locale shows correct hero heading"

All three appear in the test report and can be run individually with --grep.

## Part 2 — Feature Flag & A/B Testing (formerly M64)

## TODO 2.1 — addInitScript with flag enabled

```typescript
await page.addInitScript(() => {
  (window as any).__featureFlags = { aiSuggestions: true };
});
```

The script body runs inside the browser, before any page scripts. Set flags on `window` here — they'll be synchronously available when the React app initializes.

## TODO 2.2 — Assert panel is visible

```typescript
await expect(page.getByTestId('ai-suggestions-panel')).toBeVisible();
```

## TODO 2.3 — Flag disabled in init script

```typescript
(window as any).__featureFlags = { aiSuggestions: false };
```

## TODO 2.4 — Assert panel is hidden

```typescript
await expect(page.getByTestId('ai-suggestions-panel')).toBeHidden();
```

## TODO 2.5 — Parameterized addInitScript

```typescript
await page.addInitScript(
  (enabled: boolean) => { (window as any).__featureFlags = { aiSuggestions: enabled }; },
  true
);
```

The second argument to `addInitScript()` is serialized (JSON) and passed as the first argument to the browser function. Only serializable values work — no functions, no DOM elements, no class instances.

## TODO 2.6 — Cookie value for enabled state

```typescript
value: 'enabled',
```

Full cookie setup:
```typescript
await context.addCookies([{
  name: 'feature_ai_suggestions',
  value: 'enabled',
  domain: 'localhost',
  path: '/',
}]);
```

## TODO 2.7 — Assert panel visible after cookie

```typescript
await expect(page.getByTestId('ai-suggestions-panel')).toBeVisible();
```

## TODO 2.8 — URL with flag parameter

```typescript
await page.goto('/dashboard?flags=beta_dashboard');
```

## TODO 2.9 — Assert beta banner visible

```typescript
await expect(page.getByTestId('beta-dashboard-banner')).toBeVisible();
```

## TODO 2.10 — Assert flag persists after SPA navigation

```typescript
expect(flagValue).toBe(true);
```

`addInitScript()` runs once when the page loads. In a SPA, client-side route changes (`pushState`) don't trigger a new page load — so `window.__featureFlags` is never reset. The flag remains set for the entire session.

## Part 3 — Security Workflow Testing (formerly M65)

## TODO 3.1 — Fresh browser context

```typescript
const freshContext = await browser.newContext();
```

Omit `storageState` entirely (don't set it to `undefined` explicitly — just don't pass it). A context with no `storageState` has no cookies, no localStorage, and no session tokens. It's the cleanest way to simulate an unauthenticated visitor.

## TODO 3.2 — Assert redirect to login

```typescript
await expect(freshPage).toHaveURL(/.*login.*/);
```

The regex `/.*login.*/` matches any URL containing "login" — e.g. `/login`, `/auth/login`, `/login?redirect=/dashboard`.

## TODO 3.3 — Assert URL does not contain /admin

```typescript
expect(page.url()).not.toContain('/admin');
```

A member redirected from `/admin` lands on `/dashboard` or gets a 403 page — either way, the URL no longer contains `/admin`.

## TODO 3.4 — CSRF token locator

```typescript
const csrfToken = await page.locator('input[name="csrf_token"]').inputValue();
```

Lumio embeds the CSRF token as a hidden input inside each form. `locator('input[name="csrf_token"]')` finds it by its `name` attribute.

## TODO 3.5 — Assert token length

```typescript
expect(csrfToken.length).toBeGreaterThan(10);
```

A real CSRF token is typically 32–64 characters (base64-encoded random bytes). Asserting length > 10 is a minimal sanity check that it's not an empty string or placeholder.

## TODO 3.6 — Capture CSRF header

```typescript
capturedCsrfHeader = req.headers()['x-csrf-token'] ?? '';
```

Playwright lowercases all header names. The Lumio client sends the CSRF token as `X-CSRF-Token` — access it as `x-csrf-token`.

## TODO 3.7 — Assert header is truthy

```typescript
expect(capturedCsrfHeader).toBeTruthy();
```

## TODO 3.8 — page.evaluate to read window property

```typescript
const xssExecuted = await page.evaluate(() => (window as any).__xssExecuted);
```

`page.evaluate()` runs in the browser context and returns a serializable value. If the `<script>` tag executed, `window.__xssExecuted` would be `true`. If sanitized correctly, the property doesn't exist and returns `undefined`.

## TODO 3.9 — Assert XSS not executed

```typescript
expect(xssExecuted).toBe(undefined);
```

`undefined` (not `null`, not `false`) — if the property was never set, `evaluate()` returns `undefined` from JavaScript.

## TODO 3.10 — Assert onerror not fired

```typescript
expect(imgErrorFired).toBe(undefined);
```

If React's JSX rendering sanitized the `<img>` tag (rendering it as escaped text rather than an actual `<img>` element), the `onerror` attribute never runs.

## TODO 3.11 — Screenshot mask

```typescript
mask: [page.getByTestId('api-key-value')],
```

`mask` accepts an array of `Locator` objects. Playwright replaces each matched element with a solid magenta rectangle in the screenshot. The element is still in the DOM — only the visual output is masked.

## Part 4 — OAuth & SSO Deep Dive (formerly M66)

## TODO 4.1 — Assert code_challenge in URL params

```typescript
expect(params.get('code_challenge')).toBeTruthy();
```

Also check `code_challenge_method` — it should be `'S256'` (SHA-256). An authorization URL without `code_challenge` is using the non-PKCE flow, which is insecure for browser apps.

## TODO 4.2 — Route authorization endpoint

```typescript
await page.route('https://github.com/login/oauth/authorize*', route => {
  const state = new URL(route.request().url()).searchParams.get('state') ?? '';
  const callbackUrl = new URL('http://localhost:3000/api/auth/callback/github');
  callbackUrl.searchParams.set('code', 'test-auth-code');
  callbackUrl.searchParams.set('state', state);
  route.fulfill({ status: 302, headers: { Location: callbackUrl.toString() } });
});
```

The trailing `*` in the pattern matches the query string (GitHub's authorize URL has many params). Forwarding the `state` value is essential — NextAuth validates that the callback `state` matches the original request's `state`.

## TODO 4.3 — Assert redirect to dashboard

```typescript
expect(page.url()).toContain('/dashboard');
```

## TODO 4.4 — access_token value in mock response

```typescript
access_token: 'mock-access-token',
```

## TODO 4.5 — Assert tokenResponseBody contains access_token

```typescript
expect(tokenResponseBody).toContain('access_token');
```

## TODO 4.6 — 401 status for expired refresh token

```typescript
route.fulfill({
  status: 401,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ error: 'RefreshAccessTokenError' }),
});
```

NextAuth catches this response and clears the session, triggering a redirect to the login page. The `RefreshAccessTokenError` string is the NextAuth convention for this specific error.

## TODO 4.7 — Assert redirect to login

```typescript
await expect(page).toHaveURL(/.*login.*/);
```

## TODO 4.8 — Assert state is truthy

```typescript
expect(capturedState).toBeTruthy();
```

The `state` parameter should be a random opaque value (typically a UUID or base64-encoded random bytes). NextAuth generates this automatically. Its purpose: when the callback arrives, NextAuth checks that `state` matches what it sent — preventing CSRF attacks in the OAuth flow.

## TODO 4.9 — PKCE hash method

```typescript
const pkceMethod = 'S256';
```

`S256` means SHA-256. The `code_verifier` is a random 43–128 character string; `code_challenge = BASE64URL(SHA256(code_verifier))`. An attacker who steals the `code` cannot exchange it for tokens without the original `code_verifier`.

## Part 5 — Chatbot & Rich UI Interaction (formerly M67)

## TODO 5.1 — Click and pressSequentially on contenteditable

```typescript
await chatInput.click();
await chatInput.pressSequentially('What tasks are overdue?');
```

`fill()` clears the element and sets the value via the DOM API — it works on `<input>` and `<textarea>`, but not `contenteditable`. `pressSequentially()` fires a `keydown`, `keypress`, `input`, and `keyup` event per character, exactly as a user typing would.

## TODO 5.2 — Assert contenteditable text

```typescript
await expect(chatInput).toContainText('What tasks are overdue?');
```

`toContainText()` reads the element's `textContent` — works for both standard elements and `contenteditable`.

## TODO 5.3 — Press Enter to send

```typescript
await page.keyboard.press('Enter');
```

`page.keyboard.press()` fires a global key event. For the chat input, this triggers the send handler.

## TODO 5.4 — Assert typing indicator visible

```typescript
await expect(page.getByTestId('chat-typing-indicator')).toBeVisible({ timeout: 1000 });
```

The 1000ms timeout gives the app time to register the submission and show the indicator. If it's not visible within 1 second, the send handler is broken.

## TODO 5.5 — Route the chat API

```typescript
await page.route('**/api/chat', route => {
  route.fulfill({
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
    body: MOCK_CHAT_SSE,
  });
});
```

The `MOCK_CHAT_SSE` constant at the top of the file contains the complete SSE stream. The response body is delivered synchronously — the browser parses it as a stream of `data:` events.

## TODO 5.6 — Assert last message content

```typescript
await expect(page.getByTestId('chat-message').last()).toContainText('3 overdue');
```

`.last()` gets the final message in the list. After streaming completes, all three tokens from `MOCK_CHAT_SSE` are concatenated: "You have 3 overdue tasks."

## TODO 5.7 — Assert indicator hidden

```typescript
await expect(page.getByTestId('chat-typing-indicator')).toBeHidden({ timeout: 5000 });
```

## TODO 5.8 — pressSequentially in TipTap editor

```typescript
await editor.pressSequentially('My task note');
```

## TODO 5.9 — Assert editor text

```typescript
await expect(editor).toContainText('My task note');
```

## TODO 5.10 — Assert message count

```typescript
await expect(chatMessages).toHaveCount(initialCount + 2);
```

+2 because: one message for the user's question and one for the AI's response. If `initialCount` was 0 (empty chat), the count should be 2 after one exchange.

## Part 6 — CMS & Admin Panel Automation (formerly M68)

## TODO 6.1 — columnheader role locator

```typescript
const emailHeader = page.getByRole('columnheader', { name: 'Email' });
```

`getByRole('columnheader')` matches `<th>` elements with `role="columnheader"` (implicit for `<th>` inside `<thead>`). The `name` option matches the accessible name, which is the visible text.

## TODO 6.2 — Assert aria-sort ascending

```typescript
await expect(emailHeader).toHaveAttribute('aria-sort', 'ascending');
```

The `aria-sort` attribute has four valid values: `'none'`, `'ascending'`, `'descending'`, `'other'`. Well-built admin tables update this attribute on sort to communicate state to assistive technology — and to your tests.

## TODO 6.3 — Assert aria-sort descending

```typescript
await expect(emailHeader).toHaveAttribute('aria-sort', 'descending');
```

## TODO 6.4 — Filter input placeholder

```typescript
const filterInput = page.getByPlaceholder('Filter by email');
```

## TODO 6.5 — Assert count decreased

```typescript
expect(afterCount).toBeLessThan(initialCount);
```

## TODO 6.6 — Next page button name

```typescript
await page.getByRole('button', { name: 'Next page' }).click();
```

## TODO 6.7 — Assert pagination status changed

```typescript
expect(statusAfter).not.toBe(statusBefore);
```

`statusBefore` might be "1–10 of 47" and `statusAfter` "11–20 of 47". Not-equal is sufficient here — you don't need to know the exact values.

## TODO 6.8 — Checkbox role in row

```typescript
await rows.nth(1).getByRole('checkbox').check();
```

`rows.nth(1)` is the first data row (nth(0) is the header). Each row has a checkbox for selection — `getByRole('checkbox')` finds it within that row's scope.

## TODO 6.9 — Assert row count after delete

```typescript
await expect(rows).toHaveCount(initialCount - 3);
```

Three rows were selected and deleted. The header row remains, so the new count is `initialCount - 3`.

## TODO 6.10 — setInputFiles on hidden input

```typescript
await page.locator('input[type="file"]').setInputFiles(logoFile);
```

`setInputFiles()` works on hidden inputs — no need to make the element visible. This bypasses the OS file picker entirely, which is essential for CI where no graphical environment is available.

## TODO 6.11 — Assert logo preview visible

```typescript
await expect(page.getByTestId('logo-preview')).toBeVisible();
```

## Part 7 — SEO & Meta Verification (formerly M69)

## TODO 7.1 — toHaveTitle with a regex

```typescript
await expect(page).toHaveTitle(/Lumio/);
```

`/Lumio/` is a regex that matches any title containing "Lumio". Use a regex rather than an exact string when the full title format may change (e.g., "Lumio" vs "Lumio — Team Productivity"). `toHaveTitle()` retries internally until the title stabilizes, handling SPA hydration without explicit waits.

## TODO 7.2 — CSS attribute selector for meta[name]

```typescript
const metaDesc = page.locator('meta[name="description"]');
```

CSS attribute selectors match elements by attribute name and value. `meta[name="description"]` finds the standard HTML meta description tag. Note: Open Graph tags use `property=` not `name=`, requiring a different selector pattern.

## TODO 7.3 — Non-empty content regex

```typescript
await expect(ogTitle).toHaveAttribute('content', /\S+/);
```

`/\S+/` is a regex matching one or more non-whitespace characters. This is more robust than asserting a specific marketing string — it verifies the attribute has meaningful content without coupling the test to exact copy that may change.

## TODO 7.4 — og:image property selector

```typescript
const ogImage = page.locator('meta[property="og:image"]');
```

OG tags use `property` not `name`. Without an `og:image`, social platform link previews show a blank thumbnail, significantly reducing click-through rates. All three — `og:title`, `og:description`, `og:image` — are required for a complete social preview.

## TODO 7.5 — toBeAttached() for non-visible elements

```typescript
await expect(jsonLd).toBeAttached();
```

`toBeAttached()` verifies the element exists in the DOM. `toBeVisible()` would fail on `<script>` tags — they are never rendered visually. `toBeAttached()` is the correct assertion for `<script>`, `<link>`, and `<meta>` elements in `<head>`.

## TODO 7.6 — @type assertion

```typescript
expect(parsed['@type']).toBe('SoftwareApplication');
```

`SoftwareApplication` is the schema.org type for web and desktop applications. Search engines use this to generate rich results (app rating, operating system, price) in search pages. Other common types: `Organization`, `Product`, `Article`, `FAQPage`.

## TODO 7.7 — Canonical href regex

```typescript
await expect(canonical).toHaveAttribute('href', /lumio\.io/);
```

The dot in `lumio\.io` is escaped because `.` in regex means "any character". Without escaping, `lumioXio` would also match. The regex approach avoids coupling the test to the exact canonical URL path, which may vary between pages (e.g., `/` vs `/pricing`).

## TODO 7.8 — robots.txt status 200

```typescript
expect(response.status()).toBe(200);
```

A robots.txt that returns 404 is treated by search engines as if the file doesn't exist — all paths are crawlable. A robots.txt that returns 500 causes crawlers to retry indefinitely. Both are bugs this test catches.

## TODO 7.9 — Disallow: / string

```typescript
expect(body).not.toContain('Disallow: /');
```

`'Disallow: /'` blocks all crawlers from the entire site. The default `''` always makes `not.toContain('')` fail — every string contains the empty string, so the assertion is always false with that default. Changing it to `'Disallow: /'` makes it a meaningful guard against accidental de-indexing.

## TODO 7.10 — Domain in sitemap

```typescript
expect(body).toContain('lumio.io');
```

A sitemap without the production domain likely points to a staging environment. This test catches the common deployment mistake of shipping a `sitemap.xml` generated against `localhost` or a staging URL that was never updated for production.

## TODO 7.11 — landingTitle for uniqueness

```typescript
expect(pricingTitle).not.toBe(landingTitle);
```

The failing default uses `pricingTitle` itself — `not.toBe(pricingTitle)` is always false (a string equals itself). Changing it to `landingTitle` tests the actual business rule: two different pages must have two different titles. Duplicate page titles are a common SEO regression when page templates share a hardcoded title string.

## Part 8 — Broken Link & Navigation Monitoring (formerly M70)

## TODO 8.1 — Array length 0 assertion

```typescript
expect(found404s).toHaveLength(0);
```

`toHaveLength(0)` asserts the array is empty — no resources loaded with a 404 status. The default `999` always fails because a healthy page will never load 999 broken resources. If this assertion fails, `found404s` contains the URLs of every broken resource, making diagnosis straightforward.

## TODO 8.2 — request.get with the loop variable

```typescript
const response = await request.get(link);
```

Pass the `link` variable — not a hardcoded string. The `request` fixture sends a plain HTTP request without opening a browser page, making it ~10× faster than `page.goto()` for bulk link checking. The default `'/PLACEHOLDER'` returns a 404, which is not `< 400`, so the test fails.

## TODO 8.3 — Minimum nav link count

```typescript
expect(count).toBeGreaterThanOrEqual(3);
```

`3` is a reasonable minimum for a functioning navigation. The default `999` always fails because no site has 999 nav links. This test catches rendering failures where the nav collapses to 0 links due to a hydration error or CSS bug.

## TODO 8.4 — Redirect destination regex

```typescript
await expect(page).toHaveURL(/login/);
```

`/login/` matches any URL containing "login". `page.goto()` follows all redirects automatically; `toHaveURL()` asserts where the redirect chain ended. The default `/PLACEHOLDER/` won't match the actual login URL, so the test fails.

## TODO 8.5 — 'login' in final URL

```typescript
expect(response!.url()).toContain('login');
```

`response.url()` returns the URL of the final response after all redirects — not the originally requested `/dashboard` URL. This is complementary to `toHaveURL()`: use `response.url()` when you want the URL value before asserting other things on the page.

## TODO 8.6 — toBeAttached() for fragment targets

```typescript
await expect(page.locator(`#${fragment}`)).toBeAttached();
```

`toBeAttached()` verifies the element with the fragment ID exists in the DOM. Using `toBeVisible()` would fail for off-screen sections (e.g., the FAQ section below the fold). `toBeAttached()` is the correct check: the element must exist, but it doesn't need to be in the viewport.

## TODO 8.7 — Status less than 400

```typescript
expect(response.status()).toBeLessThan(400);
```

`< 400` accepts 200 (OK), 301 (Moved Permanently), and 302 (Found) — all valid responses for footer links. Using `=== 200` would incorrectly fail on redirected links. The default `0` always fails because no HTTP status code is less than 0.

## TODO 8.8 — Nonexistent page path

```typescript
const response = await request.get('/this-page-does-not-exist-xyz');
```

This test verifies that Lumio's 404 handler returns the correct HTTP status code. Some frameworks accidentally return 200 with an HTML error page in the body — search engines then index the error page as a valid content page. The default `'/'` returns 200, which is not equal to 404, so the test fails. Change it to a path that doesn't exist to verify the 404 handler is working correctly.
