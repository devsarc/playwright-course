# Lesson 11: Component Testing: React & Vue

*Combines former modules M51–M54.*

## Learning Objectives

### Part 1 — Component Testing Foundations (formerly M51)

- Mount a React component in a real browser using `@playwright/experimental-ct-react`
- Assert on rendered text, CSS classes, and data attributes
- Test callback props with closures
- Re-render a mounted component with `component.update()`
- Explain when CT is appropriate vs E2E: CT for exhaustive prop/state coverage, E2E for user workflows
- Unmount a component with `component.unmount()` and assert cleanup behaviour
- Explain the microfrontend rationale: CT lets you test a widget in isolation before embedding it

### Part 2 — React Component Testing (formerly M52)

- Configure Playwright for component testing with the React/Vite setup
- Mount a React component with typed props using `mount()`
- Assert on component-rendered output with the standard locator API
- Use `beforeMount` to wrap a component with providers (ThemeProvider, QueryClientProvider)
- Listen for component events with `afterMount` and assert on event calls

### Part 3 — Vue Component Testing (formerly M53)

- Configure Playwright CT for a Vue 3 component using the Vite Vue plugin
- Mount a Vue component with typed props using `ComponentProps<T>`
- Test Vue-specific patterns: slots, component events (`emit`), and component instance access via `afterMount`
- Understand how to test Vue components in a React codebase context

### Part 4 — Network Mocking in Component Tests (formerly M54)

- Mock API responses inside a CT test using the `Router` class from `@playwright/experimental-ct-react`
- Test a component in three distinct states: loading, populated, and error
- Understand the difference between CT network mocking and e2e `page.route()` mocking
- Use MSW (Mock Service Worker) integration with CT for more realistic network simulation

## Concept

### Part 1 — Component Testing Foundations (formerly M51)

Playwright CT vs full E2E:

| | CT | E2E |
|---|---|---|
| What's mounted | One React component | Full Next.js app |
| Infrastructure | Vite dev server (auto) | Running Lumio server |
| Speed | ~100ms per test | ~500ms–2s per test |
| Best for | Visual states, prop edge cases | User workflows, integration |

CT is not a replacement for E2E — it's a complement. Use it to exhaustively
test component behaviour without the cost of a full server.

### Part 2 — React Component Testing (formerly M52)

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

### Part 3 — Vue Component Testing (formerly M53)

Lumio is a React application, but most professional development environments include Vue — in third-party widgets, embedded forms, design system components, or entirely separate teams using Vue for different products. Knowing how to test Vue components with Playwright CT means you can work with hybrid codebases without switching tools.

**The framing.** This module tests a standalone `vue-demo/TaskForm.vue` component — a minimal Vue form bundled alongside the main Lumio code but not part of the React app itself. In practice, you might encounter this pattern when: a design system team delivers components in Vue while the app team uses React, a third-party widget renders inside an iframe using a different framework, or you're migrating from Vue to React and need to test both simultaneously.

**CT config for Vue.** The CT configuration for Vue differs from React only in the Vite plugin:

```typescript
import vue from '@vitejs/plugin-vue';

// In defineConfig:
ctViteConfig: {
  plugins: [vue()],
}
```

The `mount()` API, locator methods, and assertion API are identical — Playwright CT abstracts the framework difference.

**`ComponentProps<T>`.** Vue's type system exposes a component's props through `ComponentProps<T>`. When you mount a Vue component, TypeScript uses this type to validate the props you pass:

```typescript
import type { ComponentProps } from '@playwright/experimental-ct-vue';
import TaskForm from './TaskForm.vue';

// TypeScript knows what props TaskForm accepts
const component = await mount(TaskForm, {
  props: { initialTitle: 'My task' } as ComponentProps<typeof TaskForm>,
});
```

The syntax differs from React CT (which uses JSX) because Vue components don't use JSX natively. Props are passed as an options object.

**Slots.** Vue components accept slot content — the equivalent of React's `children` prop but more powerful, supporting named slots. CT mounts components with slots:

```typescript
const component = await mount(TaskForm, {
  slots: {
    default: '<span>Custom footer text</span>',
    actions: '<button>Custom action</button>',
  },
});
```

Testing that slot content renders correctly is a Vue-specific concern — slots are a first-class feature of Vue's component model.

**Component events.** Vue components emit events using `$emit`. CT listens to component events:

```typescript
const events: string[] = [];
const component = await mount(TaskForm, {
  on: {
    submit: (value: string) => events.push(value),
  },
});

await component.getByRole('button', { name: 'Submit' }).click();
expect(events).toContain('submitted-task-title');
```

The `on` option maps to Vue's event system — it's the CT equivalent of passing callback props in React.

**`afterMount`.** Vue CT's `afterMount` hook receives the component's public instance, allowing post-render assertions on the component's internal state:

```typescript
afterMount(async ({ instance }) => {
  // instance is the Vue component instance
  // Access reactive state, methods, or computed properties
});
```

This is more commonly useful in Vue than in React because Vue exposes a richer component instance API (computed properties, methods, reactive state are all directly accessible on the instance).

**Shared CT setup.** When a project has both React and Vue components to test, use separate CT config files: `playwright-ct-react.config.ts` and `playwright-ct-vue.config.ts`. Run them with different `--config` flags. The test files are separate too — `.spec.tsx` for React, `.spec.ts` for Vue.

### Part 4 — Network Mocking in Component Tests (formerly M54)

A component that fetches data has three states that matter: loading (the request is in-flight), populated (the request succeeded), and error (the request failed). End-to-end tests reach these states by controlling the server — slow the server to test loading, return a 500 to test error. Component tests control network responses directly, without a server, using either the CT router or MSW.

**CT network routing.** Playwright CT exposes a `Router` class for intercepting requests inside the component test environment. Unlike e2e's `page.route()`, which intercepts all requests to a URL pattern, CT routing is scoped to the component harness:

```typescript
import { Router } from '@playwright/experimental-ct-react';

test('shows loaded tasks', async ({ mount }) => {
  const router = new Router();
  router.get('/api/tasks', async (route) => {
    await route.fulfill({
      json: [{ id: 1, title: 'Test task' }],
    });
  });

  const component = await mount(<TaskList />, { router });
  await expect(component.getByTestId('task-card')).toBeVisible();
});
```

The component makes its normal `fetch('/api/tasks')` call; CT intercepts it and returns the mocked response. No server involved.

**Testing the loading state.** To test loading state, don't fulfill the route — return a response that never resolves, or add a delay:

```typescript
router.get('/api/tasks', async (route) => {
  await new Promise(() => {}); // Never resolves — keeps component in loading state
});
const component = await mount(<TaskList />, { router });
await expect(component.getByTestId('loading-spinner')).toBeVisible();
```

**Testing the error state.** Return a non-200 status code:

```typescript
router.get('/api/tasks', async (route) => {
  await route.fulfill({ status: 500, body: 'Internal Server Error' });
});
const component = await mount(<TaskList />, { router });
await expect(component.getByRole('alert')).toContainText('Failed to load tasks');
```

**MSW integration.** Mock Service Worker (MSW) is a browser-native request interception library that works at the Service Worker level. It integrates with Playwright CT to provide a more realistic mock — the network request actually leaves the JavaScript runtime, is intercepted by a service worker, and returns a mocked response. This catches issues that a simple `route.fulfill()` bypass might miss, because the full fetch API lifecycle runs.

MSW's `bypass()` function lets specific requests pass through to a real server while others are mocked — useful when the component fetches from multiple endpoints and you only want to mock some of them.

**Why CT mocking differs from e2e `page.route()`.** In e2e, `page.route()` runs in the Node.js test process and intercepts requests at the network level before they reach the browser. In CT, the component and its `fetch()` calls run in the browser — the Router runs in a service worker or browser process, not in Node.js. This means CT routing is closer to how MSW works than how e2e routing works.

The practical implication: CT network mocking is more appropriate for simulating component-level states (loading, error, empty, populated). E2e network mocking is more appropriate for controlling the entire application's API behavior during a workflow. Use each where it belongs.

**`bypass()` for passthrough.** MSW's `bypass()` creates a request handler that allows the request through to the real endpoint. This is useful when: you want most requests mocked but one to hit the real server, you're testing error recovery (mock the first request to fail, let the retry hit the real server), or you're running in an environment where some endpoints have real data.

## Lumio Context

See [lumio-context.md](./lumio-context.md).

## Step-by-Step Tasks

### Part 1 — Component Testing Foundations

Validate this part only:
```bash
npx playwright test -c playwright-ct.config.ts tests/module-11-component-testing/exercise.spec.tsx -g "Part 1 — Component Testing Foundations (formerly M51)"
```

### Part 2 — React Component Testing

Component tests require the CT config. Set up first, then complete TODOs in `exercise.spec.tsx`:
```bash
# Install CT support
npm install --save-dev @playwright/experimental-ct-react

# Run CT tests
npx playwright test --config playwright-ct.config.ts tests/module-11-component-testing/exercise.spec.tsx
```

Validate this part only:
```bash
npx playwright test -c playwright-ct.config.ts tests/module-11-component-testing/exercise.spec.tsx -g "Part 2 — React Component Testing (formerly M52)"
```

### Part 3 — Vue Component Testing

Complete each TODO in `exercise.vue.spec.tsx` in order.
Vue CT requires its own config:
```bash
npm install --save-dev @playwright/experimental-ct-vue @vitejs/plugin-vue
npx playwright test --config playwright-ct-vue.config.ts tests/module-11-component-testing/exercise.vue.spec.tsx
```

Validate this part only:
```bash
npx playwright test -c playwright-ct-vue.config.ts tests/module-11-component-testing/exercise.vue.spec.tsx -g "Part 3 — Vue Component Testing (formerly M53)"
```

### Part 4 — Network Mocking in Component Tests

Complete each TODO in `exercise.spec.tsx` in order.
These exercises teach CT network mocking patterns conceptually:
```bash
npx playwright test --config playwright-ct.config.ts tests/module-11-component-testing/exercise.spec.tsx
```

Validate this part only:
```bash
npx playwright test -c playwright-ct.config.ts tests/module-11-component-testing/exercise.spec.tsx -g "Part 4 — Network Mocking in Component Tests (formerly M54)"
```

## Validate (full lesson)

```bash
npx playwright test -c playwright-ct.config.ts tests/module-11-component-testing/exercise.spec.tsx
npx playwright test -c playwright-ct-vue.config.ts tests/module-11-component-testing/exercise.vue.spec.tsx
```

## Key Takeaways

### Part 1 — Component Testing Foundations

1. `mount()` returns a `Locator` — all Playwright locator methods work on it.
2. `component.update()` re-renders with new props — simulates parent state changes.
3. CT runs in a real browser — CSS, hover, and focus states are accurate.
4. Keep a separate `playwright-ct.config.ts`; CT tests use `testMatch: '**/*.ct.spec.tsx'`.
5. CT tests are not a subset of E2E — they run against a Vite dev server, not the full Next.js app. A bug that only appears in the full app context will not be caught by CT.

### Part 2 — React Component Testing

1. Component tests run against a single component in a real browser — not JSDOM, not a deployed server.
2. `mount()` renders the component with typed props; the returned locator uses the standard API.
3. Pass mock functions as props to assert that event handlers are called correctly.
4. Use `beforeMount` to wrap components in required providers (ThemeProvider, QueryClientProvider).
5. Component tests complement e2e tests — use CT for isolated component logic, e2e for end-to-end flows.

### Part 3 — Vue Component Testing

1. Vue CT uses `@playwright/experimental-ct-vue` with `@vitejs/plugin-vue` — the locator/assertion API is identical to React CT.
2. `ComponentProps<T>` provides TypeScript type safety for Vue component props in CT.
3. Vue slots are tested by passing slot content in the `slots` mount option.
4. Component events (emits) are listened to via the `on` mount option.
5. `afterMount` in Vue CT gives access to the component instance — richer than the React equivalent.

### Part 4 — Network Mocking in Component Tests

1. CT network mocking intercepts `fetch()` calls inside the component harness without a real server.
2. Testing three states (loading, populated, error) is the baseline for any data-fetching component.
3. MSW integration provides more realistic request interception at the Service Worker level.
4. `bypass()` passes specific requests through to real endpoints — useful for mixed mock/real testing.
5. CT mocking is for component states; e2e `page.route()` is for application-level API control.

## Going Deeper

### Part 1 — Component Testing Foundations

- [Playwright CT docs](https://playwright.dev/docs/test-components)

### Part 2 — React Component Testing

- [Playwright docs: Component testing](https://playwright.dev/docs/test-components)
- [Playwright docs: CT with React](https://playwright.dev/docs/test-components#creating-a-playwright-component-test)
- [Playwright docs: beforeMount hook](https://playwright.dev/docs/test-components#hooks)

### Part 3 — Vue Component Testing

- [Playwright docs: CT with Vue](https://playwright.dev/docs/test-components#creating-a-playwright-component-test)
- [Vue 3 component testing guide](https://vuejs.org/guide/scaling-up/testing)
- [Playwright experimental-ct-vue](https://www.npmjs.com/package/@playwright/experimental-ct-vue)

### Part 4 — Network Mocking in Component Tests

- [Playwright docs: CT network routing](https://playwright.dev/docs/test-components#handling-network-requests)
- [MSW docs](https://mswjs.io/docs/)
- [MSW + Playwright CT guide](https://mswjs.io/docs/integrations/playwright)
