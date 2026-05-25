# Lumio Context: M10

## Page tested: `/login`

The login page (`lumio/app/(auth)/login/page.tsx`) has:
- `<label>Email address</label>` + `<input type="email">` pair
- `<label>Password</label>` + `<input type="password">` pair
- `<button type="submit">Sign in</button>`
- `<div role="alert">` rendered when NextAuth returns an error

## The `role="alert"` pattern

`role="alert"` is an ARIA live region — screen readers announce its content
immediately when it appears. Playwright's `getByRole('alert')` finds it.

When credentials are invalid, NextAuth calls back with `error=CredentialsSignin`
and the page renders the alert div with a human-readable message.

## Watch mode behavior

When watch mode is active (`--watch`), saving `exercise.spec.ts` re-runs all
tests in that file. The terminal stays alive and shows a pass/fail summary
after each re-run. This is the fastest feedback loop for TDD-style test writing.
