# Lumio Context: M64

## What's in Lumio at this point

M64's branch adds the feature flags admin UI and the "AI suggestions" panel — a sidebar widget on the dashboard that offers AI-generated task suggestions. The panel's visibility is controlled by the `aiSuggestions` flag in `window.__featureFlags`, which is seeded from the database by the Next.js server on each page load.

A second flag, `betaDashboard`, adds an in-progress dashboard redesign behind a banner. It can be activated by the URL parameter `?flags=beta_dashboard` for QA purposes.

## The flags system

Lumio's flag system is DB-backed. The server reads flags from a `feature_flags` table and injects them into the page via `<script>window.__featureFlags = {...}</script>` in the Next.js `layout.tsx`. This makes flags synchronously available in the browser without an extra API round trip.

Flags can also be overridden per-user via a cookie (`feature_*` cookies) — useful for gradual rollouts where the server checks the cookie first, then falls back to the global flag value.

## Why addInitScript is the right test tool here

The DB-backed flag approach means that to change a flag in a normal test, you'd need to: seed the database with the flag value, run the test, then clean up. This couples tests to database state and makes them slower.

`page.addInitScript()` sidesteps the database entirely: the script runs before Lumio's own `<script>` tag, overwriting whatever value the server injected. This makes flag tests fast, isolated, and safe to run in parallel — no shared state.
