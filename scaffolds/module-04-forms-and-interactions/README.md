# Lesson 04: Forms, Dialogs & Advanced Interactions

*Combines former modules M20–M24.*

## Learning Objectives

### Part 1 — Form Automation & Validation (formerly M20)

By the end of this module, you will be able to:

- Decide when to use `fill()` vs `type()` vs `pressSequentially()` and why the distinction matters in real-world forms
- Identify the difference between a native `<select>` and a custom component (like Radix Select) and choose the right interaction strategy for each
- Trigger and assert validation error messages without relying on implementation-specific class names
- Test both client-side (empty field) and server-side (duplicate slug) validation paths in the same suite
- Submit a form via the Enter key and understand when that matters vs clicking a submit button
- Build a mental model for form test sequencing: navigate → interact → assert state change

### Part 2 — Dialog & Alert Handling (formerly M21)

By the end of this module, you will be able to:

- Decide when to use `page.on('dialog')` vs waiting for a custom modal component, and why mixing them up causes tests to hang
- Register a dialog handler *before* the action that triggers it, and explain why order of registration is non-negotiable
- Accept, dismiss, and inspect the message of `alert`, `confirm`, and `prompt` dialogs using the `Dialog` object
- Handle `beforeunload` dialogs by understanding how they differ from action-triggered dialogs — they fire on navigation, not on a button click
- Assert both the accept and dismiss paths of a confirm dialog by verifying the resulting application state

### Part 3 — File Upload, Download & PDF (formerly M22)

- Upload files without OS dialogs using `locator.setInputFiles()`
- Upload multiple files in one call and clear with `[]`
- Simulate file drag-and-drop using `DataTransfer` + `page.evaluateHandle()`
- Intercept a file download with `page.waitForEvent('download')` and save it to disk for assertion
- Assert downloaded file content: read the saved file with `fs.readFileSync` and verify size or content
- Generate a PDF with `page.pdf()` (Chromium only): understand when to use it and its limitations (no WebKit/Firefox support, requires headful or `--headless=new`)

### Part 4 — Advanced Input & Interactions (formerly M23)

- Use `locator.dragTo()` for mouse-event DnD libraries
- Use `page.dragAndDrop()` for HTML5 drag API libraries
- Pass `{ steps: N }` for libraries needing intermediate mousemove events
- Use `page.mouse` for full manual control when high-level APIs fail
- Use `page.keyboard.press()`, `keyboard.down()`, `keyboard.up()`, and `keyboard.type()` for complex key sequences
- Read and write clipboard content via `page.evaluate(() => navigator.clipboard.readText())`
- Dispatch touch events for mobile interaction testing: `page.touchscreen.tap(x, y)`
- Assert tooltip visibility: hover over an element and verify the tooltip locator `toBeVisible()`

### Part 5 — iFrame & Shadow DOM (formerly M24)

- Use `page.frameLocator()` for auto-waiting, locator-scoped iframe access
- Use `page.frame()` for Frame-object-level operations
- Interact with TipTap (contenteditable) using `fill()` and keyboard shortcuts
- Navigate nested iframes using chained `frameLocator()` calls: `page.frameLocator('#outer').frameLocator('#inner')`
- Interact with Shadow DOM using `locator.locator(':shadow *')` piercing syntax
- Explain cross-origin iframe limitations: Playwright cannot interact with a cross-origin iframe's DOM; describe the workaround (route the iframe origin via `page.route()` or use `addInitScript` on the outer page)

## Concept

### Part 1 — Form Automation & Validation (formerly M20)

Forms are where most real-world applications spend their complexity. They have required fields, computed fields, custom components, async validation, and redirect logic on success. Testing them well is less about knowing the right Playwright API and more about understanding *what kind of element you're actually dealing with* — because the wrong assumption about element type is the root cause of most form-related test failures.

**Start with the simplest case: native inputs.** When you call `page.fill('[data-testid="workspace-name-input"]', 'My Workspace')`, Playwright clicks the element, selects all existing text, and types the new value in one atomic operation. This is almost always what you want. The alternative, `type()`, dispatches individual `keydown`/`keypress`/`keyup` events per character — useful when you're testing autocomplete behavior or keyboard shortcuts, but slower and less reliable for simply populating a field. The rule of thumb: use `fill()` unless you need character-by-character event simulation.

**Computed fields require a different strategy.** The slug input on Lumio's workspace form auto-generates from the workspace name — it updates as you type. This means you may need to wait for the field to stabilize before asserting its value, or before deciding to override it manually. `expect(locator).toHaveValue()` polls until the value matches or the timeout expires, making it the right assertion here rather than reading `.inputValue()` synchronously and hoping it's already updated.

**Validation errors are a test in themselves.** When a user submits an empty form, the app should surface error messages. The important decision is *how you assert those messages*. Avoid `page.locator('.error-text')` — that couples your test to CSS class names that change during refactors. Instead, reach for semantic roles: `page.getByRole('alert')` targets any element with `role="alert"`, which is the ARIA-correct way to announce validation errors. If there are multiple errors, `getByRole('alert')` returns a locator that matches all of them, and you can assert their count or filter by text.

**The Radix Select is where most learners get stuck — and it's the most important concept in this module.** Radix UI's `<Select>` component renders a custom dropdown built entirely from `<div>` and `<span>` elements. It is *not* a native `<select>`, so `page.selectOption()` will not work on it. Ever. Trying it will throw an error or silently do nothing depending on context. Instead, you interact with it the same way a user would: click the trigger element to open the floating panel, wait for the options to appear in the DOM, then click the option you want.

This pattern generalises far beyond Radix. Virtually every design system — Material UI, Chakra, Headless UI, shadcn/ui — uses the same architecture: a visible trigger that toggles a portal-rendered list. The test always follows the same shape: open the trigger, then select from the list. What changes is how you locate the trigger and the options. Using `data-testid` attributes (like `workspace-plan-select` and `workspace-plan-option-{value}`) is the most stable approach because it survives visual redesigns and text copy changes.

**Server-side errors need the same assertion discipline.** When a duplicate slug is submitted, the server returns an error and the UI renders it — typically also with `role="alert"` or inline near the field. Your test needs to wait for that element to appear after form submission, not before. `await expect(page.getByRole('alert')).toBeVisible()` handles this correctly because it waits up to the configured timeout for the condition to become true. Don't assert immediately after `click()` — the network round-trip takes time.

**Submitting via Enter key** is a separate test concern. Many forms support `Enter` key submission but only when a specific field is focused. Testing this explicitly ensures you haven't accidentally broken keyboard accessibility. `page.locator('input').press('Enter')` dispatches the key event on the focused element. This is distinct from `page.keyboard.press('Enter')`, which dispatches globally — a subtle but meaningful difference when there are nested forms or dialog overlays.

The broader mental model: every form test is really three smaller tests — the happy path, the empty-submit path, and the conflict/server-error path. If you structure your `test.describe` block around these three concerns, your suite stays readable as the form grows in complexity.

### Part 2 — Dialog & Alert Handling (formerly M21)

Most UI interactions in Playwright follow a comfortable pattern: locate an element, perform an action, assert a state change. Native browser dialogs break that pattern entirely — and that is what makes them worth their own module.

When a page calls `window.alert()`, `window.confirm()`, or `window.prompt()`, the browser suspends JavaScript execution and displays a modal that is completely outside the DOM. There is no `data-testid`, no ARIA role, no locator that can reach it. Playwright does not treat this as a failure — it raises a `dialog` event on the page. If your test never listens for that event, Playwright will dismiss the dialog automatically in headless mode, which means you will not notice the problem until you try to assert that a delete actually happened.

**The event-driven pattern looks like this.** You call `page.on('dialog', handler)` where `handler` is a function that receives a `Dialog` object. Inside that handler you can call `dialog.accept()` to confirm, `dialog.dismiss()` to cancel, or `dialog.accept('some text')` to fill a prompt. The critical constraint is timing: you must register the handler *before* the action that opens the dialog. If you click the "Delete workspace" button first and then try to register the handler, Playwright has already auto-dismissed the dialog and your handler will never be called. Think of it like subscribing to an event — you must be subscribed before the event fires, not after.

**The three dialog types each behave slightly differently.** An `alert` dialog has only an OK button; calling either `accept()` or `dismiss()` closes it, but `accept()` is the semantically correct choice. A `confirm` dialog has OK and Cancel — `accept()` means OK, `dismiss()` means Cancel. A `prompt` dialog has an input field; `dialog.accept('My value')` fills the field and clicks OK, while `dismiss()` closes without entering anything. You can read the dialog's message at any point via `dialog.message()`, which is the text content shown to the user. Asserting this is useful when you want to confirm the application is showing the right copy — for example, confirming the workspace name is mentioned in the "Are you sure?" message.

**`beforeunload` dialogs are the odd one out.** They are not triggered by a button — they are triggered by the browser itself when the user attempts to navigate away from a page that has registered a `beforeunload` listener. In Lumio, the workspace settings form attaches `window.addEventListener('beforeunload', ...)` when the user has made changes to the form fields. The dialog fires when a navigation event occurs, such as clicking a sidebar link or calling `page.goto()`. The handler registration is the same — `page.on('dialog', handler)` — but the trigger is navigation rather than a click. One important nuance: Playwright only respects `beforeunload` dialogs when `page.close()` is used in some scenarios; for navigation-triggered `beforeunload`, triggering via a real navigation click (`page.getByTestId('nav-link').click()`) is more reliable than `page.goto()` in tests.

**The accept and dismiss paths are separate test concerns.** When you accept the delete confirmation, the workspace should be deleted and the user redirected. When you dismiss it, the user stays on the settings page and the workspace remains intact. These two outcomes have meaningfully different assertions — a URL check in one case, a visibility check in the other — and they deserve separate test cases rather than being crammed into a single one. This also makes failures easier to diagnose: if the delete path breaks, the dismiss test still passes, which immediately tells you the dialog itself works but the deletion logic does not.

**A practical note on handler cleanup.** `page.on('dialog', handler)` registers a persistent listener for the lifetime of the page. If you need to handle only one dialog, use `page.once('dialog', handler)` instead. This registers the handler for a single firing and then removes itself. It is the safer choice in most test scenarios because it prevents a handler from accidentally catching a second dialog triggered later in the same test.

### Part 3 — File Upload, Download & PDF (formerly M22)

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

**File download:**
```typescript
const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.getByRole('button', { name: 'Export CSV' }).click(),
]);
const path = await download.path(); // temp file path
const content = fs.readFileSync(path, 'utf-8');
expect(content).toContain('task-id,title');
```

**PDF generation (`page.pdf()`):**
```typescript
// Chromium only — not supported in Firefox or WebKit
const pdf = await page.pdf({ path: 'report.pdf', format: 'A4' });
expect(pdf.length).toBeGreaterThan(0); // at minimum, assert non-empty
```
`page.pdf()` renders the current page to PDF server-side. It requires Chromium (`chromium` project) and throws in other browsers. Use it when you're testing the PDF export feature itself — not as a general assertion tool.

### Part 4 — Advanced Input & Interactions (formerly M23)

This module covers all "complex input" patterns that go beyond standard `click()` and `fill()`: drag-and-drop, keyboard sequences, clipboard access, touch, and hover states. They share a common challenge — the browser's default event handling is bypassed by synthetic dispatch, so you must use the right API level for each library.

| Library | Event model | Playwright API |
|---------|-------------|----------------|
| @hello-pangea/dnd | mouse events | `locator.dragTo()` |
| SortableJS (default) | HTML5 drag API | `page.dragAndDrop()` |
| Custom | mixed | `page.mouse` |

> **Lesson 00 (formerly M03) vs M23:** Lesson 00 (formerly M03) introduced `dragTo()` as the high-level drag API for simple cases. M23 covers `page.mouse` as the low-level escape hatch for libraries (like dnd-kit) that ignore synthetic drag events and require real `mousedown → mousemove → mouseup` sequences.

### Part 5 — iFrame & Shadow DOM (formerly M24)

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

**Shadow DOM:**
```typescript
// Pierce into a shadow root
const shadowInput = page.locator('my-custom-element').locator('input');
// Playwright automatically pierces open shadow roots for locator queries
await shadowInput.fill('value');
```
Playwright pierces **open** shadow roots automatically. Closed shadow roots (`mode: 'closed'`) are inaccessible by design — no workaround exists.

## Lumio Context

See [lumio-context.md](./lumio-context.md).

## Step-by-Step Tasks

### Part 1 — Form Automation & Validation

Complete each TODO in `exercise.spec.ts` in order. Run after each TODO:

```
npx playwright test tests/module-04-forms-and-interactions --headed
```

Validate this part only:
```bash
npx playwright test tests/module-04-forms-and-interactions -g "Part 1 — Form Automation & Validation (formerly M20)"
```

### Part 2 — Dialog & Alert Handling

Complete each TODO in `exercise.spec.ts` in order. Run after each TODO:

```
npx playwright test tests/module-04-forms-and-interactions --headed
```

Validate this part only:
```bash
npx playwright test tests/module-04-forms-and-interactions -g "Part 2 — Dialog & Alert Handling (formerly M21)"
```

### Part 3 — File Upload, Download & PDF

Validate this part only:
```bash
npx playwright test tests/module-04-forms-and-interactions -g "Part 3 — File Upload, Download & PDF (formerly M22)"
```

### Part 4 — Advanced Input & Interactions

Validate this part only:
```bash
npx playwright test tests/module-04-forms-and-interactions -g "Part 4 — Advanced Input & Interactions (formerly M23)"
```

### Part 5 — iFrame & Shadow DOM

Validate this part only:
```bash
npx playwright test tests/module-04-forms-and-interactions -g "Part 5 — iFrame & Shadow DOM (formerly M24)"
```

## Validate (full lesson)

```bash
npx playwright test tests/module-04-forms-and-interactions
```

## Key Takeaways

### Part 1 — Form Automation & Validation

- Use `fill()` for populating inputs; use `type()` only when you need per-keystroke event simulation
- `page.selectOption()` only works on native `<select>` elements — for Radix Select and other custom dropdowns, click the trigger then click the option
- Assert validation errors via `getByRole('alert')` to stay decoupled from CSS class names
- Use `toHaveValue()` and `toBeVisible()` (not synchronous reads) when asserting state that arrives after user interaction or a network call
- Structure form tests around three paths: happy path, client-side validation, server-side validation

### Part 2 — Dialog & Alert Handling

- Register `page.on('dialog')` or `page.once('dialog')` *before* the action that triggers the dialog — not after
- Native browser dialogs are not in the DOM; no locator will find them — only the `dialog` event gives you access
- Use `dialog.accept()` for OK/confirm, `dialog.dismiss()` for Cancel, and `dialog.message()` to assert the displayed text
- `beforeunload` fires on navigation away from a dirty form — trigger it by clicking a navigation element, not just `page.goto()`
- Test the accept and dismiss paths as separate test cases to keep assertions precise and failures easy to diagnose

### Part 3 — File Upload, Download & PDF

1. `setInputFiles()` bypasses the OS picker — always prefer it for `<input type="file">`.
2. `[]` clears the input — useful for testing pre-submit cancellation.
3. `evaluateHandle()` creates browser-side objects that cannot be serialised from Node.js.
4. Use `__dirname` for file paths so tests work regardless of cwd.

### Part 4 — Advanced Input & Interactions

1. Read card text **before** dragging — the locator may point elsewhere after the drop.
2. `{ steps: 20 }` fires intermediate mousemove events — fixes most "drag ignores drop" issues.
3. Always assert card position **after** the drop, not during.
4. `page.mouse` is the escape hatch when all high-level APIs fail.

### Part 5 — iFrame & Shadow DOM

1. `frameLocator` is the modern, auto-waiting API — prefer it.
2. `page.frame()` is needed for Frame-specific methods like `evaluate()`.
3. TipTap is a contenteditable div — `fill()` and keyboard shortcuts work normally.
4. Control+B, Control+I apply formatting inside contenteditable elements.

## Going Deeper

### Part 1 — Form Automation & Validation

- [Playwright — `page.fill()` and input interactions](https://playwright.dev/docs/input)
- [Playwright — `page.selectOption()` and when it applies](https://playwright.dev/docs/api/class-locator#locator-select-option)
- [Playwright — Assertions and `toBeVisible` / `toHaveValue`](https://playwright.dev/docs/test-assertions)

### Part 2 — Dialog & Alert Handling

- [Playwright — Dialogs (`page.on('dialog')`)](https://playwright.dev/docs/dialogs)
- [Playwright — `Dialog` class API](https://playwright.dev/docs/api/class-dialog)
- [MDN — `beforeunload` event](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event)

### Part 3 — File Upload, Download & PDF

- [Playwright docs: setInputFiles](https://playwright.dev/docs/api/class-locator#locator-set-input-files)

### Part 4 — Advanced Input & Interactions

- [Playwright docs: dragTo](https://playwright.dev/docs/api/class-locator#locator-drag-to)

### Part 5 — iFrame & Shadow DOM

- [Playwright docs: Frames](https://playwright.dev/docs/frames)
