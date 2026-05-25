# M20 Hints — Form Automation & Validation

## TODO 1 — Navigate to the workspace creation form

`page.goto()` accepts any absolute URL. The Lumio workspace creation form lives at `/onboarding/workspace` on `localhost:3000`.

```typescript
await page.goto('http://localhost:3000/onboarding/workspace');
```

---

## TODO 2 — Assert the workspace name input is visible

`getByTestId()` looks up an element by its `data-testid` attribute. Chain it with `toBeVisible()` to confirm the element is rendered and not hidden.

```typescript
await expect(page.getByTestId('workspace-name-input')).toBeVisible();
```

---

## TODO 3 — Click the submit button without filling any fields

Use `getByTestId()` with the submit button's `data-testid` to locate the button, then call `.click()` on it.

```typescript
await page.getByTestId('workspace-submit-button').click();
```

---

## TODO 4 — Assert at least one validation alert is visible

`getByRole('alert')` matches any element with `role="alert"` in the DOM. When multiple validation errors are shown, this locator matches the first one by default — enough to confirm the form rejected the empty submission.

```typescript
await expect(page.getByRole('alert')).toBeVisible();
```

---

## TODO 5 — Fill the workspace name input

Pass a string value to `fill()`. Use something unique enough to avoid slug collisions with other tests, but it can be any human-readable workspace name.

```typescript
await page.getByTestId('workspace-name-input').fill('Acme Corp');
```

---

## TODO 6 — Select the 'pro' plan from the Radix Select dropdown

After clicking the trigger (`workspace-plan-select`), the floating panel renders the options into the DOM. Each option has a `data-testid` of `workspace-plan-option-{value}`. For the pro plan, that is `workspace-plan-option-pro`.

```typescript
await page.getByTestId('workspace-plan-select').click();
await page.getByTestId('workspace-plan-option-pro').click();
```

---

## TODO 7 — Assert the redirect URL after successful submission

After the form submits successfully, Lumio redirects to the next onboarding step. Use `toHaveURL()` with the full expected path.

```typescript
await expect(page).toHaveURL('http://localhost:3000/onboarding/invite');
```

---

## TODO 8 — Assert the duplicate slug error message

After submitting a duplicate slug, the server returns an error and the UI renders it inside a `role="alert"` element. Filter the alert by a fragment of the expected error copy to be specific without coupling to the exact full string.

```typescript
await expect(
  page.getByRole('alert').filter({ hasText: 'already taken' })
).toBeVisible();
```
