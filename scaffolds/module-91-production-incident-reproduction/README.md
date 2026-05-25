# M91: Production Incident Reproduction

## Learning Objectives

- Translate a user-facing bug report into a targeted Playwright test
- Use mobile emulation and WebKit to isolate browser/OS-specific bugs
- Write a failing reproduction test before attempting the fix
- Confirm the fix with the same test without modifying the test assertions
- Convert the reproduction test into a permanent regression guard

## Concept

When a production incident occurs, the first engineering task is not to fix it — it's to reproduce it in a controlled environment. A test that reproduces a bug does three things: it confirms you understand the failure mode, it makes the fix verifiable, and it becomes a permanent regression guard so the bug can never silently recur.

**The bug-to-test workflow.**

The workflow for every production incident:

1. **Read the bug report** — understand the user action, the expected outcome, and the observed outcome.
2. **Identify the environment** — browser, OS, viewport, auth state.
3. **Write the reproduction test** — it must fail before the fix.
4. **Fix the bug** — change application code only, not the test.
5. **Confirm the test passes** — the same test that was failing now passes.
6. **Tag the test** — add `@regression` and link to the incident in an annotation.

**The incident: task status update not persisting on mobile WebKit.**

Bug report:
> On iPhone 14 (Safari/WebKit), updating a task status from "Todo" to "In Progress" appears to succeed (the UI updates), but after refreshing the page, the status reverts to "Todo". Reproducible consistently on iOS. Works correctly on Chrome/Android.

What this tells us:
- **Environment:** mobile WebKit (iPhone 14 preset)
- **User action:** change task status via the kanban dropdown
- **Expected:** status persists across page reload
- **Observed:** status reverts after reload
- **Platform-specific:** not reproducible on Chromium

How to write the reproduction test:
1. Use the `iPhone 14` device preset for the browser context
2. Navigate to the task
3. Change the status
4. Reload the page
5. Assert the status is still "In Progress" (this assertion will fail before the fix)

**Why platform-specific bugs are hard to catch.**

Most CI pipelines run on Linux Chromium only for speed. WebKit on mobile emulation is left for nightly runs. Bugs like this slip through because the code path that saves status may use a fetch API or a form submission pattern that behaves differently when Safari's HTTP cache or cookie handling is involved.

**Playwright's role in incident response.**

Playwright is uniquely positioned for this because:
- It can emulate specific devices with realistic viewport, user agent, and touch events
- It can run WebKit on Linux (no macOS required)
- The same test code runs locally and in CI
- Trace Viewer captures the full request/response cycle, including the status save request and its response headers

**Making the test a permanent regression guard.**

After the fix, the reproduction test becomes a regression test. Tag it, annotate it with the incident ID, and move it to the test suite where it belongs (typically the feature's test file). Don't leave it in the reproduction module — it should travel with the feature.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-91-production-incident-reproduction
```

## Key Takeaways

1. Write the reproduction test first — it must fail before the fix to be a valid regression guard.
2. Use mobile device presets and WebKit to isolate platform-specific bugs without needing a real device.
3. The test doesn't change when the fix is applied — only the application code changes.
4. Annotate the reproduction test with the incident ID so future engineers understand why it exists.
5. A test that catches the same bug twice justifies its existence forever.

## Going Deeper

- [Playwright docs: Emulation](https://playwright.dev/docs/emulation)
- [Playwright docs: devices](https://playwright.dev/docs/api/class-playwright#playwright-devices)
- [Playwright docs: Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [Google SRE Book: Incident Management](https://sre.google/sre-book/managing-incidents/)
