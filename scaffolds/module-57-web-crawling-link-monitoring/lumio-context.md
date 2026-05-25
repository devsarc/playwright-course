# Lumio Context: M57

## What's in Lumio at this point

Lumio's navigation includes: `/dashboard`, `/settings`, `/settings/profile`, `/settings/billing`, `/settings/team`. All are authenticated routes. Crawling begins after login.

## Expected links on the dashboard

The Lumio dashboard contains navigation links in the sidebar and header. A crawl from `/dashboard` might discover:
- `/dashboard` (self-link in logo)
- `/settings`
- `/notifications`
- Any project-specific URLs

## Site map output format

```json
[
  { "url": "/dashboard", "status": 200, "linksFound": 5 },
  { "url": "/settings", "status": 200, "linksFound": 3 }
]
```

Write with `JSON.stringify(siteMap, null, 2)` for readable output.

## robots.txt

Lumio's test environment doesn't have a `robots.txt` with disallowed paths. In production scraping, always check `${origin}/robots.txt` before crawling and skip any `Disallow:` paths.
