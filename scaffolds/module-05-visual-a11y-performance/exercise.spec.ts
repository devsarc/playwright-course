// Lesson 05: Visual Testing, Accessibility & Performance
// Combines former modules: M25 (Screenshot Testing), M26 (Visual Regression Testing),
// M27 (ARIA Snapshot Testing), M28 (Accessibility Testing), M29 (Performance Testing &
// Measurement), M30 (HAR & DevTools Deep Analysis)
//
// Each Part below is the original module's test.describe block, unchanged
// except TODO numbers are prefixed with the Part number to stay unique in
// this file (a TODO originally numbered N in the M27 module becomes TODO
// 3.N here, matching Part 3's prefix).

import { test, expect } from '../fixtures/fixtures';
import fs, { existsSync, readFileSync } from 'fs';
import path from 'path';
import AxeBuilder from '@axe-core/playwright';

// Ensure the output directory exists before any test runs.
const screenshotsDir = path.join(process.cwd(), 'test-results', 'screenshots');
fs.mkdirSync(screenshotsDir, { recursive: true });

test.describe('Part 1 — Screenshot Testing (formerly M25)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard before each test.
    // Auth is out of scope for this module (see Lesson 03 (formerly M16)). If the app redirects to
    // /login, the screenshot tests will still run — they will capture the login
    // page instead of the dashboard, which is fine for practising the API.
    await page.goto('/dashboard');
  });

  test('full-page screenshot of the dashboard', async ({ page }) => {
    // TODO 1.1: Call page.screenshot() with fullPage: true and a path option.
    // fullPage captures the entire document height, not just the visible viewport.
    // This is important for pages with content below the fold.
    const buffer = await page.screenshot(/* TODO 1.1: {
      fullPage: true,
      path: path.join(screenshotsDir, 'dashboard-full.png'),
    } */);

    // TODO 1.2: Assert the returned buffer is truthy.
    // page.screenshot() always returns a Buffer — asserting it confirms the
    // capture completed without throwing. This is the minimal assertion for
    // documentation screenshots (we are capturing, not comparing).
    expect(/* TODO 1.2: buffer */).toBeTruthy();
  });

  test('viewport-only screenshot of the dashboard', async ({ page }) => {
    // TODO 1.3: Call page.screenshot() WITHOUT fullPage.
    // The default behaviour captures only the visible viewport at the current
    // scroll position. Compare the resulting image size with the full-page PNG.
    const buffer = await page.screenshot(/* TODO 1.3: {
      path: path.join(screenshotsDir, 'dashboard-viewport.png'),
    } */);

    // TODO 1.4: Assert the buffer is truthy.
    // Viewport screenshots are faster than full-page ones and are the right
    // choice when you only care about what is currently visible on screen.
    expect(/* TODO 1.4: buffer */).toBeTruthy();
  });

  test('element-level screenshot of a task card', async ({ page }) => {
    // Locate the first task card on the kanban board.
    const taskCard = page.getByTestId('task-card').first();

    // TODO 1.5: Call locator.screenshot() on taskCard and save the image.
    // locator.screenshot() scrolls the element into view, waits for it to be
    // stable, then captures exactly its bounding box — no surrounding page chrome.
    // This is ideal for component-level documentation.
    const buffer = await taskCard.screenshot(/* TODO 1.5: {
      path: path.join(screenshotsDir, 'task-card.png'),
    } */);

    // TODO 1.6: Assert the buffer has a non-zero byte length.
    // buffer.length > 0 confirms that pixels were actually captured.
    // An empty buffer would indicate the element was invisible or zero-sized.
    expect(/* TODO 1.6: buffer.length */).toBeGreaterThan(0);
  });

  test('clip region — header only', async ({ page }) => {
    // TODO 1.7: Use the clip option to capture just the header region.
    // clip accepts { x, y, width, height } in CSS pixels measured from the
    // top-left corner of the page. This is useful when the region you want
    // does not map cleanly to a single DOM element (e.g. a sticky header
    // that overlaps multiple layout layers).
    const buffer = await page.screenshot(/* TODO 1.7: {
      clip: { x: 0, y: 0, width: 1280, height: 80 },
      path: path.join(screenshotsDir, 'header-clip.png'),
    } */);

    // TODO 1.8: Assert the buffer is truthy.
    // After completing this TODO, open test-results/screenshots/header-clip.png
    // and confirm it shows only the top 80px of the dashboard — the header bar.
    expect(/* TODO 1.8: buffer */).toBeTruthy();
  });
});

test.describe('Part 2 — Visual Regression Testing (formerly M26)', () => {
  test.describe('Visual regression — Lumio landing page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test('full landing page matches baseline', async ({ page }) => {
      // TODO 2.1: Take a full-page screenshot and compare against the baseline.
      // Pass { fullPage: true } to capture content below the fold.
      // Why visual tests? They catch CSS regressions (colour, spacing, layout)
      // that functional assertions miss entirely.
      await expect(page).toHaveScreenshot(/* TODO 2.1: 'landing-full.png', { fullPage: true } */);
    });

    test('hero section matches baseline', async ({ page }) => {
      // TODO 2.2: Capture only the hero section element using toHaveScreenshot on a Locator.
      // Locator: page.getByTestId('hero-section')
      // Scoping to one element prevents false positives from unrelated page changes.
      const hero = page.getByTestId(/* TODO 2.2: 'hero-section' */);
      await expect(hero).toHaveScreenshot(/* TODO 2.2: 'hero-section.png' */);
    });

    test('dark mode landing page matches baseline', async ({ page }) => {
      // TODO 2.3: Enable dark mode by evaluating JS to add the "dark" class to
      // document.documentElement, then take a full-page screenshot.
      // page.evaluate() runs code in the browser context — use it when you need
      // to manipulate the DOM in a way no UI interaction can do.
      await page.evaluate(/* TODO 2.3: () => document.documentElement.classList.add('dark') */);
      await expect(page).toHaveScreenshot(/* TODO 2.3: 'landing-dark.png', { fullPage: true } */);
    });
  });

  test.describe('Visual regression — Kanban board', () => {
    test('empty column state matches baseline', async ({ page }) => {
      await page.goto('/projects/demo/board');
      // TODO 2.4: Find the "done" column (data-testid="kanban-column-done") and
      // take a screenshot of just that column. Name it 'done-column.png'.
      // Element screenshots are more stable than full-page — board layout changes
      // won't break a test that only cares about one column's appearance.
      const doneColumn = page.getByTestId(/* TODO 2.4 */);
      await expect(doneColumn).toHaveScreenshot(/* TODO 2.4: 'done-column.png' */);
    });
  });
});

test.describe('Part 3 — ARIA Snapshot Testing (formerly M27)', () => {
  test.describe('ARIA snapshots — kanban board', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/dashboard');
    });

    test('kanban board has expected heading and list structure', async ({ page }) => {
      // TODO 3.1: Get the kanban board container using getByTestId('kanban-board').
      // We scope the assertion to this element so unrelated page content does not
      // appear in the snapshot and cause false positives.
      const board = page.getByTestId(/* TODO 3.1: 'kanban-board' */);

      // TODO 3.2: Call toMatchAriaSnapshot() with an inline YAML string that
      // asserts the board contains a heading "Kanban Board" and a list of
      // listitems beneath it.
      // ARIA snapshots catch structural regressions — e.g. the heading being
      // demoted from h1 to h2, or the list being replaced with a div — that
      // pixel-level screenshots would never detect.
      await expect(board).toMatchAriaSnapshot(/* TODO 3.2: `
        - heading "Kanban Board" [level=1]
        - list:
          - listitem
          - listitem
          - listitem
      ` */);
    });

    test('each task card exposes role, name, and status to assistive technology', async ({ page }) => {
      // TODO 3.3: Locate the first kanban card with getByTestId('kanban-card').first().
      // Scoping to a single card keeps the snapshot small and focused — the goal
      // is to assert the semantic structure of one card, not the entire board.
      const firstCard = page.getByTestId(/* TODO 3.3: 'kanban-card' */).first();

      // TODO 3.4: Assert that the card's ARIA snapshot contains a listitem with a
      // heading (the task title) and at least one text node for status/priority.
      // If a developer accidentally removes the heading role from the task title,
      // this test will fail even though the card looks identical on screen.
      await expect(firstCard).toMatchAriaSnapshot(/* TODO 3.4: `
        - listitem:
          - heading
          - text: /todo|in.progress|done/i
      ` */);
    });
  });

  test.describe('ARIA snapshots — task creation modal', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/dashboard');
      // Open the task creation modal before each test in this describe block.
      await page.getByRole('button', { name: 'Add task' }).click();
      // Wait for the dialog to be visible in the accessibility tree before asserting.
      await page.getByRole('dialog').waitFor({ state: 'visible' });
    });

    test('"Add task" button is present and named correctly in the ARIA tree', async ({ page }) => {
      // This test navigates before clicking, so we need a fresh page state.
      await page.goto('/dashboard');

      // TODO 3.5: Locate the "Add task" button using getByRole('button', { name: 'Add task' }).
      // Then assert its ARIA snapshot contains exactly one button named "Add task".
      // Role + name assertions like this confirm that the button is correctly
      // labelled for screen readers — a button with no accessible name is useless
      // to assistive technology even if it renders a visible icon or text.
      const addTaskBtn = page.getByRole(/* TODO 3.5: 'button', { name: 'Add task' } */);
      await expect(addTaskBtn).toMatchAriaSnapshot(/* TODO 3.5: `
        - button "Add task"
      ` */);
    });

    test('task creation dialog has the expected modal structure', async ({ page }) => {
      const dialog = page.getByRole('dialog');

      // TODO 3.6: Assert the dialog's ARIA snapshot. The modal should expose:
      //   - A dialog role at the root
      //   - A heading "New task" inside it
      //   - A textbox labelled "Task name"
      //   - A combobox or group labelled "Priority"
      //   - A button "Save task"
      // Modal structure in the accessibility tree is critical for screen reader
      // users: they rely on role="dialog" and aria-modal to know they are in a
      // focused context, and on labelled form controls to fill out the form.
      await expect(dialog).toMatchAriaSnapshot(/* TODO 3.6: `
        - dialog:
          - heading "New task" [level=2]
          - textbox "Task name"
          - combobox "Priority"
          - button "Save task"
      ` */);
    });

    test('closing the modal removes the dialog from the accessibility tree', async ({ page }) => {
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // TODO 3.7: Close the modal by pressing Escape (page.keyboard.press('Escape')).
      // Then assert the dialog is no longer in the accessibility tree using
      // expect(dialog).not.toBeVisible() or expect(dialog).toBeHidden().
      // Focus management and tree cleanup are accessibility requirements — a
      // dialog that disappears visually but remains in the a11y tree confuses
      // screen readers by leaving a ghost element they can still navigate to.
      await page.keyboard.press(/* TODO 3.7: 'Escape' */);
      await expect(dialog).toBeHidden(/* TODO 3.7 */);
    });
  });

  test.describe('Updating ARIA snapshots after intentional UI changes', () => {
    test('demonstrates the --update-snapshots workflow', async ({ page }) => {
      await page.goto('/dashboard');

      // TODO 3.8: This test intentionally shows the update workflow.
      // When you make a deliberate change to Lumio's UI (e.g. renaming the
      // "Add task" button to "Create task"), existing ARIA snapshots will fail.
      // To accept the new structure as the new truth, run:
      //
      //   npx playwright test module-27 --update-snapshots
      //
      // Playwright will rewrite every toMatchAriaSnapshot() call in this file
      // with the current accessibility tree. Review the diff in git before
      // committing — --update-snapshots should always be an intentional action,
      // never a reflex to silence a red test.
      //
      // For now, just assert the "Add task" button exists so the test is runnable.
      const addTaskBtn = page.getByRole('button', { name: 'Add task' });
      await expect(addTaskBtn).toMatchAriaSnapshot(/* TODO 3.8: `
        - button "Add task"
      ` */);
    });
  });
});

test.describe('Part 4 — Accessibility Testing (formerly M28)', () => {
  test.describe('Accessibility — landing page', () => {
    test('landing page has no critical axe violations', async ({ page }) => {
      await page.goto('/');

      // TODO 4.1: Create an AxeBuilder for the page, run the analysis, and
      // destructure { violations } from the result.
      // AxeBuilder is instantiated with ({ page }) — it injects axe-core
      // into the current page and runs all enabled rules.
      const { violations } = await new AxeBuilder(/* TODO 4.1: { page } */).analyze();

      // TODO 4.2: Assert violations is an empty array.
      // Use expect(violations).toEqual([]) — if the assertion fails, Playwright
      // prints the full violations array which tells you exactly what to fix.
      expect(violations).toEqual(/* TODO 4.2: [] */);
    });

    test('landing page passes WCAG 2.1 AA rules only', async ({ page }) => {
      await page.goto('/');

      // TODO 4.3: Run axe with only WCAG 2.1 AA tags.
      // .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']) scopes the scan.
      // Why scope? Best-practice and experimental rules have false-positives;
      // WCAG tags target the rules your legal team actually cares about.
      const { violations } = await new AxeBuilder({ page })
        .withTags(/* TODO 4.3: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] */)
        .analyze();

      expect(violations).toEqual([]);
    });
  });

  test.describe('Accessibility — kanban board', () => {
    test('board page passes WCAG 2.1 AA', async ({ page }) => {
      await page.goto('/projects/demo/board');

      // TODO 4.4: Run a WCAG 2.1 AA scoped axe scan on the board page.
      // Reuse the same pattern from TODO 4.3.
      const { violations } = await /* TODO 4.4 */ Promise.resolve({ violations: [] as unknown[] });

      expect(violations).toEqual([]);
    });

    test('each kanban card is keyboard-focusable', async ({ page }) => {
      await page.goto('/projects/demo/board');

      // TODO 4.5: Press Tab until a kanban card receives focus. Assert that
      // page.getByTestId('kanban-card').first() is focused using
      // expect(locator).toBeFocused().
      // Keyboard navigation tests go beyond axe — they verify interactive flow,
      // not just markup attributes.
      await page.keyboard.press('Tab');
      // TODO 4.5: press Tab enough times to reach the first card, then assert focus
      /* TODO 4.5 */
    });
  });

  test.describe('Accessibility — scoped scan', () => {
    test('pricing section has no violations', async ({ page }) => {
      await page.goto('/');

      // TODO 4.6: Scope the axe scan to only the pricing section using .include().
      // .include('[data-testid="pricing-section"]') limits the scan to that subtree.
      // Scoped scans are faster and surface fewer false positives from unrelated sections.
      const { violations } = await new AxeBuilder({ page })
        .include(/* TODO 4.6: '[data-testid="pricing-section"]' */)
        .analyze();

      expect(violations).toEqual([]);
    });
  });
});

test.describe('Part 5 — Performance Testing & Measurement (formerly M29)', () => {
  test.describe('Page load performance', () => {
    test('landing page DOM content loaded under 3000ms', async ({ page }) => {
      // TODO 5.1: Navigate to / and measure DOMContentLoaded time using
      // the Navigation Timing API via page.evaluate().
      // performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
      // gives the DOMContentLoaded duration in ms.
      await page.goto('/');
      const dcl = await page.evaluate(/* TODO 5.1: () =>
        performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
      */);
      // TODO 5.2: Assert the DOMContentLoaded time is less than 3000ms.
      expect(dcl).toBeLessThan(/* TODO 5.2: 3000 */);
    });

    test('first contentful paint occurs within 2500ms', async ({ page }) => {
      await page.goto('/');

      // TODO 5.3: Use performance.getEntriesByName('first-contentful-paint') to get the FCP entry.
      // It is a PerformancePaintTiming entry — access .startTime for the timestamp.
      // FCP measures when the first text or image is rendered.
      const fcp = await page.evaluate(/* TODO 5.3: () => {
        const entries = performance.getEntriesByName('first-contentful-paint');
        return entries.length > 0 ? entries[0].startTime : -1;
      } */);

      // TODO 5.4: Assert FCP was recorded (not -1) and is under 2500ms.
      expect(fcp).toBeGreaterThan(/* TODO 5.4: 0 */);
      expect(fcp).toBeLessThan(/* TODO 5.4: 2500 */);
    });

    test('board page loads all three columns within 5000ms', async ({ page }) => {
      const start = Date.now();
      await page.goto('/projects/demo/board');

      // TODO 5.5: Wait for all three kanban columns to be visible, then measure
      // the elapsed time since navigation started. Assert it is under 5000ms.
      await Promise.all([
        page.getByTestId('kanban-column-todo').waitFor(),
        page.getByTestId('kanban-column-in-progress').waitFor(),
        page.getByTestId('kanban-column-done').waitFor(),
      ]);
      const elapsed = Date.now() - /* TODO 5.5: start */ 0;
      expect(elapsed).toBeLessThan(/* TODO 5.5: 5000 */);
    });
  });

  test.describe('Interaction performance', () => {
    test('card creation completes within 1000ms', async ({ page }) => {
      await page.goto('/projects/demo/board');

      // TODO 5.6: Measure the time from clicking "Add card" to the new card being visible.
      // Use Date.now() before the action and after the expect resolves.
      // This measures perceived interaction latency from the user's perspective.
      const start = Date.now();
      await page.getByTestId('add-card-button').click();
      await page.getByTestId('new-card-input').fill('Perf test card');
      await page.getByTestId('new-card-input').press('Enter');
      await page.getByTestId('kanban-card').filter({ hasText: 'Perf test card' }).waitFor();
      const duration = Date.now() - /* TODO 5.6: start */;

      expect(duration).toBeLessThan(/* TODO 5.6: 1000 */);
    });

    test('resource sizes are within budget', async ({ page }) => {
      const resourceSizes: number[] = [];

      // TODO 5.7: Listen to 'response' events and record the Content-Length header
      // for all JS responses. Assert no single JS file exceeds 500KB.
      // Why: large bundles block the main thread and delay interactivity.
      page.on('response', async (response) => {
        const contentType = response.headers()['content-type'] ?? '';
        if (contentType.includes('javascript')) {
          const body = await response.body().catch(() => Buffer.alloc(0));
          resourceSizes.push(/* TODO 5.7: body.length */);
        }
      });

      await page.goto('/');

      const MAX_JS_BUNDLE = 500 * 1024; // 500 KB
      for (const size of resourceSizes) {
        expect(size).toBeLessThan(/* TODO 5.7: MAX_JS_BUNDLE */);
      }
    });
  });
});

const HAR_PATH = path.join(process.cwd(), 'test-results', 'dashboard.har');

// Helper: sum all timing values for a HAR entry
function totalDuration(entry: { timings: Record<string, number> }): number {
  return Object.values(entry.timings).reduce((sum, t) => sum + Math.max(t, 0), 0);
}

test.describe('Part 6 — HAR & DevTools Deep Analysis (formerly M30)', () => {
  test.describe('HAR recording — dashboard', () => {
    test('record: capture dashboard network traffic to HAR', async ({ page, context }) => {
      // TODO 6.1: Configure the context to record all requests to a HAR file at HAR_PATH.
      // Use context.routeFromHAR() in update (record) mode.
      // Scope it to localhost so only local requests are captured.
      // Why: we want a full picture of the dashboard's network activity,
      // including the API calls, to analyze in the next test.
      await context.routeFromHAR(/* TODO 6.1: HAR_PATH, { update: true, url: /localhost/ } */);

      await page.goto('/dashboard');
      await page.getByTestId('dashboard-main').waitFor();

      // TODO 6.2: Assert that the HAR file was written to disk after the context closes.
      // The HAR is flushed when the browser context closes (end of test).
      // Use existsSync from 'fs'. Note: the file is written after this test's
      // afterEach teardown, so we assert on the path being defined here and
      // rely on the next test (which runs after context close) for file existence.
      expect(HAR_PATH).toBeTruthy(); /* TODO 6.2: replace with existsSync check in test 2 */
    });
  });

  test.describe('HAR analysis — slowest requests', () => {
    test('slowest: identify the 3 slowest requests in the dashboard HAR', async () => {
      // This test is intentionally not a browser test — it operates purely on file data.
      // No 'page' fixture needed: we read and parse the HAR JSON directly.

      // TODO 6.3: Read and parse the HAR file from HAR_PATH.
      // If the file doesn't exist, the record test above has not been run yet.
      // Use readFileSync + JSON.parse. Access har.log.entries for the request list.
      // Why: HAR is just JSON — you can process it with the same tools you use for any data.
      const harText = readFileSync(/* TODO 6.3: HAR_PATH, 'utf-8' */);
      const har = JSON.parse(/* TODO 6.3: harText */);
      const entries: Array<{
        request: { url: string; method: string; headers: Array<{ name: string; value: string }> };
        timings: Record<string, number>;
      }> = har.log.entries;

      // TODO 6.4: Sort entries by totalDuration() descending and take the top 3.
      // Then assert that all 3 were identified (array length === 3).
      // Why: programmatic sorting mirrors what you'd do manually in DevTools Network tab,
      // but this way the slowest endpoints are surfaced in test output automatically.
      const sorted = [...entries].sort(
        /* TODO 6.4: (a, b) => totalDuration(b) - totalDuration(a) */
      );
      const slowestThree = sorted.slice(/* TODO 6.4: 0, 3 */);

      expect(slowestThree).toHaveLength(/* TODO 6.4: 3 */);

      // Log the slowest requests so the learner can see them in test output
      for (const entry of slowestThree) {
        const total = totalDuration(entry).toFixed(1);
        const ttfb = Math.max(entry.timings.wait ?? 0, 0).toFixed(1);
        console.log(`[slow] ${entry.request.method} ${entry.request.url} — total: ${total}ms, TTFB: ${ttfb}ms`);
      }
    });
  });

  test.describe('CDP throttling — LCP under 3G', () => {
    test('throttle: measure dashboard LCP under simulated 3G network conditions', async ({ page }) => {
      // TODO 6.5: Open a CDP session on the current page context.
      // Use page.context().newCDPSession(page) to get a raw CDP session.
      // Why: CDP throttling is applied at the browser level only — it does not
      // affect the local dev server or test runner, making results reproducible.
      const client = await page.context().newCDPSession(/* TODO 6.5: page */);

      // TODO 6.6: Enable the CDP Network domain and apply 3G throttling conditions.
      // Parameters:
      //   offline: false
      //   downloadThroughput: 750 * 1024 / 8   (750 Kbps in bytes/sec)
      //   uploadThroughput:   250 * 1024 / 8   (250 Kbps in bytes/sec)
      //   latency: 100                          (100ms added round-trip latency)
      // Why these numbers: they match Chrome DevTools' "Slow 3G" preset,
      // giving a realistic baseline for mobile users on poor connections.
      await client.send('Network.enable');
      await client.send('Network.emulateNetworkConditions', /* TODO 6.6: {
        offline: false,
        downloadThroughput: 750 * 1024 / 8,
        uploadThroughput: 250 * 1024 / 8,
        latency: 100,
      } */);

      const start = Date.now();
      await page.goto('/dashboard');
      await page.getByTestId('dashboard-main').waitFor();

      // TODO 6.7: Capture LCP using a PerformanceObserver inside page.evaluate().
      // Wait for the largest-contentful-paint entry and return its startTime.
      // Why: LCP is the most user-visible performance metric — it measures when the
      // largest element in the viewport becomes visible. Under throttling, LCP is
      // dominated by how long the slowest API call (typically /api/tasks) takes.
      const lcp = await page.evaluate(/* TODO 6.7: () =>
        new Promise<number>((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            resolve(entries[entries.length - 1].startTime);
          }).observe({ type: 'largest-contentful-paint', buffered: true });
        })
      */);

      const elapsed = Date.now() - start;
      console.log(`[throttle] Dashboard LCP under 3G: ${lcp}ms (total elapsed: ${elapsed}ms)`);

      // Under 3G, LCP should still complete — we assert it was recorded (> 0)
      // and that the full load finished within a generous 30s budget.
      expect(lcp).toBeGreaterThan(/* TODO 6.7: 0 */);
      expect(elapsed).toBeLessThan(30_000);

      // Clean up: restore normal network conditions before the context closes
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: -1,
        uploadThroughput: -1,
        latency: 0,
      });
    });
  });

  test.describe('curl generation from HAR', () => {
    test('curl: reconstruct a curl command from the first API request in the HAR', async () => {
      // This test also operates on file data — no browser needed.

      const harText = readFileSync(HAR_PATH, 'utf-8');
      const har = JSON.parse(harText);
      const entries: Array<{
        request: {
          url: string;
          method: string;
          headers: Array<{ name: string; value: string }>;
          postData?: { text: string };
        };
        timings: Record<string, number>;
      }> = har.log.entries;

      // TODO 6.8: Find the first entry whose URL contains '/api/' — this is one of
      // Lumio's dashboard API calls. Then build a curl command string from it:
      //   curl -X <METHOD> '<URL>' \
      //     -H '<name>: <value>' \   (for each request header)
      //     [--data '<postData.text>']  (only if the request has a body)
      // Why: Trace Viewer's "Copy as curl" button does exactly this. Building it
      // from HAR data shows you what the button is doing under the hood, and
      // gives you the same capability programmatically in scripts or test output.
      const apiEntry = entries.find(/* TODO 6.8: (e) => e.request.url.includes('/api/') */);
      expect(apiEntry).toBeDefined();

      const { url, method, headers, postData } = apiEntry!.request;

      const headerFlags = headers
        .filter((h) => !['content-length', ':authority', ':method', ':path', ':scheme'].includes(h.name.toLowerCase()))
        .map((h) => `  -H '${h.name}: ${h.value}'`)
        .join(' \\\n');

      const dataFlag = postData?.text ? ` \\\n  --data '${postData.text}'` : '';

      const curlCommand = `curl -X ${method} '${url}' \\\n${headerFlags}${dataFlag}`;

      console.log('[curl]\n' + curlCommand);

      // Assert the generated command contains the essential parts
      expect(curlCommand).toContain(/* TODO 6.8: 'curl -X' */);
      expect(curlCommand).toContain(/* TODO 6.8: '/api/' */);
    });
  });
});
