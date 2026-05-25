# Lumio Context: M00

## What's in Lumio at this point

At M00, Lumio has only a single page: the marketing landing page at `/`.

It has:
- A `<title>` in the HTML `<head>` (managed by Next.js App Router's `metadata` export)
- An `<h1>` heading visible in the viewport

That's it. No auth, no dashboard, no API. This is intentional — M00 is about
proving your Playwright environment works, not about testing real product behavior.

## Where these files live

```
lumio/
└── app/
    ├── layout.tsx       ← exports metadata (includes the page <title>)
    └── page.tsx         ← the landing page with the <h1>
```

## How Next.js serves the title

In App Router, page titles come from the `metadata` export in `layout.tsx` or `page.tsx`:

```typescript
// lumio/app/layout.tsx
export const metadata = {
  title: 'Lumio — Team Productivity',
};
```

Playwright's `toHaveTitle()` reads the `<title>` tag the browser renders.
