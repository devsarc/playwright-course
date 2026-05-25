# Lumio Context: M69

## What's in Lumio at this point

By M69 (within the M63–M70 feature batch), Lumio's marketing pages have been fully instrumented with SEO metadata. Every public-facing page includes:

- A descriptive `<title>` unique to that page
- A `<meta name="description">` with a 150–160 character summary
- The three required Open Graph tags: `og:title`, `og:description`, `og:image`
- A `<link rel="canonical">` pointing to the canonical production URL

## Public marketing pages

| Path | Title |
|------|-------|
| `/` | Lumio — Team Productivity |
| `/pricing` | Pricing — Lumio |
| `/blog` | Blog — Lumio |
| `/docs` | Documentation — Lumio |
| `/changelog` | Changelog — Lumio |

Each page uses a different title to avoid the duplicate-title SEO penalty.

## JSON-LD on the landing page

The landing page (`/`) includes a `<script type="application/ld+json">` tag with a `SoftwareApplication` schema:

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Lumio",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web"
}
```

This enables search engines to display rich result cards with the app name and category.

## robots.txt

`/robots.txt` is served statically and allows all crawlers:

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Sitemap: https://lumio.io/sitemap.xml
```

The `/api/` and `/admin/` paths are intentionally blocked. Only the root `/` path is tested for "Disallow: /" — blocking `/api/` is fine and expected.

## sitemap.xml

`/sitemap.xml` is dynamically generated at build time and lists all public marketing and docs pages. Each `<loc>` entry uses the production domain `https://lumio.io/...`.

## Why test SEO with Playwright

Lumio's marketing team runs A/B tests on landing page copy and developers deploy new page variants frequently. Without automated SEO assertions, a misconfigured template could ship without `og:image` or with a placeholder title — and the regression would go unnoticed until search traffic data shows a drop weeks later.
