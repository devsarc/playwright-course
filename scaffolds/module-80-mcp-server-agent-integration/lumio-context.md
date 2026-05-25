# Lumio Context: M80

## MCP use cases for Lumio

Lumio's team uses the Playwright MCP server in three scenarios:

**Incident reproduction.** When a support ticket says "I can't drag tasks on mobile WebKit in France," an engineer gives the AI agent instructions: "Connect to staging, log in as the affected user, navigate to their project, switch to French locale, and reproduce the drag-and-drop failure on a mobile viewport." The agent calls MCP tools in sequence — no Playwright code written.

**Exploratory testing of new features.** When the billing team ships a new payment method screen, a QA engineer says: "Explore the new `/billing/add-payment` page and document every interactive element, validation message, and state transition." The agent navigates, snapshots at each step, and returns structured documentation.

**Automated demo generation.** The marketing team requests screenshots of 12 key features for a product update email. An agent drives the browser through each feature, takes screenshots at the right moment, and exports them to a folder.

## MCP tool → Playwright API mapping

| Natural language instruction | MCP tool | Playwright API |
|---|---|---|
| "Navigate to /admin/users" | `browser_navigate` | `page.goto('/admin/users')` |
| "Click the 'New task' button" | `browser_click` | `page.getByRole('button', { name: 'New task' }).click()` |
| "Type 'hello' in the Task title input" | `browser_type` | `page.getByLabel('Task title').fill('hello')` |
| "What's on this page?" | `browser_snapshot` | `page.accessibility.snapshot()` |
| "Take a screenshot" | `browser_take_screenshot` | `page.screenshot()` |
| "What is document.title?" | `browser_evaluate` | `page.evaluate(() => document.title)` |

## Accessibility tree on the kanban board

The accessibility snapshot for `/projects/test-project` includes:
```
{ role: 'WebArea', name: 'Test Project — Lumio',
  children: [
    { role: 'banner', children: [{ role: 'navigation', ... }] },
    { role: 'main', children: [
      { role: 'button', name: 'New task' },
      { role: 'region', name: 'Todo', children: [
        { role: 'article', name: 'Design mockups', ... },
        ...
      ]},
      { role: 'region', name: 'In Progress', ... },
      { role: 'region', name: 'Done', ... }
    ]}
  ]}
```

An agent uses this tree to locate elements before clicking — the same information `getByRole` uses internally.
