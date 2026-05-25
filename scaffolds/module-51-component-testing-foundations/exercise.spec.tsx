// ⚠️  This module requires two extra setup steps before tests will run:
//   1. Install CT packages: npm install --save-dev @playwright/experimental-ct-react @vitejs/plugin-react
//   2. lumio/components/kanban/KanbanCard does not exist — create it (a basic card component)
//      or update the import to point to lumio/components/board/task-card.tsx.
// Run CT tests with: npx playwright test --config playwright-ct.config.ts

// @ts-nocheck — CT imports differ from normal playwright/test
import { test, expect } from '@playwright/experimental-ct-react';
import KanbanCard from '../../lumio/components/kanban/KanbanCard';

// M51: Component Testing Foundations
//
// Playwright CT mounts a React component in a real Chromium browser tab —
// no jsdom, no mocking the DOM. This means CSS, hover states, animations,
// and focus rings all behave exactly as they would in production.
//
// CT is best for: visual states, user interactions on isolated components,
// edge-case prop combinations that are hard to reach through full-page tests.

test.use({ viewport: { width: 400, height: 300 } });

test('renders card title', async ({ mount }) => {
  // TODO 1: Mount <KanbanCard title="Buy groceries" /> and assert the
  // rendered text "Buy groceries" is visible.
  // mount() returns a Locator to the mounted component root.
  const component = await mount(/* TODO 1 */);
  await expect(component).toContainText(/* TODO 1: 'Buy groceries' */);
});

test('calls onDelete when delete button clicked', async ({ mount }) => {
  // TODO 2: Mount the KanbanCard with an onDelete prop that records whether
  // it was called. Use a let variable and a closure:
  //   let deleted = false;
  //   mount(<KanbanCard title="..." onDelete={() => { deleted = true; }} />)
  // Then click the delete button (data-testid="card-delete-btn") and
  // assert deleted === true.
  let deleted = false;
  const component = await mount(/* TODO 2 */);
  await component.getByTestId(/* TODO 2: 'card-delete-btn' */).click();
  expect(deleted).toBe(/* TODO 2: true */);
});

test('shows "completed" style when done prop is true', async ({ mount }) => {
  // TODO 3: Mount KanbanCard with done={true}. Assert the component has
  // the CSS class "line-through" or data-testid="card-completed-badge".
  // Why CT here? CSS class assertions on live-rendered components are
  // more reliable than unit-testing className strings.
  const component = await mount(/* TODO 3 */);
  await expect(component).toHaveClass(/* TODO 3 */);
});

test('update props via component.update()', async ({ mount }) => {
  // TODO 4: Mount KanbanCard with title="Before". Then call
  // component.update(<KanbanCard title="After" />) and assert "After" is visible.
  // update() re-renders with new props — simulates a parent state change.
  const component = await mount(/* TODO 4 */);
  await component.update(/* TODO 4 */);
  await expect(component).toContainText(/* TODO 4: 'After' */);
});
