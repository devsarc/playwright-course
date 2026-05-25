# M46: test.step() & Runtime Attachments

## Learning Objectives

- Use `test.step()` to group related actions into named steps that appear in the Trace Viewer and HTML report
- Attach files and screenshots to a test report using `testInfo.attach()`
- Add metadata annotations to a test using `testInfo.annotations`
- Access `testInfo` from inside a test via the second argument to the test callback

## Concept

A Playwright test that creates a task, moves it across columns, and assigns a user might have 30+ individual actions. In the Trace Viewer, that's 30 bars in the timeline — and finding the one that failed requires reading every label. `test.step()` solves this by grouping actions under a named heading. The timeline collapses the group, the HTML report renders it as an indented section, and the step name appears in the failure message. The test becomes readable as a document.

**`test.step()`.** The function takes a name and an async callback. Any actions inside the callback are grouped under that name:

```
await test.step('Create task', async () => {
  await page.getByRole('button', { name: 'Add task' }).click();
  await page.getByTestId('task-title-input').fill('My task');
  await page.getByTestId('task-submit').click();
});
```

In the HTML report and Trace Viewer, the three actions collapse into "Create task". If any action inside fails, the step name appears in the error output: `Error in "Create task": locator.click: ...`. This makes failures self-describing even without reading the full stack trace.

Steps nest naturally. A step can contain other `test.step()` calls, creating an indented hierarchy in the report. A common pattern: top-level steps describe the phase ("Login", "Create task", "Verify board state"), nested steps describe sub-actions.

**`testInfo.attach()`.** The `testInfo` object is available as the second argument to the test callback: `test('name', async ({ page }, testInfo) => { ... })`. Its `attach` method adds a named artifact to the HTML report:

```
await testInfo.attach('dashboard screenshot', {
  body: await page.screenshot(),
  contentType: 'image/png',
});
```

After the run, the HTML report shows the attachment inline — clicking the test reveals the attached screenshot. This is useful for capturing state at a specific assertion point rather than relying on the automatic failure screenshot. Common uses: attach the screenshot after a complex form submission to confirm the result, attach a downloaded PDF to verify its content, attach a JSON response to document the data that drove the test.

The `body` field accepts a `Buffer` or `string`. For binary attachments (images, PDFs) use a `Buffer`. For text (JSON, XML, logs) use a `string` with the appropriate `contentType`. The `path` field is an alternative to `body` — point it to a file on disk and Playwright copies it into the report.

**`testInfo.annotations`.** Annotations are metadata tags attached to a specific test run. Unlike the `test.info().annotations` pushed programmatically, the `@`-prefixed annotations in test titles (`test('title @slow', ...)`) are parsed from the title string. Programmatic annotations go through `testInfo.annotations.push()`:

```
testInfo.annotations.push({ type: 'issue', description: 'LUM-1234' });
```

The HTML report displays annotations alongside the test result. Use them to link failing tests to issue tracker tickets, to mark a test as part of a specific feature flag, or to record which environment the test ran in.

**When to use steps.** Not every test needs steps. A test with two actions and one assertion doesn't benefit from grouping. Steps add value when: the test exercises a multi-phase flow (auth → action → verify), the test has enough actions that the trace timeline is hard to read, or the test is read by people who don't write tests (product, QA, support). Write step names from the reader's perspective, not the implementation's: "Create Lumio task" not "click Add task button".

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Complete each TODO in `exercise.spec.ts` in order.
Run and then open the HTML report to see steps and attachments:
```bash
npx playwright test tests/module-46-test-step-attachments --reporter=html
npx playwright show-report
```

## Key Takeaways

1. `test.step()` groups actions under a named heading in the Trace Viewer and HTML report, making failures self-describing.
2. `testInfo.attach()` adds screenshots, files, and text to the HTML report as inline artifacts.
3. `testInfo.annotations.push()` adds metadata (issue links, environment tags) to a test run.
4. `testInfo` is accessed as the second argument to the test callback — `async ({ page }, testInfo)`.
5. Steps nest naturally — use top-level steps for phases, nested steps for sub-actions.

## Going Deeper

- [Playwright docs: test.step()](https://playwright.dev/docs/api/class-test#test-step)
- [Playwright docs: testInfo.attach()](https://playwright.dev/docs/api/class-testinfo#test-info-attach)
- [Playwright docs: Annotations](https://playwright.dev/docs/test-annotations)
