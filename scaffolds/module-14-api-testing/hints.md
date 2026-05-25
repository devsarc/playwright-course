# M14 Hints

## TODO 1 — Unauthenticated GET

```typescript
const response = await request.get('/api/projects?workspaceId=test-workspace');
expect(response.status()).toBe(401);
```

## TODO 2 — POST body with title

```typescript
const response = await request.post('/api/tasks', {
  data: {
    title: 'API-created task',
    projectId: 'seed-project-001',
  },
  headers: { Cookie: authCookie },
});
```

## TODO 3 — Assert 201

```typescript
expect(response.status()).toBe(201);
```

## TODO 4 — Assert response body title

```typescript
const body = await response.json();
expect(body.title).toBe('API-created task');
```

## TODO 5 — DELETE with dynamic ID

```typescript
const deleteRes = await request.delete(`/api/tasks/${id}`, {
  headers: { Cookie: authCookie },
});
```

The backtick template literal interpolates the `id` from the create response.
