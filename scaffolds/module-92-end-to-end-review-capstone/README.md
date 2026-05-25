# M92: End-to-End Review & Capstone

## Learning Objectives

- Combine POM, accessibility, drag-and-drop, multi-user, and performance in one suite
- Use `test.step()` to document sub-actions within a long test
- Write a realistic user journey from signup to active board use
- Debug integration failures that don't appear in isolated module tests

## Concept

The capstone is a synthesis test — it validates that techniques learned
in isolation still work together in a realistic workflow.

**`test.step()` for readable long tests:**
```typescript
test('full journey', async ({ page }) => {
  await test.step('Sign up', async () => { ... });
  await test.step('Create project', async () => { ... });
  await test.step('Add cards', async () => { ... });
});
```
Steps appear in the Trace Viewer timeline and in CI failure messages.
A step failure tells you exactly which phase of the journey broke.

## What you've learned (reorganized module positions)

| Old draft # | New spec # | Technique |
|-------------|------------|-----------|
| M20 | M47 | Page Object Model |
| M21 | M51 | Component Testing Foundations |
| M22 | M26 | Visual Regression Testing |
| M23 | M28 | Accessibility Testing |
| M24 | M23 | Advanced Input & Interactions (drag-drop, keyboard, clipboard) |
| M25 | M22 | File Upload, Download & PDF |
| M26 | M24 | iFrame & Shadow DOM |
| M27 | M32 | WebSocket & SSE Testing |
| M28 | M31 | Multi-Tab & Popup Management |
| M29 | M37 | Offline, PWA & Service Workers |
| M30 | M72 | Electron App Testing |
| M31 | M43 | Tracing & Trace Viewer |
| M32 | M39 | Sharding for Large Suites |
| M33 | M29 | Performance Testing & Measurement |
| M34 | M63 | Localization & i18n Testing |

## Key Takeaways

1. `test.step()` turns a long test into a readable story with named phases.
2. Integration tests surface bugs that unit and isolated tests miss.
3. A capstone with accessibility + performance assertions is a regression safety net.
4. Multi-user collaboration tests require two independent BrowserContexts.

> **Note:** This capstone was written against the draft curriculum (M20–M35 era). It will be revisited and expanded once M36–M91 are complete to cover the full set of techniques taught throughout the course.

## Going Deeper

- [Playwright docs: test.step()](https://playwright.dev/docs/api/class-test#test-step)
- [Playwright docs: Best practices](https://playwright.dev/docs/best-practices)
