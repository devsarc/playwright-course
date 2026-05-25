# M04: Assertions — Verifying State

## Learning Objectives

- Use the most appropriate assertion matcher for each verification type
- Explain the difference between `expect()` (web-first, auto-retry) and Node.js `assert`
- Use soft assertions to collect multiple failures without short-circuiting
- Use `expect.poll()` for non-Playwright values that change asynchronously

## Concept

Assertions are how your tests decide whether the application is working correctly. In Playwright, assertions aren't just checks — they're *waiting* checks. This is what "web-first" means.

When you write:
```typescript
await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
```

Playwright doesn't just look at the DOM right now and pass or fail. It polls — repeatedly checking whether the heading is visible — until either the assertion passes or the timeout expires (default 5 seconds for assertions). This is the property that makes tests robust to animations, loading states, and async data fetches. The heading might not be visible *yet*, but if it becomes visible within the timeout, the assertion passes.

This is fundamentally different from Node.js `assert.ok(element)` — which is synchronous and checks state once, right now. Don't use `assert` for DOM state in Playwright tests.

### The most common matchers

**Page-level:**
- `toHaveTitle(/regex/)` — matches the document `<title>`
- `toHaveURL(/regex/)` — matches the current URL

**Locator-level:**
- `toBeVisible()` — attached + not hidden + non-zero size
- `toBeEnabled()` / `toBeDisabled()` — for form controls
- `toBeChecked()` — for checkboxes and radio buttons
- `toHaveText('exact string')` or `toHaveText(/regex/)` — text content
- `toContainText('partial')` — substring match
- `toHaveValue('value')` — for inputs
- `toHaveCount(n)` — number of elements matching a locator
- `toHaveAttribute('href', '/path')` — DOM attribute value

### Soft assertions

Normal assertions stop the test immediately on failure. Sometimes you want to check several independent things and get a report of *all* failures, not just the first.

```typescript
await expect.soft(page.getByRole('heading', { level: 1 })).toBeVisible();
await expect.soft(page).toHaveTitle(/Lumio/);
```

Both assertions run even if the first fails. The test is marked as failed after all soft assertions complete. Use soft assertions when the checks are truly independent — if check B depends on check A passing, use normal assertions.

### `expect.poll()` for non-Playwright values

Playwright's built-in matchers know how to auto-retry locator state. But sometimes you're asserting a JavaScript value that changes asynchronously — a counter, a WebSocket message count, a custom flag.

```typescript
await expect.poll(() => apiCallCount, { timeout: 3000 }).toBeGreaterThan(0);
```

`expect.poll` calls the function repeatedly until the assertion passes or the timeout expires. You can use any Jest-compatible matcher after `.poll(fn)`.

### Custom assertion messages

When an assertion fails, Playwright's error message tells you what was expected and what was found. You can add context with a second argument:

```typescript
await expect(page.getByRole('button'), 'submit button should be visible after form fills').toBeVisible();
```

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Complete each TODO in order.
```bash
npx playwright test tests/module-04-assertions
```

## Key Takeaways

1. Playwright assertions auto-retry — they assert what the page SHOULD become.
2. `expect.soft()` collects failures without stopping — use for independent checks.
3. `expect.poll(() => value)` handles non-Playwright values that change asynchronously.
4. `toHaveText` does exact match; use a regex for partial match.
5. Custom assertion messages: `expect(locator, 'element should be visible after login').toBeVisible()`.

## Going Deeper

- [Playwright docs: Assertions](https://playwright.dev/docs/test-assertions)
