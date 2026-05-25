# M06 Hints

## TODO 1 — `test.afterEach`

```typescript
test.afterEach(async () => {
  console.log('test finished');
});
```

Place it inside the `test.describe` block, before or after the `test()` calls.

## TODO 2 — `test.skip` with condition

```typescript
test.skip(browserName === 'webkit', 'Date input behavior differs in WebKit');
```

`test.skip(condition, reason)` skips the test only when the condition is true.
Without a condition, `test.skip()` always skips.

## TODO 3 — `test.fixme`

```typescript
test.fixme(true, 'Social links not yet implemented in footer');
```

`test.fixme(true, reason)` marks the test as expected-to-fail.
The test is skipped and reported as "fixme" — it won't fail your suite.
Use it to track known gaps without deleting the test.

## TODO 4 — `test.describe.configure` with tags

```typescript
test.describe.configure({ tag: '@smoke' });
```

Place this at the top of the `test.describe('Login page', ...)` block.
Then run tagged tests with: `npx playwright test --grep @smoke`
