# Lumio Context: M08

## Pages used in M08

- `/` — landing page (target for `lumioHomePage` fixture)
- `/login` — login page (used in `loggedInPage` fixture, TODO 5)
- `/dashboard` — destination after login (waitForURL target in `loggedInPage`)

## Why fixtures matter for Lumio tests

As the test suite grows, you'll notice that many tests start the same way:
navigate to `/`, log in, navigate to a workspace. Repeating this in every test
is noisy and slow. Fixtures let you extract that setup once and inject it.

The `loggedInPage` fixture (TODO 5) is the foundation for all authenticated tests
in M09 onward. Instead of writing a login sequence in every test, you declare
`{ loggedInPage }` in the test signature and get a page that's already logged in.

## Fixture scopes

Fixtures have a scope: `'test'` (default) or `'worker'`.

- `'test'` — created fresh for each test, torn down after
- `'worker'` — shared across all tests in a worker, torn down when the worker finishes

`lumioHomePage` is test-scoped (default). `loggedInPage` using `storageState`
(as in M16) would be worker-scoped — you save the auth state once, reuse it for
all tests in the worker.
