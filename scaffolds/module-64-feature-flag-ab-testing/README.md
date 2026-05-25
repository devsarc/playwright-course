# M64: Feature Flag & A/B Testing

## Learning Objectives

- Test both variants of a Lumio feature flag (AI suggestions: on vs off)
- Inject feature flags via `page.addInitScript()` without hitting the database
- Test cookie-based and URL-parameter-based flag mechanisms
- Build a CI strategy that covers all flag variants

## Concept

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

M13 introduced `addInitScript()` as a concept. M64 applies it specifically for flag injection. The key mechanism: scripts registered with `addInitScript()` execute in the browser context before the document's own scripts, in every navigation. This means:

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

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-64-feature-flag-ab-testing
```

## Key Takeaways

1. `page.addInitScript()` runs before page scripts — perfect for injecting flag values into `window.__featureFlags`.
2. Cookie-based flags are tested with `context.addCookies()` before `page.goto()`.
3. URL-parameter flags are tested by constructing the URL with the flag query string.
4. Test both variants (on and off) in the same file — both are required for complete flag coverage.
5. `addInitScript` persists across navigations in the same page — no re-injection needed on route changes.

## Going Deeper

- [Playwright docs: page.addInitScript()](https://playwright.dev/docs/api/class-page#page-add-init-script)
- [Playwright docs: context.addCookies()](https://playwright.dev/docs/api/class-browsercontext#browser-context-add-cookies)
- [LaunchDarkly: Testing with feature flags](https://docs.launchdarkly.com/guides/flags/testing-flags)
