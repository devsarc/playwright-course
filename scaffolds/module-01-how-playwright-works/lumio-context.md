# Lumio Context: M01

There is no Lumio interaction in M01. This module builds mental models before you
start writing tests.

When you do begin testing Lumio (from M02 onward), the Browser/Context/Page model
will be visible in how your tests are structured:

- Playwright's test runner creates a `BrowserContext` for each test — that's why
  logging in as one user in Test A doesn't affect Test B.
- The `page` fixture your tests receive is a `Page` object inside that context.
- When you add a `loggedInPage` fixture in M08, you're configuring the BrowserContext
  to pre-load saved auth state — which is fast precisely because contexts are cheap to create.
