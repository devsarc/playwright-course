# M79: AI Test Healing (`playwright-test-healer`)

## Learning Objectives

- Understand the automated run → inspect → fix cycle that the `playwright-test-healer` agent executes
- Practice diagnosing broken tests by analyzing selector failures, timing issues, and assertion mismatches
- Know when AI healing is appropriate (locator changes) vs when manual intervention is required (logic changes)
- Apply human-in-the-loop review to healed tests before committing them

## Concept

Tests break in three ways: the code changed (a regression — the test caught something real), the test was wrong (a test code defect), or the UI changed without a functional change (a false positive — the test is now brittle). The `playwright-test-healer` agent targets the third case: brittle tests broken by refactoring.

**How the healer works.**

When a test fails, the healer:
1. Reads the failure message and the line that failed
2. Opens a browser, navigates to the page, and inspects the DOM at the failure point
3. Uses an LLM to reason about why the old locator or assertion no longer works
4. Proposes a fix (new locator, new assertion) and runs the test to verify it passes
5. Returns the diff for human review

**Run → Inspect → Fix cycle.**

```
playwright-test-healer --test tests/module-79-ai-test-healing/exercise.spec.ts
```

Output:
```
✗ Test "kanban card title" failed at:
  await expect(page.locator('.task-card__title')).toBeVisible();
  Reason: no elements found for selector ".task-card__title"

🔍 Inspecting DOM at /projects/test-project...
💡 Found: <h3 data-testid="task-title">Design mockups</h3>
🔧 Proposed fix: page.getByTestId('task-title') → or better: page.getByRole('heading')

Apply fix? [y/n]
```

The `y/n` prompt is the human-in-the-loop gate. The healer suggests; the human decides.

**When healing is appropriate.**

Heal when: the test was correct and a UI refactor broke the locator (CSS class renamed, element wrapped in a new container, element moved to a sibling). The fix is mechanical — find the element by a different selector.

Do NOT heal when: the assertion itself was wrong (healer would entrench the bug), the test logic is incorrect (healer can't understand intent), or the failure is revealing a real regression (healing would mask it).

**Reviewing a healed test.**

Before accepting a healed test:
1. Verify the new locator is semantic, not another brittle CSS selector
2. Confirm the healed assertion still tests the original intent
3. Run the test in isolation to confirm it passes without the prior test's state
4. Read the diff — don't just run the test

**Common breakage patterns exercised in this module.**

| Breakage | Root cause | Healing approach |
|---|---|---|
| CSS class selector fails | Class renamed in refactor | Replace with `getByRole` or `getByTestId` |
| `getByTestId` fails | `data-testid` removed | Replace with semantic `getByRole` + `name` |
| Assertion text fails | Copy changed | Update literal string to current value or regex |
| `waitForTimeout` fails | Operation now slower | Replace with `waitForLoadState` or expect assertion |
| Wrong element | Sibling element renamed | Scope locator more specifically |

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-79-ai-test-healing
```

## Key Takeaways

1. The healer targets false positives: tests broken by refactoring, not by real regressions.
2. The automated cycle is: run → read failure → inspect DOM → propose fix → verify → present for review.
3. Never accept a healed test without reading the diff — the healer can entrench a wrong assertion.
4. Healed locators should be semantic (role/label/text), not another brittle CSS selector.
5. The human-in-the-loop gate (`y/n`) is essential — it keeps humans responsible for test correctness.

## Going Deeper

- [Playwright: Locator best practices](https://playwright.dev/docs/best-practices#use-locators)
- [Why tests fail: the three failure modes](https://martinfowler.com/articles/nonDeterminism.html)
