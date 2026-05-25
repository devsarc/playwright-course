# Lumio Context — M91: Production Incident Reproduction

## The Incident

**Incident ID:** LUM-INC-2024-11-15
**Severity:** P2 — core feature broken for a significant user segment
**Reported by:** 3 users on iPhone within 48 hours of the v2.4.0 release

**User report:**
> "When I change a task from 'Todo' to 'In Progress' on my iPhone, the card color changes and it looks like it saved, but when I refresh the page it's back to Todo. This has been happening since the update. Works fine on my MacBook."

## Root Cause (revealed after the fix)

The v2.4.0 release replaced the status update fetch call with a new `StatusPicker` component that used `onTouchEnd` instead of `onClick` for mobile compatibility. The touch event handler ran correctly but passed `e.preventDefault()` before the async save call, which on WebKit caused the browser to treat the interaction as cancelled and not fire the form submission that triggered the API call.

**Fix:** Remove `e.preventDefault()` from the `onTouchEnd` handler and use `onClick` for both touch and mouse events (Playwright's `tap()` fires `onClick` on mobile contexts, so the existing test infrastructure remains valid).

## Why this module exists

Production incidents caused by platform-specific behavior (WebKit vs. Chromium, iOS vs. Android, touch vs. mouse events) are among the hardest to catch before release. This module teaches the complete incident response workflow: read the report, identify the environment, write the failing reproduction test, fix the code, confirm the fix, and convert to a permanent regression guard.

## Relevant app details

- The kanban board uses `@dnd-kit` for drag-and-drop and custom `StatusPicker` dropdown components.
- Task status is saved via `PATCH /api/tasks/:id` with body `{ status: 'in-progress' }`.
- The Lumio test database has a seeded "Test Project" with at least 3 tasks in "Todo" state.
- On mobile WebKit, all click interactions must use `tap()` instead of `click()` to correctly simulate touch events.
