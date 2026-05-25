# M62: CDP Direct Access

## Learning Objectives

- Open a CDP session on a Playwright page and call CDP methods directly
- Collect JavaScript and CSS coverage via CDP on the Lumio dashboard
- Throttle the network to 3G via CDP and measure the LCP impact
- Understand when to reach for CDP instead of Playwright's built-in APIs

## Concept

The Chrome DevTools Protocol (CDP) is the wire protocol that the Chrome DevTools UI uses internally — and that Playwright uses to drive Chromium. Most of the time Playwright wraps CDP calls in high-level APIs (`page.goto()`, `page.evaluate()`, `page.route()`). But for capabilities that Playwright hasn't wrapped yet — or where you need finer control than the wrapper provides — you can open a CDP session and call the protocol directly.

**When CDP is the right tool.**

CDP is an escape hatch. Before reaching for it, check whether Playwright has a built-in API. CDP access is Chromium-only, which breaks cross-browser runs. The common cases where CDP adds genuine value:

- **Coverage data at the protocol level.** `page.coverage` (M29) was the concept; CDP is the mechanism — `Profiler.enable` + `Profiler.startPreciseCoverage` collect per-function JS coverage; `CSS.startRuleUsageTracking` collects CSS rule usage.
- **Network conditions.** CDP's `Network.emulateNetworkConditions` can simulate any combination of bandwidth, latency, and packet loss — more granular than `context.setOffline()`.
- **CDP events not exposed by Playwright.** Raw `Page.frameNavigated` events, `Network.webSocketFrameSent`, low-level JavaScript debugger events.

**Opening a CDP session.**

```typescript
const client = await page.context().newCDPSession(page);
```

`newCDPSession()` returns a `CDPSession` object. You call CDP domains and methods via `client.send(method, params)`:

```typescript
await client.send('Profiler.enable');
await client.send('Profiler.startPreciseCoverage', { callCount: false, detailed: true });

// ...navigate and interact...

const coverage = await client.send('Profiler.takePreciseCoverage');
await client.send('Profiler.stopPreciseCoverage');
await client.send('Profiler.disable');
```

The return value is typed — `coverage.result` is an array of `ScriptCoverage` objects. Each contains `url` (the script origin) and `functions` (coverage per function and range).

**CSS coverage.**

CSS coverage tracks which CSS rules were applied during a page's lifetime — useful for identifying dead CSS that ships to users:

```typescript
await client.send('CSS.enable');
await client.send('CSS.startRuleUsageTracking');

// ...navigate and interact...

const { ruleUsage } = await client.send('CSS.takeCoverageDelta');
await client.send('CSS.stopRuleUsageTracking');
```

`ruleUsage` is an array of `RuleUsage` records with `used: boolean` per rule.

**Network throttling via CDP.**

Playwright's `context.setOffline()` is binary — online or offline. CDP's `Network.emulateNetworkConditions` supports granular throttling:

```typescript
await client.send('Network.enable');
await client.send('Network.emulateNetworkConditions', {
  offline: false,
  downloadThroughput: 375 * 1024 / 8,  // 375 kbps = slow 3G
  uploadThroughput: 125 * 1024 / 8,
  latency: 100,
});
```

This is useful for performance testing under simulated mobile network conditions — throttle to 3G, navigate to the dashboard, collect LCP, assert it stays under budget.

**page.coverage vs CDP coverage.**

M29 introduced `page.coverage.startJSCoverage()` and `stopJSCoverage()` — Playwright's built-in coverage API. Under the hood, this wraps exactly the CDP calls shown above. The Playwright wrapper is simpler; the CDP calls are necessary when you need the raw `Profiler.takePreciseCoverage` output format, or when you're running coverage alongside other CDP domains in the same session without interference.

**CDP is Chromium-only.**

Firefox and WebKit don't implement CDP. If you use `newCDPSession()` in a cross-browser project config, the test will fail on non-Chromium browsers. Guard CDP tests explicitly:

```typescript
test('coverage via CDP', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'CDP is Chromium-only');
  // ...
});
```

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-62-cdp-direct-access
```

## Key Takeaways

1. `page.context().newCDPSession(page)` opens a raw CDP session — Playwright's escape hatch for Chrome DevTools Protocol access.
2. `client.send(method, params)` calls any CDP domain method and returns typed results.
3. `Profiler.startPreciseCoverage` / `takePreciseCoverage` collects JS function coverage directly via CDP.
4. `Network.emulateNetworkConditions` throttles bandwidth and latency — more granular than `setOffline()`.
5. CDP is Chromium-only — always guard with `test.skip(browserName !== 'chromium')`.

## Going Deeper

- [Playwright docs: CDPSession](https://playwright.dev/docs/api/class-cdpsession)
- [Chrome DevTools Protocol: Profiler domain](https://chromedevtools.github.io/devtools-protocol/tot/Profiler/)
- [Chrome DevTools Protocol: Network domain](https://chromedevtools.github.io/devtools-protocol/tot/Network/)
