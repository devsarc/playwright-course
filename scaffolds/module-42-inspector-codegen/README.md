# M42: Playwright Inspector & Codegen

## Learning Objectives

- Use `npx playwright codegen` to record a browser interaction and generate a test scaffold
- Evaluate the quality of codegen output: when the generated locators are robust and when they are fragile
- Pause a running test mid-execution with `page.pause()` to drop into the Inspector for live debugging
- Use the Inspector's locator picker to generate and verify a locator without running the full test
- Recognize the cases where codegen produces wrong or brittle output and manually correct it

## Concept

Playwright ships with two related interactive tools: `codegen` and the Inspector. Both are built on the same underlying mechanism — they open a real browser with Playwright's overlay UI attached. Understanding both gives you a significant productivity boost, but only if you understand their limitations.

**Codegen.** Running `npx playwright codegen http://localhost:3000` opens a headed browser alongside a code panel. As you interact with the page — clicking, typing, navigating — Playwright generates test code in real time. When you're done, you copy the generated code into a spec file. Codegen is at its best when: the app renders standard semantic HTML, you're recording a linear happy-path flow, and you want a starting scaffold to refine. It is not a replacement for writing tests thoughtfully.

Where codegen fails. Codegen records what you did, not what the test should verify. A recorded click sequence has no assertions. You must add them. More subtly, codegen often generates CSS selectors or XPath when no semantic locator is available — `page.locator('#__next > div:nth-child(2) > button')` will break the moment the DOM structure changes. The discipline from M02–M04 is what lets you evaluate codegen output critically and replace fragile selectors with `getByRole`, `getByLabel`, and `getByTestId`. Codegen is a productivity tool for people who already know how to write tests. For people who don't, it teaches the wrong habits.

**Multi-language codegen.** Codegen supports TypeScript, JavaScript, Python, Java, and C#. The browser control panel has a language selector. All languages use the same locator strategy and assertion style — the concepts transfer. If your team has Python engineers writing Playwright, `npx playwright codegen --target python http://localhost:3000` generates Python test code.

**`page.pause()` and the Inspector.** Add `await page.pause()` anywhere in a test and run it in headed mode or with `PWDEBUG=1`. The test execution pauses and the Inspector opens. From here you can: step through remaining test actions one by one; use the locator picker to click any element and see what Playwright would generate; edit the locator in the Inspector and see which elements it matches in real time; generate assertion code from the "Assertions" panel. This is the fastest way to debug a test mid-execution without adding print statements.

**Locator picker.** The Inspector's locator picker is the most useful part. Clicking an element shows the locator Playwright would use to find it, with a live count of how many elements match. You can edit the locator string and the highlighting updates immediately. This is how you verify a `getByRole` or `getByTestId` matches exactly one element before committing it to the spec file.

**PWDEBUG=1.** Setting the environment variable `PWDEBUG=1` before running tests (e.g., `PWDEBUG=1 npx playwright test`) opens the Inspector at the start of every test. Useful for investigating a failing test without modifying its source code.

This module is placed late in Phase 11 deliberately. Learners who have written 41 modules of tests by hand have a strong mental model of locators and assertions. Codegen now becomes a scaffolding accelerator rather than a crutch. If introduced at M01, it teaches the wrong habits; at M42, it amplifies skills you already have.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Complete each TODO in `exercise.spec.ts` in order.
Run after each TODO in headed mode (Inspector requires a visible browser):
```bash
npx playwright test tests/module-42-inspector-codegen --headed
```

To trigger the Inspector mid-test:
```bash
PWDEBUG=1 npx playwright test tests/module-42-inspector-codegen
```

## Key Takeaways

1. Codegen records interactions, not intent — you must add assertions manually and replace fragile selectors.
2. `page.pause()` in a headed test opens the Inspector mid-execution — the most practical debugging entry point.
3. The Inspector's locator picker shows live match counts — use it to verify a locator before committing it.
4. Codegen output quality depends entirely on the app's use of semantic HTML — it is best in well-structured apps.
5. `PWDEBUG=1` opens the Inspector at every test's start without modifying test source — great for quick investigation.

## Going Deeper

- [Playwright docs: Codegen](https://playwright.dev/docs/codegen-intro)
- [Playwright docs: Inspector](https://playwright.dev/docs/inspector)
- [Playwright docs: Debugging](https://playwright.dev/docs/debug)
