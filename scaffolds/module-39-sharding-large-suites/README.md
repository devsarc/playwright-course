# M39: Sharding for Large Suites

## Learning Objectives

- Split a test suite across N parallel CI jobs with `--shard=1/4`, `--shard=2/4`, etc.
- Configure a GitHub Actions matrix to run one shard per job
- Use the `blob` reporter to capture per-shard output that can be merged later
- Combine shard results into a single HTML report with `npx playwright merge-reports`
- Understand `fullyParallel` vs sharding: workers parallelize within one machine; sharding distributes across machines

## Concept

**CI config pattern:**
```typescript
retries: process.env.CI ? 2 : 0,
workers: process.env.CI ? 1 : undefined,
reporter: process.env.CI ? [['blob'], ['github']] : [['html']],
```

**Sharding (4 parallel jobs):**
```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - run: npx playwright test --shard=${{ matrix.shard }}/4
```

After all shards complete, merge reports:
```bash
npx playwright merge-reports ./all-blob-reports --reporter html
```

## Key Takeaways

1. Set `retries: 2` in CI — flaky network or timing issues fail tests once, not twice.
2. Use `blob` reporter in CI — it's merge-able across shards.
3. Tag critical-path tests `@smoke` so you can run the fast subset on every push.
4. Publish `playwright-report/` as a GitHub Actions artifact for visual inspection.

> **Note — M39 vs M40:** This module focuses on sharding: splitting suites horizontally across CI machines. M40 (CI/CD Pipeline Setup) covers the full GitHub Actions workflow structure, reporter configuration (github annotations, JUnit, JSON reporters), browser binary caching, artifact upload, Docker container execution, and cloud grid integration. Some of that content currently lives in this module and will be formally moved when M40 is created.

## Going Deeper

- [Playwright docs: CI configuration](https://playwright.dev/docs/ci)
- [Playwright docs: Sharding](https://playwright.dev/docs/test-sharding)
