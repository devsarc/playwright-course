# M58: Automated Form Filling & Bots

## Learning Objectives

- Read task data from a CSV file and automate form submission for each row
- Handle dynamic form fields that appear based on prior selections
- Understand responsible bot patterns: rate limiting, user-agent disclosure, CAPTCHA strategy in test environments
- Distinguish between legitimate automation (your own app, test data) and prohibited automation (bypassing access controls)

## Concept

A bot is a script that automates a human interaction repeatedly — filling forms, clicking buttons, submitting data. Playwright is an excellent bot platform because it drives a real browser, handles JavaScript-rendered forms, manages session state, and supports complex interaction patterns. The ethical considerations depend entirely on authorization: automating your own system or a test environment is legitimate; automating another system without permission is not.

**Data-driven form automation.** The pattern: read a data source (CSV, JSON, database), open the form, fill fields from the current row, submit, verify success, repeat:

```typescript
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

const tasks = parse(readFileSync('tasks.csv'), { columns: true });

for (const task of tasks) {
  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Add task' }).first().click();
  await page.getByTestId('task-title-input').fill(task.title);
  await page.getByTestId('task-submit').click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
}
```

**Dynamic form fields.** Some form fields only appear after prior selections. A form that shows a "due date" field only when "high priority" is selected requires checking for the field's existence before interacting:

```typescript
await page.getByLabel('Priority').selectOption('high');
const dueDateField = page.getByLabel('Due date');
if (await dueDateField.isVisible()) {
  await dueDateField.fill('2024-12-31');
}
```

This conditional interaction pattern is safer than hardcoding — it handles both form variants without branching test logic for each.

**CAPTCHA strategy.** Test environments should have CAPTCHAs disabled. If they aren't, the responsible approach is: request a test-environment flag from the team that disables CAPTCHA for known test user agents or IP ranges. Never attempt to solve or bypass CAPTCHAs on production systems — this violates terms of service and anti-bot protections designed to protect real users. For Lumio's test environment, CAPTCHA is not present.

**Rate limiting in bots.** Unlike scraping (where rate limiting protects the server), bot rate limiting also protects data integrity — submitting 100 forms simultaneously may trigger duplicate detection, database constraints, or server-side throttling. Add delays between submissions:

```typescript
for (const task of tasks) {
  await fillAndSubmitTask(page, task);
  await page.waitForTimeout(300); // 300ms between submissions
}
```

**User-agent disclosure.** For internal automation, set a descriptive user agent so logs identify your bot: `context.setExtraHTTPHeaders({ 'X-Bot-Source': 'lumio-task-importer' })`. This helps operations teams distinguish automated traffic from real user traffic in logs.

**Error handling in bots.** Unlike tests (where a single failure stops the suite), bots should continue processing remaining rows after a failure on one row. Wrap each iteration in a try/catch, log errors, and continue:

```typescript
const errors: string[] = [];
for (const task of tasks) {
  try {
    await fillAndSubmitTask(page, task);
  } catch (err) {
    errors.push(`Failed: ${task.title} — ${err}`);
  }
}
console.error('Bot errors:', errors);
```

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

```bash
npx playwright test tests/module-58-automated-form-filling-bots
```

## Key Takeaways

1. Data-driven bots read from CSV/JSON and submit one row per form iteration.
2. Dynamic fields require conditional interaction — check `isVisible()` before filling.
3. CAPTCHA: disable in test environments; never bypass on production systems.
4. Rate limit between submissions to avoid server-side throttling and data integrity issues.
5. Bots should continue on error — log failures and process remaining rows.

## Going Deeper

- [Playwright docs: locator.isVisible()](https://playwright.dev/docs/api/class-locator#locator-is-visible)
- [csv-parse library](https://csv.js.org/parse/)
- [Playwright docs: context.setExtraHTTPHeaders()](https://playwright.dev/docs/api/class-browsercontext#browser-context-set-extra-http-headers)
