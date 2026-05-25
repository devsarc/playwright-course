# M38 Hints

## TODO 1 — Enable intra-file parallelism

```typescript
test.describe.configure({ mode: 'parallel' });
```

Place this as the FIRST statement inside `test.describe()`, before any `test()` calls. Without it, tests within the same describe block run sequentially even if `fullyParallel: true` is set in `playwright.config.ts`.

## TODO 2 — Generate unique workspace name

```typescript
return `${label}-${Date.now()}`;
```

`Date.now()` returns milliseconds since epoch — unique enough for test isolation. For even stronger guarantees, add a random suffix: `${label}-${Date.now()}-${Math.random().toString(36).slice(2)}`. In a real suite you might use a UUID library, but `Date.now()` is sufficient for parallel tests that start at different milliseconds.

## TODO 3 — Assert workspace name on dashboard

```typescript
await expect(page.getByText(workspaceName)).toBeVisible();
```

`getByText` performs a substring search by default — it matches any element containing `workspaceName`. If you want an exact match: `page.getByText(workspaceName, { exact: true })`.

## TODO 4 — Same pattern as test A

```typescript
await expect(page.getByText(workspaceName)).toBeVisible();
```

Note that `workspaceName` in test B is a different value from `workspaceName` in test A (different `Date.now()` timestamp). Both tests can run simultaneously and each asserts only on the workspace it created.

## TODO 5 — Local counter

```typescript
let localCounter = 0;
localCounter += 1;
expect(localCounter).toBe(1);
```

The key insight: `localCounter` lives inside the test function's closure. It is not shared with any other test. Each test that runs creates its own `localCounter` starting at 0.

## TODO 6 — Assert URL

```typescript
await expect(page).toHaveURL('/dashboard');
```

## TODO 7 — Navigate and assert main

```typescript
await page.goto('/dashboard');
await expect(page.getByRole('main')).toBeVisible();
```

The `main` landmark role is the `<main>` element in Lumio's layout. It is always present on authenticated pages.
