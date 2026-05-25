# M62 Hints

## TODO 1 — Open a CDP session

```typescript
const client = await page.context().newCDPSession(page);
```

`newCDPSession()` opens a raw Chrome DevTools Protocol session scoped to a specific page. It returns a `CDPSession` object whose only method you'll use is `send(method, params?)`.

## TODO 2 — Assert client type

```typescript
expect(typeof client).toBe('object');
```

## TODO 3 — Enable the Profiler domain

```typescript
await client.send('Profiler.enable');
```

CDP is organized into domains (Network, Profiler, CSS, Page…). Each domain must be enabled before you can call its methods. Failing to enable a domain produces a "Domain not enabled" protocol error.

## TODO 4 — Start precise coverage

```typescript
await client.send('Profiler.startPreciseCoverage', { callCount: false, detailed: true });
```

`detailed: true` gives you per-function coverage ranges (start/end character positions). `callCount: false` skips per-invocation counts — cheaper if you only need used/unused.

## TODO 5 — Take precise coverage

```typescript
const { result } = await client.send('Profiler.takePreciseCoverage');
```

`result` is an array of `ScriptCoverage` objects. Each has a `url` (script origin) and `functions` array with `ranges` showing used vs unused character ranges.

## TODO 6 — Assert result length

```typescript
expect(result.length).toBeGreaterThan(0);
```

## TODO 7 — Start CSS rule usage tracking

```typescript
await client.send('CSS.startRuleUsageTracking');
```

The CSS domain must be enabled first (`CSS.enable`). Usage tracking captures which CSS rules were applied to the DOM during the session.

## TODO 8 — Assert ruleUsage length

```typescript
expect(ruleUsage.length).toBeGreaterThan(0);
```

## TODO 9 — Emulate 3G network conditions

```typescript
await client.send('Network.emulateNetworkConditions', {
  offline: false,
  downloadThroughput: 375 * 1024 / 8,  // 375 kbps
  uploadThroughput: 125 * 1024 / 8,
  latency: 100,
});
```

The throughput values are in bytes per second. 375 kbps / 8 converts kilobits to bytes. These values approximate the "Slow 3G" preset in Chrome DevTools.

## TODO 10 — Assert load time under throttle

```typescript
expect(loadTime).toBeGreaterThan(100);
```

Even the 100ms latency in the emulated conditions will push `domcontentloaded` past 100ms. On a real slow network, expect 2–5 seconds.

## TODO 11 — CDP guard browser name

```typescript
const cdpBrowser = 'chromium';
```

Always guard CDP tests with `test.skip(browserName !== 'chromium', 'CDP is Chromium-only')`. Firefox uses its own DevTools protocol; WebKit uses a different automation interface. Calling `newCDPSession()` on either will throw.
