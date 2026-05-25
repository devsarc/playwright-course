# Lumio Context: M11

## Page tested: `/signup`

The signup page (`lumio/app/(auth)/signup/page.tsx`) has:
- `<label>Full name</label>` + input
- `<label>Email address</label>` + input
- `<label>Password</label>` + input
- `<button type="submit">Create account</button>`
- On success: redirects to `/verify-email`

## Why signup is timing-sensitive

The signup flow calls NextAuth's registration endpoint, which:
1. Creates the user in the database
2. Sends a verification email (async)
3. Redirects to `/verify-email`

The redirect timing depends on database latency. On slow CI machines, the redirect
may take longer than expected — a common cause of flakiness.

Using `waitForURL(/verify-email/, { timeout: 10_000 })` instead of a hardcoded
`page.waitForTimeout(2000)` is the correct fix: wait for the event, not for time.

## Idempotency requirement for retried tests

The signup test uses `Date.now()` in the email address:
```typescript
await page.getByLabel('Email address').fill(`retry-${Date.now()}@test.com`);
```

This ensures each attempt uses a unique email — if the first attempt created the
user but failed afterward, the retry won't hit a "user already exists" error.
Making tests idempotent across retries is a critical design requirement.
