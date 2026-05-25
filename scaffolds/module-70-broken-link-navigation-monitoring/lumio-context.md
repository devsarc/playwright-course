# Lumio Context: M70

## What's in Lumio at this point

By M70, Lumio is a fully built application with multiple navigation layers:

**Header navigation** (public, all pages):
- `/` — Landing
- `/pricing` — Pricing
- `/docs` — Documentation
- `/blog` — Blog
- `/changelog` — Changelog

**Footer links** (public):
- `/privacy` — Privacy Policy
- `/terms` — Terms of Service
- `/about` — About
- `/changelog` — Changelog
- `/docs/api` — API Reference

**In-app sidebar navigation** (protected, requires auth):
- `/dashboard` — Dashboard
- `/projects` — Projects
- `/members` — Members
- `/settings` — Settings
- `/notifications` — Notifications

## Redirect behavior

Unauthenticated access to any `/dashboard`, `/projects`, `/members`, `/settings`, or `/notifications` path triggers an automatic redirect to `/login`. The redirect is a server-side 302, so `page.goto('/dashboard')` lands on `/login` for unauthenticated test contexts.

## Anchor links on the pricing page

The pricing page (`/pricing`) includes several in-page anchor navigation links:
- `#features` — Feature comparison table
- `#faq` — Frequently asked questions
- `#enterprise` — Enterprise plan details

These anchor links appear in the pricing page's sticky side nav and are commonly clicked from the header navigation, making them critical to keep intact.

## 404 behavior

Lumio uses Next.js's built-in `not-found.tsx` page, which correctly returns HTTP status 404 for unknown routes. This is important — some Next.js misconfigurations return 200 with the error UI, which causes search engines to index the 404 page as content.

## Why link monitoring matters for Lumio

Lumio's marketing team frequently adds blog posts, updates docs URLs, and renames feature pages. Without automated link checking, a renamed `/docs/getting-started` to `/docs/quickstart` would leave broken links scattered across the marketing site, eroding both SEO and user trust.
