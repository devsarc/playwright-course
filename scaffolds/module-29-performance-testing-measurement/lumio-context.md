# Lumio Context: M29

## Performance targets for Lumio

| Metric | Target | Page |
|--------|--------|------|
| DOMContentLoaded | < 3000ms | Landing `/` |
| First Contentful Paint | < 2500ms | Landing `/` |
| Board columns visible | < 5000ms | `/projects/demo/board` |
| Card creation latency | < 1000ms | Board |
| Max JS bundle size | < 500 KB | Any page |

## Why these numbers?

These are conservative for a dev server with no CDN. In production with
Next.js's static optimization and a CDN, FCP should be < 1000ms.

## Performance debugging in Lumio

If a test fails a performance budget:
1. Run `npx next build && npx next start` and re-test — dev server is slower
2. Check bundle analyzer: `cd lumio && ANALYZE=true npm run build`
3. Look for large client-side data fetches on load
