# M10 Hints

## TODO 1 — Assert email input visible

```typescript
await expect(page.getByLabel('Email address')).toBeVisible();
```

## TODO 2 — Assert password input visible

```typescript
await expect(page.getByLabel('Password')).toBeVisible();
```

## TODO 3 — Assert submit button visible and enabled

```typescript
await expect(submitButton).toBeVisible();
await expect(submitButton).toBeEnabled();
```

`toBeEnabled()` checks the button doesn't have the `disabled` attribute.

## TODO 4 — Assert error alert visible

```typescript
await expect(errorAlert).toBeVisible();
```

The login page renders `<div role="alert">` after a failed submission.
The `role="alert"` makes it accessible and lets `getByRole('alert')` find it.
