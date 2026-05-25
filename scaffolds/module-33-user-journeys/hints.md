# M33 Hints

## TODO 1 — signUp step: fill credentials and submit

```typescript
async signUp(email: string, password: string) {
  await page.goto('/signup');
  await page.getByTestId('signup-email').fill(email);
  await page.getByTestId('signup-password').fill(password);
  await page.getByTestId('signup-submit').click();
  await page.waitForURL(/verify-email/);
},
```

## TODO 2 — verifyEmail step: navigate to verify URL with known token

```typescript
async verifyEmail(token = 'test-token-123') {
  await page.goto(`/verify-email?token=${token}`);
  await expect(page.getByTestId('verify-email-status')).toBeVisible();
},
```

## TODO 3 — createWorkspace step: onboarding form submission

```typescript
async createWorkspace(name: string) {
  await page.goto('/onboarding/workspace');
  await page.getByTestId('workspace-name-input').fill(name);
  await page.getByTestId('workspace-submit').click();
  await page.waitForURL(/dashboard/);
},
```

## TODO 4 — createProject step: open dialog, fill name, assert card

```typescript
async createProject(name: string) {
  await page.getByTestId('create-project-button').click();
  await page.getByTestId('project-name-input').fill(name);
  await page.getByTestId('project-submit').click();
  await expect(page.getByTestId('project-card').filter({ hasText: name })).toBeVisible();
},
```

## TODO 5 — createTask step: open task panel, fill title, assert card

```typescript
async createTask(title: string) {
  await page.getByTestId('add-task-button').click();
  await page.getByTestId('task-title-input').fill(title);
  await page.getByTestId('task-submit').press('Enter');
  await expect(page.getByTestId('task-card').filter({ hasText: title })).toBeVisible();
},
```

## TODO 6 — two independent BrowserContexts with separate storageState

```typescript
const contextA = await browser.newContext({
  storageState: 'tests/fixtures/auth/user-a.json',
});
const contextB = await browser.newContext({
  storageState: 'tests/fixtures/auth/user-b.json',
});
```

Each context has its own cookies and localStorage — completely isolated sessions.

## TODO 7 — user A assigns task to user B via the UI

```typescript
await pageA.getByTestId('task-card').filter({ hasText: taskTitle }).click();
await pageA.getByTestId('task-assignee-select').click();
await pageA.getByRole('option', { name: 'bob@lumio.test' }).click();
await pageA.getByTestId('task-detail-close').click();
```

## TODO 8 — user B asserts the task-assignee element shows their name

```typescript
await pageB.goto('/dashboard');
const assignedCard = pageB.getByTestId('task-card').filter({ hasText: taskTitle });
await expect(assignedCard).toBeVisible();
await expect(assignedCard.getByTestId('task-assignee')).toContainText('bob@lumio.test');
```

## TODO 9 — restore session from saved storageState file

```typescript
const restoredContext = await browser.newContext({
  storageState: savedStatePath,
});
```

`storageState` was written by the previous test via `context.storageState({ path: savedStatePath })`.

## TODO 10 — assert dashboard is accessible with the restored session

```typescript
await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
```

If the session was restored correctly, the app renders the dashboard. A redirect to `/login` means the storageState file is missing or expired.
