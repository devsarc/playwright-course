# Lumio Context: Lesson 04

## Part 1 — Form Automation & Validation (formerly M20)

### What's in Lumio at this point

By module 20 a user has signed up and confirmed their email. They are now in the onboarding flow and must create their first workspace before they can access the main app. The workspace creation form collects the workspace name, a URL-safe slug (auto-generated from the name but editable), the billing plan, and an optional description. Submitting successfully redirects the user to `/onboarding/invite`.

### Where these files live

```
lumio/
└── app/
    └── (onboarding)/
        └── onboarding/
            └── workspace/
                └── page.tsx  ← the form
```

### Form fields

| Field | Type | data-testid | Notes |
|---|---|---|---|
| Workspace Name | `<input type="text">` | `workspace-name-input` | Required. Drives slug auto-generation. |
| Slug | `<input type="text">` | `workspace-slug-input` | Auto-populated from name; user can override. Must be unique across all workspaces. |
| Plan | Radix Select | `workspace-plan-select` (trigger) | Options: `free`, `pro`, `enterprise`. Each option has `data-testid="workspace-plan-option-{value}"`. |
| Description | `<textarea>` | `workspace-description-input` | Optional. |
| Submit | `<button type="submit">` | `workspace-submit-button` | Disabled until required fields are filled. |

Validation errors are rendered in elements with `role="alert"` adjacent to the relevant field, plus a summary at the top of the form on empty submit. The slug uniqueness error is returned by the server and also rendered with `role="alert"` near the slug field.

### Why this form is good for learning

The Radix Select plan picker is a custom component — not a native `<select>` — so `page.selectOption()` will throw an error and learners must discover the click-trigger-then-click-option pattern that applies to virtually every design-system dropdown. The slug field's auto-generation behavior also teaches learners to wait for computed state (`toHaveValue`) before continuing, rather than assuming synchronous DOM updates.

## Part 2 — Dialog & Alert Handling (formerly M21)

### What's in Lumio at this point

By module 21 the user has created a workspace (in Part 1 of this lesson (formerly M20)) and can now access the workspace settings page. The settings page at `/settings/workspace` serves two purposes relevant to this module:

1. **Delete workspace** — A "Delete workspace" button at the bottom of the page calls `window.confirm()` with a message asking the user to confirm the destructive action. On confirmation the workspace is deleted and the user is redirected to `/dashboard`. On dismissal the page stays unchanged.

2. **Unsaved changes guard** — The settings form (workspace name, description, and notification preferences) registers a `beforeunload` event listener whenever the user modifies any field. If the user attempts to navigate away with unsaved changes, the browser fires a `beforeunload` dialog with the message `"You have unsaved changes. Are you sure you want to leave?"`.

Both of these use the browser's native dialog system — not a custom React modal component — which is why they cannot be found with any Playwright locator and must be handled via `page.on('dialog')`.

### Where these files live

```
lumio/
└── app/
    └── (protected)/
        └── settings/
            └── workspace/
                └── page.tsx  ← settings form + delete button
```

### Relevant elements

| Element | data-testid | Notes |
|---|---|---|
| Delete workspace button | `delete-workspace-button` | Calls `window.confirm()` on click |
| Workspace name input | `workspace-settings-name-input` | Dirties the form; triggers `beforeunload` guard when changed |
| Dashboard nav link | `nav-dashboard-link` | Sidebar link used to trigger `beforeunload` in the test |

The confirm dialog and the beforeunload dialog are **native browser dialogs** — they have no `data-testid` and cannot be interacted with via DOM locators. The only interface Playwright provides is the `dialog` event and the `Dialog` object passed to its handler.

### Why this is good for learning

The delete workspace flow forces learners to confront a fundamental limitation of DOM-based testing: not everything is in the DOM. Native browser dialogs exist entirely outside the page's element tree. The event-driven registration pattern (`page.once('dialog', ...)` before the triggering action) is a concrete, memorable rule that transfers directly to every other native dialog scenario a learner will encounter in real projects.

The `beforeunload` test adds a second dimension: learners discover that dialogs are not always triggered by button clicks. Connecting "I modified a form field" to "navigating away fires a dialog" builds a more complete mental model of how browsers manage navigation lifecycle — knowledge that matters when debugging flaky tests that unexpectedly dismiss each other's dialogs.

## Part 3 — File Upload, Download & PDF (formerly M22)

### File upload in Lumio

Route: Card detail panel (opens on card click).

| Element | data-testid | Type |
|---------|-------------|------|
| File input | `attachment-input` | `<input type="file" multiple>` |
| Drop zone | `attachment-dropzone` | `<div>` listening to drop event |
| Attachment row | `attachment-item` | rendered after upload |

### Where to find this in the code

```
lumio/components/kanban/CardDetailPanel.tsx
  -> AttachmentInput    (input[type=file])
  -> AttachmentDropzone (div + drop handler)
  -> AttachmentList -> AttachmentItem x N
```

### Test fixtures

Create small files under `tests/module-25-file-upload/fixtures/`:
- `sample.txt` — any plain text
- `sample2.txt` — second file for multi-upload test

## Part 4 — Advanced Input & Interactions (formerly M23)

### Kanban DnD implementation

Library: `@hello-pangea/dnd` (maintained fork of react-beautiful-dnd)

Cards are draggable within and across columns. The library listens to mouse events
(mousedown, mousemove, mouseup) not the HTML5 drag API. This is why
`locator.dragTo()` works directly.

### testid map

| Element | data-testid |
|---------|-------------|
| Column container | `kanban-column-{todo|in-progress|done}` |
| Draggable card | `kanban-card` |
| Drag handle icon | `card-drag-handle` |

### Seed data

`/projects/demo/board` has at least 2 cards in "todo" and 1 in "in-progress"
so drag tests do not need to create cards first.

## Part 5 — iFrame & Shadow DOM (formerly M24)

### iFrames in Lumio

| Page | iframe | Selector |
|------|--------|----------|
| Card detail panel | Preview of card content | `[data-testid="card-preview-frame"]` |
| Embed form page | Third-party form embed | `name="embed-form-frame"` |

### TipTap editor

Location: `lumio/components/editor/TipTapEditor.tsx`

TipTap renders a `contenteditable` div, not an iframe. Access via:

```
[data-testid="tiptap-editor"] -> [role="textbox"]
```

Keyboard shortcuts: Control+B bold, Control+I italic, Control+Z undo.
