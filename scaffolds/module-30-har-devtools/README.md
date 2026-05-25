# M30: HAR & DevTools Deep Analysis

## Learning Objectives

- Parse a recorded HAR file programmatically and rank requests by total response time
- Distinguish TTFB (`wait`) from download (`receive`) in HAR timing entries and explain what each implicates
- Simulate controlled network conditions using CDP throttling rather than OS-level tools, and explain why this produces more reproducible results
- Generate a curl command from HAR request data to reproduce an API call outside of any test
- Articulate the difference between a HAR file (network log) and a Playwright trace (full test timeline)

## Concept

HAR stands for HTTP Archive. It is a JSON file with a specific schema, and inside it lives a complete record of every network transaction the browser made during a session. Each entry in the `log.entries` array represents one request-response pair and includes the URL, method, status code, request and response headers, the response body (optionally), and a detailed timing breakdown.

The timing breakdown is where HAR analysis becomes genuinely useful for performance work. Each `timings` object inside an entry carries six fields: `dns` (name resolution time), `connect` (TCP handshake), `ssl` (TLS negotiation), `send` (time to transmit the request), `wait` (time from request sent to first byte received, commonly called TTFB — Time To First Byte), and `receive` (time to download the full response body). The sum of these fields is the total duration for that request.

When you are trying to find performance bottlenecks, the `wait` field is almost always the most meaningful one for API calls. A high `wait` value means the server spent a long time generating the response — that is a backend problem. A high `receive` value on a large payload means the response itself is big — that might be a data-shaping or pagination problem. Sorting HAR entries by total duration and then examining the `wait` vs `receive` split on the slowest three gives you an immediate diagnosis strategy: is this a slow server, or a large payload?

Finding those slowest requests is straightforward once you treat the HAR as data. Load the file with `fs.readFileSync`, parse it as JSON, access `har.log.entries`, sort by the sum of all timing fields, and take the top three. This is exactly the kind of analysis a developer would do manually in the browser's Network tab, but done programmatically it becomes part of your test output and can be asserted against.

Trace Viewer offers a complementary view. When Playwright records a trace, it captures a full timeline of the test: every action, screenshot, console message, and network request. The Network panel inside Trace Viewer shows all requests with their timing waterfall. Crucially, you can right-click any request in Trace Viewer and copy it as a curl command. This lets you step outside the test harness entirely and reproduce the exact API call — same URL, same headers, same cookies — from your terminal or Postman. This is extremely useful when debugging a failing API assertion: you can isolate the HTTP call from everything else. HAR data gives you the same raw material, and exercise 4 shows how to reconstruct a curl command programmatically from HAR entries so you understand exactly what Trace Viewer is doing for you.

HAR and trace are different artifacts that serve different purposes. A HAR file is a network-only log. It tells you nothing about what the test was doing, what assertions ran, or what the page looked like at any given moment. A Playwright trace is a full test recording — it includes network data but also screenshots at every step, the action log, and console output. Use HAR when you want to analyze or replay network traffic. Use traces when you want to understand what happened during a test run.

CDP network throttling deserves special attention because it is substantially better than OS-level throttling (like macOS Network Link Conditioner or `tc` on Linux) for performance testing. OS-level throttling affects all processes on the machine — your test runner, your dev server, your database — which introduces noise and can produce misleading results. CDP throttling is applied at the browser level, inside a single browser context. It simulates the network conditions the browser experiences as if it were on a slow connection, while leaving the local server and test runner unaffected. This means results are reproducible across machines and CI environments. The three parameters — `downloadThroughput`, `uploadThroughput`, and `latency` — map directly to the network presets you see in Chrome DevTools. A simulated 3G connection uses roughly 750 Kbps down, 250 Kbps up, and 100ms of added latency. Establishing this baseline, measuring LCP under it, and comparing against the fast-network baseline is a meaningful regression test pattern.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

**Task 1: Record the HAR**

```bash
npx playwright test tests/module-30-har-devtools -g "record"
```

After this runs, verify `test-results/dashboard.har` exists before proceeding to Task 2.

**Task 2: Identify the three slowest requests**

```bash
npx playwright test tests/module-30-har-devtools -g "slowest"
```

Read the test output to see which endpoints are flagged. You should see the three Lumio API routes near the top.

**Task 3: CDP throttling and LCP**

```bash
npx playwright test tests/module-30-har-devtools -g "throttle"
```

Compare the LCP value reported here against the unthrottled LCP from M29. The delta should be significant.

**Task 4: Generate curl from HAR**

```bash
npx playwright test tests/module-30-har-devtools -g "curl"
```

The generated curl command will be printed to the test output. You can run it directly in your terminal to reproduce the API call.

**Run all four together:**

```bash
npx playwright test tests/module-30-har-devtools/exercise.spec.ts
```

## Key Takeaways

1. Sort HAR entries by total `timings` sum to identify the slowest requests; then split `wait` vs `receive` to diagnose whether the problem is server latency or payload size.
2. CDP throttling (`newCDPSession` + `Network.emulateNetworkConditions`) is reproducible and isolated — it throttles only the browser context, not the dev server.
3. HAR is a network log; a Playwright trace is a full test recording. They complement each other but are not interchangeable.
4. Generating a curl command from HAR data (or from Trace Viewer) lets you reproduce an API call in isolation — the fastest path to narrowing down whether a bug is in the request, the server, or the test.
5. `wait` (TTFB) in HAR timings is the metric most directly under the server's control; `receive` reflects payload size.

## Going Deeper

- [HAR 1.2 specification (softwareishard.com)](http://www.softwareishard.com/blog/har-12-spec/) — the authoritative field-by-field reference for HAR entries and timings
- [Playwright docs: CDP sessions](https://playwright.dev/docs/api/class-cdpsession) — how to open a raw CDP session and send protocol commands
- [Chrome DevTools Protocol: Network domain](https://chromedevtools.github.io/devtools-protocol/tot/Network/#method-emulateNetworkConditions) — the full `Network.emulateNetworkConditions` parameter reference, including preset values for 3G, 4G, and offline
