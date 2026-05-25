# M02: Locators — Finding Elements

## Learning Objectives

- Choose between `getByRole`, `getByLabel`, `getByText`, `getByPlaceholder`, `getByTestId`, CSS/XPath for any given element
- Chain locators to narrow scope to a specific container
- Filter a locator set with `.filter()` and select a specific index with `.nth()`
- Explain why locators are evaluated lazily (re-evaluated on each action, not at creation time)

## Concept

The most important question in any Playwright test is: *how do you find the element you want?* The answer matters far more than you might think — a fragile locator is the leading cause of flaky tests.

Playwright gives you several locator strategies. They're not equally good, and knowing the hierarchy will save you hours of debugging.

**`getByRole` is your default.** It targets elements by their ARIA role and accessible name — the same information screen readers use. `page.getByRole('button', { name: 'Submit' })` finds a button with the text "Submit" regardless of where it lives in the DOM, what class it has, or how it's styled. It survives refactors. If your designer renames a class from `.btn-primary` to `.btn-cta`, your `getByRole` test still passes.

**`getByLabel` is best for form inputs.** A label/input pair is a first-class HTML relationship. `page.getByLabel('Email address')` matches the `<input>` associated with a `<label>Email address</label>` — far more readable than `page.locator('#email-input')`.

**`getByText` for visible text content.** Use `exact: true` to prevent partial matches from causing false positives. `page.getByText('Pricing', { exact: true })` won't match a card that says "View pricing details".

**`getByTestId` when nothing else fits.** Feature cards and pricing cards on Lumio's landing page are visually distinct but don't have unique accessible names. That's exactly the right time for `data-testid`. The attribute exists solely for automation — it doesn't affect semantics or styling. Don't use `data-testid` as your *first* choice though; a `getByRole` that works is always clearer.

**Avoid CSS selectors and XPath** in almost all cases. They couple your tests to implementation details — a class rename or DOM restructure breaks them even when the feature is working fine.

### Locators are lazy

This is the property that makes Playwright tests robust. When you write:

```typescript
const heading = page.getByRole('heading', { level: 1 });
```

Playwright doesn't look up the element yet. It records *how* to find it. Every time you call `.toBeVisible()`, `.click()`, or any other operation on `heading`, Playwright evaluates the locator fresh against the current DOM state. This means if the DOM re-renders (a React state update, a fetch completing), your locator still finds the right element — it doesn't hold a stale reference.

### Chaining and filtering

Chaining narrows scope. If you have three pricing cards and you want the button inside the Pro card:

```typescript
const proCard = page.getByTestId('pricing-card-pro');
const proButton = proCard.getByRole('link'); // only searches inside proCard
```

`.filter()` is for when you start with a set of elements and want to narrow it by a condition. It's more composable than embedding the condition in the original locator. `.nth()` picks by position (zero-indexed).

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Complete each TODO in `exercise.spec.ts` in order.
Run after each TODO:
```bash
npx playwright test tests/module-02-locators --headed
```

## Key Takeaways

1. `getByRole` is the most resilient locator — it survives CSS and DOM structure changes.
2. A locator is not an element — it's a recipe evaluated fresh on every action.
3. Chain locators (`container.getByRole(...)`) to scope searches to a region, not the whole page.
4. `.filter()` composes with any locator; `.nth()` picks by position. Both are lazy.
5. `data-testid` is appropriate when no semantic locator uniquely identifies the element.

## Going Deeper

- [Playwright docs: Locators](https://playwright.dev/docs/locators)
- [Playwright docs: Best practices](https://playwright.dev/docs/best-practices)
