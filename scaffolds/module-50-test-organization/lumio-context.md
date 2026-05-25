# Lumio Context: M50

## What's in Lumio at this point

By M50, 49 modules of Lumio tests exist. This module introduces the organizational layer — how to make those 49+ modules navigable and selectively runnable.

## Recommended tag assignments for existing Lumio tests

| Module | Suggested tags |
|--------|---------------|
| M02 — Login | `@smoke @regression` |
| M03 — Navigation | `@smoke @regression` |
| M20 — Form automation | `@regression` |
| M25 — Screenshot testing | `@visual` |
| M26 — Visual regression | `@visual` |
| M27 — ARIA snapshots | `@accessibility` |
| M28 — Accessibility | `@accessibility` |
| M33 — User journeys | `@e2e` |
| M34 — Cross-browser | `@regression` |

## Smoke suite for Lumio

The smoke suite should cover: can a user log in, does the dashboard load, can a task be created, does the task appear on the board. These four checks represent the minimum viable Lumio — if any of them fail, the app is not deployable.

## test.fixme() in this project

Known issues worth tracking with `fixme()` rather than deletion:
- Any tests for drag-and-drop (M23) — flaky due to pointer event timing
- Tests for the Electron app (M72) — only relevant when Electron build is present
- Visual regression tests (M26) — only valid after baselines are established

Add the fixme with a comment explaining when to remove it.
