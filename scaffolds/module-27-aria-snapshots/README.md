# M27: ARIA Snapshot Testing

## Learning Objectives

- Explain what the accessibility tree is and how it differs from the DOM, and why that difference matters for testing
- Use `toMatchAriaSnapshot()` to assert the structural shape of the accessibility tree as inline YAML
- Generate the initial ARIA snapshot string using `--update-snapshots` or the Trace Viewer InspectorTab
- Decide when ARIA snapshots are a better fit than visual screenshots (dynamic content, responsive layouts, semantic regressions)
- Update ARIA snapshots intentionally after deliberate UI changes without silencing legitimate failures

## Concept

Every page has two representations: the DOM and the accessibility tree. The DOM is what browsers render — a tree of HTML elements, CSS classes, and JavaScript-managed state. The accessibility tree is what screen readers and other assistive technologies consume. It is derived from the DOM but transformed: ARIA roles replace tag names, accessible names replace visual labels, and many presentational nodes are filtered out entirely. A `<div>` with `role="button"` and `aria-label="Close"` appears in the accessibility tree as a button named "Close", regardless of how it is styled.

This distinction matters enormously for testing. Two screenshots can look identical while the accessibility tree has completely broken. A modal might render visually with the right text but be missing `role="dialog"`, making it impossible for a screen reader user to understand they are in a focused context. A button might display an icon but have no accessible name, so it reads only as "button" — meaningless to someone using a screen reader. These are semantic regressions, and pixel-level visual tests will never catch them.

`toMatchAriaSnapshot()` is Playwright's answer to this class of regression. You pass an inline YAML string that describes the expected shape of the accessibility tree for a given locator. Playwright serialises the real tree, normalises it to YAML, and compares it to your string. If a role changes, a name disappears, or a heading level shifts, the test fails — even if the page looks completely unchanged.

The YAML format maps directly to accessibility tree concepts. Each line is a node: the token before any quoted text is the role, and the quoted text is the accessible name. Indentation expresses parent-child relationships. A heading at level 1 becomes `- heading "Kanban Board" [level=1]`. A list with two items becomes a `- list:` parent with `- listitem` children on the next indented level. You can use exact strings or JavaScript-style regular expressions (e.g. `/todo|done/i`) for values that might vary.

Generating the first snapshot by hand is tedious, and Playwright knows it. The intended workflow is to write the test with an empty expected string — or no string at all — and then run it with `--update-snapshots`. Playwright will capture the real accessibility tree and write it directly into your test file as the expected YAML. You review the output, trim it to the parts you actually want to assert, commit it, and from then on the test guards that structure.

The Trace Viewer InspectorTab is an even faster path. After running a test with tracing enabled, open the trace, click on any action, and the Inspector tab shows the accessibility tree for the page state at that moment. You can click any node to copy it as YAML — paste it straight into `toMatchAriaSnapshot()` and you are done.

ARIA snapshots shine in scenarios where visual snapshots struggle. Dynamic content — timestamps, user avatars, live counters — causes constant false failures in visual tests because the pixels keep changing. In ARIA snapshots you simply omit those nodes from the expected YAML or match them with a regex. Responsive layouts are another case: a component can reflow entirely between breakpoints while keeping its semantic structure intact. Asserting the accessibility tree at any viewport will pass as long as the roles and names are correct, regardless of layout changes.

The flip side is that ARIA snapshots are not a substitute for visual tests when you genuinely care about appearance. They do not catch a button turning red, a card losing its shadow, or a column narrowing by 20px. Use both: visual regression tests for appearance, ARIA snapshots for semantics.

When you intentionally redesign part of the UI — renaming a button, splitting a modal into steps, promoting a `div` to a `section` — existing ARIA snapshots will fail on purpose. The fix is the same workflow as snapshot creation: run `--update-snapshots`, review the diff in git, and commit. The key phrase is "review the diff". Never run `--update-snapshots` reflexively to silence a red test without understanding what changed. Each update is you signing off on a new accessibility contract for that component.

## Lumio Context

See `lumio-context.md` for the routes, component file paths, and ARIA selectors relevant to this module.

## Step-by-Step Tasks

1. Navigate to `/dashboard` and use `getByTestId('kanban-board')` to scope your first snapshot to the board container.
2. Complete **TODO 1** and **TODO 2**: add the `'kanban-board'` testid and write the YAML for the board heading and list structure.
3. Complete **TODO 3** and **TODO 4**: locate the first task card and assert its listitem/heading/text structure.
4. Complete **TODO 5**: assert the accessible name of the "Add task" button.
5. Complete **TODO 6**: click "Add task", wait for the dialog, and assert the full modal structure including form controls.
6. Complete **TODO 7**: press Escape, then assert the dialog is no longer visible in the accessibility tree.
7. Read **TODO 8** and run the module with `--update-snapshots` to see Playwright rewrite the expected YAML automatically.

**Validation command:**

```bash
npx playwright test tests/module-27-aria-snapshots/exercise.spec.ts
```

To regenerate all snapshots after a deliberate UI change:

```bash
npx playwright test tests/module-27-aria-snapshots/exercise.spec.ts --update-snapshots
```

## Key Takeaways

1. The accessibility tree is not the DOM — always test the tree when you care about assistive technology compatibility.
2. `toMatchAriaSnapshot()` guards semantic structure; `toHaveScreenshot()` guards visual appearance. Use both, for different regressions.
3. Generate the initial YAML with `--update-snapshots` or the Trace Viewer InspectorTab rather than hand-authoring it from scratch.
4. ARIA snapshots are more stable than visual ones for dynamic content — omit or regex-match any node whose text changes at runtime.
5. Every `--update-snapshots` run is a deliberate decision: review the git diff before committing, because you are approving a new accessibility contract.

## Going Deeper

- [Playwright docs: ARIA snapshots](https://playwright.dev/docs/aria-snapshots)
- [Playwright docs: Accessibility testing](https://playwright.dev/docs/accessibility-testing)
- [Playwright docs: Trace Viewer](https://playwright.dev/docs/trace-viewer)
