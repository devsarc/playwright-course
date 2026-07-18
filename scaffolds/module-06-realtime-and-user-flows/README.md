# Lesson 06: Realtime & User Flows

*Combines former modules M31–M33.*

## Learning Objectives

### Part 1 — Multi-Tab & Popup Management (formerly M31)

- Open multiple pages in one BrowserContext for same-user multi-tab scenarios
- Create independent BrowserContexts for different user sessions
- Test real-time collaboration features (card sync, presence)
- Clean up contexts explicitly to avoid resource leaks
- Wait for a popup window opened by a link click using `context.waitForEvent('page')`
- Handle OAuth login popups: wait for the popup page, fill credentials inside it, assert redirect back to the app
- Coordinate assertions across tabs: perform action in tab A and assert the result in tab B

### Part 2 — WebSocket & SSE Testing (formerly M32)

- Capture a WebSocket connection with `page.waitForEvent('websocket')`
- Listen for frames with `ws.waitForEvent('framereceived')`
- Mock the server with `page.routeWebSocket()`
- Simulate connection errors to test reconnect UI
- Test SSE (EventSource) streams: intercept with `page.on('response')` and assert event data
- Assert that a real-time notification (WebSocket or SSE) arrives within a time budget using `waitForEvent` with a timeout

### Part 3 — User Journey Simulation (formerly M33)

- Distinguish user journey tests from unit/integration tests and understand when to use each
- Structure multi-step journeys using step helper functions instead of monolithic test bodies
- Maintain state across journey steps with local variables rather than shared globals
- Branch on condition within a journey (e.g. skip workspace creation if one already exists)
- Simulate two simultaneous users with independent `BrowserContext` instances and assert cross-user state

## Concept

### Part 1 — Multi-Tab & Popup Management (formerly M31)

**Same user, two tabs — `context.newPage()`:**
```typescript
const pageA = await context.newPage();
const pageB = await context.newPage();
// pageA and pageB share cookies — same logged-in user
```

**Two users — `browser.newContext()`:**
```typescript
const ctxA = await browser.newContext({ storageState: 'user-a.json' });
const ctxB = await browser.newContext({ storageState: 'user-b.json' });
// Independent sessions — different users
```

**Popup window (link opens new tab):**
```typescript
const [popup] = await Promise.all([
  context.waitForEvent('page'),
  page.getByRole('link', { name: 'Open in new tab' }).click(),
]);
await popup.waitForLoadState();
await expect(popup).toHaveTitle('Expected Title');
```
`Promise.all` prevents a race: the popup may open before `waitForEvent` is registered if you `click()` first.

### Part 2 — WebSocket & SSE Testing (formerly M32)

| Strategy | When to use | API |
|----------|-------------|-----|
| Real WS | Integration tests, happy path | `waitForEvent('websocket')` |
| Mocked WS | Edge cases, error states | `page.routeWebSocket()` |

Race-safe capture pattern:
```typescript
const [, ws] = await Promise.all([
  page.goto('/board'),
  page.waitForEvent('websocket'),
]);
```
Starting the listener before goto() ensures no frame is missed.

### Part 3 — User Journey Simulation (formerly M33)

Most test suites are built around individual features: the signup form works, the dashboard loads, the task creation API returns the right shape. These are valuable, but they leave a class of bug entirely untested — the transition between features. A user doesn't just "use the signup form"; they sign up, verify their email, land on the onboarding screen, create a workspace, invite a teammate, and eventually create a task. Each seam between those steps is a potential failure point, and isolated tests will never catch it.

User journey tests are designed to cover those seams. They operate at the level of a real user moving through your application from an initial state to a meaningful outcome. When a journey test fails, it almost always points to a problem with how two features hand off control — the kind of bug that is invisible in unit tests but immediately visible the first time a real user tries to get something done.

The first structural challenge with journey tests is length. A naively written journey test might run hundreds of lines in a single test body, making it hard to read, impossible to debug when it fails mid-way, and brittle when the UI changes. The solution is to break each step into a named helper function. Instead of inlining all the signup interactions at the top of your test, you write a `signUp(page, credentials)` function and call it. Each helper handles one coherent action: navigate to the right URL, fill the relevant inputs, click submit, and assert the resulting state before returning. The test body then reads like a sequence of meaningful events rather than a wall of locator calls, and when a step fails the stack trace immediately tells you which step broke.

State across steps is a related concern. Journey tests accumulate data as they run — a signed-up user's email, a generated workspace slug, a task ID returned by the API. The right place to hold that state is in local variables inside the test body, not in global module-level variables. Global state creates hidden dependencies between tests: if two tests run in parallel and both write to the same global, they corrupt each other. Local variables scope the state to exactly one test run and are garbage-collected when the test ends.

Journeys also need to handle the reality that the application's state before the test runs is not always blank. If your test creates a workspace and a workspace with that name already exists, the application might redirect you immediately rather than show the creation form. Good journey tests branch on condition: check whether you are already past a step before attempting it. A simple `page.url()` check or a `page.isVisible()` call for the expected element is usually enough to decide which path to take. This makes journeys more resilient to partial state from previous failed runs without requiring you to tear down and recreate the entire database before each test.

The most powerful form of journey testing involves more than one user. Many bugs in collaborative applications only appear when two sessions interact: user A assigns a task to user B, but user B's dashboard never refreshes because the WebSocket notification was sent to the wrong channel. To catch this class of bug you need two independent browser sessions running in the same test. Playwright enables this with `browser.newContext()`. Each context is a completely isolated browser profile — separate cookies, separate localStorage, separate WebSocket connections. You create one context per user, create a page in each context, and then orchestrate actions across both. User A performs an action; you then assert the result from user B's page.

The final concept to internalize is session persistence across test runs. A journey test that creates a user and verifies their email takes time. If subsequent tests in the same suite need a logged-in user, they should not repeat the full journey. Playwright's `context.storageState()` method serializes the current session — cookies, localStorage entries — to a file. A later test can restore that session via `browser.newContext({ storageState: 'path/to/state.json' })` and begin immediately at the authenticated state. This is also how the two-context pattern works in practice: you pre-authenticate each context rather than re-running the full signup flow for every test that needs two users.

Journey tests are slower than unit tests and they require a running application. They are not a replacement for lower-level testing — they are the layer that proves the pieces actually fit together.

## Lumio Context

See [lumio-context.md](./lumio-context.md).

## Step-by-Step Tasks

### Part 1 — Multi-Tab & Popup Management

Validate this part only:
```bash
npx playwright test tests/module-06-realtime-and-user-flows -g "Part 1 — Multi-Tab & Popup Management (formerly M31)"
```

### Part 2 — WebSocket & SSE Testing

Validate this part only:
```bash
npx playwright test tests/module-06-realtime-and-user-flows -g "Part 2 — WebSocket & SSE Testing (formerly M32)"
```

### Part 3 — User Journey Simulation

1. Fill in `/* TODO 3.1 */`: define the `JourneyHelpers` object with a `signUp` step that navigates to `/signup`, fills `signup-email` and `signup-password`, clicks `signup-submit`, and asserts the user lands on the verify-email route.

2. Fill in `/* TODO 3.2 */`: implement `verifyEmail` — navigate to `/verify-email?token=test-token-123` and assert `verify-email-status` is visible.

3. Fill in `/* TODO 3.3 */`: implement `createWorkspace` — navigate to `/onboarding/workspace`, fill `workspace-name`, submit, and assert redirect to `/dashboard`.

4. Fill in `/* TODO 3.4 */`: implement `createProject` — click `create-project-button`, fill `project-name-input`, confirm, and assert `project-card` is visible.

5. Fill in `/* TODO 3.5 */`: implement `createTask` — open the project, click `add-task-button`, fill `task-title-input`, and assert `task-card` is visible.

6. Fill in `/* TODO 3.6 */`: create `contextA` with `browser.newContext()` using `storageState` for `user-a.json` and `contextB` using `storageState` for `user-b.json`.

7. Fill in `/* TODO 3.7 */`: in `contextA`'s page, assign the task to user B by clicking `task-assignee-select` and choosing user B's name.

8. Fill in `/* TODO 3.8 */`: in `contextB`'s page, navigate to `/dashboard` and assert `task-assignee` contains user B's display name.

9. Fill in `/* TODO 3.9 */`: use `browser.newContext({ storageState: savedStatePath })` to restore the session without re-running the full signup flow.

10. Fill in `/* TODO 3.10 */`: assert the dashboard heading is visible, confirming the restored session is fully authenticated.

**Validation command:**
```bash
npx playwright test tests/module-06-realtime-and-user-flows/exercise.spec.ts --reporter=list
```

Validate this part only:
```bash
npx playwright test tests/module-06-realtime-and-user-flows -g "Part 3 — User Journey Simulation (formerly M33)"
```

## Validate (full lesson)

```bash
npx playwright test tests/module-06-realtime-and-user-flows
```

## Key Takeaways

### Part 1 — Multi-Tab & Popup Management

1. `context.newPage()` = same user, new tab (shared cookies).
2. `browser.newContext()` = new user profile (isolated cookies, localStorage).
3. Always call `context.close()` in multi-context tests — Playwright doesn't auto-close manually created contexts.
4. Use unique card titles (`Date.now()`) to avoid test interference.

### Part 2 — WebSocket & SSE Testing

1. `Promise.all([goto, waitForEvent('websocket')])` prevents race conditions.
2. `ws.waitForEvent('framereceived')` blocks until the next frame.
3. `page.routeWebSocket()` intercepts before the server — great for error simulation.
4. Parse `frame.payload` — it arrives as a raw string or Buffer, not a JS object.

> **Note — M32 vs M60/M61:** M32 introduces the basic patterns for both WebSocket and SSE delivery testing. Lesson 13 (formerly M60) (WebSocket Deep Dive) covers payload content assertions and mock WebSocket servers for edge cases. Lesson 13 (formerly M61) (SSE & Streaming) covers SSE reconnection, ordering, and the SSE vs WebSocket decision framework.

> **SSE testing pattern:**
> ```typescript
> const sseResponse = await page.waitForResponse(res =>
>   res.url().includes('/api/activity') && res.headers()['content-type']?.includes('text/event-stream')
> );
> // EventSource uses repeated response chunks — assert on page state rather than raw frames
> ```

### Part 3 — User Journey Simulation

1. Journey tests cover the seams between features — the transitions that isolated tests never exercise.
2. Break journeys into named step functions: each step navigates, acts, and asserts its own outcome before returning.
3. Store accumulated state in local test variables, not module-level globals, to keep tests independent.
4. Use `browser.newContext()` with distinct `storageState` files to simulate two users in a single test.
5. Persist authentication state with `context.storageState()` to avoid re-running expensive setup steps in later tests.

## Going Deeper

### Part 1 — Multi-Tab & Popup Management

- [Playwright docs: BrowserContext](https://playwright.dev/docs/browser-contexts)
- [Playwright docs: Multi-page scenarios](https://playwright.dev/docs/pages)
- Part 3 of this lesson (formerly M33) covers multi-user collaboration flows in full: two independent contexts, real-time sync assertions, and multi-step orchestration across users.

### Part 2 — WebSocket & SSE Testing

- [Playwright docs: WebSocket mocking](https://playwright.dev/docs/network#websocket-mocking)

### Part 3 — User Journey Simulation

- [Playwright docs: Browser contexts](https://playwright.dev/docs/browser-contexts)
- [Playwright docs: Authentication — reusing signed-in state](https://playwright.dev/docs/auth)
- [Playwright docs: Multi-page scenarios](https://playwright.dev/docs/pages)
