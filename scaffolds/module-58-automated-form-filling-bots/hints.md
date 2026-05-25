# M58 Hints

## TODO 1 — Fill with task.title

```typescript
await page.getByTestId('task-title-input').fill(task.title);
```

## TODO 2 — Assert dialog closed

```typescript
await expect(page.getByRole('dialog')).not.toBeVisible();
```

## TODO 3 — Assert submitted length

```typescript
expect(submitted).toHaveLength(taskRows.length);
```

## TODO 4 — isVisible() before filling

```typescript
if (await dueDateInput.isVisible()) {
  await dueDateInput.fill('2024-12-31');
}
```

`isVisible()` is a non-strict check — it returns false if the element doesn't exist rather than throwing. This is the correct API for conditional interaction.

## TODO 5 — Assert 1 error

```typescript
expect(errors.length).toBe(1);
```

## TODO 6 — Assert 2 succeeded

```typescript
expect(succeeded.length).toBe(2);
```

## TODO 7 — Minimum delay

```typescript
const minDelayMs = 300;
```

For bots submitting to external services, increase to 1000–2000ms. For internal test environments, 100–300ms is usually sufficient.
