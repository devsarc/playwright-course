# M15 Hints

## TODO 2 — Navigate to '/'

```typescript
await page.goto('/');
```

With `update: true` set on `routeFromHAR`, all network requests are captured
to `HAR_PATH` during this navigation. The HAR file is written when the context closes.

## TODO 3 — Replay mode url pattern

```typescript
await context.routeFromHAR(HAR_PATH, {
  update: false,
  url: /localhost:3000/,
});
```

In replay mode (`update: false`), requests matching the `url` pattern are served
from the HAR file. Requests that don't match pass through to the server.

If you run the replay test without first running the record test, the HAR file
won't exist and the test will fail. Run the record test first:

```bash
npx playwright test tests/module-15-har-recording/exercise.spec.ts -g "record"
```

Then run the replay test:
```bash
npx playwright test tests/module-15-har-recording/exercise.spec.ts -g "replay"
```
