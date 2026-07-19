# Lesson 11 Hints

## Part 1 — Component Testing Foundations (formerly M51)

### TODO 1.1 — mount and assert text

```tsx
const component = await mount(<KanbanCard title="Buy groceries" />);
await expect(component).toContainText('Buy groceries');
```

### TODO 1.2 — onDelete callback

```tsx
let deleted = false;
const component = await mount(
  <KanbanCard title="Delete me" onDelete={() => { deleted = true; }} />
);
await component.getByTestId('card-delete-btn').click();
expect(deleted).toBe(true);
```

### TODO 1.3 — done prop / CSS class

```tsx
const component = await mount(<KanbanCard title="Done task" done={true} />);
await expect(component).toHaveClass(/line-through/);
// or: await expect(component.getByTestId('card-completed-badge')).toBeVisible();
```

### TODO 1.4 — update()

```tsx
const component = await mount(<KanbanCard title="Before" />);
await component.update(<KanbanCard title="After" />);
await expect(component).toContainText('After');
```

## Part 2 — React Component Testing (formerly M52)

### TODO 2.1 — mount() API is understood

```typescript
const mountUnderstood = true;
```

The real mount call would be:
```tsx
const component = await mount(<TaskCard title="Fix login bug" priority="high" />);
await expect(component).toContainText('Fix login bug');
await expect(component).toHaveAttribute('data-priority', 'high');
```

`mount()` is the CT equivalent of `page.goto()`. Instead of navigating to a URL, it renders a component in the browser's component harness (served by Vite on a local port).

### TODO 2.2 — Text content assertion method

```typescript
const textAssertionMethod = 'toContainText';
```

Common CT assertions:
- `expect(component).toContainText('text')` — component output includes this text
- `expect(component).toBeVisible()` — component is visible in the DOM
- `expect(component).toHaveAttribute('data-x', 'value')` — attribute matches

### TODO 2.3 — Click count after one click

```typescript
const expectedCallCount = 1;
```

The full pattern:
```tsx
let deleteCallCount = 0;
const component = await mount(
  <TaskCard title="Test" onDelete={() => { deleteCallCount++ }} />
);
await component.getByRole('button', { name: 'Delete' }).click();
expect(deleteCallCount).toBe(1);
```

`onDelete` is a prop that receives a callback. The component calls it when delete is clicked. The test owns the callback and tracks how many times it was called.

### TODO 2.4 — Hidden badge assertion

```typescript
const hiddenAssertion = 'not.toBeVisible';
```

```tsx
const component = await mount(<NotificationBadge count={0} />);
await expect(component.getByTestId('badge-count')).not.toBeVisible();
```

### TODO 2.5 — Text assertion for visible badge

```typescript
const textAssertion = 'toContainText';
```

```tsx
const component = await mount(<NotificationBadge count={5} />);
await expect(component.getByTestId('badge-count')).toContainText('5');
```

### TODO 2.6 — Provider hook name

```typescript
const providerHookName = 'beforeMount';
```

Create `tests/playwright/index.tsx` (or wherever CT is configured to look):
```tsx
import { beforeMount } from '@playwright/experimental-ct-react/hooks';
import { ThemeProvider } from '../lumio/components/ThemeProvider';

beforeMount(async ({ App, hooksConfig }) => {
  return (
    <ThemeProvider theme={hooksConfig?.theme ?? 'light'}>
      <App />
    </ThemeProvider>
  );
});
```

Then in the test:
```tsx
const component = await mount(<BoardView />, {
  hooksConfig: { theme: 'dark' }
});
```

### TODO 2.7 — Post-render hook name

```typescript
const postRenderHookName = 'afterMount';
```

### TODO 2.8 — Assert both arrays are non-empty

```typescript
expect(bestForComponentTests.length).toBeGreaterThan(0);
expect(bestForE2eTests.length).toBeGreaterThan(0);
```

---

### Setting up CT for Lumio

```bash
npm install --save-dev @playwright/experimental-ct-react
```

Create `playwright-ct.config.ts`:
```typescript
import { defineConfig, devices } from '@playwright/experimental-ct-react';
import react from '@vitejs/plugin-react';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.tsx',
  use: {
    ctPort: 3100,
    ctViteConfig: {
      plugins: [react()],
    },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
```

Run CT tests:
```bash
npx playwright test --config playwright-ct.config.ts
```

## Part 3 — Vue Component Testing (formerly M53)

### TODO 3.1 — Props key in Vue CT

```typescript
const vuePropsKey = 'props';
```

Full example:
```typescript
import TaskForm from '../../vue-demo/TaskForm.vue';
import type { ComponentProps } from '@playwright/experimental-ct-vue';

const component = await mount(TaskForm, {
  props: { initialTitle: 'My task' } as ComponentProps<typeof TaskForm>,
});
await expect(component).toContainText('My task');
```

### TODO 3.2 — Slots key in Vue CT

```typescript
const vueSlotsKey = 'slots';
```

Full example:
```typescript
const component = await mount(TaskForm, {
  slots: {
    default: '<span>Custom footer text</span>',
    actions: '<button>Extra action</button>',
  },
});
await expect(component).toContainText('Custom footer text');
```

Named slots map to Vue's `<slot name="actions">` declarations inside the component template.

### TODO 3.3 — Events key in Vue CT

```typescript
const vueEventsKey = 'on';
```

Full example:
```typescript
const emittedValues: string[] = [];
const component = await mount(TaskForm, {
  on: {
    submit: (title: string) => emittedValues.push(title),
  },
});
await component.getByRole('button', { name: 'Submit' }).click();
expect(emittedValues).toHaveLength(1);
expect(emittedValues[0]).toBe('My expected task title');
```

### TODO 3.4 — afterMount hook name

```typescript
const instanceHookName = 'afterMount';
```

In `playwright/index.ts` (Vue CT hooks):
```typescript
import { afterMount } from '@playwright/experimental-ct-vue/hooks';

afterMount(async ({ instance }) => {
  // instance is ComponentPublicInstance
  // Access reactive data: instance.$data
  // Call methods: instance.myMethod()
});
```

### TODO 3.5 — Vue Vite plugin name

```typescript
const vueVitePlugin = 'vue';
```

Full Vue CT config (`playwright-ct-vue.config.ts`):
```typescript
import { defineConfig, devices } from '@playwright/experimental-ct-vue';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/module-11-*/exercise.vue.spec.tsx',
  use: {
    ctPort: 3101,
    ctViteConfig: {
      plugins: [vue()],
    },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
```

### TODO 3.6, 3.7, 3.8 — Vue CT option keys summary

```typescript
const propsKey = 'props';   // Pass props to the component
const eventsKey = 'on';     // Listen for emitted events
const slotsKey = 'slots';   // Provide slot content
```

### TODO 3.9 — Assert vueCTUseCases is a non-empty array

```typescript
expect(Array.isArray(vueCTUseCases)).toBe(true);
```

---

### Minimal vue-demo/TaskForm.vue

For reference — the component this module tests would look like:

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="title" data-testid="task-title-input" placeholder="Task title" />
    <slot name="actions">
      <button type="submit">Submit</button>
    </slot>
    <slot />
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{ initialTitle?: string }>();
const emit = defineEmits<{ submit: [title: string] }>();

const title = ref(props.initialTitle ?? '');

function handleSubmit() {
  emit('submit', title.value);
}
</script>
```

## Part 4 — Network Mocking in Component Tests (formerly M54)

### TODO 4.1 — CT Router class name

```typescript
const routerClassName = 'Router';
```

Import from the CT package:
```typescript
import { Router } from '@playwright/experimental-ct-react';
```

### TODO 4.2 — Loading state pattern

```typescript
const loadingTestPattern = 'never-fulfill';
```

Implementation:
```typescript
router.get('/api/tasks', async (route) => {
  await new Promise(() => {}); // Hangs forever — component stays in loading state
});
```

Add a test timeout to prevent the test from hanging indefinitely:
```typescript
test('loading state', async ({ mount }) => {
  test.setTimeout(5_000); // Fast timeout — we only need to check initial render
  // ...mount and assert loading spinner...
});
```

### TODO 4.3 — Fulfilled JSON response method

```typescript
const fulfillMethod = 'fulfill';
```

```typescript
await route.fulfill({
  status: 200,
  json: [{ id: 1, title: 'Test task' }],
});
```

The `json` shorthand sets `Content-Type: application/json` and serializes the object automatically.

### TODO 4.4 — Error HTTP status code

```typescript
const errorStatusCode = 500;
```

For other error states:
- `404` — resource not found (useful for "no tasks exist")
- `401` — unauthorized (session expired)
- `503` — service unavailable

### TODO 4.5 — MSW interception layer

```typescript
const mswLayer = 'Service Worker';
```

MSW uses the browser's Service Worker API to intercept `fetch()` and `XMLHttpRequest` calls. This means the request actually leaves the JavaScript context, gets handled by the service worker, and returns a mocked response — matching the full fetch lifecycle more accurately than simple stub functions.

### TODO 4.6 — MSW bypass function name

```typescript
const bypassFunctionName = 'bypass';
```

```typescript
import { bypass } from 'msw';

http.get('/api/tasks', async ({ request }) => {
  const realResponse = await bypass(request);
  return realResponse;
});
```

`bypass()` is also useful for logging: intercept the request, log it, let it through.

### TODO 4.7 — CT mocking is best for states

```typescript
const ctBestFor = 'states';
```

### TODO 4.8 — e2e mocking is best for API behavior

```typescript
const e2eBestFor = 'API behavior';
```

### TODO 4.9 — loading state

```typescript
'loading',
```

### TODO 4.10 — populated state

```typescript
'populated',
```

---

### Complete three-state test example

```typescript
import { Router } from '@playwright/experimental-ct-react';
import { mount } from '@playwright/experimental-ct-react';
import TaskList from '../../lumio/components/TaskList';

const mockTasks = [
  { id: 1, title: 'Fix login bug', priority: 'high' },
  { id: 2, title: 'Write API docs', priority: 'medium' },
];

test('loading state', async ({ mount }) => {
  const router = new Router();
  router.get('/api/tasks', () => new Promise(() => {}));

  const component = await mount(<TaskList />, { router });
  await expect(component.getByTestId('loading-spinner')).toBeVisible();
});

test('populated state', async ({ mount }) => {
  const router = new Router();
  router.get('/api/tasks', async (route) => {
    await route.fulfill({ json: mockTasks });
  });

  const component = await mount(<TaskList />, { router });
  await expect(component.getByTestId('task-card')).toHaveCount(2);
  await expect(component).toContainText('Fix login bug');
});

test('error state', async ({ mount }) => {
  const router = new Router();
  router.get('/api/tasks', async (route) => {
    await route.fulfill({ status: 500 });
  });

  const component = await mount(<TaskList />, { router });
  await expect(component.getByRole('alert')).toContainText('Failed to load');
});
```
