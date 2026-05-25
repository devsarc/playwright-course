import { test, expect } from '../fixtures/fixtures';
import path from 'path';

// M68: CMS & Admin Panel Automation

test.describe('M68 — CMS & Admin Panel Automation', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the admin users page before each test
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
  });

  // Test 1: Sort the user table by email column
  test('clicking email column header sorts the table ascending then descending', async ({ page }) => {
    // TODO 1: Use getByRole('columnheader', { name: 'Email' }) to locate the email column header.
    // Why? getByRole('columnheader') is the most robust locator — it survives DOM restructuring.
    const emailHeader = page.getByRole(/* TODO 1: 'columnheader', { name: 'Email' } */ 'heading', { name: 'PLACEHOLDER' });

    await emailHeader.click();

    // TODO 2: Assert that emailHeader has attribute 'aria-sort' with value 'ascending'.
    await expect(emailHeader).toHaveAttribute(/* TODO 2: 'aria-sort', 'ascending' */ 'data-x', 'PLACEHOLDER');
  });

  // Test 2: Sort descending on second click
  test('second click on column header sorts descending', async ({ page }) => {
    const emailHeader = page.getByRole('columnheader', { name: 'Email' });

    await emailHeader.click(); // ascending
    await emailHeader.click(); // descending

    // TODO 3: Assert that emailHeader has attribute 'aria-sort' with value 'descending'.
    await expect(emailHeader).toHaveAttribute('aria-sort', /* TODO 3: 'descending' */ 'PLACEHOLDER');
  });

  // Test 3: Filter the user table by email
  test('filtering by email reduces visible rows', async ({ page }) => {
    const allRows = page.getByRole('row');
    const initialCount = await allRows.count(); // includes header row

    // TODO 4: Fill the filter input (placeholder 'Filter by email') with 'admin@'.
    const filterInput = page.getByPlaceholder(/* TODO 4: 'Filter by email' */ 'PLACEHOLDER');
    await filterInput.fill('admin@');

    await page.waitForTimeout(300); // debounce

    // TODO 5: Assert that allRows.count() is less than initialCount (filter reduced the rows).
    const afterCount = await allRows.count();
    expect(afterCount).toBeLessThan(/* TODO 5: initialCount */ 0);
  });

  // Test 4: Pagination — navigate to next page
  test('next page button changes the displayed rows', async ({ page }) => {
    const statusBefore = await page.getByTestId('pagination-status').textContent();

    // TODO 6: Click the 'Next page' button using getByRole('button', { name: 'Next page' }).
    await page.getByRole('button', { name: /* TODO 6: 'Next page' */ 'PLACEHOLDER' }).click();
    await page.waitForLoadState('networkidle');

    const statusAfter = await page.getByTestId('pagination-status').textContent();

    // TODO 7: Assert that statusAfter is not equal to statusBefore (page changed).
    expect(statusAfter).not.toBe(/* TODO 7: statusBefore */ '');
  });

  // Test 5: Select rows and trigger bulk delete
  test('bulk delete removes selected users', async ({ page }) => {
    const rows = page.getByRole('row');
    const initialCount = await rows.count();

    // Select rows 1, 2, and 3 (index 0 is the header row)
    // TODO 8: Check the checkbox in row nth(1) using getByRole('checkbox').check().
    await rows.nth(1).getByRole(/* TODO 8: 'checkbox' */ 'PLACEHOLDER').check();
    await rows.nth(2).getByRole('checkbox').check();
    await rows.nth(3).getByRole('checkbox').check();

    // Bulk toolbar should appear
    await expect(page.getByTestId('bulk-actions-toolbar')).toBeVisible();

    await page.getByRole('button', { name: 'Delete selected' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.waitForLoadState('networkidle');

    // TODO 9: Assert that row count is now initialCount - 3.
    await expect(rows).toHaveCount(/* TODO 9: initialCount - 3 */ initialCount);
  });

  // Test 6: Upload a workspace logo
  test('workspace logo upload shows preview', async ({ page }) => {
    await page.goto('/admin/settings');

    const logoFile = path.join(__dirname, '../../fixtures/logo.png');

    // The logo upload input may be hidden behind a custom button
    // TODO 10: Use setInputFiles() on the hidden input[type="file"] to upload the logo.
    // Why? setInputFiles() bypasses the OS file picker — it works on hidden inputs directly.
    await page.locator(/* TODO 10: 'input[type="file"]' */ 'input[type="PLACEHOLDER"]').setInputFiles(logoFile);

    await page.getByRole('button', { name: 'Upload' }).click();
    await page.waitForLoadState('networkidle');

    // TODO 11: Assert that the logo preview element is visible.
    await expect(page.getByTestId('logo-preview'))./* TODO 11: toBeVisible() */ toBeHidden();
  });

});
