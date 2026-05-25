# M52 Hints

## TODO 1 — mount() API is understood

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

## TODO 2 — Text content assertion method

```typescript
const textAssertionMethod = 'toContainText';
```

Common CT assertions:
- `expect(component).toContainText('text')` — component output includes this text
- `expect(component).toBeVisible()` — component is visible in the DOM
- `expect(component).toHaveAttribute('data-x', 'value')` — attribute matches

## TODO 3 — Click count after one click

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

## TODO 4 — Hidden badge assertion

```typescript
const hiddenAssertion = 'not.toBeVisible';
```

```tsx
const component = await mount(<NotificationBadge count={0} />);
await expect(component.getByTestId('badge-count')).not.toBeVisible();
```

## TODO 5 — Text assertion for visible badge

```typescript
const textAssertion = 'toContainText';
```

```tsx
const component = await mount(<NotificationBadge count={5} />);
await expect(component.getByTestId('badge-count')).toContainText('5');
```

## TODO 6 — Provider hook name

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

## TODO 7 — Post-render hook name

```typescript
const postRenderHookName = 'afterMount';
```

## TODO 8 — Assert both arrays are non-empty

```typescript
expect(bestForComponentTests.length).toBeGreaterThan(0);
expect(bestForE2eTests.length).toBeGreaterThan(0);
```

---

## Setting up CT for Lumio

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
