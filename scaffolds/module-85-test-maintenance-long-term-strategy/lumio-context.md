# Lumio Context: M85

## Lumio's selector maintenance history

Lumio's test suite accumulated brittleness over its first 40 modules. A refactor of the design system from custom CSS (`task-card`, `sidebar-nav`) to Tailwind utility classes broke 23 tests in a single PR — none of which tested behavior that had actually changed. Post-mortem revealed three root causes:

| Smell | Count | Example |
|---|---|---|
| CSS class selectors | 14 | `locator('.sidebar-nav--active')` broke when class was renamed to `data-state="active"` |
| `nth()` index selectors | 6 | `getByRole('button').nth(0)` shifted when a mobile menu toggle was added |
| Placeholder text selectors | 3 | `getByPlaceholder('Enter email')` broke when copy was changed to 'Your email' |

After the refactor, Lumio's team adopted the selector resilience hierarchy: role > label > text > testId > CSS.

## Lumio's annotation conventions

Lumio's CI reads the JSON reporter output to populate a Linear dashboard with test metadata. The team uses three annotation types:

| Type | Description | Example |
|---|---|---|
| `'issue'` | Link to the bug this test was written for | `https://linear.app/lumio/issue/LUM-NNN` |
| `'tag'` | Coverage tier (`@smoke`, `@sanity`, `@regression`) | `@smoke` |
| `'owner'` | Squad responsible for maintenance | `platform-team` |

Any test without an `'issue'` annotation is flagged in the nightly report as "undocumented" — it may be a dead test or an orphaned regression guard.

## Coverage tier distribution (as of M85)

| Tier | Test count | CI trigger |
|---|---|---|
| `@smoke` | 8 | Every push (< 60s target) |
| `@sanity` | 24 | Every PR merge |
| `@regression` | 58+ | Nightly |
| Untagged | 12 | Nightly (to be migrated) |

The 12 untagged tests are on the maintenance backlog — they need annotation before the next release freeze.

## When to delete a test

Lumio's rule: if a test has not caught a regression in 6 months AND the feature it covers has no user-facing risk, it is a deletion candidate. Deletion frees CI time and removes false confidence. Before deleting, check:

1. Is there a corresponding issue annotation? If yes, is that issue still open?
2. Does the test cover a path that's not covered by any other test in the file?
3. Is the test still testing the same behavior it was written for, or has the feature changed?

If all three answers suggest the test is stale, delete it — don't comment it out.
