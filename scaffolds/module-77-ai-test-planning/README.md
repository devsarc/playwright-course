# M77: AI Test Planning (`playwright-test-planner`)

## Learning Objectives

- Understand what the `playwright-test-planner` agent does and how it produces a structured test plan
- Recognize the exploration phase: how an AI planner navigates an application to discover testable flows
- Evaluate and refine an AI-generated test plan for coverage gaps and priority gaps
- Practice the manual version of what the planner automates: systematic feature inventory on the kanban board

## Concept

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

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-77-ai-test-planning
```

## Key Takeaways

1. The AI test planner explores the app (navigation phase) then reasons about what to test (analysis phase) — two distinct phases.
2. AI plans cover obvious flows but miss role-based tests, empty state tests, and concurrent user scenarios — review for gaps.
3. Vague AI assertions ("correctly updates") must be replaced with measurable ones ("column count increases by 1") before implementation.
4. The manual feature inventory (navigate → observe → document) is the skill that makes you a good AI plan reviewer.
5. The plan output (JSON or Markdown) is consumed by `playwright-test-generator` in M78 — the planner and generator form a pipeline.

## Going Deeper

- [Playwright AI testing tools overview](https://playwright.dev/docs/ai-testing)
- [Evaluating AI-generated test plans (patterns)](https://martinfowler.com/articles/practical-test-pyramid.html)
