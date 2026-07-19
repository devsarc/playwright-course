# Lesson 17: AI-Assisted Testing & MCP Integration

*Combines former modules M77–M80.*

## Learning Objectives

### Part 1 — AI Test Planning (formerly M77)

- Understand what the `playwright-test-planner` agent does and how it produces a structured test plan
- Recognize the exploration phase: how an AI planner navigates an application to discover testable flows
- Evaluate and refine an AI-generated test plan for coverage gaps and priority gaps
- Practice the manual version of what the planner automates: systematic feature inventory on the kanban board

### Part 2 — AI Test Code Generation (formerly M78)

- Understand how the `playwright-test-generator` agent translates a test plan into Playwright code
- Evaluate generated test code for robustness: locator quality, assertion coverage, and test independence
- Apply the critical evaluation skills needed to refine AI output before committing it to the codebase
- Recognize common AI code generation failure modes: brittle selectors, missing assertions, shared state

### Part 3 — AI Test Healing (formerly M79)

- Understand the automated run → inspect → fix cycle that the `playwright-test-healer` agent executes
- Practice diagnosing broken tests by analyzing selector failures, timing issues, and assertion mismatches
- Know when AI healing is appropriate (locator changes) vs when manual intervention is required (logic changes)
- Apply human-in-the-loop review to healed tests before committing them

### Part 4 — MCP Server & Agent Integration (formerly M80)

- Understand what the Playwright MCP server is and what tools it exposes to AI agents
- Connect the Playwright MCP server to an AI coding agent and use browser tools via natural language
- Recognize which Playwright APIs map to which MCP tools
- Know when MCP-based automation adds value vs when direct Playwright scripting is better

## Concept

### Part 1 — AI Test Planning (formerly M77)

The `playwright-test-planner` agent automates the tedious "what should we test?" phase. It navigates your application, observes UI states, and produces a structured test plan — a list of user flows, edge cases, and assertions organized by feature area.

**How the planner works.**

The planner runs Playwright to explore the application, then uses an LLM to reason about what it saw:

1. **Navigation phase:** The agent visits pages, clicks interactive elements, fills forms, and observes state transitions — building a map of the application.
2. **Analysis phase:** The LLM reasons about the observations: "This form has a required field — there should be a test for the empty submit case." "This table is sortable — there should be tests for ascending/descending sort."
3. **Output phase:** The agent produces a structured plan (JSON or Markdown) with: feature → flow → assertion list.

**Running the planner.**

```bash
npx playwright-test-planner --url http://localhost:3000 --page /dashboard --output plan.json
```

The output is a JSON file containing:
```json
{
  "feature": "Kanban Board",
  "flows": [
    {
      "name": "Create task",
      "steps": ["Click 'New task'", "Fill title", "Submit"],
      "assertions": ["task appears in Todo column", "column count increases by 1"]
    },
    {
      "name": "Drag task to In Progress",
      "steps": ["Hover over task card", "Drag to 'In Progress' column"],
      "assertions": ["task appears in correct column", "Todo count decreases by 1"]
    }
  ]
}
```

**Evaluating a generated plan.**

AI test plans are starting points, not final products. Evaluate a generated plan by asking:
- **Coverage:** Does it cover the happy path, the edge cases, and the error cases?
- **Priority:** Are the most critical flows listed first?
- **Specificity:** Are assertions concrete ("column count increases by 1") or vague ("task updates correctly")?
- **Independence:** Does each flow start from a known state, or does it depend on the prior flow?

Common gaps in AI-generated plans:
- Missing permission/role-based access tests
- Missing empty state tests (no tasks, no projects)
- Missing concurrent user scenarios (two users editing the same task)
- Vague assertions that don't tie to observable data

**The manual version: systematic feature inventory.**

Before AI planners existed, experienced engineers did this manually: navigate every page, interact with every control, note every state transition, and produce a test plan spreadsheet. The AI planner automates this — but understanding the manual version makes you a better evaluator of the AI's output.

The exercises below simulate the manual inventory that a planner would perform on the Lumio kanban board.

### Part 2 — AI Test Code Generation (formerly M78)

AI test generators translate the structured plan from Part 1 of this lesson (formerly M77) into runnable Playwright code. They do this by replaying the recorded browser actions and generating locators and assertions for each step.

**Running the generator.**

```bash
npx playwright-test-generator --plan plan.json --output tests/generated/ --base-url http://localhost:3000
```

The generator reads `plan.json` (produced by the planner), opens a browser, navigates through each flow, and emits a `.spec.ts` file for each feature.

**What good generated code looks like.**

A generator produces code like this:

```typescript
test('creates a new task in the Todo column', async ({ page }) => {
  await page.goto('/projects/test-project');
  await page.getByRole('button', { name: 'New task' }).click();
  await page.getByLabel('Task title').fill('My generated task');
  await page.getByRole('button', { name: 'Create task' }).click();

  const todoColumn = page.getByRole('region', { name: /todo/i });
  await expect(todoColumn.getByText('My generated task')).toBeVisible();
});
```

This is good: semantic locators, a clear assertion on the correct element.

**Common failure modes in generated code.**

**1. Brittle CSS selectors.** The generator uses what it observes in the DOM, and sometimes that's a class name:

```typescript
// Generated — bad:
await page.locator('.btn-primary').click(); // breaks when CSS is refactored

// Should be:
await page.getByRole('button', { name: 'Create task' }).click();
```

**2. Missing assertions.** Generators focus on the action sequence and sometimes omit assertions:

```typescript
// Generated — missing assertion:
await page.getByRole('button', { name: 'Create task' }).click();
// No check that the task was actually created

// Should add:
await expect(page.getByText('My generated task')).toBeVisible();
```

**3. Shared state between tests.** The generator records one continuous session and may assume state from earlier tests:

```typescript
// Generated — bad: assumes the prior test created a task
test('edits existing task', async ({ page }) => {
  await page.getByText('Task from previous test').click(); // fails if run in isolation
});
```

Each test must navigate to and create its own test data.

**4. `page.waitForTimeout()` as a wait strategy.** Generators often record the tester pausing and emit a hardcoded wait:

```typescript
// Generated — bad:
await page.waitForTimeout(2000); // timing-dependent, flaky in slow environments

// Should be:
await page.waitForLoadState('networkidle');
// or:
await expect(modal).toBeVisible();
```

**The review checklist for AI-generated tests.**

Before committing generated tests, check each one for:

1. All locators use semantic selectors (`getByRole`, `getByLabel`, `getByText`) not CSS/XPath
2. Every action has a corresponding assertion
3. Each test starts from a known state (no dependency on previous test)
4. No `waitForTimeout` — replaced by auto-waiting assertions or load state waits
5. Test data is not shared between tests (use `beforeEach` or API setup)

### Part 3 — AI Test Healing (formerly M79)

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
playwright-test-healer --test tests/module-17-ai-and-modern-tooling/exercise.spec.ts
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

### Part 4 — MCP Server & Agent Integration (formerly M80)

The Model Context Protocol (MCP) is a standard interface for AI agents to call tools. Playwright's MCP server (`@playwright/mcp`) exposes browser automation as a set of tools that any MCP-compatible AI agent can call via natural language instructions.

**What the Playwright MCP server provides.**

Running the server exposes tools including:

| MCP Tool | Playwright equivalent |
|---|---|
| `browser_navigate` | `page.goto(url)` |
| `browser_click` | `page.locator(selector).click()` |
| `browser_type` | `page.locator(selector).fill(text)` |
| `browser_snapshot` | `page.accessibility.snapshot()` |
| `browser_take_screenshot` | `page.screenshot()` |
| `browser_evaluate` | `page.evaluate(script)` |
| `browser_wait_for` | `page.waitForSelector()` |

An AI agent receives these tools and can call them in sequence to complete a task: "navigate to the Lumio login page, fill in the email and password, click sign in, then take a screenshot."

**Starting the MCP server.**

```bash
npx @playwright/mcp --port 3001
```

Then connect your AI coding agent (Claude, Copilot, etc.) to `http://localhost:3001/sse`. The agent discovers available tools and can call them via the MCP protocol.

**Why MCP over direct Playwright scripting?**

Direct Playwright scripting is better when: the flow is well-defined, the selectors are known, and the test runs in CI. MCP-based automation is better when: you want to drive the browser through natural language without writing code, the flow is exploratory, or you're building an AI agent that needs browser access as one tool among many.

MCP shines in:
- AI-assisted debugging: "navigate to this page and tell me what's broken"
- Dynamic task execution: "given this user report, reproduce the bug in the browser"
- Exploratory testing: "explore this new feature and document what you find"

**The `page.accessibility.snapshot()` API.**

The snapshot tool is the most distinctive MCP tool — it returns the aria accessibility tree of the current page as a structured object:

```typescript
const snapshot = await page.accessibility.snapshot();
// Returns:
// { role: 'WebArea', children: [
//   { role: 'navigation', children: [...] },
//   { role: 'main', children: [
//     { role: 'button', name: 'New task' },
//     ...
//   ]}
// ]}
```

An AI agent uses this snapshot to understand what's on the page before deciding what to click or type. It's the "see the page" step before "interact with the page."

**Use cases for Lumio.**

Lumio's engineering team uses MCP-based automation for:
- **Incident reproduction:** "Given this bug report from a user in France, reproduce the issue in the staging environment while logged in as that user"
- **Exploratory testing:** "Explore the new billing page and document every interactive element"
- **Demo generation:** "Navigate through the key Lumio features and take screenshots at each step for the marketing team"

## Lumio Context

See [lumio-context.md](./lumio-context.md).

## Step-by-Step Tasks

### Part 1 — AI Test Planning

```bash
npx playwright test tests/module-17-ai-and-modern-tooling
```

Validate this part only:
```bash
npx playwright test tests/module-17-ai-and-modern-tooling -g "Part 1 — AI Test Planning (formerly M77)"
```

### Part 2 — AI Test Code Generation

```bash
npx playwright test tests/module-17-ai-and-modern-tooling
```

Validate this part only:
```bash
npx playwright test tests/module-17-ai-and-modern-tooling -g "Part 2 — AI Test Code Generation (formerly M78)"
```

### Part 3 — AI Test Healing

```bash
npx playwright test tests/module-17-ai-and-modern-tooling
```

Validate this part only:
```bash
npx playwright test tests/module-17-ai-and-modern-tooling -g "Part 3 — AI Test Healing (formerly M79)"
```

### Part 4 — MCP Server & Agent Integration

```bash
npx playwright test tests/module-17-ai-and-modern-tooling
```

Validate this part only:
```bash
npx playwright test tests/module-17-ai-and-modern-tooling -g "Part 4 — MCP Server & Agent Integration (formerly M80)"
```

## Validate (full lesson)

```bash
npx playwright test tests/module-17-ai-and-modern-tooling
```

## Key Takeaways

### Part 1 — AI Test Planning

1. The AI test planner explores the app (navigation phase) then reasons about what to test (analysis phase) — two distinct phases.
2. AI plans cover obvious flows but miss role-based tests, empty state tests, and concurrent user scenarios — review for gaps.
3. Vague AI assertions ("correctly updates") must be replaced with measurable ones ("column count increases by 1") before implementation.
4. The manual feature inventory (navigate → observe → document) is the skill that makes you a good AI plan reviewer.
5. The plan output (JSON or Markdown) is consumed by `playwright-test-generator` in Part 2 of this lesson (formerly M78) — the planner and generator form a pipeline.

### Part 2 — AI Test Code Generation

1. AI generators produce working but not production-quality tests — always review before committing.
2. The most common flaw is brittle CSS locators: replace with `getByRole`, `getByLabel`, `getByText`.
3. Missing assertions are invisible failures — a test that clicks but never checks learned nothing.
4. `waitForTimeout` in generated code is always a sign the generator observed a pause — replace with auto-wait.
5. Generated tests in a shared session need to be refactored to be independent before use in CI.

### Part 3 — AI Test Healing

1. The healer targets false positives: tests broken by refactoring, not by real regressions.
2. The automated cycle is: run → read failure → inspect DOM → propose fix → verify → present for review.
3. Never accept a healed test without reading the diff — the healer can entrench a wrong assertion.
4. Healed locators should be semantic (role/label/text), not another brittle CSS selector.
5. The human-in-the-loop gate (`y/n`) is essential — it keeps humans responsible for test correctness.

### Part 4 — MCP Server & Agent Integration

1. Playwright MCP server exposes `goto`, `click`, `type`, `snapshot`, `screenshot`, and `evaluate` as agent-callable tools.
2. `page.accessibility.snapshot()` is how an MCP agent "sees" the page — it returns the aria tree as structured data.
3. MCP is better for exploratory/dynamic scenarios; direct Playwright scripting is better for deterministic CI flows.
4. The snapshot contains roles, names, and values — the same data that `getByRole` and `getByLabel` use.
5. Any Playwright test can be rewritten as MCP tool calls — but the reverse (MCP → Playwright) is cleaner for CI.

## Going Deeper

### Part 1 — AI Test Planning

- [Playwright AI testing tools overview](https://playwright.dev/docs/ai-testing)
- [Evaluating AI-generated test plans (patterns)](https://martinfowler.com/articles/practical-test-pyramid.html)

### Part 2 — AI Test Code Generation

- [Playwright docs: Best practices — locators](https://playwright.dev/docs/best-practices#use-locators)
- [Playwright codegen](https://playwright.dev/docs/codegen)
- [Testing Trophy / Test isolation principles](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)

### Part 3 — AI Test Healing

- [Playwright: Locator best practices](https://playwright.dev/docs/best-practices#use-locators)
- [Why tests fail: the three failure modes](https://martinfowler.com/articles/nonDeterminism.html)

### Part 4 — MCP Server & Agent Integration

- [Playwright MCP server documentation](https://playwright.dev/docs/mcp)
- [Model Context Protocol (MCP) specification](https://modelcontextprotocol.io/)
- [page.accessibility.snapshot()](https://playwright.dev/docs/api/class-accessibility#accessibility-snapshot)
