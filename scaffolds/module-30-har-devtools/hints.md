# M30 Hints

## TODO 1 — Record dashboard HAR

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

## TODO 2 — Verify the HAR file exists

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

## TODO 3 — Read and parse the HAR file

```typescript
const harText = readFileSync(HAR_PATH, 'utf-8');
const har = JSON.parse(harText);
const entries = har.log.entries;
```

`har.log.entries` is the array of request-response pairs. Each entry has:
- `entry.request.url`, `entry.request.method`, `entry.request.headers`
- `entry.response.status`, `entry.response.headers`
- `entry.timings` — the timing breakdown object

## TODO 4 — Sort and slice the three slowest requests

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

## TODO 5 — Open a CDP session

```typescript
const client = await page.context().newCDPSession(page);
```

`newCDPSession` returns a `CDPSession` — a raw Chrome DevTools Protocol
connection to the page. You can send any CDP command with `client.send()`.
The session is automatically closed when the page or context closes.

## TODO 6 — Apply 3G throttling via CDP

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

## TODO 7 — Capture LCP with PerformanceObserver

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

## TODO 8 — Build a curl command from a HAR entry

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

## Comparing HAR and Playwright traces

| | HAR | Playwright Trace |
|---|---|---|
| Contents | Network requests only | Network + screenshots + actions + console |
| Format | JSON (`.har`) | ZIP archive (`.zip`) |
| Written by | `routeFromHAR({ update: true })` | `context.tracing.start/stop()` |
| Viewed with | Any JSON viewer, HAR Explorer | `npx playwright show-trace` |
| Best for | Network analysis, curl generation | Debugging test failures |

Use HAR when you care about network data. Use traces when you need the full
picture of what happened during a test run.
