// Lesson 09: Debugging, Tracing & Reporting
// Combines former modules: M42 (Playwright Inspector & Codegen), M43
// (Tracing & Trace Viewer), M44 (Reporters Deep Dive), M45 (Debugging
// Strategies), M46 (test.step() & Runtime Attachments).
//
// Each Part below is the original module's test.describe block, unchanged
// except TODO numbers are prefixed with the Part number to stay unique in
// this file (a TODO originally numbered N in the M44 module becomes TODO
// 3.N here, matching Part 3's prefix).

import { test, expect } from '../fixtures/fixtures';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

test.describe('Part 1 — Playwright Inspector & Codegen (formerly M42)', () => {
  // M42: Playwright Inspector & Codegen
  //
  // This module is primarily a TOOLING exercise. The tests here are designed to be run
  // with --headed or PWDEBUG=1 so you can observe the Inspector in action.
  //
  // Primary task: run `npx playwright codegen http://localhost:3000` BEFORE starting these
  // exercises. Record a task creation flow and copy the generated code into a text editor.
  // You will evaluate and refine that output as part of this module.

  // Test 1: Demonstrate page.pause() — the Inspector entry point
  test('page.pause() opens the Inspector mid-test', async ({ page }) => {
    await page.goto('/dashboard');

    // TODO 1.1: Add a page.pause() call here to open the Inspector.
    // Why? page.pause() is the fastest way to inspect the page state mid-test
    // without adding console.log statements or modifying assertions.
    // Run this test with --headed to see the Inspector open.
    // IMPORTANT: Remove page.pause() before committing — it will hang in CI.
    // TODO 1.1: await page.pause();

    // After pausing (and then pressing "Resume" in the Inspector), the test continues.
    await expect(page).toHaveURL(/* TODO 1.1: '/dashboard' */);
  });

  // Test 2: Evaluate a codegen-generated locator
  // After running codegen, you likely got a selector like '#kanban-column-header-todo'
  // or a CSS selector. This test shows how to validate a locator with getByRole instead.
  test('kanban column header — replace fragile codegen selector with getByRole', async ({ page }) => {
    await page.goto('/dashboard');

    // Codegen might have generated: page.locator('[data-column="todo"] h2')
    // The correct, resilient version uses getByRole:
    // TODO 1.2: Find the "To Do" column heading using getByRole.
    // Use role 'heading' with the name 'To Do'.
    // Why getByRole over the CSS selector codegen produced? The CSS path breaks when
    // the markup restructures; the role + name stays valid as long as the heading is there.
    const todoHeading = page.getByRole(/* TODO 1.2: 'heading', { name: 'To Do' } */);
    await expect(todoHeading).toBeVisible();
  });

  // Test 3: Use the locator count to verify uniqueness
  // The Inspector shows match counts — this test exercises the same concept in code.
  test('verify a locator matches exactly one element', async ({ page }) => {
    await page.goto('/dashboard');

    // After running the Inspector's locator picker, you get a locator string.
    // Before using it in a real test, always verify it matches exactly one element.
    const addTaskButton = page.getByRole('button', { name: 'Add task' });

    // TODO 1.3: Assert that exactly one 'Add task' button is visible.
    // locator.count() returns the number of matching elements.
    // Why? A locator that matches multiple elements will cause failures in strict mode
    // and may click the wrong element even when strict mode is off.
    const count = await addTaskButton.count();
    expect(count).toBe(/* TODO 1.3: 1 */);
  });

  // Test 4: Evaluate assertion generation from the Inspector
  // The Inspector's "Assertions" panel generates assertions like toHaveText, toBeVisible.
  // This test exercises a complete interaction flow that you would record with codegen.
  test('task creation flow — complete the scaffold from codegen output', async ({ page }) => {
    await page.goto('/dashboard');

    // This is what codegen would generate for a task creation flow.
    // Complete the TODOs with the correct locators (improve on what codegen would produce).

    // TODO 1.4: Click the 'Add task' button using getByRole.
    await page.getByRole(/* TODO 1.4: 'button', { name: 'Add task' } */).click();

    // TODO 1.5: Assert that the task creation dialog is visible.
    await expect(page.getByRole(/* TODO 1.5: 'dialog' */)).toBeVisible();

    // TODO 1.6: Fill the task title input using getByTestId.
    await page.getByTestId(/* TODO 1.6: 'task-title-input' */).fill('Codegen test task');

    // TODO 1.7: Click the submit button and assert the dialog closes.
    await page.getByTestId(/* TODO 1.7: 'task-submit' */).click();
    await expect(page.getByRole(/* TODO 1.7: 'dialog' */)).not.toBeVisible();

    // TODO 1.8: Assert the new task card is visible on the board.
    // Codegen would not generate this — you must add assertions manually.
    await expect(page.getByTestId('task-card').filter({ hasText: /* TODO 1.8: 'Codegen test task' */ '' })).toBeVisible();
  });

});

test.describe('Part 2 — Tracing & Trace Viewer (formerly M43)', () => {
  // M43: Tracing & Trace Viewer
  //
  // The Playwright Trace Viewer records every test action, network request,
  // console log, and snapshot. It is invaluable for debugging CI failures
  // where you cannot run tests interactively.
  //
  // Key APIs:
  //   context.tracing.start()   — begin recording
  //   context.tracing.stop()    — save the trace to a zip file
  //   page.pause()              — pause execution and open the Inspector (dev only)
  //   --headed / --debug flags  — run tests visually in your terminal

  // NOTE: This module focuses on *understanding* trace output.
  // The exercises use manual tracing start/stop to show you how tracing works
  // under the hood — normally you configure this in playwright.config.ts.

  test.describe('Manual tracing', () => {
    test('record a trace for a board interaction', async ({ context, page }) => {
      // TODO 2.1: Start tracing on the context before navigation.
      // Pass { screenshots: true, snapshots: true } to capture DOM and screenshots.
      // screenshots: captures a PNG at each action
      // snapshots: captures DOM state for the "before/after" diff view
      await context.tracing.start(/* TODO 2.1: { screenshots: true, snapshots: true } */);

      await page.goto('/projects/demo/board');
      await page.getByTestId('add-card-button').click();
      await page.getByTestId('new-card-input').fill('Traced card');
      await page.getByTestId('new-card-input').press('Escape');

      // TODO 2.2: Stop the trace and save it to a file.
      // The path is relative to the project root.
      await context.tracing.stop(/* TODO 2.2: { path: 'test-results/traces/board-interaction.zip' } */);

      // The trace file is now viewable with:
      // npx playwright show-trace test-results/traces/board-interaction.zip
    });
  });

  test.describe('Debugging techniques', () => {
    test('console logs are captured in test output', async ({ page }) => {
      // TODO 2.3: Listen for 'console' events and push them to a messages array.
      // page.on('console', msg => messages.push(msg.text())) captures all console.log() calls.
      // This is the correct way to assert on JS console output — not by reading the terminal.
      const messages: string[] = [];
      page.on(/* TODO 2.3: 'console', msg => messages.push(msg.text()) */);

      await page.goto('/projects/demo/board');

      // TODO 2.4: Evaluate JavaScript in the page that calls console.log().
      // Then assert the messages array contains the logged text.
      await page.evaluate(/* TODO 2.4: () => console.log('debug-marker-12345') */);
      expect(messages.some(m => m.includes(/* TODO 2.4: 'debug-marker-12345' */))).toBe(true);
    });

    test('page errors are captured', async ({ page }) => {
      // TODO 2.5: Listen for 'pageerror' events and collect them.
      // 'pageerror' fires when an uncaught JS exception occurs in the page.
      // Asserting no page errors fires is a useful defensive check for any navigation.
      const errors: Error[] = [];
      page.on(/* TODO 2.5: 'pageerror', err => errors.push(err) */);

      await page.goto('/');

      // TODO 2.6: Assert no page errors occurred during the landing page load.
      expect(errors).toHaveLength(/* TODO 2.6: 0 */);
    });

    test('screenshot on failure pattern', async ({ page }) => {
      // TODO 2.7: Take a screenshot and save it when an assertion is about to fail.
      // Use a try/catch around the assertion, take a screenshot in the catch, then re-throw.
      // This is the manual pattern — Playwright auto-screenshot on failure is configured
      // via use: { screenshot: 'only-on-failure' } in playwright.config.ts.
      await page.goto('/projects/demo/board');
      try {
        await expect(page.getByTestId('non-existent-element')).toBeVisible({ timeout: 1000 });
      } catch (err) {
        await page.screenshot(/* TODO 2.7: { path: 'test-results/screenshots/failure-screenshot.png' } */);
        throw err;
      }
    });
  });
});

test.describe('Part 3 — Reporters Deep Dive (formerly M44)', () => {
  // M44: Reporters Deep Dive
  //
  // This module is a mix of configuration inspection and runtime exercises.
  // Several TODOs involve reading playwright.config.ts to verify your changes.
  // The final TODO is a live browser test to confirm the HTML report artifact is produced.

  const configPath = path.resolve(__dirname, '../../playwright.config.ts');

  // Test 1: Verify the config uses an array of reporters
  // A production config uses multiple reporters simultaneously.
  // The reporter key accepts a single string name OR an array of [name, options] tuples.
  test('playwright.config.ts uses an array of reporters', async () => {
    const configContent = readFileSync(configPath, 'utf-8');

    // TODO 3.1: Assert that the config uses the list reporter.
    // Why? list is the standard terminal reporter — all configs should have it.
    expect(configContent).toContain(/* TODO 3.1: 'list' */);

    // TODO 3.2: Assert that the config uses the html reporter.
    // Why? html is the primary debugging artifact for failed test investigation.
    expect(configContent).toContain(/* TODO 3.2: 'html' */);
  });

  // Test 2: JUnit reporter produces machine-readable XML
  // CI systems (Jenkins, CircleCI, GitHub Actions) parse JUnit XML to display test results.
  test('config documents junit reporter for CI', async () => {
    const configContent = readFileSync(configPath, 'utf-8');

    // TODO 3.3: Assert that the config references 'junit'.
    // Why? JUnit is the universal format that CI systems parse natively — no plugins needed.
    expect(configContent).toContain(/* TODO 3.3: 'junit' */);
  });

  // Test 3: Blob reporter for sharded runs
  // Each shard writes a blob; merge-reports combines them into one HTML report.
  test('understands blob reporter purpose', async () => {
    // This test documents the blob reporter workflow through code comments.
    // No assertion needed — read the comments and run the commands in a terminal.

    // Step 1: Run with blob reporter (inside a shard):
    //   npx playwright test --shard=1/3 --reporter=blob
    //
    // Step 2: After all shards complete, merge:
    //   npx playwright merge-reports --reporter html ./blob-results
    //
    // TODO 3.4: Set blobExpected to true once you understand the workflow above.
    // Why? Understanding blob + merge is required for any sharded CI pipeline.
    const blobExpected = /* TODO 3.4: true */ false;
    expect(blobExpected).toBe(true);
  });

  // Test 4: GitHub annotations reporter
  // Outputs ::error:: log lines that GitHub Actions converts to inline PR comments.
  test('github reporter produces PR annotations', async () => {
    const configContent = readFileSync(configPath, 'utf-8');

    // TODO 3.5: Assert that the config references 'github' in the CI reporter array.
    // Why? The github reporter is a no-configuration option for PR comment integration.
    // It only works inside a GitHub Actions environment — add it behind process.env.CI.
    const hasGithubReporter = configContent.includes(/* TODO 3.5: 'github' */ '');
    expect(hasGithubReporter).toBe(true);
  });

  // Test 5: Reporter interface lifecycle events
  // Custom reporters implement: onBegin, onTestBegin, onTestEnd, onEnd.
  test('identifies Reporter interface lifecycle events', async () => {
    // The Reporter interface methods, in order:
    const lifecycleEvents = [
      /* TODO 3.6: 'onBegin' */    '',   // fires once: suite tree available
      /* TODO 3.7: 'onTestBegin' */ '',  // fires before each test
      /* TODO 3.8: 'onTestEnd' */   '',  // fires after each test: result available
      /* TODO 3.9: 'onEnd' */       '',  // fires once: full run complete
    ];

    // A custom reporter only needs to implement the events it cares about.
    // All events are optional — a reporter that only cares about failures
    // would implement onTestEnd and check result.status === 'failed'.
    expect(lifecycleEvents.every(e => typeof e === 'string')).toBe(true);
  });

  // Test 6: Live test — run with HTML reporter and verify output
  test('html reporter output folder exists after a run', async ({ page }) => {
    // The html reporter writes to playwright-report/ by default.
    // Run: npx playwright test tests/module-09-debugging-and-reporting --reporter=html
    // Then open: npx playwright show-report
    await page.goto('/dashboard');

    // TODO 3.10: Assert the page has the title containing 'Lumio'.
    // Why? This confirms a real browser run happened — the HTML report will capture it.
    await expect(page).toHaveTitle(/* TODO 3.10: /Lumio/ */);
  });

});

test.describe('Part 4 — Debugging Strategies (formerly M45)', () => {
  // M45: Debugging Strategies
  //
  // These tests demonstrate the three primary debugging tools:
  // Trace Viewer (post-mortem), page.on('console') (runtime), locator.highlight() (visual).
  //
  // Run with --headed to see highlight() in action:
  //   npx playwright test tests/module-09-debugging-and-reporting --headed

  // Test 1: Capture browser console messages with page.on('console')
  // Console messages from the app's JavaScript runtime are invisible by default.
  // Attaching a listener makes them visible in the terminal during the test run.
  test('page.on console listener captures app messages', async ({ page }) => {
    const messages: string[] = [];

    // TODO 4.1: Attach a console listener that pushes msg.text() into the messages array.
    // Why? React component errors, network failures, and debug logs all appear in the
    // browser console — without a listener, they are invisible during test execution.
    page.on(/* TODO 4.1: 'console', msg => messages.push(msg.text()) */);

    await page.goto('/dashboard');

    // The Lumio dashboard may log initialization messages.
    // We don't assert on specific content — just that the listener was wired correctly.
    // TODO 4.2: Assert that messages is an Array.
    // Why? Confirms the listener was attached correctly — it collected whatever the app logged.
    expect(Array.isArray(/* TODO 4.2: messages */)).toBe(true);
  });

  // Test 2: Filter console messages by type
  // Filtering by type reduces noise — most tests only care about errors.
  test('filter console messages by type', async ({ page }) => {
    const errors: string[] = [];

    // TODO 4.3: Attach a console listener that pushes msg.text() into errors
    // only when msg.type() === 'error'.
    // Why? Filtering to 'error' type lets you assert "the app logged no JS errors"
    // without being drowned in 'log' and 'info' messages.
    page.on('console', msg => {
      if (msg.type() === /* TODO 4.3: 'error' */ '') {
        errors.push(msg.text());
      }
    });

    await page.goto('/dashboard');

    // A healthy page should log no errors during initialization.
    // TODO 4.4: Assert that the errors array has length 0.
    // Why? Zero console errors is a baseline quality signal — fail the test if the
    // app throws JS errors during a normal navigation.
    expect(errors).toHaveLength(/* TODO 4.4: 0 */);
  });

  // Test 3: Use locator.highlight() to visually confirm a locator
  // highlight() draws a bounding box around every matching element.
  // This is a development-only tool — remove before committing.
  test('locator.highlight() confirms selector targets the right element', async ({ page }) => {
    await page.goto('/dashboard');

    const addTaskButton = page.getByRole('button', { name: 'Add task' });

    // TODO 4.5: Call highlight() on addTaskButton.
    // Run this test with --headed to see the bounding box appear in the browser.
    // Why? highlight() lets you visually verify the locator before adding an assertion —
    // it's faster than reading HTML source and more precise than guessing.
    await addTaskButton/* TODO 4.5: .highlight() */;

    // After visual confirmation, proceed with the real assertion.
    await expect(addTaskButton).toBeVisible();
  });

  // Test 4: Use locator.count() to diagnose over-matching
  // A locator that matches multiple elements will fail in strict mode and
  // may act on the wrong element in non-strict mode.
  test('locator.count() identifies how many elements a locator matches', async ({ page }) => {
    await page.goto('/dashboard');

    // The board has three columns, each with an 'Add task' button.
    // A broad locator matches all three; a scoped locator matches one.
    const allAddButtons = page.getByRole('button', { name: 'Add task' });
    const todoColumnButton = page
      .getByTestId('kanban-column-todo')
      .getByRole('button', { name: 'Add task' });

    // TODO 4.6: Assert that allAddButtons.count() equals 3.
    // Why? This confirms the board has three columns — and shows why broad locators
    // are dangerous: clicking allAddButtons.first() is a silent bug.
    const allCount = await allAddButtons.count();
    expect(allCount).toBe(/* TODO 4.6: 3 */);

    // TODO 4.7: Assert that todoColumnButton.count() equals 1.
    // Why? The scoped locator is the correct one — exactly one match, no ambiguity.
    const scopedCount = await todoColumnButton.count();
    expect(scopedCount).toBe(/* TODO 4.7: 1 */);
  });

  // Test 5: Trace Viewer — configure and produce a trace
  // Traces are the primary artifact for diagnosing CI failures.
  test('trace configuration is understood', async ({ page }) => {
    // This test navigates the dashboard and records a trace (when trace: 'on' is set).
    // After the run:
    //   npx playwright show-trace test-results/*/trace.zip
    //
    // In the Trace Viewer:
    //   - Timeline (top): one bar per action
    //   - Snapshot (center): DOM state before/after the selected action
    //   - Network (bottom): requests in-flight during the action
    //   - Console: browser log messages captured at test time
    await page.goto('/dashboard');

    // TODO 4.8: Assert the page URL contains '/dashboard'.
    // Why? This is the action that will appear in the trace timeline — you'll see
    // the goto action, the DOM snapshot, and the navigation request in the network panel.
    await expect(page).toHaveURL(/* TODO 4.8: /\/dashboard/ */);
  });

  // Test 6: Reproduce an intermittent failure using console + count
  // Combines both diagnostic tools to understand a selector + state problem.
  test('combine console listener and count to debug a missing element', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Add task' }).first().click();

    const dialog = page.getByRole('dialog');

    // TODO 4.9: Assert that dialog.count() equals 1.
    // Why? Before asserting visibility, count() confirms the dialog exists in the DOM
    // at all — if count() is 0, it's a timing or selector issue, not a visibility issue.
    const dialogCount = await dialog.count();
    expect(dialogCount).toBe(/* TODO 4.9: 1 */);

    await expect(dialog).toBeVisible();

    // TODO 4.10: Assert that no console errors occurred during the interaction.
    // Why? A dialog that appears but throws JS errors internally is a bug —
    // catching it here prevents a silent regression.
    expect(errors).toHaveLength(/* TODO 4.10: 0 */);
  });

});

test.describe('Part 5 — test.step() & Runtime Attachments (formerly M46)', () => {
  // M46: test.step() & Runtime Attachments
  //
  // Run with html reporter to see steps and attachments in the report:
  //   npx playwright test tests/module-09-debugging-and-reporting --reporter=html
  //   npx playwright show-report

  // Test 1: Use test.step() to group a navigation phase
  // Steps appear as collapsible sections in the Trace Viewer and HTML report.
  test('test.step groups actions into named phases', async ({ page }) => {
    // TODO 5.1: Wrap the navigation in a test.step named 'Navigate to dashboard'.
    // Why? Named steps make the trace timeline readable — instead of seeing
    // 'goto /dashboard', you see the human-readable phase name.
    await test.step(/* TODO 5.1: 'Navigate to dashboard', */ async () => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL('/dashboard');
    });
  });

  // Test 2: Use nested test.step() for a multi-phase flow
  // Top-level steps describe phases; nested steps describe sub-actions.
  test('nested steps describe a task creation flow', async ({ page }) => {
    await test.step('Navigate to dashboard', async () => {
      await page.goto('/dashboard');
    });

    // TODO 5.2: Add a test.step named 'Open task creation dialog'.
    // Inside: click the 'Add task' button and assert the dialog is visible.
    // Why? Grouping the open-dialog actions separately from filling the form
    // makes the HTML report read like a test plan: each step is a distinct intent.
    await test.step(/* TODO 5.2: 'Open task creation dialog', */ async () => {
      await page.getByRole('button', { name: 'Add task' }).first().click();
      await expect(page.getByRole('dialog')).toBeVisible();
    });

    // TODO 5.3: Add a test.step named 'Fill and submit task form'.
    // Inside: fill the title input with 'Step test task' and click submit.
    await test.step(/* TODO 5.3: 'Fill and submit task form', */ async () => {
      await page.getByTestId('task-title-input').fill('Step test task');
      await page.getByTestId('task-submit').click();
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });

    // TODO 5.4: Add a test.step named 'Verify task on board'.
    // Inside: assert the task card with text 'Step test task' is visible.
    await test.step(/* TODO 5.4: 'Verify task on board', */ async () => {
      await expect(
        page.getByTestId('task-card').filter({ hasText: 'Step test task' })
      ).toBeVisible();
    });
  });

  // Test 3: Attach a screenshot to the HTML report
  // testInfo is the second argument to the test callback.
  test('testInfo.attach adds a screenshot to the report', async ({ page }, testInfo) => {
    await page.goto('/dashboard');

    // TODO 5.5: Capture a screenshot of the dashboard using page.screenshot().
    // Store it in a variable named 'screenshot'.
    // Why? Capturing a screenshot at a meaningful moment (after state change, before assertion)
    // gives report readers visual proof of what the test saw.
    const screenshot = await page/* TODO 5.5: .screenshot() */;

    // TODO 5.6: Attach the screenshot to the report using testInfo.attach().
    // Name it 'dashboard state' with contentType 'image/png'.
    // Why? The attachment appears inline in the HTML report — no need to dig through test-results/.
    await testInfo.attach(/* TODO 5.6: 'dashboard state', { body: screenshot, contentType: 'image/png' } */);

    await expect(page).toHaveURL('/dashboard');
  });

  // Test 4: Attach a text artifact (JSON data) to the report
  // Attaching JSON is useful when the test processes data — the report shows the exact data.
  test('testInfo.attach adds text content to the report', async ({ page }, testInfo) => {
    await page.goto('/dashboard');

    const testData = {
      taskTitle: 'Attachment test task',
      column: 'todo',
      timestamp: new Date().toISOString(),
    };

    // TODO 5.7: Attach testData as a JSON string to the report.
    // Name it 'test data', set contentType to 'application/json'.
    // Hint: use JSON.stringify(testData, null, 2) for readable formatting.
    await testInfo.attach(/* TODO 5.7: 'test data', {
      body: JSON.stringify(testData, null, 2),
      contentType: 'application/json',
    } */);

    expect(testData.taskTitle).toBe('Attachment test task');
  });

  // Test 5: Add annotations to link the test to an issue tracker
  // testInfo.annotations.push() adds metadata shown in the HTML report.
  test('testInfo.annotations links test to issue tracker', async ({ page }, testInfo) => {
    // TODO 5.8: Push an annotation with type 'issue' and description 'LUM-1234'.
    // Why? Linking a test to a ticket lets report readers understand why the test exists —
    // especially useful for regression tests that prevent specific bugs from returning.
    testInfo.annotations.push(/* TODO 5.8: { type: 'issue', description: 'LUM-1234' } */);

    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
  });

  // Test 6: Combine steps and attachments in a single test
  // This is the real-world pattern: steps structure the timeline, attachments document key states.
  test('steps and attachments together document a complete flow', async ({ page }, testInfo) => {
    await test.step('Navigate to dashboard', async () => {
      await page.goto('/dashboard');
    });

    await test.step('Create task', async () => {
      await page.getByRole('button', { name: 'Add task' }).first().click();
      await page.getByTestId('task-title-input').fill('Combined test task');
      await page.getByTestId('task-submit').click();
    });

    // TODO 5.9: Inside a test.step named 'Capture board state', take a screenshot
    // and attach it with testInfo.attach() named 'after task creation'.
    // Why? The attached screenshot captures the board state at the critical assertion point —
    // if the test fails tomorrow, the report shows exactly what the board looked like today.
    await test.step(/* TODO 5.9: 'Capture board state', */ async () => {
      const screenshot = await page.screenshot();
      await testInfo.attach('after task creation', {
        body: screenshot,
        contentType: 'image/png',
      });
      await expect(
        page.getByTestId('task-card').filter({ hasText: 'Combined test task' })
      ).toBeVisible();
    });
  });

});
