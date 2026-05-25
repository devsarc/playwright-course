# M23: Advanced Input & Interactions

## Learning Objectives

- Use `locator.dragTo()` for mouse-event DnD libraries
- Use `page.dragAndDrop()` for HTML5 drag API libraries
- Pass `{ steps: N }` for libraries needing intermediate mousemove events
- Use `page.mouse` for full manual control when high-level APIs fail
- Use `page.keyboard.press()`, `keyboard.down()`, `keyboard.up()`, and `keyboard.type()` for complex key sequences
- Read and write clipboard content via `page.evaluate(() => navigator.clipboard.readText())`
- Dispatch touch events for mobile interaction testing: `page.touchscreen.tap(x, y)`
- Assert tooltip visibility: hover over an element and verify the tooltip locator `toBeVisible()`

## Concept

This module covers all "complex input" patterns that go beyond standard `click()` and `fill()`: drag-and-drop, keyboard sequences, clipboard access, touch, and hover states. They share a common challenge — the browser's default event handling is bypassed by synthetic dispatch, so you must use the right API level for each library.

| Library | Event model | Playwright API |
|---------|-------------|----------------|
| @hello-pangea/dnd | mouse events | `locator.dragTo()` |
| SortableJS (default) | HTML5 drag API | `page.dragAndDrop()` |
| Custom | mixed | `page.mouse` |

> **M03 vs M23:** M03 introduced `dragTo()` as the high-level drag API for simple cases. M23 covers `page.mouse` as the low-level escape hatch for libraries (like dnd-kit) that ignore synthetic drag events and require real `mousedown → mousemove → mouseup` sequences.

## Key Takeaways

1. Read card text **before** dragging — the locator may point elsewhere after the drop.
2. `{ steps: 20 }` fires intermediate mousemove events — fixes most "drag ignores drop" issues.
3. Always assert card position **after** the drop, not during.
4. `page.mouse` is the escape hatch when all high-level APIs fail.

## Going Deeper

- [Playwright docs: dragTo](https://playwright.dev/docs/api/class-locator#locator-drag-to)
