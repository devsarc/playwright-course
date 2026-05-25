# Lumio Context: M21

## What's in Lumio at this point

By module 21 the user has created a workspace (in M20) and can now access the workspace settings page. The settings page at `/settings/workspace` serves two purposes relevant to this module:

1. **Delete workspace** — A "Delete workspace" button at the bottom of the page calls `window.confirm()` with a message asking the user to confirm the destructive action. On confirmation the workspace is deleted and the user is redirected to `/dashboard`. On dismissal the page stays unchanged.

2. **Unsaved changes guard** — The settings form (workspace name, description, and notification preferences) registers a `beforeunload` event listener whenever the user modifies any field. If the user attempts to navigate away with unsaved changes, the browser fires a `beforeunload` dialog with the message `"You have unsaved changes. Are you sure you want to leave?"`.

Both of these use the browser's native dialog system — not a custom React modal component — which is why they cannot be found with any Playwright locator and must be handled via `page.on('dialog')`.

## Where these files live

```
lumio/
└── app/
    └── (protected)/
        └── settings/
            └── workspace/
                └── page.tsx  ← settings form + delete button
```

## Relevant elements

| Element | data-testid | Notes |
|---|---|---|
| Delete workspace button | `delete-workspace-button` | Calls `window.confirm()` on click |
| Workspace name input | `workspace-settings-name-input` | Dirties the form; triggers `beforeunload` guard when changed |
| Dashboard nav link | `nav-dashboard-link` | Sidebar link used to trigger `beforeunload` in the test |

The confirm dialog and the beforeunload dialog are **native browser dialogs** — they have no `data-testid` and cannot be interacted with via DOM locators. The only interface Playwright provides is the `dialog` event and the `Dialog` object passed to its handler.

## Why this is good for learning

The delete workspace flow forces learners to confront a fundamental limitation of DOM-based testing: not everything is in the DOM. Native browser dialogs exist entirely outside the page's element tree. The event-driven registration pattern (`page.once('dialog', ...)` before the triggering action) is a concrete, memorable rule that transfers directly to every other native dialog scenario a learner will encounter in real projects.

The `beforeunload` test adds a second dimension: learners discover that dialogs are not always triggered by button clicks. Connecting "I modified a form field" to "navigating away fires a dialog" builds a more complete mental model of how browsers manage navigation lifecycle — knowledge that matters when debugging flaky tests that unexpectedly dismiss each other's dialogs.
