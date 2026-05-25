# M69 Hints

## TODO 1 — toHaveTitle with a regex

```typescript
await expect(page).toHaveTitle(/Lumio/);
```

`/Lumio/` is a regex that matches any title containing "Lumio". Use a regex rather than an exact string when the full title format may change (e.g., "Lumio" vs "Lumio — Team Productivity"). `toHaveTitle()` retries internally until the title stabilizes, handling SPA hydration without explicit waits.

## TODO 2 — CSS attribute selector for meta[name]

```typescript
const metaDesc = page.locator('meta[name="description"]');
```

CSS attribute selectors match elements by attribute name and value. `meta[name="description"]` finds the standard HTML meta description tag. Note: Open Graph tags use `property=` not `name=`, requiring a different selector pattern.

## TODO 3 — Non-empty content regex

```typescript
await expect(ogTitle).toHaveAttribute('content', /\S+/);
```

`/\S+/` is a regex matching one or more non-whitespace characters. This is more robust than asserting a specific marketing string — it verifies the attribute has meaningful content without coupling the test to exact copy that may change.

## TODO 4 — og:image property selector

```typescript
const ogImage = page.locator('meta[property="og:image"]');
```

OG tags use `property` not `name`. Without an `og:image`, social platform link previews show a blank thumbnail, significantly reducing click-through rates. All three — `og:title`, `og:description`, `og:image` — are required for a complete social preview.

## TODO 5 — toBeAttached() for non-visible elements

```typescript
await expect(jsonLd).toBeAttached();
```

`toBeAttached()` verifies the element exists in the DOM. `toBeVisible()` would fail on `<script>` tags — they are never rendered visually. `toBeAttached()` is the correct assertion for `<script>`, `<link>`, and `<meta>` elements in `<head>`.

## TODO 6 — @type assertion

```typescript
expect(parsed['@type']).toBe('SoftwareApplication');
```

`SoftwareApplication` is the schema.org type for web and desktop applications. Search engines use this to generate rich results (app rating, operating system, price) in search pages. Other common types: `Organization`, `Product`, `Article`, `FAQPage`.

## TODO 7 — Canonical href regex

```typescript
await expect(canonical).toHaveAttribute('href', /lumio\.io/);
```

The dot in `lumio\.io` is escaped because `.` in regex means "any character". Without escaping, `lumioXio` would also match. The regex approach avoids coupling the test to the exact canonical URL path, which may vary between pages (e.g., `/` vs `/pricing`).

## TODO 8 — robots.txt status 200

```typescript
expect(response.status()).toBe(200);
```

A robots.txt that returns 404 is treated by search engines as if the file doesn't exist — all paths are crawlable. A robots.txt that returns 500 causes crawlers to retry indefinitely. Both are bugs this test catches.

## TODO 9 — Disallow: / string

```typescript
expect(body).not.toContain('Disallow: /');
```

`'Disallow: /'` blocks all crawlers from the entire site. The default `''` always makes `not.toContain('')` fail — every string contains the empty string, so the assertion is always false with that default. Changing it to `'Disallow: /'` makes it a meaningful guard against accidental de-indexing.

## TODO 10 — Domain in sitemap

```typescript
expect(body).toContain('lumio.io');
```

A sitemap without the production domain likely points to a staging environment. This test catches the common deployment mistake of shipping a `sitemap.xml` generated against `localhost` or a staging URL that was never updated for production.

## TODO 11 — landingTitle for uniqueness

```typescript
expect(pricingTitle).not.toBe(landingTitle);
```

The failing default uses `pricingTitle` itself — `not.toBe(pricingTitle)` is always false (a string equals itself). Changing it to `landingTitle` tests the actual business rule: two different pages must have two different titles. Duplicate page titles are a common SEO regression when page templates share a hardcoded title string.
