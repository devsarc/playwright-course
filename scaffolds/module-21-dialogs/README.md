# M21 — Dialog & Alert Handling

## Learning Objectives

By the end of this module, you will be able to:

- Decide when to use `page.on('dialog')` vs waiting for a custom modal component, and why mixing them up causes tests to hang
- Register a dialog handler *before* the action that triggers it, and explain why order of registration is non-negotiable
- Accept, dismiss, and inspect the message of `alert`, `confirm`, and `prompt` dialogs using the `Dialog` object
- Handle `beforeunload` dialogs by understanding how they differ from action-triggered dialogs — they fire on navigation, not on a button click
- Assert both the accept and dismiss paths of a confirm dialog by verifying the resulting application state

## Concept

Most UI interactions in Playwright follow a comfortable pattern: locate an element, perform an action, assert a state change. Native browser dialogs break that pattern entirely — and that is what makes them worth their own module.

When a page calls `window.alert()`, `window.confirm()`, or `window.prompt()`, the browser suspends JavaScript execution and displays a modal that is completely outside the DOM. There is no `data-testid`, no ARIA role, no locator that can reach it. Playwright does not treat this as a failure — it raises a `dialog` event on the page. If your test never listens for that event, Playwright will dismiss the dialog automatically in headless mode, which means you will not notice the problem until you try to assert that a delete actually happened.

**The event-driven pattern looks like this.** You call `page.on('dialog', handler)` where `handler` is a function that receives a `Dialog` object. Inside that handler you can call `dialog.accept()` to confirm, `dialog.dismiss()` to cancel, or `dialog.accept('some text')` to fill a prompt. The critical constraint is timing: you must register the handler *before* the action that opens the dialog. If you click the "Delete workspace" button first and then try to register the handler, Playwright has already auto-dismissed the dialog and your handler will never be called. Think of it like subscribing to an event — you must be subscribed before the event fires, not after.

**The three dialog types each behave slightly differently.** An `alert` dialog has only an OK button; calling either `accept()` or `dismiss()` closes it, but `accept()` is the semantically correct choice. A `confirm` dialog has OK and Cancel — `accept()` means OK, `dismiss()` means Cancel. A `prompt` dialog has an input field; `dialog.accept('My value')` fills the field and clicks OK, while `dismiss()` closes without entering anything. You can read the dialog's message at any point via `dialog.message()`, which is the text content shown to the user. Asserting this is useful when you want to confirm the application is showing the right copy — for example, confirming the workspace name is mentioned in the "Are you sure?" message.

**`beforeunload` dialogs are the odd one out.** They are not triggered by a button — they are triggered by the browser itself when the user attempts to navigate away from a page that has registered a `beforeunload` listener. In Lumio, the workspace settings form attaches `window.addEventListener('beforeunload', ...)` when the user has made changes to the form fields. The dialog fires when a navigation event occurs, such as clicking a sidebar link or calling `page.goto()`. The handler registration is the same — `page.on('dialog', handler)` — but the trigger is navigation rather than a click. One important nuance: Playwright only respects `beforeunload` dialogs when `page.close()` is used in some scenarios; for navigation-triggered `beforeunload`, triggering via a real navigation click (`page.getByTestId('nav-link').click()`) is more reliable than `page.goto()` in tests.

**The accept and dismiss paths are separate test concerns.** When you accept the delete confirmation, the workspace should be deleted and the user redirected. When you dismiss it, the user stays on the settings page and the workspace remains intact. These two outcomes have meaningfully different assertions — a URL check in one case, a visibility check in the other — and they deserve separate test cases rather than being crammed into a single one. This also makes failures easier to diagnose: if the delete path breaks, the dismiss test still passes, which immediately tells you the dialog itself works but the deletion logic does not.

**A practical note on handler cleanup.** `page.on('dialog', handler)` registers a persistent listener for the lifetime of the page. If you need to handle only one dialog, use `page.once('dialog', handler)` instead. This registers the handler for a single firing and then removes itself. It is the safer choice in most test scenarios because it prevents a handler from accidentally catching a second dialog triggered later in the same test.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Complete each TODO in `exercise.spec.ts` in order. Run after each TODO:

```
npx playwright test tests/module-21-dialogs --headed
```

## Key Takeaways

- Register `page.on('dialog')` or `page.once('dialog')` *before* the action that triggers the dialog — not after
- Native browser dialogs are not in the DOM; no locator will find them — only the `dialog` event gives you access
- Use `dialog.accept()` for OK/confirm, `dialog.dismiss()` for Cancel, and `dialog.message()` to assert the displayed text
- `beforeunload` fires on navigation away from a dirty form — trigger it by clicking a navigation element, not just `page.goto()`
- Test the accept and dismiss paths as separate test cases to keep assertions precise and failures easy to diagnose

## Going Deeper

- [Playwright — Dialogs (`page.on('dialog')`)](https://playwright.dev/docs/dialogs)
- [Playwright — `Dialog` class API](https://playwright.dev/docs/api/class-dialog)
- [MDN — `beforeunload` event](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event)
