# Lesson 05 Hints

## Part 1 — Screenshot Testing (formerly M25)

### TODO 1.1 — full-page screenshot with path

```typescript
const buffer = await page.screenshot({
  fullPage: true,
  path: path.join(screenshotsDir, 'dashboard-full.png'),
});
```

### TODO 1.2 — assert buffer is truthy

```typescript
expect(buffer).toBeTruthy();
```

### TODO 1.3 — viewport-only screenshot with path

```typescript
const buffer = await page.screenshot({
  path: path.join(screenshotsDir, 'dashboard-viewport.png'),
});
```

### TODO 1.4 — assert buffer is truthy

```typescript
expect(buffer).toBeTruthy();
```

### TODO 1.5 — element-level screenshot

```typescript
const buffer = await taskCard.screenshot({
  path: path.join(screenshotsDir, 'task-card.png'),
});
```

### TODO 1.6 — assert buffer byte length

```typescript
expect(buffer.length).toBeGreaterThan(0);
```

### TODO 1.7 — clip region

```typescript
const buffer = await page.screenshot({
  clip: { x: 0, y: 0, width: 1280, height: 80 },
  path: path.join(screenshotsDir, 'header-clip.png'),
});
```

### TODO 1.8 — assert buffer is truthy

```typescript
expect(buffer).toBeTruthy();
```

### Bonus: JPEG format with quality

To produce a smaller file, use `type: 'jpeg'` and set a `quality` value:

```typescript
const buffer = await page.screenshot({
  clip: { x: 0, y: 0, width: 1280, height: 80 },
  path: path.join(screenshotsDir, 'header-clip.jpg'),
  type: 'jpeg',
  quality: 80,
});
expect(buffer).toBeTruthy();
```

Compare the file sizes of `header-clip.png` and `header-clip.jpg` — JPEG is
typically 3–10× smaller for photographic content.

### Bonus: automatic screenshots on failure

Add this to the `use` block in `playwright.config.ts` to capture a screenshot
whenever a test fails:

```typescript
use: {
  screenshot: 'only-on-failure',
},
```

Playwright saves the image to `test-results/` and attaches it to the HTML
report automatically — no manual `page.screenshot()` call needed.

### Bonus: PDF export (Chromium only)

```typescript
await page.pdf({
  path: path.join(screenshotsDir, 'dashboard.pdf'),
  format: 'A4',
  printBackground: true,
});
```

Note: `page.pdf()` throws in Firefox and WebKit. Only use it in Chromium
projects or guard it with `test.skip(browserName !== 'chromium', '...')`.

## Part 2 — Visual Regression Testing (formerly M26)

### TODO 2.1 — full-page screenshot

```typescript
await expect(page).toHaveScreenshot('landing-full.png', { fullPage: true });
```

### TODO 2.2 — element screenshot

```typescript
const hero = page.getByTestId('hero-section');
await expect(hero).toHaveScreenshot('hero-section.png');
```

### TODO 2.3 — dark mode screenshot

```typescript
await page.evaluate(() => document.documentElement.classList.add('dark'));
await expect(page).toHaveScreenshot('landing-dark.png', { fullPage: true });
```

### TODO 2.4 — column screenshot

```typescript
const doneColumn = page.getByTestId('kanban-column-done');
await expect(doneColumn).toHaveScreenshot('done-column.png');
```

### Updating baselines

When you intentionally change the UI, update baselines with:

```bash
npx playwright test module-22 --update-snapshots
```

### Threshold tuning

To allow minor rendering differences (anti-aliasing, font hinting):

```typescript
await expect(page).toHaveScreenshot('name.png', { maxDiffPixelRatio: 0.01 });
```

## Part 3 — ARIA Snapshot Testing (formerly M27)

### TODO 3.1 — locate the kanban board container

```typescript
const board = page.getByTestId('kanban-board');
```

### TODO 3.2 — assert the board's heading and list structure

```typescript
await expect(board).toMatchAriaSnapshot(`
  - heading "Kanban Board" [level=1]
  - list:
    - listitem
    - listitem
    - listitem
`);
```

If you are unsure of the exact YAML, run the test once with `--update-snapshots`
and Playwright will generate the string for you. Then paste it back in and
remove the flag.

```bash
npx playwright test module-27 --update-snapshots
```

### TODO 3.3 — locate the first task card

```typescript
const firstCard = page.getByTestId('kanban-card').first();
```

### TODO 3.4 — assert the card's semantic structure

```typescript
await expect(firstCard).toMatchAriaSnapshot(`
  - listitem:
    - heading
    - text: /todo|in.progress|done/i
`);
```

The regex `/todo|in.progress|done/i` matches any of the three status strings.
Use a regex when the exact text may vary so the snapshot is not brittle.

### TODO 3.5 — locate and assert the "Add task" button

```typescript
const addTaskBtn = page.getByRole('button', { name: 'Add task' });
await expect(addTaskBtn).toMatchAriaSnapshot(`
  - button "Add task"
`);
```

### TODO 3.6 — assert the full dialog structure

```typescript
await expect(dialog).toMatchAriaSnapshot(`
  - dialog:
    - heading "New task" [level=2]
    - textbox "Task name"
    - combobox "Priority"
    - button "Save task"
`);
```

If the actual modal has more elements (e.g. a close button, description text),
add them to the YAML. Use `--update-snapshots` to capture the real structure
and trim it down to the parts that matter for your assertion.

### TODO 3.7 — close the modal and assert it is gone

```typescript
await page.keyboard.press('Escape');
await expect(dialog).toBeHidden();
```

`toBeHidden()` checks that the element is either not in the DOM or has
`visibility: hidden` / `display: none`. Either way it is no longer accessible
to assistive technology.

### TODO 3.8 — the --update-snapshots workflow

When you change the UI intentionally, run:

```bash
npx playwright test module-27 --update-snapshots
```

Playwright rewrites every `toMatchAriaSnapshot()` call with the current
accessibility tree. Always review the git diff before committing — you are
approving a new semantic contract for the component.

### Generating the initial YAML with Trace Viewer

1. Run the test without any expected string: `await expect(locator).toMatchAriaSnapshot('')`
2. The test will fail and print the actual ARIA tree in the error output.
3. Alternatively, open the Trace Viewer after a run and use the **Inspector tab**
   → select the locator → copy the ARIA snapshot YAML from the panel.
4. Paste the YAML back into the test as the expected string and remove `--update-snapshots`.

### Reading ARIA snapshot YAML

Each line is an accessibility node. The indentation represents parent–child
relationships. Key tokens:

| Token | Meaning |
|-------|---------|
| `- role "name"` | Node with explicit accessible name |
| `- role [level=N]` | Heading level (1–6) |
| `- text: /regex/` | Text node matched by regex |
| `- text: "exact"` | Text node with exact content |
| `- role: ...` | Node with children on subsequent indented lines |

## Part 4 — Accessibility Testing (formerly M28)

### TODO 4.1 — AxeBuilder instantiation

```typescript
const { violations } = await new AxeBuilder({ page }).analyze();
```

### TODO 4.2 — assert no violations

```typescript
expect(violations).toEqual([]);
```

### TODO 4.3 — WCAG 2.1 AA tags

```typescript
const { violations } = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  .analyze();
```

### TODO 4.4 — board page scan

```typescript
const { violations } = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  .analyze();
```

### TODO 4.5 — keyboard focus

```typescript
// Tab through navigation links until you reach the first card
for (let i = 0; i < 10; i++) {
  await page.keyboard.press('Tab');
  const focused = await page.getByTestId('kanban-card').first().evaluate(
    el => el === document.activeElement
  );
  if (focused) break;
}
await expect(page.getByTestId('kanban-card').first()).toBeFocused();
```

### TODO 4.6 — scoped include

```typescript
const { violations } = await new AxeBuilder({ page })
  .include('[data-testid="pricing-section"]')
  .analyze();
```

### Reading violation output

When `expect(violations).toEqual([])` fails, Playwright prints each violation:

```json
[{
  "id": "color-contrast",
  "impact": "serious",
  "nodes": [{ "html": "<p class=\"text-gray-400\">..." }]
}]
```

Fix the element, re-run, repeat.

## Part 5 — Performance Testing & Measurement (formerly M29)

### TODO 5.1 — Navigation Timing

```typescript
const dcl = await page.evaluate(() =>
  performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
);
```

### TODO 5.2 — DCL budget assertion

```typescript
expect(dcl).toBeLessThan(3000);
```

### TODO 5.3 — First Contentful Paint

```typescript
const fcp = await page.evaluate(() => {
  const entries = performance.getEntriesByName('first-contentful-paint');
  return entries.length > 0 ? entries[0].startTime : -1;
});
```

### TODO 5.4 — FCP assertion

```typescript
expect(fcp).toBeGreaterThan(0);
expect(fcp).toBeLessThan(2500);
```

### TODO 5.5 — board load timing

```typescript
const elapsed = Date.now() - start;
expect(elapsed).toBeLessThan(5000);
```

### TODO 5.6 — card creation latency

```typescript
const duration = Date.now() - start;
expect(duration).toBeLessThan(1000);
```

### TODO 5.7 — resource size budget

```typescript
page.on('response', async (response) => {
  const contentType = response.headers()['content-type'] ?? '';
  if (contentType.includes('javascript')) {
    const body = await response.body().catch(() => Buffer.alloc(0));
    resourceSizes.push(body.length);
  }
});
// ...
for (const size of resourceSizes) {
  expect(size).toBeLessThan(MAX_JS_BUNDLE);
}
```

### Performance testing limitations

These tests measure performance on the test runner machine — not production.
Use them as regression guards ("did we introduce a 2x slowdown?") rather
than as absolute performance benchmarks.

## Part 6 — HAR & DevTools Deep Analysis (formerly M30)

### TODO 6.1 — Record dashboard HAR

```typescript
await context.routeFromHAR(HAR_PATH, {
  update: true,   // record mode: capture and write all requests
  url: /localhost/,
});
```

`update: true` puts `routeFromHAR` into record mode. Every request matching
the `url` pattern is intercepted, forwarded to the real server, and written to
`HAR_PATH` when the context closes (end of the test). The file is not written
until the context's `close()` event fires, which happens in afterEach teardown.

### TODO 6.2 — Verify the HAR file exists

Because the HAR is written on context close (afterEach teardown), you cannot
`existsSync` inside the same test that records. Verify in a subsequent test or
in a `test.afterAll`:

```typescript
// Option A: separate test that runs after the record test
test('har file was written', () => {
  expect(existsSync(HAR_PATH)).toBe(true);
});

// Option B: test.afterAll in the same describe block
test.afterAll(() => {
  expect(existsSync(HAR_PATH)).toBe(true);
});
```

### TODO 6.3 — Read and parse the HAR file

```typescript
const harText = readFileSync(HAR_PATH, 'utf-8');
const har = JSON.parse(harText);
const entries = har.log.entries;
```

`har.log.entries` is the array of request-response pairs. Each entry has:
- `entry.request.url`, `entry.request.method`, `entry.request.headers`
- `entry.response.status`, `entry.response.headers`
- `entry.timings` — the timing breakdown object

### TODO 6.4 — Sort and slice the three slowest requests

```typescript
const sorted = [...entries].sort(
  (a, b) => totalDuration(b) - totalDuration(a)
);
const slowestThree = sorted.slice(0, 3);

expect(slowestThree).toHaveLength(3);
```

The `totalDuration` helper (defined at the top of the spec) sums all timing
fields, clamping negative values to 0. HAR timing fields use `-1` to indicate
"not applicable" (e.g., `dns: -1` for a cached DNS lookup), so the `Math.max`
guard prevents negative values from distorting the total.

To see the TTFB vs download split for a specific entry:
```typescript
const ttfb = Math.max(entry.timings.wait ?? 0, 0);
const download = Math.max(entry.timings.receive ?? 0, 0);
// If ttfb >> download: server is slow
// If download >> ttfb: large response body
```

### TODO 6.5 — Open a CDP session

```typescript
const client = await page.context().newCDPSession(page);
```

`newCDPSession` returns a `CDPSession` — a raw Chrome DevTools Protocol
connection to the page. You can send any CDP command with `client.send()`.
The session is automatically closed when the page or context closes.

### TODO 6.6 — Apply 3G throttling via CDP

```typescript
await client.send('Network.enable');
await client.send('Network.emulateNetworkConditions', {
  offline: false,
  downloadThroughput: 750 * 1024 / 8,   // 750 Kbps → bytes/sec
  uploadThroughput: 250 * 1024 / 8,     // 250 Kbps → bytes/sec
  latency: 100,                          // ms of added round-trip latency
});
```

`Network.enable` must be called before `emulateNetworkConditions`. The
throughput values are in **bytes per second** — Chrome DevTools shows Kbps, so
divide by 8 to convert. These match Chrome's built-in "Slow 3G" preset.

To restore normal (unthrottled) conditions at the end of the test:
```typescript
await client.send('Network.emulateNetworkConditions', {
  offline: false,
  downloadThroughput: -1,  // -1 = no limit
  uploadThroughput: -1,
  latency: 0,
});
```

### TODO 6.7 — Capture LCP with PerformanceObserver

```typescript
const lcp = await page.evaluate(() =>
  new Promise<number>((resolve) => {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      resolve(entries[entries.length - 1].startTime);
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  })
);
```

`buffered: true` means the observer will fire for LCP entries that already
occurred before the observer was registered. LCP entries can be emitted multiple
times as the browser discovers larger elements — the last one is the final LCP
value. Under 3G throttling, expect LCP to be significantly higher than on a fast
connection.

### TODO 6.8 — Build a curl command from a HAR entry

```typescript
const apiEntry = entries.find((e) => e.request.url.includes('/api/'));
expect(apiEntry).toBeDefined();

const { url, method, headers, postData } = apiEntry!.request;

const headerFlags = headers
  .filter((h) => !['content-length', ':authority', ':method', ':path', ':scheme']
    .includes(h.name.toLowerCase()))
  .map((h) => `  -H '${h.name}: ${h.value}'`)
  .join(' \\\n');

const dataFlag = postData?.text ? ` \\\n  --data '${postData.text}'` : '';

const curlCommand = `curl -X ${method} '${url}' \\\n${headerFlags}${dataFlag}`;

expect(curlCommand).toContain('curl -X');
expect(curlCommand).toContain('/api/');
```

The headers filter strips HTTP/2 pseudo-headers (`:authority`, `:method`, etc.)
and `content-length` because curl computes these automatically. The resulting
command is copy-pasteable into a terminal and will reproduce the exact API call
with the same cookies and auth headers that Playwright used.

### Comparing HAR and Playwright traces

| | HAR | Playwright Trace |
|---|---|---|
| Contents | Network requests only | Network + screenshots + actions + console |
| Format | JSON (`.har`) | ZIP archive (`.zip`) |
| Written by | `routeFromHAR({ update: true })` | `context.tracing.start/stop()` |
| Viewed with | Any JSON viewer, HAR Explorer | `npx playwright show-trace` |
| Best for | Network analysis, curl generation | Debugging test failures |

Use HAR when you care about network data. Use traces when you need the full
picture of what happened during a test run.
