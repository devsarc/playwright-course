# M51: Component Testing Foundations

## Learning Objectives

- Mount a React component in a real browser using `@playwright/experimental-ct-react`
- Assert on rendered text, CSS classes, and data attributes
- Test callback props with closures
- Re-render a mounted component with `component.update()`
- Explain when CT is appropriate vs E2E: CT for exhaustive prop/state coverage, E2E for user workflows
- Unmount a component with `component.unmount()` and assert cleanup behaviour
- Explain the microfrontend rationale: CT lets you test a widget in isolation before embedding it

## Concept

Playwright CT vs full E2E:

| | CT | E2E |
|---|---|---|
| What's mounted | One React component | Full Next.js app |
| Infrastructure | Vite dev server (auto) | Running Lumio server |
| Speed | ~100ms per test | ~500ms–2s per test |
| Best for | Visual states, prop edge cases | User workflows, integration |

CT is not a replacement for E2E — it's a complement. Use it to exhaustively
test component behaviour without the cost of a full server.

## Key Takeaways

1. `mount()` returns a `Locator` — all Playwright locator methods work on it.
2. `component.update()` re-renders with new props — simulates parent state changes.
3. CT runs in a real browser — CSS, hover, and focus states are accurate.
4. Keep a separate `playwright-ct.config.ts`; CT tests use `testMatch: '**/*.ct.spec.tsx'`.
5. CT tests are not a subset of E2E — they run against a Vite dev server, not the full Next.js app. A bug that only appears in the full app context will not be caught by CT.

## Going Deeper

- [Playwright CT docs](https://playwright.dev/docs/test-components)
