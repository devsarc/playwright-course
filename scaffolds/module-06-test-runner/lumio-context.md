# Lumio Context: M06

## Pages used in M06

- `/` — landing page (smoke tests, skip/fixme examples)
- `/login` — login page (tagged smoke test)
- `/signup` — signup page (tagged smoke test)

## What's being tested

M06 is about the test runner itself, not Lumio features. The landing page is used
as a stable target to demonstrate:

- `beforeEach` / `afterEach` lifecycle hooks
- `test.skip(condition, reason)` — conditional skip based on browser
- `test.fixme(true, reason)` — documenting a known missing feature
- `@smoke` tags in test names and via `test.describe.configure`

## The "footer has social links" fixme

Lumio's landing page footer doesn't yet have social links. Rather than deleting
the test (which would lose the intent), `test.fixme(true, 'reason')` marks it as
a known gap. When social links are added, remove the `test.fixme()` call and the
test will run normally.
