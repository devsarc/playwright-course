# Lesson 06 Hints

## Part 1 — Multi-Tab & Popup Management (formerly M31)

### TODO 1.1 — two pages, same context

```typescript
const pageA = await context.newPage();
const pageB = await context.newPage();
```

### TODO 1.2 — navigate pageB

```typescript
await pageB.goto('/projects/demo/board');
```

### TODO 1.3 — add a card in pageA

```typescript
const title = `multi-tab-${Date.now()}`;
await pageA.getByTestId('add-card-button').click();
await pageA.getByTestId('new-card-input').fill(title);
await pageA.getByTestId('new-card-input').press('Enter');
```

### TODO 1.4 — assert card in pageB

```typescript
await expect(
  pageB.getByTestId('kanban-card').filter({ hasText: title })
).toBeVisible();
```

### TODO 1.5 — two independent contexts

```typescript
const contextA = await browser.newContext({
  storageState: 'tests/fixtures/auth/user-a.json',
});
const contextB = await browser.newContext({
  storageState: 'tests/fixtures/auth/user-b.json',
});
```

### TODO 1.6 — navigate both users

```typescript
await pageA.goto('/projects/demo/board');
await pageB.goto('/projects/demo/board');
```

### TODO 1.7 — user A adds a card

```typescript
const cardTitle = `collab-${Date.now()}`;
await pageA.getByTestId('add-card-button').click();
await pageA.getByTestId('new-card-input').fill(cardTitle);
await pageA.getByTestId('new-card-input').press('Enter');
```

### TODO 1.8 — user B sees the card

```typescript
await expect(
  pageB.getByTestId('kanban-card').filter({ hasText: cardTitle })
).toBeVisible();
```

### TODO 1.9 — cleanup

```typescript
await contextA.close();
await contextB.close();
```

### TODO 1.10 — presence avatar

```typescript
await pageA.goto('/projects/demo/board');
await pageB.goto('/projects/demo/board');
await expect(pageB.getByTestId('presence-avatar')).toBeVisible();
```

## Part 2 — WebSocket & SSE Testing (formerly M32)

### TODO 2.1 — race-safe websocket capture

```typescript
const [, ws] = await Promise.all([
  page.goto('/projects/demo/board'),
  page.waitForEvent('websocket'),
]);
```

### TODO 2.2 — URL assertion

```typescript
expect(ws.url()).toContain('presence');
```

### TODO 2.3 — presence indicator

```typescript
await expect(page.getByTestId('presence-indicator')).toBeVisible();
```

### TODO 2.4 — framereceived

```typescript
const frame = await ws.waitForEvent('framereceived');
```

### TODO 2.5 — parse payload

```typescript
const message = JSON.parse(frame.payload as string);
expect(message).toHaveProperty('type');
```

### TODO 2.6 — routeWebSocket mock

```typescript
await page.routeWebSocket(/presence/, (ws) => {
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'user_joined', userId: 'u999', name: 'Alice' }));
  };
});
```

### TODO 2.7 — presence avatar

```typescript
await expect(page.getByTestId('presence-avatar')).toBeVisible();
```

### TODO 2.8 — reconnect banner

```typescript
await page.routeWebSocket(/presence/, (ws) => {
  ws.onopen = () => ws.close();
});
await page.goto('/projects/demo/board');
await expect(page.getByTestId('ws-reconnect-banner')).toBeVisible();
```

## Part 3 — User Journey Simulation (formerly M33)

### TODO 3.1 — signUp step: fill credentials and submit

```typescript
async signUp(email: string, password: string) {
  await page.goto('/signup');
  await page.getByTestId('signup-email').fill(email);
  await page.getByTestId('signup-password').fill(password);
  await page.getByTestId('signup-submit').click();
  await page.waitForURL(/verify-email/);
},
```

### TODO 3.2 — verifyEmail step: navigate to verify URL with known token

```typescript
async verifyEmail(token = 'test-token-123') {
  await page.goto(`/verify-email?token=${token}`);
  await expect(page.getByTestId('verify-email-status')).toBeVisible();
},
```

### TODO 3.3 — createWorkspace step: onboarding form submission

```typescript
async createWorkspace(name: string) {
  await page.goto('/onboarding/workspace');
  await page.getByTestId('workspace-name-input').fill(name);
  await page.getByTestId('workspace-submit').click();
  await page.waitForURL(/dashboard/);
},
```

### TODO 3.4 — createProject step: open dialog, fill name, assert card

```typescript
async createProject(name: string) {
  await page.getByTestId('create-project-button').click();
  await page.getByTestId('project-name-input').fill(name);
  await page.getByTestId('project-submit').click();
  await expect(page.getByTestId('project-card').filter({ hasText: name })).toBeVisible();
},
```

### TODO 3.5 — createTask step: open task panel, fill title, assert card

```typescript
async createTask(title: string) {
  await page.getByTestId('add-task-button').click();
  await page.getByTestId('task-title-input').fill(title);
  await page.getByTestId('task-submit').press('Enter');
  await expect(page.getByTestId('task-card').filter({ hasText: title })).toBeVisible();
},
```

### TODO 3.6 — two independent BrowserContexts with separate storageState

```typescript
const contextA = await browser.newContext({
  storageState: 'tests/fixtures/auth/user-a.json',
});
const contextB = await browser.newContext({
  storageState: 'tests/fixtures/auth/user-b.json',
});
```

Each context has its own cookies and localStorage — completely isolated sessions.

### TODO 3.7 — user A assigns task to user B via the UI

```typescript
await pageA.getByTestId('task-card').filter({ hasText: taskTitle }).click();
await pageA.getByTestId('task-assignee-select').click();
await pageA.getByRole('option', { name: 'bob@lumio.test' }).click();
await pageA.getByTestId('task-detail-close').click();
```

### TODO 3.8 — user B asserts the task-assignee element shows their name

```typescript
await pageB.goto('/dashboard');
const assignedCard = pageB.getByTestId('task-card').filter({ hasText: taskTitle });
await expect(assignedCard).toBeVisible();
await expect(assignedCard.getByTestId('task-assignee')).toContainText('bob@lumio.test');
```

### TODO 3.9 — restore session from saved storageState file

```typescript
const restoredContext = await browser.newContext({
  storageState: savedStatePath,
});
```

`storageState` was written by the previous test via `context.storageState({ path: savedStatePath })`.

### TODO 3.10 — assert dashboard is accessible with the restored session

```typescript
await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
```

If the session was restored correctly, the app renders the dashboard. A redirect to `/login` means the storageState file is missing or expired.
