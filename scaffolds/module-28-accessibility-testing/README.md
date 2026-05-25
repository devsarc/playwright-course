# M28: Accessibility Testing

## Learning Objectives

- Run automated WCAG 2.1 AA checks with `@axe-core/playwright`
- Scope scans with `.withTags()` and `.include()`
- Interpret axe violation output (id, impact, nodes)
- Complement automated scans with manual keyboard-navigation assertions
- Filter axe rules by WCAG level: `.withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])` to commit to specific conformance levels
- Assert tab order: `press('Tab')` repeatedly and verify `page.evaluate(() => document.activeElement.getAttribute('data-testid'))` matches expected sequence
- Assert focus management: after opening a modal, confirm focus is trapped inside; after closing, confirm focus returns to the trigger
- Verify ARIA role and label correctness: `getByRole('dialog', { name: 'Delete task' })` fails if the role or name is wrong

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
