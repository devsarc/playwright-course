# Lumio Context: M62

## What's in Lumio at this point

M62 uses the full Lumio dashboard as its target. The dashboard is JS-heavy (React, Recharts, TipTap) and loads several CSS files (Tailwind, Radix UI primitives). This makes it a realistic target for coverage and performance measurement.

## Coverage use case

The Lumio team wants to identify dead CSS before a major UI refactor. By running CSS rule usage tracking on a full user journey (dashboard → create task → open task detail), they can identify which Tailwind utilities are never applied and prune them from the bundle. JS function coverage on the same journey reveals which utility functions in `lib/` are never invoked.

## Performance use case

Before deploying a performance improvement to the dashboard (lazy-loading charts), the team uses CDP network throttling to simulate 3G conditions and establish a baseline LCP. After the optimization, they rerun under the same conditions and compare. CDP's precise throttle parameters make the comparison reproducible — unlike real network variability.

## CDP vs page.coverage

`page.coverage.startJSCoverage()` is Playwright's convenience wrapper for the exact same CDP calls. Use `page.coverage` for simple JS coverage collection. Use `client.send('Profiler...')` directly when:
- You need to run coverage in the same CDP session as other domains (e.g., CSS coverage at the same time)
- You need the raw `Profiler` output format (Istanbul-compatible source maps, per-range coverage)
- You're collecting coverage data that `page.coverage` doesn't expose
