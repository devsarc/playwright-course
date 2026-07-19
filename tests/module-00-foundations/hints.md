# Lesson 00 Hints

## Part 1 — Setup & Project Structure (formerly M00)

## TODO 1.1 — `page.goto('/')`

`page.goto` takes a path string. When `baseURL` is set in `playwright.config.ts`,
Playwright prepends it automatically:

```typescript
await page.goto('/');
// resolves to: http://localhost:3000/
```

## TODO 1.2 — `toHaveTitle`

`toHaveTitle` accepts a string (exact match) or a RegExp (partial match).
To assert any non-empty title, use `/\w+/`:

```typescript
await expect(page).toHaveTitle(/\w+/);
```

If you want to be specific about Lumio's title:
```typescript
await expect(page).toHaveTitle(/Lumio/);
```

## TODO 1.3 — `getByRole('heading', { level: 1 })`

`page.getByRole` takes the ARIA role and optional options:

```typescript
const heading = page.getByRole('heading', { level: 1 });
```

## TODO 1.4 — `toBeVisible()`

```typescript
await expect(heading).toBeVisible();
```

## Part 3 — Locators — Finding Elements (formerly M02)

## TODO 3.1 — `getByRole('link', { name: 'Get started free' })`

```typescript
const cta = page.getByRole('link', { name: 'Get started free' });
```

## TODO 3.2 — `getByRole('heading', { level: 1 })`

```typescript
const heading = page.getByRole('heading', { level: 1 });
```

## TODO 3.3 — `getByText('Pricing', { exact: true })`

```typescript
const pricingLink = page.getByText('Pricing', { exact: true });
```

## TODO 3.4 — `getByRole('heading', { level: 3 })`

```typescript
const tierHeadings = page.getByRole('heading', { level: 3 });
```

## TODO 3.5 — `toHaveCount(3)`

```typescript
await expect(tierHeadings).toHaveCount(3);
```

## TODO 3.6 — `getByTestId('pricing-card-pro')`

```typescript
const proCard = page.getByTestId('pricing-card-pro');
```

## TODO 3.7 — `getByRole('link')` chained on proCard

```typescript
const proButton = proCard.getByRole('link');
```

## TODO 3.8 — `.nth(1)`

```typescript
const secondCard = page.getByTestId('feature-card').nth(1);
```

## TODO 3.9 — `.filter({ hasText: 'Kanban' })`

```typescript
const kanbanCard = page.getByTestId('feature-card').filter({ hasText: 'Kanban' });
```

## Part 4 — Actions — Interacting with Elements (formerly M03)

## TODO 4.1 — `.click()` after getByRole

```typescript
await page.getByRole('link', { name: 'Pricing' }).click();
```

## TODO 4.2 — `toHaveURL`

```typescript
await expect(page).toHaveURL(/\/pricing/);
// or exact string:
await expect(page).toHaveURL('http://localhost:3000/pricing');
```

## TODO 4.3 — `.hover()`

```typescript
await page.getByRole('link', { name: 'Sign in' }).hover();
```

## TODO 4.4 — `getByLabel('Email address')`

```typescript
await page.getByLabel('Email address').fill('test@lumio.dev');
```

The `<label for="email">` in login/page.tsx creates the association.
`getByLabel` matches on the label's text content.

## TODO 4.5 — `.press('Enter')`

```typescript
await page.getByLabel('Password').press('Enter');
```

## TODO 4.6 — `.pressSequentially('hello')`

```typescript
await page.getByLabel('Email address').pressSequentially('hello');
```

## TODO 4.7 — test.fixme

`test.fixme(true, 'reason')` marks the test as expected-to-fail.
It won't fail your suite but will appear in the report as "fixme".
Use it to track known limitations without deleting the test.

## Part 5 — Assertions — Verifying State (formerly M04)

## TODO 5.1 — `toHaveTitle`
```typescript
await expect(page).toHaveTitle(/Lumio/);
```

## TODO 5.2 — `toHaveURL`
```typescript
await expect(page).toHaveURL(/localhost:3000/);
```

## TODO 5.3 — `toBeVisible`
```typescript
await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
```

## TODO 5.4 — `toHaveText`
```typescript
await expect(freeHeading).toHaveText('Free');
```

## TODO 5.5 — `toHaveCount`
```typescript
await expect(page.getByTestId('feature-card')).toHaveCount(4);
```

## TODO 5.6 — `toHaveAttribute`
```typescript
await expect(ctaLink).toHaveAttribute('href', '/signup');
```

## TODO 5.7 — `expect.soft(...).toBeVisible()`
```typescript
await expect.soft(page.getByRole('heading', { level: 1 })).toBeVisible();
```

## TODO 5.8 — `expect.soft(page).toHaveTitle`
```typescript
await expect.soft(page).toHaveTitle(/Lumio/);
```

## TODO 5.9 — `expect.poll(() => counter)`
```typescript
await expect.poll(() => counter, { timeout: 2000 }).toBe(5);
```

The first argument to `expect.poll` is a function (not a value).
Playwright calls this function repeatedly until the assertion passes.

## Part 6 — Navigation & Page State (formerly M05)

## TODO 6.1 — `page.goto('/docs')`
```typescript
await page.goto('/docs');
```

## TODO 6.2 — `page.reload()`
```typescript
await page.reload();
```

## TODO 6.3 — `page.goBack()`
```typescript
await page.goBack();
```

## TODO 6.4 — `page.goForward()`
```typescript
await page.goForward();
```

## TODO 6.5 — `waitForURL`
```typescript
await page.waitForURL(/dashboard/, { timeout: 10_000 });
```
Note: the login test requires the test database to be seeded with test@lumio.dev.
Run `npm run db:seed --prefix lumio` if you haven't already.

## TODO 6.6 — `waitForLoadState`
```typescript
await page.waitForLoadState('domcontentloaded');
```

## TODO 6.7 — `waitForResponse`
```typescript
const responsePromise = page.waitForResponse(/\/api\//);
```
Create the promise BEFORE the navigation — not after. If created after,
the response may have already arrived and the promise will never resolve.
