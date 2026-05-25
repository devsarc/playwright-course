# Lumio Context: M79

## The refactoring events that broke these tests

This module simulates a real sprint where Lumio's frontend team made several independent changes:

| Change | Effect on tests |
|---|---|
| CSS class `.task-create-btn` → `.btn` + `data-action="create"` | Any test using `.task-create-btn` breaks |
| `data-testid="task-card-title"` removed from task card `<h3>` | `getByTestId('task-card-title')` finds nothing |
| Column heading copy: "TO DO" → "Todo" | Literal string assertion `'TO DO'` fails |
| Modal animation duration increased from 200ms to 800ms | `waitForTimeout(2000)` became flaky at 3s+ load |
| Task detail URL: `/task-detail?id=X` → `/projects/{slug}/tasks/{id}` | Old URL regex no longer matches |

All five changes were non-functional from a user perspective — the feature still works. But tests using brittle selectors or timing-dependent waits broke.

## How the healer approaches each case

The healer inspects the DOM after each failure and reasons:
1. "The element exists but the selector is wrong" → replace selector with a more robust one
2. "The text changed but the element is still there" → update the expected string
3. "The timing increased" → replace the wait with an assertion-based wait
4. "The URL pattern changed" → update the regex

Cases the healer cannot fix:
- A feature that was actually removed (no element to find)
- A logic regression (the test is correct, the code is wrong)
- A test that was wrong from the start (healer would entrench the bug)

## Healing review checklist for Lumio tests

When the healer proposes a fix, verify:
- [ ] The new locator uses `getByRole`, `getByLabel`, or `getByText` (not another CSS class)
- [ ] The assertion still tests the original intent (e.g., priority badge shows a valid value)
- [ ] The test passes in isolation: `npx playwright test --grep "test name" --headed`
- [ ] The fix doesn't break any other test that depended on the old element structure
