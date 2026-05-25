# M44 Hints

## TODO 1 — Assert list reporter

```typescript
expect(configContent).toContain('list');
```

The `list` reporter is Playwright's default. Your `playwright.config.ts` should already have it — or you can explicitly set:
```typescript
reporter: [['list'], ['html']],
```

## TODO 2 — Assert html reporter

```typescript
expect(configContent).toContain('html');
```

Add the html reporter to your config if it's not there:
```typescript
reporter: [
  ['list'],
  ['html', { outputFolder: 'playwright-report', open: 'never' }],
]
```
`open: 'never'` prevents the browser from auto-opening after every run — useful in CI.

## TODO 3 — Assert junit reporter

```typescript
expect(configContent).toContain('junit');
```

Add JUnit to the reporter array:
```typescript
['junit', { outputFile: 'junit-results.xml' }],
```

## TODO 4 — Blob reporter workflow

```typescript
const blobExpected = true;
```

The blob workflow is:
1. Each shard runs: `npx playwright test --shard=1/3 --reporter=blob`
2. Blobs accumulate in `blob-results/` (one `.zip` per shard)
3. After all shards: `npx playwright merge-reports --reporter html ./blob-results`

This produces a single `playwright-report/` as if all tests ran on one machine.

## TODO 5 — GitHub reporter in CI config

```typescript
const hasGithubReporter = configContent.includes('github');
expect(hasGithubReporter).toBe(true);
```

A production config guards the `github` reporter with `process.env.CI`:
```typescript
reporter: process.env.CI
  ? [['github'], ['junit', { outputFile: 'junit-results.xml' }], ['blob']]
  : [['list'], ['html']],
```

This avoids polluting local terminal output with `::error::` annotation syntax.

## TODO 6–9 — Reporter interface lifecycle events

```typescript
const lifecycleEvents = [
  'onBegin',
  'onTestBegin',
  'onTestEnd',
  'onEnd',
];
```

A minimal custom reporter that logs every failure:
```typescript
import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

class FailureLogger implements Reporter {
  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'failed') {
      console.error(`FAILED: ${test.title}`);
    }
  }
}

export default FailureLogger;
```

Register it in `playwright.config.ts`:
```typescript
reporter: [['./failure-logger.ts']],
```

## TODO 10 — Assert Lumio title

```typescript
await expect(page).toHaveTitle(/Lumio/);
```

After this test runs with `--reporter=html`, open the report:
```bash
npx playwright show-report
```

Click the test to see its trace, console output, and any screenshots. This is the primary workflow for investigating failures.

---

## Configuring all reporters at once

```typescript
// playwright.config.ts
reporter: process.env.CI
  ? [
      ['github'],
      ['junit', { outputFile: 'results/junit.xml' }],
      ['blob', { outputDir: 'blob-results' }],
    ]
  : [
      ['list'],
      ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ],
```

This is the standard pattern: lightweight reporters in CI (github + junit + blob for merging), interactive reporters locally (list + html).
