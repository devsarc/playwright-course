# Lumio Context: M48

## What's in Lumio at this point

Lumio has authentication (NextAuth v5), a Kanban board at `/dashboard`, and a REST-style API for tasks. These make it an ideal target for advanced fixture patterns:

- **Authentication fixture**: Log in once via the UI, save `storageState`, hand authenticated pages to tests without repeating the login flow
- **Task API fixture**: Call `POST /api/tasks` to seed a task record, yield the task object to the test, call `DELETE /api/tasks/:id` in teardown

## Why fixtures over beforeEach

`beforeEach` runs login code in every test file that needs it. If the login flow changes, you update N files. A fixture lives in one place — update the fixture, all tests pick up the change automatically.

Additionally, fixtures compose: an `authenticatedPage` fixture can be built from an `authState` fixture, which can be built from a `userCredentials` fixture. The dependency graph is explicit and Playwright resolves it automatically.

## Fixture scope recommendation for Lumio

| Fixture | Scope | Reason |
|---------|-------|--------|
| `authState` (saved storage state file) | `worker` | Read-only — safe to share across tests in a worker |
| `authenticatedPage` | `test` | Creates a page that the test will interact with |
| `seededTask` | `test` | Writes to the database — must be cleaned up per test |
| `adminContext` | `test` | Context with elevated permissions — isolate to prevent leakage |
