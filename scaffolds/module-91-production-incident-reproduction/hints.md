# Hints — M91: Production Incident Reproduction

## TODO 1 — Use devices['iPhone 14'] device preset

```typescript
const context = await browser.newContext(devices['iPhone 14']);
```

**Why it works:** `devices['iPhone 14']` is a Playwright-provided preset that sets viewport to 390×844, `userAgent` to the Safari/WebKit iOS string, `hasTouch: true`, and `isMobile: true`. Passing `{}` uses the default desktop context (1280px wide, no touch). The assertion `expect(viewport?.width).toBe(390)` fails with `{}` because the width is 1280.

---

## TODO 1b — Assert viewport width is 390

```typescript
expect(viewport?.width).toBe(390);
```

**Why it works:** iPhone 14 has a 390px CSS logical viewport width. `toBe(100)` fails because neither `{}` (1280) nor `devices['iPhone 14']` (390) produces 100. The fix — using the correct preset AND the correct expected value — confirms you've configured the mobile environment correctly.

---

## TODO 2 — Set incident ID annotation to 'LUM-INC-2024-11-15'

```typescript
testInfo.annotations.push({
  type: 'issue',
  description: 'LUM-INC-2024-11-15',
});
```

**Why it works:** The `'issue'` annotation type links the test to its incident report. Future engineers looking at a CI failure can click the issue link in the HTML report to see the full incident history. `'PLACEHOLDER'` doesn't match `'LUM-INC-2024-11-15'` — but the real learning goal here is the workflow: write the annotation BEFORE the fix, not after.

---

## TODO 3 — Assert 'In Progress' persists after reload

```typescript
await expect(taskCard.getByText('In Progress')).toBeVisible();
```

**Why it works:** This assertion represents the expected behavior after the bug is fixed. Before the fix, the card shows 'Todo' after reload, so asserting 'In Progress' fails — which is correct for a reproduction test. After the application code is fixed, the same assertion passes. The test code does not change; only the application changes.

---

## TODO 4 — Assert 'In Progress' is visible on Chromium

```typescript
await expect(taskCard.getByText('In Progress')).toBeVisible();
```

**Why it works:** The Chromium control test confirms the bug is platform-specific. If status persistence also fails on Chromium, the bug is not a WebKit-specific issue — it's a universal regression and needs a different diagnosis. 'PLACEHOLDER' doesn't match the status text, so the assertion fails, preventing the control test from providing its signal.

---

## TODO 5 — Assert statusUpdateRequest is not null

```typescript
expect(statusUpdateRequest).not.toBeNull();
```

**Why it works:** The route interceptor sets `statusUpdateRequest` only when a `PATCH /api/tasks/**` request is made. If the variable is still `null` after the tap, it means the status change never triggered an API call — the bug is in the request layer (the event handler didn't fire). If `not.toBeNull()` passes but the status still reverts, the bug is in the server response handling.

---

## TODO 6 — Set screenshots: true in tracing.start

```typescript
await context.tracing.start({ screenshots: true, snapshots: true });
```

**Why it works:** `screenshots: true` captures a visual filmstrip in the trace. `snapshots: true` records DOM snapshots for the Inspector tab. With `screenshots: false`, the trace zip is still created and attached, but the Trace Viewer filmstrip is empty — making it harder to correlate network requests with the UI state at the time of the tap.

---

## TODO 7 — Assert 'In Progress' persists in the regression guard

```typescript
await expect(taskCard.getByText('In Progress')).toBeVisible();
```

**Why it works:** This is the permanent regression guard. Once the bug is fixed, this assertion passes every time the nightly suite runs. If someone reintroduces the `e.preventDefault()` issue (or any other code that breaks status persistence on mobile WebKit), this test fails and the CI annotation points directly to the original incident. 'Todo' would only be correct if the status reverted — which is the bug, not the fix.
