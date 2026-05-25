# M51 Hints

## TODO 1 — mount and assert text

```tsx
const component = await mount(<KanbanCard title="Buy groceries" />);
await expect(component).toContainText('Buy groceries');
```

## TODO 2 — onDelete callback

```tsx
let deleted = false;
const component = await mount(
  <KanbanCard title="Delete me" onDelete={() => { deleted = true; }} />
);
await component.getByTestId('card-delete-btn').click();
expect(deleted).toBe(true);
```

## TODO 3 — done prop / CSS class

```tsx
const component = await mount(<KanbanCard title="Done task" done={true} />);
await expect(component).toHaveClass(/line-through/);
// or: await expect(component.getByTestId('card-completed-badge')).toBeVisible();
```

## TODO 4 — update()

```tsx
const component = await mount(<KanbanCard title="Before" />);
await component.update(<KanbanCard title="After" />);
await expect(component).toContainText('After');
```
