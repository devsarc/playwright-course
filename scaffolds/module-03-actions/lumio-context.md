# Lumio Context: M03

## Pages used in M03

- `/` — landing page (Pricing nav link, Sign in link)
- `/login` — login form (Email address + Password labels)
- `/onboarding/workspace` — workspace creation form (referenced but skipped)

## Action targets

| Element | Locator | Action tested |
|---------|---------|---------------|
| "Pricing" nav link | `getByRole('link', { name: 'Pricing' })` | `click()` |
| "Sign in" nav link | `getByRole('link', { name: 'Sign in' })` | `hover()` |
| Email input | `getByLabel('Email address')` | `fill()`, `pressSequentially()` |
| Password input | `getByLabel('Password')` | `press('Enter')` |

## Why the `selectOption` test is fixme

Lumio uses Radix UI's `<Select>` component, which renders as a custom div-based
dropdown — not a native `<select>` element. `selectOption()` only works on native
`<select>`. The correct pattern for Radix Select:

```typescript
// 1. Click the trigger to open the dropdown
await page.getByRole('combobox', { name: 'Priority' }).click();
// 2. Click the desired option
await page.getByRole('option', { name: 'High' }).click();
```

M20 introduces Lumio's task creation form with a Radix Select — that's where this
pattern is properly exercised.
