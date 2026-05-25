# M47: Page Object Model

## Learning Objectives

- Encapsulate page selectors and repeated actions in a POM class
- Expose typed methods that return `Locator` objects (not resolved elements)
- Keep assertions in specs, not in the POM
- Explain when a POM adds value and when it adds unnecessary indirection
- Build component objects (sub-POMs) for reusable UI fragments like a modal or a nav bar
- Combine POMs with fixtures so tests receive a fully-navigated page object, not a raw page

## Concept

A Page Object Model wraps `page.*` calls behind a meaningful API:

```typescript
// Without POM
await page.getByTestId('add-card-button').click();
await page.getByTestId('new-card-input').fill('My task');
await page.getByTestId('new-card-input').press('Enter');

// With POM
await kanban.addCard('My task');
```

The POM hides the selector strings. When the implementation changes, only
the POM changes — not every spec file.

**Rules for good POMs:**
1. Return `Locator` from query methods — let callers assert.
2. Store locators as constructor-initialized fields (lazy, re-evaluated).
3. Never put `expect()` inside a POM.
4. One POM per logical page/component, not one per test.

## Key Takeaways

1. POMs centralize selectors — one change fixes all tests.
2. Methods should return `Locator`, not `ElementHandle` or booleans.
3. The POM pattern is optional — use it when you have 3+ tests sharing the same selectors.
4. Nested POMs (e.g., `KanbanCard` inside `KanbanColumn`) are valid for complex UIs.

## Going Deeper

- [Playwright docs: Page Object Models](https://playwright.dev/docs/pom)
