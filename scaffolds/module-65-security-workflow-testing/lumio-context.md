# Lumio Context: M65

## What's in Lumio at this point

Lumio's security infrastructure (from earlier modules) includes:
- **NextAuth.js v5** session management with JWT tokens stored in `next-auth.session-token` cookie
- **CSRF protection** via `next-auth`'s built-in CSRF token mechanism (embedded in each form)
- **Route protection** via middleware in `lumio/middleware.ts` — redirects unauthenticated requests to `/login`
- **Admin-only routes** at `/admin/**` — redirect non-admin sessions to `/dashboard`
- **React rendering** with JSX (which HTML-escapes all interpolated values by default)

## The XSS situation in Lumio

React's JSX automatically escapes interpolated values — `{userInput}` renders the text, not the HTML. This prevents the most common stored XSS vector. The risk exists in two places:

1. **`dangerouslySetInnerHTML`** — used in the task description renderer when rendering Markdown. TipTap sanitizes HTML before passing it to `dangerouslySetInnerHTML`.
2. **SVG rendering** — SVG injection is a category React doesn't protect against out of the box.

The M65 exercises test the simpler title field, which uses standard JSX interpolation and should be immune to XSS by construction.

## API key page

`/settings/api` displays the user's Lumio API key. The key value is visible in the DOM (with a copy button) and has `data-testid="api-key-value"`. This is the target for the screenshot masking exercise — if a test screenshot is uploaded to a public artifact store, an unmasked key is a credential leak.

## CSRF in forms

Every Lumio form that performs a state-changing action (settings save, password change, workspace delete) includes:
- A hidden `<input name="csrf_token">` populated by the server
- The client reads the value and sends it as the `X-CSRF-Token` request header
- The server validates the header matches the session-bound token
