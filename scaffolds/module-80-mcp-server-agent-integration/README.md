# M80: MCP Server & Agent Integration

## Learning Objectives

- Understand what the Playwright MCP server is and what tools it exposes to AI agents
- Connect the Playwright MCP server to an AI coding agent and use browser tools via natural language
- Recognize which Playwright APIs map to which MCP tools
- Know when MCP-based automation adds value vs when direct Playwright scripting is better

## Concept

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

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-80-mcp-server-agent-integration
```

## Key Takeaways

1. Playwright MCP server exposes `goto`, `click`, `type`, `snapshot`, `screenshot`, and `evaluate` as agent-callable tools.
2. `page.accessibility.snapshot()` is how an MCP agent "sees" the page — it returns the aria tree as structured data.
3. MCP is better for exploratory/dynamic scenarios; direct Playwright scripting is better for deterministic CI flows.
4. The snapshot contains roles, names, and values — the same data that `getByRole` and `getByLabel` use.
5. Any Playwright test can be rewritten as MCP tool calls — but the reverse (MCP → Playwright) is cleaner for CI.

## Going Deeper

- [Playwright MCP server documentation](https://playwright.dev/docs/mcp)
- [Model Context Protocol (MCP) specification](https://modelcontextprotocol.io/)
- [page.accessibility.snapshot()](https://playwright.dev/docs/api/class-accessibility#accessibility-snapshot)
