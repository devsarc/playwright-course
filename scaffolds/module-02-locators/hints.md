# M02 Hints

## TODO 1 — `getByRole('link', { name: 'Get started free' })`

```typescript
const cta = page.getByRole('link', { name: 'Get started free' });
```

## TODO 2 — `getByRole('heading', { level: 1 })`

```typescript
const heading = page.getByRole('heading', { level: 1 });
```

## TODO 3 — `getByText('Pricing', { exact: true })`

```typescript
const pricingLink = page.getByText('Pricing', { exact: true });
```

## TODO 4 — `getByRole('heading', { level: 3 })`

```typescript
const tierHeadings = page.getByRole('heading', { level: 3 });
```

## TODO 5 — `toHaveCount(3)`

```typescript
await expect(tierHeadings).toHaveCount(3);
```

## TODO 6 — `getByTestId('pricing-card-pro')`

```typescript
const proCard = page.getByTestId('pricing-card-pro');
```

## TODO 7 — `getByRole('link')` chained on proCard

```typescript
const proButton = proCard.getByRole('link');
```

## TODO 8 — `.nth(1)`

```typescript
const secondCard = page.getByTestId('feature-card').nth(1);
```

## TODO 9 — `.filter({ hasText: 'Kanban' })`

```typescript
const kanbanCard = page.getByTestId('feature-card').filter({ hasText: 'Kanban' });
```
