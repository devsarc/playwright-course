# M80 Hints

## TODO 1 — Snapshot not null

```typescript
expect(snapshot).not.toBeNull();
```

`page.accessibility.snapshot()` returns `null` only for pages with no accessible content (e.g., an empty `<body>`). Any rendered Lumio page will have an accessible tree. The default `toBeNull()` asserts the snapshot IS null — always fails for a rendered page.

## TODO 2 — Main landmark not undefined

```typescript
expect(mainLandmark).not.toBeUndefined();
```

`snapshot.children.find()` returns `undefined` when no child matches the predicate. The default `toBeUndefined()` asserts no main landmark exists, which always fails for a properly structured page. The main landmark is how agents scope their interactions to the page content area.

## TODO 3 — Admin users URL regex

```typescript
await expect(page).toHaveURL(/\/admin\/users$/);
```

`/PLACEHOLDER/` won't match `/admin/users`. The `$` anchor ensures the URL ends with `/admin/users` — preventing false matches if a future URL has `/admin/users/detail`. Forward slashes in the regex are escaped with `\/`.

## TODO 4 — New task button name

```typescript
await page.getByRole('button', { name: 'New task' }).click();
```

`'PLACEHOLDER'` finds no button. This is the direct Playwright equivalent of what the MCP `browser_click` tool does when an agent says "click the New task button" — it uses the accessible name from the snapshot to identify the element.

## TODO 5 — document.title via evaluate

```typescript
const title = await page.evaluate(() => document.title);
```

The arrow function `() => ''` returns an empty string, which won't match `/Lumio/`. `document.title` reads the current document title — the same value `toHaveTitle()` waits for. This is what MCP's `browser_evaluate` tool executes when an agent requests page metadata.

## TODO 6 — Task title label

```typescript
await page.getByLabel('Task title').fill('Agent-created task');
```

`'PLACEHOLDER'` finds no input with that label. `getByLabel('Task title')` scopes to the input associated with the "Task title" label — the same association that MCP's `browser_type` tool uses when an agent instructs it to type into a labeled field.

## TODO 7 — hasNewTaskButton is true

```typescript
expect(hasNewTaskButton).toBe(true);
```

`false` always fails. The accessibility snapshot serialized to JSON should contain "New task" somewhere in the button name — confirming the button is discoverable without running any locator. This verifies that the MCP `browser_snapshot` → `browser_click` sequence can find the button before attempting to click it.
