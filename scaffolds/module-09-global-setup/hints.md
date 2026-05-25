# M09 Hints

## TODO 1 — Verify test user exists

```typescript
const testUser = await prisma.user.findUnique({
  where: { email: process.env.TEST_USER_EMAIL! },
});

if (!testUser) {
  throw new Error(
    `Test user ${process.env.TEST_USER_EMAIL} not found. ` +
    'Run: npm run db:seed --prefix lumio'
  );
}
```

## TODO 2 — Verify test workspace exists

```typescript
const workspace = await prisma.workspace.findUnique({
  where: { slug: 'test-workspace' },
});

if (!workspace) {
  throw new Error('Test workspace not found. Run: npm run db:seed --prefix lumio');
}
```

## TODO 3 — Write test state JSON

```typescript
const { writeFileSync } = await import('fs');
const { join } = await import('path');
writeFileSync(
  join(__dirname, '.test-state.json'),
  JSON.stringify({ workspaceId: workspace.id }),
);
```

## TODO 4 — Read the state file in a test

```typescript
const stateFile = join(__dirname, '.test-state.json');
const state = JSON.parse(readFileSync(stateFile, 'utf-8'));
```

## TODO 5 — API call with workspaceId

```typescript
const response = await request.get(`/api/projects?workspaceId=${state.workspaceId}`);
```

The response is 401 because this test has no auth cookie. That's intentional —
M14 and M16 cover authenticated API calls.
