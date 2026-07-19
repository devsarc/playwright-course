// Lesson 14: Specialized Testing Types: i18n, Flags, Security, Chat & CMS
// Combines former modules: M63 (Localization & i18n Testing), M64 (Feature Flag & A/B Testing),
// M65 (Security Workflow Testing), M66 (OAuth & SSO Deep Dive), M67 (Chatbot & Rich UI Interaction),
// M68 (CMS & Admin Panel Automation), M69 (SEO & Meta Verification), M70 (Broken Link & Navigation Monitoring)
//
// Each Part below is the original module's test.describe block, unchanged
// except TODO numbers are prefixed with the Part number to stay unique in
// this file (a TODO originally numbered N in the M65 module becomes TODO
// 3.N here, matching Part 3's prefix).

import { test, expect } from '../fixtures/fixtures';
import path from 'path';

const LOCALES = [
  { code: 'en', heading: 'Organize your work' },
  { code: 'fr', heading: 'Organisez votre travail' },
  { code: 'es', heading: 'Organiza tu trabajo' },
] as const;

test.describe('Part 1 — Localization & i18n Testing (formerly M63)', () => {
  test.describe('Locale routing', () => {
    for (const { code, heading } of LOCALES) {
      test(`${code} locale shows correct hero heading`, async ({ page }) => {
        // TODO 1.1: Navigate to the locale-prefixed root URL (e.g. /fr for French).
        // For 'en', navigate to / (English is the default, no prefix needed).
        const url = code === 'en' ? '/' : `/${code}`;
        await page.goto(/* TODO 1.1: url */);

        // TODO 1.2: Assert the h1 heading matches the expected translated string.
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(/* TODO 1.2: heading */);
      });
    }
  });

  test.describe('Language switcher', () => {
    test('switching to French updates the URL and heading', async ({ page }) => {
      await page.goto('/');

      // TODO 1.3: Open the language switcher dropdown.
      // data-testid="language-switcher"
      await page.getByTestId(/* TODO 1.3: 'language-switcher' */).click();

      // TODO 1.4: Select the French option.
      // data-testid="lang-option-fr"
      await page.getByTestId(/* TODO 1.4: 'lang-option-fr' */).click();

      // TODO 1.5: Assert the URL now starts with /fr.
      await expect(page).toHaveURL(/* TODO 1.5: /\/fr/ */);

      // TODO 1.6: Assert the heading is the French translation.
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Organisez votre travail');
    });

    test('locale preference is preserved on navigation', async ({ page }) => {
      // TODO 1.7: Navigate to /fr, then click the "Projects" nav link, and assert
      // the URL still starts with /fr (locale persists across in-app navigation).
      await page.goto('/fr');
      await page.getByRole('link', { name: 'Projets' }).click(); // French for "Projects"
      await expect(page).toHaveURL(/* TODO 1.7: /^\/fr/ */);
    });
  });

  test.describe('Locale-specific formatting', () => {
    test('date is formatted according to locale', async ({ page }) => {
      // TODO 1.8: Navigate to /fr/projects/demo/board and assert a date element
      // uses French date format (day/month/year or "12 mai 2026").
      // data-testid="card-due-date" contains a formatted date string.
      await page.goto('/fr/projects/demo/board');
      const dateText = await page.getByTestId('card-due-date').first().textContent();

      // French dates don't use slashes — assert no MM/DD/YYYY format
      expect(dateText).not.toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    test('number formatting matches locale', async ({ page }) => {
      // TODO 1.9: Navigate to the French pricing page (/fr/pricing) and assert
      // that currency amounts use French number formatting (space as thousands separator,
      // comma as decimal separator — e.g. "9,99 $").
      await page.goto('/fr/pricing');
      const priceText = await page.getByTestId('price-amount').first().textContent();
      // French: 9,99 or 9.99 — just assert it's truthy and non-empty
      expect(priceText?.length).toBeGreaterThan(/* TODO 1.9: 0 */);
    });
  });
});

test.describe('Part 2 — Feature Flag & A/B Testing (formerly M64)', () => {

  // Test 1: Inject a flag via addInitScript (flag enabled)
  test('addInitScript injects flag before page scripts execute', async ({ page }) => {
    // TODO 2.1: Use page.addInitScript() to set window.__featureFlags = { aiSuggestions: true }
    // on the window object before page scripts run.
    // Why? addInitScript runs before page scripts — the flag is present when React initializes.
    await page.addInitScript(/* TODO 2.1: () => { (window as any).__featureFlags = { aiSuggestions: true }; } */
      () => { (window as any).__featureFlags = { aiSuggestions: false }; }
    );

    await page.goto('/dashboard');

    // With AI suggestions enabled, the AI panel should be visible
    // TODO 2.2: Assert that the element with testId 'ai-suggestions-panel' is visible.
    await expect(page.getByTestId('ai-suggestions-panel'))./* TODO 2.2: toBeVisible() */ toBeHidden();
  });

  // Test 2: Flag off — panel is hidden
  test('AI suggestions panel is hidden when flag is disabled', async ({ page }) => {
    await page.addInitScript(() => {
      // TODO 2.3: Set window.__featureFlags = { aiSuggestions: false }.
      (window as any).__featureFlags = { aiSuggestions: /* TODO 2.3: false */ true };
    });

    await page.goto('/dashboard');

    // TODO 2.4: Assert that 'ai-suggestions-panel' is hidden.
    await expect(page.getByTestId('ai-suggestions-panel'))./* TODO 2.4: toBeHidden() */ toBeVisible();
  });

  // Test 3: addInitScript receives a serializable argument
  test('addInitScript can receive a serializable parameter', async ({ page }) => {
    // addInitScript accepts an optional second argument passed to the browser function.
    // This lets you parameterize the init script without string interpolation.

    // TODO 2.5: Call page.addInitScript(fn, true) where fn receives the value as `enabled`
    // and sets window.__featureFlags = { aiSuggestions: enabled }.
    await page.addInitScript(
      /* TODO 2.5: (enabled: boolean) => { (window as any).__featureFlags = { aiSuggestions: enabled }; } */
      (_enabled: boolean) => { (window as any).__featureFlags = { aiSuggestions: false }; },
      /* TODO 2.5: true */ false
    );

    await page.goto('/dashboard');
    await expect(page.getByTestId('ai-suggestions-panel')).toBeVisible();
  });

  // Test 4: Cookie-based flag activation
  test('cookie-based flag enables the AI panel variant', async ({ page, context }) => {
    // TODO 2.6: Add a cookie { name: 'feature_ai_suggestions', value: 'enabled',
    //   domain: 'localhost', path: '/' } via context.addCookies().
    // Why? Cookie-based flags are read server-side — addCookies() before goto() sets the cookie
    // before the first request, ensuring the server renders the correct variant.
    await context.addCookies([{
      name: 'feature_ai_suggestions',
      value: /* TODO 2.6: 'enabled' */ 'disabled',
      domain: 'localhost',
      path: '/',
    }]);

    await page.goto('/dashboard');

    // TODO 2.7: Assert that 'ai-suggestions-panel' is visible (cookie flag active).
    await expect(page.getByTestId('ai-suggestions-panel'))./* TODO 2.7: toBeVisible() */ toBeHidden();
  });

  // Test 5: URL parameter flag activation
  test('URL parameter flag activates the beta dashboard', async ({ page }) => {
    // URL-param flags are common for QA overrides — append ?flags=beta_dashboard to activate.

    // TODO 2.8: Navigate to '/dashboard?flags=beta_dashboard'.
    // Why? URL params are the simplest flag mechanism — no cookie or script needed.
    await page.goto(/* TODO 2.8: '/dashboard?flags=beta_dashboard' */ '/dashboard');

    // TODO 2.9: Assert that the element with testId 'beta-dashboard-banner' is visible.
    await expect(page.getByTestId('beta-dashboard-banner'))./* TODO 2.9: toBeVisible() */ toBeHidden();
  });

  // Test 6: addInitScript persists across SPA navigations
  test('addInitScript flag persists across client-side route changes', async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__featureFlags = { aiSuggestions: true };
    });

    await page.goto('/dashboard');

    // Navigate via SPA (no full page reload — history.pushState)
    await page.getByTestId('nav-projects').click();
    await page.waitForURL('**/projects');

    // Flag should still be active — addInitScript runs once per page load, not per route change
    const flagValue = await page.evaluate(() => (window as any).__featureFlags?.aiSuggestions);

    // TODO 2.10: Assert that flagValue is true (flag persists after SPA navigation).
    expect(flagValue).toBe(/* TODO 2.10: true */ false);
  });

});

test.describe('Part 3 — Security Workflow Testing (formerly M65)', () => {

  // Test 1: Unauthenticated access redirects to login
  test('unauthenticated user is redirected from /dashboard to login', async ({ browser }) => {
    // Create a fresh context with no stored auth state
    // TODO 3.1: Create a fresh browser context using browser.newContext() (no storageState).
    // Why? A fresh context has no cookies or tokens — simulates a never-logged-in user.
    const freshContext = await browser./* TODO 3.1: newContext() */ newContext({
      storageState: /* TODO 3.1: undefined (omit this option entirely) */ undefined,
    });
    const freshPage = await freshContext.newPage();

    await freshPage.goto('/dashboard');

    // TODO 3.2: Assert that freshPage.url() matches /.*login.*/ (redirected to login page).
    await expect(freshPage).toHaveURL(/* TODO 3.2: /.*login.*/ /.*PLACEHOLDER.*/ );

    await freshContext.close();
  });

  // Test 2: Protected admin route blocks non-admin users
  test('member role cannot access /admin route', async ({ page, context }) => {
    // Log in as a member (non-admin) using stored member credentials
    await context.addCookies([{
      name: 'next-auth.session-token',
      value: process.env.TEST_MEMBER_SESSION ?? 'member-session-token',
      domain: 'localhost',
      path: '/',
    }]);

    await page.goto('/admin');

    // TODO 3.3: Assert that the page URL does NOT include '/admin'
    // (the member was redirected away from the admin route).
    expect(page.url()).not./* TODO 3.3: toContain('/admin') */ toContain('PLACEHOLDER');
  });

  // Test 3: CSRF token exists in form before submission
  test('settings form contains a CSRF token', async ({ page }) => {
    await page.goto('/settings');

    // TODO 3.4: Get the value of the hidden input[name="csrf_token"] on the settings form.
    // Assign it to csrfToken.
    const csrfToken = await page.locator(/* TODO 3.4: 'input[name="csrf_token"]' */ 'PLACEHOLDER').inputValue();

    // TODO 3.5: Assert that csrfToken.length is greater than 10 (non-trivial token).
    expect(csrfToken.length).toBeGreaterThan(/* TODO 3.5: 10 */ 0);
  });

  // Test 4: CSRF token is sent in request header
  test('CSRF token is included in settings save request', async ({ page }) => {
    await page.goto('/settings');

    let capturedCsrfHeader = '';

    page.on('request', req => {
      if (req.url().includes('/api/settings') && req.method() === 'POST') {
        // TODO 3.6: Capture req.headers()['x-csrf-token'] into capturedCsrfHeader.
        capturedCsrfHeader = req.headers()[/* TODO 3.6: 'x-csrf-token' */ 'x-placeholder'] ?? '';
      }
    });

    await page.getByLabel('Display name').fill('Updated Name');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(500);

    // TODO 3.7: Assert that capturedCsrfHeader is truthy (header was sent with the request).
    expect(capturedCsrfHeader)./* TODO 3.7: toBeTruthy() */ toBeFalsy();
  });

  // Test 5: XSS payload does not execute
  test('XSS payload in task title is sanitized and not executed', async ({ page }) => {
    await page.goto('/dashboard');

    const xssPayload = '<script>window.__xssExecuted = true</script>';

    await page.getByRole('button', { name: 'Add task' }).first().click();
    await page.getByTestId('task-title-input').fill(xssPayload);
    await page.getByRole('button', { name: 'Create' }).click();
    await page.waitForTimeout(500);

    // TODO 3.8: Use page.evaluate() to read window.__xssExecuted.
    // Assign it to xssExecuted.
    const xssExecuted = await page.evaluate(
      () => /* TODO 3.8: (window as any).__xssExecuted */ (window as any).__xssExecuted
    );

    // TODO 3.9: Assert that xssExecuted is undefined (the script tag was not executed).
    expect(xssExecuted).toBe(/* TODO 3.9: undefined */ 'executed');
  });

  // Test 6: XSS payload is visible as escaped text
  test('XSS payload renders as escaped text, not HTML', async ({ page }) => {
    await page.goto('/dashboard');

    const xssPayload = '<img src=x onerror="window.__imgError=true">';

    await page.getByRole('button', { name: 'Add task' }).first().click();
    await page.getByTestId('task-title-input').fill(xssPayload);
    await page.getByRole('button', { name: 'Create' }).click();
    await page.waitForTimeout(500);

    // Assert the onerror handler did not execute
    const imgErrorFired = await page.evaluate(() => (window as any).__imgError);
    // TODO 3.10: Assert that imgErrorFired is undefined (onerror handler was not executed).
    expect(imgErrorFired).toBe(/* TODO 3.10: undefined */ 'fired');
  });

  // Test 7: Screenshot masks sensitive data
  test('screenshot masks the API key value', async ({ page }) => {
    await page.goto('/settings/api');

    const screenshotBuffer = await page.screenshot({
      // TODO 3.11: Add mask: [page.getByTestId('api-key-value')] to hide the key.
      // Why? Unmasked API keys in screenshots can be exposed if artifacts are shared publicly.
      mask: /* TODO 3.11: [page.getByTestId('api-key-value')] */ [],
    });

    // A non-empty buffer confirms the screenshot was taken
    expect(screenshotBuffer.length).toBeGreaterThan(0);
  });

});

test.describe('Part 4 — OAuth & SSO Deep Dive (formerly M66)', () => {

  // Test 1: Assert PKCE parameters in the authorization URL
  test('authorization request includes PKCE code_challenge', async ({ page }) => {
    let authUrl = '';

    // Capture the GitHub OAuth authorization URL before it redirects
    page.on('request', req => {
      if (req.url().includes('github.com/login/oauth/authorize')) {
        authUrl = req.url();
      }
    });

    // Navigate to the login page and click the GitHub OAuth button
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in with github/i }).click();
    await page.waitForTimeout(500);

    const params = new URL(authUrl).searchParams;

    // TODO 4.1: Assert that params.get('code_challenge') is truthy.
    // Why? PKCE requires code_challenge in the authorization request — its absence is a security flaw.
    expect(params.get(/* TODO 4.1: 'code_challenge' */ 'PLACEHOLDER')).toBeTruthy();
  });

  // Test 2: Mock OAuth provider authorization endpoint
  test('mock OAuth provider skips the real provider UI', async ({ page }) => {
    // TODO 4.2: Use page.route() to intercept 'https://github.com/login/oauth/authorize*'.
    // Fulfill with a 302 redirect to:
    //   http://localhost:3000/api/auth/callback/github?code=test-code&state=<forwarded-state>
    // Why? Mocking the authorization endpoint skips GitHub's login UI entirely.
    await page.route(/* TODO 4.2: 'https://github.com/login/oauth/authorize*' */ 'https://PLACEHOLDER*', route => {
      const state = new URL(route.request().url()).searchParams.get('state') ?? '';
      const callbackUrl = new URL('http://localhost:3000/api/auth/callback/github');
      callbackUrl.searchParams.set('code', 'test-auth-code');
      callbackUrl.searchParams.set('state', state);
      route.fulfill({ status: 302, headers: { Location: callbackUrl.toString() } });
    });

    // Also mock the token endpoint
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

    await page.goto('/login');
    await page.getByRole('button', { name: /sign in with github/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 5000 });

    // TODO 4.3: Assert the page URL includes '/dashboard' (OAuth flow completed).
    expect(page.url()).toContain(/* TODO 4.3: '/dashboard' */ '/PLACEHOLDER');
  });

  // Test 3: Token endpoint returns access + refresh tokens
  test('token endpoint mock returns access and refresh tokens', async ({ page }) => {
    let tokenResponseBody = '';

    await page.route('https://github.com/login/oauth/authorize*', route => {
      const state = new URL(route.request().url()).searchParams.get('state') ?? '';
      const callbackUrl = new URL('http://localhost:3000/api/auth/callback/github');
      callbackUrl.searchParams.set('code', 'test-code');
      callbackUrl.searchParams.set('state', state);
      route.fulfill({ status: 302, headers: { Location: callbackUrl.toString() } });
    });

    // TODO 4.4: Route 'https://github.com/login/oauth/access_token' to capture the
    // request body and fulfill with { access_token, refresh_token, expires_in: 3600, token_type: 'Bearer' }.
    await page.route('https://github.com/login/oauth/access_token', async route => {
      const responseBody = {
        access_token: /* TODO 4.4: 'mock-access-token' */ '',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      };
      tokenResponseBody = JSON.stringify(responseBody);
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: tokenResponseBody,
      });
    });

    await page.goto('/login');
    await page.getByRole('button', { name: /sign in with github/i }).click();
    await page.waitForTimeout(1000);

    // TODO 4.5: Assert that tokenResponseBody includes 'access_token'.
    expect(tokenResponseBody).toContain(/* TODO 4.5: 'access_token' */ 'PLACEHOLDER');
  });

  // Test 4: Refresh token expiry redirects to login
  test('expired refresh token triggers logout redirect', async ({ page }) => {
    // Simulate a session where the refresh token has been revoked
    // TODO 4.6: Route '**/api/auth/session' to return { status: 401,
    //   body: { error: 'RefreshAccessTokenError' } }.
    // Why? The app calls this endpoint to validate the session — a 401 means tokens are invalid.
    await page.route('**/api/auth/session', route => {
      route.fulfill({
        status: /* TODO 4.6: 401 */ 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'RefreshAccessTokenError' }),
      });
    });

    await page.goto('/dashboard');

    // TODO 4.7: Assert that the page URL matches /.*login.*/ (user was logged out).
    await expect(page).toHaveURL(/* TODO 4.7: /.*login.*/ /.*PLACEHOLDER.*/ );
  });

  // Test 5: State parameter is forwarded to prevent CSRF
  test('OAuth callback forwards the state parameter', async ({ page }) => {
    let capturedState = '';

    page.on('request', req => {
      if (req.url().includes('github.com/login/oauth/authorize')) {
        capturedState = new URL(req.url()).searchParams.get('state') ?? '';
      }
    });

    await page.goto('/login');
    await page.getByRole('button', { name: /sign in with github/i }).click();
    await page.waitForTimeout(300);

    // TODO 4.8: Assert that capturedState is truthy (state parameter was sent in the authorization request).
    // Why? state is the CSRF protection mechanism in OAuth2 — its absence is a security vulnerability.
    expect(capturedState)./* TODO 4.8: toBeTruthy() */ toBeFalsy();
  });

  // Test 6: Conceptual — PKCE vs implicit flow
  test('PKCE prevents authorization code interception attacks', async ({}) => {
    // PKCE adds a code_verifier (random string) + code_challenge (hash of verifier) to the flow.
    // An attacker who intercepts the authorization code cannot exchange it for tokens
    // because they don't have the code_verifier.

    // TODO 4.9: What is the name of the hashing method used to generate code_challenge from code_verifier?
    const pkceMethod = /* TODO 4.9: 'S256' */ '';
    expect(pkceMethod).toBe('S256'); // SHA-256 is the PKCE standard method
  });

});

const MOCK_CHAT_SSE =
  'data: {"token":"You have "}\n\n' +
  'data: {"token":"3 overdue"}\n\n' +
  'data: {"token":" tasks."}\n\n' +
  'data: [DONE]\n\n';

test.describe('Part 5 — Chatbot & Rich UI Interaction (formerly M67)', () => {

  // Test 1: Type in a contenteditable editor
  test('pressSequentially types into a contenteditable chat input', async ({ page }) => {
    await page.goto('/dashboard');

    const chatInput = page.getByTestId('chat-input');

    // TODO 5.1: Click chatInput to focus it, then call pressSequentially('What tasks are overdue?').
    // Why? contenteditable does not accept fill() — it requires keyboard events via pressSequentially().
    await chatInput./* TODO 5.1: click() */ focus();
    await chatInput./* TODO 5.1: pressSequentially('What tasks are overdue?') */ fill('');

    // TODO 5.2: Assert that chatInput contains the text 'What tasks are overdue?'.
    await expect(chatInput).toContainText(/* TODO 5.2: 'What tasks are overdue?' */ 'PLACEHOLDER');
  });

  // Test 2: Send a message and assert typing indicator appears
  test('typing indicator appears after sending a chat message', async ({ page }) => {
    await page.goto('/dashboard');

    const chatInput = page.getByTestId('chat-input');
    await chatInput.click();
    await chatInput.pressSequentially('Hello');

    // TODO 5.3: Press 'Enter' via page.keyboard to send the message.
    // Why? The chat input uses Enter to send (Shift+Enter for newline).
    await page.keyboard.press(/* TODO 5.3: 'Enter' */ 'Tab');

    // TODO 5.4: Assert that the typing indicator is visible within 1000ms.
    await expect(page.getByTestId('chat-typing-indicator'))./* TODO 5.4: toBeVisible({ timeout: 1000 }) */ toBeHidden();
  });

  // Test 3: Mock chat API and assert streamed response
  test('streamed response renders in the chat panel', async ({ page }) => {
    // TODO 5.5: Route '**/api/chat' to fulfill with:
    //   status 200, Content-Type: 'text/event-stream', body: MOCK_CHAT_SSE.
    // Why? Mocking the chat endpoint makes the response deterministic and instant.
    await page.route(/* TODO 5.5: replace '**/PLACEHOLDER' with the chat API glob */ '**/PLACEHOLDER', route => {
      route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: MOCK_CHAT_SSE,
      });
    });

    await page.goto('/dashboard');
    const chatInput = page.getByTestId('chat-input');
    await chatInput.click();
    await chatInput.pressSequentially('What tasks are overdue?');
    await page.keyboard.press('Enter');

    // Wait for indicator to disappear (streaming complete)
    await expect(page.getByTestId('chat-typing-indicator')).toBeHidden({ timeout: 5000 });

    // TODO 5.6: Assert that the last chat message contains '3 overdue'.
    await expect(page.getByTestId('chat-message').last()).toContainText(/* TODO 5.6: '3 overdue' */ 'PLACEHOLDER');
  });

  // Test 4: Typing indicator disappears after streaming completes
  test('typing indicator disappears when response finishes', async ({ page }) => {
    await page.route('**/api/chat', route => {
      route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: MOCK_CHAT_SSE,
      });
    });

    await page.goto('/dashboard');
    const chatInput = page.getByTestId('chat-input');
    await chatInput.click();
    await chatInput.pressSequentially('Hello');
    await page.keyboard.press('Enter');

    // Indicator appears, then disappears
    await expect(page.getByTestId('chat-typing-indicator')).toBeVisible({ timeout: 1000 });

    // TODO 5.7: Assert that the typing indicator is hidden within 5000ms (streaming completed).
    await expect(page.getByTestId('chat-typing-indicator'))./* TODO 5.7: toBeHidden({ timeout: 5000 }) */ toBeVisible();
  });

  // Test 5: TipTap task description editor
  test('pressSequentially types into TipTap task description', async ({ page }) => {
    await page.goto('/dashboard');

    // Open a task to access the TipTap editor
    await page.getByTestId('task-card').first().click();
    await page.waitForSelector('[data-testid="task-detail-panel"]');

    // TipTap renders as contenteditable — inside an iframe in Lumio
    const editorFrame = page.frameLocator('[data-testid="tiptap-frame"]');
    const editor = editorFrame.locator('[contenteditable="true"]');

    await editor.click();

    // TODO 5.8: Call editor.pressSequentially('My task note') to type into the TipTap editor.
    await editor./* TODO 5.8: pressSequentially('My task note') */ fill('');

    // TODO 5.9: Assert that editor contains the text 'My task note'.
    await expect(editor).toContainText(/* TODO 5.9: 'My task note' */ 'PLACEHOLDER');
  });

  // Test 6: Chat message count increases after sending
  test('chat message list grows after each send', async ({ page }) => {
    await page.route('**/api/chat', route => {
      route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: MOCK_CHAT_SSE,
      });
    });

    await page.goto('/dashboard');
    const chatMessages = page.getByTestId('chat-message');
    const initialCount = await chatMessages.count();

    const chatInput = page.getByTestId('chat-input');
    await chatInput.click();
    await chatInput.pressSequentially('Test message');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('chat-typing-indicator')).toBeHidden({ timeout: 5000 });

    // After sending one message and receiving a response, count should be initialCount + 2
    // TODO 5.10: Assert that chatMessages count equals initialCount + 2.
    await expect(chatMessages).toHaveCount(/* TODO 5.10: initialCount + 2 */ initialCount);
  });

});

test.describe('Part 6 — CMS & Admin Panel Automation (formerly M68)', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the admin users page before each test
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
  });

  // Test 1: Sort the user table by email column
  test('clicking email column header sorts the table ascending then descending', async ({ page }) => {
    // TODO 6.1: Use getByRole('columnheader', { name: 'Email' }) to locate the email column header.
    // Why? getByRole('columnheader') is the most robust locator — it survives DOM restructuring.
    const emailHeader = page.getByRole(/* TODO 6.1: 'columnheader', { name: 'Email' } */ 'heading', { name: 'PLACEHOLDER' });

    await emailHeader.click();

    // TODO 6.2: Assert that emailHeader has attribute 'aria-sort' with value 'ascending'.
    await expect(emailHeader).toHaveAttribute(/* TODO 6.2: 'aria-sort', 'ascending' */ 'data-x', 'PLACEHOLDER');
  });

  // Test 2: Sort descending on second click
  test('second click on column header sorts descending', async ({ page }) => {
    const emailHeader = page.getByRole('columnheader', { name: 'Email' });

    await emailHeader.click(); // ascending
    await emailHeader.click(); // descending

    // TODO 6.3: Assert that emailHeader has attribute 'aria-sort' with value 'descending'.
    await expect(emailHeader).toHaveAttribute('aria-sort', /* TODO 6.3: 'descending' */ 'PLACEHOLDER');
  });

  // Test 3: Filter the user table by email
  test('filtering by email reduces visible rows', async ({ page }) => {
    const allRows = page.getByRole('row');
    const initialCount = await allRows.count(); // includes header row

    // TODO 6.4: Fill the filter input (placeholder 'Filter by email') with 'admin@'.
    const filterInput = page.getByPlaceholder(/* TODO 6.4: 'Filter by email' */ 'PLACEHOLDER');
    await filterInput.fill('admin@');

    await page.waitForTimeout(300); // debounce

    // TODO 6.5: Assert that allRows.count() is less than initialCount (filter reduced the rows).
    const afterCount = await allRows.count();
    expect(afterCount).toBeLessThan(/* TODO 6.5: initialCount */ 0);
  });

  // Test 4: Pagination — navigate to next page
  test('next page button changes the displayed rows', async ({ page }) => {
    const statusBefore = await page.getByTestId('pagination-status').textContent();

    // TODO 6.6: Click the 'Next page' button using getByRole('button', { name: 'Next page' }).
    await page.getByRole('button', { name: /* TODO 6.6: 'Next page' */ 'PLACEHOLDER' }).click();
    await page.waitForLoadState('networkidle');

    const statusAfter = await page.getByTestId('pagination-status').textContent();

    // TODO 6.7: Assert that statusAfter is not equal to statusBefore (page changed).
    expect(statusAfter).not.toBe(/* TODO 6.7: statusBefore */ '');
  });

  // Test 5: Select rows and trigger bulk delete
  test('bulk delete removes selected users', async ({ page }) => {
    const rows = page.getByRole('row');
    const initialCount = await rows.count();

    // Select rows 1, 2, and 3 (index 0 is the header row)
    // TODO 6.8: Check the checkbox in row nth(1) using getByRole('checkbox').check().
    await rows.nth(1).getByRole(/* TODO 6.8: 'checkbox' */ 'PLACEHOLDER').check();
    await rows.nth(2).getByRole('checkbox').check();
    await rows.nth(3).getByRole('checkbox').check();

    // Bulk toolbar should appear
    await expect(page.getByTestId('bulk-actions-toolbar')).toBeVisible();

    await page.getByRole('button', { name: 'Delete selected' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.waitForLoadState('networkidle');

    // TODO 6.9: Assert that row count is now initialCount - 3.
    await expect(rows).toHaveCount(/* TODO 6.9: initialCount - 3 */ initialCount);
  });

  // Test 6: Upload a workspace logo
  test('workspace logo upload shows preview', async ({ page }) => {
    await page.goto('/admin/settings');

    const logoFile = path.join(__dirname, '../../fixtures/logo.png');

    // The logo upload input may be hidden behind a custom button
    // TODO 6.10: Use setInputFiles() on the hidden input[type="file"] to upload the logo.
    // Why? setInputFiles() bypasses the OS file picker — it works on hidden inputs directly.
    await page.locator(/* TODO 6.10: 'input[type="file"]' */ 'input[type="PLACEHOLDER"]').setInputFiles(logoFile);

    await page.getByRole('button', { name: 'Upload' }).click();
    await page.waitForLoadState('networkidle');

    // TODO 6.11: Assert that the logo preview element is visible.
    await expect(page.getByTestId('logo-preview'))./* TODO 6.11: toBeVisible() */ toBeHidden();
  });

});

test.describe('Part 7 — SEO & Meta Verification (formerly M69)', () => {

  // Test 1: Title tag — the most basic but most visible SEO signal.
  test('landing page title contains "Lumio"', async ({ page }) => {
    await page.goto('/');
    // toHaveTitle retries until the title stabilizes — it handles SPA hydration correctly.
    // TODO 7.1: Pass a regex matching 'Lumio' to toHaveTitle.
    await expect(page).toHaveTitle(/* TODO 7.1: /Lumio/ */ /PLACEHOLDER/);
  });

  // Test 2: Meta description — sets the preview text in search engine results pages.
  test('landing page has a non-empty meta description', async ({ page }) => {
    await page.goto('/');
    // Meta tags have no ARIA role — CSS attribute selectors are the right locator strategy.
    // TODO 7.2: Locate meta[name="description"] using page.locator() with the correct CSS attribute selector.
    const metaDesc = page.locator(/* TODO 7.2: 'meta[name="description"]' */ 'meta[name="PLACEHOLDER"]');
    await expect(metaDesc).toHaveAttribute('content', /\S+/);
  });

  // Test 3: Open Graph tags — control link previews on Slack, LinkedIn, and Twitter/X.
  test('landing page has og:title, og:description, and og:image', async ({ page }) => {
    await page.goto('/');
    // OG tags use property="og:..." (not name="...") — the selector differs from standard meta.
    const ogTitle = page.locator('meta[property="og:title"]');
    // TODO 7.3: Assert ogTitle has a non-empty content attribute using the non-empty regex /\S+/.
    await expect(ogTitle).toHaveAttribute('content', /* TODO 7.3: /\S+/ */ '');

    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveAttribute('content', /\S+/);

    // TODO 7.4: Locate the og:image meta tag using the correct property attribute selector.
    const ogImage = page.locator(/* TODO 7.4: 'meta[property="og:image"]' */ 'meta[property="PLACEHOLDER"]');
    await expect(ogImage).toHaveAttribute('content', /\S+/);
  });

  // Test 4: JSON-LD structured data — machine-readable schema.org markup for search rich results.
  test('landing page has valid JSON-LD with @type SoftwareApplication', async ({ page }) => {
    await page.goto('/');
    // JSON-LD lives in <script type="application/ld+json"> — never visually rendered, but must be in the DOM.
    const jsonLd = page.locator('script[type="application/ld+json"]');

    // TODO 7.5: Replace toBeHidden() with toBeAttached() — the correct assertion for non-visual elements.
    // Script tags are never "visible" to the eye or screen readers; toBeAttached() checks DOM presence.
    await expect(jsonLd)./* TODO 7.5: toBeAttached() */ toBeHidden();

    const content = await jsonLd.textContent();
    const parsed = JSON.parse(content!);

    // TODO 7.6: Assert parsed['@type'] equals 'SoftwareApplication'.
    expect(parsed['@type']).toBe(/* TODO 7.6: 'SoftwareApplication' */ 'PLACEHOLDER');
  });

  // Test 5: Canonical URL — tells search engines the "true" URL to index for the page.
  test('landing page has a canonical URL tag pointing to the production domain', async ({ page }) => {
    await page.goto('/');
    // Canonical tags prevent duplicate-content penalties when the same content is at multiple URLs.
    const canonical = page.locator('link[rel="canonical"]');

    // TODO 7.7: Assert canonical has an 'href' attribute matching the regex /lumio\.io/.
    // The \. escapes the dot — in regex, an unescaped dot matches any character.
    await expect(canonical).toHaveAttribute('href', /* TODO 7.7: /lumio\.io/ */ /PLACEHOLDER/);
  });

  // Test 6: robots.txt — the access control list for search engine crawlers.
  test('robots.txt is present and does not block all crawlers', async ({ request }) => {
    // Use the request fixture — no browser page is needed for plain HTTP resources.
    const response = await request.get('/robots.txt');

    // TODO 7.8: Assert the response status is 200.
    expect(response.status()).toBe(/* TODO 7.8: 200 */ 0);

    const body = await response.text();
    // 'Disallow: /' blocks all crawlers from the entire site — a catastrophic misconfiguration.
    // TODO 7.9: Assert body does not contain 'Disallow: /'.
    // Note: the default '' always fails because every string contains the empty string.
    expect(body).not.toContain(/* TODO 7.9: 'Disallow: /' */ '');
  });

  // Test 7: sitemap.xml — the manifest of all URLs search engines should index.
  test('sitemap.xml is present and includes the Lumio domain', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);

    const body = await response.text();
    // TODO 7.10: Assert the sitemap body contains the string 'lumio.io'.
    // A sitemap pointing to localhost or a staging URL is a common deployment mistake.
    expect(body).toContain(/* TODO 7.10: 'lumio.io' */ 'PLACEHOLDER');
  });

  // Test 8: Unique page titles — duplicate titles split SEO link equity across pages.
  test('pricing page has a different title from the landing page', async ({ page }) => {
    await page.goto('/');
    const landingTitle = await page.title();

    await page.goto('/pricing');
    const pricingTitle = await page.title();

    // Each marketing page must have a unique title — duplicate titles confuse search engines.
    // TODO 7.11: Assert pricingTitle does not equal landingTitle using not.toBe().
    // The default pricingTitle always fails: a string is never not-equal to itself.
    expect(pricingTitle).not.toBe(/* TODO 7.11: landingTitle */ pricingTitle);
  });

});

test.describe('Part 8 — Broken Link & Navigation Monitoring (formerly M70)', () => {

  // Test 1: Passive 404 detection using page.on('response').
  test('landing page loads without any 404 responses', async ({ page }) => {
    const found404s: string[] = [];
    page.on('response', response => {
      if (response.status() === 404) found404s.push(response.url());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // TODO 8.1: Assert found404s has length 0 — no resource loaded with a 404 status.
    // The default 999 always fails: a healthy page loads far fewer than 999 broken resources.
    expect(found404s).toHaveLength(/* TODO 8.1: 0 */ 999);
  });

  // Test 2: Active link checking via the request fixture (no browser overhead).
  test('key marketing pages respond with 2xx or 3xx status', async ({ request }) => {
    const links = ['/pricing', '/docs', '/blog'];

    for (const link of links) {
      // TODO 8.2: Use request.get(link) to fetch each link and assert the status is less than 400.
      // The default '/PLACEHOLDER' returns 404, which is not < 400 — the test fails as expected.
      const response = await request.get(/* TODO 8.2: link */ '/PLACEHOLDER');
      expect(response.status()).toBeLessThan(400);
    }
  });

  // Test 3: Counting internal nav links — verifies the nav rendered correctly.
  test('header navigation contains at least 3 internal links', async ({ page }) => {
    await page.goto('/');
    // [href^="/"] selects only internal links — excludes external URLs and mailto: addresses.
    const navLinks = page.locator('nav a[href^="/"]');
    const count = await navLinks.count();

    // TODO 8.3: Assert count is greater than or equal to 3.
    // The default 999 always fails — Lumio's nav has far fewer than 999 links.
    expect(count).toBeGreaterThanOrEqual(/* TODO 8.3: 3 */ 999);
  });

  // Test 4: Redirect chain — page.goto() follows all redirects and reflects the final URL.
  test('navigating to /dashboard without auth redirects to /login', async ({ page }) => {
    // page.goto() follows all redirects automatically and updates page.url() to the final destination.
    await page.goto('/dashboard');

    // TODO 8.4: Assert the page landed on a URL matching /login/ using toHaveURL.
    await expect(page).toHaveURL(/* TODO 8.4: /login/ */ /PLACEHOLDER/);
  });

  // Test 5: response.url() gives the final URL after the full redirect chain.
  test('response.url() reflects the final destination after redirect', async ({ page }) => {
    // page.goto() returns the Response of the final request after all redirects.
    const response = await page.goto('/dashboard');

    // response.url() is the URL of the last response — not the originally requested URL.
    // TODO 8.5: Assert response.url() contains the string 'login'.
    expect(response!.url()).toContain(/* TODO 8.5: 'login' */ 'PLACEHOLDER');
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
      // TODO 8.6: Assert that the element with id=fragment is attached to the DOM.
      // Use toBeAttached() — the element may be off-screen but must exist.
      await expect(page.locator(`#${fragment}`))./* TODO 8.6: toBeAttached() */ toBeHidden();
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
      // TODO 8.7: Assert response.status() is less than 400 (accepts 2xx and 3xx, rejects 4xx and 5xx).
      expect(response.status()).toBeLessThan(/* TODO 8.7: 400 */ 0);
    }
  });

  // Test 8: A nonexistent page must return a proper 404 status code.
  test('a nonexistent page returns status 404', async ({ request }) => {
    // Some frameworks return 200 with an error page body — search engines then index the error page.
    // TODO 8.8: Use request.get('/this-page-does-not-exist-xyz') to check a nonexistent path.
    // The default '/' returns 200, not 404 — change it to a path that doesn't exist.
    const response = await request.get(/* TODO 8.8: '/this-page-does-not-exist-xyz' */ '/');
    expect(response.status()).toBe(404);
  });

});
