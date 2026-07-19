# Lesson 14: Specialized Testing Types: i18n, Flags, Security, Chat & CMS

*Combines former modules M63–M70.*

## Learning Objectives

### Part 1 — Localization & i18n Testing (formerly M63)

- Navigate to locale-prefixed URLs and assert translated strings
- Interact with a language switcher and assert URL changes
- Verify locale persistence across in-app navigation
- Test locale-specific date and number formatting
- Set the browser locale via `context` options (`locale: 'fr-FR'`) so `Intl.*` APIs return locale-aware output
- Test RTL layout: verify `dir="rtl"` on `<html>` and assert that the layout mirrors correctly for a hypothetical Arabic locale
- Build a multi-language regression strategy: parametric tests that cover all supported locales from a single data file

### Part 2 — Feature Flag & A/B Testing (formerly M64)

- Test both variants of a Lumio feature flag (AI suggestions: on vs off)
- Inject feature flags via `page.addInitScript()` without hitting the database
- Test cookie-based and URL-parameter-based flag mechanisms
- Build a CI strategy that covers all flag variants

### Part 3 — Security Workflow Testing (formerly M65)

- Test that unauthenticated users are redirected away from protected routes
- Verify that CSRF tokens are present on form submissions
- Assert that XSS payloads are sanitized and not rendered as HTML
- Mask sensitive values in test artifacts to prevent credential leaks

### Part 4 — OAuth & SSO Deep Dive (formerly M66)

- Automate the full OAuth2 authorization code flow with PKCE in Lumio
- Test the refresh token flow without a real identity provider
- Mock an OAuth provider to simulate token expiry and revocation edge cases
- Understand the difference between Lesson 03 (formerly M17) (happy path automation) and M66 (protocol edge cases)

### Part 5 — Chatbot & Rich UI Interaction (formerly M67)

- Automate Lumio's AI chat panel: type a message and assert the response appears
- Test a streaming text response using progressive assertion patterns
- Assert typing indicator appearance and disappearance
- Interact with TipTap's `contenteditable` rich text editor from test code

### Part 6 — CMS & Admin Panel Automation (formerly M68)

- Automate sorting, filtering, and paginating Lumio's admin user table
- Execute a bulk delete operation across multiple selected rows
- Upload a workspace logo through the admin media upload interface
- Apply reliable locator strategies for complex data tables

### Part 7 — SEO & Meta Verification (formerly M69)

- Assert title tags, meta descriptions, and Open Graph tags on Lumio's marketing pages
- Parse and validate JSON-LD structured data embedded in page `<head>`
- Verify canonical URL tags to catch duplicate-content mistakes before they reach production
- Use the `request` fixture to validate `robots.txt` and `sitemap.xml` without a full browser navigation

### Part 8 — Broken Link & Navigation Monitoring (formerly M70)

- Monitor network responses during page load using `page.on('response')` to detect 404s in real time
- Check individual link health using the `request` fixture without loading full browser pages
- Collect links from the DOM using `locator.evaluateAll()` and validate each programmatically
- Follow redirect chains via `page.goto()` and assert the final destination URL
- Validate anchor fragment links (`#section`) by checking that the target element exists in the DOM

## Concept

### Part 1 — Localization & i18n Testing (formerly M63)

Testing i18n is testing content — the UI structure is the same; the strings differ.
Two patterns:

**1. Parametric locale tests:**
```typescript
for (const { code, heading } of LOCALES) {
  test(`${code} locale shows ${heading}`, async ({ page }) => {
    await page.goto(code === 'en' ? '/' : `/${code}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
  });
}
```
Generates one test per locale — all visible in the report.

**2. Switcher interaction:**
```typescript
await page.getByTestId('language-switcher').click();
await page.getByTestId('lang-option-fr').click();
await expect(page).toHaveURL(/\/fr/);
```

**Browser-level locale (affects `Intl.*` APIs):**
```typescript
const context = await browser.newContext({ locale: 'fr-FR' });
```
This sets what `Intl.DateTimeFormat`, `Intl.NumberFormat`, and `Intl.RelativeTimeFormat` return — independently of the URL locale prefix. Use both together for complete coverage.

### Part 2 — Feature Flag & A/B Testing (formerly M64)

Feature flags are runtime configuration switches that change behavior without a code deploy. They're ubiquitous in production software — used for gradual rollouts, A/B experiments, kill switches, and beta features. Testing them presents a specific challenge: how do you run tests against both variants without setting up two complete environments or mutating a shared database?

**Three injection mechanisms.**

Flags reach the browser through several channels. Your test strategy differs by channel:

*Cookie-based flags.* The server reads a cookie and renders the appropriate variant. Test this by setting the cookie before navigation:

```typescript
await context.addCookies([{
  name: 'feature_ai_suggestions',
  value: 'enabled',
  domain: 'localhost',
  path: '/',
}]);
await page.goto('/dashboard');
```

*URL parameter flags.* The app reads a query string to activate a flag (common for QA overrides). Test this by constructing the URL:

```typescript
await page.goto('/dashboard?flags=ai_suggestions');
```

*JavaScript object injection.* Many modern feature flag systems (LaunchDarkly, PostHog, custom DB-backed) load flags into a browser-side object, then components read from it synchronously. `page.addInitScript()` runs JavaScript before any page scripts execute — making it the ideal injection point:

```typescript
await page.addInitScript(() => {
  (window as any).__featureFlags = {
    aiSuggestions: true,
    betaDashboard: false,
  };
});
```

Because `addInitScript` runs before the React app initializes, the flag value is present when the first component reads it — no timing issues, no race conditions, no database call.

**addInitScript — deep concept.**

Lesson 02 (formerly M13) introduced `addInitScript()` as a concept. M64 applies it specifically for flag injection. The key mechanism: scripts registered with `addInitScript()` execute in the browser context before the document's own scripts, in every navigation. This means:

- **Before page scripts**: the flag object exists when `import` statements execute
- **Every navigation**: the script re-runs on `page.goto()` and also on navigation within the app (SPA route changes via `history.pushState()` are covered by the `beforeunload` + `load` lifecycle)
- **Worker-safe**: if you pass the fixture to a test, every page in that test's context gets the flag

This is more robust than intercepting an API call to `/api/flags` because it doesn't depend on the network, doesn't require mocking the server, and doesn't break if the app caches the API response.

**Testing both variants.**

A complete flag test suite covers all variants. The cleanest pattern for coverage with minimal duplication:

```typescript
for (const enabled of [true, false]) {
  test(`AI suggestions panel is ${enabled ? 'visible' : 'hidden'} when flag is ${enabled}`, async ({ page }) => {
    await page.addInitScript((flagValue) => {
      (window as any).__featureFlags = { aiSuggestions: flagValue };
    }, enabled);

    await page.goto('/dashboard');
    
    const panel = page.getByTestId('ai-suggestions-panel');
    if (enabled) {
      await expect(panel).toBeVisible();
    } else {
      await expect(panel).toBeHidden();
    }
  });
}
```

**CI strategy for flags.**

In CI, you typically want flag tests to run on every PR (they should be fast). Two approaches:

1. **Inline both variants** — run both flag states in the same test file using the loop pattern above. Doubles test count but no matrix overhead.
2. **CI matrix with flag env var** — the `playwright.config.ts` reads `process.env.FLAG_AI_SUGGESTIONS` and injects it via `use.contextOptions`. This allows per-matrix-job flag configuration but adds CI complexity.

For most projects, approach 1 is right: the flag tests are fast, and having both variants inline makes the test file self-documenting.

### Part 3 — Security Workflow Testing (formerly M65)

Lesson 03 (formerly M19) covered the access control layer: RBAC testing, unauthorized route protection (403 flows), and the CAPTCHA strategy. M65 goes deeper into specific security primitives — the mechanisms that prevent the most common web vulnerabilities: CSRF, XSS, and information leakage in test artifacts.

**CSRF token verification.**

Cross-Site Request Forgery (CSRF) attacks trick an authenticated user's browser into making unwanted requests to an application. The defense is a token: the server embeds a unique, secret value in the form; when the form is submitted, the server checks that the token matches. A malicious cross-site page can't read the token from another origin, so it can't forge a valid request.

In tests, verify CSRF protection by asserting the token exists before submission:

```typescript
const csrfToken = await page.locator('input[name="csrf_token"]').inputValue();
expect(csrfToken).toBeTruthy();
expect(csrfToken.length).toBeGreaterThan(10); // not an empty placeholder
```

Or by intercepting the form submission request and asserting the token header:

```typescript
const [request] = await Promise.all([
  page.waitForRequest(req => req.url().includes('/api/settings')),
  page.getByRole('button', { name: 'Save' }).click(),
]);
expect(request.headers()['x-csrf-token']).toBeTruthy();
```

**XSS sanitization testing.**

Cross-Site Scripting (XSS) attacks inject malicious scripts into page content that other users then execute. Modern React applications are resistant to reflected XSS by default (JSX doesn't render raw HTML), but stored XSS is still a risk — user input stored in the database and rendered later.

The test pattern: enter a script injection string, submit, navigate to where the content is rendered, assert it's escaped rather than executed:

```typescript
const xssPayload = '<script>window.__xssExecuted = true</script>';
await page.getByLabel('Task title').fill(xssPayload);
await page.getByRole('button', { name: 'Create' }).click();

// Navigate to where the task title renders
await page.goto('/dashboard');

// Assert the script was not executed
const xssExecuted = await page.evaluate(() => (window as any).__xssExecuted);
expect(xssExecuted).toBeUndefined();

// Assert the raw text is visible (escaped, not rendered as HTML)
await expect(page.getByText('<script>')).toBeVisible();
```

This tests both that the script didn't run (`__xssExecuted` is undefined) and that the escaped text is visible.

**Unauthenticated route protection.**

Lesson 03 (formerly M19) covered RBAC (member vs admin). M65 tests the authentication boundary: what happens when an unauthenticated user tries to access a protected route? The expected behavior is a redirect to the login page, not a 403 or a blank screen.

```typescript
// In a fresh context with no auth
const freshContext = await browser.newContext(); // no storageState
const freshPage = await freshContext.newPage();
await freshPage.goto('/dashboard');
await expect(freshPage).toHaveURL(/.*login.*/);
```

**Masking sensitive data in test artifacts.**

Playwright's HTML reports and trace files can contain screenshots, network logs, and console output — all of which may include sensitive data (auth tokens, API keys, personal information). Three masking techniques:

1. **`page.screenshot({ mask: [locator] })`** — replaces matched elements with a solid color box in screenshots.
2. **Trace masking is not automatic** — avoid storing real credentials in cookies or localStorage in tests; use test-specific dummy values.
3. **Reporter sanitization** — the `JSON reporter` output may contain request headers. Strip `Authorization` and `Cookie` headers before uploading reports to shared artifact storage.

```typescript
await page.screenshot({
  path: 'artifacts/settings-page.png',
  mask: [page.getByTestId('api-key-value'), page.getByTestId('user-email')],
});
```

### Part 4 — OAuth & SSO Deep Dive (formerly M66)

Lesson 03 (formerly M17) automated Lumio's GitHub OAuth login: click the button, handle the popup, assert you end up logged in. That covers the happy path. M66 tests the protocol — the full OAuth2 authorization code flow with PKCE, refresh token behavior, and the edge cases that only appear when tokens expire or are revoked mid-session.

**The OAuth2 authorization code flow with PKCE.**

PKCE (Proof Key for Code Exchange) is the recommended OAuth2 flow for browser-based and native apps. It prevents authorization code interception attacks. The flow:

1. App generates a random `code_verifier`, hashes it to produce `code_challenge`
2. App redirects to the provider with `code_challenge` and `response_type=code`
3. User authenticates at the provider
4. Provider redirects back with an authorization `code`
5. App exchanges the `code` + `code_verifier` for `access_token` + `refresh_token`
6. App uses `access_token` for API calls; when it expires, uses `refresh_token` to get a new one

Testing this flow end-to-end against a real provider (GitHub, Google) is fragile — the provider UI changes, rate limits apply, and test accounts accumulate. The standard solution is a mock OAuth provider.

**Mocking the OAuth provider.**

`page.route()` intercepts all HTTP requests — including the authorization endpoint and token endpoint of the OAuth provider:

```typescript
// Intercept the authorization endpoint redirect
await page.route('https://github.com/login/oauth/authorize*', route => {
  // Instead of showing GitHub's login UI, redirect directly with a test code
  const callbackUrl = new URL('http://localhost:3000/api/auth/callback/github');
  callbackUrl.searchParams.set('code', 'test-auth-code-123');
  callbackUrl.searchParams.set('state', new URL(route.request().url()).searchParams.get('state') ?? '');
  route.fulfill({ status: 302, headers: { Location: callbackUrl.toString() } });
});

// Intercept the token endpoint
await page.route('https://github.com/login/oauth/access_token', route => {
  route.fulfill({
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      token_type: 'Bearer',
    }),
  });
});
```

With these two routes in place, clicking "Sign in with GitHub" completes the OAuth flow without ever leaving localhost. The state parameter is forwarded to prevent CSRF-in-OAuth validation failures.

**Testing the refresh token flow.**

After `access_token` expiry, the app should silently refresh using `refresh_token`. To test this:

1. Mock the token endpoint to return a short-lived access token (`expires_in: 1`)
2. Wait for expiry
3. Assert the app calls the refresh endpoint and continues functioning
4. Mock the refresh endpoint to return a new access token

Or more practically: mock the token refresh endpoint to return an error (simulating a revoked refresh token) and assert the app redirects to login rather than freezing.

**Token expiry handling.**

The most important OAuth edge case is what happens when the refresh token is also expired or revoked (e.g., the user revoked app access from their GitHub settings). The app must detect the 401 from the refresh endpoint and log the user out gracefully:

```typescript
await page.route('**/api/auth/session', route => {
  route.fulfill({
    status: 401,
    body: JSON.stringify({ error: 'RefreshAccessTokenError' }),
  });
});

await page.goto('/dashboard');
await expect(page).toHaveURL(/.*login.*/);
```

**Contrast with Lesson 03 (formerly M17).**

Lesson 03 (formerly M17) automates the OAuth happy path: the real popup, the real provider redirect, storing the resulting session. It tests the user experience. M66 tests the protocol: PKCE parameter passing, token exchange, expiry handling. These are complementary — Lesson 03 (formerly M17) catches UX regressions; M66 catches security protocol regressions.

### Part 5 — Chatbot & Rich UI Interaction (formerly M67)

Modern web applications contain increasingly complex UI components that don't map cleanly to standard HTML form controls. Two categories require special treatment: **contenteditable rich text editors** (TipTap, ProseMirror, Quill) and **AI chat interfaces** with streaming responses. Both require different interaction techniques than `fill()`.

**contenteditable editors.**

TipTap renders into a `<div contenteditable="true">` element — not an `<input>` or `<textarea>`. The standard `fill()` action doesn't work because `fill()` expects a native form control. For contenteditable, use `click()` to focus the element and then `type()` or `pressSequentially()` to dispatch keyboard events:

```typescript
const editor = page.locator('[contenteditable="true"]');
await editor.click();
await editor.pressSequentially('This is my task description.');
```

For richer interactions (bold, italic, links), use keyboard shortcuts as a real user would:

```typescript
await editor.click();
await editor.pressSequentially('Important note');
await page.keyboard.down('Control');
await editor.press('a'); // select all
await page.keyboard.up('Control');
await page.keyboard.down('Control');
await editor.press('b'); // bold
await page.keyboard.up('Control');
```

TipTap renders in an iframe in some configurations (Lesson 04 (formerly M24) covered this). When the editor is inside an iframe, scope the locator through `frameLocator()` first.

**AI chat interface automation.**

Chat panels present two challenges: the input is often a `contenteditable` div (not a `textarea`), and responses arrive as streaming tokens rather than a single DOM update.

Typing and sending a message:

```typescript
const chatInput = page.getByTestId('chat-input');
await chatInput.click();
await chatInput.pressSequentially('What tasks are overdue?');
await page.keyboard.press('Enter');
```

Or if the input uses `Shift+Enter` for newlines and `Enter` to send:

```typescript
await chatInput.fill('What tasks are overdue?'); // works if it's a textarea
await page.keyboard.press('Enter');
```

**Streaming text assertion.**

AI responses stream token by token. The DOM updates incrementally — a `<p>` element that starts empty gradually fills with text. Two assertion strategies:

*Wait for completion indicator.* The cleanest: wait until the streaming indicator (spinner, "Generating..." text, cursor animation) disappears, then assert the full response:

```typescript
await expect(page.getByTestId('chat-typing-indicator')).toBeHidden({ timeout: 15000 });
const response = await page.getByTestId('chat-message').last().textContent();
expect(response?.length).toBeGreaterThan(0);
```

*Assert for partial text.* When you know part of the response content (e.g., you're mocking the API):

```typescript
// Mock the streaming endpoint
await page.route('**/api/chat', route => {
  route.fulfill({
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
    body: 'data: {"token":"You have "}\n\ndata: {"token":"3 overdue tasks"}\n\ndata: [DONE]\n\n',
  });
});

// Assert the rendered text once streaming completes
await expect(page.getByTestId('chat-message').last()).toContainText('3 overdue tasks', { timeout: 5000 });
```

**Typing indicator testing.**

The typing indicator (the animated "..." or spinner that appears while the AI is generating) should:
1. Appear immediately when the user sends a message
2. Disappear when the response finishes streaming

```typescript
await page.getByTestId('chat-input').pressSequentially('Hello');
await page.keyboard.press('Enter');

// Indicator should appear quickly
await expect(page.getByTestId('chat-typing-indicator')).toBeVisible({ timeout: 1000 });

// Then disappear when response completes
await expect(page.getByTestId('chat-typing-indicator')).toBeHidden({ timeout: 15000 });
```

This two-step assertion pattern ensures both that the indicator appeared (user sees loading state) and that it correctly cleaned up.

### Part 6 — CMS & Admin Panel Automation (formerly M68)

Admin panels present a different automation challenge than user-facing UIs. They contain dense data tables with sortable columns, filter inputs, pagination controls, and bulk operation toolbars. The interactions are correct but the locators are tricky — rows are dynamic, column headers double as sort triggers, and bulk operations require coordinated multi-element interactions.

**Data table automation patterns.**

A sortable table column is typically both a display element and a button. Clicking it once sorts ascending; clicking again sorts descending. The sorted state is usually communicated via an `aria-sort` attribute:

```typescript
const emailHeader = page.getByRole('columnheader', { name: 'Email' });
await emailHeader.click(); // sort ascending
await expect(emailHeader).toHaveAttribute('aria-sort', 'ascending');

await emailHeader.click(); // sort descending
await expect(emailHeader).toHaveAttribute('aria-sort', 'descending');
```

Using `getByRole('columnheader')` is the most robust locator for table headers — it's label-based and survives DOM restructuring.

**Filtering a table.**

Filter inputs update the table's visible rows. Assert the result by checking the row count or the content of specific cells:

```typescript
const filterInput = page.getByPlaceholder('Filter by email');
await filterInput.fill('alice@');
await expect(page.getByRole('row')).toHaveCount(2); // 1 header + 1 matching row
```

Use `toHaveCount()` with a concrete value when you control the test data. When you don't control the data, assert that the count decreased:

```typescript
const beforeCount = await page.getByRole('row').count();
await filterInput.fill('admin@lumio.test');
const afterCount = await page.getByRole('row').count();
expect(afterCount).toBeLessThan(beforeCount);
```

**Pagination.**

Paginating a table involves clicking page controls and asserting the new content. The most reliable assertion is checking the "showing X–Y of Z" status text, which is guaranteed to change between pages:

```typescript
await page.getByRole('button', { name: 'Next page' }).click();
await expect(page.getByTestId('pagination-status')).toContainText('11–20');
```

**Bulk operations.**

Bulk operations require: selecting multiple rows, then triggering the action. The select-all checkbox and per-row checkboxes work together:

```typescript
// Select first three rows individually
await page.getByRole('row').nth(1).getByRole('checkbox').check(); // row 1 (nth(0) is header)
await page.getByRole('row').nth(2).getByRole('checkbox').check();
await page.getByRole('row').nth(3).getByRole('checkbox').check();

// The bulk actions toolbar should appear
await expect(page.getByTestId('bulk-actions-toolbar')).toBeVisible();

// Perform the bulk action
await page.getByRole('button', { name: 'Delete selected' }).click();
await page.getByRole('button', { name: 'Confirm' }).click();
```

After a bulk delete, assert the row count decreased by the number deleted.

**Admin media upload.**

File upload in an admin panel (logo, avatar) uses `setInputFiles()` on the file input:

```typescript
await page.getByLabel('Workspace logo').setInputFiles('tests/fixtures/logo.png');
await page.getByRole('button', { name: 'Upload' }).click();
await expect(page.getByTestId('logo-preview')).toBeVisible();
```

If the upload input is hidden (triggered by a custom button), click the visible button and then set files on the input directly:

```typescript
const fileInput = page.locator('input[type="file"]');
await fileInput.setInputFiles('tests/fixtures/logo.png');
```

### Part 7 — SEO & Meta Verification (formerly M69)

SEO correctness is invisible to users but consequential for product growth. A missing `og:image` tag means links shared on Slack or LinkedIn won't unfurl. A misconfigured `robots.txt` can accidentally de-index an entire domain. A duplicate `<title>` across two marketing pages dilutes search ranking. None of these failures are caught by functional tests — they require dedicated SEO assertions.

Playwright is well-suited for SEO verification because it gives you both a rendered document and raw HTTP access in the same test run.

**Title and meta tags.**

`expect(page).toHaveTitle()` retries until the document title stabilizes — important for SPAs that set the title after hydration, not at initial HTML render. For `<meta>` tags there is no ARIA role; the right locator is a CSS attribute selector:

```typescript
const metaDesc = page.locator('meta[name="description"]');
await expect(metaDesc).toHaveAttribute('content', /\S+/); // non-empty
```

**Open Graph tags.**

OG tags use the non-standard `property` attribute (not `name`), so the selector differs from standard meta tags:

```typescript
page.locator('meta[property="og:title"]')
page.locator('meta[property="og:description"]')
page.locator('meta[property="og:image"]')
```

The minimum viable OG set for a SaaS marketing page is `og:title`, `og:description`, and `og:image`. Without all three, social previews degrade silently — LinkedIn renders a blank card, Slack shows only the URL.

**JSON-LD structured data.**

JSON-LD lives inside `<script type="application/ld+json">` tags. To assert its content you locate the element, extract its text, parse it as JSON, and assert the schema.org type:

```typescript
const jsonLd = page.locator('script[type="application/ld+json"]');
await expect(jsonLd).toBeAttached(); // not toBeVisible — scripts are never visible
const parsed = JSON.parse(await jsonLd.textContent() ?? '{}');
expect(parsed['@type']).toBe('SoftwareApplication');
```

`toBeAttached()` asserts the element exists in the DOM. `toBeVisible()` would fail on `<script>` tags — they are never rendered visually. This distinction matters for any non-interactive head element: `<link>`, `<meta>`, `<script>`.

**Canonical URLs.**

A canonical URL tag tells search engines which URL to index when the same content is accessible at multiple paths (e.g., `/?utm_source=twitter` and `/`):

```typescript
const canonical = page.locator('link[rel="canonical"]');
await expect(canonical).toHaveAttribute('href', /lumio\.io/);
```

The regex escapes the dot (`\.`) — an unescaped `.` in a regex matches any character, so `lumio.io` would also match `lumioXio`.

**robots.txt and sitemap.xml.**

These are plain HTTP resources, not pages. Use the `request` fixture to fetch them directly without loading a browser page:

```typescript
const response = await request.get('/robots.txt');
expect(response.status()).toBe(200);
expect(await response.text()).not.toContain('Disallow: /');
```

`Disallow: /` in robots.txt blocks all crawlers from the entire site — a catastrophic misconfiguration that is trivial to introduce and hard to detect until search traffic drops weeks later. For sitemap.xml, assert the response is 200 and references your production domain — a common mistake is deploying a sitemap generated against `localhost` or a staging URL.

**When to automate SEO checks.**

Automate when: SEO meta is generated by your code (not manually curated in a CMS); a regression would go unnoticed until search ranking drops; the checks complete in milliseconds (they do). Skip automation for manually authored content where the correct tag value changes with editorial intent, or for third-party CMS-managed pages outside your repo.

### Part 8 — Broken Link & Navigation Monitoring (formerly M70)

Broken links and navigation failures are silent regressions. A user clicks a footer link and lands on a 404. An internal page reference points to a moved URL. An anchor link on a pricing page scrolls nowhere because the target element was renamed. None of these show up in unit tests or build failures — they require a browser-level scan.

Playwright provides two complementary tools for link health monitoring: passive response monitoring via event listeners, and active link checking via the `request` fixture.

**Passive monitoring with page.on('response').**

You can register a listener before navigation to capture every HTTP response the page triggers, including subresources:

```typescript
const found404s: string[] = [];
page.on('response', response => {
  if (response.status() === 404) found404s.push(response.url());
});
await page.goto('/');
await page.waitForLoadState('networkidle');
expect(found404s).toHaveLength(0);
```

This catches broken images, missing scripts, and failed API calls — not just broken navigation links. The `networkidle` load state waits until no more network requests fire for 500ms, giving lazy-loaded resources time to resolve.

**Active link checking with the request fixture.**

The `request` fixture sends HTTP requests without loading a browser page. This is ideal for checking many links in bulk:

```typescript
const links = ['/pricing', '/docs', '/blog'];
for (const link of links) {
  const response = await request.get(link);
  expect(response.status()).toBeLessThan(400);
}
```

Using `< 400` rather than `=== 200` allows valid redirects (301, 302) without treating them as failures.

**Collecting links from the DOM.**

To check all links on a page without hardcoding them, collect their `href` attributes:

```typescript
const hrefs = await page.locator('nav a[href^="/"]').evaluateAll(
  links => links.map(l => l.getAttribute('href')!)
);
for (const href of hrefs) {
  const response = await request.get(href);
  expect(response.status()).toBeLessThan(400);
}
```

`[href^="/"]` selects only internal links (those starting with `/`), excluding external links and `mailto:` addresses.

**Following redirect chains.**

`page.goto()` follows all redirects and returns the final `Response`. The response's `.url()` method gives the final URL after the full chain:

```typescript
const response = await page.goto('/dashboard'); // redirects to /login for unauthenticated users
expect(response!.url()).toContain('login');      // final URL after all redirects
await expect(page).toHaveURL(/login/);           // page.url() also reflects the final URL
```

Both approaches work; `response.url()` is useful when you want the final URL before any assertions on the page, `toHaveURL()` is more readable when you just need to assert the landed URL.

**Anchor fragment validation.**

An anchor link like `href="#faq"` navigates to the element with `id="faq"` on the same page. If that element is removed or renamed, the link silently fails — the user is scrolled nowhere. Test anchor links by checking that the target element is attached to the DOM:

```typescript
const anchorHrefs = await page.locator('a[href^="#"]').evaluateAll(
  links => links.map(l => l.getAttribute('href')!)
);
for (const href of anchorHrefs) {
  const fragment = href.slice(1); // strip the '#'
  await expect(page.locator(`#${fragment}`)).toBeAttached();
}
```

**Decision pattern — when to run link monitoring.**

Run link monitoring on a schedule (e.g., daily or after each deployment) rather than in the per-PR test suite. Checking every link blocks CI unnecessarily if the site has hundreds of pages. For critical navigation (header, footer, sidebar), integrate link checks into the smoke suite. For full-site crawl coverage, schedule a nightly job.

## Lumio Context

See [lumio-context.md](./lumio-context.md).

## Step-by-Step Tasks

### Part 1 — Localization & i18n Testing

Validate this part only:
```bash
npx playwright test tests/module-14-specialized-testing-types -g "Part 1 — Localization & i18n Testing (formerly M63)"
```

### Part 2 — Feature Flag & A/B Testing

Validate this part only:
```bash
npx playwright test tests/module-14-specialized-testing-types -g "Part 2 — Feature Flag & A/B Testing (formerly M64)"
```

### Part 3 — Security Workflow Testing

Validate this part only:
```bash
npx playwright test tests/module-14-specialized-testing-types -g "Part 3 — Security Workflow Testing (formerly M65)"
```

### Part 4 — OAuth & SSO Deep Dive

Validate this part only:
```bash
npx playwright test tests/module-14-specialized-testing-types -g "Part 4 — OAuth & SSO Deep Dive (formerly M66)"
```

### Part 5 — Chatbot & Rich UI Interaction

Validate this part only:
```bash
npx playwright test tests/module-14-specialized-testing-types -g "Part 5 — Chatbot & Rich UI Interaction (formerly M67)"
```

### Part 6 — CMS & Admin Panel Automation

Validate this part only:
```bash
npx playwright test tests/module-14-specialized-testing-types -g "Part 6 — CMS & Admin Panel Automation (formerly M68)"
```

### Part 7 — SEO & Meta Verification

Validate this part only:
```bash
npx playwright test tests/module-14-specialized-testing-types -g "Part 7 — SEO & Meta Verification (formerly M69)"
```

### Part 8 — Broken Link & Navigation Monitoring

Validate this part only:
```bash
npx playwright test tests/module-14-specialized-testing-types -g "Part 8 — Broken Link & Navigation Monitoring (formerly M70)"
```

## Validate (full lesson)

```bash
npx playwright test tests/module-14-specialized-testing-types
```

## Key Takeaways

### Part 1 — Localization & i18n Testing

1. Navigate to locale URLs directly — it's faster than clicking the switcher.
2. Use `toHaveURL(/\/fr/)` — not `toHaveURL('/fr/...')` — to match any /fr path.
3. Parametric tests (loop over locales) give you full locale coverage without repetition.
4. Test locale persistence by navigating within the app and checking the URL prefix.

### Part 2 — Feature Flag & A/B Testing

1. `page.addInitScript()` runs before page scripts — perfect for injecting flag values into `window.__featureFlags`.
2. Cookie-based flags are tested with `context.addCookies()` before `page.goto()`.
3. URL-parameter flags are tested by constructing the URL with the flag query string.
4. Test both variants (on and off) in the same file — both are required for complete flag coverage.
5. `addInitScript` persists across navigations in the same page — no re-injection needed on route changes.

### Part 3 — Security Workflow Testing

1. Assert CSRF tokens exist and are non-trivial before form submission — both the hidden input and the request header.
2. Test XSS by entering a payload and asserting `window.__xssExecuted` is `undefined` after render.
3. Test unauthenticated access in a `newContext()` with no `storageState` — assert redirect to login URL.
4. `page.screenshot({ mask: [locator] })` prevents sensitive values from appearing in visual artifacts.
5. Security tests belong in the same suite as functional tests — run them on every PR, not just security audits.

### Part 4 — OAuth & SSO Deep Dive

1. Mock OAuth providers with `page.route()` — intercept both the authorization endpoint (returns `code`) and the token endpoint (returns tokens).
2. Forward the `state` parameter from the authorization request to prevent CSRF validation failures in the callback.
3. Test refresh token expiry by mocking `/api/auth/session` to return 401 and asserting the redirect to login.
4. PKCE adds `code_challenge` + `code_challenge_method` to the authorization URL — assert these are present.
5. Lesson 03 (formerly M17) tests UX (does login work?); M66 tests protocol (are tokens handled correctly?).

### Part 5 — Chatbot & Rich UI Interaction

1. `contenteditable` editors require `click()` to focus and `pressSequentially()` to type — not `fill()`.
2. For streaming text, wait for the completion indicator to disappear, then assert the full response.
3. Mock the chat API with an SSE response body to control response content in tests.
4. The typing indicator should appear on send and disappear on completion — test both transitions.
5. TipTap inside an iframe requires `frameLocator()` scoping before any locator calls.

### Part 6 — CMS & Admin Panel Automation

1. `getByRole('columnheader', { name })` is the most robust locator for sortable table headers.
2. Assert sort state via `aria-sort` attribute values: `'ascending'` or `'descending'`.
3. Filter tests should assert row count change — either exact (with controlled data) or relative (decreased).
4. Bulk operations require selecting rows first; assert the bulk toolbar appears before triggering the action.
5. File upload on hidden inputs: call `setInputFiles()` on the `input[type="file"]` directly, bypassing the styled button.

### Part 7 — SEO & Meta Verification

1. Use CSS attribute selectors (`meta[name="..."]`, `meta[property="..."]`) for `<meta>` tags — there is no ARIA role.
2. `toBeAttached()` is the right assertion for `<script>` and `<link>` elements that are never visually rendered.
3. JSON-LD structured data must be parsed with `JSON.parse()` before asserting `@type` — it is a raw string in the DOM.
4. Use the `request` fixture for `robots.txt` and `sitemap.xml` — no browser page is needed for plain HTTP resources.
5. Each marketing page must have a unique `<title>` — duplicate titles split SEO link equity and confuse search engines.

### Part 8 — Broken Link & Navigation Monitoring

1. `page.on('response')` passively monitors all HTTP responses during page load — the broadest 404 net.
2. Use the `request` fixture for bulk link checks — no browser overhead, no JavaScript execution.
3. `toBeLessThan(400)` is more robust than `toBe(200)` for link health checks: it accepts valid redirects.
4. `page.goto()` returns the final `Response` after all redirects; use `response.url()` to read the final URL.
5. Anchor fragment links (`#target`) must be validated by checking that the target element is attached to the DOM.

## Going Deeper

### Part 1 — Localization & i18n Testing

- [next-intl docs](https://next-intl-docs.vercel.app/)
- [Playwright docs: toHaveURL](https://playwright.dev/docs/api/class-pageassertions#page-assertions-to-have-url)

### Part 2 — Feature Flag & A/B Testing

- [Playwright docs: page.addInitScript()](https://playwright.dev/docs/api/class-page#page-add-init-script)
- [Playwright docs: context.addCookies()](https://playwright.dev/docs/api/class-browsercontext#browser-context-add-cookies)
- [LaunchDarkly: Testing with feature flags](https://docs.launchdarkly.com/guides/flags/testing-flags)

### Part 3 — Security Workflow Testing

- [OWASP: CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP: XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Playwright docs: page.screenshot() mask option](https://playwright.dev/docs/api/class-page#page-screenshot-option-mask)

### Part 4 — OAuth & SSO Deep Dive

- [OAuth 2.0 RFC: Authorization Code Flow](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1)
- [OAuth 2.0 RFC: PKCE](https://datatracker.ietf.org/doc/html/rfc7636)
- [NextAuth.js docs: Refresh Token Rotation](https://authjs.dev/guides/refresh-token-rotation)

### Part 5 — Chatbot & Rich UI Interaction

- [Playwright docs: locator.pressSequentially()](https://playwright.dev/docs/api/class-locator#locator-press-sequentially)
- [TipTap docs: Testing with Playwright](https://tiptap.dev/docs/editor/getting-started/install)
- [Playwright docs: contenteditable interactions](https://playwright.dev/docs/input#type-characters)

### Part 6 — CMS & Admin Panel Automation

- [Playwright docs: setInputFiles()](https://playwright.dev/docs/api/class-locator#locator-set-input-files)
- [ARIA: aria-sort attribute](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-sort)
- [Playwright docs: toHaveCount()](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-count)

### Part 7 — SEO & Meta Verification

- [Playwright docs: toHaveTitle()](https://playwright.dev/docs/api/class-pageassertions#page-assertions-to-have-title)
- [Playwright docs: toBeAttached()](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-attached)
- [schema.org: SoftwareApplication](https://schema.org/SoftwareApplication)
- [Google: robots.txt specification](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Open Graph Protocol](https://ogp.me/)

### Part 8 — Broken Link & Navigation Monitoring

- [Playwright docs: page.on('response')](https://playwright.dev/docs/api/class-page#page-event-response)
- [Playwright docs: request fixture](https://playwright.dev/docs/api/class-apirequestcontext)
- [Playwright docs: toBeAttached()](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-attached)
- [Playwright docs: waitForLoadState](https://playwright.dev/docs/api/class-page#page-wait-for-load-state)
