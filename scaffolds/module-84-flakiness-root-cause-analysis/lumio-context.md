# Lumio Context: M84

## Known flaky tests in the Lumio suite

Before this module's fixes, these tests had intermittent failures in CI:

| Test | Failure rate | Root cause category | Fix |
|---|---|---|---|
| "login redirects to dashboard" | 8% | Timing | Replaced `waitForTimeout(1500)` with `waitForURL(/dashboard/)` |
| "task creation shows success toast" | 12% | Timing | Replaced `waitForTimeout(2000)` with `expect(toast).toBeVisible()` |
| "admin filter reduces row count" | 6% | Data | Added `Date.now()` suffix to test user emails |
| "bulk delete removes 3 rows" | 15% | Data | Added cleanup in `afterEach` to restore deleted rows |
| "kanban card first priority badge" | 4% | Selector | Changed `.nth(0)` to scoped `getByRole` with name |

## Flakiness tracking process

Lumio's CI reports flakiness metrics via the JSON reporter. A nightly job processes `test-results.json` from the last 30 runs and computes:
- Pass rate per test (target: > 99%)
- Retry rate per test (target: < 1%)
- P95 duration per test (for timing regression detection)

Tests with retry rate > 5% are added to the "flakiness backlog" in Linear with the "flaky-test" label. Engineers are expected to diagnose and fix flaky tests before adding new tests to the same file.

## Why retries don't fix flakiness

Retries hide flakiness from the dashboard but don't fix the underlying problem:
- A 15% flake rate with 2 retries appears as ~0.3% failure rate in CI — "green" but actually broken
- Retried tests slow CI (each retry runs the full test again)
- Retries don't protect against the case where all 3 attempts fail simultaneously

Lumio uses `retries: 2` in CI as a safety net for genuine transient infrastructure failures, not as a substitute for fixing flaky tests.
