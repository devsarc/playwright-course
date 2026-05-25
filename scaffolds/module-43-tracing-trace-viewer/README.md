# M43: Tracing & Trace Viewer

## Learning Objectives

- Record traces with `context.tracing.start/stop()` and view them in the Trace Viewer
- Capture console logs with `page.on('console', ...)`
- Catch page errors with `page.on('pageerror', ...)`
- Configure automatic tracing and screenshots in `playwright.config.ts`
- Use `context.tracing.stopChunk()` to capture a trace snapshot mid-test without stopping the full trace
- Navigate all Trace Viewer tabs: action list, console, network, filmstrip, inspector (ARIA snapshots), annotations, attachments, log
- Generate a curl command from the Trace Viewer network tab to reproduce an API call outside Playwright
- Use the live Trace Viewer (`--ui` mode) during development to inspect tests as they run

## Concept

The Trace Viewer is Playwright's most powerful debugging tool. A trace zip
contains screenshots, DOM snapshots, network logs, and a timeline — everything
you need to understand why a test failed in CI without re-running it.

**Recommended config for CI:**
```typescript
use: {
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```

**View a trace locally:**
```bash
npx playwright show-trace test-results/traces/trace.zip
# or open https://trace.playwright.dev and drag the zip
```

## Key Takeaways

1. Configure tracing in `playwright.config.ts` — don't add `tracing.start()` to every test.
2. `page.on('console', ...)` is the right way to capture JS console output.
3. `page.on('pageerror', ...)` catches uncaught JS exceptions — run it on every navigation.
4. `--ui` mode is the fastest way to debug interactively during development.
5. Debugging strategies (console/pageerror listeners, `locator.highlight()`, `locator.count()` for selector verification) are covered in M45 (Debugging Strategies). M43 focuses on the tracing infrastructure and Trace Viewer navigation.

## Going Deeper

- [Playwright docs: Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [Playwright docs: Debugging](https://playwright.dev/docs/debug)
