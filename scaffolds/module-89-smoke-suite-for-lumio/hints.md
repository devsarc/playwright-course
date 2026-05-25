# Hints — M89: Smoke Suite for Lumio

## TODO 1 — Push 'tag' annotation

```typescript
testInfo.annotations.push({
  type: 'tag',
  description: '@smoke',
});
```

**Why it works:** The `'tag'` annotation type is rendered visually by the HTML reporter and serialized by the JSON reporter. It makes smoke membership queryable from test result data — a health dashboard can count how many smoke tests passed vs. failed without parsing test titles. `'PLACEHOLDER'` is a string, not an error, but the downstream assertion checking `type === 'tag'` would fail.

---

## TODO 1b — Assert title matches /Lumio/

```typescript
await expect(page).toHaveTitle(/Lumio/);
```

**Why it works:** The landing page `<title>` must contain the brand name. `/Lumio/` is a partial regex match — it passes even if the full title is "Lumio — Team Productivity". `/PLACEHOLDER/` matches nothing in the real title, so the assertion fails, which is the intended learner experience before filling in the TODO.

---

## TODO 2 — Assert 'Sign in' heading is visible

```typescript
await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
```

**Why it works:** The login page renders an `<h1>Sign in</h1>`. `getByRole('heading', { name: 'Sign in' })` targets it by semantic role and accessible name — this survives CSS changes, class renames, and layout restructuring. `'PLACEHOLDER'` matches no heading, so the locator finds nothing and times out.

---

## TODO 3 — Assert URL matches /dashboard/

```typescript
await expect(page).toHaveURL(/dashboard/);
```

**Why it works:** After a successful credential login, Lumio redirects to `/dashboard`. The regex `/dashboard/` is a partial match that passes even if the URL includes query params (`/dashboard?tab=activity`). `/PLACEHOLDER/` doesn't match the dashboard URL, so the assertion fails, showing the learner that the redirect isn't being verified.

---

## TODO 4 — Assert 'main' role is visible

```typescript
await expect(page.getByRole('main')).toBeVisible();
```

**Why it works:** The dashboard page wraps its content in a `<main>` element, which carries the `main` ARIA role. Asserting it is visible confirms the page rendered its primary content without a blank-screen error. `'PLACEHOLDER'` is not a valid ARIA role and throws a locator validation error immediately.

---

## TODO 5 — Assert URL matches /projects/

```typescript
await expect(page).toHaveURL(/projects/);
```

**Why it works:** Clicking the "Projects" navigation link navigates to a URL containing `/projects`. The regex is a partial match that doesn't depend on the exact path structure. `/PLACEHOLDER/` doesn't match the projects URL, so the navigation assertion fails, which is the intended state before the learner fills in the TODO.

---

## TODO 6 — Assert redirect URL matches /login/

```typescript
await expect(page).toHaveURL(/login/);
```

**Why it works:** Navigating to `/dashboard` while unauthenticated triggers a server-side redirect to `/login`. This is a critical security smoke check — if the redirect is broken, unauthenticated visitors see protected content. `/PLACEHOLDER/` doesn't match `/login`, so the assertion fails, signaling the learner that the unauthorized redirect check is incomplete.

---

## TODO 7 — Assert health endpoint returns 200

```typescript
expect(response.status()).toBe(200);
```

**Why it works:** `/api/health` returns HTTP 200 when the server and database are both reachable. Asserting `200` (not `999`) confirms the backend is operational. This is the fastest way to detect a deployment failure — if the app is up but the DB is down, the health endpoint returns 503, and this test fails immediately without needing to go through a login flow.

---

## TODO 8 — Assert logout URL matches /\/$|\/login/

```typescript
await expect(page).toHaveURL(/\/$|\/login/);
```

**Why it works:** After signing out, Lumio redirects to either the root `/` or the `/login` page depending on configuration. The regex `\/\$|\/login` matches both. `/PLACEHOLDER/` doesn't match either destination URL, so the logout redirect isn't verified — which is the intended failing state before the learner fills in the TODO.
