# Lesson 19 Hints

## Part 1 — Smoke Suite for Lumio (formerly M89)

## TODO 1.1 — Push 'tag' annotation

```typescript
testInfo.annotations.push({
  type: 'tag',
  description: '@smoke',
});
```

**Why it works:** The `'tag'` annotation type is rendered visually by the HTML reporter and serialized by the JSON reporter. It makes smoke membership queryable from test result data — a health dashboard can count how many smoke tests passed vs. failed without parsing test titles. `'PLACEHOLDER'` is a string, not an error, but the downstream assertion checking `type === 'tag'` would fail.

---

## TODO 1.1b — Assert title matches /Lumio/

```typescript
await expect(page).toHaveTitle(/Lumio/);
```

**Why it works:** The landing page `<title>` must contain the brand name. `/Lumio/` is a partial regex match — it passes even if the full title is "Lumio — Team Productivity". `/PLACEHOLDER/` matches nothing in the real title, so the assertion fails, which is the intended learner experience before filling in the TODO.

---

## TODO 1.2 — Assert 'Sign in' heading is visible

```typescript
await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
```

**Why it works:** The login page renders an `<h1>Sign in</h1>`. `getByRole('heading', { name: 'Sign in' })` targets it by semantic role and accessible name — this survives CSS changes, class renames, and layout restructuring. `'PLACEHOLDER'` matches no heading, so the locator finds nothing and times out.

---

## TODO 1.3 — Assert URL matches /dashboard/

```typescript
await expect(page).toHaveURL(/dashboard/);
```

**Why it works:** After a successful credential login, Lumio redirects to `/dashboard`. The regex `/dashboard/` is a partial match that passes even if the URL includes query params (`/dashboard?tab=activity`). `/PLACEHOLDER/` doesn't match the dashboard URL, so the assertion fails, showing the learner that the redirect isn't being verified.

---

## TODO 1.4 — Assert 'main' role is visible

```typescript
await expect(page.getByRole('main')).toBeVisible();
```

**Why it works:** The dashboard page wraps its content in a `<main>` element, which carries the `main` ARIA role. Asserting it is visible confirms the page rendered its primary content without a blank-screen error. `'PLACEHOLDER'` is not a valid ARIA role and throws a locator validation error immediately.

---

## TODO 1.5 — Assert URL matches /projects/

```typescript
await expect(page).toHaveURL(/projects/);
```

**Why it works:** Clicking the "Projects" navigation link navigates to a URL containing `/projects`. The regex is a partial match that doesn't depend on the exact path structure. `/PLACEHOLDER/` doesn't match the projects URL, so the navigation assertion fails, which is the intended state before the learner fills in the TODO.

---

## TODO 1.6 — Assert redirect URL matches /login/

```typescript
await expect(page).toHaveURL(/login/);
```

**Why it works:** Navigating to `/dashboard` while unauthenticated triggers a server-side redirect to `/login`. This is a critical security smoke check — if the redirect is broken, unauthenticated visitors see protected content. `/PLACEHOLDER/` doesn't match `/login`, so the assertion fails, signaling the learner that the unauthorized redirect check is incomplete.

---

## TODO 1.7 — Assert health endpoint returns 200

```typescript
expect(response.status()).toBe(200);
```

**Why it works:** `/api/health` returns HTTP 200 when the server and database are both reachable. Asserting `200` (not `999`) confirms the backend is operational. This is the fastest way to detect a deployment failure — if the app is up but the DB is down, the health endpoint returns 503, and this test fails immediately without needing to go through a login flow.

---

## TODO 1.8 — Assert logout URL matches /\/$|\/login/

```typescript
await expect(page).toHaveURL(/\/$|\/login/);
```

**Why it works:** After signing out, Lumio redirects to either the root `/` or the `/login` page depending on configuration. The regex `\/\$|\/login` matches both. `/PLACEHOLDER/` doesn't match either destination URL, so the logout redirect isn't verified — which is the intended failing state before the learner fills in the TODO.

## Part 2 — Full Regression Suite Organization (formerly M90)

## TODO 2.1 — Push '@smoke' annotation description

```typescript
testInfo.annotations.push({
  type: 'tag',
  description: '@smoke',
});
```

**Why it works:** `'@smoke'` is the description value that the JSON reporter serializes. A post-processing script filters `annotations.find(a => a.description === '@smoke')` to count smoke tests. `'PLACEHOLDER'` doesn't equal `'@smoke'`, so the `.find()` returns `undefined` and `undefined?.type !== 'tag'`, failing the assertion.

---

## TODO 2.2 — Push '@sanity' annotation description

```typescript
testInfo.annotations.push({
  type: 'tag',
  description: '@sanity',
});
```

**Why it works:** The sanity tier runs on every PR merge — it's faster than the nightly regression but more complete than smoke. Annotating with `'@sanity'` lets CI tooling select exactly this tier via `--grep "@sanity"`. With `'PLACEHOLDER'`, the `find(a => a.description === '@sanity')` returns `undefined`.

---

## TODO 2.3 — Push '@sanity' in the second annotation

```typescript
testInfo.annotations.push({ type: 'tag', description: '@sanity' });
```

**Why it works:** A test can belong to multiple tiers by pushing multiple annotations. `testInfo.annotations` is an array — pushing both `@smoke` and `@sanity` means the test appears in both `--grep "@smoke"` and `--grep "@smoke|@sanity"` runs. With `'PLACEHOLDER'`, `tags.toContain('@sanity')` fails because the array contains `'PLACEHOLDER'` instead.

---

## TODO 2.4 — No implementation needed (test.fixme)

`test.fixme()` marks the test body as an expected failure. Playwright skips the body entirely — the TODO inside the body is never executed. The learning goal is understanding the semantic: `fixme` means "this test represents real behavior that should work, but currently doesn't because of a tracked bug." It shows in the HTML report as orange (fixme), not red (failed), so CI remains green while the bug is being worked on.

---

## TODO 2.5 — Push '@regression' annotation description

```typescript
testInfo.annotations.push({
  type: 'tag',
  description: '@regression',
});
```

**Why it works:** The regression tier runs nightly. Tests in this tier can be slower and more thorough than smoke or sanity. `'@regression'` is the standard description value — the nightly CI job runs `npx playwright test` without a `--grep` filter, which runs all tests including regression-only ones. The annotation makes regression membership visible in the JSON report.

---

## TODO 2.6 — Use 'owner' as the annotation type

```typescript
testInfo.annotations.push({
  type: 'owner',
  description: 'platform-team',
});
```

**Why it works:** `'owner'` is a custom annotation type (not built-in to Playwright, but a team convention). The health dashboard reads `type === 'owner'` to route failure alerts to the right Slack channel. With `'PLACEHOLDER'` as the type, `find(a => a.type === 'owner')` returns `undefined` and `undefined?.description !== 'platform-team'`, failing the assertion.

---

## TODO 2.7 — Push '@slow' annotation description

```typescript
testInfo.annotations.push({
  type: 'tag',
  description: '@slow',
});
```

**Why it works:** `'@slow'` is the tag that enables exclusion via `--grep-invert "@slow"`. Any test with `@slow` in its title or annotation is skipped in the fast per-push and per-PR jobs. Visual regression tests, cross-browser runs, and i18n exhaustive checks are tagged slow because they take 30–60 seconds each and are not worth running on every push.

## Part 3 — Production Incident Reproduction (formerly M91)

## TODO 3.1 — Use devices['iPhone 14'] device preset

```typescript
const context = await browser.newContext(devices['iPhone 14']);
```

**Why it works:** `devices['iPhone 14']` is a Playwright-provided preset that sets viewport to 390×844, `userAgent` to the Safari/WebKit iOS string, `hasTouch: true`, and `isMobile: true`. Passing `{}` uses the default desktop context (1280px wide, no touch). The assertion `expect(viewport?.width).toBe(390)` fails with `{}` because the width is 1280.

---

## TODO 3.1b — Assert viewport width is 390

```typescript
expect(viewport?.width).toBe(390);
```

**Why it works:** iPhone 14 has a 390px CSS logical viewport width. `toBe(100)` fails because neither `{}` (1280) nor `devices['iPhone 14']` (390) produces 100. The fix — using the correct preset AND the correct expected value — confirms you've configured the mobile environment correctly.

---

## TODO 3.2 — Set incident ID annotation to 'LUM-INC-2024-11-15'

```typescript
testInfo.annotations.push({
  type: 'issue',
  description: 'LUM-INC-2024-11-15',
});
```

**Why it works:** The `'issue'` annotation type links the test to its incident report. Future engineers looking at a CI failure can click the issue link in the HTML report to see the full incident history. `'PLACEHOLDER'` doesn't match `'LUM-INC-2024-11-15'` — but the real learning goal here is the workflow: write the annotation BEFORE the fix, not after.

---

## TODO 3.3 — Assert 'In Progress' persists after reload

```typescript
await expect(taskCard.getByText('In Progress')).toBeVisible();
```

**Why it works:** This assertion represents the expected behavior after the bug is fixed. Before the fix, the card shows 'Todo' after reload, so asserting 'In Progress' fails — which is correct for a reproduction test. After the application code is fixed, the same assertion passes. The test code does not change; only the application changes.

---

## TODO 3.4 — Assert 'In Progress' is visible on Chromium

```typescript
await expect(taskCard.getByText('In Progress')).toBeVisible();
```

**Why it works:** The Chromium control test confirms the bug is platform-specific. If status persistence also fails on Chromium, the bug is not a WebKit-specific issue — it's a universal regression and needs a different diagnosis. 'PLACEHOLDER' doesn't match the status text, so the assertion fails, preventing the control test from providing its signal.

---

## TODO 3.5 — Assert statusUpdateRequest is not null

```typescript
expect(statusUpdateRequest).not.toBeNull();
```

**Why it works:** The route interceptor sets `statusUpdateRequest` only when a `PATCH /api/tasks/**` request is made. If the variable is still `null` after the tap, it means the status change never triggered an API call — the bug is in the request layer (the event handler didn't fire). If `not.toBeNull()` passes but the status still reverts, the bug is in the server response handling.

---

## TODO 3.6 — Set screenshots: true in tracing.start

```typescript
await context.tracing.start({ screenshots: true, snapshots: true });
```

**Why it works:** `screenshots: true` captures a visual filmstrip in the trace. `snapshots: true` records DOM snapshots for the Inspector tab. With `screenshots: false`, the trace zip is still created and attached, but the Trace Viewer filmstrip is empty — making it harder to correlate network requests with the UI state at the time of the tap.

---

## TODO 3.7 — Assert 'In Progress' persists in the regression guard

```typescript
await expect(taskCard.getByText('In Progress')).toBeVisible();
```

**Why it works:** This is the permanent regression guard. Once the bug is fixed, this assertion passes every time the nightly suite runs. If someone reintroduces the `e.preventDefault()` issue (or any other code that breaks status persistence on mobile WebKit), this test fails and the CI annotation points directly to the original incident. 'Todo' would only be correct if the status reverted — which is the bug, not the fix.

## Part 4 — End-to-End Review & Capstone (formerly M92)

## TODO 4.1 — signup

```typescript
await page.goto('/signup');
await page.getByTestId('signup-name').fill(NEW_USER.name);
await page.getByTestId('signup-email').fill(NEW_USER.email);
await page.getByTestId('signup-password').fill(NEW_USER.password);
await page.getByRole('button', { name: 'Create account' }).click();
await expect(page).toHaveURL(/\/dashboard/);
```

## TODO 4.2 — create project

```typescript
await page.getByTestId('new-project-button').click();
await page.getByTestId('project-name-input').fill('Capstone Project');
await page.getByRole('button', { name: 'Create' }).click();
await expect(page).toHaveURL(/\/projects\//);
```

## TODO 4.3 — add cards

```typescript
await kanban.addCard('Task 1: Research');
await kanban.addCard('Task 2: Design');
await kanban.addCard('Task 3: Implement');
```

## TODO 4.4 — drag to in-progress

```typescript
const firstCard = kanban.todoColumn.getByTestId('kanban-card').first();
await firstCard.dragTo(kanban.inProgressColumn);
```

## TODO 4.5 — axe audit

```typescript
const { violations } = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  .analyze();
expect(violations).toEqual([]);
```

## TODO 4.6 — performance budget

```typescript
const start = Date.now();
await page.reload();
await page.getByTestId('kanban-column-todo').waitFor();
const elapsed = Date.now() - start;
expect(elapsed).toBeLessThan(5000);
```

## TODO 4.7 — viewer navigation

```typescript
await viewerPage.goto('/projects/demo/board');
```

## TODO 4.8 — author adds card

```typescript
const cardTitle = `capstone-collab-${Date.now()}`;
await authorPage.getByTestId('add-card-button').click();
await authorPage.getByTestId('new-card-input').fill(cardTitle);
await authorPage.getByTestId('new-card-input').press('Enter');
```

## TODO 4.9 — viewer sees card

```typescript
await expect(
  viewerPage.getByTestId('kanban-card').filter({ hasText: cardTitle })
).toBeVisible();
```

## test.step() best practices

- Keep step names concise: "Sign up", "Create project", "Verify board"
- One logical action per step — steps appear in the trace viewer timeline
- Failures show the step name in the error message — makes CI reports readable
