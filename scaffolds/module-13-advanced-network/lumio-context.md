# Lumio Context: M13

## Feature flags in Lumio

Lumio's AI chat feature (added in Part 4) is toggled by a server-side flag.
In production, this flag comes from the database. In tests, `addInitScript` lets
you inject the flag before the page loads — no database call needed.

This is a common pattern for feature-flag-heavy applications: test the UI in
both enabled and disabled states by injecting the flag, not by seeding the database.

## The login flow and `/api/auth`

The `page.on('request')` test triggers a login. NextAuth's credentials provider
makes a POST to `/api/auth/callback/credentials`. This is the request we're
monitoring.

The URL collected by the listener will look like:
```
http://localhost:3000/api/auth/callback/credentials
```

The `includes('/api/auth')` check matches this regardless of the exact path.

## `setOffline` vs `route.abort`

| | `context.setOffline(true)` | `route.abort()` |
|--|--------------------------|----------------|
| Scope | ALL network activity | Only matching routes |
| Level | OS-level simulation | Application-level interception |
| Use case | PWA offline mode, service worker testing | Specific API error simulation |

For Lumio's PWA/service worker (added in Part 4), `setOffline` is the right
tool to test offline behavior — it triggers the service worker's fetch event
just like a real network failure would.
