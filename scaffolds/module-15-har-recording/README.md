# M15: HAR Recording & Network Analysis

## Learning Objectives

- Record network traffic to a HAR file with `context.routeFromHAR({ update: true })`
- Replay a HAR file to serve requests without a live server
- Understand what use cases HAR replay is appropriate for
- Know what data HAR files contain and why they shouldn't be committed

## Concept

A HAR (HTTP Archive) file is a JSON snapshot of every network request and response during a browser session — URLs, headers, bodies, timing, cookies, everything.

Playwright can both record HAR files and replay them. Replaying a HAR means serving recorded responses without making real network requests. This is called "mocking from HAR."

### Recording

```typescript
await context.routeFromHAR('./path/to/recording.har', {
  update: true,  // record mode
  url: /your-domain.com/,
});
await page.goto('/');
// Navigate, interact — all requests are captured
// HAR is written when the context closes (end of test)
```

### Replaying

```typescript
await context.routeFromHAR('./path/to/recording.har', {
  update: false,  // replay mode
  url: /your-domain.com/,
});
await page.goto('/');
// Requests matching 'url' are served from the HAR
// Other requests go to the real server
```

### When to use HAR replay

HAR replay is useful when:
- You want to snapshot a third-party API response that changes over time (or that you're billed per call)
- You're doing performance analysis and want consistent network conditions
- You want to test specific server response sequences that are hard to reproduce

For most test suites, `route.fulfill()` (M12) is simpler and more maintainable than HAR replay. HAR replay is best for capturing complex, many-endpoint page loads.

### HAR files and sensitive data

HAR files capture cookies, auth tokens, and request bodies. They can expose:
- Session cookies
- API keys in headers
- Personally identifiable information in form submissions

Always add `.har` files to `.gitignore`. Never commit them to source control.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Run the record test first, then the replay test:
```bash
# Step 1: record
npx playwright test tests/module-15-har-recording -g "record"

# Step 2: replay
npx playwright test tests/module-15-har-recording -g "replay"
```

## Key Takeaways

1. `routeFromHAR({ update: true })` records; `{ update: false }` replays.
2. HAR replay serves recorded responses without hitting the server.
3. Add `*.har` to `.gitignore` — HAR files contain session cookies and other sensitive data.
4. `route.fulfill()` is simpler for most cases; HAR is best for complex multi-resource captures.
5. The `url` pattern in `routeFromHAR` scopes which requests are recorded/replayed.

## Going Deeper

- [Playwright docs: Mock APIs with HAR](https://playwright.dev/docs/mock#record-and-replay-requests)
