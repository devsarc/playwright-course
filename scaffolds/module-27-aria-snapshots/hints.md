# M27 Hints

## TODO 1 — locate the kanban board container

```typescript
const board = page.getByTestId('kanban-board');
```

## TODO 2 — assert the board's heading and list structure

```typescript
await expect(board).toMatchAriaSnapshot(`
  - heading "Kanban Board" [level=1]
  - list:
    - listitem
    - listitem
    - listitem
`);
```

If you are unsure of the exact YAML, run the test once with `--update-snapshots`
and Playwright will generate the string for you. Then paste it back in and
remove the flag.

```bash
npx playwright test module-27 --update-snapshots
```

## TODO 3 — locate the first task card

```typescript
const firstCard = page.getByTestId('kanban-card').first();
```

## TODO 4 — assert the card's semantic structure

```typescript
await expect(firstCard).toMatchAriaSnapshot(`
  - listitem:
    - heading
    - text: /todo|in.progress|done/i
`);
```

The regex `/todo|in.progress|done/i` matches any of the three status strings.
Use a regex when the exact text may vary so the snapshot is not brittle.

## TODO 5 — locate and assert the "Add task" button

```typescript
const addTaskBtn = page.getByRole('button', { name: 'Add task' });
await expect(addTaskBtn).toMatchAriaSnapshot(`
  - button "Add task"
`);
```

## TODO 6 — assert the full dialog structure

```typescript
await expect(dialog).toMatchAriaSnapshot(`
  - dialog:
    - heading "New task" [level=2]
    - textbox "Task name"
    - combobox "Priority"
    - button "Save task"
`);
```

If the actual modal has more elements (e.g. a close button, description text),
add them to the YAML. Use `--update-snapshots` to capture the real structure
and trim it down to the parts that matter for your assertion.

## TODO 7 — close the modal and assert it is gone

```typescript
await page.keyboard.press('Escape');
await expect(dialog).toBeHidden();
```

`toBeHidden()` checks that the element is either not in the DOM or has
`visibility: hidden` / `display: none`. Either way it is no longer accessible
to assistive technology.

## TODO 8 — the --update-snapshots workflow

When you change the UI intentionally, run:

```bash
npx playwright test module-27 --update-snapshots
```

Playwright rewrites every `toMatchAriaSnapshot()` call with the current
accessibility tree. Always review the git diff before committing — you are
approving a new semantic contract for the component.

## Generating the initial YAML with Trace Viewer

1. Run the test without any expected string: `await expect(locator).toMatchAriaSnapshot('')`
2. The test will fail and print the actual ARIA tree in the error output.
3. Alternatively, open the Trace Viewer after a run and use the **Inspector tab**
   → select the locator → copy the ARIA snapshot YAML from the panel.
4. Paste the YAML back into the test as the expected string and remove `--update-snapshots`.

## Reading ARIA snapshot YAML

Each line is an accessibility node. The indentation represents parent–child
relationships. Key tokens:

| Token | Meaning |
|-------|---------|
| `- role "name"` | Node with explicit accessible name |
| `- role [level=N]` | Heading level (1–6) |
| `- text: /regex/` | Text node matched by regex |
| `- text: "exact"` | Text node with exact content |
| `- role: ...` | Node with children on subsequent indented lines |
