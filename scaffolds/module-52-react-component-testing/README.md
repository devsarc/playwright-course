# M52: React Component Testing

## Learning Objectives

- Configure Playwright for component testing with the React/Vite setup
- Mount a React component with typed props using `mount()`
- Assert on component-rendered output with the standard locator API
- Use `beforeMount` to wrap a component with providers (ThemeProvider, QueryClientProvider)
- Listen for component events with `afterMount` and assert on event calls

## Concept

End-to-end tests run against a fully deployed application. Component tests run against a single component in isolation, mounted in a minimal browser environment. The distinction matters because many bugs live at the component level — wrong prop rendering, broken event handling, missing provider context — and e2e tests reach them only accidentally, not systematically.

**Playwright Component Testing (CT).** Playwright ships a component testing mode that works differently from the standard test runner. Instead of navigating to a URL, a CT test imports the component directly, mounts it with `mount()`, and interacts with it using the same locator and assertion API you already know. The component runs in a real browser — not JSDOM — so it behaves exactly as it would in the production app.

**Setup.** Component testing requires a separate Playwright CT config and a Vite build setup. For a React project:

```
npm install --save-dev @playwright/experimental-ct-react
```

The CT config (`playwright-ct.config.ts`) is separate from the e2e config (`playwright.config.ts`). It specifies the `ctPort` (the port Vite uses to serve the component harness) and the framework-specific plugin.

**Mounting a component.** The `mount()` function imports and renders a component with specified props:

```typescript
import { mount } from '@playwright/experimental-ct-react';
import TaskCard from './TaskCard';

const component = await mount(<TaskCard title="Fix login bug" priority="high" />);
await expect(component).toContainText('Fix login bug');
```

The `component` locator points to the mounted component's root element. All standard locator methods work on it: `getByRole()`, `getByText()`, `locator()`, etc. Assertions use the same `expect()` API.

**Props and TypeScript.** The `mount()` call is type-checked against the component's prop types. If `TaskCard` requires a `title: string` prop and you omit it, TypeScript reports the error at development time — before any test runs. This is the first point where component tests add value beyond e2e: they document the component's API through typed usage.

**Event assertions.** To assert that a component emits events or calls callbacks, pass a mock function as a prop:

```typescript
let clickCount = 0;
const component = await mount(
  <TaskCard title="Test" onDelete={() => { clickCount++ }} />
);
await component.getByRole('button', { name: 'Delete' }).click();
expect(clickCount).toBe(1);
```

This confirms that the `onDelete` callback fires when the button is clicked — a test that e2e testing cannot easily isolate, because in e2e the delete action triggers real backend requests.

**`beforeMount` for providers.** React components that consume Context (ThemeProvider, QueryClientProvider, AuthProvider) must be wrapped in those providers when mounted. `beforeMount` receives the component and wraps it:

```typescript
await mount(<BoardView />, {
  hooksConfig: {
    theme: 'dark',
  },
});
```

In the CT fixture file, `beforeMount` intercepts every `mount()` call and wraps the component:

```typescript
// playwright/index.tsx
import { beforeMount } from '@playwright/experimental-ct-react/hooks';

beforeMount(async ({ App, hooksConfig }) => {
  return <ThemeProvider theme={hooksConfig?.theme ?? 'light'}><App /></ThemeProvider>;
});
```

**When to use component tests.** Component tests are appropriate for: complex rendering logic (conditional rendering based on props), event handler wiring (does clicking the button call the right callback), provider integration (does the component read from context correctly), and edge case states (loading, empty, error). They are not appropriate for workflows that require multiple components working together — that's e2e. Component tests and e2e tests are complementary, not interchangeable.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Component tests require the CT config. Set up first, then complete TODOs in `exercise.spec.tsx`:
```bash
# Install CT support
npm install --save-dev @playwright/experimental-ct-react

# Run CT tests
npx playwright test --config playwright-ct.config.ts tests/module-52-react-component-testing
```

## Key Takeaways

1. Component tests run against a single component in a real browser — not JSDOM, not a deployed server.
2. `mount()` renders the component with typed props; the returned locator uses the standard API.
3. Pass mock functions as props to assert that event handlers are called correctly.
4. Use `beforeMount` to wrap components in required providers (ThemeProvider, QueryClientProvider).
5. Component tests complement e2e tests — use CT for isolated component logic, e2e for end-to-end flows.

## Going Deeper

- [Playwright docs: Component testing](https://playwright.dev/docs/test-components)
- [Playwright docs: CT with React](https://playwright.dev/docs/test-components#creating-a-playwright-component-test)
- [Playwright docs: beforeMount hook](https://playwright.dev/docs/test-components#hooks)
