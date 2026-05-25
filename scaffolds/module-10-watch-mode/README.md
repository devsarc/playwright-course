# M10: Watch Mode & Developer Workflow

## Learning Objectives

- Run tests in watch mode with `--watch` for instant feedback
- Use the Playwright UI mode (`--ui`) for visual debugging
- Understand which CLI flags are most useful day-to-day
- Know when to use `--headed`, `--debug`, and `--ui`

## Concept

The feedback loop is everything in TDD. Playwright gives you three modes for active development:

**Watch mode (`--watch`)** — re-runs tests automatically when any file changes. The terminal stays live. This is the mode to use when you're actively writing tests.

```bash
npx playwright test tests/module-10-watch-mode --watch
```

**UI mode (`--ui`)** — opens a GUI that shows your tests as a tree, lets you run individual tests with one click, shows a timeline of each step, and replays actions. The most useful mode for debugging a failing test.

```bash
npx playwright test --ui
```

**Headed mode (`--headed`)** — runs tests with the browser window visible. Slower than headless, but lets you see exactly what Playwright sees. Useful for writing new tests when you're not sure what's on the page.

```bash
npx playwright test tests/module-10-watch-mode --headed
```

**Debug mode (`--debug`)** — opens Playwright Inspector alongside the headed browser. You can step through each action, inspect locators, and see the full DOM. Use when a test is failing and you don't understand why.

```bash
npx playwright test tests/module-10-watch-mode --debug
```

### The typical workflow

1. Start watch mode while writing the test
2. Write a failing assertion to confirm the test runs
3. Implement the TODO — the test re-runs on save
4. See it pass
5. Move to the next TODO

If a test fails and you don't understand why, switch to `--debug` or `--ui` for a visual walkthrough.

### Useful CLI flags

| Flag | Purpose |
|------|---------|
| `--watch` | Re-run on file change |
| `--ui` | Visual test runner GUI |
| `--headed` | Show browser window |
| `--debug` | Step through actions |
| `--grep @smoke` | Run only tagged tests |
| `--retries=2` | Retry failing tests (CI) |
| `--workers=1` | Run sequentially (debug flakiness) |
| `--reporter=html` | Generate HTML report |

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Start watch mode, then complete each TODO:
```bash
npx playwright test tests/module-10-watch-mode --watch
```

## Key Takeaways

1. `--watch` re-runs tests on save — the fastest feedback loop for writing tests.
2. `--ui` gives a visual step-by-step view — best for debugging failures.
3. `--debug` opens Playwright Inspector — use when you don't understand why a test fails.
4. `--workers=1` runs tests sequentially — helpful for isolating flakiness.
5. Use `--grep @smoke` to run a targeted subset quickly.

## Going Deeper

- [Playwright docs: Command line](https://playwright.dev/docs/test-cli)
- [Playwright docs: UI mode](https://playwright.dev/docs/test-ui-mode)
