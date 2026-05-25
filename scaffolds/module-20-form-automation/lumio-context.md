# Lumio Context: M20

## What's in Lumio at this point

By module 20 a user has signed up and confirmed their email. They are now in the onboarding flow and must create their first workspace before they can access the main app. The workspace creation form collects the workspace name, a URL-safe slug (auto-generated from the name but editable), the billing plan, and an optional description. Submitting successfully redirects the user to `/onboarding/invite`.

## Where these files live

```
lumio/
└── app/
    └── (onboarding)/
        └── onboarding/
            └── workspace/
                └── page.tsx  ← the form
```

## Form fields

| Field | Type | data-testid | Notes |
|---|---|---|---|
| Workspace Name | `<input type="text">` | `workspace-name-input` | Required. Drives slug auto-generation. |
| Slug | `<input type="text">` | `workspace-slug-input` | Auto-populated from name; user can override. Must be unique across all workspaces. |
| Plan | Radix Select | `workspace-plan-select` (trigger) | Options: `free`, `pro`, `enterprise`. Each option has `data-testid="workspace-plan-option-{value}"`. |
| Description | `<textarea>` | `workspace-description-input` | Optional. |
| Submit | `<button type="submit">` | `workspace-submit-button` | Disabled until required fields are filled. |

Validation errors are rendered in elements with `role="alert"` adjacent to the relevant field, plus a summary at the top of the form on empty submit. The slug uniqueness error is returned by the server and also rendered with `role="alert"` near the slug field.

## Why this form is good for learning

The Radix Select plan picker is a custom component — not a native `<select>` — so `page.selectOption()` will throw an error and learners must discover the click-trigger-then-click-option pattern that applies to virtually every design-system dropdown. The slug field's auto-generation behavior also teaches learners to wait for computed state (`toHaveValue`) before continuing, rather than assuming synchronous DOM updates.
