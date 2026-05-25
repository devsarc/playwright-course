# M40 Hints

## TODO 1 — Assert config exists

```typescript
expect(existsSync(configPath)).toBe(true);
```

`process.cwd()` in Playwright tests returns the repo root (the directory containing `playwright.config.ts`). `join(process.cwd(), 'playwright.config.ts')` gives you the absolute path.

## TODO 2 — Assert forbidOnly

```typescript
expect(configContent).toContain('forbidOnly');
```

In `playwright.config.ts`, the pattern is:
```typescript
forbidOnly: !!process.env.CI,
```
The double-negation (`!!`) coerces the environment variable string to a boolean. When `CI=true` is set (as GitHub Actions does automatically), `forbidOnly` is `true` and any committed `test.only()` causes the run to fail immediately.

## TODO 3 — Assert retries

```typescript
expect(configContent).toContain('retries');
```

The recommended CI pattern:
```typescript
retries: process.env.CI ? 2 : 0,
```
Local development gets 0 retries (fail fast, fix fast). CI gets 2 retries to absorb transient infrastructure flakiness.

## TODO 4 — Assert workflow exists

```typescript
expect(existsSync(workflowPath)).toBe(true);
```

The workflow file at `.github/workflows/module-check.yml` was created in Part 1 (M00's infrastructure setup). This assertion confirms it was not accidentally deleted.

## TODO 5 — Assert artifact upload

```typescript
expect(workflowContent).toContain('upload-artifact');
```

The workflow should include:
```yaml
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 7
```
The `if: always()` condition ensures artifacts are uploaded even when tests fail — which is exactly when you need them most.

## TODO 6 — Assert browser install

```typescript
expect(workflowContent).toContain('playwright install');
```

The install command in the workflow:
```yaml
- run: npx playwright install --with-deps chromium
```
`--with-deps` installs system-level dependencies (fonts, libraries) that Chromium needs on Ubuntu. Omitting it causes cryptic startup failures on Linux CI runners.

## TODO 7 — Assert github reporter

```typescript
expect(configContent).toContain('github');
```

In `playwright.config.ts`, the CI reporter configuration:
```typescript
reporter: process.env.CI
  ? [['github'], ['html', { open: 'never' }]]
  : [['html', { open: 'never' }], ['list']],
```
The `github` reporter posts inline PR annotations. `open: 'never'` prevents the HTML report from auto-opening in CI (which would hang the job).

## TODO 8 — Assert process.env.CI usage

```typescript
expect(configContent).toContain('process.env.CI');
```

A correctly structured `playwright.config.ts` uses `process.env.CI` in at least three places: `forbidOnly`, `retries`, and `workers`. The presence of this string confirms the config handles CI and local environments differently.
