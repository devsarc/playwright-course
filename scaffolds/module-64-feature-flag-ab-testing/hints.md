# M64 Hints

## TODO 1 — addInitScript with flag enabled

```typescript
await page.addInitScript(() => {
  (window as any).__featureFlags = { aiSuggestions: true };
});
```

The script body runs inside the browser, before any page scripts. Set flags on `window` here — they'll be synchronously available when the React app initializes.

## TODO 2 — Assert panel is visible

```typescript
await expect(page.getByTestId('ai-suggestions-panel')).toBeVisible();
```

## TODO 3 — Flag disabled in init script

```typescript
(window as any).__featureFlags = { aiSuggestions: false };
```

## TODO 4 — Assert panel is hidden

```typescript
await expect(page.getByTestId('ai-suggestions-panel')).toBeHidden();
```

## TODO 5 — Parameterized addInitScript

```typescript
await page.addInitScript(
  (enabled: boolean) => { (window as any).__featureFlags = { aiSuggestions: enabled }; },
  true
);
```

The second argument to `addInitScript()` is serialized (JSON) and passed as the first argument to the browser function. Only serializable values work — no functions, no DOM elements, no class instances.

## TODO 6 — Cookie value for enabled state

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

## TODO 7 — Assert panel visible after cookie

```typescript
await expect(page.getByTestId('ai-suggestions-panel')).toBeVisible();
```

## TODO 8 — URL with flag parameter

```typescript
await page.goto('/dashboard?flags=beta_dashboard');
```

## TODO 9 — Assert beta banner visible

```typescript
await expect(page.getByTestId('beta-dashboard-banner')).toBeVisible();
```

## TODO 10 — Assert flag persists after SPA navigation

```typescript
expect(flagValue).toBe(true);
```

`addInitScript()` runs once when the page loads. In a SPA, client-side route changes (`pushState`) don't trigger a new page load — so `window.__featureFlags` is never reset. The flag remains set for the entire session.
