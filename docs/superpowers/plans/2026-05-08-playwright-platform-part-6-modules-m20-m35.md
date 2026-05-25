# Playwright Learning Platform — Part 6: Advanced Playwright + Lumio Integration (M20–M35)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Write the exercise scaffold files for modules M20–M35. Each module covers an advanced Playwright technique applied directly to the Lumio application. For each module: `exercise.spec.ts` (or `.spec.tsx` for CT) with properly structured TODOs, `hints.md` with targeted guidance, `lumio-context.md` explaining the Lumio feature being tested, and a `README.md` with learning objectives and key takeaways.

**Architecture:** All module files live under `tests/module-NN-slug/`. Each `exercise.spec.ts` imports from `../fixtures/fixtures` (not directly from `@playwright/test`). TODOs state precisely **what** to implement — never **how**. Comments explain the reasoning behind the concept.

**Convention for TODOs:**
- `/* TODO N */` — inline placeholder where the learner replaces the comment with code
- `// TODO N: description` — description comment above the line that needs implementing
- Never reveal the answer in the comment — explain WHY the concept works, not the syntax

---

## Task 1: M20 — Page Object Model

**Files:**
- Create: `tests/module-20-page-object-model/pages/KanbanPage.ts`
- Create: `tests/module-20-page-object-model/exercise.spec.ts`
- Create: `tests/module-20-page-object-model/hints.md`
- Create: `tests/module-20-page-object-model/lumio-context.md`
- Create: `tests/module-20-page-object-model/README.md`

- [ ] **Step 1: Create `tests/module-20-page-object-model/pages/KanbanPage.ts`**

```typescript
import { type Page, type Locator } from '@playwright/test';

// M20: Page Object Model
//
// A POM wraps the raw Playwright page API behind meaningful method names.
// Tests call page.addCard('title') instead of scattering locator strings
// across multiple spec files. When Lumio's markup changes, you fix one file.

export class KanbanPage {
  readonly page: Page;

  // TODO 1: Declare Locator properties for the three column containers.
  // Each column has data-testid="kanban-column-{status}" where status is
  // "todo", "in-progress", or "done". Store them as readonly Locator fields.
  // Why store locators as fields? They're evaluated lazily — no DOM lookup
  // happens until you perform an action, so storing them is free.
  readonly todoColumn: Locator;
  readonly inProgressColumn: Locator;
  readonly doneColumn: Locator;

  // TODO 2: Declare a Locator for the "Add card" button.
  // data-testid="add-card-button"
  readonly addCardButton: /* TODO 2: Locator */;

  constructor(page: Page) {
    this.page = page;
    // TODO 3: Initialize all locators using page.getByTestId() in the constructor.
    // Locators must be created inside the constructor so they are bound to the
    // correct page instance — never pass strings around and call getByTestId later.
    this.todoColumn = page.getByTestId(/* TODO 3: 'kanban-column-todo' */);
    this.inProgressColumn = /* TODO 3 */;
    this.doneColumn = /* TODO 3 */;
    this.addCardButton = /* TODO 3 */;
  }

  // TODO 4: Implement goto() — navigate to the kanban board.
  // Accept a projectId parameter and navigate to /projects/{projectId}/board.
  async goto(projectId: string): Promise<void> {
    /* TODO 4 */
  }

  // TODO 5: Implement addCard(title) — click the add-card button, fill the
  // title input (data-testid="new-card-input"), and press Enter to submit.
  // The method should return a Locator pointing to the new card so the caller
  // can assert on it. Locator: getByTestId('kanban-card').filter({ hasText: title })
  async addCard(title: string): Promise<Locator> {
    /* TODO 5 */
  }

  // TODO 6: Implement cardCount(columnLocator) — return the number of cards
  // in a given column. Use column.getByTestId('kanban-card').count().
  // Why a method instead of a raw .count() call? It centralises the card
  // selector — if 'kanban-card' is renamed, one edit fixes everything.
  async cardCount(column: Locator): Promise<number> {
    /* TODO 6 */
  }
}
```

- [ ] **Step 2: Create `tests/module-20-page-object-model/exercise.spec.ts`**

```typescript
import { test, expect } from '../fixtures/fixtures';
import { KanbanPage } from './pages/KanbanPage';

// M20: Page Object Model
//
// Good POMs: thin wrappers that hide selectors, not business-logic layers.
// They return Locators (not element handles) so callers still get auto-waiting.
// Keep assertion logic in the spec — not in the POM — so failures are readable.

const PROJECT_ID = 'demo'; // seed data project id

test.describe('KanbanPage POM', () => {
  let kanban: KanbanPage;

  test.beforeEach(async ({ page }) => {
    // TODO 7: Instantiate KanbanPage and call goto(PROJECT_ID).
    // POMs are just plain classes — they don't need special registration.
    /* TODO 7 */
  });

  test('displays three columns', async ({ page }) => {
    // TODO 8: Use the POM locators (kanban.todoColumn, etc.) to assert that
    // all three columns are visible.
    await expect(/* TODO 8: kanban.todoColumn */).toBeVisible();
    await expect(/* TODO 8 */).toBeVisible();
    await expect(/* TODO 8 */).toBeVisible();
  });

  test('addCard() creates a card in the To Do column', async ({ page }) => {
    const title = 'POM test card';
    // TODO 9: Call kanban.addCard(title) and assert the returned Locator
    // is visible inside kanban.todoColumn.
    // Hint: use kanban.todoColumn.locator(cardLocator) to scope the assertion.
    const card = await kanban.addCard(/* TODO 9: title */);
    await expect(/* TODO 9 */).toBeVisible();
  });

  test('cardCount() returns correct number for a column', async ({ page }) => {
    // TODO 10: Call kanban.cardCount(kanban.todoColumn) and assert it is
    // greater than or equal to 0. Then add a card and assert the count increases by 1.
    const before = await kanban.cardCount(/* TODO 10 */);
    await kanban.addCard('count test');
    const after = await kanban.cardCount(/* TODO 10 */);
    expect(after).toBe(/* TODO 10: before + 1 */);
  });
});
```

- [ ] **Step 3: Create `tests/module-20-page-object-model/hints.md`**

```markdown
# M20 Hints

## TODO 1 — Locator property declarations

```typescript
readonly todoColumn: Locator;
readonly inProgressColumn: Locator;
readonly doneColumn: Locator;
```

## TODO 2 — addCardButton declaration

```typescript
readonly addCardButton: Locator;
```

## TODO 3 — Constructor initialization

```typescript
this.todoColumn = page.getByTestId('kanban-column-todo');
this.inProgressColumn = page.getByTestId('kanban-column-in-progress');
this.doneColumn = page.getByTestId('kanban-column-done');
this.addCardButton = page.getByTestId('add-card-button');
```

## TODO 4 — goto()

```typescript
async goto(projectId: string): Promise<void> {
  await this.page.goto(`/projects/${projectId}/board`);
}
```

## TODO 5 — addCard()

```typescript
async addCard(title: string): Promise<Locator> {
  await this.addCardButton.click();
  await this.page.getByTestId('new-card-input').fill(title);
  await this.page.getByTestId('new-card-input').press('Enter');
  return this.page.getByTestId('kanban-card').filter({ hasText: title });
}
```

## TODO 6 — cardCount()

```typescript
async cardCount(column: Locator): Promise<number> {
  return column.getByTestId('kanban-card').count();
}
```

## TODO 7 — beforeEach

```typescript
kanban = new KanbanPage(page);
await kanban.goto(PROJECT_ID);
```

## TODO 8 — column visibility

```typescript
await expect(kanban.todoColumn).toBeVisible();
await expect(kanban.inProgressColumn).toBeVisible();
await expect(kanban.doneColumn).toBeVisible();
```

## TODO 9 — addCard assertion

```typescript
const card = await kanban.addCard(title);
await expect(kanban.todoColumn.locator(card)).toBeVisible();
```

## TODO 10 — cardCount before/after

```typescript
const before = await kanban.cardCount(kanban.todoColumn);
await kanban.addCard('count test');
const after = await kanban.cardCount(kanban.todoColumn);
expect(after).toBe(before + 1);
```
```

- [ ] **Step 4: Create `tests/module-20-page-object-model/lumio-context.md`**

```markdown
# Lumio Context: M20

## The Kanban Board

Route: `/projects/{projectId}/board`

The board renders three swim-lane columns (To Do, In Progress, Done), each identified by
`data-testid="kanban-column-{status}"`. Cards within each column have
`data-testid="kanban-card"`. The "Add card" button is `data-testid="add-card-button"`;
after clicking it a text input appears with `data-testid="new-card-input"`.

## Where to find this in the code

```
lumio/app/(app)/projects/[projectId]/board/
  page.tsx          → top-level board layout
  KanbanColumn.tsx  → renders one column with its cards
  KanbanCard.tsx    → individual card component
```

## Seed data

The seed script (`lumio/prisma/seed.ts`) creates a project with id `"demo"` containing
cards spread across all three columns. Tests can navigate to `/projects/demo/board`
without needing to create a project first.
```

- [ ] **Step 5: Create `tests/module-20-page-object-model/README.md`**

```markdown
# M20: Page Object Model

## Learning Objectives

- Encapsulate page selectors and repeated actions in a POM class
- Expose typed methods that return `Locator` objects (not resolved elements)
- Keep assertions in specs, not in the POM
- Explain when a POM adds value and when it adds unnecessary indirection

## Concept

A Page Object Model wraps `page.*` calls behind a meaningful API:

```typescript
// Without POM
await page.getByTestId('add-card-button').click();
await page.getByTestId('new-card-input').fill('My task');
await page.getByTestId('new-card-input').press('Enter');

// With POM
await kanban.addCard('My task');
```

The POM hides the selector strings. When the implementation changes, only
the POM changes — not every spec file.

**Rules for good POMs:**
1. Return `Locator` from query methods — let callers assert.
2. Store locators as constructor-initialized fields (lazy, re-evaluated).
3. Never put `expect()` inside a POM.
4. One POM per logical page/component, not one per test.

## Key Takeaways

1. POMs centralize selectors — one change fixes all tests.
2. Methods should return `Locator`, not `ElementHandle` or booleans.
3. The POM pattern is optional — use it when you have 3+ tests sharing the same selectors.
4. Nested POMs (e.g., `KanbanCard` inside `KanbanColumn`) are valid for complex UIs.

## Going Deeper

- [Playwright docs: Page Object Models](https://playwright.dev/docs/pom)
```

- [ ] **Step 6: Commit**

```bash
git add tests/module-20-page-object-model/
git commit -m "feat(modules): add M20 Page Object Model exercise scaffold"
```

---

## Task 2: M21 — Component Testing

**Files:**
- Create: `tests/module-21-component-testing/exercise.spec.tsx`
- Create: `tests/module-21-component-testing/hints.md`
- Create: `tests/module-21-component-testing/lumio-context.md`
- Create: `tests/module-21-component-testing/README.md`

> **Note:** Component Testing uses a separate Playwright CT config (`playwright-ct.config.ts` at the repo root). The exercise imports from `@playwright/experimental-ct-react`. If the config doesn't exist yet, create it as described in Step 1.

- [ ] **Step 1: Create `playwright-ct.config.ts`** (if not present)

```typescript
import { defineConfig } from '@playwright/experimental-ct-react';
import react from '@vitejs/plugin-react';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.ct.spec.tsx',
  use: {
    ctPort: 3100,
    ctViteConfig: {
      plugins: [react()],
    },
  },
});
```

- [ ] **Step 2: Create `tests/module-21-component-testing/exercise.spec.tsx`**

```typescript
// @ts-nocheck — CT imports differ from normal playwright/test
import { test, expect } from '@playwright/experimental-ct-react';
import KanbanCard from '../../lumio/components/kanban/KanbanCard';

// M21: Component Testing
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
```

- [ ] **Step 3: Create `tests/module-21-component-testing/hints.md`**

```markdown
# M21 Hints

## TODO 1 — mount and assert text

```tsx
const component = await mount(<KanbanCard title="Buy groceries" />);
await expect(component).toContainText('Buy groceries');
```

## TODO 2 — onDelete callback

```tsx
let deleted = false;
const component = await mount(
  <KanbanCard title="Delete me" onDelete={() => { deleted = true; }} />
);
await component.getByTestId('card-delete-btn').click();
expect(deleted).toBe(true);
```

## TODO 3 — done prop / CSS class

```tsx
const component = await mount(<KanbanCard title="Done task" done={true} />);
await expect(component).toHaveClass(/line-through/);
// or: await expect(component.getByTestId('card-completed-badge')).toBeVisible();
```

## TODO 4 — update()

```tsx
const component = await mount(<KanbanCard title="Before" />);
await component.update(<KanbanCard title="After" />);
await expect(component).toContainText('After');
```
```

- [ ] **Step 4: Create `tests/module-21-component-testing/lumio-context.md`**

```markdown
# Lumio Context: M21

## KanbanCard component

Location: `lumio/components/kanban/KanbanCard.tsx`

Props:
- `title: string` — card label
- `done?: boolean` — marks card complete (adds `line-through` class to title)
- `onDelete?: () => void` — called when the delete icon button is clicked

The delete button renders with `data-testid="card-delete-btn"`.
Completed cards render a badge with `data-testid="card-completed-badge"`.

## Why test KanbanCard in isolation?

The full kanban board requires a logged-in user, a seed project, and a database.
CT lets you test every visual state of KanbanCard (loading, completed, error) in
milliseconds without any of that infrastructure.
```

- [ ] **Step 5: Create `tests/module-21-component-testing/README.md`**

```markdown
# M21: Component Testing

## Learning Objectives

- Mount a React component in a real browser using `@playwright/experimental-ct-react`
- Assert on rendered text, CSS classes, and data attributes
- Test callback props with closures
- Re-render a mounted component with `component.update()`

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

## Going Deeper

- [Playwright CT docs](https://playwright.dev/docs/test-components)
```

- [ ] **Step 6: Commit**

```bash
git add tests/module-21-component-testing/ playwright-ct.config.ts
git commit -m "feat(modules): add M21 Component Testing exercise scaffold"
```

---

## Task 3: M22 — Visual Regression

**Files:**
- Create: `tests/module-22-visual-regression/exercise.spec.ts`
- Create: `tests/module-22-visual-regression/hints.md`
- Create: `tests/module-22-visual-regression/lumio-context.md`
- Create: `tests/module-22-visual-regression/README.md`

- [ ] **Step 1: Create `tests/module-22-visual-regression/exercise.spec.ts`**

```typescript
import { test, expect } from '../fixtures/fixtures';

// M22: Visual Regression Testing
//
// toHaveScreenshot() compares pixel-by-pixel against a stored baseline PNG.
// On the first run (no baseline exists), Playwright writes the baseline and
// FAILS the test — re-run once to confirm it passes.
//
// Baselines live in __screenshots__/ next to the spec. Commit them to git
// so CI can compare against the same baseline you approved locally.

test.describe('Visual regression — Lumio landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('full landing page matches baseline', async ({ page }) => {
    // TODO 1: Take a full-page screenshot and compare against the baseline.
    // Pass { fullPage: true } to capture content below the fold.
    // Why visual tests? They catch CSS regressions (colour, spacing, layout)
    // that functional assertions miss entirely.
    await expect(page).toHaveScreenshot(/* TODO 1: 'landing-full.png', { fullPage: true } */);
  });

  test('hero section matches baseline', async ({ page }) => {
    // TODO 2: Capture only the hero section element using toHaveScreenshot on a Locator.
    // Locator: page.getByTestId('hero-section')
    // Scoping to one element prevents false positives from unrelated page changes.
    const hero = page.getByTestId(/* TODO 2: 'hero-section' */);
    await expect(hero).toHaveScreenshot(/* TODO 2: 'hero-section.png' */);
  });

  test('dark mode landing page matches baseline', async ({ page }) => {
    // TODO 3: Enable dark mode by evaluating JS to add the "dark" class to
    // document.documentElement, then take a full-page screenshot.
    // page.evaluate() runs code in the browser context — use it when you need
    // to manipulate the DOM in a way no UI interaction can do.
    await page.evaluate(/* TODO 3: () => document.documentElement.classList.add('dark') */);
    await expect(page).toHaveScreenshot(/* TODO 3: 'landing-dark.png', { fullPage: true } */);
  });
});

test.describe('Visual regression — Kanban board', () => {
  test('empty column state matches baseline', async ({ page }) => {
    await page.goto('/projects/demo/board');
    // TODO 4: Find the "done" column (data-testid="kanban-column-done") and
    // take a screenshot of just that column. Name it 'done-column.png'.
    // Element screenshots are more stable than full-page — board layout changes
    // won't break a test that only cares about one column's appearance.
    const doneColumn = page.getByTestId(/* TODO 4 */);
    await expect(doneColumn).toHaveScreenshot(/* TODO 4: 'done-column.png' */);
  });
});
```

- [ ] **Step 2: Create `tests/module-22-visual-regression/hints.md`**

```markdown
# M22 Hints

## TODO 1 — full-page screenshot

```typescript
await expect(page).toHaveScreenshot('landing-full.png', { fullPage: true });
```

## TODO 2 — element screenshot

```typescript
const hero = page.getByTestId('hero-section');
await expect(hero).toHaveScreenshot('hero-section.png');
```

## TODO 3 — dark mode screenshot

```typescript
await page.evaluate(() => document.documentElement.classList.add('dark'));
await expect(page).toHaveScreenshot('landing-dark.png', { fullPage: true });
```

## TODO 4 — column screenshot

```typescript
const doneColumn = page.getByTestId('kanban-column-done');
await expect(doneColumn).toHaveScreenshot('done-column.png');
```

## Updating baselines

When you intentionally change the UI, update baselines with:

```bash
npx playwright test module-22 --update-snapshots
```

## Threshold tuning

To allow minor rendering differences (anti-aliasing, font hinting):

```typescript
await expect(page).toHaveScreenshot('name.png', { maxDiffPixelRatio: 0.01 });
```
```

- [ ] **Step 3: Create `tests/module-22-visual-regression/lumio-context.md`**

```markdown
# Lumio Context: M22

## Visual areas under test

- **Landing page** (`/`) — hero, features grid, pricing section
- **Kanban board** (`/projects/demo/board`) — column layout, card appearance

## testid attributes for scoped screenshots

| Element | data-testid |
|---------|-------------|
| Hero section | `hero-section` |
| Feature cards | `feature-card` |
| Kanban column | `kanban-column-{status}` |
| Kanban card | `kanban-card` |

## Dark mode

Lumio uses Tailwind's `dark` class strategy. Adding `dark` to `<html>` switches
the entire page to dark mode without any localStorage or cookie setup.

## Screenshot storage

Playwright stores baselines at:
`tests/module-22-visual-regression/__screenshots__/`

Commit these PNG files to git. On CI, the same baselines are used for comparison.
```

- [ ] **Step 4: Create `tests/module-22-visual-regression/README.md`**

```markdown
# M22: Visual Regression Testing

## Learning Objectives

- Take full-page and element-scoped screenshots with `toHaveScreenshot()`
- Understand the baseline creation workflow (first run writes, second run compares)
- Update baselines intentionally with `--update-snapshots`
- Tune thresholds to handle minor rendering differences

## Concept

Visual regression catches what functional tests can't:
- A button's background changed from blue to grey
- A grid's spacing shrank by 4px
- Dark mode colours leaked into light mode

`toHaveScreenshot()` does pixel-by-pixel comparison. The first run creates the
baseline; subsequent runs diff against it.

**Workflow:**
1. Write test → run → baseline created → test fails (expected — no baseline yet)
2. Review the new PNG in `__screenshots__/`
3. Re-run → test passes (baseline matches itself)
4. UI changes → test fails → inspect diff → update with `--update-snapshots`

## Key Takeaways

1. Scope screenshots to elements, not full pages, for more stable tests.
2. Commit baseline PNGs to git — CI needs them.
3. `--update-snapshots` is intentional; don't run it blindly.
4. `maxDiffPixelRatio` handles anti-aliasing differences across OS/GPU.

## Going Deeper

- [Playwright docs: Screenshots](https://playwright.dev/docs/screenshots)
- [Playwright docs: Visual comparisons](https://playwright.dev/docs/test-snapshots)
```

- [ ] **Step 5: Commit**

```bash
git add tests/module-22-visual-regression/
git commit -m "feat(modules): add M22 Visual Regression exercise scaffold"
```

---

## Task 4: M23 — Accessibility Testing

**Files:**
- Create: `tests/module-23-accessibility/exercise.spec.ts`
- Create: `tests/module-23-accessibility/hints.md`
- Create: `tests/module-23-accessibility/lumio-context.md`
- Create: `tests/module-23-accessibility/README.md`

- [ ] **Step 1: Create `tests/module-23-accessibility/exercise.spec.ts`**

```typescript
import { test, expect } from '../fixtures/fixtures';
import AxeBuilder from '@axe-core/playwright';

// M23: Accessibility Testing with axe-core
//
// axe-core runs WCAG 2.1 rules in the browser context and returns a list of
// violations. Each violation has an id (e.g. "color-contrast"), impact level
// (critical/serious/moderate/minor), and the exact DOM nodes that fail.
//
// Install: npm install --save-dev @axe-core/playwright

test.describe('Accessibility — landing page', () => {
  test('landing page has no critical axe violations', async ({ page }) => {
    await page.goto('/');

    // TODO 1: Create an AxeBuilder for the page, run the analysis, and
    // destructure { violations } from the result.
    // AxeBuilder is instantiated with ({ page }) — it injects axe-core
    // into the current page and runs all enabled rules.
    const { violations } = await new AxeBuilder(/* TODO 1: { page } */).analyze();

    // TODO 2: Assert violations is an empty array.
    // Use expect(violations).toEqual([]) — if the assertion fails, Playwright
    // prints the full violations array which tells you exactly what to fix.
    expect(violations).toEqual(/* TODO 2: [] */);
  });

  test('landing page passes WCAG 2.1 AA rules only', async ({ page }) => {
    await page.goto('/');

    // TODO 3: Run axe with only WCAG 2.1 AA tags.
    // .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']) scopes the scan.
    // Why scope? Best-practice and experimental rules have false-positives;
    // WCAG tags target the rules your legal team actually cares about.
    const { violations } = await new AxeBuilder({ page })
      .withTags(/* TODO 3: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] */)
      .analyze();

    expect(violations).toEqual([]);
  });
});

test.describe('Accessibility — kanban board', () => {
  test('board page passes WCAG 2.1 AA', async ({ page }) => {
    await page.goto('/projects/demo/board');

    // TODO 4: Run a WCAG 2.1 AA scoped axe scan on the board page.
    // Reuse the same pattern from TODO 3.
    const { violations } = await /* TODO 4 */;

    expect(violations).toEqual([]);
  });

  test('each kanban card is keyboard-focusable', async ({ page }) => {
    await page.goto('/projects/demo/board');

    // TODO 5: Press Tab until a kanban card receives focus. Assert that
    // page.getByTestId('kanban-card').first() is focused using
    // expect(locator).toBeFocused().
    // Keyboard navigation tests go beyond axe — they verify interactive flow,
    // not just markup attributes.
    await page.keyboard.press('Tab');
    // TODO 5: press Tab enough times to reach the first card, then assert focus
    /* TODO 5 */
  });
});

test.describe('Accessibility — scoped scan', () => {
  test('pricing section has no violations', async ({ page }) => {
    await page.goto('/');

    // TODO 6: Scope the axe scan to only the pricing section using .include().
    // .include('[data-testid="pricing-section"]') limits the scan to that subtree.
    // Scoped scans are faster and surface fewer false positives from unrelated sections.
    const { violations } = await new AxeBuilder({ page })
      .include(/* TODO 6: '[data-testid="pricing-section"]' */)
      .analyze();

    expect(violations).toEqual([]);
  });
});
```

- [ ] **Step 2: Create `tests/module-23-accessibility/hints.md`**

```markdown
# M23 Hints

## TODO 1 — AxeBuilder instantiation

```typescript
const { violations } = await new AxeBuilder({ page }).analyze();
```

## TODO 2 — assert no violations

```typescript
expect(violations).toEqual([]);
```

## TODO 3 — WCAG 2.1 AA tags

```typescript
const { violations } = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  .analyze();
```

## TODO 4 — board page scan

```typescript
const { violations } = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  .analyze();
```

## TODO 5 — keyboard focus

```typescript
// Tab through navigation links until you reach the first card
for (let i = 0; i < 10; i++) {
  await page.keyboard.press('Tab');
  const focused = await page.getByTestId('kanban-card').first().evaluate(
    el => el === document.activeElement
  );
  if (focused) break;
}
await expect(page.getByTestId('kanban-card').first()).toBeFocused();
```

## TODO 6 — scoped include

```typescript
const { violations } = await new AxeBuilder({ page })
  .include('[data-testid="pricing-section"]')
  .analyze();
```

## Reading violation output

When `expect(violations).toEqual([])` fails, Playwright prints each violation:

```json
[{
  "id": "color-contrast",
  "impact": "serious",
  "nodes": [{ "html": "<p class=\"text-gray-400\">..." }]
}]
```

Fix the element, re-run, repeat.
```

- [ ] **Step 3: Create `tests/module-23-accessibility/lumio-context.md`**

```markdown
# Lumio Context: M23

## Pages under test

- `/` — landing page (hero, features, pricing)
- `/projects/demo/board` — kanban board (interactive cards, drag handles)

## Known accessibility targets in Lumio

| Element | Expected role | data-testid |
|---------|---------------|-------------|
| Primary CTA | `link` | — |
| Pricing section | `region` | `pricing-section` |
| Kanban card | `listitem` | `kanban-card` |
| Delete button | `button` | `card-delete-btn` |

## axe-core installation

```bash
cd lumio && npm install --save-dev @axe-core/playwright
```

axe-core is already listed in devDependencies after Part 1 setup. If the import
fails, run the install command above.
```

- [ ] **Step 4: Create `tests/module-23-accessibility/README.md`**

```markdown
# M23: Accessibility Testing

## Learning Objectives

- Run automated WCAG 2.1 AA checks with `@axe-core/playwright`
- Scope scans with `.withTags()` and `.include()`
- Interpret axe violation output (id, impact, nodes)
- Complement automated scans with manual keyboard-navigation assertions

## Concept

axe-core checks ~100 WCAG rules automatically:
- Missing alt text
- Insufficient colour contrast
- Non-descriptive link text ("click here")
- Missing form labels
- Elements not reachable by keyboard

Automated scans catch ~30–40% of accessibility issues. The rest require
manual testing (e.g. screen reader flow, logical tab order).

**Rule of thumb:** Run axe on every page in your test suite. It's a 3-line
addition to existing tests and catches regressions before they ship.

## Key Takeaways

1. `new AxeBuilder({ page }).analyze()` returns `{ violations, passes, incomplete }`.
2. Scope with `.withTags()` to run only the rules your project commits to.
3. Scope with `.include()` to test a specific component in isolation.
4. Keyboard navigation tests must be written manually — axe doesn't test interaction flow.

## Going Deeper

- [axe-core/playwright docs](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright)
- [WCAG 2.1 quick reference](https://www.w3.org/WAI/WCAG21/quickref/)
```

- [ ] **Step 5: Commit**

```bash
git add tests/module-23-accessibility/
git commit -m "feat(modules): add M23 Accessibility Testing exercise scaffold"
```

---

## Task 5: M24 — Drag-and-Drop

**Files:**
- Create: `tests/module-24-drag-and-drop/exercise.spec.ts`
- Create: `tests/module-24-drag-and-drop/hints.md`
- Create: `tests/module-24-drag-and-drop/lumio-context.md`
- Create: `tests/module-24-drag-and-drop/README.md`

- [ ] **Step 1: Create `tests/module-24-drag-and-drop/exercise.spec.ts`**

```typescript
import { test, expect } from '../fixtures/fixtures';

// M24: Drag-and-Drop
//
// Playwright supports drag-and-drop via two APIs:
//   1. locator.dragTo(target) — high-level, works for mouse-event-based libraries
//   2. page.dragAndDrop(source, target) — CSS-selector-based shorthand
//   3. page.mouse API — for full manual control when high-level APIs fail
//
// Lumio's kanban uses @hello-pangea/dnd (react-beautiful-dnd fork).
// It listens to mouse events, not the HTML5 drag API, so locator.dragTo() works.

test.describe('Kanban drag-and-drop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects/demo/board');
  });

  test('drag card from To Do to In Progress', async ({ page }) => {
    // TODO 1: Get the first card in the "todo" column.
    // Column: data-testid="kanban-column-todo"
    // Card: data-testid="kanban-card" (first one, .first())
    const sourceCard = page
      .getByTestId(/* TODO 1: 'kanban-column-todo' */)
      .getByTestId(/* TODO 1: 'kanban-card' */)
      .first();

    // TODO 2: Get the "in-progress" column as the drop target.
    const targetColumn = page.getByTestId(/* TODO 2: 'kanban-column-in-progress' */);

    // TODO 3: Read the card title before dragging — the element moves DOM position,
    // so reading text afterward from the original locator may return stale data.
    const cardTitle = await sourceCard.textContent();

    // TODO 4: Drag the source card to the target column using locator.dragTo().
    // dragTo() fires mousedown -> mousemove -> mouseup, which is what the library needs.
    await sourceCard.dragTo(/* TODO 4: targetColumn */);

    // TODO 5: Assert the card now appears in the in-progress column.
    await expect(
      targetColumn.getByTestId('kanban-card').filter({ hasText: cardTitle! })
    )./* TODO 5: toBeVisible() */;
  });

  test('drag card from In Progress to Done', async ({ page }) => {
    // TODO 6: Move a card from in-progress to done.
    // Source: first card in kanban-column-in-progress
    // Target: kanban-column-done
    const sourceCard = page
      .getByTestId(/* TODO 6: 'kanban-column-in-progress' */)
      .getByTestId('kanban-card')
      .first();
    const targetColumn = page.getByTestId(/* TODO 6: 'kanban-column-done' */);
    const cardTitle = await sourceCard.textContent();
    await sourceCard.dragTo(targetColumn);
    await expect(
      targetColumn.getByTestId('kanban-card').filter({ hasText: cardTitle! })
    ).toBeVisible();
  });

  test('drag card back to To Do (revert flow)', async ({ page }) => {
    // TODO 7: Move a card from done back to todo to verify bidirectional DnD.
    // This catches a common bug where the library only supports forward drops.
    /* TODO 7 */
  });

  test('drag with steps option for slow-motion libraries', async ({ page }) => {
    // TODO 8: Pass { steps: 20 } to dragTo().
    // steps: N inserts N intermediate mousemove events — some DnD libraries
    // need these intermediate events to trigger their drag detection logic.
    const sourceCard = page
      .getByTestId('kanban-column-todo')
      .getByTestId('kanban-card')
      .first();
    const targetColumn = page.getByTestId('kanban-column-in-progress');
    await sourceCard.dragTo(targetColumn, /* TODO 8: { steps: 20 } */);
    const cardTitle = await targetColumn.getByTestId('kanban-card').first().textContent();
    expect(cardTitle).toBeTruthy();
  });
});
```

- [ ] **Step 2: Create `tests/module-24-drag-and-drop/hints.md`**

```markdown
# M24 Hints

## TODO 1 — source card locator

```typescript
const sourceCard = page
  .getByTestId('kanban-column-todo')
  .getByTestId('kanban-card')
  .first();
```

## TODO 2 — target column

```typescript
const targetColumn = page.getByTestId('kanban-column-in-progress');
```

## TODO 3 — read title before drag

```typescript
const cardTitle = await sourceCard.textContent();
```

## TODO 4 — dragTo

```typescript
await sourceCard.dragTo(targetColumn);
```

## TODO 5 — assert position

```typescript
await expect(
  targetColumn.getByTestId('kanban-card').filter({ hasText: cardTitle! })
).toBeVisible();
```

## TODO 6 — in-progress to done

```typescript
const sourceCard = page.getByTestId('kanban-column-in-progress').getByTestId('kanban-card').first();
const targetColumn = page.getByTestId('kanban-column-done');
```

## TODO 7 — revert flow

```typescript
const sourceCard = page.getByTestId('kanban-column-done').getByTestId('kanban-card').first();
const targetColumn = page.getByTestId('kanban-column-todo');
const cardTitle = await sourceCard.textContent();
await sourceCard.dragTo(targetColumn);
await expect(
  targetColumn.getByTestId('kanban-card').filter({ hasText: cardTitle! })
).toBeVisible();
```

## TODO 8 — steps

```typescript
await sourceCard.dragTo(targetColumn, { steps: 20 });
```

## Manual mouse fallback

When dragTo fails, use page.mouse for precise control:

```typescript
const box = await sourceCard.boundingBox();
const tgt = await targetColumn.boundingBox();
await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
await page.mouse.down();
await page.mouse.move(tgt!.x + tgt!.width / 2, tgt!.y + 50, { steps: 20 });
await page.mouse.up();
```
```

- [ ] **Step 3: Create `tests/module-24-drag-and-drop/lumio-context.md`**

```markdown
# Lumio Context: M24

## Kanban DnD implementation

Library: `@hello-pangea/dnd` (maintained fork of react-beautiful-dnd)

Cards are draggable within and across columns. The library listens to mouse events
(mousedown, mousemove, mouseup) not the HTML5 drag API. This is why
`locator.dragTo()` works directly.

## testid map

| Element | data-testid |
|---------|-------------|
| Column container | `kanban-column-{todo|in-progress|done}` |
| Draggable card | `kanban-card` |
| Drag handle icon | `card-drag-handle` |

## Seed data

`/projects/demo/board` has at least 2 cards in "todo" and 1 in "in-progress"
so drag tests do not need to create cards first.
```

- [ ] **Step 4: Create `tests/module-24-drag-and-drop/README.md`**

```markdown
# M24: Drag-and-Drop

## Learning Objectives

- Use `locator.dragTo()` for mouse-event DnD libraries
- Use `page.dragAndDrop()` for HTML5 drag API libraries
- Pass `{ steps: N }` for libraries needing intermediate mousemove events
- Use `page.mouse` for full manual control when high-level APIs fail

## Concept

| Library | Event model | Playwright API |
|---------|-------------|----------------|
| @hello-pangea/dnd | mouse events | `locator.dragTo()` |
| SortableJS (default) | HTML5 drag API | `page.dragAndDrop()` |
| Custom | mixed | `page.mouse` |

## Key Takeaways

1. Read card text **before** dragging — the locator may point elsewhere after the drop.
2. `{ steps: 20 }` fires intermediate mousemove events — fixes most "drag ignores drop" issues.
3. Always assert card position **after** the drop, not during.
4. `page.mouse` is the escape hatch when all high-level APIs fail.

## Going Deeper

- [Playwright docs: dragTo](https://playwright.dev/docs/api/class-locator#locator-drag-to)
```

- [ ] **Step 5: Commit**

```bash
git add tests/module-24-drag-and-drop/
git commit -m "feat(modules): add M24 Drag-and-Drop exercise scaffold"
```

---

## Task 6: M25 — File Upload

**Files:**
- Create: `tests/module-25-file-upload/fixtures/sample.txt`
- Create: `tests/module-25-file-upload/exercise.spec.ts`
- Create: `tests/module-25-file-upload/hints.md`
- Create: `tests/module-25-file-upload/lumio-context.md`
- Create: `tests/module-25-file-upload/README.md`

- [ ] **Step 1: Create `tests/module-25-file-upload/fixtures/sample.txt`**

```
Playwright test fixture file.
```

- [ ] **Step 2: Create `tests/module-25-file-upload/exercise.spec.ts`**

```typescript
import { test, expect } from '../fixtures/fixtures';
import path from 'path';

// M25: File Upload
//
// Playwright handles file inputs via locator.setInputFiles() — no OS dialog appears.
// The method sets the FileList directly on <input type="file">, bypassing the picker.
//
// For drag-and-drop upload zones (no <input>), construct a DataTransfer in the
// browser via page.evaluateHandle() and dispatch a 'drop' event.

test.describe('File upload — card attachments', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects/demo/board');
    await page.getByTestId('kanban-card').first().click();
    await expect(page.getByTestId('card-detail-panel')).toBeVisible();
  });

  test('upload a single file via input', async ({ page }) => {
    // TODO 1: Locate the file input using data-testid="attachment-input".
    const fileInput = page.getByTestId(/* TODO 1: 'attachment-input' */);

    // TODO 2: Upload sample.txt using setInputFiles().
    // Use path.join(__dirname, 'fixtures', 'sample.txt') for the file path.
    // __dirname resolves relative to this spec file, not the cwd.
    await fileInput.setInputFiles(/* TODO 2: path.join(__dirname, 'fixtures', 'sample.txt') */);

    // TODO 3: Assert an attachment row appears containing "sample.txt".
    // data-testid="attachment-item"
    await expect(
      page.getByTestId(/* TODO 3: 'attachment-item' */).filter({ hasText: 'sample.txt' })
    ).toBeVisible();
  });

  test('upload multiple files at once', async ({ page }) => {
    // TODO 4: Pass an array of two paths to setInputFiles().
    // Arrays let you simulate multi-file selection in a single picker operation.
    const fileInput = page.getByTestId('attachment-input');
    await fileInput.setInputFiles(/* TODO 4: [
      path.join(__dirname, 'fixtures', 'sample.txt'),
      path.join(__dirname, 'fixtures', 'sample2.txt'),
    ] */);

    // TODO 5: Assert two attachment-item rows are visible.
    await expect(page.getByTestId('attachment-item'))./* TODO 5: toHaveCount(2) */;
  });

  test('clear file input', async ({ page }) => {
    // TODO 6: Upload a file, then pass [] to setInputFiles to clear the input.
    // Clearing simulates the user cancelling their selection before submit.
    const fileInput = page.getByTestId('attachment-input');
    await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'sample.txt'));
    await fileInput.setInputFiles(/* TODO 6: [] */);
    await expect(page.getByTestId('attachment-item'))./* TODO 6: toHaveCount(0) */;
  });

  test('upload via drag-and-drop zone', async ({ page }) => {
    // TODO 7: The panel also has a drop zone at data-testid="attachment-dropzone".
    // Construct a DataTransfer with a File inside it using page.evaluateHandle(),
    // then dispatch a 'drop' event. Assert the attachment appears.
    // Why evaluateHandle()? DataTransfer must be constructed inside the browser
    // context — it cannot be serialised from Node.js.
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      dt.items.add(new File(['content'], 'dropped.txt', { type: 'text/plain' }));
      return dt;
    });
    await page.dispatchEvent(
      /* TODO 7: '[data-testid="attachment-dropzone"]' */,
      'drop',
      { dataTransfer }
    );
    await expect(
      page.getByTestId('attachment-item').filter({ hasText: 'dropped.txt' })
    ).toBeVisible();
  });
});
```

- [ ] **Step 3: Create `tests/module-25-file-upload/hints.md`**

```markdown
# M25 Hints

## TODO 1 — file input locator

```typescript
const fileInput = page.getByTestId('attachment-input');
```

## TODO 2 — single file

```typescript
await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'sample.txt'));
```

## TODO 3 — assert attachment visible

```typescript
await expect(
  page.getByTestId('attachment-item').filter({ hasText: 'sample.txt' })
).toBeVisible();
```

## TODO 4 — multiple files

```typescript
await fileInput.setInputFiles([
  path.join(__dirname, 'fixtures', 'sample.txt'),
  path.join(__dirname, 'fixtures', 'sample2.txt'),
]);
```

## TODO 5 — count

```typescript
await expect(page.getByTestId('attachment-item')).toHaveCount(2);
```

## TODO 6 — clear

```typescript
await fileInput.setInputFiles([]);
await expect(page.getByTestId('attachment-item')).toHaveCount(0);
```

## TODO 7 — drag-and-drop zone

```typescript
const dataTransfer = await page.evaluateHandle(() => {
  const dt = new DataTransfer();
  dt.items.add(new File(['content'], 'dropped.txt', { type: 'text/plain' }));
  return dt;
});
await page.dispatchEvent('[data-testid="attachment-dropzone"]', 'drop', { dataTransfer });
await expect(
  page.getByTestId('attachment-item').filter({ hasText: 'dropped.txt' })
).toBeVisible();
```
```

- [ ] **Step 4: Create `tests/module-25-file-upload/lumio-context.md`**

```markdown
# Lumio Context: M25

## File upload in Lumio

Route: Card detail panel (opens on card click).

| Element | data-testid | Type |
|---------|-------------|------|
| File input | `attachment-input` | `<input type="file" multiple>` |
| Drop zone | `attachment-dropzone` | `<div>` listening to drop event |
| Attachment row | `attachment-item` | rendered after upload |

## Where to find this in the code

```
lumio/components/kanban/CardDetailPanel.tsx
  -> AttachmentInput    (input[type=file])
  -> AttachmentDropzone (div + drop handler)
  -> AttachmentList -> AttachmentItem x N
```

## Test fixtures

Create small files under `tests/module-25-file-upload/fixtures/`:
- `sample.txt` — any plain text
- `sample2.txt` — second file for multi-upload test
```

- [ ] **Step 5: Create `tests/module-25-file-upload/README.md`**

```markdown
# M25: File Upload

## Learning Objectives

- Upload files without OS dialogs using `locator.setInputFiles()`
- Upload multiple files in one call and clear with `[]`
- Simulate file drag-and-drop using `DataTransfer` + `page.evaluateHandle()`

## Concept

**`<input type="file">` — use `setInputFiles()`:**
```typescript
await page.getByTestId('file-input').setInputFiles('/path/to/file.txt');
```

**Drag-and-drop zone — use `DataTransfer`:**
```typescript
const dt = await page.evaluateHandle(() => {
  const dt = new DataTransfer();
  dt.items.add(new File(['content'], 'file.txt', { type: 'text/plain' }));
  return dt;
});
await page.dispatchEvent('[data-testid="dropzone"]', 'drop', { dataTransfer: dt });
```

## Key Takeaways

1. `setInputFiles()` bypasses the OS picker — always prefer it for `<input type="file">`.
2. `[]` clears the input — useful for testing pre-submit cancellation.
3. `evaluateHandle()` creates browser-side objects that cannot be serialised from Node.js.
4. Use `__dirname` for file paths so tests work regardless of cwd.

## Going Deeper

- [Playwright docs: setInputFiles](https://playwright.dev/docs/api/class-locator#locator-set-input-files)
```

- [ ] **Step 6: Commit**

```bash
git add tests/module-25-file-upload/
git commit -m "feat(modules): add M25 File Upload exercise scaffold"
```

---

## Task 7: M26 — iFrame Interactions

**Files:**
- Create: `tests/module-26-iframe-interactions/exercise.spec.ts`
- Create: `tests/module-26-iframe-interactions/hints.md`
- Create: `tests/module-26-iframe-interactions/lumio-context.md`
- Create: `tests/module-26-iframe-interactions/README.md`

- [ ] **Step 1: Create `tests/module-26-iframe-interactions/exercise.spec.ts`**

```typescript
import { test, expect } from '../fixtures/fixtures';

// M26: iFrame Interactions
//
// Playwright exposes two iframe APIs:
//   page.frameLocator(selector) — FrameLocator; all locator methods scoped to the frame.
//     Supports auto-waiting. Recommended for most work.
//   page.frame({ name | url }) — returns a Frame object.
//     Use when you need frame.evaluate(), frame.goto(), or frame-level events.
//
// TipTap renders a contenteditable div (not a true iframe). It behaves like
// a textarea for fill() and keyboard shortcuts.

test.describe('iFrame — embedded preview pane', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects/demo/board');
    await page.getByTestId('kanban-card').first().click();
    await expect(page.getByTestId('card-detail-panel')).toBeVisible();
  });

  test('find content inside the preview iframe', async ({ page }) => {
    // TODO 1: Get a FrameLocator for data-testid="card-preview-frame".
    // page.frameLocator('[data-testid="card-preview-frame"]') scopes all
    // subsequent .getBy* calls to that iframe document.
    const previewFrame = page.frameLocator(/* TODO 1: '[data-testid="card-preview-frame"]' */);

    // TODO 2: Within the frame, find the first heading and assert it is visible.
    await expect(previewFrame.getByRole(/* TODO 2: 'heading' */))./* TODO 2: toBeVisible() */;
  });

  test('interact with a form inside a named iframe', async ({ page }) => {
    // TODO 3: Navigate to /projects/demo/embed-form — it has iframe name="embed-form-frame".
    // Use page.frame({ name: 'embed-form-frame' }) to get the Frame object.
    // Fill the form and assert the success message.
    await page.goto('/projects/demo/embed-form');
    const frame = page.frame(/* TODO 3: { name: 'embed-form-frame' } */);
    await frame!.getByLabel(/* TODO 3: 'Comment' */).fill('Hello from iframe');
    await frame!.getByRole('button', { name: 'Submit' }).click();
    await expect(frame!.getByText('Submitted')).toBeVisible();
  });
});

test.describe('TipTap editor — contenteditable', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects/demo/board');
    await page.getByTestId('kanban-card').first().click();
    await expect(page.getByTestId('tiptap-editor')).toBeVisible();
  });

  test('type text into the editor', async ({ page }) => {
    // TODO 4: TipTap renders a contenteditable div with role="textbox".
    // Scope with getByTestId('tiptap-editor').getByRole('textbox') and call fill().
    // contenteditable elements accept fill() exactly like textarea elements.
    const editor = page.getByTestId('tiptap-editor').getByRole(/* TODO 4: 'textbox' */);
    await editor.fill(/* TODO 4: 'Hello TipTap' */);
    await expect(editor).toHaveText(/* TODO 4: 'Hello TipTap' */);
  });

  test('apply bold formatting via keyboard shortcut', async ({ page }) => {
    // TODO 5: Fill the editor, select all with Control+A, apply bold with Control+B,
    // then assert a <strong> element is inside the editor.
    // Keyboard shortcuts on contenteditable elements work the same as in a real browser.
    const editor = page.getByTestId('tiptap-editor').getByRole('textbox');
    await editor.fill('Bold me');
    await editor.press(/* TODO 5: 'Control+A' */);
    await editor.press(/* TODO 5: 'Control+B' */);
    await expect(editor.locator('strong'))./* TODO 5: toBeVisible() */;
  });
});
```

- [ ] **Step 2: Create `tests/module-26-iframe-interactions/hints.md`**

```markdown
# M26 Hints

## TODO 1 — FrameLocator

```typescript
const previewFrame = page.frameLocator('[data-testid="card-preview-frame"]');
```

## TODO 2 — heading inside frame

```typescript
await expect(previewFrame.getByRole('heading')).toBeVisible();
```

## TODO 3 — named frame

```typescript
const frame = page.frame({ name: 'embed-form-frame' });
await frame!.getByLabel('Comment').fill('Hello from iframe');
await frame!.getByRole('button', { name: 'Submit' }).click();
await expect(frame!.getByText('Submitted')).toBeVisible();
```

## TODO 4 — TipTap fill

```typescript
const editor = page.getByTestId('tiptap-editor').getByRole('textbox');
await editor.fill('Hello TipTap');
await expect(editor).toHaveText('Hello TipTap');
```

## TODO 5 — bold formatting

```typescript
await editor.fill('Bold me');
await editor.press('Control+A');
await editor.press('Control+B');
await expect(editor.locator('strong')).toBeVisible();
```

## FrameLocator vs page.frame()

| | FrameLocator | page.frame() |
|---|---|---|
| Auto-waiting | Yes | No |
| When to use | Querying/asserting | evaluate(), goto(), events |
```

- [ ] **Step 3: Create `tests/module-26-iframe-interactions/lumio-context.md`**

```markdown
# Lumio Context: M26

## iFrames in Lumio

| Page | iframe | Selector |
|------|--------|----------|
| Card detail panel | Preview of card content | `[data-testid="card-preview-frame"]` |
| Embed form page | Third-party form embed | `name="embed-form-frame"` |

## TipTap editor

Location: `lumio/components/editor/TipTapEditor.tsx`

TipTap renders a `contenteditable` div, not an iframe. Access via:

```
[data-testid="tiptap-editor"] -> [role="textbox"]
```

Keyboard shortcuts: Control+B bold, Control+I italic, Control+Z undo.
```

- [ ] **Step 4: Create `tests/module-26-iframe-interactions/README.md`**

```markdown
# M26: iFrame Interactions

## Learning Objectives

- Use `page.frameLocator()` for auto-waiting, locator-scoped iframe access
- Use `page.frame()` for Frame-object-level operations
- Interact with TipTap (contenteditable) using `fill()` and keyboard shortcuts

## Concept

**`page.frameLocator(selector)`** — recommended for most work:
```typescript
const frame = page.frameLocator('iframe');
await frame.getByRole('button').click();
```

**`page.frame({ name })`** — when you need Frame methods:
```typescript
const frame = page.frame({ name: 'my-frame' });
await frame.evaluate(() => window.scrollTo(0, 0));
```

**contenteditable (TipTap)** — not an iframe:
```typescript
await page.getByRole('textbox').fill('content');
await page.keyboard.press('Control+B');
```

## Key Takeaways

1. `frameLocator` is the modern, auto-waiting API — prefer it.
2. `page.frame()` is needed for Frame-specific methods like `evaluate()`.
3. TipTap is a contenteditable div — `fill()` and keyboard shortcuts work normally.
4. Control+B, Control+I apply formatting inside contenteditable elements.

## Going Deeper

- [Playwright docs: Frames](https://playwright.dev/docs/frames)
```

- [ ] **Step 5: Commit**

```bash
git add tests/module-26-iframe-interactions/
git commit -m "feat(modules): add M26 iFrame Interactions exercise scaffold"
```

---

## Task 8: M27 — WebSocket Testing

**Files:**
- Create: `tests/module-27-websocket-testing/exercise.spec.ts`
- Create: `tests/module-27-websocket-testing/hints.md`
- Create: `tests/module-27-websocket-testing/lumio-context.md`
- Create: `tests/module-27-websocket-testing/README.md`

- [ ] **Step 1: Create `tests/module-27-websocket-testing/exercise.spec.ts`**

```typescript
import { test, expect } from '../fixtures/fixtures';

// M27: WebSocket Testing
//
// Two strategies:
//   Real WS: page.waitForEvent('websocket') + ws.waitForEvent('framereceived')
//     — tests the full stack; requires a running WS server
//   Mocked WS: page.routeWebSocket(pattern, handler)
//     — intercepts before reaching the server; fast, isolated

test.describe('WebSocket — real connection', () => {
  test('presence indicator appears when WS connects', async ({ page }) => {
    // TODO 1: Use Promise.all to start navigation and wait for the WS simultaneously.
    // This prevents a race condition where the WS opens before waitForEvent is called.
    const [, ws] = await Promise.all([
      page.goto('/projects/demo/board'),
      page.waitForEvent(/* TODO 1: 'websocket' */),
    ]);

    // TODO 2: Assert the WS URL contains 'presence'.
    expect(ws.url()).toContain(/* TODO 2: 'presence' */);

    // TODO 3: Assert the presence indicator is visible.
    await expect(page.getByTestId(/* TODO 3: 'presence-indicator' */)).toBeVisible();
  });

  test('receives a frame from the server', async ({ page }) => {
    const [, ws] = await Promise.all([
      page.goto('/projects/demo/board'),
      page.waitForEvent('websocket'),
    ]);

    // TODO 4: Wait for one incoming frame using ws.waitForEvent('framereceived').
    // The event resolves with { payload: string | Buffer }.
    const frame = await ws.waitForEvent(/* TODO 4: 'framereceived' */);

    // TODO 5: Parse the JSON payload and assert it has a 'type' property.
    const message = JSON.parse(frame.payload as string);
    expect(message).toHaveProperty(/* TODO 5: 'type' */);
  });
});

test.describe('WebSocket — mocked server', () => {
  test('inject a user_joined event via routeWebSocket', async ({ page }) => {
    // TODO 6: Use page.routeWebSocket() to intercept the presence WS and
    // immediately send a fake user_joined message on open.
    // routeWebSocket(urlPattern, handler) — handler receives a WebSocketRoute.
    await page.routeWebSocket(/presence/, (ws) => {
      ws.onopen = () => {
        ws.send(/* TODO 6: JSON.stringify({ type: 'user_joined', userId: 'u999', name: 'Alice' }) */);
      };
    });

    await page.goto('/projects/demo/board');

    // TODO 7: Assert a presence-avatar appears (rendered when user_joined is received).
    await expect(page.getByTestId(/* TODO 7: 'presence-avatar' */)).toBeVisible();
  });

  test('simulate connection close and verify reconnect UI', async ({ page }) => {
    // TODO 8: Route the WS to close immediately on open, then assert the
    // reconnect banner (data-testid="ws-reconnect-banner") appears.
    // Why test reconnect? WS connections drop in production; the UI must degrade gracefully.
    await page.routeWebSocket(/presence/, (ws) => {
      ws.onopen = () => ws.close();
    });

    await page.goto('/projects/demo/board');
    await expect(page.getByTestId(/* TODO 8: 'ws-reconnect-banner' */)).toBeVisible();
  });
});
```

- [ ] **Step 2: Create `tests/module-27-websocket-testing/hints.md`**

```markdown
# M27 Hints

## TODO 1 — race-safe websocket capture

```typescript
const [, ws] = await Promise.all([
  page.goto('/projects/demo/board'),
  page.waitForEvent('websocket'),
]);
```

## TODO 2 — URL assertion

```typescript
expect(ws.url()).toContain('presence');
```

## TODO 3 — presence indicator

```typescript
await expect(page.getByTestId('presence-indicator')).toBeVisible();
```

## TODO 4 — framereceived

```typescript
const frame = await ws.waitForEvent('framereceived');
```

## TODO 5 — parse payload

```typescript
const message = JSON.parse(frame.payload as string);
expect(message).toHaveProperty('type');
```

## TODO 6 — routeWebSocket mock

```typescript
await page.routeWebSocket(/presence/, (ws) => {
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'user_joined', userId: 'u999', name: 'Alice' }));
  };
});
```

## TODO 7 — presence avatar

```typescript
await expect(page.getByTestId('presence-avatar')).toBeVisible();
```

## TODO 8 — reconnect banner

```typescript
await page.routeWebSocket(/presence/, (ws) => {
  ws.onopen = () => ws.close();
});
await page.goto('/projects/demo/board');
await expect(page.getByTestId('ws-reconnect-banner')).toBeVisible();
```
```

- [ ] **Step 3: Create `tests/module-27-websocket-testing/lumio-context.md`**

```markdown
# Lumio Context: M27

## WebSocket in Lumio

Endpoint: `wss://localhost:3000/api/presence`

| Event | Direction | Payload |
|-------|-----------|---------|
| `user_joined` | Server to Client | `{ type, userId, name, boardId }` |
| `user_left` | Server to Client | `{ type, userId }` |
| `cursor_move` | Client to Server | `{ type, x, y }` |

## UI elements

| Element | data-testid | Trigger |
|---------|-------------|---------|
| Presence bar | `presence-indicator` | WS connected |
| User avatar | `presence-avatar` | user_joined received |
| Reconnect banner | `ws-reconnect-banner` | WS connection lost |

## Where to find this in the code

```
lumio/lib/presence/usePresence.ts      -> WS lifecycle hook
lumio/components/board/PresenceBar.tsx -> renders presence-indicator and avatars
```
```

- [ ] **Step 4: Create `tests/module-27-websocket-testing/README.md`**

```markdown
# M27: WebSocket Testing

## Learning Objectives

- Capture a WebSocket connection with `page.waitForEvent('websocket')`
- Listen for frames with `ws.waitForEvent('framereceived')`
- Mock the server with `page.routeWebSocket()`
- Simulate connection errors to test reconnect UI

## Concept

| Strategy | When to use | API |
|----------|-------------|-----|
| Real WS | Integration tests, happy path | `waitForEvent('websocket')` |
| Mocked WS | Edge cases, error states | `page.routeWebSocket()` |

Race-safe capture pattern:
```typescript
const [, ws] = await Promise.all([
  page.goto('/board'),
  page.waitForEvent('websocket'),
]);
```
Starting the listener before goto() ensures no frame is missed.

## Key Takeaways

1. `Promise.all([goto, waitForEvent('websocket')])` prevents race conditions.
2. `ws.waitForEvent('framereceived')` blocks until the next frame.
3. `page.routeWebSocket()` intercepts before the server — great for error simulation.
4. Parse `frame.payload` — it arrives as a raw string or Buffer, not a JS object.

## Going Deeper

- [Playwright docs: WebSocket mocking](https://playwright.dev/docs/network#websocket-mocking)
```

- [ ] **Step 5: Commit**

```bash
git add tests/module-27-websocket-testing/
git commit -m "feat(modules): add M27 WebSocket Testing exercise scaffold"
```

---

## Task 9: M28 — Multi-Tab / Multi-User Collaboration

**Files:**
- Create: `tests/module-28-multi-tab-multi-user/exercise.spec.ts`
- Create: `tests/module-28-multi-tab-multi-user/hints.md`
- Create: `tests/module-28-multi-tab-multi-user/lumio-context.md`
- Create: `tests/module-28-multi-tab-multi-user/README.md`

- [ ] **Step 1: Create `tests/module-28-multi-tab-multi-user/exercise.spec.ts`**

```typescript
import { test, expect, type BrowserContext } from '../fixtures/fixtures';

// M28: Multi-Tab and Multi-User Testing
//
// Multi-tab: open a second page in the SAME BrowserContext.
//   Both pages share cookies and localStorage — same user, two tabs.
//   Use: context.newPage()
//
// Multi-user: create a SECOND BrowserContext with its own auth state.
//   Each context is a separate browser profile — different user sessions.
//   Use: browser.newContext()

test.describe('Multi-tab — same user, two tabs', () => {
  test('card created in tab A appears in tab B', async ({ context }) => {
    // TODO 1: Open two pages in the same context.
    // context.newPage() creates a second tab that shares the session.
    const pageA = await context.newPage();
    const pageB = await context.newPage();

    // TODO 2: Navigate both tabs to the same board.
    await pageA.goto('/projects/demo/board');
    await pageB.goto(/* TODO 2: '/projects/demo/board' */);

    // TODO 3: Add a card in pageA.
    const title = `multi-tab-${Date.now()}`;
    await pageA.getByTestId('add-card-button').click();
    await pageA.getByTestId('new-card-input').fill(title);
    await pageA.getByTestId('new-card-input').press('Enter');

    // TODO 4: Assert the card is visible in pageB without reloading.
    // The board uses real-time sync — the card should appear via WebSocket.
    // If it does not appear within the default timeout, the real-time feature is broken.
    await expect(
      pageB.getByTestId('kanban-card').filter({ hasText: title })
    )./* TODO 4: toBeVisible() */;
  });
});

test.describe('Multi-user — two independent sessions', () => {
  test('user B sees card created by user A', async ({ browser }) => {
    // TODO 5: Create two independent BrowserContexts (two separate user sessions).
    // Use browser.newContext() for each — they do NOT share cookies.
    // Authenticate each context differently (e.g., pass storageState for different users).
    const contextA = await browser.newContext(/* TODO 5: {
      storageState: 'tests/fixtures/auth/user-a.json',
    } */);
    const contextB = await browser.newContext(/* TODO 5: {
      storageState: 'tests/fixtures/auth/user-b.json',
    } */);

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    // TODO 6: Navigate both users to the same shared board.
    await pageA.goto('/projects/demo/board');
    await pageB.goto('/projects/demo/board');

    // TODO 7: User A adds a card with a unique title.
    const cardTitle = `collab-${Date.now()}`;
    await pageA.getByTestId('add-card-button').click();
    await pageA.getByTestId('new-card-input').fill(cardTitle);
    await pageA.getByTestId('new-card-input').press('Enter');

    // TODO 8: Assert User B sees the card in their view (real-time sync).
    await expect(
      pageB.getByTestId('kanban-card').filter({ hasText: cardTitle })
    ).toBeVisible();

    // TODO 9: Clean up both contexts to free browser resources.
    await contextA.close();
    await contextB.close();
  });

  test('user A presence avatar appears in user B view', async ({ browser }) => {
    const contextA = await browser.newContext({
      storageState: 'tests/fixtures/auth/user-a.json',
    });
    const contextB = await browser.newContext({
      storageState: 'tests/fixtures/auth/user-b.json',
    });

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    // TODO 10: Navigate User A to the board first, then User B.
    // Assert User B's view shows a presence avatar for User A.
    // data-testid="presence-avatar" (one per online user)
    await pageA.goto('/projects/demo/board');
    await pageB.goto(/* TODO 10: '/projects/demo/board' */);
    await expect(pageB.getByTestId(/* TODO 10: 'presence-avatar' */)).toBeVisible();

    await contextA.close();
    await contextB.close();
  });
});
```

- [ ] **Step 2: Create `tests/module-28-multi-tab-multi-user/hints.md`**

```markdown
# M28 Hints

## TODO 1 — two pages, same context

```typescript
const pageA = await context.newPage();
const pageB = await context.newPage();
```

## TODO 2 — navigate pageB

```typescript
await pageB.goto('/projects/demo/board');
```

## TODO 3 — add a card in pageA

```typescript
const title = `multi-tab-${Date.now()}`;
await pageA.getByTestId('add-card-button').click();
await pageA.getByTestId('new-card-input').fill(title);
await pageA.getByTestId('new-card-input').press('Enter');
```

## TODO 4 — assert card in pageB

```typescript
await expect(
  pageB.getByTestId('kanban-card').filter({ hasText: title })
).toBeVisible();
```

## TODO 5 — two independent contexts

```typescript
const contextA = await browser.newContext({
  storageState: 'tests/fixtures/auth/user-a.json',
});
const contextB = await browser.newContext({
  storageState: 'tests/fixtures/auth/user-b.json',
});
```

## TODO 6 — navigate both users

```typescript
await pageA.goto('/projects/demo/board');
await pageB.goto('/projects/demo/board');
```

## TODO 7 — user A adds a card

```typescript
const cardTitle = `collab-${Date.now()}`;
await pageA.getByTestId('add-card-button').click();
await pageA.getByTestId('new-card-input').fill(cardTitle);
await pageA.getByTestId('new-card-input').press('Enter');
```

## TODO 8 — user B sees the card

```typescript
await expect(
  pageB.getByTestId('kanban-card').filter({ hasText: cardTitle })
).toBeVisible();
```

## TODO 9 — cleanup

```typescript
await contextA.close();
await contextB.close();
```

## TODO 10 — presence avatar

```typescript
await pageA.goto('/projects/demo/board');
await pageB.goto('/projects/demo/board');
await expect(pageB.getByTestId('presence-avatar')).toBeVisible();
```
```

- [ ] **Step 3: Create `tests/module-28-multi-tab-multi-user/lumio-context.md`**

```markdown
# Lumio Context: M28

## Real-time collaboration in Lumio

Lumio uses WebSocket presence events to sync board state across sessions.
When User A adds a card, the server broadcasts a board_updated event and
all connected clients re-fetch or patch their local state.

## Auth state files

The fixture auth files at `tests/fixtures/auth/` are created by the global
setup script (M08). For multi-user tests you need two separate saved states:

- `user-a.json` — logged in as alice@lumio.test
- `user-b.json` — logged in as bob@lumio.test

If these don't exist, add a second user to the global setup.

## Key testids

| Element | data-testid |
|---------|-------------|
| Add card button | `add-card-button` |
| New card input | `new-card-input` |
| Kanban card | `kanban-card` |
| Presence avatar | `presence-avatar` |

## Context vs Page

| | BrowserContext | Page |
|---|---|---|
| Analogy | Browser profile | Browser tab |
| Cookies shared | Within same context | N/A |
| Auth state | Per context | Inherits from context |
| Create via | `browser.newContext()` | `context.newPage()` |
```

- [ ] **Step 4: Create `tests/module-28-multi-tab-multi-user/README.md`**

```markdown
# M28: Multi-Tab and Multi-User Testing

## Learning Objectives

- Open multiple pages in one BrowserContext for same-user multi-tab scenarios
- Create independent BrowserContexts for different user sessions
- Test real-time collaboration features (card sync, presence)
- Clean up contexts explicitly to avoid resource leaks

## Concept

**Same user, two tabs — `context.newPage()`:**
```typescript
const pageA = await context.newPage();
const pageB = await context.newPage();
// pageA and pageB share cookies — same logged-in user
```

**Two users — `browser.newContext()`:**
```typescript
const ctxA = await browser.newContext({ storageState: 'user-a.json' });
const ctxB = await browser.newContext({ storageState: 'user-b.json' });
// Independent sessions — different users
```

## Key Takeaways

1. `context.newPage()` = same user, new tab (shared cookies).
2. `browser.newContext()` = new user profile (isolated cookies, localStorage).
3. Always call `context.close()` in multi-context tests — Playwright doesn't auto-close manually created contexts.
4. Use unique card titles (`Date.now()`) to avoid test interference.

## Going Deeper

- [Playwright docs: BrowserContext](https://playwright.dev/docs/browser-contexts)
- [Playwright docs: Multi-page scenarios](https://playwright.dev/docs/pages)
```

- [ ] **Step 5: Commit**

```bash
git add tests/module-28-multi-tab-multi-user/
git commit -m "feat(modules): add M28 Multi-Tab Multi-User exercise scaffold"
```

---

## Task 10: M29 — Service Worker / PWA Offline Mode

**Files:**
- Create: `tests/module-29-service-worker-pwa/exercise.spec.ts`
- Create: `tests/module-29-service-worker-pwa/hints.md`
- Create: `tests/module-29-service-worker-pwa/lumio-context.md`
- Create: `tests/module-29-service-worker-pwa/README.md`

- [ ] **Step 1: Create `tests/module-29-service-worker-pwa/exercise.spec.ts`**

```typescript
import { test, expect } from '../fixtures/fixtures';

// M29: Service Worker / PWA Offline Mode
//
// Playwright can:
//   - Wait for the service worker to be active: context.waitForEvent('serviceworker')
//   - Intercept fetch requests routed through the SW
//   - Simulate offline mode: context.setOffline(true)
//
// Service workers are registered per BrowserContext, not per Page.
// Use context.serviceWorkers() to list active workers.

test.describe('Service Worker registration', () => {
  test('service worker is registered and active', async ({ context, page }) => {
    // TODO 1: Navigate to the app root to trigger SW registration.
    // Then wait for the service worker to be created using context.waitForEvent.
    // Use Promise.all to avoid a race between goto() and the SW creation event.
    const [sw] = await Promise.all([
      context.waitForEvent(/* TODO 1: 'serviceworker' */),
      page.goto('/'),
    ]);

    // TODO 2: Assert the service worker URL contains 'sw.js'.
    expect(sw.url()).toContain(/* TODO 2: 'sw.js' */);
  });

  test('service worker list is not empty after navigation', async ({ context, page }) => {
    await page.goto('/');
    // TODO 3: Wait briefly for SW activation, then call context.serviceWorkers().
    // Assert the returned array has at least one entry.
    // context.serviceWorkers() returns all currently active workers synchronously.
    await page.waitForTimeout(1000); // SW activation is async
    const workers = context.serviceWorkers();
    expect(workers.length).toBeGreaterThan(/* TODO 3: 0 */);
  });
});

test.describe('Offline mode', () => {
  test('app shows offline banner when network is disconnected', async ({ context, page }) => {
    await page.goto('/projects/demo/board');
    // Wait for SW to be active so caching is ready
    await page.waitForTimeout(1000);

    // TODO 4: Set the context to offline mode using context.setOffline(true).
    // This disables all network requests for all pages in the context.
    // It simulates the device losing connectivity, not a server error.
    await context.setOffline(/* TODO 4: true */);

    // TODO 5: Reload the page (offline) and assert the offline banner appears.
    // data-testid="offline-banner"
    // The SW should serve cached assets; the banner appears because the app
    // detects the absence of a network connection via navigator.onLine.
    await page.reload();
    await expect(page.getByTestId(/* TODO 5: 'offline-banner' */)).toBeVisible();
  });

  test('cached board content is still visible when offline', async ({ context, page }) => {
    // TODO 6: Load the board online first (SW caches it), then go offline and
    // reload. Assert that kanban column content is still visible.
    // Why: The PWA's SW caches app-shell and API responses. Users should be
    // able to view (though not edit) their board without a connection.
    await page.goto('/projects/demo/board');
    await page.waitForTimeout(1000); // allow SW to cache

    await context.setOffline(true);
    await page.reload();

    // TODO 6: Assert at least one kanban column is visible after offline reload.
    await expect(page.getByTestId(/* TODO 6: 'kanban-column-todo' */)).toBeVisible();
  });

  test('goes back online after setOffline(false)', async ({ context, page }) => {
    await page.goto('/projects/demo/board');
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByTestId('offline-banner')).toBeVisible();

    // TODO 7: Restore network connectivity with context.setOffline(false).
    // Then reload and assert the offline banner is gone.
    await context.setOffline(/* TODO 7: false */);
    await page.reload();
    await expect(page.getByTestId('offline-banner'))./* TODO 7: not.toBeVisible() */;
  });
});
```

- [ ] **Step 2: Create `tests/module-29-service-worker-pwa/hints.md`**

```markdown
# M29 Hints

## TODO 1 — waitForEvent('serviceworker')

```typescript
const [sw] = await Promise.all([
  context.waitForEvent('serviceworker'),
  page.goto('/'),
]);
```

## TODO 2 — assert SW URL

```typescript
expect(sw.url()).toContain('sw.js');
```

## TODO 3 — serviceWorkers list

```typescript
const workers = context.serviceWorkers();
expect(workers.length).toBeGreaterThan(0);
```

## TODO 4 — go offline

```typescript
await context.setOffline(true);
```

## TODO 5 — offline banner

```typescript
await page.reload();
await expect(page.getByTestId('offline-banner')).toBeVisible();
```

## TODO 6 — cached content still visible

```typescript
await page.goto('/projects/demo/board');
await page.waitForTimeout(1000);
await context.setOffline(true);
await page.reload();
await expect(page.getByTestId('kanban-column-todo')).toBeVisible();
```

## TODO 7 — back online

```typescript
await context.setOffline(false);
await page.reload();
await expect(page.getByTestId('offline-banner')).not.toBeVisible();
```
```

- [ ] **Step 3: Create `tests/module-29-service-worker-pwa/lumio-context.md`**

```markdown
# Lumio Context: M29

## Lumio PWA setup

Lumio is configured as a PWA using `next-pwa`:
- `public/sw.js` — the generated service worker
- `public/manifest.json` — the web app manifest
- The SW caches the app shell and recent board API responses

## Offline UI

When `navigator.onLine === false`, Lumio renders:
- `data-testid="offline-banner"` — a top banner indicating offline state

The SW serves cached assets so the board structure remains visible.
Write operations (add/move card) are queued and synced on reconnect.

## Where to find this in the code

```
lumio/next.config.js            -> next-pwa configuration
lumio/components/OfflineBanner.tsx -> data-testid="offline-banner"
public/sw.js                    -> generated; do not edit directly
```

## Service worker activation timing

After `page.goto('/')`, the SW may take 500-2000ms to activate. The
`context.waitForEvent('serviceworker')` pattern is the reliable way to
wait for it; `waitForTimeout` is used as a pragmatic fallback when the
event has already fired.
```

- [ ] **Step 4: Create `tests/module-29-service-worker-pwa/README.md`**

```markdown
# M29: Service Worker / PWA Offline Mode

## Learning Objectives

- Wait for service worker registration with `context.waitForEvent('serviceworker')`
- List active service workers with `context.serviceWorkers()`
- Simulate offline mode with `context.setOffline(true/false)`
- Verify cached content is served when offline

## Concept

Service workers are BrowserContext-scoped, not Page-scoped. All pages within
the same context share the same service worker registration.

**Offline simulation:**
```typescript
await context.setOffline(true);   // disconnect network
await page.reload();               // SW serves cached response
await context.setOffline(false);  // reconnect
```

`setOffline(true)` is more realistic than mocking individual requests because
it also sets `navigator.onLine = false`, which many apps check directly.

## Key Takeaways

1. Use `Promise.all([context.waitForEvent('serviceworker'), page.goto('/')])` to capture the SW.
2. `context.setOffline(true)` disables ALL network requests for the context.
3. The SW must cache content before going offline — load the page online first.
4. `navigator.onLine` is set to false by `setOffline(true)` — apps that check it will show offline UI.

## Going Deeper

- [Playwright docs: Service Workers](https://playwright.dev/docs/service-workers-experimental)
- [web.dev: Service worker lifecycle](https://web.dev/articles/service-worker-lifecycle)
```

- [ ] **Step 5: Commit**

```bash
git add tests/module-29-service-worker-pwa/
git commit -m "feat(modules): add M29 Service Worker PWA exercise scaffold"
```

---

## Task 11: M30 — Electron Testing

**Files:**
- Create: `tests/module-30-electron/exercise.spec.ts`
- Create: `tests/module-30-electron/hints.md`
- Create: `tests/module-30-electron/lumio-context.md`
- Create: `tests/module-30-electron/README.md`

> **Note:** Electron tests require the Electron client to be built. Run `cd lumio-electron && npm run build` before running these tests. The electron binary path is read from the `ELECTRON_APP_PATH` environment variable, defaulting to `./lumio-electron/out/lumio-electron`.

- [ ] **Step 1: Create `tests/module-30-electron/exercise.spec.ts`**

```typescript
import { test as base, expect } from '@playwright/test';
import { _electron as electron, type ElectronApplication } from 'playwright';
import path from 'path';

// M30: Electron Testing
//
// Playwright includes first-class Electron support via the `electron` launch API.
// electron.launch() starts the Electron process and returns an ElectronApplication.
// From there, you get Windows (equivalent to BrowserContext pages) to interact with.
//
// Key difference from web tests: there is no HTTP server — Electron loads a local
// file:// bundle or uses a bundled web server embedded in the app.

const ELECTRON_APP = process.env.ELECTRON_APP_PATH ?? path.join(__dirname, '../../lumio-electron/out/lumio-electron');

// Custom fixture that launches and tears down the Electron app per test
const test = base.extend<{ electronApp: ElectronApplication }>({
  electronApp: async ({}, use) => {
    // TODO 1: Launch the Electron app using electron.launch().
    // Pass { args: [ELECTRON_APP] } to specify the app path.
    // electron.launch() returns an ElectronApplication — not a Browser.
    const app = await electron.launch(/* TODO 1: { args: [ELECTRON_APP] } */);
    await use(app);
    await app.close();
  },
});

test('app window opens and shows the login screen', async ({ electronApp }) => {
  // TODO 2: Get the first window from the Electron app.
  // electronApp.firstWindow() returns a Page — the same API as browser tests.
  const window = await electronApp.firstWindow(/* TODO 2 */);

  // TODO 3: Wait for the window to load, then assert the login heading is visible.
  await window.waitForLoadState('domcontentloaded');
  await expect(window.getByRole('heading', { name: /* TODO 3: 'Sign in' */ })).toBeVisible();
});

test('window title matches the app name', async ({ electronApp }) => {
  const window = await electronApp.firstWindow();

  // TODO 4: Assert the page title contains 'Lumio'.
  // window.title() works the same as page.title() in browser tests.
  await expect(window).toHaveTitle(/* TODO 4: /Lumio/ */);
});

test('evaluate runs in the main process', async ({ electronApp }) => {
  // TODO 5: Use electronApp.evaluate() to run code in Electron's main process.
  // This is unique to Electron — you can access Node.js APIs like process.platform.
  // Assert the platform is one of 'darwin', 'win32', or 'linux'.
  const platform = await electronApp.evaluate(async ({ app }) => {
    /* TODO 5: return process.platform */
  });
  expect(['darwin', 'win32', 'linux']).toContain(/* TODO 5: platform */);
});

test('take a screenshot of the Electron window', async ({ electronApp }) => {
  const window = await electronApp.firstWindow();
  await window.waitForLoadState('domcontentloaded');

  // TODO 6: Take a screenshot of the Electron window.
  // window.screenshot() works identically to page.screenshot() in web tests.
  const screenshot = await window.screenshot(/* TODO 6: { path: 'electron-window.png' } */);
  expect(screenshot).toBeTruthy();
});
```

- [ ] **Step 2: Create `tests/module-30-electron/hints.md`**

```markdown
# M30 Hints

## TODO 1 — electron.launch()

```typescript
const app = await electron.launch({ args: [ELECTRON_APP] });
```

## TODO 2 — firstWindow()

```typescript
const window = await electronApp.firstWindow();
```

## TODO 3 — login heading

```typescript
await expect(window.getByRole('heading', { name: 'Sign in' })).toBeVisible();
```

## TODO 4 — window title

```typescript
await expect(window).toHaveTitle(/Lumio/);
```

## TODO 5 — main process evaluate

```typescript
const platform = await electronApp.evaluate(async ({ app }) => {
  return process.platform;
});
expect(['darwin', 'win32', 'linux']).toContain(platform);
```

## TODO 6 — screenshot

```typescript
const screenshot = await window.screenshot({ path: 'electron-window.png' });
expect(screenshot).toBeTruthy();
```

## Electron vs Browser API differences

| Feature | Browser test | Electron test |
|---------|-------------|---------------|
| Launch | `browser.newContext()` | `electron.launch()` |
| Top-level object | `Browser` | `ElectronApplication` |
| Pages | `context.newPage()` | `app.firstWindow()` / `app.windows()` |
| Main process | N/A | `app.evaluate({ app, ipcMain })` |
| Renderer process | `page.evaluate()` | `window.evaluate()` |
```

- [ ] **Step 3: Create `tests/module-30-electron/lumio-context.md`**

```markdown
# Lumio Context: M30

## Lumio Electron client

Location: `lumio-electron/` — a separate Electron wrapper around the Lumio web app.

The Electron app embeds a Chromium renderer that loads the bundled Next.js export.
It does NOT connect to the running Next.js dev server — it loads a static export.

## Build before testing

```bash
cd lumio-electron
npm run build    # produces out/lumio-electron
```

Set `ELECTRON_APP_PATH` env var if the binary is elsewhere.

## Key windows

| Window | Shows when |
|--------|------------|
| Login window | App starts, no session saved |
| Board window | Logged in, project selected |

## Preload script

`lumio-electron/preload.js` exposes safe IPC APIs to the renderer.
In tests, you can assert IPC calls via `electronApp.evaluate({ ipcMain })`.
```

- [ ] **Step 4: Create `tests/module-30-electron/README.md`**

```markdown
# M30: Electron Testing

## Learning Objectives

- Launch an Electron app with `electron.launch()`
- Get windows via `electronApp.firstWindow()` and interact like a normal Page
- Run code in the main process with `electronApp.evaluate()`
- Take screenshots of Electron windows

## Concept

Playwright's Electron support wraps the same Chromium DevTools Protocol used
for browser tests. From Playwright's perspective, an Electron window IS a Page.

```typescript
const app = await electron.launch({ args: ['./app'] });
const window = await app.firstWindow();
await expect(window.getByRole('heading')).toBeVisible(); // same as web tests
```

The unique addition is `app.evaluate()` which runs in the **main process** with
access to Node.js APIs, `ipcMain`, Electron's `app` object, etc.

## Key Takeaways

1. `electron.launch()` returns `ElectronApplication` — not `Browser`.
2. `app.firstWindow()` returns `Page` — all locator/assertion APIs apply.
3. `app.evaluate()` runs in the main process — access Node.js and Electron APIs.
4. Build the Electron app before running tests — there is no dev server.

## Going Deeper

- [Playwright docs: Electron](https://playwright.dev/docs/api/class-electron)
```

- [ ] **Step 5: Commit**

```bash
git add tests/module-30-electron/
git commit -m "feat(modules): add M30 Electron Testing exercise scaffold"
```

---

## Task 12: M31 — Tracing and Debugging

**Files:**
- Create: `tests/module-31-tracing-debugging/exercise.spec.ts`
- Create: `tests/module-31-tracing-debugging/hints.md`
- Create: `tests/module-31-tracing-debugging/lumio-context.md`
- Create: `tests/module-31-tracing-debugging/README.md`

- [ ] **Step 1: Create `tests/module-31-tracing-debugging/exercise.spec.ts`**

```typescript
import { test, expect } from '../fixtures/fixtures';

// M31: Tracing and Debugging
//
// The Playwright Trace Viewer records every test action, network request,
// console log, and snapshot. It is invaluable for debugging CI failures
// where you cannot run tests interactively.
//
// Key APIs:
//   context.tracing.start()   — begin recording
//   context.tracing.stop()    — save the trace to a zip file
//   page.pause()              — pause execution and open the Inspector (dev only)
//   --headed / --debug flags  — run tests visually in your terminal

// NOTE: This module focuses on *understanding* trace output.
// The exercises use manual tracing start/stop to show you how tracing works
// under the hood — normally you configure this in playwright.config.ts.

test.describe('Manual tracing', () => {
  test('record a trace for a board interaction', async ({ context, page }) => {
    // TODO 1: Start tracing on the context before navigation.
    // Pass { screenshots: true, snapshots: true } to capture DOM and screenshots.
    // screenshots: captures a PNG at each action
    // snapshots: captures DOM state for the "before/after" diff view
    await context.tracing.start(/* TODO 1: { screenshots: true, snapshots: true } */);

    await page.goto('/projects/demo/board');
    await page.getByTestId('add-card-button').click();
    await page.getByTestId('new-card-input').fill('Traced card');
    await page.getByTestId('new-card-input').press('Escape');

    // TODO 2: Stop the trace and save it to a file.
    // The path is relative to the project root.
    await context.tracing.stop(/* TODO 2: { path: 'test-results/traces/board-interaction.zip' } */);

    // The trace file is now viewable with:
    // npx playwright show-trace test-results/traces/board-interaction.zip
  });
});

test.describe('Debugging techniques', () => {
  test('console logs are captured in test output', async ({ page }) => {
    // TODO 3: Listen for 'console' events and push them to a messages array.
    // page.on('console', msg => messages.push(msg.text())) captures all console.log() calls.
    // This is the correct way to assert on JS console output — not by reading the terminal.
    const messages: string[] = [];
    page.on(/* TODO 3: 'console', msg => messages.push(msg.text()) */);

    await page.goto('/projects/demo/board');

    // TODO 4: Evaluate JavaScript in the page that calls console.log().
    // Then assert the messages array contains the logged text.
    await page.evaluate(/* TODO 4: () => console.log('debug-marker-12345') */);
    expect(messages.some(m => m.includes(/* TODO 4: 'debug-marker-12345' */))).toBe(true);
  });

  test('page errors are captured', async ({ page }) => {
    // TODO 5: Listen for 'pageerror' events and collect them.
    // 'pageerror' fires when an uncaught JS exception occurs in the page.
    // Asserting no page errors fires is a useful defensive check for any navigation.
    const errors: Error[] = [];
    page.on(/* TODO 5: 'pageerror', err => errors.push(err) */);

    await page.goto('/');

    // TODO 6: Assert no page errors occurred during the landing page load.
    expect(errors).toHaveLength(/* TODO 6: 0 */);
  });

  test('screenshot on failure pattern', async ({ page }) => {
    // TODO 7: Take a screenshot and save it when an assertion is about to fail.
    // Use a try/catch around the assertion, take a screenshot in the catch, then re-throw.
    // This is the manual pattern — Playwright auto-screenshot on failure is configured
    // via use: { screenshot: 'only-on-failure' } in playwright.config.ts.
    await page.goto('/projects/demo/board');
    try {
      await expect(page.getByTestId('non-existent-element')).toBeVisible({ timeout: 1000 });
    } catch (err) {
      await page.screenshot(/* TODO 7: { path: 'test-results/screenshots/failure-screenshot.png' } */);
      throw err;
    }
  });
});
```

- [ ] **Step 2: Create `tests/module-31-tracing-debugging/hints.md`**

```markdown
# M31 Hints

## TODO 1 — start tracing

```typescript
await context.tracing.start({ screenshots: true, snapshots: true });
```

## TODO 2 — stop tracing

```typescript
await context.tracing.stop({ path: 'test-results/traces/board-interaction.zip' });
```

View the trace:
```bash
npx playwright show-trace test-results/traces/board-interaction.zip
```

## TODO 3 — console listener

```typescript
const messages: string[] = [];
page.on('console', msg => messages.push(msg.text()));
```

## TODO 4 — evaluate console.log

```typescript
await page.evaluate(() => console.log('debug-marker-12345'));
expect(messages.some(m => m.includes('debug-marker-12345'))).toBe(true);
```

## TODO 5 — pageerror listener

```typescript
const errors: Error[] = [];
page.on('pageerror', err => errors.push(err));
```

## TODO 6 — assert no errors

```typescript
expect(errors).toHaveLength(0);
```

## TODO 7 — screenshot on failure

```typescript
try {
  await expect(page.getByTestId('non-existent-element')).toBeVisible({ timeout: 1000 });
} catch (err) {
  await page.screenshot({ path: 'test-results/screenshots/failure-screenshot.png' });
  throw err;
}
```

## Enabling tracing in config (recommended for CI)

In `playwright.config.ts`:
```typescript
use: {
  trace: 'on-first-retry',    // capture trace only when test is retried
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```
```

- [ ] **Step 3: Create `tests/module-31-tracing-debugging/lumio-context.md`**

```markdown
# Lumio Context: M31

## What to trace in Lumio

High-value traces for debugging:
- Board load with card fetch (network requests visible in trace)
- Card creation with optimistic update
- Auth redirect flow

## Trace viewer features

When you open a `.zip` trace in the viewer, you can see:
- Timeline of actions (click, fill, goto)
- Network requests with headers and response bodies
- Console logs from each step
- DOM snapshots before and after each action
- Screenshot thumbnails for visual diffs

## test-results directory

Playwright writes all artifacts (traces, screenshots, videos) to
`test-results/` by default. This directory is gitignored — do not commit
test artifacts.

## Debugging modes

| Mode | Command | What it does |
|------|---------|--------------|
| Headed | `--headed` | Opens a real browser window |
| Inspector | `--debug` | Adds page.pause() breakpoints |
| UI mode | `--ui` | Interactive test runner with trace viewer |
| Slow-mo | `--slowmo=500` | 500ms delay between actions |
```

- [ ] **Step 4: Create `tests/module-31-tracing-debugging/README.md`**

```markdown
# M31: Tracing and Debugging

## Learning Objectives

- Record traces with `context.tracing.start/stop()` and view them in the Trace Viewer
- Capture console logs with `page.on('console', ...)`
- Catch page errors with `page.on('pageerror', ...)`
- Configure automatic tracing and screenshots in `playwright.config.ts`

## Concept

The Trace Viewer is Playwright's most powerful debugging tool. A trace zip
contains screenshots, DOM snapshots, network logs, and a timeline — everything
you need to understand why a test failed in CI without re-running it.

**Recommended config for CI:**
```typescript
use: {
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```

**View a trace locally:**
```bash
npx playwright show-trace test-results/traces/trace.zip
# or open https://trace.playwright.dev and drag the zip
```

## Key Takeaways

1. Configure tracing in `playwright.config.ts` — don't add `tracing.start()` to every test.
2. `page.on('console', ...)` is the right way to capture JS console output.
3. `page.on('pageerror', ...)` catches uncaught JS exceptions — run it on every navigation.
4. `--ui` mode is the fastest way to debug interactively during development.

## Going Deeper

- [Playwright docs: Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [Playwright docs: Debugging](https://playwright.dev/docs/debug)
```

- [ ] **Step 5: Commit**

```bash
git add tests/module-31-tracing-debugging/
git commit -m "feat(modules): add M31 Tracing and Debugging exercise scaffold"
```

---

## Task 13: M32 — CI/CD Integration

**Files:**
- Create: `tests/module-32-ci-cd/exercise.spec.ts`
- Create: `tests/module-32-ci-cd/hints.md`
- Create: `tests/module-32-ci-cd/lumio-context.md`
- Create: `tests/module-32-ci-cd/README.md`
- Create: `.github/workflows/playwright.yml` (CI workflow)

- [ ] **Step 1: Create `tests/module-32-ci-cd/exercise.spec.ts`**

```typescript
import { test, expect } from '../fixtures/fixtures';

// M32: CI/CD Integration
//
// This module is primarily configuration-focused. The spec below verifies
// that the CI-relevant Playwright features work: sharding, retries, and
// artifact collection. Understanding these features makes the .yml file
// in Step 5 meaningful rather than boilerplate.

test.describe('CI smoke — board critical path', () => {
  // These tests represent the "must-pass" subset run in every CI pipeline.
  // They are tagged with @smoke so they can be selected with --grep @smoke.
  // In CI: npx playwright test --grep @smoke --workers=4

  test('landing page loads @smoke', async ({ page }) => {
    // TODO 1: Navigate to / and assert the main heading is visible.
    // This is the simplest possible smoke test — if it fails, the server is down.
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 }))./* TODO 1: toBeVisible() */;
  });

  test('authenticated user reaches the board @smoke', async ({ page }) => {
    // TODO 2: Navigate to /projects/demo/board and assert all three kanban
    // columns are visible. This verifies auth, DB connection, and board rendering.
    await page.goto('/projects/demo/board');
    await expect(page.getByTestId('kanban-column-todo')).toBeVisible();
    await expect(page.getByTestId('kanban-column-in-progress'))./* TODO 2: toBeVisible() */;
    await expect(page.getByTestId('kanban-column-done'))./* TODO 2: toBeVisible() */;
  });
});

test.describe('Retry behaviour', () => {
  test('flaky test succeeds on retry', async ({ page }, testInfo) => {
    // TODO 3: Use testInfo.retry to assert this test passes on the second attempt.
    // testInfo.retry is 0 on the first run, 1 on the first retry, etc.
    // This test deliberately fails on attempt 0 to demonstrate the retry mechanism.
    // In playwright.config.ts set retries: 2 for CI.
    if (testInfo.retry === 0) {
      // First attempt: force a failure to demonstrate retry
      expect(testInfo.retry).toBe(/* TODO 3: 1 */ 99); // always fails on retry 0
    }
    // On retry 1+: passes normally
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

test.describe('Sharding awareness', () => {
  test('shard index is available via env @smoke', async ({}) => {
    // TODO 4: Read process.env.CI and assert it is defined when running in CI.
    // When running locally this test is skipped via test.skip.
    // In CI, PLAYWRIGHT_SHARD_INDEX is set by the --shard flag.
    test.skip(!process.env.CI, 'shard env vars only exist in CI');
    expect(process.env.CI).toBeDefined();
  });
});
```

- [ ] **Step 2: Create `tests/module-32-ci-cd/hints.md`**

```markdown
# M32 Hints

## TODO 1 — landing page heading

```typescript
await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
```

## TODO 2 — all three columns

```typescript
await expect(page.getByTestId('kanban-column-in-progress')).toBeVisible();
await expect(page.getByTestId('kanban-column-done')).toBeVisible();
```

## TODO 3 — retry-aware test

```typescript
if (testInfo.retry === 0) {
  expect(testInfo.retry).toBe(99); // fails deliberately on first attempt
}
```

## TODO 4 — CI env check

```typescript
test.skip(!process.env.CI, 'shard env vars only exist in CI');
expect(process.env.CI).toBeDefined();
```

## Selecting @smoke tests

```bash
npx playwright test --grep "@smoke"
```

## Sharding syntax

```bash
# Run shard 1 of 4
npx playwright test --shard=1/4

# Merge reports from all shards
npx playwright merge-reports ./all-blob-reports --reporter html
```
```

- [ ] **Step 3: Create `tests/module-32-ci-cd/lumio-context.md`**

```markdown
# Lumio Context: M32

## CI requirements for Lumio tests

- Lumio dev server must be running during tests (or use webServer in config)
- Database must be seeded (prisma db push + prisma db seed)
- Auth fixtures must exist (global setup creates them)

## playwright.config.ts CI settings

```typescript
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['blob'], ['github']]
    : [['html', { open: 'on-failure' }]],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
```

## Sharding strategy

For ~100 tests, 4 shards is reasonable:
- Shard 1/4: M20-M23 (POM, CT, visual, a11y)
- Shard 2/4: M24-M27 (DnD, upload, iframe, WS)
- Shard 3/4: M28-M31 (multi-user, SW, Electron, trace)
- Shard 4/4: M32-M35 (CI, perf, i18n, capstone)
```

- [ ] **Step 4: Create `tests/module-32-ci-cd/README.md`**

```markdown
# M32: CI/CD Integration

## Learning Objectives

- Configure `playwright.config.ts` for CI (retries, workers, reporters)
- Write and select smoke tests with `--grep @smoke`
- Shard tests across multiple CI jobs with `--shard=N/M`
- Merge shard reports with `merge-reports`
- Publish the HTML report as a CI artifact

## Concept

**CI config pattern:**
```typescript
retries: process.env.CI ? 2 : 0,
workers: process.env.CI ? 1 : undefined,
reporter: process.env.CI ? [['blob'], ['github']] : [['html']],
```

**Sharding (4 parallel jobs):**
```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - run: npx playwright test --shard=${{ matrix.shard }}/4
```

After all shards complete, merge reports:
```bash
npx playwright merge-reports ./all-blob-reports --reporter html
```

## Key Takeaways

1. Set `retries: 2` in CI — flaky network or timing issues fail tests once, not twice.
2. Use `blob` reporter in CI — it's merge-able across shards.
3. Tag critical-path tests `@smoke` so you can run the fast subset on every push.
4. Publish `playwright-report/` as a GitHub Actions artifact for visual inspection.

## Going Deeper

- [Playwright docs: CI configuration](https://playwright.dev/docs/ci)
- [Playwright docs: Sharding](https://playwright.dev/docs/test-sharding)
```

- [ ] **Step 5: Create `.github/workflows/playwright.yml`**

```yaml
name: Playwright Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    name: "Playwright (shard ${{ matrix.shard }}/4)"
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shard: [1, 2, 3, 4]

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install root dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Install Lumio dependencies
        run: cd lumio && npm ci

      - name: Setup database
        run: cd lumio && npx prisma db push && npx prisma db seed
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Start Lumio dev server
        run: cd lumio && npm run dev &
        env:
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Wait for server
        run: npx wait-on http://localhost:3000 --timeout 60000

      - name: Run Playwright tests (shard ${{ matrix.shard }}/4)
        run: npx playwright test --shard=${{ matrix.shard }}/4
        env:
          CI: true

      - name: Upload blob report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: blob-report-${{ matrix.shard }}
          path: blob-report/
          retention-days: 1

  merge-reports:
    name: Merge Playwright Reports
    needs: test
    runs-on: ubuntu-latest
    if: always()

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci

      - name: Download all blob reports
        uses: actions/download-artifact@v4
        with:
          path: all-blob-reports
          pattern: blob-report-*
          merge-multiple: true

      - name: Merge reports
        run: npx playwright merge-reports ./all-blob-reports --reporter html

      - name: Upload HTML report
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

- [ ] **Step 6: Commit**

```bash
git add tests/module-32-ci-cd/ .github/workflows/playwright.yml
git commit -m "feat(modules): add M32 CI/CD Integration exercise scaffold and workflow"
```

---

## Task 14: M33 — Performance Testing

**Files:**
- Create: `tests/module-33-performance/exercise.spec.ts`
- Create: `tests/module-33-performance/hints.md`
- Create: `tests/module-33-performance/lumio-context.md`
- Create: `tests/module-33-performance/README.md`

- [ ] **Step 1: Create `tests/module-33-performance/exercise.spec.ts`**

```typescript
import { test, expect } from '../fixtures/fixtures';

// M33: Performance Testing
//
// Playwright can measure performance via:
//   page.evaluate(() => performance.timing)   — Navigation Timing API
//   page.evaluate(() => performance.getEntriesByType('paint'))  — paint events
//   page.evaluate(() => performance.now())    — relative timestamps
//   CDP sessions via page.context().newCDPSession()  — Lighthouse-style metrics
//
// These are not replacements for dedicated tools like Lighthouse or k6,
// but they let you assert on performance budgets within your E2E suite.

test.describe('Page load performance', () => {
  test('landing page DOM content loaded under 3000ms', async ({ page }) => {
    // TODO 1: Navigate to / and measure DOMContentLoaded time using
    // the Navigation Timing API via page.evaluate().
    // performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
    // gives the DOMContentLoaded duration in ms.
    await page.goto('/');
    const dcl = await page.evaluate(/* TODO 1: () =>
      performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
    */);
    // TODO 2: Assert the DOMContentLoaded time is less than 3000ms.
    expect(dcl).toBeLessThan(/* TODO 2: 3000 */);
  });

  test('first contentful paint occurs within 2500ms', async ({ page }) => {
    await page.goto('/');

    // TODO 3: Use performance.getEntriesByName('first-contentful-paint') to get the FCP entry.
    // It is a PerformancePaintTiming entry — access .startTime for the timestamp.
    // FCP measures when the first text or image is rendered.
    const fcp = await page.evaluate(/* TODO 3: () => {
      const entries = performance.getEntriesByName('first-contentful-paint');
      return entries.length > 0 ? entries[0].startTime : -1;
    } */);

    // TODO 4: Assert FCP was recorded (not -1) and is under 2500ms.
    expect(fcp).toBeGreaterThan(/* TODO 4: 0 */);
    expect(fcp).toBeLessThan(/* TODO 4: 2500 */);
  });

  test('board page loads all three columns within 5000ms', async ({ page }) => {
    const start = Date.now();
    await page.goto('/projects/demo/board');

    // TODO 5: Wait for all three kanban columns to be visible, then measure
    // the elapsed time since navigation started. Assert it is under 5000ms.
    await Promise.all([
      page.getByTestId('kanban-column-todo').waitFor(),
      page.getByTestId('kanban-column-in-progress').waitFor(),
      page.getByTestId('kanban-column-done').waitFor(),
    ]);
    const elapsed = Date.now() - /* TODO 5: start */;
    expect(elapsed).toBeLessThan(/* TODO 5: 5000 */);
  });
});

test.describe('Interaction performance', () => {
  test('card creation completes within 1000ms', async ({ page }) => {
    await page.goto('/projects/demo/board');

    // TODO 6: Measure the time from clicking "Add card" to the new card being visible.
    // Use Date.now() before the action and after the expect resolves.
    // This measures perceived interaction latency from the user's perspective.
    const start = Date.now();
    await page.getByTestId('add-card-button').click();
    await page.getByTestId('new-card-input').fill('Perf test card');
    await page.getByTestId('new-card-input').press('Enter');
    await page.getByTestId('kanban-card').filter({ hasText: 'Perf test card' }).waitFor();
    const duration = Date.now() - /* TODO 6: start */;

    expect(duration).toBeLessThan(/* TODO 6: 1000 */);
  });

  test('resource sizes are within budget', async ({ page }) => {
    const resourceSizes: number[] = [];

    // TODO 7: Listen to 'response' events and record the Content-Length header
    // for all JS responses. Assert no single JS file exceeds 500KB.
    // Why: large bundles block the main thread and delay interactivity.
    page.on('response', async (response) => {
      const contentType = response.headers()['content-type'] ?? '';
      if (contentType.includes('javascript')) {
        const body = await response.body().catch(() => Buffer.alloc(0));
        resourceSizes.push(/* TODO 7: body.length */);
      }
    });

    await page.goto('/');

    const MAX_JS_BUNDLE = 500 * 1024; // 500 KB
    for (const size of resourceSizes) {
      expect(size).toBeLessThan(/* TODO 7: MAX_JS_BUNDLE */);
    }
  });
});
```

- [ ] **Step 2: Create `tests/module-33-performance/hints.md`**

```markdown
# M33 Hints

## TODO 1 — Navigation Timing

```typescript
const dcl = await page.evaluate(() =>
  performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
);
```

## TODO 2 — DCL budget assertion

```typescript
expect(dcl).toBeLessThan(3000);
```

## TODO 3 — First Contentful Paint

```typescript
const fcp = await page.evaluate(() => {
  const entries = performance.getEntriesByName('first-contentful-paint');
  return entries.length > 0 ? entries[0].startTime : -1;
});
```

## TODO 4 — FCP assertion

```typescript
expect(fcp).toBeGreaterThan(0);
expect(fcp).toBeLessThan(2500);
```

## TODO 5 — board load timing

```typescript
const elapsed = Date.now() - start;
expect(elapsed).toBeLessThan(5000);
```

## TODO 6 — card creation latency

```typescript
const duration = Date.now() - start;
expect(duration).toBeLessThan(1000);
```

## TODO 7 — resource size budget

```typescript
page.on('response', async (response) => {
  const contentType = response.headers()['content-type'] ?? '';
  if (contentType.includes('javascript')) {
    const body = await response.body().catch(() => Buffer.alloc(0));
    resourceSizes.push(body.length);
  }
});
// ...
for (const size of resourceSizes) {
  expect(size).toBeLessThan(MAX_JS_BUNDLE);
}
```

## Performance testing limitations

These tests measure performance on the test runner machine — not production.
Use them as regression guards ("did we introduce a 2x slowdown?") rather
than as absolute performance benchmarks.
```

- [ ] **Step 3: Create `tests/module-33-performance/lumio-context.md`**

```markdown
# Lumio Context: M33

## Performance targets for Lumio

| Metric | Target | Page |
|--------|--------|------|
| DOMContentLoaded | < 3000ms | Landing `/` |
| First Contentful Paint | < 2500ms | Landing `/` |
| Board columns visible | < 5000ms | `/projects/demo/board` |
| Card creation latency | < 1000ms | Board |
| Max JS bundle size | < 500 KB | Any page |

## Why these numbers?

These are conservative for a dev server with no CDN. In production with
Next.js's static optimization and a CDN, FCP should be < 1000ms.

## Performance debugging in Lumio

If a test fails a performance budget:
1. Run `npx next build && npx next start` and re-test — dev server is slower
2. Check bundle analyzer: `cd lumio && ANALYZE=true npm run build`
3. Look for large client-side data fetches on load
```

- [ ] **Step 4: Create `tests/module-33-performance/README.md`**

```markdown
# M33: Performance Testing

## Learning Objectives

- Measure page load with the Navigation Timing API via `page.evaluate()`
- Capture First Contentful Paint using `performance.getEntriesByName()`
- Assert on interaction latency using `Date.now()` deltas
- Intercept responses to enforce JS bundle size budgets

## Concept

Playwright is not a performance profiling tool, but it can enforce budgets:

```typescript
// Navigation timing
const dcl = await page.evaluate(() =>
  performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
);
expect(dcl).toBeLessThan(3000);

// Resource size budget
page.on('response', async (res) => {
  if (res.headers()['content-type']?.includes('javascript')) {
    const size = (await res.body()).length;
    expect(size).toBeLessThan(500 * 1024);
  }
});
```

## Key Takeaways

1. `performance.timing` lives in the browser — access it via `page.evaluate()`.
2. `page.on('response', ...)` lets you assert on every network response.
3. Performance budgets in E2E tests are regression guards, not benchmarks.
4. Run on production builds for meaningful numbers — dev servers are significantly slower.

## Going Deeper

- [MDN: Navigation Timing API](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API/Navigation_timing)
- [Playwright docs: page.evaluate()](https://playwright.dev/docs/api/class-page#page-evaluate)
```

- [ ] **Step 5: Commit**

```bash
git add tests/module-33-performance/
git commit -m "feat(modules): add M33 Performance Testing exercise scaffold"
```

---

## Task 15: M34 — Internationalization (i18n)

**Files:**
- Create: `tests/module-34-internationalization/exercise.spec.ts`
- Create: `tests/module-34-internationalization/hints.md`
- Create: `tests/module-34-internationalization/lumio-context.md`
- Create: `tests/module-34-internationalization/README.md`

- [ ] **Step 1: Create `tests/module-34-internationalization/exercise.spec.ts`**

```typescript
import { test, expect } from '../fixtures/fixtures';

// M34: Internationalization Testing
//
// Lumio uses next-intl for locale routing. Locale is determined by the URL prefix:
//   /en/... — English (default)
//   /fr/... — French
//   /es/... — Spanish
//
// Testing strategies:
//   1. Navigate to locale-prefixed URLs directly (/fr, /fr/projects/...)
//   2. Interact with the language switcher UI
//   3. Assert translated text for known strings
//   4. Verify RTL layout for right-to-left locales (if supported)

const LOCALES = [
  { code: 'en', heading: 'Organize your work' },
  { code: 'fr', heading: 'Organisez votre travail' },
  { code: 'es', heading: 'Organiza tu trabajo' },
] as const;

test.describe('Locale routing', () => {
  for (const { code, heading } of LOCALES) {
    test(`${code} locale shows correct hero heading`, async ({ page }) => {
      // TODO 1: Navigate to the locale-prefixed root URL (e.g. /fr for French).
      // For 'en', navigate to / (English is the default, no prefix needed).
      const url = code === 'en' ? '/' : `/${code}`;
      await page.goto(/* TODO 1: url */);

      // TODO 2: Assert the h1 heading matches the expected translated string.
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(/* TODO 2: heading */);
    });
  }
});

test.describe('Language switcher', () => {
  test('switching to French updates the URL and heading', async ({ page }) => {
    await page.goto('/');

    // TODO 3: Open the language switcher dropdown.
    // data-testid="language-switcher"
    await page.getByTestId(/* TODO 3: 'language-switcher' */).click();

    // TODO 4: Select the French option.
    // data-testid="lang-option-fr"
    await page.getByTestId(/* TODO 4: 'lang-option-fr' */).click();

    // TODO 5: Assert the URL now starts with /fr.
    await expect(page).toHaveURL(/* TODO 5: /\/fr/ */);

    // TODO 6: Assert the heading is the French translation.
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Organisez votre travail');
  });

  test('locale preference is preserved on navigation', async ({ page }) => {
    // TODO 7: Navigate to /fr, then click the "Projects" nav link, and assert
    // the URL still starts with /fr (locale persists across in-app navigation).
    await page.goto('/fr');
    await page.getByRole('link', { name: 'Projets' }).click(); // French for "Projects"
    await expect(page).toHaveURL(/* TODO 7: /^\/fr/ */);
  });
});

test.describe('Locale-specific formatting', () => {
  test('date is formatted according to locale', async ({ page }) => {
    // TODO 8: Navigate to /fr/projects/demo/board and assert a date element
    // uses French date format (day/month/year or "12 mai 2026").
    // data-testid="card-due-date" contains a formatted date string.
    await page.goto('/fr/projects/demo/board');
    const dateText = await page.getByTestId('card-due-date').first().textContent();

    // French dates don't use slashes — assert no MM/DD/YYYY format
    expect(dateText).not.toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });

  test('number formatting matches locale', async ({ page }) => {
    // TODO 9: Navigate to the French pricing page (/fr/pricing) and assert
    // that currency amounts use French number formatting (space as thousands separator,
    // comma as decimal separator — e.g. "9,99 $").
    await page.goto('/fr/pricing');
    const priceText = await page.getByTestId('price-amount').first().textContent();
    // French: 9,99 or 9.99 — just assert it's truthy and non-empty
    expect(priceText?.length).toBeGreaterThan(/* TODO 9: 0 */);
  });
});
```

- [ ] **Step 2: Create `tests/module-34-internationalization/hints.md`**

```markdown
# M34 Hints

## TODO 1 — locale URL

```typescript
const url = code === 'en' ? '/' : `/${code}`;
await page.goto(url);
```

## TODO 2 — translated heading

```typescript
await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
```

## TODO 3 — open language switcher

```typescript
await page.getByTestId('language-switcher').click();
```

## TODO 4 — select French

```typescript
await page.getByTestId('lang-option-fr').click();
```

## TODO 5 — URL assertion

```typescript
await expect(page).toHaveURL(/\/fr/);
```

## TODO 6 — French heading

```typescript
await expect(page.getByRole('heading', { level: 1 })).toHaveText('Organisez votre travail');
```

## TODO 7 — locale persists

```typescript
await page.goto('/fr');
await page.getByRole('link', { name: 'Projets' }).click();
await expect(page).toHaveURL(/^\/fr/);
```

## TODO 8 — date format

```typescript
const dateText = await page.getByTestId('card-due-date').first().textContent();
expect(dateText).not.toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
```

## TODO 9 — price text truthy

```typescript
expect(priceText?.length).toBeGreaterThan(0);
```

## Parametric locale tests

The `for...of` loop over LOCALES generates one test per locale automatically:
- "en locale shows correct hero heading"
- "fr locale shows correct hero heading"
- "es locale shows correct hero heading"

All three appear in the test report and can be run individually with --grep.
```

- [ ] **Step 3: Create `tests/module-34-internationalization/lumio-context.md`**

```markdown
# Lumio Context: M34

## i18n setup in Lumio

Library: `next-intl`
Strategy: URL prefix routing

| Locale | URL prefix | Language |
|--------|-----------|----------|
| en | / (default) | English |
| fr | /fr | French |
| es | /es | Spanish |

## Translation files

```
lumio/messages/
  en.json   -> English strings
  fr.json   -> French strings
  es.json   -> Spanish strings
```

## Key translated strings (for assertions)

| Key | en | fr | es |
|-----|----|----|-----|
| hero.heading | Organize your work | Organisez votre travail | Organiza tu trabajo |
| nav.projects | Projects | Projets | Proyectos |

## Language switcher testids

| Element | data-testid |
|---------|-------------|
| Switcher trigger | `language-switcher` |
| French option | `lang-option-fr` |
| Spanish option | `lang-option-es` |
| English option | `lang-option-en` |

## Where to find this in the code

```
lumio/i18n.ts                -> next-intl configuration
lumio/middleware.ts          -> locale routing middleware
lumio/messages/              -> translation files
lumio/components/LanguageSwitcher.tsx
```
```

- [ ] **Step 4: Create `tests/module-34-internationalization/README.md`**

```markdown
# M34: Internationalization Testing

## Learning Objectives

- Navigate to locale-prefixed URLs and assert translated strings
- Interact with a language switcher and assert URL changes
- Verify locale persistence across in-app navigation
- Test locale-specific date and number formatting

## Concept

Testing i18n is testing content — the UI structure is the same; the strings differ.
Two patterns:

**1. Parametric locale tests:**
```typescript
for (const { code, heading } of LOCALES) {
  test(`${code} locale shows ${heading}`, async ({ page }) => {
    await page.goto(code === 'en' ? '/' : `/${code}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
  });
}
```
Generates one test per locale — all visible in the report.

**2. Switcher interaction:**
```typescript
await page.getByTestId('language-switcher').click();
await page.getByTestId('lang-option-fr').click();
await expect(page).toHaveURL(/\/fr/);
```

## Key Takeaways

1. Navigate to locale URLs directly — it's faster than clicking the switcher.
2. Use `toHaveURL(/\/fr/)` — not `toHaveURL('/fr/...')` — to match any /fr path.
3. Parametric tests (loop over locales) give you full locale coverage without repetition.
4. Test locale persistence by navigating within the app and checking the URL prefix.

## Going Deeper

- [next-intl docs](https://next-intl-docs.vercel.app/)
- [Playwright docs: toHaveURL](https://playwright.dev/docs/api/class-pageassertions#page-assertions-to-have-url)
```

- [ ] **Step 5: Commit**

```bash
git add tests/module-34-internationalization/
git commit -m "feat(modules): add M34 Internationalization exercise scaffold"
```

---

## Task 16: M35 — End-to-End Capstone

**Files:**
- Create: `tests/module-35-capstone/exercise.spec.ts`
- Create: `tests/module-35-capstone/hints.md`
- Create: `tests/module-35-capstone/lumio-context.md`
- Create: `tests/module-35-capstone/README.md`

- [ ] **Step 1: Create `tests/module-35-capstone/exercise.spec.ts`**

```typescript
import { test, expect } from '../fixtures/fixtures';
import { KanbanPage } from '../module-20-page-object-model/pages/KanbanPage';
import AxeBuilder from '@axe-core/playwright';

// M35: End-to-End Capstone
//
// This module ties together the techniques from M20-M34 in a single realistic
// user journey: signup -> create project -> add and manage cards -> share board.
//
// Each test in this suite builds on the previous one using test.step() to
// document the sub-actions within a longer flow. The suite uses:
//   - POMs (M20)
//   - Accessibility checks (M23)
//   - File upload (M25)
//   - Real-time sync (M28)
//   - Performance budget (M33)

const NEW_USER = {
  name: 'Capstone User',
  email: `capstone-${Date.now()}@lumio.test`,
  password: 'Capstone123!',
};

test.describe('Capstone: Full user journey', () => {
  test('signup -> create project -> add cards -> verify board', async ({ page, context }) => {
    // STEP 1: Sign up as a new user
    await test.step('Sign up', async () => {
      // TODO 1: Navigate to /signup and fill the signup form.
      // Fields: name (data-testid="signup-name"), email (data-testid="signup-email"),
      //         password (data-testid="signup-password")
      // Submit: getByRole('button', { name: 'Create account' })
      await page.goto('/signup');
      await page.getByTestId('signup-name').fill(NEW_USER.name);
      await page.getByTestId('signup-email').fill(/* TODO 1: NEW_USER.email */);
      await page.getByTestId('signup-password').fill(/* TODO 1: NEW_USER.password */);
      await page.getByRole('button', { name: 'Create account' }).click();
      await expect(page).toHaveURL(/* TODO 1: /\/dashboard/ */);
    });

    // STEP 2: Create a new project
    await test.step('Create project', async () => {
      // TODO 2: Click "New project" and fill the project name.
      // data-testid="new-project-button", data-testid="project-name-input"
      await page.getByTestId('new-project-button').click();
      await page.getByTestId('project-name-input').fill('Capstone Project');
      await page.getByRole('button', { name: 'Create' }).click();
      await expect(page).toHaveURL(/* TODO 2: /\/projects\// */);
    });

    // STEP 3: Add three cards using the POM
    await test.step('Add cards to the board', async () => {
      // TODO 3: Navigate to the board URL and use KanbanPage POM to add 3 cards.
      // The board URL is the current page URL + /board.
      const boardUrl = page.url() + '/board';
      const kanban = new KanbanPage(page);
      await page.goto(boardUrl);

      // TODO 3: Add three cards using kanban.addCard()
      await kanban.addCard('Task 1: Research');
      await kanban.addCard('Task 2: Design');
      await kanban.addCard(/* TODO 3: 'Task 3: Implement' */);

      const count = await kanban.cardCount(kanban.todoColumn);
      expect(count).toBeGreaterThanOrEqual(3);
    });

    // STEP 4: Move a card to In Progress
    await test.step('Move card to In Progress', async () => {
      // TODO 4: Drag the first card to the In Progress column.
      const kanban = new KanbanPage(page);
      const firstCard = kanban.todoColumn.getByTestId('kanban-card').first();
      await firstCard.dragTo(/* TODO 4: kanban.inProgressColumn */);
      await expect(
        kanban.inProgressColumn.getByTestId('kanban-card')
      ).toHaveCount({ min: 1 } as any);
    });

    // STEP 5: Accessibility check on the board
    await test.step('Accessibility audit', async () => {
      // TODO 5: Run axe-core on the board and assert no WCAG 2.1 AA violations.
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(violations).toEqual(/* TODO 5: [] */);
    });

    // STEP 6: Performance budget check
    await test.step('Performance budget', async () => {
      // TODO 6: Assert the board loaded all columns within 5000ms since we
      // already navigated to it. Re-navigate and time it.
      const start = Date.now();
      await page.reload();
      await page.getByTestId('kanban-column-todo').waitFor();
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(/* TODO 6: 5000 */);
    });
  });

  test('two users collaborate: card appears in real-time', async ({ browser }) => {
    const ctxAuthor = await browser.newContext({
      storageState: 'tests/fixtures/auth/user-a.json',
    });
    const ctxViewer = await browser.newContext({
      storageState: 'tests/fixtures/auth/user-b.json',
    });

    const authorPage = await ctxAuthor.newPage();
    const viewerPage = await ctxViewer.newPage();

    // TODO 7: Navigate both users to the demo board.
    await authorPage.goto('/projects/demo/board');
    await viewerPage.goto(/* TODO 7: '/projects/demo/board' */);

    // TODO 8: Author adds a card with a unique title.
    const cardTitle = `capstone-collab-${Date.now()}`;
    await authorPage.getByTestId('add-card-button').click();
    await authorPage.getByTestId('new-card-input').fill(cardTitle);
    await authorPage.getByTestId('new-card-input').press('Enter');

    // TODO 9: Viewer asserts the card appears without reloading.
    await expect(
      viewerPage.getByTestId('kanban-card').filter({ hasText: cardTitle })
    )./* TODO 9: toBeVisible() */;

    await ctxAuthor.close();
    await ctxViewer.close();
  });
});
```

- [ ] **Step 2: Create `tests/module-35-capstone/hints.md`**

```markdown
# M35 Hints

## TODO 1 — signup

```typescript
await page.goto('/signup');
await page.getByTestId('signup-name').fill(NEW_USER.name);
await page.getByTestId('signup-email').fill(NEW_USER.email);
await page.getByTestId('signup-password').fill(NEW_USER.password);
await page.getByRole('button', { name: 'Create account' }).click();
await expect(page).toHaveURL(/\/dashboard/);
```

## TODO 2 — create project

```typescript
await page.getByTestId('new-project-button').click();
await page.getByTestId('project-name-input').fill('Capstone Project');
await page.getByRole('button', { name: 'Create' }).click();
await expect(page).toHaveURL(/\/projects\//);
```

## TODO 3 — add cards

```typescript
await kanban.addCard('Task 1: Research');
await kanban.addCard('Task 2: Design');
await kanban.addCard('Task 3: Implement');
```

## TODO 4 — drag to in-progress

```typescript
const firstCard = kanban.todoColumn.getByTestId('kanban-card').first();
await firstCard.dragTo(kanban.inProgressColumn);
```

## TODO 5 — axe audit

```typescript
const { violations } = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  .analyze();
expect(violations).toEqual([]);
```

## TODO 6 — performance budget

```typescript
const start = Date.now();
await page.reload();
await page.getByTestId('kanban-column-todo').waitFor();
const elapsed = Date.now() - start;
expect(elapsed).toBeLessThan(5000);
```

## TODO 7 — viewer navigation

```typescript
await viewerPage.goto('/projects/demo/board');
```

## TODO 8 — author adds card

```typescript
const cardTitle = `capstone-collab-${Date.now()}`;
await authorPage.getByTestId('add-card-button').click();
await authorPage.getByTestId('new-card-input').fill(cardTitle);
await authorPage.getByTestId('new-card-input').press('Enter');
```

## TODO 9 — viewer sees card

```typescript
await expect(
  viewerPage.getByTestId('kanban-card').filter({ hasText: cardTitle })
).toBeVisible();
```

## test.step() best practices

- Keep step names concise: "Sign up", "Create project", "Verify board"
- One logical action per step — steps appear in the trace viewer timeline
- Failures show the step name in the error message — makes CI reports readable
```

- [ ] **Step 3: Create `tests/module-35-capstone/lumio-context.md`**

```markdown
# Lumio Context: M35

## User journey map

```
/signup
  -> /dashboard          (after successful signup)
  -> /projects/new       (via "New project" button)
  -> /projects/{id}      (after project creation)
  -> /projects/{id}/board (kanban board)
```

## Forms and inputs

| Form | Field | data-testid |
|------|-------|-------------|
| Signup | Name | `signup-name` |
| Signup | Email | `signup-email` |
| Signup | Password | `signup-password` |
| New project | Name | `project-name-input` |
| New project | Submit | Button: "Create" |

## Techniques integrated in this module

| Step | Technique | Taught in |
|------|-----------|-----------|
| Add cards | POM | M20 |
| Move card | Drag-and-drop | M24 |
| Accessibility audit | axe-core | M23 |
| Performance budget | Navigation timing | M33 |
| Multi-user sync | Multi-context | M28 |

## Why a capstone matters

Individual modules test one technique in isolation. The capstone reveals
integration problems: does the POM still work when the board was just created?
Does axe report violations that only appear after certain user actions?
Does performance degrade when the board has more cards?
```

- [ ] **Step 4: Create `tests/module-35-capstone/README.md`**

```markdown
# M35: End-to-End Capstone

## Learning Objectives

- Combine POM, accessibility, drag-and-drop, multi-user, and performance in one suite
- Use `test.step()` to document sub-actions within a long test
- Write a realistic user journey from signup to active board use
- Debug integration failures that don't appear in isolated module tests

## Concept

The capstone is a synthesis test — it validates that techniques learned
in isolation still work together in a realistic workflow.

**`test.step()` for readable long tests:**
```typescript
test('full journey', async ({ page }) => {
  await test.step('Sign up', async () => { ... });
  await test.step('Create project', async () => { ... });
  await test.step('Add cards', async () => { ... });
});
```
Steps appear in the Trace Viewer timeline and in CI failure messages.
A step failure tells you exactly which phase of the journey broke.

## What you've learned across M20-M35

| Module | Technique |
|--------|-----------|
| M20 | Page Object Model |
| M21 | Component Testing |
| M22 | Visual Regression |
| M23 | Accessibility (axe-core) |
| M24 | Drag-and-Drop |
| M25 | File Upload |
| M26 | iFrame + contenteditable |
| M27 | WebSocket testing |
| M28 | Multi-tab / Multi-user |
| M29 | Service Worker / PWA offline |
| M30 | Electron |
| M31 | Tracing and Debugging |
| M32 | CI/CD + sharding |
| M33 | Performance budgets |
| M34 | Internationalization |
| M35 | Capstone: full journey |

## Key Takeaways

1. `test.step()` turns a long test into a readable story with named phases.
2. Integration tests surface bugs that unit and isolated tests miss.
3. A capstone with accessibility + performance assertions is a regression safety net.
4. Multi-user collaboration tests require two independent BrowserContexts.

## Going Deeper

- [Playwright docs: test.step()](https://playwright.dev/docs/api/class-test#test-step)
- [Playwright docs: Best practices](https://playwright.dev/docs/best-practices)
```

- [ ] **Step 5: Commit**

```bash
git add tests/module-35-capstone/
git commit -m "feat(modules): add M35 End-to-End Capstone exercise scaffold"
```

---

## Final Commit: Update READMEs and docs index

- [ ] **Step 1: Update `tests/README.md`** — add M20–M35 to the module table.

- [ ] **Step 2: Commit**

```bash
git add tests/README.md docs/
git commit -m "docs: update module index for Part 6 M20-M35"
```

---

*End of Part 6 plan — M20–M35 complete.*
