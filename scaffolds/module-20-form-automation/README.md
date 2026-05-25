# M20 — Form Automation & Validation

## Learning Objectives

By the end of this module, you will be able to:

- Decide when to use `fill()` vs `type()` vs `pressSequentially()` and why the distinction matters in real-world forms
- Identify the difference between a native `<select>` and a custom component (like Radix Select) and choose the right interaction strategy for each
- Trigger and assert validation error messages without relying on implementation-specific class names
- Test both client-side (empty field) and server-side (duplicate slug) validation paths in the same suite
- Submit a form via the Enter key and understand when that matters vs clicking a submit button
- Build a mental model for form test sequencing: navigate → interact → assert state change

## Concept

Forms are where most real-world applications spend their complexity. They have required fields, computed fields, custom components, async validation, and redirect logic on success. Testing them well is less about knowing the right Playwright API and more about understanding *what kind of element you're actually dealing with* — because the wrong assumption about element type is the root cause of most form-related test failures.

**Start with the simplest case: native inputs.** When you call `page.fill('[data-testid="workspace-name-input"]', 'My Workspace')`, Playwright clicks the element, selects all existing text, and types the new value in one atomic operation. This is almost always what you want. The alternative, `type()`, dispatches individual `keydown`/`keypress`/`keyup` events per character — useful when you're testing autocomplete behavior or keyboard shortcuts, but slower and less reliable for simply populating a field. The rule of thumb: use `fill()` unless you need character-by-character event simulation.

**Computed fields require a different strategy.** The slug input on Lumio's workspace form auto-generates from the workspace name — it updates as you type. This means you may need to wait for the field to stabilize before asserting its value, or before deciding to override it manually. `expect(locator).toHaveValue()` polls until the value matches or the timeout expires, making it the right assertion here rather than reading `.inputValue()` synchronously and hoping it's already updated.

**Validation errors are a test in themselves.** When a user submits an empty form, the app should surface error messages. The important decision is *how you assert those messages*. Avoid `page.locator('.error-text')` — that couples your test to CSS class names that change during refactors. Instead, reach for semantic roles: `page.getByRole('alert')` targets any element with `role="alert"`, which is the ARIA-correct way to announce validation errors. If there are multiple errors, `getByRole('alert')` returns a locator that matches all of them, and you can assert their count or filter by text.

**The Radix Select is where most learners get stuck — and it's the most important concept in this module.** Radix UI's `<Select>` component renders a custom dropdown built entirely from `<div>` and `<span>` elements. It is *not* a native `<select>`, so `page.selectOption()` will not work on it. Ever. Trying it will throw an error or silently do nothing depending on context. Instead, you interact with it the same way a user would: click the trigger element to open the floating panel, wait for the options to appear in the DOM, then click the option you want.

This pattern generalises far beyond Radix. Virtually every design system — Material UI, Chakra, Headless UI, shadcn/ui — uses the same architecture: a visible trigger that toggles a portal-rendered list. The test always follows the same shape: open the trigger, then select from the list. What changes is how you locate the trigger and the options. Using `data-testid` attributes (like `workspace-plan-select` and `workspace-plan-option-{value}`) is the most stable approach because it survives visual redesigns and text copy changes.

**Server-side errors need the same assertion discipline.** When a duplicate slug is submitted, the server returns an error and the UI renders it — typically also with `role="alert"` or inline near the field. Your test needs to wait for that element to appear after form submission, not before. `await expect(page.getByRole('alert')).toBeVisible()` handles this correctly because it waits up to the configured timeout for the condition to become true. Don't assert immediately after `click()` — the network round-trip takes time.

**Submitting via Enter key** is a separate test concern. Many forms support `Enter` key submission but only when a specific field is focused. Testing this explicitly ensures you haven't accidentally broken keyboard accessibility. `page.locator('input').press('Enter')` dispatches the key event on the focused element. This is distinct from `page.keyboard.press('Enter')`, which dispatches globally — a subtle but meaningful difference when there are nested forms or dialog overlays.

The broader mental model: every form test is really three smaller tests — the happy path, the empty-submit path, and the conflict/server-error path. If you structure your `test.describe` block around these three concerns, your suite stays readable as the form grows in complexity.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Complete each TODO in `exercise.spec.ts` in order. Run after each TODO:

```
npx playwright test tests/module-20-form-automation --headed
```

## Key Takeaways

- Use `fill()` for populating inputs; use `type()` only when you need per-keystroke event simulation
- `page.selectOption()` only works on native `<select>` elements — for Radix Select and other custom dropdowns, click the trigger then click the option
- Assert validation errors via `getByRole('alert')` to stay decoupled from CSS class names
- Use `toHaveValue()` and `toBeVisible()` (not synchronous reads) when asserting state that arrives after user interaction or a network call
- Structure form tests around three paths: happy path, client-side validation, server-side validation

## Going Deeper

- [Playwright — `page.fill()` and input interactions](https://playwright.dev/docs/input)
- [Playwright — `page.selectOption()` and when it applies](https://playwright.dev/docs/api/class-locator#locator-select-option)
- [Playwright — Assertions and `toBeVisible` / `toHaveValue`](https://playwright.dev/docs/test-assertions)
