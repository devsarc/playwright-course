# M53: Vue Component Testing

## Learning Objectives

- Configure Playwright CT for a Vue 3 component using the Vite Vue plugin
- Mount a Vue component with typed props using `ComponentProps<T>`
- Test Vue-specific patterns: slots, component events (`emit`), and component instance access via `afterMount`
- Understand how to test Vue components in a React codebase context

## Concept

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

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Complete each TODO in `exercise.spec.ts` in order.
Vue CT requires its own config:
```bash
npm install --save-dev @playwright/experimental-ct-vue @vitejs/plugin-vue
npx playwright test --config playwright-ct-vue.config.ts tests/module-53-vue-component-testing
```

## Key Takeaways

1. Vue CT uses `@playwright/experimental-ct-vue` with `@vitejs/plugin-vue` — the locator/assertion API is identical to React CT.
2. `ComponentProps<T>` provides TypeScript type safety for Vue component props in CT.
3. Vue slots are tested by passing slot content in the `slots` mount option.
4. Component events (emits) are listened to via the `on` mount option.
5. `afterMount` in Vue CT gives access to the component instance — richer than the React equivalent.

## Going Deeper

- [Playwright docs: CT with Vue](https://playwright.dev/docs/test-components#creating-a-playwright-component-test)
- [Vue 3 component testing guide](https://vuejs.org/guide/scaling-up/testing)
- [Playwright experimental-ct-vue](https://www.npmjs.com/package/@playwright/experimental-ct-vue)
