# M11 Hints

## TODO 2 — `.click()` on the submit button

```typescript
await page.getByRole('button', { name: 'Create account' }).click();
```

## TODO 3 — `waitForURL` after form submission

```typescript
await page.waitForURL(/verify-email/, { timeout: 10_000 });
```

Signup redirects to `/verify-email` on success. The 10-second timeout is generous
to account for email verification being triggered asynchronously.

## TODO 4 — Log retry count

```typescript
console.log(`Running on attempt ${retryCount + 1}`);
```

`test.info().retry` is 0 on the first attempt, 1 on the first retry, etc.
Use `if (retryCount > 0)` to skip expensive setup on retries when the setup
may have partially succeeded on a previous attempt.

## TODO 5 — Assert retry count is non-negative

```typescript
expect(retryCount).toBeGreaterThanOrEqual(0);
```

When running without `--retries`, `retryCount` is always 0.
When running with `--retries=2`, it can be 0, 1, or 2.
