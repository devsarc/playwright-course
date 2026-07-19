// Lesson 11: Component Testing: React & Vue
// Combines former module: M53 (Vue Component Testing) — Part 3 of this
// lesson.
//
// Parts 1, 2, and 4 (M51, M52, M54 — all React CT) live in the sibling file
// exercise.spec.tsx instead of here. M53 alone uses
// @playwright/experimental-ct-vue and a mount fixture that is not
// interchangeable with the React CT fixture used by the other three Parts,
// so it needs its own config (playwright-ct-vue.config.ts) and its own file.
//
// TODO numbers are prefixed with "3." to stay unique and consistent with
// this lesson's overall Part numbering (a TODO originally numbered N in the
// M53 module becomes TODO
// 3.N here).

import { test, expect } from '@playwright/experimental-ct-vue';

// In a real Vue CT test:
//   import TaskForm from '../../vue-demo/TaskForm.vue';
//   import type { ComponentProps } from '@playwright/experimental-ct-vue';

test.describe('Part 3 — Vue Component Testing (formerly M53)', () => {

  // Test 1: Mount a Vue component with props
  // Vue CT uses an options object for props (not JSX).
  test('mount with ComponentProps is type-safe', async ({ mount }) => {
    // Real Vue CT mount syntax:
    //   const component = await mount(TaskForm, {
    //     props: { initialTitle: 'My task' } as ComponentProps<typeof TaskForm>,
    //   });
    //   await expect(component).toContainText('My task');

    // TODO 3.1: What option key passes props in Vue CT (as opposed to JSX in React CT)?
    const vuePropsKey = /* TODO 3.1: 'props' */ '';
    expect(vuePropsKey).toBe('props');
  });

  // Test 2: Slots — Vue's first-class content projection
  // Vue slots are the equivalent of React children, with named variants.
  test('slots render custom content inside the component', async ({ mount }) => {
    // Real slot mounting:
    //   const component = await mount(TaskForm, {
    //     slots: {
    //       default: '<span>Custom footer</span>',
    //       actions: '<button>Extra action</button>',
    //     },
    //   });
    //   await expect(component).toContainText('Custom footer');
    //   await expect(component.getByRole('button', { name: 'Extra action' })).toBeVisible();

    // TODO 3.2: What option key passes slot content in Vue CT?
    const vueSlotsKey = /* TODO 3.2: 'slots' */ '';
    expect(vueSlotsKey).toBe('slots');
  });

  // Test 3: Component events (emit)
  // Vue components emit events with $emit(); CT listens via the 'on' option.
  test('component events are captured via the on option', async ({ mount }) => {
    // Real event testing:
    //   const emittedValues: string[] = [];
    //   const component = await mount(TaskForm, {
    //     on: {
    //       submit: (title: string) => emittedValues.push(title),
    //     },
    //   });
    //   await component.getByRole('button', { name: 'Submit' }).click();
    //   expect(emittedValues).toHaveLength(1);

    // TODO 3.3: What option key listens for Vue component events in CT?
    const vueEventsKey = /* TODO 3.3: 'on' */ '';
    expect(vueEventsKey).toBe('on');
  });

  // Test 4: afterMount for component instance access
  // Vue's afterMount gives access to the public component instance.
  test('afterMount accesses Vue component instance', async ({ mount }) => {
    // In playwright/index.ts (Vue CT hooks file):
    //   import { afterMount } from '@playwright/experimental-ct-vue/hooks';
    //   afterMount(async ({ instance }) => {
    //     // instance is the Vue ComponentPublicInstance
    //     // Access: instance.$data, instance.$props, instance.myMethod()
    //   });

    // TODO 3.4: Which hook provides access to the Vue component instance post-render?
    const instanceHookName = /* TODO 3.4: 'afterMount' */ '';
    expect(instanceHookName).toBe('afterMount');
  });

  // Test 5: Vue CT config differs from React CT only in the Vite plugin
  test('CT config for Vue uses the vue Vite plugin', async ({}) => {
    // React CT config: plugins: [react()]   → @vitejs/plugin-react
    // Vue CT config:   plugins: [vue()]     → @vitejs/plugin-vue
    //
    // The mount() API, locators, and assertions are identical.
    // Only the Vite plugin and the mount option structure differ.

    // TODO 3.5: What Vite plugin is used for Vue CT?
    const vueVitePlugin = /* TODO 3.5: 'vue' */ '';
    expect(vueVitePlugin).toBe('vue');
  });

  // Test 6: Comparing Vue CT and React CT patterns
  test('understand prop passing differences between React and Vue CT', async ({}) => {
    // React CT (JSX):
    //   await mount(<TaskCard title="Fix bug" priority="high" />);
    //
    // Vue CT (options object):
    //   await mount(TaskForm, { props: { initialTitle: 'My task' } });
    //
    // The locator and assertion API after mounting is IDENTICAL in both.

    // TODO 3.6: In Vue CT, props go inside which options key?
    const propsKey = /* TODO 3.6: 'props' */ '';
    // TODO 3.7: In Vue CT, event listeners go inside which options key?
    const eventsKey = /* TODO 3.7: 'on' */ '';
    // TODO 3.8: In Vue CT, slot content goes inside which options key?
    const slotsKey = /* TODO 3.8: 'slots' */ '';

    expect(propsKey).toBe('props');
    expect(eventsKey).toBe('on');
    expect(slotsKey).toBe('slots');
  });

  // Test 7: When to use Vue CT in a React-primary codebase
  test('identifies appropriate use cases for Vue CT', async ({}) => {
    const vueCTUseCases = [
      'Third-party Vue widget embedded in the React app via custom element',
      'Shared design system components published in Vue',
      'Legacy Vue pages being migrated to React (test both during migration)',
      'Micro-frontend architecture where one module is Vue',
    ];

    // TODO 3.9: Assert that vueCTUseCases is an Array with length > 0.
    // Why? Understanding the real-world contexts where Vue CT applies prevents
    // the common mistake of treating it as a tool only for Vue-primary projects.
    expect(Array.isArray(/* TODO 3.9: vueCTUseCases */)).toBe(true);
    expect(vueCTUseCases.length).toBeGreaterThan(0);
  });

});
