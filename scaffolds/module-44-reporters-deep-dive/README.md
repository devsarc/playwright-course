# M44: Reporters Deep Dive

## Learning Objectives

- Configure multiple reporters simultaneously in `playwright.config.ts` and understand what each produces
- Distinguish between interactive reporters (HTML, dot, line) and machine-readable reporters (JUnit, JSON, GitHub annotations)
- Understand how blob reports support sharded test runs and how `createMergedReport` combines them
- Recognize what the Reporter interface looks like and what lifecycle events a custom reporter would handle

## Concept

Every Playwright test run produces output. By default you see the `list` reporter — a stream of pass/fail lines to the terminal. But that's the minimum viable option. Playwright ships with eight built-in reporters and a public `Reporter` interface for writing your own. Understanding which reporters to use in which context, and how to combine them, is what separates a professional CI pipeline from a fragile one.

**The built-in reporters.** The `dot` reporter prints one character per test — useful for dense output at scale. The `line` reporter overwrites the current terminal line to show progress without flooding the scroll buffer. The `list` reporter (the default) prints a line per test as it completes. These three are terminal-oriented and produce nothing you can read after the run.

The `html` reporter generates a full interactive report in `playwright-report/index.html`. It records pass/fail status, test duration, console output, and attached screenshots. If a test fails, the HTML report links directly to the trace file for that test. Run `npx playwright show-report` to open it after a run. The HTML report is the primary debugging artifact for local development and for async review by teammates.

The `json` reporter writes `test-results.json` — a machine-readable representation of every test, suite, and result. CI pipelines parse this file to extract metrics, track flakiness rates, or feed custom dashboards. The structure mirrors the suite tree exactly.

The `junit` reporter writes `junit-results.xml`. Jenkins, CircleCI, GitHub Actions, and most CI systems can consume JUnit XML natively — they parse it to display test results inline in pull request checks without any additional tooling.

The `github` reporter outputs GitHub Actions annotations. When running inside a GitHub Actions workflow, it writes `::error file=...::` log lines that GitHub converts into inline PR comments on the relevant source file. It requires no configuration beyond listing it as a reporter.

**Combining reporters.** The `reporter` key in `playwright.config.ts` accepts an array of `[name, options]` tuples. A production configuration might run the `list` reporter for terminal feedback, `html` for local debugging, and `junit` for CI parsing simultaneously. Each reporter runs independently against the same result stream.

```
reporter: [
  ['list'],
  ['html', { outputFolder: 'playwright-report' }],
  ['junit', { outputFile: 'junit-results.xml' }],
  ['github'],
]
```

**Blob reporter and sharded runs.** When tests are split across multiple machines using `--shard`, each machine has only a partial view of the results. The `blob` reporter serializes one machine's output to a binary `.zip` file. After all shards complete, `npx playwright merge-reports --reporter html ./blob-results` reads every blob, merges them, and produces a single unified HTML report as if all tests had run on one machine. This is the standard pattern for large parallel CI pipelines.

**The Reporter interface.** Playwright's custom reporter API is built on lifecycle events: `onBegin` fires when the run starts (receives the full test suite tree), `onTestBegin` fires before each test, `onTestEnd` fires after each test (receives the result), and `onEnd` fires after all tests complete. A custom reporter implements whichever events it cares about and writes to whatever output it needs — a database, a Slack webhook, a custom file format. The Playwright source exports the `Reporter` interface from `@playwright/test/reporter`, and the built-in reporters implement it. Understanding this interface helps you evaluate third-party reporters and decide when to build your own.

**When to write a custom reporter.** Most teams never need one. The built-in reporters cover: human review (HTML), CI parsing (JUnit), metrics (JSON), and PR comments (GitHub). Write a custom reporter only when you need an output that none of the built-ins produce — for example, writing results to your internal observability platform, or streaming test events to a real-time dashboard during a long run.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Complete each TODO in `exercise.spec.ts` in order.
Run with the default reporter config first, then modify `playwright.config.ts` per the tasks:
```bash
npx playwright test tests/module-44-reporters-deep-dive
```

## Key Takeaways

1. Multiple reporters can run simultaneously — list them as an array in `playwright.config.ts`.
2. The `html` reporter is the primary debugging artifact; `junit` and `json` feed CI pipelines.
3. The `github` reporter adds inline PR annotations with no extra configuration beyond listing it.
4. Blob reports exist to merge results across sharded runs — one blob per shard, one merge step.
5. The `Reporter` interface exposes lifecycle events (`onBegin`, `onTestEnd`, `onEnd`) — understanding it helps you evaluate and build custom reporters.

## Going Deeper

- [Playwright docs: Reporters](https://playwright.dev/docs/test-reporters)
- [Playwright docs: Sharding](https://playwright.dev/docs/test-sharding)
- [Playwright docs: Custom reporters](https://playwright.dev/docs/api/class-reporter)
