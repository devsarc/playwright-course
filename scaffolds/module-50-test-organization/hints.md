# M50 Hints

## TODO 1 — Tag a test with @smoke

The tag is already in the test name: `'dashboard loads @smoke'`. No additional code needed — just run:

```bash
npx playwright test tests/module-50-test-organization --grep @smoke
```

This runs only the tests whose names contain `@smoke`.

## TODO 2 — Assert Add task button visible

```typescript
await expect(page.getByRole('button', { name: 'Add task' }).first()).toBeVisible();
```

## TODO 3 — Close dialog with Escape and assert not visible

```typescript
await page.keyboard.press('Escape');
await expect(page.getByRole('dialog')).not.toBeVisible();
```

## TODO 4 — Assert 'To Do' heading

```typescript
const todoHeading = page.getByRole('heading', { name: 'To Do' });
await expect(todoHeading).toBeVisible();
```

## TODO 5 — Use test.fixme() with a bug reference

```typescript
test.fixme(true, 'LUM-9999: task drag-and-drop intermittently fails');
```

When `fixme(true, ...)` is called, the test is immediately marked as skipped with the reason shown in the HTML report. The bug reference links it to your issue tracker — the test won't silently disappear.

Alternative forms:
```typescript
test.fixme();                  // always skip, no reason
test.fixme(condition, reason); // conditional — skip only when condition is true
```

## TODO 6 — Distinguish skip from fixme

```typescript
const brokenWithBug = 'fixme';
const notApplicable = 'skip';
```

The mental model:
- `fixme` = "I know this is broken, here's the ticket"
- `skip` = "this test doesn't apply to this run (platform, flag, environment)"

## TODO 7 — Configure describe block timeout

```typescript
test.describe.configure({ timeout: 60_000 });
```

Other options you can set at the describe level:
```typescript
test.describe.configure({
  mode: 'parallel',   // run tests in this block concurrently
  retries: 2,         // retry up to 2 times on failure
  timeout: 60_000,    // 60 second timeout per test
});
```

## TODO 8 — Confirm grep filtering is understood

```typescript
const greppingUnderstood = true;
```

Verify by running:
```bash
# Only smoke tests (2–3 tests)
npx playwright test tests/module-50-test-organization --grep @smoke

# Only regression tests (2–3 tests)
npx playwright test tests/module-50-test-organization --grep @regression

# Everything except accessibility
npx playwright test tests/module-50-test-organization --grep-invert @accessibility
```

---

## Recommended tagging strategy for Lumio

| Tag | Purpose | Run frequency |
|-----|---------|--------------|
| `@smoke` | Login + dashboard load + task create | Every commit |
| `@regression` | All happy-path flows | Pre-release |
| `@e2e` | Multi-user / multi-system flows | Nightly |
| `@accessibility` | ARIA snapshot + role assertions | Weekly or on PR |
| `@visual` | Screenshot comparisons | After visual review |

In `playwright.config.ts`, you can set the default grep for CI:
```typescript
grep: process.env.CI ? /@smoke/ : undefined,
```

This runs only smoke tests in CI by default, with the full suite available locally.
