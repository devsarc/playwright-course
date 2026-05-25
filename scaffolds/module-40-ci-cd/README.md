# M40: CI/CD Pipeline Setup

## Learning Objectives

- Build a GitHub Actions workflow that installs Playwright browsers, runs tests, and uploads HTML reports as artifacts
- Configure a browser matrix to run tests across Chromium, Firefox, and WebKit in parallel CI jobs
- Use the GitHub annotations reporter to surface test failures inline on pull requests
- Understand when to use JUnit vs. JSON vs. HTML vs. blob reporters and configure multiple simultaneously
- Cache Playwright browser binaries to reduce CI runtime

## Concept

Running Playwright locally is fast and immediate. Running it in CI requires thinking about a different set of constraints: fresh environments on every run, network latency for browser downloads, limited CPU, and the need to surface results to other tools (GitHub PR annotations, a Jenkins test reporter, a Slack alert system). Getting CI right transforms Playwright from "works on my machine" to "automatic quality gate for every PR".

**The GitHub Actions structure.** A Playwright CI job has four essential phases: checkout → install Node + dependencies → install browser binaries → run tests. The browser binary installation step (`npx playwright install --with-deps chromium`) is the expensive one — Chromium alone is around 300MB. Caching it is not optional on a busy project; without caching, every CI run downloads browsers afresh.

**Caching browser binaries.** Playwright stores browsers in a versioned cache directory (`~/.cache/ms-playwright` on Linux). Because the path is keyed to the Playwright version, caching on `hashFiles('package-lock.json')` correctly invalidates when you upgrade Playwright. GitHub Actions' `actions/cache@v4` handles this with a cache key and a restore key. The pattern: try to restore the cache; if it hits, skip the install step; if it misses, install and then save.

**Matrix builds for cross-browser CI.** GitHub Actions' `strategy.matrix` lets you run the same job definition N times with different input values. For Playwright, the matrix variable is typically the browser name or Playwright project name. Each matrix job runs one browser — three parallel jobs instead of one sequential job running all three browsers. The total wall time drops from 3× to 1× (plus a few seconds of job spin-up overhead). The tradeoff is cost: you consume three GitHub Actions minutes per test run instead of one.

**Reporters in CI.** The right reporter depends on the consumer. `html` produces a rich local report. `github` (the GitHub annotations reporter) posts inline failure comments on pull requests — learners see failures next to the code that caused them, not buried in a log. `junit` produces an XML file that Jenkins, GitLab CI, and Azure DevOps all know how to parse. `json` produces machine-readable output for custom integrations. `blob` is Playwright's format for splitting reports across shards and merging them later (M39 covers sharding). You can configure multiple reporters simultaneously with an array — a common CI setup is `[['github'], ['html', { open: 'never' }], ['junit', { outputFile: 'results.xml' }]]`.

**Uploading artifacts.** Test HTML reports and trace files are worth uploading as CI artifacts even when tests pass. When tests fail, the artifacts are what engineers use to debug. `actions/upload-artifact@v4` with `if: always()` ensures artifacts are uploaded regardless of test outcome. Set retention to 7–30 days depending on your team's debugging habits.

**Environment variables.** CI runs against a test database, not production. `DATABASE_URL`, `NEXTAUTH_SECRET`, and test user credentials live in GitHub repository secrets and are injected into the job via `env`. Never hardcode credentials; never commit `.env.test`.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

This module's exercise creates a GitHub Actions workflow file rather than a test spec. Complete each TODO in `exercise.spec.ts` AND in the workflow template.

Run after each TODO:
```bash
npx playwright test tests/module-40-ci-cd
```

## Key Takeaways

1. Cache Playwright browser binaries on `hashFiles('package-lock.json')` — Playwright's cache path is versioned, so the cache auto-invalidates on upgrade.
2. Use `actions/matrix` to run browser projects in parallel — three 2-minute jobs beats one 6-minute job.
3. Configure `['github']` reporter in CI for inline PR annotations; `['html']` for the downloadable report; `['junit']` for external CI systems.
4. Always upload reports with `if: always()` — you need artifacts when tests fail, and you need them most when everything seems to be breaking.
5. `workers: 1` on a 2-CPU free runner often outperforms higher worker counts due to context-switching overhead.

## Going Deeper

- [Playwright docs: CI configuration](https://playwright.dev/docs/ci)
- [Playwright docs: GitHub Actions](https://playwright.dev/docs/ci-intro)
- [Playwright docs: Reporters](https://playwright.dev/docs/test-reporters)
