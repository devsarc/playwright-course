# Lumio Context: M56

## What's in Lumio at this point

Lumio's dashboard requires authentication. The login flow: POST credentials to NextAuth → redirect to `/dashboard`. The browser context retains the session cookie automatically.

For scraping tasks behind auth, log in via the UI or restore a previously saved `storageState`. Once authenticated, navigate freely to any protected endpoint.

## Infinite scroll relevance

Lumio's Kanban columns don't use infinite scroll by default — tasks are all loaded at once. However, Lumio's activity feed (if visible) may paginate or stream. The infinite scroll pattern is taught here for real-world applicability — most production apps with large datasets use it.

## CSV output location

The exercise writes to `tests/module-56-advanced-scraping-data-extraction/scraped-tasks.csv`. This file is cleaned up after the test. In a real scraping project, point the output to a dedicated `output/` directory and add it to `.gitignore`.
