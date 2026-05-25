# M03: Actions — Interacting with Elements

## Learning Objectives

- Choose between `click`, `fill`, `press`, `pressSequentially`, `hover`, `selectOption` for any interaction
- Explain what "actionable" means and why auto-wait makes explicit waits unnecessary
- Know when `pressSequentially` is needed over `fill`
- Know the difference between `selectOption` (native select) and click-based patterns for custom dropdowns

## Concept

Every action you call in Playwright — `click()`, `fill()`, `hover()`, `press()` — goes through an actionability check before it executes. Playwright waits until the element is:

- **Attached** to the DOM (not removed or not yet rendered)
- **Visible** (not hidden by CSS, non-zero size)
- **Stable** (not mid-animation)
- **Enabled** (not `disabled`)
- **Editable** (for `fill()` — not `readonly`)

This is auto-waiting. It's the reason you don't need `sleep()` calls or `waitForSelector()` in the vast majority of tests. If you've ever written Selenium tests littered with `Thread.sleep(1000)`, this is the feature that replaces all of that.

If actionability isn't reached within the timeout (default 30 seconds, configurable per action), Playwright throws a `TimeoutError` with a detailed message explaining what condition wasn't met.

### `fill()` vs `pressSequentially()`

`fill()` clears the field and sets its value atomically — it's the equivalent of clearing the input and pasting text. It's fast and reliable for almost all use cases.

`pressSequentially()` dispatches real keyboard events (`keydown`, `keypress`, `input`, `keyup`) for each character, one at a time. Use it when the app responds to individual keystrokes — for example, a search box that shows suggestions on each character typed, or a rich text editor that intercepts keyboard shortcuts. For a plain `<input>`, `fill()` is always better.

### `click()` is smarter than it looks

`click()` doesn't just fire a click event. It waits for actionability, scrolls the element into view if needed, moves the mouse pointer to the element's center, and clicks. If the click is intercepted (another element is covering the target), Playwright retries — it doesn't fail immediately.

### `hover()` and CSS `:hover`

`hover()` moves the mouse to the element's center, triggering CSS `:hover` styles and any JavaScript `mouseover` handlers. It's useful for testing dropdown menus, tooltips, and any UI that responds to pointer position.

### `selectOption()` — native `<select>` only

`selectOption()` works exclusively with the HTML `<select>` element. Most modern UI libraries (Radix UI, shadcn/ui, Headless UI) render custom dropdown components using `<div>` and `<button>` elements, not native `<select>`. For these, the correct pattern is `click()` on the trigger to open the dropdown, then `click()` on the desired option.

### `dragTo()` — a note

`dragTo()` handles most basic drag-and-drop scenarios. Lumio's kanban board uses a library that listens to pointer events, so it works with `dragTo()`. For libraries that intercept low-level mouse events, you'll need `page.mouse.down()` / `page.mouse.move()` / `page.mouse.up()` — covered in M23.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Complete each TODO in `exercise.spec.ts`.
```bash
npx playwright test tests/module-03-actions --headed
```

## Key Takeaways

1. Every action waits for the element to be actionable — no `waitForSelector` needed.
2. `fill()` clears + types atomically. `pressSequentially()` fires key events one at a time.
3. `press('Enter')` submits forms reliably regardless of whether there's a submit button.
4. `selectOption()` is only for native `<select>`. Custom dropdowns require click-based patterns.
5. `dragTo()` works for simple DnD; `page.mouse` is needed for libraries that ignore synthetic events (M23).

## Going Deeper

- [Playwright docs: Actions](https://playwright.dev/docs/input)
