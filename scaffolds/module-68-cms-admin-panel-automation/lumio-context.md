# Lumio Context: M68

## What's in Lumio at this point

Lumio's admin panel at `/admin` (introduced in M25–M30) includes:
- `/admin/users` — sortable, filterable, paginated user table (columns: Name, Email, Role, Joined, Status)
- `/admin/settings` — workspace name, logo upload, feature flag toggles
- `/admin/workspaces` — workspace management table
- `/admin/analytics` — charts and export

## User table structure

The user table is built with a custom React component (not a library like TanStack Table). It uses:
- `<th>` with `aria-sort` for sortable columns
- A filter input with `placeholder="Filter by email"` above the table
- Checkbox in each row's first cell for selection
- A `data-testid="bulk-actions-toolbar"` toolbar that appears when any checkbox is checked
- A `data-testid="pagination-status"` element showing "X–Y of Z users"
- "Previous page" / "Next page" buttons with those exact `aria-label` values

## Logo upload

`/admin/settings` has a workspace logo uploader. The UI shows a branded drop zone ("Click to upload or drag and drop"); clicking it reveals a hidden `<input type="file">`. The test uploads directly to the file input via `setInputFiles()`.

The fixture file `tests/fixtures/logo.png` is a small 32×32 PNG provided in the repo for upload tests (same file used in M22).

## Test data

The test database (seeded in `globalSetup`) creates 15 test users:
- 1 admin (`admin@lumio.test`)
- 14 members with emails like `member01@lumio.test` through `member14@lumio.test`

This gives predictable pagination (10 per page: page 1 has rows 1–10, page 2 has rows 11–15 plus header).
