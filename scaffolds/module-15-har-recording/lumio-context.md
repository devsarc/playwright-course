# Lumio Context: M15

## What gets captured in the HAR

When you record the landing page (`/`), the HAR captures:
- The initial HTML document request
- All static assets (JS bundles, CSS, fonts, images)
- Any API calls made during page load

For Lumio's landing page, there are no authenticated API calls — it's a static
Next.js page. The HAR will mostly contain the document and asset requests.

## The HAR file location

The HAR is written to `tests/module-15-har-recording/lumio-landing.har`.
This file is excluded from git (add it to `.gitignore`) — it's a local artifact,
not part of the source code.

## When HAR replay is useful

HAR replay shines for:
- **Snapshots of third-party APIs** — record once, replay without network in CI
- **Performance baselines** — compare load times with and without certain resources
- **Offline development** — work on the app without a running backend for static pages

For Lumio specifically, HAR replay is less useful for authenticated pages because
the session cookie in the HAR is test-specific. It's most useful for public pages
(landing, pricing, docs) that don't change based on auth state.

## `.gitignore` recommendation

Add to `.gitignore`:
```
tests/**/*.har
```

HAR files can contain sensitive data (cookies, tokens in request headers) and
are often large. They should not be committed to source control.
