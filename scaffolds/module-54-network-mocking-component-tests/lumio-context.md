# Lumio Context: M54

## What's in Lumio at this point

Lumio's `TaskList` component fetches tasks from `/api/tasks` and renders them as `TaskCard` components. This makes it the ideal target for three-state component testing:

- **Loading state**: The `GET /api/tasks` request is in-flight — `TaskList` shows a loading spinner (`data-testid="loading-spinner"`)
- **Populated state**: The response returns task objects — `TaskList` renders one `TaskCard` per task (`data-testid="task-card"`)
- **Error state**: The response returns a 500 — `TaskList` renders an error alert (`role="alert"`) with a retry button

## Why mock the API in CT instead of using a test database

CT runs in a browser without access to the test database. Even if the database were reachable, using it would:
- Make the test slow (real network round-trip)
- Create interdependency with database state
- Cause failures when the database is unavailable

CT network mocking bypasses all of this — the mock is instant, deterministic, and fully controlled by the test.

## MSW in Lumio's CT setup

Lumio's CT configuration uses MSW for network mocking:

```
tests/playwright/
├── index.tsx        ← beforeMount hook that starts MSW
└── handlers.ts      ← default request handlers for all CT tests
```

Per-test overrides pass additional handlers via `hooksConfig`:
```tsx
const component = await mount(<TaskList />, {
  hooksConfig: {
    handlers: [http.get('/api/tasks', () => HttpResponse.json([]))],
  },
});
```
