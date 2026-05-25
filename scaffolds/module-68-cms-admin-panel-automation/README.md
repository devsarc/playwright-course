# M68: CMS & Admin Panel Automation

## Learning Objectives

- Automate sorting, filtering, and paginating Lumio's admin user table
- Execute a bulk delete operation across multiple selected rows
- Upload a workspace logo through the admin media upload interface
- Apply reliable locator strategies for complex data tables

## Concept

Admin panels present a different automation challenge than user-facing UIs. They contain dense data tables with sortable columns, filter inputs, pagination controls, and bulk operation toolbars. The interactions are correct but the locators are tricky — rows are dynamic, column headers double as sort triggers, and bulk operations require coordinated multi-element interactions.

**Data table automation patterns.**

A sortable table column is typically both a display element and a button. Clicking it once sorts ascending; clicking again sorts descending. The sorted state is usually communicated via an `aria-sort` attribute:

```typescript
const emailHeader = page.getByRole('columnheader', { name: 'Email' });
await emailHeader.click(); // sort ascending
await expect(emailHeader).toHaveAttribute('aria-sort', 'ascending');

await emailHeader.click(); // sort descending
await expect(emailHeader).toHaveAttribute('aria-sort', 'descending');
```

Using `getByRole('columnheader')` is the most robust locator for table headers — it's label-based and survives DOM restructuring.

**Filtering a table.**

Filter inputs update the table's visible rows. Assert the result by checking the row count or the content of specific cells:

```typescript
const filterInput = page.getByPlaceholder('Filter by email');
await filterInput.fill('alice@');
await expect(page.getByRole('row')).toHaveCount(2); // 1 header + 1 matching row
```

Use `toHaveCount()` with a concrete value when you control the test data. When you don't control the data, assert that the count decreased:

```typescript
const beforeCount = await page.getByRole('row').count();
await filterInput.fill('admin@lumio.test');
const afterCount = await page.getByRole('row').count();
expect(afterCount).toBeLessThan(beforeCount);
```

**Pagination.**

Paginating a table involves clicking page controls and asserting the new content. The most reliable assertion is checking the "showing X–Y of Z" status text, which is guaranteed to change between pages:

```typescript
await page.getByRole('button', { name: 'Next page' }).click();
await expect(page.getByTestId('pagination-status')).toContainText('11–20');
```

**Bulk operations.**

Bulk operations require: selecting multiple rows, then triggering the action. The select-all checkbox and per-row checkboxes work together:

```typescript
// Select first three rows individually
await page.getByRole('row').nth(1).getByRole('checkbox').check(); // row 1 (nth(0) is header)
await page.getByRole('row').nth(2).getByRole('checkbox').check();
await page.getByRole('row').nth(3).getByRole('checkbox').check();

// The bulk actions toolbar should appear
await expect(page.getByTestId('bulk-actions-toolbar')).toBeVisible();

// Perform the bulk action
await page.getByRole('button', { name: 'Delete selected' }).click();
await page.getByRole('button', { name: 'Confirm' }).click();
```

After a bulk delete, assert the row count decreased by the number deleted.

**Admin media upload.**

File upload in an admin panel (logo, avatar) uses `setInputFiles()` on the file input:

```typescript
await page.getByLabel('Workspace logo').setInputFiles('tests/fixtures/logo.png');
await page.getByRole('button', { name: 'Upload' }).click();
await expect(page.getByTestId('logo-preview')).toBeVisible();
```

If the upload input is hidden (triggered by a custom button), click the visible button and then set files on the input directly:

```typescript
const fileInput = page.locator('input[type="file"]');
await fileInput.setInputFiles('tests/fixtures/logo.png');
```

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-68-cms-admin-panel-automation
```

## Key Takeaways

1. `getByRole('columnheader', { name })` is the most robust locator for sortable table headers.
2. Assert sort state via `aria-sort` attribute values: `'ascending'` or `'descending'`.
3. Filter tests should assert row count change — either exact (with controlled data) or relative (decreased).
4. Bulk operations require selecting rows first; assert the bulk toolbar appears before triggering the action.
5. File upload on hidden inputs: call `setInputFiles()` on the `input[type="file"]` directly, bypassing the styled button.

## Going Deeper

- [Playwright docs: setInputFiles()](https://playwright.dev/docs/api/class-locator#locator-set-input-files)
- [ARIA: aria-sort attribute](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-sort)
- [Playwright docs: toHaveCount()](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-count)
