# M53 Hints

## TODO 1 — Props key in Vue CT

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

## TODO 2 — Slots key in Vue CT

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

## TODO 3 — Events key in Vue CT

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

## TODO 4 — afterMount hook name

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

## TODO 5 — Vue Vite plugin name

```typescript
const vueVitePlugin = 'vue';
```

Full Vue CT config (`playwright-ct-vue.config.ts`):
```typescript
import { defineConfig, devices } from '@playwright/experimental-ct-vue';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/module-53-vue-component-testing/*.spec.ts',
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

## TODO 6, 7, 8 — Vue CT option keys summary

```typescript
const propsKey = 'props';   // Pass props to the component
const eventsKey = 'on';     // Listen for emitted events
const slotsKey = 'slots';   // Provide slot content
```

## TODO 9 — Assert vueCTUseCases is a non-empty array

```typescript
expect(Array.isArray(vueCTUseCases)).toBe(true);
```

---

## Minimal vue-demo/TaskForm.vue

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
