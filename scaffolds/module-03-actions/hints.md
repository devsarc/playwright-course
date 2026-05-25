# M03 Hints

## TODO 1 — `.click()` after getByRole

```typescript
await page.getByRole('link', { name: 'Pricing' }).click();
```

## TODO 2 — `toHaveURL`

```typescript
await expect(page).toHaveURL(/\/pricing/);
// or exact string:
await expect(page).toHaveURL('http://localhost:3000/pricing');
```

## TODO 3 — `.hover()`

```typescript
await page.getByRole('link', { name: 'Sign in' }).hover();
```

## TODO 4 — `getByLabel('Email address')`

```typescript
await page.getByLabel('Email address').fill('test@lumio.dev');
```

The `<label for="email">` in login/page.tsx creates the association.
`getByLabel` matches on the label's text content.

## TODO 5 — `.press('Enter')`

```typescript
await page.getByLabel('Password').press('Enter');
```

## TODO 6 — `.pressSequentially('hello')`

```typescript
await page.getByLabel('Email address').pressSequentially('hello');
```

## TODO 7 — test.fixme

`test.fixme(true, 'reason')` marks the test as expected-to-fail.
It won't fail your suite but will appear in the report as "fixme".
Use it to track known limitations without deleting the test.
