# M17: OAuth & SSO Flows

## Learning Objectives

- Interact with popup windows using `context.waitForEvent('page')`
- Explain why automating real OAuth flows is fragile
- Mock an OAuth provider by intercepting the callback URL
- Apply the same popup pattern to any external auth provider

## Concept

OAuth flows are tricky to test because they redirect to an external domain (GitHub, Google, Microsoft) that you don't control. The browser opens a popup or redirects to the provider's login page, which then redirects back with an authorization code.

Two strategies exist for testing this:

**Strategy 1: Automate the real flow**
Navigate to the provider's login page, fill in credentials, click authorize. Works, but:
- Brittle — the provider's UI changes break your tests
- Slow — external network roundtrip
- Fragile — providers add CAPTCHA and bot detection
- Credential management — real OAuth credentials in CI

**Strategy 2: Mock the provider** (recommended)
Intercept the OAuth callback URL that the provider would redirect to, and return a mocked response that simulates a successful authentication. Fast, reliable, no external dependencies.

### Handling popups

Some OAuth implementations open in a popup window rather than the same tab. Playwright handles this with:

```typescript
// Create the promise BEFORE the action that opens the popup
const popupPromise = page.context().waitForEvent('page');

// Click the button that opens the popup
await page.getByRole('button', { name: /GitHub/i }).click();

// Await the popup page
const popup = await popupPromise;

// Interact with the popup like any other Page object
await popup.waitForURL(/github\.com/);
await expect(popup).toHaveURL(/github\.com/);
await popup.close();
```

### Mocking the OAuth callback

NextAuth's callback URL follows the pattern `/api/auth/callback/{provider}`. Intercepting it:

```typescript
await page.route('/api/auth/callback/github*', async (route) => {
  await route.fulfill({
    status: 302,
    headers: { Location: '/dashboard' },
  });
});
```

This simulates what NextAuth would do after a successful GitHub OAuth exchange — redirect the user to the dashboard.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Complete each TODO in `exercise.spec.ts`.
```bash
npx playwright test tests/module-17-oauth --headed
```

Note: the real OAuth test (TODOs 1–4) requires an internet connection and will open
a GitHub page. The mock test (TODO 5) works offline.

## Key Takeaways

1. Create `waitForEvent('page')` promise BEFORE the action that opens the popup.
2. A popup is just a `Page` object — all Playwright APIs work on it.
3. Mock OAuth by intercepting the callback URL, not by automating the provider's UI.
4. The callback mock returns a 302 redirect to simulate a successful auth.
5. Real OAuth automation is fragile — mock it in every test suite that uses OAuth.

## Going Deeper

- [Playwright docs: Dialogs and popups](https://playwright.dev/docs/dialogs)
- [Playwright docs: Authentication](https://playwright.dev/docs/auth)
