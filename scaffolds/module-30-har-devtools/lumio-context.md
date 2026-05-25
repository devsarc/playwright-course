# Lumio Context: M30

## Dashboard API calls

At M30, Lumio's dashboard page (`/dashboard`) makes three API calls on load:

| Endpoint | Purpose |
|----------|---------|
| `/api/workspaces` | Fetch the user's workspaces list |
| `/api/projects` | Fetch recent projects for the active workspace |
| `/api/tasks` | Fetch the user's assigned tasks across all projects |

These three calls are realistic bottleneck candidates. In a real app, `/api/tasks`
aggregates data across projects and tends to be the slowest — it is the primary
target for timing analysis in these exercises.

## HAR file location

The HAR generated in exercise 1 is written to:

```
test-results/dashboard.har
```

This path is under `test-results/`, which is already in `.gitignore`. Do not move
or commit the file — HAR files contain session cookies, auth tokens, and request
bodies and must never be checked into source control.

## What the HAR contains at M30

Because the dashboard is a protected route, the HAR will capture:
- The authenticated `GET /dashboard` document request
- All static assets (JS chunks, CSS, fonts) loaded for the dashboard shell
- The three API calls listed above, including full request headers (cookies,
  Authorization) and response bodies
- Redirect chains if the session was expired

The timing data in each HAR entry (`entry.timings`) breaks down into:
`dns`, `connect`, `ssl`, `send`, `wait` (TTFB), and `receive` (download).
`wait` is almost always the dominant cost for API requests — it is the time
the server spent generating the response.

## CDP throttling and Lumio

When you apply CDP network throttling in exercise 3 (simulating 3G conditions),
the dashboard load slows dramatically because all three API calls are affected.
LCP becomes largely determined by how quickly `/api/tasks` returns — it is
typically the last piece of data needed to render the dashboard's task list.

## Trace Viewer and curl generation

If you open a Playwright trace (`.zip`) in Trace Viewer and navigate to the
Network panel, you can right-click any request entry to copy it as a `curl`
command. Exercise 4 demonstrates reconstructing this programmatically from HAR
data. The practical benefit: you can paste the curl command into your terminal
and reproduce the exact API call — same URL, same headers, same cookies — outside
of any test.

## File tree reference

```
lumio/
└── app/
    └── (protected)/
        └── dashboard/
            └── page.tsx   ← issues fetch('/api/workspaces'), fetch('/api/projects'),
                              fetch('/api/tasks') in parallel on mount
```
